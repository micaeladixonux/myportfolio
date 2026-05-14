"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "./useIsMobile";
import { MobileSheet, MobileCloseButton } from "./MobileSheet";

/**
 * Vibe-coding overlay — Figma node 333:2679.
 *
 * Layout: the page header (signature + tagline) and the thumbnail row remain
 * visible. A grey 50% backdrop dims everything underneath. The card is pinned
 * at top: 136 (the same Y as the start of the hero) and matches Figma's
 * 1342×781 frame exactly. The card scales down from its top edge on smaller
 * viewports so its position relative to the page header is preserved.
 */

const CARD_W = 1342;
const CARD_H = 781;
const CARD_TOP = 136; // matches Figma's card top — aligned with hero start

type MediaSlot = {
  id: string;
  videoSrc?: string;
  poster?: string;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * Drop your videos into /public/v2/vibe/ using the filenames below and
 * they'll appear automatically (no code changes needed). The component
 * gracefully falls back to a label placeholder when a file is missing.
 *
 *   polaroid          → /v2/vibe/polaroid.mp4
 *   the twilight zone → /v2/vibe/twilight-zone.mp4
 *   bubble hands      → /v2/vibe/bubble-hands.mp4
 *   AR fitness        → /v2/vibe/ar-fitness.mp4
 *   AI growth designer→ /v2/vibe/growth-designer.mp4
 */
const SLOTS: MediaSlot[] = [
  { id: "polaroid",        label: "polaroid",           videoSrc: "/v2/vibe/polaroid.mp4",         left: 37,  top: 18,  width: 407, height: 345 },
  { id: "twilight-zone",   label: "the twilight zone",  videoSrc: "/v2/vibe/twilight-zone.mp4",    left: 460, top: 18,  width: 500, height: 345 },
  { id: "bubble-hands",    label: "bubble hands",       videoSrc: "/v2/vibe/bubble-hands.mp4",     left: 976, top: 10,  width: 304, height: 345 },
  { id: "ar-fitness",      label: "AR fitness",         videoSrc: "/v2/vibe/ar-fitness.mp4",       left: 261, top: 377, width: 580, height: 374 },
  { id: "growth-designer", label: "AI growth designer", videoSrc: "/v2/vibe/growth-designer.mp4",  left: 856, top: 377, width: 424, height: 374 },
];

/**
 * Width-only fit scale — identical to About, Projects, Speaking + Teaching
 * so every overlay renders at the same visual width on every viewport.
 */
function useFitScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    function compute() {
      // Cap at 0.85 so the home page peeks around the overlay edges.
      const s = Math.min(0.85, (window.innerWidth - 320) / CARD_W);
      setScale(Number.isFinite(s) && s > 0 ? s : 1);
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return scale;
}

export function VibeCodingOverlay({ onClose }: { onClose: () => void }) {
  const isMobile = useIsMobile();
  const scale = useFitScale();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (isMobile) return <MobileVibeCoding onClose={onClose} />;

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      {/* Fixed backdrop — covers the viewport, stays put while content scrolls */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(217, 217, 217, 0.5)" }}
      />

      {/* Scroll container */}
      <div
        className="absolute inset-0"
        style={{ overflowY: "auto", overflowX: "hidden" }}
      >
        <div
          className="flex justify-center"
          style={{ paddingTop: CARD_TOP, paddingBottom: 40, minHeight: "100%" }}
        >
          <div style={{ width: CARD_W * scale, height: CARD_H * scale }}>
            <div
              style={{
                width: CARD_W,
                height: CARD_H,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="vibe coding"
          onClick={(e) => e.stopPropagation()}
          className="relative w-full h-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
        >
        {/* Card background */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "#fffdf6", borderRadius: 10 }}
        />

        {/* Travel stickers — bottom-left palm fronds */}
        <div
          className="absolute overflow-hidden pointer-events-none"
          style={{ left: 0, top: 363, width: 261, height: 418, zIndex: 1 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v2/about-stickers.png"
            alt=""
            className="absolute max-w-none"
            style={{
              width: "310.77%",
              aspectRatio: "3058 / 4096",
              left: "-20.93%",
              top: "-147.34%",
            }}
          />
        </div>

        {/* Media grid */}
        {SLOTS.map((slot, i) => (
          <motion.div
            key={slot.id}
            className="absolute overflow-hidden cursor-pointer"
            style={{
              left: slot.left,
              top: slot.top,
              width: slot.width,
              height: slot.height,
              borderRadius: 20,
              background: "#ece7d8",
              zIndex: 2,
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.15 + i * 0.05,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            whileHover={{
              scale: 1.015,
              boxShadow: "0 18px 32px -16px rgba(0,0,0,0.22)",
            }}
          >
            {slot.videoSrc ? (
              <video
                src={slot.videoSrc}
                poster={slot.poster}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: "cover" }}
              />
            ) : slot.poster ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={slot.poster}
                alt={slot.label}
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                className="absolute inset-0 grid place-items-center"
                style={{
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#a8a08c",
                  letterSpacing: "-0.5px",
                }}
              >
                {slot.label}
              </div>
            )}
          </motion.div>
        ))}

        {/* Close button (top-right) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="close"
          className="absolute grid place-items-center cursor-pointer"
          style={{
            left: 1296,
            top: 10,
            width: 32,
            height: 32,
            borderRadius: 16,
            background: "transparent",
            border: "1px solid #636363",
            color: "#636363",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 16,
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: "-1px",
            transition: "background 0.15s ease",
            zIndex: 3,
          }}
        >
          x
        </button>
        </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Mobile Vibe Coding — bottom sheet, 1-column scroll of media slots.
   ────────────────────────────────────────────────────────────────── */

function MobileVibeCoding({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <MobileSheet onClose={onClose} ariaLabel="vibe coding">
      <div style={{ position: "relative", padding: "8px 20px 40px" }}>
        <MobileCloseButton onClose={onClose} top={0} right={20} />

        <h2
          className="m-0"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: "-0.8px",
            color: "#1a1a1a",
            marginTop: 8,
            marginBottom: 20,
          }}
        >
          vibe coding
        </h2>

        {/* 1-column stack of media slots — each card uses a 16:10 aspect
            for consistent rhythm on phones. */}
        <ul
          className="flex flex-col list-none p-0 m-0"
          style={{ gap: 12 }}
        >
          {SLOTS.map((slot) => (
            <li
              key={slot.id}
              className="relative overflow-hidden w-full"
              style={{
                aspectRatio: "16 / 10",
                borderRadius: 14,
                background: "#ece7d8",
              }}
            >
              {slot.videoSrc ? (
                <video
                  src={slot.videoSrc}
                  poster={slot.poster}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full"
                  style={{ objectFit: "cover" }}
                />
              ) : slot.poster ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={slot.poster}
                  alt={slot.label}
                  className="absolute inset-0 w-full h-full"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  className="absolute inset-0 grid place-items-center"
                  style={{
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#a8a08c",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {slot.label}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </MobileSheet>
  );
}
