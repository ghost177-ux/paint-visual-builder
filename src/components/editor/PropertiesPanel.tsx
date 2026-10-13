import { AlignLeft, AlignCenter, AlignRight, MessageSquare, Send } from "lucide-react";
import type { EditorComment, EditorElement } from "./types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border p-4">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <label className="editor-field">
      <span className="text-muted-foreground">{label}</span>
      <input defaultValue={value} key={String(value)} className="w-full bg-transparent outline-none" />
    </label>
  );
}

function ColorField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="editor-field w-36">
        <span className="h-4 w-4 rounded border border-border" style={{ background: value }} />
        <span className="font-mono uppercase">{value}</span>
      </div>
    </div>
  );
}

export function PropertiesPanel({ element, comments }: { element: EditorElement | null; comments: EditorComment[] }) {
  if (!element) {
    return <div className="p-6 text-center text-xs text-muted-foreground">Selecione um elemento no canvas para editar suas propriedades.</div>;
  }
  const related = comments.filter((c) => c.elementId === element.id);
  return (
    <div>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold">{element.name}</span>
        <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">{element.type}</span>
      </div>
      <Section title="Posição e tamanho">
        <div className="grid grid-cols-2 gap-2">
          <Field label="X" value={element.x} />
          <Field label="Y" value={element.y} />
          <Field label="L" value={element.width} />
          <Field label="A" value={element.height} />
        </div>
      </Section>
      <Section title="Aparência">
        <div className="space-y-2">
          <ColorField label="Preenchimento" value={element.fill} />
          <ColorField label="Borda" value={element.stroke} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Esp." value={element.strokeWidth} />
            <Field label="Raio" value={element.radius} />
          </div>
        </div>
      </Section>
      <Section title="Tipografia">
        <div className="space-y-2">
          <Field label="Fonte" value={element.fontFamily ?? "Manrope"} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Tam." value={element.fontSize ?? 16} />
            <Field label="Peso" value={element.fontWeight ?? 400} />
          </div>
          <div className="flex rounded-lg bg-muted p-0.5">
            {[AlignLeft, AlignCenter, AlignRight].map((Icon, i) => (
              <button key={i} className="grid h-7 flex-1 place-items-center rounded-md text-muted-foreground first:bg-panel first:text-primary first:shadow-sm"><Icon size={14} /></button>
            ))}
          </div>
        </div>
      </Section>
      <Section title={`Comentários (${related.length})`}>
        <div className="space-y-3">
          {related.length === 0 && <p className="text-xs text-muted-foreground">Nenhum comentário ainda.</p>}
          {related.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{c.author[0]}</div>
              <div className="text-xs">
                <div><span className="font-semibold">{c.author}</span> <span className="text-muted-foreground">{c.createdAt}</span></div>
                <p className="mt-0.5 text-foreground/80">{c.body}</p>
              </div>
            </div>
          ))}
          <div className="editor-field">
            <MessageSquare size={13} className="text-muted-foreground" />
            <input placeholder="Adicionar comentário…" className="w-full bg-transparent outline-none" />
            <Send size={13} className="text-primary" />
          </div>
        </div>
      </Section>
    </div>
  );
}
