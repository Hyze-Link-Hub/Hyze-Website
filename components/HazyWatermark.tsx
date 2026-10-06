import { Ghost } from "lucide-react";
import Link from "next/link";

type HazyWatermarkProps = {
  username: string;
};

export default function HazyWatermark({ username }: HazyWatermarkProps) {
  const href = `/login?ref=${encodeURIComponent(username)}`;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4 sm:p-5">
      <Link
        href={href}
        className="pointer-events-auto inline-flex max-w-[min(100%,22rem)] items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-medium tracking-tight text-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md outline-none transition hover:border-white/20 hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 dark:bg-black/20 sm:text-sm"
      >
        <Ghost className="h-3.5 w-3.5 shrink-0 text-white/70" strokeWidth={1.75} aria-hidden="true" />
        <span className="truncate">Create your own link page with Hazy</span>
      </Link>
    </div>
  );
}
