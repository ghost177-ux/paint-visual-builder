import { Eye, Lock, LayoutTemplate, BoxSelect, Type, Square, Circle, RectangleHorizontal } from "lucide-react";
import type { EditorElement } from "./types";
import { cn } from "@/lib/utils";

const ICONS: Partial<Record<EditorElement["type"], typeof Square>> = {
  section: LayoutTemplate, container: BoxSelect, text: Type, circle: Circle, button: RectangleHorizontal,
};

export function LayersPanel({ elements, selectedId, onSelect }: { elements: EditorElement[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-0.5 p-2">
      {elements.map((el) => {
        const Icon = ICONS[el.type] ?? Square;
        return (
          <button
            key={el.id}
            onClick={() => onSelect(el.id)}
            className={cn("group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted", el.parentId && "pl-6", selectedId === el.id && "bg-accent text-accent-foreground")}
          >
            <Icon size={13} className="shrink-0 opacity-70" />
            <span className="flex-1 truncate">{el.name}</span>
            <Eye size={12} className="opacity-0 group-hover:opacity-50" />
            <Lock size={12} className="opacity-0 group-hover:opacity-50" />
          </button>
        );
      })}
    </div>
  );
}
