import { FilePlus2, Upload, Download, Undo2, Redo2, ZoomIn, ZoomOut, Monitor, Smartphone, Play, Paintbrush } from "lucide-react";
import type { DeviceMode } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  projectName: string;
  zoom: number;
  onZoom: (z: number) => void;
  device: DeviceMode;
  onDevice: (d: DeviceMode) => void;
  viewportWidth: number;
  onViewportWidthChange: (width: number) => void;
  breakpoints: number[];
  onBreakpointsChange: (breakpoints: number[]) => void;
}

function IconBtn({ icon: Icon, label, onClick }: { icon: typeof Undo2; label: string; onClick?: () => void }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} className="editor-icon-btn">
      <Icon size={16} />
    </button>
  );
}

export function TopToolbar({ projectName, zoom, onZoom, device, onDevice, viewportWidth, onViewportWidthChange, breakpoints, onBreakpointsChange }: Props) {
  const handleBreakpointDrag = (index: number, nextValue: number) => {
    const safeValue = Math.max(320, Math.min(1800, nextValue));
    const nextBreakpoints = breakpoints
      .map((value, currentIndex) => (currentIndex === index ? safeValue : value))
      .sort((a, b) => a - b);
    onBreakpointsChange(nextBreakpoints);
  };

  return (
    <>
      <div className="flex h-9 shrink-0 items-center gap-3 border-b border-border bg-panel px-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
          <span>Viewport</span>
          <input
            type="number"
            min={320}
            max={1800}
            value={viewportWidth}
            onChange={(event) => onViewportWidthChange(Math.max(320, Math.min(1800, Number(event.currentTarget.value || 320))))}
            className="w-20 rounded border border-border bg-background px-2 py-1 text-right text-[11px] font-medium text-foreground outline-none focus:border-primary"
          />
          <span>px</span>
        </div>
        <div className="relative mx-2 flex h-6 flex-1 items-center overflow-hidden rounded-md border border-border bg-muted/40">
          <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-transparent to-muted/20" />
          <div className="h-full w-full bg-[linear-gradient(to_right,transparent_0,transparent_calc(100%-1px),rgba(148,163,184,0.5)_calc(100%-1px),rgba(148,163,184,0.5)_100%)]" />
          {breakpoints.map((bp, index) => (
            <button
              key={`${bp}-${index}`}
              type="button"
              aria-label={`Breakpoint ${bp}px`}
              title={`Breakpoint ${bp}px`}
              onPointerDown={(event) => {
                event.preventDefault();
                const startX = event.clientX;
                const startBreakpoint = breakpoints[index];
                const move = (moveEvent: PointerEvent) => {
                  const delta = moveEvent.clientX - startX;
                  handleBreakpointDrag(index, startBreakpoint + delta / 1.6);
                };
                const up = () => {
                  window.removeEventListener("pointermove", move);
                  window.removeEventListener("pointerup", up);
                };
                window.addEventListener("pointermove", move);
                window.addEventListener("pointerup", up);
              }}
              style={{ left: `${(bp / 1800) * 100}%`, marginLeft: "-8px" }}
              className="absolute top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-primary text-[8px] text-primary-foreground shadow-sm"
            >
              <span className="sr-only">{bp}</span>
            </button>
          ))}
        </div>
      </div>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-panel px-3">
        <div className="flex items-center gap-2 pr-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Paintbrush size={16} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold">Paint Visual Builder</div>
            <div className="text-[11px] text-muted-foreground">{projectName}</div>
          </div>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-1">
          <button className="editor-text-btn"><FilePlus2 size={15} /> Novo</button>
          <button className="editor-text-btn"><Upload size={15} /> Importar JSON</button>
          <button className="editor-text-btn"><Download size={15} /> Exportar JSON</button>
        </div>

        <div className="mx-auto flex items-center gap-1">
          <IconBtn icon={Undo2} label="Desfazer" />
          <IconBtn icon={Redo2} label="Refazer" />
          <div className="mx-2 h-6 w-px bg-border" />
          <IconBtn icon={ZoomOut} label="Diminuir zoom" onClick={() => onZoom(Math.max(25, zoom - 10))} />
          <span className="w-12 text-center text-xs font-semibold tabular-nums">{zoom}%</span>
          <IconBtn icon={ZoomIn} label="Aumentar zoom" onClick={() => onZoom(Math.min(200, zoom + 10))} />
          <div className="mx-2 h-6 w-px bg-border" />
          <div className="flex rounded-lg bg-muted p-0.5">
            {([['desktop', Monitor], ['mobile', Smartphone]] as const).map(([d, Icon]) => (
              <button
                key={d}
                aria-label={d}
                onClick={() => onDevice(d)}
                className={cn("grid h-7 w-8 place-items-center rounded-md text-muted-foreground transition", device === d && "bg-panel text-primary shadow-sm")}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>

        <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
          <Play size={14} /> Pré-visualizar
        </button>
      </header>
    </>
  );
}
