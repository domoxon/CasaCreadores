// Selector de opciones en forma de "chips" (multi-selección con máximo opcional).
export function Chips({
  options,
  value,
  onChange,
  max,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  function toggle(option: string) {
    if (value.includes(option)) onChange(value.filter((v) => v !== option));
    else if (!max || value.length < max) onChange([...value, option]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          type="button"
          key={o}
          onClick={() => toggle(o)}
          aria-pressed={value.includes(o)}
          className={[
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            value.includes(o)
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground",
          ].join(" ")}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
