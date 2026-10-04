import { Crown } from "lucide-react";

export default function ProMark() {
  return (
    <span
      aria-label="Pro"
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 py-0.5 shadow-glow-cyan"
    >
      <Crown
        className="h-3 w-3 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.95)]"
        strokeWidth={2.25}
        aria-hidden="true"
      />
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-accent-ice">Pro</span>
    </span>
  );
}
