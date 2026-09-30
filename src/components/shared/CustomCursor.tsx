import { useEffect, useRef, useState } from "react";

const FINE_POINTER_QUERY = "(pointer: fine)";
const INTERACTIVE_SELECTOR =
  "button, a, [role='button'], [data-cursor-hover], input[type='button'], input[type='submit'], tr";
const TEXT_INPUT_SELECTOR =
  "input:not([type='button']):not([type='submit']):not([type='checkbox']):not([type='radio']), textarea, select, [contenteditable='true']";

const CustomCursor = () => {
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const midRef = useRef<HTMLSpanElement>(null);
  const outerRef = useRef<HTMLSpanElement>(null);

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
    const dot = dotRef.current;
    const mid = midRef.current;
    const outer = outerRef.current;
    if (!cursor || !dot || !mid || !outer) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: -100, y: -100 };
    const midPos = { x: -100, y: -100 };
    const outerPos = { x: -100, y: -100 };
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
        midPos.x = target.x;
        midPos.y = target.y;
        outerPos.x = target.x;
        outerPos.y = target.y;
      } else {
        midPos.x += (target.x - midPos.x) * 0.25;
        midPos.y += (target.y - midPos.y) * 0.25;
        outerPos.x += (target.x - outerPos.x) * 0.12;
        outerPos.y += (target.y - outerPos.y) * 0.12;
      }

      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate3d(-50%, -50%, 0)`;
      mid.style.transform = `translate3d(${midPos.x}px, ${midPos.y}px, 0) translate3d(-50%, -50%, 0)`;
      outer.style.transform = `translate3d(${outerPos.x}px, ${outerPos.y}px, 0) translate3d(-50%, -50%, 0)`;

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
      cursor.className = "khenx-cursor pointer-events-none fixed left-0 top-0";
      dot.style.transform = "";
      mid.style.transform = "";
      outer.style.transform = "";
    };
  }, [hasFinePointer]);

  if (!hasFinePointer) return null;

  return (
    <div ref={cursorRef} aria-hidden="true" className="khenx-cursor pointer-events-none fixed left-0 top-0">
      <span ref={outerRef} className="khenx-cursor-outer" />
      <span ref={midRef} className="khenx-cursor-mid" />
      <span ref={dotRef} className="khenx-cursor-dot" />
      <span className="khenx-cursor-pulse" />
      <span className="khenx-cursor-bar" />
      <style>{`
        .khenx-custom-cursor,
        .khenx-custom-cursor * {
          cursor: none !important;
        }

        .khenx-cursor {
          position: fixed;
          left: 0;
          top: 0;
          width: 0;
          height: 0;
          z-index: 2147483647;
          pointer-events: none;
          will-change: transform;
        }

        .khenx-cursor-dot,
        .khenx-cursor-mid,
        .khenx-cursor-outer,
        .khenx-cursor-pulse,
        .khenx-cursor-bar {
          position: absolute;
          left: 0;
          top: 0;
          transform: translate3d(-50%, -50%, 0);
          pointer-events: none;
          transition: transform 200ms ease, opacity 200ms ease, background-color 200ms ease, box-shadow 200ms ease;
        }

        .khenx-cursor-dot {
          width: var(--cursor-dot-size);
          height: var(--cursor-dot-size);
          border-radius: 999px;
          background: var(--cursor-color);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 10px rgba(0, 201, 167, 0.7);
          z-index: 3;
        }

        .khenx-cursor-mid {
          width: var(--cursor-mid-size);
          height: var(--cursor-mid-size);
          border-radius: 999px;
          background: color-mix(in srgb, var(--cursor-color) 22%, transparent);
          box-shadow: 0 0 14px rgba(0, 201, 167, 0.16);
          z-index: 2;
        }

        .khenx-cursor-outer {
          width: var(--cursor-outer-size);
          height: var(--cursor-outer-size);
          border-radius: 999px;
          background: color-mix(in srgb, var(--cursor-color) 10%, transparent);
          box-shadow: 0 0 20px rgba(0, 201, 167, 0.12);
          z-index: 1;
        }

        .khenx-cursor-pulse {
          width: var(--cursor-outer-size);
          height: var(--cursor-outer-size);
          border-radius: 999px;
          background: color-mix(in srgb, var(--cursor-color) 14%, transparent);
          opacity: 0;
          z-index: 0;
        }

        .khenx-cursor-bar {
          width: 2px;
          height: 24px;
          border-radius: 999px;
          background: var(--cursor-color);
          opacity: 0;
          box-shadow: 0 0 8px rgba(0, 201, 167, 0.32);
          z-index: 4;
        }

        .khenx-cursor-hover .khenx-cursor-mid,
        .khenx-cursor-hover .khenx-cursor-outer {
          transform: scale(1.3);
        }

        .khenx-cursor-hover .khenx-cursor-dot {
          transform: scale(0.85);
        }

        .khenx-cursor-pressed .khenx-cursor-mid,
        .khenx-cursor-pressed .khenx-cursor-outer {
          transform: scale(0.9);
        }

        .khenx-cursor-pressed .khenx-cursor-pulse {
          animation: khenx-ripple-pulse 500ms ease-out forwards;
        }

        .khenx-cursor-input .khenx-cursor-mid,
        .khenx-cursor-input .khenx-cursor-outer,
        .khenx-cursor-input .khenx-cursor-pulse {
          opacity: 0;
        }

        .khenx-cursor-input .khenx-cursor-dot {
          opacity: 0;
        }

        .khenx-cursor-input .khenx-cursor-bar {
          opacity: 1;
        }

        @keyframes khenx-ripple-pulse {
          0% {
            opacity: 0.9;
            transform: scale(0.75);
          }
          100% {
            opacity: 0;
            transform: scale(1.7);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .khenx-cursor-dot,
          .khenx-cursor-mid,
          .khenx-cursor-outer,
          .khenx-cursor-pulse,
          .khenx-cursor-bar {
            transition: none;
          }

          .khenx-cursor-pressed .khenx-cursor-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomCursor;
