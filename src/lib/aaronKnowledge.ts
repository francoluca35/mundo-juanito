export const aaronSections = [
	"inicio",
	"didactica",
	"montessori",
	"ninos",
	"robotica",
	"diseno",
] as const;

export type AaronSection = (typeof aaronSections)[number];

export type AaronAnswer = {
	text: string;
	href?: string;
	hrefLabel?: string;
};

const bubbles: Record<AaronSection, string> = {
	inicio: "¡Hola! Soy Aarón. Te acompaño por este mundo.",
	didactica: "¿Preparamos algo para el aula?",
	montessori: "Acá se aprende con las manos.",
	ninos: "¡Vamos a jugar en serio!",
	robotica: "¿Armamos algo que se mueva?",
	diseno: "Diseñar es mirar dos veces.",
};

const contact = "hola@mundodejuanito.com";

export function isAaronSection(value: string | undefined): value is AaronSection {
	return aaronSections.some((section) => section === value);
}

export function aaronBubble(section: AaronSection): string {
	return bubbles[section];
}

function normalize(value: string): string {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{M}/gu, "");
}

function mentions(text: string, words: string[]): boolean {
	return words.some((word) => text.includes(word));
}

function answer(text: string, href?: string, hrefLabel?: string): AaronAnswer {
	return { text, href, hrefLabel };
}

export function aaronReply(message: string, section: AaronSection): AaronAnswer {
	const text = normalize(message);

	if (mentions(text, ["gracias", "genial", "buenisimo", "joya"])) {
		return answer("De nada. Yo me quedo en la esquina, moviendo la cola.");
	}

	if (mentions(text, ["chau", "adios", "hasta luego", "nos vemos"])) {
		return answer("Hasta luego. Si volvés, yo sigo acá.");
	}

	if (/^(hola|buenas|buen dia|hey|que tal)\b/.test(text) && text.length < 28) {
		return answer(
			"¡Hola! Soy Aarón. Te puedo orientar por didáctica, Montessori, niños, robótica o diseño. ¿Qué estás buscando?",
		);
	}

	if (mentions(text, ["quien sos", "quien es aaron", "tu nombre", "el perro", "sobre vos"])) {
		return answer(
			"Soy Aarón, el perro de esta familia. Juanito es mi humano chiquito, y ahora acompaño a cada persona que recorre El Mundo de Juanito. Si movés el mouse, te sigo con la mirada.",
		);
	}

	if (mentions(text, ["juanito"])) {
		return answer(
			"Juanito es el nieto que le da nombre a este mundo. Acá las ideas se tocan, se arman y se juegan. Yo camino al lado.",
		);
	}

	if (mentions(text, ["precio", "precios", "cuesta", "comprar", "catalogo", "stock", "envio", "pedido", "encargar"])) {
		return answer(
			"Todo lo imprimimos en 3D, así que el precio depende del tamaño, el material y el color. Tocá «Consultar» en el producto que te guste y se abre WhatsApp con el pedido listo.",
		);
	}

	if (mentions(text, ["a medida", "personalizado", "personalizar", "imprimir", "impresion", "3d", "repuesto"])) {
		return answer(
			"¡También imprimimos a medida! Mandá una foto, un boceto o las medidas por WhatsApp: lo diseñamos, te lo mostramos y lo imprimimos.",
		);
	}

	if (mentions(text, ["contacto", "mail", "correo", "whatsapp", "telefono", "hablar con"])) {
		return answer(
			`La forma más rápida es WhatsApp: está en el botón «Pedí el tuyo» de arriba y en cada producto. También podés escribir a ${contact}.`,
		);
	}

	if (mentions(text, ["regalo", "regalar", "edad", "anos", "nene", "nena", "hijo", "hija"])) {
		return answer(
			"Para un regalo yo abriría dos puertas: Niños, si querés juego abierto, y Montessori, si buscás algo para hacer con las manos. Decime la edad y te ayudo a elegir el mundo.",
			"/ninos/",
			"Ir a Niños",
		);
	}

	if (mentions(text, ["montessori", "sensorial", "autonomia", "vida practica"])) {
		return answer(
			"Montessori es aprender con las manos y a su ritmo: vida práctica, sensorial, lenguaje y lógica. La mano explora, la mente ordena y la confianza aparece.",
			"/montessori/",
			"Ir a Montessori",
		);
	}

	if (mentions(text, ["didactica", "colegio", "colegios", "docente", "profesor", "aula", "escuela"])) {
		return answer(
			"Didáctica está pensada para colegios y docentes: recursos, dinámicas y material de aula. Menos memorizar. Más tocar, probar, conversar y descubrir.",
			"/didactica/",
			"Ir a Didáctica",
		);
	}

	if (mentions(text, ["arduino", "robot", "robotica", "circuito", "electronica", "sensor", "codigo"])) {
		return answer(
			"Arduino y robótica es pasar del código al movimiento: circuitos, sensores y ganas de volver a intentar. Una idea, un cable, una línea de código, y de pronto se mueve.",
			"/robotica/",
			"Ir a Robótica",
		);
	}

	if (mentions(text, ["diseno", "arquitectura", "indumentaria", "ropa", "moda", "vestir"])) {
		return answer(
			"Diseño es el mundo de arquitectura, diseño e indumentaria. Dibujá lo posible, modelá lo inesperado y vestí una idea.",
			"/diseno/",
			"Ir a Diseño",
		);
	}

	if (mentions(text, ["nino", "ninos", "jugar", "juego", "steam", "inventar"])) {
		return answer(
			"En Niños, jugar es investigar: primeros inventos, juegos STEAM y tardes que se vuelven un laboratorio. No hay una única respuesta cuando la pregunta es buena.",
			"/ninos/",
			"Ir a Niños",
		);
	}

	if (mentions(text, ["ayuda", "que podes", "que sabes", "como funciona"])) {
		return answer(
			"Puedo mostrarte los productos impresos en 3D de cada línea, ayudarte a elegir un regalo o material para el aula, y contarte cómo pedir por WhatsApp. No invento precios.",
		);
	}

	const here: Record<AaronSection, string> = {
		inicio: "Estamos en el inicio. Hay cinco puertas: didáctica, Montessori, niños, robótica y diseño.",
		didactica: "Estamos en Didáctica, el lugar para colegios y docentes.",
		montessori: "Estamos en Montessori, donde se aprende con las manos.",
		ninos: "Estamos en Niños, donde jugar también es investigar.",
		robotica: "Estamos en Arduino y robótica, donde las ideas se mueven.",
		diseno: "Estamos en Diseño: arquitectura, diseño e indumentaria.",
	};

	return answer(
		`${here[section]} Todo lo que ves está impreso en 3D. Contame si buscás algo para el aula, para jugar, para un robot, para diseñar o algo a medida.`,
	);
}
