import {
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	CircleGeometry,
	DirectionalLight,
	Group,
	HemisphereLight,
	LinearSRGBColorSpace,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PerspectiveCamera,
	Raycaster,
	Scene,
	Timer,
	Vector2,
	WebGLRenderer,
} from "three";

export type AaronController = {
	setRunning: (running: boolean) => void;
	dispose: () => void;
};

const modelUrl = "/aaron/perrito.bin";
const waveAmplitude = (18 * Math.PI) / 180;
const waveSpeed = 1.76;

const waveUniforms = { uAngle: { value: 0 } };

const eyeScreenSpots: ReadonlyArray<Vector2> = [new Vector2(0.225, 0.315), new Vector2(0.445, 0.5)];
const eyeRadius = 0.04;

function createEyeTexture(): CanvasTexture {
	const size = 128;
	const center = size / 2;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const context = canvas.getContext("2d");
	if (context) {
		const circle = (x: number, y: number, radius: number, fill: string | CanvasGradient) => {
			context.beginPath();
			context.arc(x, y, radius, 0, Math.PI * 2);
			context.fillStyle = fill;
			context.fill();
		};
		const eye = context.createRadialGradient(center, center, 0, center, center, 64);
		eye.addColorStop(0, "#080503");
		eye.addColorStop(0.5, "#160b05");
		eye.addColorStop(0.72, "#2a1508");
		eye.addColorStop(0.86, "rgba(36, 18, 8, 0.75)");
		eye.addColorStop(1, "rgba(36, 18, 8, 0)");
		circle(center, center, 64, eye);
		const sparkle = context.createRadialGradient(50, 48, 0, 50, 48, 11);
		sparkle.addColorStop(0, "rgba(255, 255, 255, 0.95)");
		sparkle.addColorStop(0.6, "rgba(255, 255, 255, 0.7)");
		sparkle.addColorStop(1, "rgba(255, 255, 255, 0)");
		circle(50, 48, 11, sparkle);
	}
	return new CanvasTexture(canvas);
}

function createEyes(dog: Mesh, camera: PerspectiveCamera): { group: Group; dispose: () => void } {
	const eyeGeometry = new CircleGeometry(eyeRadius, 32);
	const eyeTexture = createEyeTexture();
	const eyeMaterial = new MeshBasicMaterial({ map: eyeTexture, transparent: true });
	const group = new Group();
	const raycaster = new Raycaster();
	const squareCamera = camera.clone();
	squareCamera.aspect = 1;
	squareCamera.updateProjectionMatrix();
	squareCamera.updateMatrixWorld();

	for (const spot of eyeScreenSpots) {
		raycaster.setFromCamera(spot, squareCamera);
		const hit = raycaster.intersectObject(dog)[0];
		if (!hit?.face) continue;
		const toCamera = squareCamera.position.clone().sub(hit.point).normalize();
		const eye = new Mesh(eyeGeometry, eyeMaterial);
		eye.position.copy(hit.point).addScaledVector(toCamera, 0.012);
		eye.lookAt(squareCamera.position);
		group.add(eye);
	}

	return {
		group,
		dispose() {
			eyeGeometry.dispose();
			eyeTexture.dispose();
			eyeMaterial.dispose();
		},
	};
}

async function loadDogGeometry(): Promise<BufferGeometry> {
	const response = await fetch(modelUrl);
	if (!response.ok) throw new Error("No se pudo cargar a Aarón");
	const buffer = await response.arrayBuffer();
	const [vertexCount, indexCount] = new Uint32Array(buffer, 0, 2);
	let offset = 8;
	const positions = new Float32Array(buffer, offset, vertexCount * 3);
	offset += positions.byteLength;
	const indices = new Uint16Array(buffer, offset, indexCount);
	offset += indices.byteLength;
	const colors = new Uint8Array(buffer, offset, vertexCount * 3);
	offset += colors.byteLength;
	const weights = new Uint8Array(buffer, offset, vertexCount);

	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new BufferAttribute(positions, 3));
	geometry.setAttribute("color", new BufferAttribute(colors, 3, true));
	geometry.setAttribute("waveWeight", new BufferAttribute(weights, 1, true));
	geometry.setIndex(new BufferAttribute(indices, 1));
	geometry.computeVertexNormals();
	return geometry;
}

