import { motion, useReducedMotion } from "framer-motion";
import { Children, isValidElement, type ReactNode } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  staggerMs?: number;
}

const StaggerReveal = ({
  children,
  className = "",
  staggerMs = 250,
}: StaggerRevealProps) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const shouldReduceMotion = useReducedMotion();
  const items = Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {items.map((child, index) => (
        <motion.div
          key={index}
          className={
            isValidElement<{ className?: string }>(child)
              ? child.props.className
              : undefined
          }
          initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
          animate={isVisible || shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
          transition={{
            duration: 0.65,
            delay: shouldReduceMotion ? 0 : (index * staggerMs) / 1000,
            ease: "easeOut",
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

export default StaggerReveal;
