import { createFileRoute } from "@tanstack/react-router";
import { EditorLayout } from "@/components/editor/EditorLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Paint Visual Builder — Editor visual" },
      { name: "description", content: "Editor visual inspirado no Figma, Canva e Elementor para criar páginas web." },
      { property: "og:title", content: "Paint Visual Builder" },
      { property: "og:description", content: "Editor visual para criar páginas web." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditorLayout,
});
