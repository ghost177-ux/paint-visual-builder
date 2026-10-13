import { useEffect, useState } from "react";
import { TopToolbar } from "./TopToolbar";
import { LeftToolbar } from "./LeftToolbar";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { PropertiesPanel } from "./PropertiesPanel";
import { LayersPanel } from "./LayersPanel";
import { demoDocument } from "./demo-data";
import type { DeviceMode, EditorElement, ToolId } from "./types";
import { cn } from "@/lib/utils";

export function EditorLayout() {
  const [doc, setDoc] = useState(demoDocument);
  const [tool, setTool] = useState<ToolId>("select");
  const [selectedId, setSelectedId] = useState<string | null>("cta");
  const [zoom, setZoom] = useState(70);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [tab, setTab] = useState<"props" | "layers">("props");
  const selected = doc.elements.find((e) => e.id === selectedId) ?? null;

  const updateElement = (id: string, changes: Partial<EditorElement>) => {
    setDoc((current) => ({
      ...current,
      elements: current.elements.map((element) =>
        element.id === id && !element.locked ? { ...element, ...changes } : element,
      ),
    }));
  };

  const createRectangle = (x: number, y: number) => {
    const rectangleNumber =
      doc.elements.filter((element) => element.type === "rectangle").length + 1;
    const rectangle: EditorElement = {
      id: crypto.randomUUID(),
      type: "rectangle",
      name: `Retângulo ${rectangleNumber}`,
      x,
      y,
      width: 160,
      height: 100,
      fill: "#3BBCEC",
      stroke: "#0F172A",
      strokeWidth: 0,
      radius: 0,
      visible: true,
      locked: false,
      parentId: null,
    };
    setDoc((current) => ({ ...current, elements: [...current.elements, rectangle] }));
    setSelectedId(rectangle.id);
    setTool("select");
    setTab("props");
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest("input, textarea, select, [contenteditable='true']"))
      ) {
        return;
      }

      const element = doc.elements.find((candidate) => candidate.id === selectedId);
      if (!element || element.type !== "rectangle" || element.locked) return;

      event.preventDefault();
      setDoc((current) => ({
        ...current,
        elements: current.elements.filter((candidate) => candidate.id !== selectedId),
      }));
      setSelectedId(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [doc.elements, selectedId]);

  const selectVisibleLayer = (id: string) => {
    if (doc.elements.find((element) => element.id === id)?.visible) setSelectedId(id);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopToolbar
        projectName={doc.name}
        zoom={zoom}
        onZoom={setZoom}
        device={device}
        onDevice={setDevice}
      />
      <div className="flex min-h-0 flex-1">
        <LeftToolbar active={tool} onChange={setTool} />
        <CanvasWorkspace
          elements={doc.elements}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdate={updateElement}
          onCreateRectangle={createRectangle}
          tool={tool}
          zoom={zoom}
          device={device}
        />
        <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-panel">
          <div className="flex gap-1 border-b border-border p-2">
            {(
              [
                ["props", "Propriedades"],
                ["layers", "Camadas"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex-1 rounded-md py-1.5 text-xs font-semibold text-muted-foreground",
                  tab === id && "bg-muted text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === "props" ? (
              <PropertiesPanel
                element={selected}
                comments={doc.comments}
                onUpdate={updateElement}
              />
            ) : (
              <LayersPanel
                elements={doc.elements}
                selectedId={selectedId}
                onSelect={selectVisibleLayer}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
