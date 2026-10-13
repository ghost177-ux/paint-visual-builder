import type { DeviceMode, EditorElement } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  elements: EditorElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  zoom: number;
  device: DeviceMode;
}

const PAGE_WIDTH: Record<DeviceMode, number> = { desktop: 1200, mobile: 390 };

// Static renderer. Future: drag, resize handles and snapping hook into ElementNode.
function ElementNode({ el, selected, onSelect }: { el: EditorElement; selected: boolean; onSelect: () => void }) {
  const isText = el.type === "text";
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={cn("absolute cursor-default", selected ? "editor-selected" : "hover:outline hover:outline-1 hover:outline-primary")}
      style={{
        left: el.x, top: el.y, width: el.width, height: el.height,
        background: isText ? "transparent" : el.fill,
        color: isText ? el.fill : "#fff",
        border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.stroke}` : undefined,
        borderRadius: el.radius,
        fontFamily: el.fontFamily, fontSize: el.fontSize, fontWeight: el.fontWeight,
        display: el.type === "button" ? "grid" : undefined, placeItems: "center",
        lineHeight: 1.1, opacity: el.type === "circle" ? 0.25 : 1,
      }}
    >
      {el.text}
      {selected && ["nw", "ne", "sw", "se"].map((c) => (
        <span key={c} className={cn("editor-handle", c.includes("n") ? "-top-1" : "-bottom-1", c.includes("w") ? "-left-1" : "-right-1")} />
      ))}
    </div>
  );
}

export function CanvasWorkspace({ elements, selectedId, onSelect, zoom, device }: Props) {
  const width = PAGE_WIDTH[device];
  const visible = device === "desktop" ? elements : [];
  return (
    <main className="editor-grid relative flex-1 overflow-auto" onClick={() => onSelect(null)}>
      <div className="flex min-h-full min-w-max justify-center p-16">
        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            {device === "desktop" ? "Desktop — 1200px" : "Mobile — 390px"}
          </div>
          <div className="editor-page relative" style={{ width, height: 1100 }}>
            {visible.map((el) => (
              <ElementNode key={el.id} el={el} selected={el.id === selectedId} onSelect={() => onSelect(el.id)} />
            ))}
            {device === "mobile" && (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">Área pronta para elementos</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
