"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "./useIsMobile";
import { MobileSheet, MobileCloseButton } from "./MobileSheet";

/**
 * About overlay — Figma node 280:2169.
 *
 * Layout: the page header (signature + tagline) and the thumbnail row remain
 * visible. A grey 50% backdrop dims everything underneath. The card is pinned
 * at top: 136 (same Y as the start of the hero) and matches Figma's 1342×781
 * frame exactly. Card scales down from its top edge on smaller viewports.
 */

const CARD_W = 1342;
const CARD_H = 781;
const CARD_TOP = 136;

type StickyNote = {
  bg: string;
  cx: number;
  cy: number;
  rotate: number;
  /** Rotation applied on hover — gives the note a "kicked" feel. */
  hoverRotate: number;
  /** Translate on hover so notes feel like they're nudging on the corkboard. */
  hoverDx: number;
  hoverDy: number;
  lines: string[];
};

const NOTES: StickyNote[] = [
  {
    bg: "#f4ff91",
    cx: 50 + 188 / 2,
    cy: 74 + 164 / 2,
    rotate: 0.58,
    hoverRotate: -7,
    hoverDx: -6,
    hoverDy: -10,
    lines: [
      "lived in lisbon for",
      "3 years before",
      "moving to london",
      "",
      "man I do miss the",
      "weather!",
    ],
  },
  {
    bg: "#98ff68",
    cx: 154 + 213.81 / 2,
    cy: 117 + 194.38 / 2,
    rotate: 10.08,
    hoverRotate: 18,
    hoverDx: 4,
    hoverDy: -8,
    lines: [
      "was an exhibition",
      "designer before",
      "becoming an",
      "AI UX person!",
    ],
  },
  {
    bg: "#ffb6e9",
    cx: 294 + 191.55 / 2,
    cy: 204 + 168.08 / 2,
    rotate: 1.26,
    hoverRotate: -5,
    hoverDx: 8,
    hoverDy: -6,
    lines: [
      "taught over 300 people",
      "how to design AI and how",
      "to use AI as a designer in",
      "the past 4 years",
    ],
  },
];

/**
 * Width-only fit scale — leaves ≥89px of horizontal padding so the grey
 * backdrop is always visible on each side, matching Figma's 1520-frame ↔
 * 1342-card relationship. Identical to Projects + Speaking + Teaching so
 * every overlay renders at the same visual width on every viewport.
 */
function useFitScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    function compute() {
      // Cap at 0.85 so the home page (header, thumbs, hero edges) stays
      // visibly peeking around the overlay. 320 = 2 × 160 minimum side gap.
      const s = Math.min(0.85, (window.innerWidth - 320) / CARD_W);
      setScale(Number.isFinite(s) && s > 0 ? s : 1);
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return scale;
}

