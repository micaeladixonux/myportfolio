"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useIsMobile } from "./useIsMobile";
import { MobileSheet, MobileCloseButton } from "./MobileSheet";

/**
 * Speaking + teaching overlay — Figma nodes 333:2711, 374:4094, 374:4129,
 * 374:4164, 374:4200, 374:4252, 374:4304.
 *
 * Layout: a 7-slide carousel. Each slide shows a hero image of the talk
 * (758×479) with previews of the previous/next talks bleeding off the
 * left/right edges at 30% opacity. Below the hero: title + venue centered.
 * Palm fronds + a tilted postcard sticker sit in the bottom-left corner.
 * Prev/next arrow buttons sit at the vertical centre of the hero, on the
 * visible inner edge of each side preview.
 */

const CARD_W = 1342;
const CARD_H = 781;
const CARD_TOP = 136;

type Talk = {
  id: string;
  title: string;
  venue: string;
  image: string;
};

const TALKS: Talk[] = [
  {
    id: "curating",
    title: "Curating your own AI workflow",
    venue: "ManyHands - London, 2026",
    image: "/v2/talks/01-curating.png",
  },
  {
    id: "building-trust",
    title: "Building trust & encouraging critical thinking in AI",
    venue: "Product Unleashed - London, 2026",
    image: "/v2/talks/02-building-trust.png",
  },
  {
    id: "ux-research",
    title: "UX Research for AI Experiences",
    venue: "Ladies that UX - London, 2025",
    image: "/v2/talks/03-ux-research.png",
  },
  {
    id: "ux-patterns",
    title: "UX for AI Patterns",
    venue: "Northern User Experience - Manchester, 2025",
    image: "/v2/talks/04-ux-patterns.png",
  },
  {
    id: "people-centred",
    title: "User Experience in AI: People-Centred Principles and Practices",
    venue: "Outwitly - Online, 2024",
    image: "/v2/talks/05-people-centred.png",
  },
  {
    id: "ai-career",
    title: "AI, Career and Design",
    venue: "PD Ladies + Brainstation - London, 2024",
    image: "/v2/talks/06-ai-career.png",
  },
  {
    id: "people-centered-future",
    title: "Designing for a people-centered future",
    venue: "Human + AI Symposium - Online, 2024",
    image: "/v2/talks/07-people-centered-future.png",
  },
];

/**
 * Width-only fit scale — leaves at least 89px of horizontal padding on each
 * side so the grey backdrop is always visible, matching Figma's 1520-wide
 * frame with a 1342 card (89px grey margin each side).
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

const AUTO_ADVANCE_MS = 5000;

/**
 * Slot positions for the holistic carousel. Every talk renders as a
 * motion.div positioned at one of these five slots, calculated from its
 * offset from the current talk. When `current` changes, all slides animate
 * to their new slots simultaneously — the centre slides to left, the right
 * preview slides to centre, and a new slide enters from off-right.
 */
const SLOTS = {
  farLeft:  { left:  -591, top: 190, width: 426, height: 346, opacity: 0   },
  left:     { left:  -165, top: 190, width: 426, height: 346, opacity: 0.3 },
  center:   { left:   292, top:  93, width: 758, height: 479, opacity: 1   },
  right:    { left:  1081, top: 190, width: 426, height: 346, opacity: 0.3 },
  farRight: { left:  1507, top: 190, width: 426, height: 346, opacity: 0   },
} as const;

type SlotKey = keyof typeof SLOTS;

function slotForOffset(offset: number): SlotKey {
  if (offset <= -2) return "farLeft";
  if (offset === -1) return "left";
  if (offset === 0) return "center";
  if (offset === 1) return "right";
  return "farRight";
}

/** Signed shortest offset of `target` from `current` in a circular list. */
function shortestOffset(target: number, current: number, total: number) {
  let diff = ((target - current) % total + total) % total;
  if (diff > total / 2) diff -= total;
  return diff;
}

