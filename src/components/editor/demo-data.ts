import type { EditorDocument } from "./types";

export const demoDocument: EditorDocument = {
  version: 1,
  name: "Landing Page",
  elements: [
    { id: "hero", type: "section", name: "Hero Section", x: 0, y: 0, width: 1200, height: 520, fill: "#F4FBFE", stroke: "transparent", strokeWidth: 0, radius: 0, visible: true, locked: false, parentId: null },
    { id: "title", type: "text", name: "Título", x: 120, y: 160, width: 560, height: 120, fill: "#0F172A", stroke: "transparent", strokeWidth: 0, radius: 0, text: "Crie páginas visualmente", fontFamily: "Manrope", fontSize: 52, fontWeight: 800, visible: true, locked: false, parentId: "hero" },
    { id: "cta", type: "button", name: "Botão CTA", x: 120, y: 320, width: 200, height: 52, fill: "#3BBCEC", stroke: "transparent", strokeWidth: 0, radius: 10, text: "Começar agora", fontFamily: "Manrope", fontSize: 16, fontWeight: 700, visible: true, locked: false, parentId: "hero" },
    { id: "shape", type: "circle", name: "Círculo", x: 780, y: 110, width: 300, height: 300, fill: "#3BBCEC", stroke: "transparent", strokeWidth: 0, radius: 999, visible: true, locked: false, parentId: "hero" },
    { id: "features", type: "container", name: "Features", x: 120, y: 600, width: 960, height: 220, fill: "#FFFFFF", stroke: "#E2E8F0", strokeWidth: 1, radius: 16, visible: true, locked: false, parentId: null },
  ],
  comments: [
    { id: "c1", elementId: "cta", author: "Rafa", body: "Testar uma cor mais escura no hover.", createdAt: "há 2h" },
    { id: "c2", elementId: "cta", author: "Ana", body: "Texto do botão aprovado ✅", createdAt: "há 40min" },
  ],
};
