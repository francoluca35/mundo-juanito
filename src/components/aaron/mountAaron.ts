import { aaronReply, isAaronSection } from "../../lib/aaronKnowledge";
import { createAaronScene, type AaronController } from "./createAaronScene";

const safeHrefs = new Set(["/didactica/", "/montessori/", "/ninos/", "/robotica/", "/diseno/"]);

export function mountAaron(root: HTMLElement): void {
	const section = isAaronSection(root.dataset.section) ? root.dataset.section : "inicio";
	const stage = root.querySelector("[data-open].aaron-stage");
	const canvas = root.querySelector("[data-canvas]");
	const chat = root.querySelector("[data-chat]");
	const messages = root.querySelector("[data-messages]");
	const form = root.querySelector("[data-form]");
	const input = root.querySelector("[data-input]");
	const closeButton = root.querySelector("[data-close]");

	if (
		!(stage instanceof HTMLButtonElement) ||
		!(canvas instanceof HTMLCanvasElement) ||
		!(chat instanceof HTMLElement) ||
		!(messages instanceof HTMLElement) ||
		!(form instanceof HTMLFormElement) ||
		!(input instanceof HTMLInputElement) ||
		!(closeButton instanceof HTMLButtonElement)
	) {
		return;
	}

	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const controller: AaronController | null = createAaronScene(canvas, reducedMotion);
	let chatOpen = false;
	let loading = false;

	const syncRendering = () => {
		controller?.setRunning(document.visibilityState === "visible" && !chatOpen);
	};

	const setChatOpen = (open: boolean, restoreFocus = true) => {
		chatOpen = open;
		chat.hidden = !open;
		root.classList.toggle("is-open", open);
		stage.setAttribute("aria-expanded", String(open));
		syncRendering();
		if (open) closeButton.focus({ preventScroll: true });
		else if (restoreFocus) stage.focus({ preventScroll: true });
	};

	const appendMessage = (role: "user" | "assistant", text: string, href?: string, hrefLabel?: string) => {
		const item = document.createElement("p");
		item.className = `aaron-message ${role}`;
		item.textContent = text;
		if (href && hrefLabel && safeHrefs.has(href)) {
			const link = document.createElement("a");
			link.className = "aaron-link";
			link.href = href;
			link.textContent = hrefLabel;
			item.append(link);
		}
		const chips = messages.querySelector(".aaron-chips");
		if (chips) messages.insertBefore(item, chips);
		else messages.append(item);
		messages.scrollTop = messages.scrollHeight;
	};

	const sendMessage = async (value: string) => {
		const message = value.trim();
		if (!message || loading) return;
		loading = true;
		input.disabled = true;
		appendMessage("user", message);
		input.value = "";

		const pending = document.createElement("p");
		pending.className = "aaron-message assistant";
		pending.textContent = "Mmm…";
		const chips = messages.querySelector(".aaron-chips");
		if (chips) messages.insertBefore(pending, chips);
		else messages.append(pending);
		messages.scrollTop = messages.scrollHeight;

		await new Promise((resolve) => window.setTimeout(resolve, 280));
		pending.remove();
		const reply = aaronReply(message, section);
		appendMessage("assistant", reply.text, reply.href, reply.hrefLabel);
		loading = false;
		input.disabled = false;
		input.focus();
	};

	stage.addEventListener("click", () => setChatOpen(!chatOpen));
	closeButton.addEventListener("click", () => setChatOpen(false));

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		void sendMessage(input.value);
	});

	root.querySelectorAll("[data-chip]").forEach((chip) => {
		if (!(chip instanceof HTMLButtonElement)) return;
		chip.addEventListener("click", () => {
			const message = chip.dataset.chip;
			if (message) void sendMessage(message);
		});
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && chatOpen) setChatOpen(false);
	});

	document.addEventListener("visibilitychange", syncRendering);
}