function createDogMaterial(): MeshStandardMaterial {
	const material = new MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0 });
	material.onBeforeCompile = (shader) => {
		shader.uniforms.uAngle = waveUniforms.uAngle;
		shader.vertexShader = shader.vertexShader
			.replace(
				"#include <common>",
				`#include <common>
				attribute float waveWeight;
				uniform float uAngle;
				vec2 rotateWave(vec2 v, float a) {
					float c = cos(a);
					float s = sin(a);
					return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
				}`,
			)
			.replace(
				"#include <beginnormal_vertex>",
				`#include <beginnormal_vertex>
				objectNormal.xz = rotateWave(objectNormal.xz, uAngle * waveWeight);`,
			)
			.replace(
				"#include <begin_vertex>",
				`#include <begin_vertex>
				vec2 pivot = vec2(0.2, 0.58);
				transformed.xz = pivot + rotateWave(transformed.xz - pivot, uAngle * waveWeight);`,
			);
	};
	return material;
}

export function createAaronScene(
	canvas: HTMLCanvasElement,
	reducedMotion: boolean,
): AaronController | null {
	let renderer: WebGLRenderer;
	try {
		renderer = new WebGLRenderer({
			canvas,
			alpha: true,
			antialias: true,
			powerPreference: "low-power",
		});
	} catch {
		return null;
	}

	if (!renderer.getContext()) {
		renderer.dispose();
		return null;
	}

	renderer.setClearColor(0x000000, 0);
	renderer.outputColorSpace = LinearSRGBColorSpace;

	const scene = new Scene();
	scene.add(new HemisphereLight(0xffffff, 0x887766, 1.3 * Math.PI));
	const keyLight = new DirectionalLight(0xffffff, 0.9 * Math.PI);
	keyLight.position.set(-2, 3, -3);
	const fillLight = new DirectionalLight(0xffffff, 0.7 * Math.PI);
	fillLight.position.set(2, 1, 2);
	scene.add(keyLight, fillLight);

	const camera = new PerspectiveCamera(35, 1, 0.1, 50);
	const azimuth = -0.5;
	const elevation = 0.18;
	const distance = 3.4;
	camera.position.set(
		distance * Math.sin(azimuth) * Math.cos(elevation),
		0.62 + distance * Math.sin(elevation),
		distance * Math.cos(azimuth) * Math.cos(elevation),
	);
	camera.lookAt(0, 0.62, 0);

	const material = createDogMaterial();
	let eyes: ReturnType<typeof createEyes> | null = null;
	let geometry: BufferGeometry | null = null;
	let disposed = false;
	const timer = new Timer();

	const render = () => renderer.render(scene, camera);

	const tick = (timestamp?: number) => {
		timer.update(timestamp);
		waveUniforms.uAngle.value = Math.sin(timer.getElapsed() * waveSpeed) * waveAmplitude;
		render();
	};

	const resize = () => {
		const parent = canvas.parentElement;
		if (!parent) return;
		const width = Math.max(parent.clientWidth, 1);
		const height = Math.max(parent.clientHeight, 1);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		render();
	};

	void loadDogGeometry()
		.then((loaded) => {
			if (disposed) {
				loaded.dispose();
				return;
			}
			geometry = loaded;
			const dog = new Mesh(geometry, material);
			eyes = createEyes(dog, camera);
			scene.add(dog, eyes.group);
			canvas.parentElement?.classList.add("is-ready");
			render();
		})
		.catch(() => undefined);

	resize();
	if (!reducedMotion) renderer.setAnimationLoop(tick);

	const observer = new ResizeObserver(resize);
	if (canvas.parentElement) observer.observe(canvas.parentElement);

	return {
		setRunning(running) {
			if (reducedMotion) return;
			renderer.setAnimationLoop(running ? tick : null);
		},
		dispose() {
			disposed = true;
			observer.disconnect();
			renderer.setAnimationLoop(null);
			geometry?.dispose();
			material.dispose();
			eyes?.dispose();
			renderer.dispose();
		},
	};
}
