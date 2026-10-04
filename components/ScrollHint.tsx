import { ChevronDown } from "lucide-react";

type ScrollHintProps = {
  targetId: string;
  label?: string;
};

export default function ScrollHint({
  targetId,
  label = "Scroll for more",
}: ScrollHintProps) {
  return (
    <a
      href={`#${targetId}`}
      className="scroll-hint absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-white/40 transition hover:text-accent-ice"
    >
      <span className="label-mono">{label}</span>
      <ChevronDown className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
    </a>
  );
}
