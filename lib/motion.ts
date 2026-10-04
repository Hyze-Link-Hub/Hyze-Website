import type { Transition, Variants } from "framer-motion";

/** Signature Apple-style fast-start, slow-settle curve */
export const appleEase = [0.16, 1, 0.3, 1] as const;

export const appleTransition: Transition = {
  duration: 0.8,
  ease: appleEase,
};

export const cinematicReveal: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: appleTransition,
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: appleTransition,
  },
};

export const listStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: appleEase },
  },
};

export const hoverLift = { scale: 1.015, y: -2 } as const;

export const tapPress = { scale: 0.985 } as const;

export const inViewViewport = {
  once: false,
  amount: 0.35,
} as const;
