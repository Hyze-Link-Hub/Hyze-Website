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
        surface: {
          base: "var(--surface-base)",
          raised: "var(--surface-raised)",
          overlay: "var(--surface-overlay)",
        },
        accent: {
          cyan: "var(--accent-cyan)",
          ice: "var(--accent-ice)",
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
