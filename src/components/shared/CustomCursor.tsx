import { useEffect, useRef, useState } from "react";

const FINE_POINTER_QUERY = "(pointer: fine)";
const INTERACTIVE_SELECTOR =
  "button, a, [role='button'], [data-cursor-hover], input[type='button'], input[type='submit'], tr";
const TEXT_INPUT_SELECTOR =
  "input:not([type='button']):not([type='submit']):not([type='checkbox']):not([type='radio']), textarea, select, [contenteditable='true']";

const CustomCursor = () => {
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

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
    const cursor = cursorRef.current;
    if (!cursor) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: -100, y: -100 };
    const rendered = { x: -100, y: -100 };
    let animationFrame = 0;

    const updateHoverState = () => {
      const element = document.elementFromPoint(target.x, target.y);
      const isTextInput = element instanceof Element && Boolean(element.closest(TEXT_INPUT_SELECTOR));
      const isInteractive = element instanceof Element && Boolean(element.closest(INTERACTIVE_SELECTOR));
      cursor.classList.toggle("khenx-cursor-input", isTextInput);
      cursor.classList.toggle("khenx-cursor-hover", !isTextInput && isInteractive);
    };

    const handleMouseMove = (event: MouseEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      updateHoverState();
    };

    const animate = () => {
      if (reducedMotion) {
        rendered.x = target.x;
        rendered.y = target.y;
      } else {
        rendered.x += (target.x - rendered.x) * 0.22;
        rendered.y += (target.y - rendered.y) * 0.22;
      }

      cursor.style.transform = `translate3d(${rendered.x}px, ${rendered.y}px, 0) translate3d(-50%, -50%, 0)`;
      animationFrame = window.requestAnimationFrame(animate);
    };

    const handlePointerDown = () => cursor.classList.add("khenx-cursor-pressed");
    const handlePointerUp = () => cursor.classList.remove("khenx-cursor-pressed");

    root.classList.add("khenx-custom-cursor");
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("scroll", updateHoverState, { passive: true, capture: true });
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      root.classList.remove("khenx-custom-cursor");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("scroll", updateHoverState, true);
      window.cancelAnimationFrame(animationFrame);
      cursor.className = "pointer-events-none fixed left-0 top-0";
      cursor.style.transform = "";
    };
  }, [hasFinePointer]);

  if (!hasFinePointer) return null;

  return (
    <div ref={cursorRef} aria-hidden="true" className="khenx-cursor pointer-events-none fixed left-0 top-0">
      <span className="khenx-cursor-ring" />
      <span className="khenx-cursor-dot" />
      <style>{`
        .khenx-custom-cursor,
        .khenx-custom-cursor * {
          cursor: none !important;
        }

        .khenx-cursor {
          z-index: 2147483647;
          width: 36px;
          height: 36px;
          will-change: transform;
        }

        .khenx-cursor-ring {
          position: absolute;
          inset: 0;
          border: 2px solid var(--khenx-brand-teal-dark);
          border-radius: 9999px;
          background: rgba(0, 201, 167, 0.1);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.9), 0 2px 8px rgba(0, 0, 0, 0.25);
          transition: transform 150ms ease, background-color 150ms ease, opacity 150ms ease;
        }

        .khenx-cursor-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 9px;
          height: 9px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 9999px;
          background: var(--khenx-brand-teal-dark);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
          transform: translate(-50%, -50%);
          transition: opacity 150ms ease;
        }

        .khenx-cursor-hover .khenx-cursor-ring {
          transform: scale(1.4);
          background: rgba(0, 201, 167, 0.2);
        }

        .khenx-cursor-pressed .khenx-cursor-ring {
          transform: scale(0.86);
        }

        .khenx-cursor-input .khenx-cursor-ring {
          width: 2px;
          inset: 0 17px;
          border: 0;
          border-radius: 1px;
          background: var(--khenx-brand-teal-dark);
          box-shadow: none;
        }

        .khenx-cursor-input .khenx-cursor-dot {
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .khenx-cursor-ring,
          .khenx-cursor-dot {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomCursor;
