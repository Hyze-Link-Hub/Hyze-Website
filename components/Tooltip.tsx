"use client";

import { useId, type ReactNode } from "react";

type TooltipProps = {
  label: string;
  children: ReactNode;
};

export default function Tooltip({ label, children }: TooltipProps) {
  const tooltipId = useId();

  return (
    <span className="group relative inline-flex">
      <span aria-describedby={tooltipId}>{children}</span>
      <span
        id={tooltipId}
        role="tooltip"
        className="label-mono pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-subtle bg-surface-overlay/95 px-2.5 py-1 text-white/85 opacity-0 shadow-glass backdrop-blur-2xl transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
        <span
          className="absolute left-1/2 top-full -mt-px -translate-x-1/2 border-4 border-transparent border-t-white/10"
          aria-hidden="true"
        />
      </span>
    </span>
  );
}
