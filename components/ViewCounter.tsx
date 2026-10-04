import { Eye } from "lucide-react";

type ViewCounterProps = {
  count: number;
};

function formatCount(count: number) {
  return new Intl.NumberFormat("en", {
    notation: count >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(count);
}

export default function ViewCounter({ count }: ViewCounterProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-subtle bg-surface-raised/60 px-3 py-1 text-xs text-white/55 backdrop-blur-2xl">
      <Eye className="h-3.5 w-3.5 text-accent-cyan" strokeWidth={1.75} aria-hidden="true" />
      <span className="font-mono font-medium tabular-nums tracking-wide text-white/85">
        {formatCount(count)}
      </span>
      <span className="label-mono text-white/35">views</span>
    </div>
  );
}
