export const whatsappNumber = "5490000000000";

export function whatsappLink(message: string): string {
	return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
