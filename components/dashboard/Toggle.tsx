"use client";

type ToggleProps = {
  checked: boolean;
  label: string;
  onToggle: () => void;
  disabled?: boolean;
};

export default function Toggle({ checked, label, onToggle, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onToggle}
      className={`relative h-7 w-12 shrink-0 rounded-full border outline-none transition focus-visible:ring-2 focus-visible:ring-accent-ice/60 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 ${
        checked
          ? "border-accent-cyan/50 bg-accent-cyan/25 shadow-glow-cyan"
          : "border-subtle bg-surface-base/70 hover:border-strong"
      }`}
    >
      <span
        className={`absolute top-1 left-1 h-5 w-5 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.45)] transition ${checked ? "bg-accent-ice" : "bg-white/85"} ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
