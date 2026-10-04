"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

type StarfieldBackgroundProps = {
  scrollYProgress: MotionValue<number>;
};

export default function StarfieldBackground({
  scrollYProgress,
}: StarfieldBackgroundProps) {
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 72]);
  const farY = useTransform(scrollYProgress, [0, 1], [0, 28]);
  const nearY = useTransform(scrollYProgress, [0, 1], [0, 56]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  return (
    <div className="starfield" aria-hidden="true">
      <motion.div
        className="starfield__glow"
        style={{ y: glowY, scale: glowScale }}
      />
      <motion.div
        className="starfield__stars starfield__stars--far"
        style={{ y: farY }}
      />
      <motion.div
        className="starfield__stars starfield__stars--near"
        style={{ y: nearY }}
      />
      <div className="starfield__dust" />
    </div>
  );
}
