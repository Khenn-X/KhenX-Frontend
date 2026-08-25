import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const FINE_POINTER_QUERY = "(pointer: fine)";

type Ripple = {
  id: number;
  x: number;
  y: number;
};

const CustomCursor = () => {
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const ringX = useSpring(cursorX, { stiffness: 500, damping: 35, mass: 0.35 });
  const ringY = useSpring(cursorY, { stiffness: 500, damping: 35, mass: 0.35 });

  useEffect(() => {
    const mediaQuery = window.matchMedia(FINE_POINTER_QUERY);
    const updatePointerType = () => setHasFinePointer(mediaQuery.matches);

    updatePointerType();
    mediaQuery.addEventListener("change", updatePointerType);
    return () => mediaQuery.removeEventListener("change", updatePointerType);
  }, []);

  useEffect(() => {
    if (!hasFinePointer) return;

    const root = document.documentElement;
    const previousTransforms = new WeakMap<HTMLElement, string>();

    root.classList.add("khenx-custom-cursor");

    const handleMouseMove = (event: MouseEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    };

    const triggerPressFeedback = (target: HTMLElement) => {
      const previousTransform = target.style.transform || "";
      previousTransforms.set(target, previousTransform);
      target.style.transform = "scale(0.96)";
      target.style.transformOrigin = "center";
      target.style.transition = "transform 120ms ease-out";
      target.style.willChange = "transform";

      window.setTimeout(() => {
        target.style.transform = previousTransforms.get(target) ?? "";
        target.style.transition = "";
        target.style.transformOrigin = "";
        target.style.willChange = "";
      }, 120);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>("button, a");
      if (!target || target.getAttribute("aria-disabled") === "true") return;

      triggerPressFeedback(target);
    };

    const handleClick = (event: MouseEvent) => {
      const ripple = { id: Date.now() + Math.random(), x: event.clientX, y: event.clientY };
      setRipples((current) => [...current, ripple]);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("click", handleClick);

    return () => {
      root.classList.remove("khenx-custom-cursor");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("click", handleClick);
    };
  }, [cursorX, cursorY, hasFinePointer]);

  if (!hasFinePointer) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-5 w-5 rounded-full border border-[#00C9A7]/80"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
      />
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          aria-hidden="true"
          className="pointer-events-none fixed z-[9998] block h-3 w-3 rounded-full border border-[#00C9A7]/60"
          style={{ left: ripple.x, top: ripple.y, translateX: "-50%", translateY: "-50%" }}
          initial={{ opacity: 0.7, scale: 0.5 }}
          animate={{ opacity: 0, scale: 4 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          onAnimationComplete={() => {
            setRipples((current) => current.filter((item) => item.id !== ripple.id));
          }}
        />
      ))}
      <style>{`
        .khenx-custom-cursor,
        .khenx-custom-cursor * {
          cursor: none !important;
        }
      `}</style>
    </>
  );
};

export default CustomCursor;
