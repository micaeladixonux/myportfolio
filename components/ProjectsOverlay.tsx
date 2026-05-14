"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "./useIsMobile";
import { MobileSheet, MobileCloseButton } from "./MobileSheet";

/**
 * Projects overlay — 2 case studies in a pageable container.
 *
 *  Project 0 — Picsart (Figma 367:3655, 369:3862, 370:3907, 375:4340).
 *    A 1342×785 card with 4 tabs (Iris, Swipe, Shared Albums, Flows).
 *
 *  Project 1 — Carbon Instincts (Figma 367:3581, 367:3759, 367:3804).
 *    A 1342×1427 card — too tall to fit a typical viewport, so the overlay
 *    itself scrolls vertically. 3 tabs (Rapid AI Prototyping, Conversation
 *    & Voice UX, Explainability & Transparency UI).
 *
 * Both share the top pagination dots + a right arrow that pages between
 * projects.
 */

const CARD_W = 1342;
const CARD_TOP = 136;
// Rule: every overlay (about, projects, vibe coding, speaking + teaching)
// uses the same 1342×781 card. Carbon Instincts is the only exception.
const PICSART_H = 781;
const CARBON_H = 1427;

export function ProjectsOverlay({ onClose }: { onClose: () => void }) {
  const [projectIdx, setProjectIdx] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const cardHeight = projectIdx === 0 ? PICSART_H : CARBON_H;
  // Width-only scale so the card stays the same width across projects.
  // When the card is taller than the viewport, the scroll container handles
  // overflow without ever resizing the card.
  const scale = useFitScale();

  function nextProject() {
    setProjectIdx((i) => (i + 1) % 2);
  }

  if (isMobile) {
    return (
      <MobileProjects
        projectIdx={projectIdx}
        setProjectIdx={setProjectIdx}
        onClose={onClose}
      />
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      {/* Fixed backdrop — covers the viewport at all times. Does NOT scroll
          with the card, so the home page header/thumbs underneath stay
          dimmed-but-visible while the user scrolls a tall project. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(217, 217, 217, 0.5)" }}
      />

      {/* Scroll container — sibling of the backdrop. Owns the vertical
          scroll, so card content can be taller than the viewport. */}
      <div
        className="absolute inset-0"
        style={{ overflowY: "auto", overflowX: "hidden" }}
      >
        {/* Flex centring with top/bottom padding so the card has breathing
            room above/below in the scroll. */}
        <div
          className="flex justify-center"
          style={{
            paddingTop: CARD_TOP,
            paddingBottom: 40,
            minHeight: "100%",
          }}
        >
          {/* Layout box reserves the scaled visual footprint so siblings
              wrap correctly. */}
          <div
            style={{
              width: CARD_W * scale,
              height: cardHeight * scale,
            }}
          >
            {/* The card itself at native 1342×{h}px, visually scaled. */}
            <div
              style={{
                width: CARD_W,
                height: cardHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
        {/* Card */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="projects"
          onClick={(e) => e.stopPropagation()}
          className="relative w-full h-full"
          style={{ borderRadius: 20, overflow: "hidden" }}
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

          {/* Carousel-style project nav. On Picsart (project 0) shows a
              forward arrow on the middle-right; on Carbon Instincts
              (project 1) shows a back arrow on the middle-left. Same
              click handler — it cycles between the two projects. */}
          <AnimatePresence mode="wait" initial={false}>
            <ProjectNavArrow
              key={`nav-${projectIdx}`}
              projectIdx={projectIdx}
              onClick={nextProject}
            />
          </AnimatePresence>

          {/* Per-project content — proper slide: outgoing project slides
              off-left, incoming slides in from the right (full card width
              so it feels like a real page change, not a cross-fade). */}
          <AnimatePresence mode="popLayout" initial={false}>
            {projectIdx === 0 ? (
              <motion.div
                key="picsart"
                className="absolute inset-0"
                initial={{ x: CARD_W, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -CARD_W, opacity: 0 }}
                transition={{
                  x: { type: "spring", stiffness: 200, damping: 32, mass: 1 },
                  opacity: { duration: 0.3 },
                }}
              >
                <PicsartProject />
              </motion.div>
            ) : (
              <motion.div
                key="carbon"
                className="absolute inset-0"
                initial={{ x: CARD_W, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -CARD_W, opacity: 0 }}
                transition={{
                  x: { type: "spring", stiffness: 200, damping: 32, mass: 1 },
                  opacity: { duration: 0.3 },
                }}
              >
                <CarbonInstinctsProject />
              </motion.div>
            )}
          </AnimatePresence>

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
              zIndex: 20,
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

/**
 * Width-only fit scale — leaves at least 89px of horizontal padding so the
 * grey backdrop is always clearly visible on either side, matching Figma's
 * 1520-wide frame with a 1342 card. Returns the same scale for every
 * project so the card width never changes when switching projects.
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

/**
 * Carousel-style nav button. On project 0 (Picsart): forward arrow on the
 * middle-right edge of the card. On project 1 (Carbon Instincts): back
 * arrow on the middle-left edge. Same click handler — toggles between
 * the two projects. Vertically centred on the top viewport-visible
 * region of the card (works for both Picsart's 781h and Carbon's 1427h,
 * because the user sees the top portion first).
 */
function ProjectNavArrow({
  projectIdx,
  onClick,
}: {
  projectIdx: number;
  onClick: () => void;
}) {
  const isBack = projectIdx === 1;
  const SIZE = 48;
  // Vertically centred on the top section common to both projects
  // (Picsart phone mockup top:101–563; Carbon hero top:146–567).
  const TOP = 340 - SIZE / 2;
  const EDGE = 18;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={isBack ? "back to previous project" : "next project"}
      className="absolute grid place-items-center cursor-pointer"
      style={{
        top: TOP,
        ...(isBack ? { left: EDGE } : { right: EDGE }),
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        background: "#fffdf6",
        border: "1px solid #636363",
        color: "#636363",
        boxShadow: "0 6px 16px -8px rgba(0,0,0,0.2)",
        zIndex: 20,
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      whileHover={{
        scale: 1.08,
        background: "#636363",
        color: "#fffdf6",
      }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
        {isBack ? (
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
   Project 0 — Picsart
   ────────────────────────────────────────────────────────────────── */

type PicsartTab = {
  id: string;
  label: string;
  media?: {
    /** Path to a video. When present, renders an autoplaying loop. */
    videoSrc?: string;
    /** Path to a still image. Used as the video poster, or as a fallback
     *  when no videoSrc is supplied. */
    src?: string;
    /** Wraps the video in a phone bezel + dynamic-island detail. Use for
     *  mobile-app demos (Iris, Shared Albums). Leave off for web demos
     *  (Flows) or interactive captures (Swipe). */
    phoneFrame?: boolean;
    left: number;
    top: number;
    width: number;
    height: number;
    borderRadius?: number;
  };
  note: {
    bg: string;
    left: number;
    top: number;
    outerW: number;
    outerH: number;
    width: number;
    height: number;
    rotate: number;
    text: React.ReactNode;
  };
};

const PICSART_TABS: PicsartTab[] = [
  {
    id: "iris",
    label: "Iris",
    media: {
      videoSrc: "/v2/projects/iris.mp4",
      src: "/v2/projects/iris-phone.png", // still fallback / poster
      phoneFrame: true,
      left: 79,
      top: 101,
      width: 236,
      height: 462,
      borderRadius: 38,
    },
    note: {
      bg: "#e7ffe1",
      left: 539,
      top: 311,
      outerW: 338.564,
      outerH: 334.786,
      width: 326.92,
      height: 299.399,
      rotate: 2.16,
      text: (
        <>
          <p className="m-0">
            Iris is a Agentic experience designed and{" "}
            <span style={{ fontWeight: 700 }}>built</span> by me :)
          </p>
          <p className="m-0">&nbsp;</p>
          <p className="m-0">
            currently under development but the main goal is to increase user
            retention to the platform - by creating a new habit of ideation
            with AI. not only &lsquo;creation&rsquo; mode.
          </p>
        </>
      ),
    },
  },
  {
    id: "swipe",
    label: "Swipe",
    media: {
      videoSrc: "/v2/projects/swipe.mp4",
      left: 79,
      top: 101,
      width: 236,
      height: 462,
      borderRadius: 25,
    },
    note: {
      bg: "#e9deff",
      left: 514,
      top: 176,
      outerW: 338.564,
      outerH: 334.786,
      width: 326.92,
      height: 299.399,
      rotate: 2.16,
      text: (
        <p className="m-0">
          &lsquo;Swipe&rsquo; and its versions on &lsquo;Swipe to
          Manifest&rsquo; + &lsquo;Swipe to Find your Vibe&rsquo; was a
          mechanism created to improve how we understand our users and how
          they could curate their own goals and moodboards using AI effects
          applied to their photos.
        </p>
      ),
    },
  },
  {
    id: "shared-albums",
    label: "Shared Albums",
    media: {
      videoSrc: "/v2/projects/shared-albums.mp4",
      src: "/v2/projects/shared-albums-phone.png",
      phoneFrame: true,
      left: 82,
      top: 101,
      width: 201,
      height: 438,
      borderRadius: 36,
    },
    note: {
      bg: "#e8ff93",
      left: 474,
      top: 167,
      outerW: 338.564,
      outerH: 334.786,
      width: 326.92,
      height: 299.399,
      rotate: 2.16,
      text: (
        <p className="m-0">
          &lsquo;Shared Albums&rsquo; and its themes on Mother&rsquo;s Day,
          Girls Night Out, Lovers, Ramadan and more is a hit with users!
          I&rsquo;ve contributed towards designing the logic, UX and end to
          end UI as well as creating the AI filters users are applying to
          their photos.
        </p>
      ),
    },
  },
  {
    id: "flows",
    label: "Flows",
    media: {
      videoSrc: "/v2/projects/flows.mp4",
      src: "/v2/projects/flows-web.png",
      left: 63,
      top: 147,
      width: 737,
      height: 391,
      borderRadius: 20,
    },
    note: {
      bg: "#cfedff",
      left: 871,
      top: 265,
      outerW: 338.564,
      outerH: 334.786,
      width: 326.92,
      height: 299.399,
      rotate: 2.16,
      text: (
        <p className="m-0">
          Picsart Flow needed to improve the numbers of node creations with
          an educational, yet engaging onboarding. So I&rsquo;ve vibe-coded
          my way around it to test winning possibilities with users making
          sure they understood how to use the platform before kicking-off
          without missing the big AHA moment!
        </p>
      ),
    },
  },
];

/**
 * Wraps a child (video or image) in a phone bezel: dark border, slightly
 * rounded screen corners inside the body's larger corners, and a small
 * dynamic-island pill at the top. Fills the parent (use a positioned
 * parent with explicit width/height).
 */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  const BEZEL = 6;
  // Inner screen radius is just the outer (parent) radius minus the bezel
  // thickness — that's what gives the screen the same proportional roundness
  // as the body. Calc'd in pixels so it stays a true rounded-rectangle and
  // never collapses to an ellipse (which is what `calc(100% - X)` would do).
  return (
    <div
      className="absolute inset-0"
      style={{
        background: "#1a1a1a",
        borderRadius: "inherit",
        padding: BEZEL,
        boxSizing: "border-box",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.06), 0 14px 30px -14px rgba(0,0,0,0.32)",
      }}
    >
      {/* Dynamic island */}
      <div
        className="absolute"
        style={{
          top: BEZEL + 6,
          left: "50%",
          transform: "translateX(-50%)",
          width: 56,
          height: 14,
          background: "#000",
          borderRadius: 7,
          zIndex: 2,
        }}
      />
      {/* Screen — fixed-pixel rounded rectangle, not a percentage */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{ borderRadius: 30 }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Renders a Picsart tab's media — video if `videoSrc` is set (with the
 * still as poster), otherwise the still image. If both are missing the
 * box stays empty. Wraps in a `<PhoneFrame>` when `media.phoneFrame` is
 * truthy (Iris, Shared Albums).
 */
function PicsartMedia({
  media,
  alt,
}: {
  media: NonNullable<PicsartTab["media"]>;
  alt: string;
}) {
  const content = media.videoSrc ? (
    <video
      src={media.videoSrc}
      poster={media.src}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-label={alt}
      className="absolute inset-0 w-full h-full"
      style={{ objectFit: "cover" }}
    />
  ) : media.src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.src}
      alt={alt}
      className="absolute inset-0 w-full h-full"
      style={{ objectFit: "cover" }}
    />
  ) : null;

  if (!content) return null;
  if (media.phoneFrame) return <PhoneFrame>{content}</PhoneFrame>;
  return content;
}

function PicsartProject() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = PICSART_TABS[activeIdx];

  return (
    <>
      {/* Pinned pink sticky note — role */}
      <StickyNote
        bg="#ffb6e9"
        left={1081}
        top={61}
        outerW={213.682}
        outerH={194.227}
        width={188}
        height={164}
        rotate={10.03}
        zIndex={5}
      >
        <p
          className="m-0"
          style={{
            fontSize: 10.629,
            lineHeight: "18.601px",
            letterSpacing: "-0.6643px",
            fontWeight: 500,
          }}
        >
          Senior Product Designer II at Picsart working with AI Growth Design
        </p>
      </StickyNote>

      {/* Pinned light-pink sticky note — context */}
      <StickyNote
        bg="#ffe6ff"
        left={908.72}
        top={66.26}
        outerW={204.881}
        outerH={194.884}
        width={172.564}
        height={159.118}
        rotate={-13.45}
        zIndex={5}
      >
        <p
          style={{
            fontSize: 12.827,
            lineHeight: "22.447px",
            letterSpacing: "-0.8017px",
            fontWeight: 500,
            margin: 0,
          }}
        >
          B2C, AI in Creativity.{" "}
          <span style={{ fontWeight: 600 }}>
            150+ million active users per month
          </span>{" "}
          and over 2 billion downloads.
        </p>
      </StickyNote>

      {/* Per-tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          className="absolute inset-0"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          style={{ zIndex: 3 }}
        >
          {active.media && (
            <div
              className="absolute overflow-hidden"
              style={{
                left: active.media.left,
                top: active.media.top,
                width: active.media.width,
                height: active.media.height,
                borderRadius: active.media.borderRadius ?? 0,
              }}
            >
              <PicsartMedia media={active.media} alt={active.label} />
            </div>
          )}

          <StickyNote
            bg={active.note.bg}
            left={active.note.left}
            top={active.note.top}
            outerW={active.note.outerW}
            outerH={active.note.outerH}
            width={active.note.width}
            height={active.note.height}
            rotate={active.note.rotate}
            zIndex={4}
            padding="28px 32px"
          >
            <div
              style={{
                fontSize: 16,
                lineHeight: "28.928px",
                letterSpacing: "-1.0332px",
                fontWeight: 500,
                color: "#000",
              }}
            >
              {active.note.text}
            </div>
          </StickyNote>
        </motion.div>
      </AnimatePresence>

      {/* Tab bar (1215 wide) */}
      <TabBar
        tabs={PICSART_TABS.map((t) => t.label)}
        active={activeIdx}
        onChange={setActiveIdx}
        layoutId="picsart-tab-pill"
        width={1215}
        leftOffset={63}
        top={624}
        activeColor="#ff47ff"
      />
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Project 1 — Carbon Instincts
   ────────────────────────────────────────────────────────────────── */

type CarbonTab = {
  id: string;
  label: string;
  /** Below the tab bar — image or bullet list. */
  body: React.ReactNode;
};

const CARBON_BULLETS_TOP = (
  <ul
    className="m-0"
    style={{ listStyle: "disc", paddingLeft: 24, color: "#8c8c8c" }}
  >
    <li style={{ marginBottom: 0 }}>
      Translate AI model capabilities into user-centred experiences.
    </li>
    <li style={{ marginBottom: 0 }}>
      Map and mitigate potential biases in AI reasoning and datasets.
    </li>
    <li style={{ marginBottom: 0 }}>
      Design conversation and voice interactions that support
      &ldquo;human-AI negotiation.&rdquo;
    </li>
    <li style={{ marginBottom: 0 }}>
      Create UI states for thinking, reasoning, loading, and confidence
      levels.
    </li>
    <li>
      Rapidly test risky ideas with working prototypes, not static mockups.
    </li>
  </ul>
);

const CARBON_TABS: CarbonTab[] = [
  {
    id: "rapid-prototyping",
    label: "Rapid AI Prototyping",
    body: (
      <>
        <div
          className="absolute overflow-hidden"
          style={{ left: 221, top: 742, width: 880, height: 408 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v2/projects/carbon-prototyping.gif"
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: "cover" }}
          />
        </div>
        <p
          className="absolute m-0"
          style={{
            left: 284,
            top: 1190,
            width: 792,
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            fontSize: 16,
            lineHeight: "28px",
            letterSpacing: "-1px",
            color: "#8c8c8c",
          }}
        >
          Used Lovable and V0 to spin up functional prototypes in under an
          hour. Tested conversational flows with real users in the same day.
          This drastically reduced iteration cycles, turning speculative
          ideas into validated concepts quickly
        </p>
      </>
    ),
  },
  {
    id: "voice-ux",
    label: "Conversation & Voice UX",
    body: (
      <>
        <div
          className="absolute overflow-hidden"
          style={{ left: 64, top: 735, width: 799, height: 634 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v2/projects/carbon-voice.png"
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: "cover" }}
          />
        </div>
        <ul
          className="absolute m-0"
          style={{
            left: 879,
            top: 962,
            width: 424,
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            fontSize: 16,
            lineHeight: "28px",
            letterSpacing: "-1px",
            color: "#8c8c8c",
            listStyle: "disc",
            paddingLeft: 24,
          }}
        >
          <li style={{ marginBottom: 0 }}>
            Designed flows for text and voice inputs with clear states:
          </li>
          <li style={{ marginBottom: 0 }}>
            Listening → Thinking → Searching → Responding
          </li>
          <li style={{ marginBottom: 0 }}>
            Added confirm/clarify loops (&ldquo;Did you mean EU recycled
            steel datasets?&rdquo;).
          </li>
          <li>
            Designed failure paths with graceful fallbacks (manual search,
            suggestions).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "explainability",
    label: "Explainability & Transparency UI",
    body: (
      <>
        <div
          className="absolute overflow-hidden"
          style={{ left: 187, top: 734, width: 573, height: 546 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v2/projects/carbon-explainability.png"
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: "cover" }}
          />
        </div>
        <ul
          className="absolute m-0"
          style={{
            left: 840,
            top: 871,
            width: 424,
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            fontSize: 16,
            lineHeight: "28px",
            letterSpacing: "-1px",
            color: "#8c8c8c",
            listStyle: "disc",
            paddingLeft: 24,
          }}
        >
          <li style={{ marginBottom: 0 }}>
            Built reasoning trails (&ldquo;This dataset matches because it
            includes EU steel with 50% recycled content&rdquo;).
          </li>
          <li style={{ marginBottom: 0 }}>
            Added confidence indicators and percentages (Low / Medium / High).
          </li>
          <li>Made outputs editable, giving users final control.</li>
        </ul>
      </>
    ),
  },
];

function CarbonInstinctsProject() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = CARBON_TABS[activeIdx];

  return (
    <>
      {/* Light blue sticky note — role */}
      <StickyNote
        bg="#d5eef3"
        left={1081}
        top={60}
        outerW={213.682}
        outerH={194.227}
        width={188}
        height={164}
        rotate={10.03}
        zIndex={5}
      >
        <p
          className="m-0"
          style={{
            fontSize: 12,
            lineHeight: "18.601px",
            letterSpacing: "-0.6643px",
            fontWeight: 500,
          }}
        >
          Senior AI Product Designer at Carbon Instincts
        </p>
      </StickyNote>

      {/* Grey sticky note — sector */}
      <StickyNote
        bg="#f1f1f1"
        left={951}
        top={94}
        outerW={162.406}
        outerH={149.839}
        width={138.001}
        height={121.067}
        rotate={-13.45}
        zIndex={5}
      >
        <p
          style={{
            fontSize: 12.827,
            lineHeight: "22.447px",
            letterSpacing: "-0.8017px",
            fontWeight: 500,
            margin: 0,
          }}
        >
          B2B, AI in Sustainability
        </p>
      </StickyNote>

      {/* Top hero image (Carbon Instincts product) */}
      <div
        className="absolute"
        style={{ left: 64, top: 146, width: 626, height: 421, zIndex: 3 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/v2/projects/carbon-hero.gif"
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Top-right bullet list — Carbon Instincts UX areas */}
      <div
        className="absolute"
        style={{
          left: 718,
          top: 255,
          width: 530,
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontWeight: 500,
          fontSize: 16,
          lineHeight: "28px",
          letterSpacing: "-1px",
          color: "#8c8c8c",
          zIndex: 3,
        }}
      >
        {CARBON_BULLETS_TOP}
      </div>

      {/* Tab bar — 941 wide, centred. Pill uses layoutId so it perfectly
          fills the active tab's flex slot and the label stays centred. */}
      <TabBar
        tabs={CARBON_TABS.map((t) => t.label)}
        active={activeIdx}
        onChange={setActiveIdx}
        layoutId="carbon-tab-pill"
        width={941}
        leftOffset={(CARD_W - 941) / 2}
        top={630}
        activeColor="#3c8dbc"
      />

      {/* Per-tab body content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          className="absolute inset-0"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          style={{ zIndex: 3 }}
        >
          {active.body}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Shared components
   ────────────────────────────────────────────────────────────────── */

function TabBar({
  tabs,
  active,
  onChange,
  layoutId,
  width,
  leftOffset,
  top,
  activeColor,
}: {
  tabs: string[];
  active: number;
  onChange: (i: number) => void;
  layoutId: string;
  width: number;
  leftOffset: number;
  top: number;
  activeColor: string;
}) {
  return (
    <div
      className="absolute flex items-stretch"
      style={{
        left: leftOffset,
        top,
        width,
        height: 73,
        background: "#f7f7f7",
        borderRadius: 40,
        zIndex: 6,
      }}
    >
      {tabs.map((label, i) => {
        const isActive = i === active;
        return (
          <motion.button
            key={label}
            type="button"
            onClick={() => onChange(i)}
            className="relative flex items-center justify-center cursor-pointer"
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: 600,
              fontSize: 20,
              letterSpacing: "-1px",
              color: isActive ? "#fff" : "#4e4e4e",
              zIndex: 2,
            }}
            whileHover={isActive ? {} : { color: "#1a1a1a" }}
            transition={{ duration: 0.15 }}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute"
                style={{
                  inset: 0,
                  background: activeColor,
                  borderRadius: 40,
                  zIndex: -1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 30,
                }}
              />
            )}
            {label}
          </motion.button>
        );
      })}
    </div>
  );
}

function StickyNote({
  bg,
  left,
  top,
  outerW,
  outerH,
  width,
  height,
  rotate,
  children,
  zIndex = 1,
  padding = "20px 24px",
}: {
  bg: string;
  left: number;
  top: number;
  outerW: number;
  outerH: number;
  width: number;
  height: number;
  rotate: number;
  children: React.ReactNode;
  zIndex?: number;
  padding?: string;
}) {
  // Pre-compute the inner-note position so we can drag without fighting a
  // translateX/-Y centering hack — framer-motion's `x` / `y` offsets would
  // override the translate.
  const innerLeft = (outerW - width) / 2;
  const innerTop = (outerH - height) / 2;

  return (
    <div
      className="absolute"
      style={{
        left,
        top,
        width: outerW,
        height: outerH,
        zIndex,
        // Outer wrapper stays pointer-events:none so it doesn't block clicks
        // on what's underneath; the inner draggable note re-enables them.
        pointerEvents: "none",
      }}
    >
      <motion.div
        className="absolute cursor-grab active:cursor-grabbing"
        style={{
          left: innerLeft,
          top: innerTop,
          width,
          height,
          background: bg,
          borderRadius: 6.221,
          padding,
          color: "#000",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          pointerEvents: "auto",
          // Box-shadow lives on the motion.div so it tracks during drag.
          boxShadow:
            "0 6px 14px -6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.08)",
          touchAction: "none",
        }}
        initial={{ rotate: rotate * 0.4, opacity: 0, scale: 0.94 }}
        animate={{ rotate, opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 24,
        }}
        whileHover={{
          scale: 1.03,
          rotate: rotate + (rotate >= 0 ? 1.5 : -1.5),
        }}
        whileDrag={{
          scale: 1.06,
          rotate: rotate + (rotate >= 0 ? 3 : -3),
          boxShadow:
            "0 22px 36px -14px rgba(0,0,0,0.32), 0 6px 12px rgba(0,0,0,0.12)",
          zIndex: 100,
          cursor: "grabbing",
        }}
        drag
        dragConstraints={{ left: -150, right: 150, top: -120, bottom: 120 }}
        dragElastic={0.18}
        dragMomentum={false}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Mobile Projects — bottom sheet, vertical reflow.

   Picsart has 4 tabs (Iris/Swipe/Shared Albums/Flows) with one media
   slot + one sticky note each. Carbon Instincts has 3 tabs (Rapid AI
   Prototyping / Conversation & Voice UX / Explainability) with image +
   bullets. Both use a horizontal scrollable tab bar at the top of the
   sheet and a vertical content stack below.

   Use the same NextProjectArrow pattern — single forward button that
   cycles Picsart ↔ Carbon.
   ────────────────────────────────────────────────────────────────── */

function MobileProjects({
  projectIdx,
  setProjectIdx,
  onClose,
}: {
  projectIdx: number;
  setProjectIdx: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}) {
  function cycle() {
    setProjectIdx((i) => (i + 1) % 2);
  }

  return (
    <MobileSheet onClose={onClose} ariaLabel="projects">
      <div style={{ position: "relative", padding: "8px 0 32px" }}>
        <MobileCloseButton onClose={onClose} top={0} right={20} />

        {/* Cycle-project arrow — top-left corner */}
        <motion.button
          type="button"
          onClick={cycle}
          aria-label="next project"
          className="absolute grid place-items-center cursor-pointer"
          style={{
            top: 0,
            left: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            background: "transparent",
            border: "1px solid #636363",
            color: "#636363",
            zIndex: 30,
          }}
          whileTap={{ scale: 0.94 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M5 2l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>

        <h2
          className="m-0"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: "-0.8px",
            color: "#1a1a1a",
            marginTop: 8,
            marginBottom: 8,
            padding: "0 20px",
            textAlign: "center",
          }}
        >
          {projectIdx === 0 ? "Picsart" : "Carbon Instincts"}
        </h2>

        {/* Project body — cross-fades */}
        <AnimatePresence mode="wait">
          {projectIdx === 0 ? (
            <motion.div
              key="picsart-m"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <MobilePicsart />
            </motion.div>
          ) : (
            <motion.div
              key="carbon-m"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <MobileCarbon />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileSheet>
  );
}

function MobilePicsart() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = PICSART_TABS[activeIdx];

  return (
    <div>
      {/* Pinned context sticky notes — at top */}
      <div
        className="flex items-center justify-center"
        style={{ gap: 12, padding: "8px 20px 20px" }}
      >
        <div
          style={{
            background: "#ffe6ff",
            borderRadius: 6,
            padding: "14px 16px",
            transform: "rotate(-4deg)",
            boxShadow:
              "0 6px 14px -6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.08)",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            fontSize: 11,
            lineHeight: "16px",
            letterSpacing: "-0.4px",
            color: "#000",
            maxWidth: 150,
          }}
        >
          B2C, AI in Creativity.{" "}
          <span style={{ fontWeight: 600 }}>150M+ active users/month</span>,
          2B+ downloads.
        </div>
        <div
          style={{
            background: "#ffb6e9",
            borderRadius: 6,
            padding: "14px 16px",
            transform: "rotate(3deg)",
            boxShadow:
              "0 6px 14px -6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.08)",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            fontSize: 11,
            lineHeight: "16px",
            letterSpacing: "-0.4px",
            color: "#000",
            maxWidth: 150,
          }}
        >
          Senior Product Designer II at Picsart, AI Growth Design.
        </div>
      </div>

      {/* Horizontal scrollable tab bar */}
      <div
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          padding: "0 20px",
          marginBottom: 16,
        }}
      >
        <div className="flex" style={{ gap: 8, width: "max-content" }}>
          {PICSART_TABS.map((t, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveIdx(i)}
                className="relative cursor-pointer"
                style={{
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 24,
                  background: isActive ? "#ff47ff" : "#f7f7f7",
                  color: isActive ? "#fff" : "#4e4e4e",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  letterSpacing: "-0.3px",
                  whiteSpace: "nowrap",
                  transition: "background 0.2s ease, color 0.2s ease",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active tab content — image (if any) + sticky note */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          style={{ padding: "0 20px" }}
        >
          {active.media && (
            <div
              className="relative overflow-hidden w-full"
              style={{
                aspectRatio: `${active.media.width} / ${active.media.height}`,
                borderRadius: active.media.borderRadius ?? 14,
                marginBottom: 16,
              }}
            >
              <PicsartMedia media={active.media} alt={active.label} />
            </div>
          )}

          <div
            style={{
              background: active.note.bg,
              borderRadius: 6,
              padding: "20px 22px",
              transform: `rotate(${active.note.rotate}deg)`,
              boxShadow:
                "0 6px 14px -6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.08)",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: 500,
              fontSize: 15,
              lineHeight: "24px",
              letterSpacing: "-0.5px",
              color: "#000",
              marginTop: 4,
            }}
          >
            {active.note.text}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MobileCarbon() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = CARBON_TABS[activeIdx];

  return (
    <div>
      {/* Pinned context sticky notes — at top */}
      <div
        className="flex items-center justify-center"
        style={{ gap: 12, padding: "8px 20px 20px" }}
      >
        <div
          style={{
            background: "#f1f1f1",
            borderRadius: 6,
            padding: "14px 16px",
            transform: "rotate(-4deg)",
            boxShadow:
              "0 6px 14px -6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.08)",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            fontSize: 11,
            lineHeight: "16px",
            letterSpacing: "-0.4px",
            color: "#000",
            maxWidth: 130,
          }}
        >
          B2B, AI in Sustainability.
        </div>
        <div
          style={{
            background: "#d5eef3",
            borderRadius: 6,
            padding: "14px 16px",
            transform: "rotate(3deg)",
            boxShadow:
              "0 6px 14px -6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.08)",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            fontSize: 11,
            lineHeight: "16px",
            letterSpacing: "-0.4px",
            color: "#000",
            maxWidth: 150,
          }}
        >
          Senior AI Product Designer at Carbon Instincts.
        </div>
      </div>

      {/* Top hero image */}
      <div
        className="w-full overflow-hidden"
        style={{
          aspectRatio: "626 / 421",
          marginBottom: 20,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/v2/projects/carbon-hero.gif"
          alt=""
          className="w-full h-full"
          style={{ objectFit: "cover", display: "block" }}
        />
      </div>

      {/* UX areas bullets */}
      <div style={{ padding: "0 20px", marginBottom: 24 }}>
        <ul
          className="m-0"
          style={{
            listStyle: "disc",
            paddingLeft: 20,
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            fontSize: 15,
            lineHeight: "24px",
            letterSpacing: "-0.4px",
            color: "#8c8c8c",
          }}
        >
          <li style={{ marginBottom: 4 }}>
            Translate AI model capabilities into user-centred experiences.
          </li>
          <li style={{ marginBottom: 4 }}>
            Map and mitigate potential biases in AI reasoning and datasets.
          </li>
          <li style={{ marginBottom: 4 }}>
            Design conversation and voice interactions that support
            &ldquo;human-AI negotiation.&rdquo;
          </li>
          <li style={{ marginBottom: 4 }}>
            Create UI states for thinking, reasoning, loading, confidence.
          </li>
          <li>
            Rapidly test risky ideas with working prototypes, not static
            mockups.
          </li>
        </ul>
      </div>

      {/* Horizontal scrollable tab bar — Carbon's 3 tabs, blue active */}
      <div
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          padding: "0 20px",
          marginBottom: 16,
        }}
      >
        <div className="flex" style={{ gap: 8, width: "max-content" }}>
          {CARBON_TABS.map((t, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveIdx(i)}
                className="relative cursor-pointer"
                style={{
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 24,
                  background: isActive ? "#3c8dbc" : "#f7f7f7",
                  color: isActive ? "#fff" : "#4e4e4e",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  letterSpacing: "-0.3px",
                  whiteSpace: "nowrap",
                  transition: "background 0.2s ease, color 0.2s ease",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active tab body. Desktop body is positioned absolutely with
          card-coord left/top/width — on mobile we render a simpler
          vertical version per tab. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          style={{ padding: "0 20px" }}
        >
          <MobileCarbonTabBody tabId={active.id} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MobileCarbonTabBody({ tabId }: { tabId: string }) {
  const textStyle = {
    fontFamily: "var(--font-inter), Inter, sans-serif",
    fontWeight: 500,
    fontSize: 15,
    lineHeight: "24px",
    letterSpacing: "-0.4px",
    color: "#8c8c8c",
  } as const;

  if (tabId === "rapid-prototyping") {
    return (
      <>
        <div
          className="w-full overflow-hidden"
          style={{ aspectRatio: "880 / 408", borderRadius: 14, marginBottom: 14 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v2/projects/carbon-prototyping.gif"
            alt=""
            className="w-full h-full"
            style={{ objectFit: "cover", display: "block" }}
          />
        </div>
        <p className="m-0" style={textStyle}>
          Used Lovable and V0 to spin up functional prototypes in under an
          hour. Tested conversational flows with real users in the same
          day. This drastically reduced iteration cycles, turning
          speculative ideas into validated concepts quickly.
        </p>
      </>
    );
  }

  if (tabId === "voice-ux") {
    return (
      <>
        <div
          className="w-full overflow-hidden"
          style={{ aspectRatio: "799 / 634", borderRadius: 14, marginBottom: 14 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v2/projects/carbon-voice.png"
            alt=""
            className="w-full h-full"
            style={{ objectFit: "cover", display: "block" }}
          />
        </div>
        <ul
          className="m-0"
          style={{ listStyle: "disc", paddingLeft: 20, ...textStyle }}
        >
          <li style={{ marginBottom: 4 }}>
            Flows for text and voice inputs with clear states:
          </li>
          <li style={{ marginBottom: 4 }}>
            Listening → Thinking → Searching → Responding
          </li>
          <li style={{ marginBottom: 4 }}>
            Confirm/clarify loops (&ldquo;Did you mean EU recycled steel
            datasets?&rdquo;).
          </li>
          <li>
            Failure paths with graceful fallbacks (manual search,
            suggestions).
          </li>
        </ul>
      </>
    );
  }

  // explainability
  return (
    <>
      <div
        className="w-full overflow-hidden"
        style={{ aspectRatio: "573 / 546", borderRadius: 14, marginBottom: 14 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/v2/projects/carbon-explainability.png"
          alt=""
          className="w-full h-full"
          style={{ objectFit: "cover", display: "block" }}
        />
      </div>
      <ul
        className="m-0"
        style={{ listStyle: "disc", paddingLeft: 20, ...textStyle }}
      >
        <li style={{ marginBottom: 4 }}>
          Reasoning trails (&ldquo;This dataset matches because it includes
          EU steel with 50% recycled content&rdquo;).
        </li>
        <li style={{ marginBottom: 4 }}>
          Confidence indicators and percentages (Low / Medium / High).
        </li>
        <li>Made outputs editable, giving users final control.</li>
      </ul>
    </>
  );
}