const slideSpring = {
  type: "spring" as const,
  stiffness: 200,
  damping: 32,
  mass: 1,
};

export function SpeakingTeachingOverlay({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const isMobile = useIsMobile();
  const scale = useFitScale();

  const current = TALKS[index];

  function go(dir: 1 | -1) {
    setIndex((i) => (i + dir + TALKS.length) % TALKS.length);
  }

  if (isMobile) {
    return (
      <MobileSpeakingTeaching
        index={index}
        setIndex={setIndex}
        onClose={onClose}
      />
    );
  }

  // Auto-advance every 5s, continuously. Resets on every slide change so a
  // manual arrow click pushes the next auto-advance 5s out from "now"
  // instead of firing immediately after.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setIndex((i) => (i + 1) % TALKS.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      {/* Fixed backdrop — covers viewport, stays put while content scrolls. */}
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
        {/* Flex centring with top/bottom padding. */}
        <div
          className="flex justify-center"
          style={{
            paddingTop: CARD_TOP,
            paddingBottom: 40,
            minHeight: "100%",
          }}
        >
          {/* Layout box reserves the scaled visual footprint. */}
          <div
            style={{
              width: CARD_W * scale,
              height: CARD_H * scale,
            }}
          >
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
          aria-label="speaking and teaching"
          onClick={(e) => e.stopPropagation()}
          className="relative w-full h-full"
          style={{ overflow: "hidden", borderRadius: 20 }}
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

          {/* Holistic carousel — every talk renders at its calculated slot.
              When `index` changes, all slides animate together: centre
              moves to left, right moves to centre, far-right moves to
              right. The off-screen "farLeft / farRight" slots feed slides
              in and out without unmount jitter. */}
          {TALKS.map((talk, i) => {
            const offset = shortestOffset(i, index, TALKS.length);
            const slot = SLOTS[slotForOffset(offset)];
            const isCenter = offset === 0;
            return (
              <motion.div
                key={talk.id}
                className="absolute"
                initial={false}
                animate={{
                  left: slot.left,
                  top: slot.top,
                  width: slot.width,
                  height: slot.height,
                  opacity: slot.opacity,
                }}
                transition={slideSpring}
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  zIndex: isCenter ? 3 : 2,
                  pointerEvents: isCenter ? "auto" : "none",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={talk.image}
                  alt={talk.title}
                  className="absolute inset-0 w-full h-full"
                  style={{ objectFit: "cover" }}
                />
              </motion.div>
            );
          })}

          {/* Title + venue — static wrapper handles horizontal centering so
              framer's `y` animation on the inner motion.div doesn't clobber
              the translateX. */}
          <div
            className="absolute"
            style={{
              left: (1342 - 569) / 2,
              top: 590,
              width: 569,
              color: "#636363",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              letterSpacing: "-1px",
              zIndex: 4,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${current.id}`}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <p
                  className="m-0"
                  style={{
                    fontWeight: 600,
                    fontSize: 20,
                    lineHeight: "28px",
                  }}
                >
                  {current.title}
                </p>
                <p
                  className="m-0"
                  style={{
                    fontWeight: 500,
                    fontSize: 16,
                    lineHeight: "28px",
                    marginTop: 6,
                  }}
                >
                  {current.venue}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Palm fronds — bottom-left. Matches Figma node 372:3995 crop. */}
          <div
            className="absolute overflow-hidden pointer-events-none"
            style={{ left: 0, top: 363, width: 261, height: 418, zIndex: 5 }}
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

          {/* Postcards sticker — rotated 18.23°. Matches Figma node 372:3993.
              The 204×276 crop window MUST be position:relative so the inner
              img's left/width percentages resolve against IT, not the outer
              wrapper. Without that, you'd see the full uncropped image. */}
          <div
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              left: 121,
              top: 438,
              width: 280.119,
              height: 325.974,
              zIndex: 6,
            }}
          >
            <div style={{ transform: "rotate(18.23deg)" }}>
              <div
                className="overflow-hidden"
                style={{ position: "relative", width: 204, height: 276 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/v2/talks/postcards.png"
                  alt=""
                  className="absolute max-w-none"
                  style={{
                    width: "521.12%",
                    height: "214.65%",
                    left: "-147.46%",
                    top: "-7.14%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Nav arrows */}
          <NavArrow direction="left" onClick={() => go(-1)} />
          <NavArrow direction="right" onClick={() => go(1)} />

          {/* Close button */}
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

function NavArrow({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  // Centre vertically with the hero (hero centre y = 93 + 479/2 = 332.5)
  const top = 332 - 22; // arrow is 44px tall
  const left = direction === "left" ? 24 : CARD_W - 24 - 44;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "previous talk" : "next talk"}
      className="absolute grid place-items-center cursor-pointer"
      style={{
        left,
        top,
        width: 44,
        height: 44,
        borderRadius: 22,
        background: "#fffdf6",
        border: "1px solid #636363",
        color: "#636363",
        zIndex: 8,
      }}
      whileHover={{
        scale: 1.08,
        background: "#636363",
        color: "#fffdf6",
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        style={{ display: "block" }}
      >
        {direction === "left" ? (
          <path
            d="M9 2L4 7l5 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M5 2l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </motion.button>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Mobile Speaking + Teaching — bottom sheet with a true swipe carousel.
   Each talk is full-bleed inside the sheet. Horizontal drag moves
   between talks (with momentum). Auto-advances every 5s. Pagination
   dots show position.
   ────────────────────────────────────────────────────────────────── */

function MobileSpeakingTeaching({
  index,
  setIndex,
  onClose,
}: {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}) {
  const current = TALKS[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Auto-advance — same 5s rule as desktop, resets on every index change.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setIndex((i) => (i + 1) % TALKS.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [index, setIndex]);

  function handleSwipeEnd(_: unknown, info: PanInfo) {
    // Threshold: 60px drag OR a 400px/s flick advances one slide.
    if (info.offset.x < -60 || info.velocity.x < -400) {
      setIndex((i) => (i + 1) % TALKS.length);
    } else if (info.offset.x > 60 || info.velocity.x > 400) {
      setIndex((i) => (i - 1 + TALKS.length) % TALKS.length);
    }
  }

  return (
    <MobileSheet onClose={onClose} ariaLabel="speaking and teaching">
      <div style={{ position: "relative", padding: "8px 0 32px" }}>
        <MobileCloseButton onClose={onClose} top={0} right={20} />

        <div style={{ padding: "0 20px", marginBottom: 20 }}>
          <h2
            className="m-0"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: "-0.8px",
              color: "#1a1a1a",
              marginTop: 8,
            }}
          >
            speaking + teaching
          </h2>
        </div>

        {/* Swipe carousel — full-bleed image edge-to-edge */}
        <motion.div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: "4 / 3", touchAction: "pan-y" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleSwipeEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              className="absolute inset-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.image}
                alt={current.title}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ objectFit: "cover" }}
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Pagination dots */}
        <div
          className="flex items-center justify-center"
          style={{ gap: 7, marginTop: 16, marginBottom: 16 }}
        >
          {TALKS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`go to talk ${i + 1}`}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: i === index ? "#636363" : "#d6d2c4",
                border: "none",
                padding: 0,
                transition: "background 0.2s ease",
              }}
            />
          ))}
        </div>

        {/* Title + venue */}
        <div style={{ padding: "0 20px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${current.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
              className="text-center"
              style={{ color: "#636363" }}
            >
              <p
                className="m-0"
                style={{
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 18,
                  lineHeight: "24px",
                  letterSpacing: "-0.5px",
                }}
              >
                {current.title}
              </p>
              <p
                className="m-0"
                style={{
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: "22px",
                  letterSpacing: "-0.3px",
                  marginTop: 6,
                  color: "#8c8c8c",
                }}
              >
                {current.venue}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MobileSheet>
  );
}
