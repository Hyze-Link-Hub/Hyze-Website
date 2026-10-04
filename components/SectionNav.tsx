"use client";

export type NavSection = {
  id: string;
  label: string;
};

type SectionNavProps = {
  sections: NavSection[];
  activeId: string;
  onNavigate: (id: string) => void;
};

export default function SectionNav({
  sections,
  activeId,
  onNavigate,
}: SectionNavProps) {
  return (
    <nav
      className="fixed right-3 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-3 sm:right-5"
      aria-label="Section navigation"
    >
      {sections.map((section) => {
        const active = section.id === activeId;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onNavigate(section.id)}
            aria-label={`Go to ${section.label}`}
            aria-current={active ? "true" : undefined}
            className={`rounded-full outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent-ice/60 ${
              active
                ? "h-6 w-2 bg-gradient-to-b from-accent-ice to-accent-cyan shadow-glow-cyan"
                : "h-2 w-2 bg-white/25 hover:scale-125 hover:bg-accent-ice/70"
            }`}
          />
        );
      })}
    </nav>
  );
}
