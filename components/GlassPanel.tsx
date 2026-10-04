import type { ComponentPropsWithoutRef, ReactNode } from "react";

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">;

export default function GlassPanel({
  children,
  className = "",
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={`border border-glass bg-glass backdrop-blur-glass ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
