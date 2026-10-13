import { FilePlus2, Upload, Download, Undo2, Redo2, ZoomIn, ZoomOut, Monitor, Smartphone, Play, Paintbrush } from "lucide-react";
import type { DeviceMode } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  projectName: string;
  zoom: number;
  onZoom: (z: number) => void;
  device: DeviceMode;
  onDevice: (d: DeviceMode) => void;
}

function IconBtn({ icon: Icon, label, onClick }: { icon: typeof Undo2; label: string; onClick?: () => void }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} className="editor-icon-btn">
      <Icon size={16} />
    </button>
  );
}

export function TopToolbar({ projectName, zoom, onZoom, device, onDevice }: Props) {
  return (
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
          {([["desktop", Monitor], ["mobile", Smartphone]] as const).map(([d, Icon]) => (
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
  );
}
