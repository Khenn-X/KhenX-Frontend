import { type ReactNode } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

type Direction = "left" | "right" | "up" | "down";

const OFFSET: Record<Direction, string> = {
  left: "-translate-x-16",
  right: "translate-x-16",
  up: "translate-y-16",
  down: "-translate-y-16",
};

export default function RevealSection({
  direction,
  children,
  className = "",
  delayMs = 0,
}: {
  direction: Direction;
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? "opacity-100 translate-x-0 translate-y-0"
          : `opacity-0 ${OFFSET[direction]}`
      } ${className}`}
      style={{ transitionDelay: isVisible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}