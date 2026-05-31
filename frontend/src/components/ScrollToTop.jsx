import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to top on route change.
 * Uses "instant" on first mount (avoid animated scroll during hydration),
 * then "smooth" on subsequent navigations — respects prefers-reduced-motion.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = isFirst.current || reducedMotion ? "instant" : "smooth";
    isFirst.current = false;
    window.scrollTo({ top: 0, behavior });
  }, [pathname]);

  return null;
}