"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = "(max-width: 767px)";

/**
 * Returns true when the viewport is mobile-sized. Uses matchMedia so it
 * reacts to live resizing (DevTools mobile-mode toggle, real device
 * rotation, etc).
 *
 * SSR-safe: returns `false` during server render to match desktop-first
 * markup, then updates on the client. Components that branch on this
 * should expect a single re-render right after hydration on mobile
 * devices.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}
