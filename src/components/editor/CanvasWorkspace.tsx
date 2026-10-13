import { useRef } from "react";
import type { DeviceMode, EditorElement, ToolId } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  elements: EditorElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, changes: Partial<EditorElement>) => void;
  onCreateRectangle: (x: number, y: number) => void;
  tool: ToolId;
  zoom: number;
  device: DeviceMode;
}

const PAGE_WIDTH: Record<DeviceMode, number> = { desktop: 1200, mobile: 390 };

type ResizeHandle = "nw" | "ne" | "sw" | "se";
type Interaction = {
  id: string;
  pointerX: number;
  pointerY: number;
  x: number;
  y: number;
  width: number;
  height: number;
  handle: ResizeHandle | null;
};

function ElementNode({
  el,
  selected,
  zoom,
  onSelect,
  onUpdate,
}: {
  el: EditorElement;
  selected: boolean;
  zoom: number;
  onSelect: () => void;
  onUpdate: (id: string, changes: Partial<EditorElement>) => void;
}) {
  const interaction = useRef<Interaction | null>(null);
  const isText = el.type === "text";
  const canEdit = el.type === "rectangle" && !el.locked;

  const startInteraction = (event: React.PointerEvent, handle: ResizeHandle | null) => {
    event.stopPropagation();
    if (event.button !== 0) return;
    onSelect();
    if (!canEdit) return;

    interaction.current = {
      id: el.id,
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      handle,
    };
    if (typeof event.currentTarget.setPointerCapture === "function") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const moveInteraction = (event: React.PointerEvent) => {
    const start = interaction.current;
    if (!start) return;

    const dx = (event.clientX - start.pointerX) / (zoom / 100);
    const dy = (event.clientY - start.pointerY) / (zoom / 100);
    if (!start.handle) {
      onUpdate(start.id, { x: start.x + dx, y: start.y + dy });
      return;
    }

    const changes: Partial<EditorElement> = {};
    if (start.handle.includes("e")) changes.width = Math.max(1, start.width + dx);
    if (start.handle.includes("s")) changes.height = Math.max(1, start.height + dy);
    if (start.handle.includes("w")) {
      const width = Math.max(1, start.width - dx);
      changes.x = start.x + start.width - width;
      changes.width = width;
    }
    if (start.handle.includes("n")) {
      const height = Math.max(1, start.height - dy);
      changes.y = start.y + start.height - height;
      changes.height = height;
    }
    onUpdate(start.id, changes);
  };

  const endInteraction = (event: React.PointerEvent) => {
    interaction.current = null;
    if (
      typeof event.currentTarget.hasPointerCapture === "function" &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      onPointerDown={(event) => startInteraction(event, null)}
      onPointerMove={moveInteraction}
      onPointerUp={endInteraction}
      onPointerCancel={endInteraction}
      className={cn(
        "absolute cursor-default",
        canEdit && "cursor-move",
        selected ? "editor-selected" : "hover:outline hover:outline-1 hover:outline-primary",
      )}
      style={{
        left: el.x,
        top: el.y,
        width: el.width,
        height: el.height,
        background: isText ? "transparent" : el.fill,
        color: isText ? el.fill : "#fff",
        border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.stroke}` : undefined,
        borderRadius: el.radius,
        fontFamily: el.fontFamily,
        fontSize: el.fontSize,
        fontWeight: el.fontWeight,
        display: el.type === "button" ? "grid" : undefined,
        placeItems: "center",
        lineHeight: 1.1,
        opacity: el.type === "circle" ? 0.25 : 1,
      }}
    >
      {el.text}
      {selected &&
        !el.locked &&
        (["nw", "ne", "sw", "se"] as const).map((handle) => (
          <span
            key={handle}
            onPointerDown={canEdit ? (event) => startInteraction(event, handle) : undefined}
            className={cn(
              "editor-handle",
              handle.includes("n") ? "-top-1" : "-bottom-1",
              handle.includes("w") ? "-left-1" : "-right-1",
            )}
          />
        ))}
    </div>
  );
}

export function CanvasWorkspace({
  elements,
  selectedId,
  onSelect,
  onUpdate,
  onCreateRectangle,
  tool,
  zoom,
  device,
}: Props) {
  const width = PAGE_WIDTH[device];
  const visible = device === "desktop" ? elements.filter((element) => element.visible) : [];

  const onPagePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.button !== 0) return;
    if (tool === "rectangle") {
      const bounds = event.currentTarget.getBoundingClientRect();
      const scale = zoom / 100;
      onCreateRectangle(
        Math.max(0, (event.clientX - bounds.left) / scale),
        Math.max(0, (event.clientY - bounds.top) / scale),
      );
    } else if (tool === "select") {
      onSelect(null);
    }
  };

  return (
    <main className="editor-grid relative flex-1 overflow-auto">
      <div className="flex min-h-full min-w-max justify-center p-16">
        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            {device === "desktop" ? "Desktop — 1200px" : "Mobile — 390px"}
          </div>
          <div
            className="editor-page relative"
            style={{ width, height: 1100 }}
            onPointerDown={onPagePointerDown}
          >
            {visible.map((el) => (
              <ElementNode
                key={el.id}
                el={el}
                selected={el.id === selectedId}
                zoom={zoom}
                onSelect={() => onSelect(el.id)}
                onUpdate={onUpdate}
              />
            ))}
            {device === "mobile" && (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                Área pronta para elementos
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
