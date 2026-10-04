"use client";

import Guestbook from "@/components/Guestbook";
import SectionNav, { type NavSection } from "@/components/SectionNav";
import StarfieldBackground from "@/components/StarfieldBackground";
import VolumeControl from "@/components/VolumeControl";
import { useScroll } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ScrollSnapShellProps = {
  sections: NavSection[];
  profileId: string;
  children: ReactNode;
};

export default function ScrollSnapShell({
  sections,
  profileId,
  children,
}: ScrollSnapShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const { scrollYProgress } = useScroll({ container: rootRef });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root,
        threshold: [0.4, 0.6, 0.8],
      },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [sections]);

  const onNavigate = useCallback((id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <>
      <StarfieldBackground scrollYProgress={scrollYProgress} />
      <VolumeControl />
      <Guestbook profileId={profileId} />
      <SectionNav
        sections={sections}
        activeId={activeId}
        onNavigate={onNavigate}
      />

      <div
        ref={rootRef}
        className="relative z-10 h-screen w-full overflow-y-auto scroll-smooth snap-y snap-mandatory"
      >
        {children}
      </div>
    </>
  );
}
