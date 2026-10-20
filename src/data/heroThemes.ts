export interface HeroSlide {
	slug: "temprana" | "profesionales" | "cognitivas" | "personalizada";
	eyebrow: string;
	title: string;
	titleAccent: string;
	detail: string;
	cta: string;
	href: string;
	color: string;
	audience: string;
	/** Foto del producto impreso. Reemplazá el archivo en /public/hero/ */
	image: string;
	imageAlt: string;
}

/** Carrusel del hero: estimulación → profesionales → cognitivas → atención personalizada. */
export const heroSlides: HeroSlide[] = [
	{
		slug: "temprana",
		eyebrow: "Estimulación temprana",
		title: "Primeros juegos",
		titleAccent: "para crecer.",
		detail:
			"Recursos táctiles para jardines, familias y estudiantes de inicial que acompañan el desarrollo desde los primeros meses.",
		cta: "Explorar línea",
		href: "#explorar",
		color: "#ffca28",
		audience: "Inicial · Familias · Estimulación",
		image: "/hero/primeros.png",
		imageAlt: "Avión impreso en 3D para estimulación temprana",
	},
	{
		slug: "profesionales",
		eyebrow: "Recursos para profesionales",
		title: "Del gabinete",
		titleAccent: "al taller Arduino.",
		detail:
			"Material reproducible para consultorio y aula, y también piezas impresas para proyectos con Arduino y robótica educativa.",
		cta: "Ver recursos",
		href: "#explorar",
		color: "#179ed6",
		audience: "Gabinete · Aula · Arduino",
		image: "/hero/arduino.png",
		imageAlt: "Robot con orugas e impresión 3D para Arduino",
	},
	{
		slug: "cognitivas",
		eyebrow: "Emociones y habilidades cognitivas",
		title: "Jugar para",
		titleAccent: "pensar y sentir.",
		detail:
			"Propuestas para primaria, secundaria y espacios clínicos que trabajan atención, memoria, emociones y lenguaje.",
		cta: "Ver propuestas",
		href: "#explorar",
		color: "#20b56c",
		audience: "Primaria · Secundaria · Clínica",
		image: "/hero/cognitiva.png",
		imageAlt: "Ábaco colorido impreso en 3D",
	},
	{
		slug: "personalizada",
		eyebrow: "Atención personalizada",
		title: "Tu idea,",
		titleAccent: "impresa a medida.",
		detail:
			"Diseñamos la pieza que tu aula o consultorio necesita: otra medida, otro color o un recurso que todavía no existe.",
		cta: "Pedí a medida",
		href: "#contacto",
		color: "#f34b45",
		audience: "A medida · Único · Contanos",
		image: "/hero/personalizado.png",
		imageAlt: "Máscara impresa en 3D a medida",
	},
];