export function AboutOverlay({ onClose }: { onClose: () => void }) {
  const isMobile = useIsMobile();
  const scale = useFitScale();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (isMobile) return <MobileAbout onClose={onClose} />;

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

      {/* Scroll container — sibling of the backdrop. */}
      <div
        className="absolute inset-0"
        style={{ overflowY: "auto", overflowX: "hidden" }}
      >
        <div
          className="flex justify-center"
          style={{ paddingTop: CARD_TOP, paddingBottom: 40, minHeight: "100%" }}
        >
          {/* Layout box reserves the scaled visual footprint. */}
          <div style={{ width: CARD_W * scale, height: CARD_H * scale }}>
            {/* Card at native 1342×781, visually scaled from top-left. */}
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
          aria-label="about"
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

        {/* Sticky notes — drag-and-droppable around their home positions,
            with a wiggle on hover. */}
        {NOTES.map((n, i) => (
          <motion.div
            key={i}
            className="absolute cursor-grab active:cursor-grabbing"
            style={{
              // Top-left coords (cx,cy are the note's *centre*, note is 188×164)
              left: n.cx - 94,
              top: n.cy - 82,
              width: 188,
              height: 164,
              background: n.bg,
              borderRadius: 4,
              padding: "20px 24px",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: 500,
              fontSize: 10.629,
              lineHeight: "18.601px",
              letterSpacing: "-0.6643px",
              color: "#000",
              zIndex: 5,
              boxShadow:
                "0 6px 14px -6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.08)",
              touchAction: "none",
            }}
            initial={{ opacity: 0, rotate: n.rotate * 0.4, scale: 0.95 }}
            animate={{ opacity: 1, rotate: n.rotate, scale: 1, x: 0, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 22,
              delay: 0.18 + i * 0.07,
            }}
            whileHover={{
              rotate: n.hoverRotate,
              scale: 1.06,
              boxShadow:
                "0 18px 28px -10px rgba(0,0,0,0.28), 0 4px 8px rgba(0,0,0,0.10)",
              zIndex: 6,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 16,
              },
            }}
            whileDrag={{
              scale: 1.08,
              rotate: n.hoverRotate * 1.4,
              boxShadow:
                "0 22px 36px -12px rgba(0,0,0,0.32), 0 6px 12px rgba(0,0,0,0.12)",
              zIndex: 100,
              cursor: "grabbing",
            }}
            drag
            dragConstraints={{ left: -180, right: 180, top: -120, bottom: 120 }}
            dragElastic={0.18}
            dragMomentum={false}
          >
            {n.lines.map((l, j) => (
              <div key={j}>{l || " "}</div>
            ))}
          </motion.div>
        ))}

        {/* Travel stickers (palm fronds) — sits behind portrait */}
        <motion.div
          className="absolute overflow-hidden pointer-events-none"
          style={{ left: 0, top: 363, width: 261, height: 418, zIndex: 1 }}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
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
        </motion.div>

        {/* Portrait */}
        <motion.div
          className="absolute overflow-hidden pointer-events-none"
          style={{
            left: 104,
            top: 418,
            width: 221,
            height: 338,
            borderRadius: 100,
            zIndex: 2,
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v2/about-portrait.png"
            alt="Portrait of Micaela"
            className="absolute max-w-none"
            style={{
              width: "353.02%",
              aspectRatio: "2890 / 2040",
              left: "-119.93%",
              top: "0%",
            }}
          />
        </motion.div>

        {/* Right column — bio copy */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p
            className="absolute m-0"
            style={{
              left: 620,
              top: 156,
              width: 530,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: 500,
              fontSize: 20,
              lineHeight: "28px",
              letterSpacing: "-1px",
              color: "#636363",
            }}
          >
            hey, I&rsquo;m micaela dixon. a senior/staff ai product designer
            based in london. you can think of me as a designer with the ai
            knowledge of an engineer and the business growth mindset of a pm.
            now add the empathy, and you have me!
          </p>

          <div
            className="absolute"
            style={{
              left: 620,
              top: 288,
              width: 530,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: 500,
              fontSize: 16,
              lineHeight: "28px",
              letterSpacing: "-1px",
              color: "#8c8c8c",
            }}
          >
            <p className="m-0">
              beyond my professional career which you can easily find on
              Linkedin, I love karaoke, vibe coding, surfing (omg, surfing is
              everything to me!), travelling the world and going for drinks
              with people I love.
            </p>
            <p className="m-0">&nbsp;</p>
            <p className="m-0">
              I do spend a lot of time reading about machines from a
              philosophical perspective - like way back then when we were
              asking ourselves &lsquo;could a machine think?&rsquo; &lsquo;if a
              machine thinks, does that mean it is intelligent?&rsquo;
            </p>
            <p className="m-0">&nbsp;</p>
            <p className="m-0">
              I understand technology as something that can help us get even
              closer as human beings, so I&rsquo;m always trying to find ways
              to build bridges, not disparities with the tools we have access
              to (and we build as well!)
            </p>
          </div>
        </motion.div>

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
            zIndex: 10,
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
   Mobile About — bottom sheet, vertical reflow.
   ────────────────────────────────────────────────────────────────── */

function MobileAbout({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <MobileSheet onClose={onClose} ariaLabel="about">
      <div style={{ position: "relative", padding: "8px 20px 40px" }}>
        <MobileCloseButton onClose={onClose} top={0} right={20} />

        {/* Portrait + palm fronds layered together */}
        <div
          className="relative w-full"
          style={{ height: 320, marginTop: 16, marginBottom: 20 }}
        >
          {/* Palm fronds — bottom-left, sized down for mobile */}
          <div
            className="absolute overflow-hidden pointer-events-none"
            style={{ left: -16, bottom: 0, width: 200, height: 320 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/v2/about-stickers.png"
              alt=""
              className="absolute max-w-none"
              style={{
                width: "310.77%",
                height: "259.9%",
                left: "-20.93%",
                top: "-147.34%",
              }}
            />
          </div>

          {/* Portrait */}
          <div
            className="absolute overflow-hidden"
            style={{
              right: 0,
              top: 0,
              width: 200,
              height: 300,
              borderRadius: 100,
              zIndex: 2,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/v2/about-portrait.png"
              alt="Portrait of Micaela"
              className="absolute max-w-none"
              style={{
                width: "353.02%",
                aspectRatio: "2890 / 2040",
                left: "-119.93%",
                top: "0%",
              }}
            />
          </div>
        </div>

        {/* Sticky notes — horizontal scroll strip, native-feeling
            momentum scroll on iOS */}
        <div
          className="relative w-full"
          style={{
            marginBottom: 28,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div
            className="flex"
            style={{
              gap: 16,
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 14,
              paddingBottom: 14,
              width: "max-content",
            }}
          >
            {NOTES.map((n, i) => (
              <div
                key={i}
                style={{
                  width: 188,
                  height: 164,
                  background: n.bg,
                  borderRadius: 4,
                  transform: `rotate(${n.rotate}deg)`,
                  padding: "20px 24px",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 10.629,
                  lineHeight: "18.601px",
                  letterSpacing: "-0.6643px",
                  color: "#000",
                  boxShadow:
                    "0 6px 14px -6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.08)",
                  flexShrink: 0,
                }}
              >
                {n.lines.map((l, j) => (
                  <div key={j}>{l || " "}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Lead paragraph */}
        <p
          className="m-0"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            fontSize: 18,
            lineHeight: "26px",
            letterSpacing: "-0.6px",
            color: "#636363",
            marginBottom: 20,
          }}
        >
          hey, I&rsquo;m micaela dixon. a senior/staff ai product designer
          based in london. you can think of me as a designer with the ai
          knowledge of an engineer and the business growth mindset of a pm.
          now add the empathy, and you have me!
        </p>

        {/* Body paragraphs */}
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            fontSize: 15,
            lineHeight: "24px",
            letterSpacing: "-0.4px",
            color: "#8c8c8c",
          }}
        >
          <p className="m-0" style={{ marginBottom: 16 }}>
            beyond my professional career which you can easily find on
            Linkedin, I love karaoke, vibe coding, surfing (omg, surfing is
            everything to me!), travelling the world and going for drinks
            with people I love.
          </p>
          <p className="m-0" style={{ marginBottom: 16 }}>
            I do spend a lot of time reading about machines from a
            philosophical perspective - like way back then when we were
            asking ourselves &lsquo;could a machine think?&rsquo; &lsquo;if a
            machine thinks, does that mean it is intelligent?&rsquo;
          </p>
          <p className="m-0">
            I understand technology as something that can help us get even
            closer as human beings, so I&rsquo;m always trying to find ways
            to build bridges, not disparities with the tools we have access
            to (and we build as well!)
          </p>
        </div>
      </div>
    </MobileSheet>
  );
}
