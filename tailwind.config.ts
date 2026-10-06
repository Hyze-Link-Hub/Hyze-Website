import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        serif: ["var(--font-playfair)"],
        mono: ["var(--font-space)"],
      },
      colors: {
        glass: "var(--glass-bg)",
        "accent-neon": "var(--accent-neon)",
        brand: {
          glow: "var(--brand-glow)",
          purple: "var(--brand-purple)",
          muted: "var(--brand-muted)",
          card: "var(--brand-card)",
          deep: "var(--brand-deep)",
        },
        surface: {
          base: "var(--surface-base)",
          raised: "var(--surface-raised)",
          overlay: "var(--surface-overlay)",
        },
        accent: {
          cyan: "var(--accent-cyan)",
          ice: "var(--accent-ice)",
          purple: "var(--brand-purple)",
          glow: "var(--brand-glow)",
          muted: "var(--brand-muted)",
        },
      },
      borderColor: {
        glass: "var(--glass-border)",
        subtle: "var(--border-subtle)",
        strong: "var(--border-strong)",
      },
      boxShadow: {
        glass: "var(--shadow-glass)",
        "glow-cyan": "var(--shadow-glow-cyan)",
        "glow-cyan-lg": "var(--shadow-glow-cyan-lg)",
        "glow-purple": "var(--shadow-glow-purple)",
        "glow-purple-lg": "var(--shadow-glow-purple-lg)",
      },
      backdropBlur: {
        glass: "var(--glass-blur)",
      },
      blur: {
        glass: "var(--glass-blur)",
      },
    },
  },
};

export default config;
