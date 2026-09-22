import { useEffect, useRef, useState } from "react";

/**
 * Reveals an element the first time it scrolls into view. Returns
 * immediately as "shown" where IntersectionObserver isn't available or the
 * visitor has asked for reduced motion, so content is never gated on an
 * animation that will not run.
 */
export function useReveal({ threshold = 0.15, rootMargin = "0px 0px -60px 0px" } = {}) {
  const ref = useRef(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [shown, setShown] = useState(prefersReduced || typeof IntersectionObserver === "undefined");

  useEffect(() => {
    if (shown || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [shown, threshold, rootMargin]);

  return [ref, shown];
}
