import { MousePointer2, LayoutTemplate, BoxSelect, Type, Square, Circle, Minus, Hexagon, Image, Smile, RectangleHorizontal, TextCursorInput, MessageSquare } from "lucide-react";
import type { ToolId } from "./types";
import { cn } from "@/lib/utils";

export const TOOLS: { id: ToolId; label: string; icon: typeof Square; shortcut?: string }[] = [
  { id: "select", label: "Seleção", icon: MousePointer2, shortcut: "V" },
  { id: "section", label: "Seção", icon: LayoutTemplate, shortcut: "S" },
  { id: "container", label: "Contêiner", icon: BoxSelect, shortcut: "F" },
  { id: "text", label: "Texto", icon: Type, shortcut: "T" },
  { id: "rectangle", label: "Retângulo", icon: Square, shortcut: "R" },
  { id: "circle", label: "Círculo", icon: Circle, shortcut: "O" },
  { id: "line", label: "Linha", icon: Minus, shortcut: "L" },
  { id: "polygon", label: "Polígono", icon: Hexagon, shortcut: "P" },
  { id: "image", label: "Imagem", icon: Image, shortcut: "I" },
  { id: "icon", label: "Ícone", icon: Smile },
  { id: "button", label: "Botão", icon: RectangleHorizontal, shortcut: "B" },
  { id: "input", label: "Input", icon: TextCursorInput },
  { id: "comment", label: "Comentário", icon: MessageSquare, shortcut: "C" },
];

const GROUP_BREAKS = new Set<ToolId>(["section", "text", "image", "comment"]);

export function LeftToolbar({ active, onChange }: { active: ToolId; onChange: (t: ToolId) => void }) {
  return (
    <aside className="flex w-14 shrink-0 flex-col items-center gap-1 overflow-y-auto border-r border-border bg-panel py-3">
      {TOOLS.map(({ id, label, icon: Icon, shortcut }) => (
        <div key={id} className="contents">
          {GROUP_BREAKS.has(id) && <div className="my-1 h-px w-7 bg-border" />}
          <button
            type="button"
            title={shortcut ? `${label} (${shortcut})` : label}
            aria-label={label}
            aria-pressed={active === id}
            onClick={() => onChange(id)}
            className={cn("editor-tool", active === id && "editor-tool-active")}
          >
            <Icon size={18} />
          </button>
        </div>
      ))}
    </aside>
  );
}
