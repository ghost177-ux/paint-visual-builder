import { useEffect, useMemo, useRef, useState } from "react";
import { TopToolbar } from "./TopToolbar";
import { LeftToolbar } from "./LeftToolbar";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { PropertiesPanel } from "./PropertiesPanel";
import { LayersPanel } from "./LayersPanel";
import { demoDocument } from "./demo-data";
import type { DeviceMode, EditorComment, EditorDocument, EditorElement, ToolId } from "./types";
import { cn } from "@/lib/utils";

const cloneDocument = (document: EditorDocument) => JSON.parse(JSON.stringify(document)) as EditorDocument;
const DEFAULT_BREAKPOINTS = [768, 1024];

function getVisibleSelection(elements: EditorElement[], selectedIds: string[]) {
  const selectedSet = new Set(selectedIds);
  return selectedIds.filter((id) => {
    const element = elements.find((candidate) => candidate.id === id);
    if (!element) return false;
    const hasSelectedParent =
      Boolean(element.parentId) &&
      selectedSet.has(element.parentId as string);
    return !hasSelectedParent;
  });
}

function getSelectionForAction(elements: EditorElement[], selectedIds: string[]) {
  const visibleSelection = getVisibleSelection(elements, selectedIds);
  const chosen = new Set<string>();
  for (const id of visibleSelection) {
    const element = elements.find((candidate) => candidate.id === id);
    if (!element) continue;
    chosen.add(id);
    const descendants = elements.filter((candidate) => candidate.parentId === id);
    descendants.forEach((candidate) => {
      if (selectedIds.includes(candidate.id)) chosen.add(candidate.id);
    });
  }
  return [...chosen];
}

function collectSubtreeIds(elements: EditorElement[], elementId: string): string[] {
  const ids = new Set<string>([elementId]);
  const walk = (parentId: string) => {
    elements
      .filter((candidate) => candidate.parentId === parentId)
      .forEach((candidate) => {
        ids.add(candidate.id);
        walk(candidate.id);
      });
  };
  walk(elementId);
  return [...ids];
}

function applySelectionDelta(current: string[], id: string, mode: "replace" | "toggle" | "remove") {
  if (mode === "replace") return [id];
  if (mode === "remove") return current.filter((candidate) => candidate !== id);
  if (current.includes(id)) return current.filter((candidate) => candidate !== id);
  return [...current, id];
}

