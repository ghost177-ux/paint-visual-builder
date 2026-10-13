import { AlignLeft, AlignCenter, AlignRight, MessageSquare, Send } from "lucide-react";
import type { EditorComment, EditorElement } from "./types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border p-4">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <label className="editor-field">
      <span className="text-muted-foreground">{label}</span>
      <input
        defaultValue={value}
        key={String(value)}
        className="w-full bg-transparent outline-none"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  disabled,
  min,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  min?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="editor-field">
      <span className="text-muted-foreground">{label}</span>
      <input
        aria-label={label}
        type="number"
        min={min}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const next = event.currentTarget.valueAsNumber;
          if (Number.isFinite(next)) onChange(next);
        }}
        className="w-full min-w-0 bg-transparent outline-none disabled:opacity-50"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const pickerValue = /^#[\da-f]{6}$/i.test(value) ? value : "#000000";
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="editor-field w-36">
        <span
          className="relative h-4 w-4 shrink-0 rounded border border-border"
          style={{ background: value }}
        >
          <input
            aria-label={`Selecionar ${label}`}
            type="color"
            value={pickerValue}
            disabled={disabled}
            onChange={(event) => onChange(event.currentTarget.value.toUpperCase())}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
        </span>
        <input
          aria-label={label}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.currentTarget.value)}
          className="w-full min-w-0 bg-transparent font-mono uppercase outline-none disabled:opacity-50"
        />
      </div>
    </div>
  );
}

export function PropertiesPanel({
  element,
  comments,
  onUpdate,
}: {
  element: EditorElement | null;
  comments: EditorComment[];
  onUpdate: (id: string, changes: Partial<EditorElement>) => void;
}) {
  if (!element) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground">
        Selecione um elemento no canvas para editar suas propriedades.
      </div>
    );
  }
  const related = comments.filter((c) => c.elementId === element.id);
  const update = (changes: Partial<EditorElement>) => onUpdate(element.id, changes);
  const disabled = element.type !== "rectangle" || element.locked;
  return (
    <div>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold">{element.name}</span>
        <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
          {element.type}
        </span>
      </div>
      <Section title="Posição e tamanho">
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="X"
            value={element.x}
            disabled={disabled}
            onChange={(x) => update({ x })}
          />
          <NumberField
            label="Y"
            value={element.y}
            disabled={disabled}
            onChange={(y) => update({ y })}
          />
          <NumberField
            label="L"
            value={element.width}
            min={1}
            disabled={disabled}
            onChange={(width) => update({ width: Math.max(1, width) })}
          />
          <NumberField
            label="A"
            value={element.height}
            min={1}
            disabled={disabled}
            onChange={(height) => update({ height: Math.max(1, height) })}
          />
        </div>
      </Section>
      <Section title="Aparência">
        <div className="space-y-2">
          <ColorField
            label="Preenchimento"
            value={element.fill}
            disabled={disabled}
            onChange={(fill) => update({ fill })}
          />
          <ColorField
            label="Borda"
            value={element.stroke}
            disabled={disabled}
            onChange={(stroke) => update({ stroke })}
          />
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Esp."
              value={element.strokeWidth}
              min={0}
              disabled={disabled}
              onChange={(strokeWidth) => update({ strokeWidth: Math.max(0, strokeWidth) })}
            />
            <NumberField
              label="Raio"
              value={element.radius}
              min={0}
              disabled={disabled}
              onChange={(radius) => update({ radius: Math.max(0, radius) })}
            />
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
              <button
                key={i}
                className="grid h-7 flex-1 place-items-center rounded-md text-muted-foreground first:bg-panel first:text-primary first:shadow-sm"
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      </Section>
      <Section title={`Comentários (${related.length})`}>
        <div className="space-y-3">
          {related.length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhum comentário ainda.</p>
          )}
          {related.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {c.author[0]}
              </div>
              <div className="text-xs">
                <div>
                  <span className="font-semibold">{c.author}</span>{" "}
                  <span className="text-muted-foreground">{c.createdAt}</span>
                </div>
                <p className="mt-0.5 text-foreground/80">{c.body}</p>
              </div>
            </div>
          ))}
          <div className="editor-field">
            <MessageSquare size={13} className="text-muted-foreground" />
            <input
              placeholder="Adicionar comentário…"
              className="w-full bg-transparent outline-none"
            />
            <Send size={13} className="text-primary" />
          </div>
        </div>
      </Section>
    </div>
  );
}
