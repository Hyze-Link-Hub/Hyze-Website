"use client";

import { hoverLift, tapPress } from "@/lib/motion";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export type SocialLink = {
  id: string;
  label: string;
  href: string;
};

type SocialIconsProps = {
  links?: SocialLink[];
  trackClicks?: boolean;
};

function recordLinkClick(linkId: string) {
  void fetch("/api/links/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link_id: linkId }),
    keepalive: true,
  });
}

function iconForLink(label: string, href: string): ReactNode {
  const haystack = `${label} ${href}`.toLowerCase();

  if (haystack.includes("discord")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    );
  }

  if (haystack.includes("tiktok")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.95a8.22 8.22 0 0 0 4.76 1.52V6.99a4.85 4.85 0 0 1-1-.3z" />
      </svg>
    );
  }

  if (
    haystack.includes("x.com") ||
    haystack.includes("twitter") ||
    /(^|[^a-z])x([^a-z]|$)/i.test(label)
  ) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    );
  }

  if (haystack.includes("youtube") || haystack.includes("youtu.be")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
      </svg>
    );
  }

  if (haystack.includes("twitch")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M4.3 2 2 4.3v15.4h5.1V22l2.9-2.3h3.4L22 13.7V2H4.3zm16 10.9-3.4 3.4h-3.4l-2.9 2.3v-2.3H6.3V3.7h14v9.2zM15.4 7.1h1.7v5.1h-1.7V7.1zm-4.6 0H12.6v5.1H10.8V7.1z" />
      </svg>
    );
  }

  const initial = (label.trim()[0] || "?").toUpperCase();
  return <span className="font-mono text-[11px] font-semibold">{initial}</span>;
}

export default function SocialIcons({ links = [], trackClicks = false }: SocialIconsProps) {
  if (links.length === 0) return null;

  return (
    <ul className="flex items-center justify-center gap-2.5" aria-label="Social links">
      {links.map((social) => (
        <li key={social.id}>
          <motion.a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            onClick={() => {
              if (trackClicks) recordLinkClick(social.id);
            }}
            whileHover={hoverLift}
            whileTap={tapPress}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-subtle bg-surface-raised/60 text-white/65 outline-none backdrop-blur-2xl transition-[border-color,color,box-shadow] duration-300 hover:border-accent-cyan/40 hover:text-accent-ice hover:shadow-glow-cyan focus-visible:ring-2 focus-visible:ring-accent-ice/60"
          >
            {iconForLink(social.label, social.href)}
          </motion.a>
        </li>
      ))}
    </ul>
  );
}