export function EditorLayout() {
  const [doc, setDoc] = useState<EditorDocument>(() => cloneDocument(demoDocument));
  const [tool, setTool] = useState<ToolId>("select");
  const [selectedIds, setSelectedIds] = useState<string[]>(["cta"]);
  const [zoom, setZoom] = useState(70);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [tab, setTab] = useState<"props" | "layers">("props");
  const [viewportWidth, setViewportWidth] = useState(1240);
  const [breakpoints, setBreakpoints] = useState<number[]>(DEFAULT_BREAKPOINTS);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [historyVersion, setHistoryVersion] = useState(0);
  const historyRef = useRef<EditorDocument[]>([cloneDocument(demoDocument)]);

  const selected = useMemo(
    () => doc.elements.find((element) => element.id === selectedIds[0]) ?? null,
    [doc.elements, selectedIds],
  );

  const commitHistory = (nextDocument: EditorDocument) => {
    const previous = historyRef.current[historyIndex] ?? cloneDocument(demoDocument);
    if (JSON.stringify(previous) === JSON.stringify(nextDocument)) return;
    const trimmedHistory = historyRef.current.slice(0, historyIndex + 1);
    trimmedHistory.push(cloneDocument(nextDocument));
    historyRef.current = trimmedHistory;
    setHistoryIndex(trimmedHistory.length - 1);
    setHistoryVersion((value) => value + 1);
  };

  const applyDocumentUpdate = (
    updater: (current: EditorDocument) => EditorDocument,
    options: { recordHistory?: boolean } = { recordHistory: true },
  ) => {
    setDoc((current) => {
      const nextDocument = updater(current);
      if (options.recordHistory) {
        commitHistory(nextDocument);
      }
      return nextDocument;
    });
  };

  const updateElement = (id: string, changes: Partial<EditorElement>) => {
    applyDocumentUpdate((current) => ({
      ...current,
      elements: current.elements.map((element) =>
        element.id === id && !element.locked ? { ...element, ...changes } : element,
      ),
    }));
  };

  const createRectangle = (x: number, y: number) => {
    const rectangleNumber = doc.elements.filter((element) => element.type === "rectangle").length + 1;
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
    applyDocumentUpdate((current) => ({
      ...current,
      elements: [...current.elements, rectangle],
    }));
    setSelectedIds([rectangle.id]);
    setTool("select");
    setTab("props");
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const previousDocument = historyRef.current[historyIndex - 1];
    if (!previousDocument) return;
    setHistoryIndex((value) => value - 1);
    setDoc(cloneDocument(previousDocument));
    setHistoryVersion((value) => value + 1);
  };

  const redo = () => {
    if (historyIndex >= historyRef.current.length - 1) return;
    const nextDocument = historyRef.current[historyIndex + 1];
    if (!nextDocument) return;
    setHistoryIndex((value) => value + 1);
    setDoc(cloneDocument(nextDocument));
    setHistoryVersion((value) => value + 1);
  };

  const handleSelect = (id: string | null, mode: "replace" | "toggle" | "remove" = "replace") => {
    if (id === null) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds((current) => applySelectionDelta(current, id, mode));
  };

  const moveSelectedElements = (deltaX: number, deltaY: number) => {
    const ids = getSelectionForAction(doc.elements, selectedIds);
    if (!ids.length) return;
    applyDocumentUpdate((current) => ({
      ...current,
      elements: current.elements.map((element) => {
        if (!ids.includes(element.id) || element.locked) return element;
        return {
          ...element,
          x: element.x + deltaX,
          y: element.y + deltaY,
        };
      }),
    }));
  };

  const duplicateSelection = () => {
    const ids = getSelectionForAction(doc.elements, selectedIds);
    if (!ids.length) return;
    const clonesBySource = new Map<string, string>();
    const duplicatedIds: string[] = [];

    applyDocumentUpdate((current) => {
      const nextElements = [...current.elements];
      ids.forEach((id) => {
        const sourceElement = current.elements.find((candidate) => candidate.id === id);
        if (!sourceElement) return;
        const newId = crypto.randomUUID();
        clonesBySource.set(id, newId);
        duplicatedIds.push(newId);
        nextElements.push({
          ...sourceElement,
          id: newId,
          name: `${sourceElement.name} cópia`,
          x: sourceElement.x + 24,
          y: sourceElement.y + 24,
          parentId: sourceElement.parentId,
        });
      });
      return { ...current, elements: nextElements };
    });
    setSelectedIds(duplicatedIds);
  };

  const deleteSelection = () => {
    const ids = getSelectionForAction(doc.elements, selectedIds);
    if (!ids.length) return;
    const deletionSet = new Set<string>();
    ids.forEach((id) => {
      collectSubtreeIds(doc.elements, id).forEach((candidate) => deletionSet.add(candidate));
    });
    applyDocumentUpdate((current) => ({
      ...current,
      elements: current.elements.filter((element) => !deletionSet.has(element.id)),
    }));
    setSelectedIds([]);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditingText =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest("input, textarea, select, [contenteditable='true']"));

      if (!isEditingText && (event.key === "Delete" || event.key === "Backspace")) {
        event.preventDefault();
        deleteSelection();
      }

      if (isEditingText || !selectedIds.length) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelection();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") ||
          ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "z")) {
        event.preventDefault();
        redo();
        return;
      }

      if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        const dx = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
        const dy = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
        const step = event.shiftKey ? 10 : 1;
        moveSelectedElements(dx * step, dy * step);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteSelection, duplicateSelection, moveSelectedElements, selectedIds, undo, redo]);

  const selectVisibleLayer = (id: string, mode: "replace" | "toggle" = "replace") => {
    const element = doc.elements.find((candidate) => candidate.id === id);
    if (!element || !element.visible) return;
    handleSelect(id, mode);
  };

  const selectedElement = selectedIds.length > 0 ? selected : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopToolbar
        projectName={doc.name}
        zoom={zoom}
        onZoom={setZoom}
        device={device}
        onDevice={setDevice}
        viewportWidth={viewportWidth}
        onViewportWidthChange={setViewportWidth}
        breakpoints={breakpoints}
        onBreakpointsChange={setBreakpoints}
      />
      <div className="flex min-h-0 flex-1">
        <LeftToolbar active={tool} onChange={setTool} />
        <CanvasWorkspace
          elements={doc.elements}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onMoveSelection={moveSelectedElements}
          onUpdate={updateElement}
          onCreateRectangle={createRectangle}
          tool={tool}
          zoom={zoom}
          device={device}
          viewportWidth={viewportWidth}
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
                element={selectedElement}
                comments={doc.comments}
                onUpdate={updateElement}
              />
            ) : (
              <LayersPanel
                elements={doc.elements}
                selectedIds={selectedIds}
                onSelect={selectVisibleLayer}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
