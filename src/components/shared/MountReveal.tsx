import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";

type Direction = "left" | "right" | "up" | "down";

const OFFSET: Record<Direction, string> = {
  left: "-32px",
  right: "32px",
  up: "-32px",
  down: "32px",
};

export default function MountReveal({
  direction,
  children,
  className = "",
  delayMs = 0,
  persistKey,
}: {
  direction: Direction;
  children: ReactNode;
  className?: string;
  delayMs?: number;
  persistKey?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [hasRevealed] = useState(() => {
    if (!persistKey || typeof window === "undefined") return false;
    return window.sessionStorage.getItem(persistKey) === "true";
  });
  const controls = useAnimationControls();

  useEffect(() => {
    const visibleState = { opacity: 1, x: 0 };
    if (hasRevealed || shouldReduceMotion) {
      controls.set(visibleState);
    } else {
      void controls.start(visibleState);
    }
  }, [controls, hasRevealed, shouldReduceMotion]);

  return (
    <motion.div
      className={className}
      initial={
        hasRevealed || shouldReduceMotion
          ? { opacity: 1, x: 0 }
          : { opacity: 0, x: OFFSET[direction] }
      }
      animate={controls}
      transition={{
        duration: 1.5,
        delay: delayMs / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
      onAnimationComplete={() => {
        if (persistKey && !hasRevealed) {
          window.sessionStorage.setItem(persistKey, "true");
        }
      }}
    >
      {children}
    </motion.div>
  );
}