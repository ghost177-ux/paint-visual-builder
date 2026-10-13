import { useState } from "react";
import { TopToolbar } from "./TopToolbar";
import { LeftToolbar } from "./LeftToolbar";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { PropertiesPanel } from "./PropertiesPanel";
import { LayersPanel } from "./LayersPanel";
import { demoDocument } from "./demo-data";
import type { DeviceMode, ToolId } from "./types";
import { cn } from "@/lib/utils";

export function EditorLayout() {
  const [doc] = useState(demoDocument);
  const [tool, setTool] = useState<ToolId>("select");
  const [selectedId, setSelectedId] = useState<string | null>("cta");
  const [zoom, setZoom] = useState(70);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [tab, setTab] = useState<"props" | "layers">("props");
  const selected = doc.elements.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopToolbar projectName={doc.name} zoom={zoom} onZoom={setZoom} device={device} onDevice={setDevice} />
      <div className="flex min-h-0 flex-1">
        <LeftToolbar active={tool} onChange={setTool} />
        <CanvasWorkspace elements={doc.elements} selectedId={selectedId} onSelect={setSelectedId} zoom={zoom} device={device} />
        <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-panel">
          <div className="flex gap-1 border-b border-border p-2">
            {([["props", "Propriedades"], ["layers", "Camadas"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={cn("flex-1 rounded-md py-1.5 text-xs font-semibold text-muted-foreground", tab === id && "bg-muted text-foreground")}>
                {label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === "props"
              ? <PropertiesPanel element={selected} comments={doc.comments} />
              : <LayersPanel elements={doc.elements} selectedId={selectedId} onSelect={setSelectedId} />}
          </div>
        </aside>
      </div>
    </div>
  );
}
