"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AboutOverlay } from "@/components/AboutOverlay";
import { VibeCodingOverlay } from "@/components/VibeCodingOverlay";
import { SpeakingTeachingOverlay } from "@/components/SpeakingTeachingOverlay";
import { ProjectsOverlay } from "@/components/ProjectsOverlay";
import { useIsMobile } from "@/components/useIsMobile";

const NON_HERO_RESERVE_PX = 290;

type Decoration = {
  src: string;
  /** Outer wrapper size (the visible decoration footprint). */
  width: number;
  height: number;
  /** Rotation applied around the decoration's center. */
  rotation?: number;
  /**
   * Inner crop-window size. Used when the rotation wraps a smaller cropping
   * container than the outer footprint (Figma's "speaking book" pattern).
   * Defaults to {width, height}.
   */
  cropWidth?: number;
  cropHeight?: number;
  /** Image positioning inside the crop window — replicates Figma percentages. */
  imgWidth: string;
  imgHeight: string;
  imgLeft: string;
  imgTop: string;
  /** Horizontal offset of decoration center from the wide thumb's center. */
  offsetX?: number;
  /** How far the decoration's bottom extends past the row's bottom (px). */
  bottomOffset?: number;
};

type Thumb = {
  id: string;
  label: string;
  src: string;
  smallW: number;
  smallH: number;
  /** Crop coords for the cell image, replicated from Figma. */
  imgWidth: string;
  imgHeight: string;
  imgLeft: string;
  imgTop: string;
  decoration?: Decoration;
};

const THUMBS: Thumb[] = [
  {
    id: "about",
    label: "about",
    src: "/v2/thumb-1.png",
    smallW: 70,
    smallH: 66,
    imgWidth: "233.83%",
    imgHeight: "248%",
    imgLeft: "-63.21%",
    imgTop: "-111.62%",
    decoration: {
      src: "/v2/about-figure.png",
      width: 125,
      height: 209,
      imgWidth: "353.02%",
      imgHeight: "153.02%",
      imgLeft: "-119.93%",
      imgTop: "0%",
      offsetX: 0,
      bottomOffset: 2,
    },
  },
  {
    id: "projects",
    label: "projects",
    src: "/v2/thumb-2.png",
    smallW: 70,
    smallH: 70,
    imgWidth: "300%",
    imgHeight: "300%",
    imgLeft: "-100%",
    imgTop: "-182.39%",
    decoration: {
      src: "/v2/projects-folder.png",
      width: 281,
      height: 186,
      imgWidth: "100%",
      imgHeight: "151.03%",
      imgLeft: "0%",
      imgTop: "-23.2%",
      offsetX: -6,
      bottomOffset: 10,
    },
  },
  {
    id: "vibe-coding",
    label: "vibe coding",
    src: "/v2/thumb-3.png",
    smallW: 70,
    smallH: 70,
    imgWidth: "300%",
    imgHeight: "300%",
    imgLeft: "-103.08%",
    imgTop: "-185.64%",
    decoration: {
      src: "/v2/laptop-sticker.png",
      width: 223,
      height: 195,
      imgWidth: "170.63%",
      imgHeight: "195.32%",
      imgLeft: "-34.57%",
      imgTop: "-45.11%",
      offsetX: -11,
      bottomOffset: 20,
    },
  },
  {
    id: "speaking-teaching",
    label: "speaking + teaching",
    src: "/v2/thumb-4.png",
    smallW: 70,
    smallH: 70,
    imgWidth: "300%",
    imgHeight: "300%",
    imgLeft: "-100%",
    imgTop: "-182.31%",
    decoration: {
      src: "/v2/speaking-book.png",
      // Outer wrapper that establishes the rotated decoration's footprint.
      width: 258.617,
      height: 207.779,
      rotation: 11.02,
      // The rotated inner crop window is smaller than the outer footprint.
      cropWidth: 231.018,
      cropHeight: 166.706,
      imgWidth: "236.08%",
      imgHeight: "327.16%",
      imgLeft: "-67.55%",
      imgTop: "-106.95%",
      offsetX: -10,
      bottomOffset: 33,
    },
  },
];

const WIDE = 200;
const GAP = 12;
const PILL_HEIGHT = 32;
const PILL_GAP_FROM_DECO = 10; // spacing between pill bottom and decoration top

const SPRING = {
  type: "spring" as const,
  stiffness: 320,
  damping: 28,
  mass: 0.7,
};

const SOFT_SPRING = {
  type: "spring" as const,
  stiffness: 220,
  damping: 24,
  mass: 0.8,
};

function rowWidth(hoveredIdx: number): number {
  return THUMBS.reduce(
    (sum, t, i) => sum + (i === hoveredIdx ? WIDE : t.smallW),
    0,
  ) + GAP * (THUMBS.length - 1);
}

/** Center X (in row coords) of thumb i when hoveredIdx is the wide one. */
function thumbCenter(i: number, hoveredIdx: number): number {
  let x = 0;
  for (let j = 0; j < i; j++) {
    x += (j === hoveredIdx ? WIDE : THUMBS[j].smallW) + GAP;
  }
  const w = i === hoveredIdx ? WIDE : THUMBS[i].smallW;
  return x + w / 2;
}

export default function V2Page() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openOverlayId, setOpenOverlayId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const hoveredIdx = hoveredId
    ? THUMBS.findIndex((t) => t.id === hoveredId)
    : -1;
  const hovered = hoveredIdx >= 0 ? THUMBS[hoveredIdx] : null;

  if (isMobile) {
    return (
      <MobileHome
        thumbs={THUMBS}
        openOverlayId={openOverlayId}
        setOpenOverlayId={setOpenOverlayId}
      />
    );
  }

  return (
    <main
      className="w-full overflow-hidden flex justify-center"
      style={{
        height: "100dvh",
        background: "#fefdfd",
      }}
    >
      <div
        className="flex flex-col items-center w-full"
        style={{
          maxWidth: 1289,
          paddingLeft: 75,
          paddingRight: 75,
          paddingTop: 55,
          paddingBottom: 55,
          gap: 32,
          height: "100%",
        }}
      >
        {/* Header */}
        <header className="flex w-full items-center justify-between shrink-0">
          <motion.div
            className="flex items-center justify-center shrink-0 cursor-default"
            style={{ width: 418.344, height: 43.232 }}
            initial={{ rotate: 0.6 }}
            whileHover={{
              rotate: [0.6, -1.4, 1.8, -0.4, 0.6],
              scale: 1.04,
            }}
            transition={{
              rotate: { duration: 0.9, ease: [0.22, 0.61, 0.36, 1] },
              scale: { type: "spring", stiffness: 240, damping: 18 },
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/v2/signature.svg"
              alt="Micaela Dixon"
              style={{ width: 417.962, height: 38.882, display: "block" }}
            />
          </motion.div>

          <p
            className="font-medium"
            style={{
              width: 240,
              color: "#636363",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 20,
              lineHeight: "28px",
              letterSpacing: "-1px",
              margin: 0,
            }}
          >
            designing the warm human touch in AI experiences.
          </p>
        </header>

        {/* Hero */}
        <motion.div
          className="relative overflow-hidden shrink-0 w-full"
          style={{
            aspectRatio: "4096 / 2286",
            maxHeight: `calc(100dvh - ${NON_HERO_RESERVE_PX}px)`,
            borderRadius: 20,
          }}
          animate={{ opacity: hovered ? 0.5 : 1 }}
          transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <video
            src="/v2/hero.mp4"
            poster="/v2/hero.png"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-label="Scenic Rio archway, animated"
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: "cover" }}
          />
        </motion.div>

        {/* Thumbnails row + decoration + pill all anchored together */}
        <div
          className="relative shrink-0"
          style={{ height: THUMBS[0].smallH /* row height */ }}
        >
          <motion.div
            className="flex items-center"
            style={{ gap: GAP }}
            layout
            transition={SPRING}
          >
            {THUMBS.map((t, i) => {
              const isHovered = hoveredIdx === i;
              const isAnotherHovered = hoveredIdx >= 0 && !isHovered;
              return (
                <motion.button
                  key={t.id}
                  type="button"
                  onMouseEnter={() => setHoveredId(t.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(t.id)}
                  onBlur={() => setHoveredId(null)}
                  onClick={() => setOpenOverlayId(t.id)}
                  className="relative shrink-0 overflow-hidden cursor-pointer"
                  style={{ height: t.smallH, borderRadius: 20 }}
                  animate={{
                    width: isHovered ? WIDE : t.smallW,
                    opacity: isAnotherHovered ? 0.5 : 1,
                  }}
                  transition={SPRING}
                  aria-label={t.label}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.src}
                    alt=""
                    className="absolute pointer-events-none max-w-none"
                    style={{
                      width: t.imgWidth,
                      // Source PNGs are 4096×4096 (1:1). Use aspect-ratio so
                      // the image always scales uniformly — Figma's
                      // size-[300%] preserves aspect; CSS's literal
                      // width:300%/height:300% would stretch when the
                      // container becomes 200×70 (wide state).
                      aspectRatio: "1 / 1",
                      left: t.imgLeft,
                      top: t.imgTop,
                    }}
                  />
                </motion.button>
              );
            })}
          </motion.div>

          {/* Decoration — emerges from the wide thumb */}
          <AnimatePresence>
            {hovered?.decoration && (
              <Deco
                key={hovered.id}
                hovered={hovered}
                thumbCenterPx={thumbCenter(hoveredIdx, hoveredIdx)}
              />
            )}
          </AnimatePresence>

          {/* Pill label — appears above the wide thumb (and above the decoration if there is one) */}
          <AnimatePresence>
            {hovered && (
              <Pill
                key={`pill-${hovered.id}`}
                hovered={hovered}
                thumbCenterPx={thumbCenter(hoveredIdx, hoveredIdx)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Section overlays — open on thumbnail click. */}
      <AnimatePresence>
        {openOverlayId === "about" && (
          <AboutOverlay onClose={() => setOpenOverlayId(null)} />
        )}
        {openOverlayId === "vibe-coding" && (
          <VibeCodingOverlay onClose={() => setOpenOverlayId(null)} />
        )}
        {openOverlayId === "speaking-teaching" && (
          <SpeakingTeachingOverlay onClose={() => setOpenOverlayId(null)} />
        )}
        {openOverlayId === "projects" && (
          <ProjectsOverlay onClose={() => setOpenOverlayId(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}

function Pill({
  hovered,
  thumbCenterPx,
}: {
  hovered: Thumb;
  thumbCenterPx: number;
}) {
  const decoration = hovered.decoration;
  const decoOffsetX = decoration?.offsetX ?? 0;
  const decoHeight = decoration?.height ?? 0;
  const decoBottomOffset = decoration?.bottomOffset ?? 0;

  // CSS `bottom` value for the pill (measured from the row wrapper's bottom
  // edge). When there's a decoration we sit just above its top; otherwise
  // we lift the pill ~122px above the row top to match the Figma frame.
  const pillBottomFromRowTop = decoration
    ? decoHeight - decoBottomOffset + PILL_GAP_FROM_DECO
    : 122 + hovered.smallH;

  const pillWidth = hovered.id === "speaking-teaching" ? 228 : 186;

  // Center the pill on the thumb (with the decoration's small offset, so they
  // align visually). Compute the LEFT edge directly — no translateX, since
  // framer's animated transform would overwrite it.
  const pillLeft = thumbCenterPx + decoOffsetX - pillWidth / 2;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        bottom: pillBottomFromRowTop,
        left: pillLeft,
        zIndex: 30,
      }}
      initial={{ opacity: 0, y: 6, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.92 }}
      transition={{ ...SPRING, delay: 0.05 }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: pillWidth,
          height: PILL_HEIGHT,
          background: "#fefdfd",
          border: "1px solid #636363",
          borderRadius: 20,
        }}
      >
        <span
          className="font-medium"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 20,
            color: "#636363",
            letterSpacing: "-1px",
            lineHeight: "28px",
          }}
        >
          {hovered.label}
        </span>
      </div>
    </motion.div>
  );
}

function Deco({
  hovered,
  thumbCenterPx,
}: {
  hovered: Thumb;
  thumbCenterPx: number;
}) {
  const d = hovered.decoration!;
  // Compute the left edge directly so framer's animated transform doesn't
  // wipe out a translateX-based centering.
  const decoLeft = thumbCenterPx + (d.offsetX ?? 0) - d.width / 2;

  const cropW = d.cropWidth ?? d.width;
  const cropH = d.cropHeight ?? d.height;

  // The cropped image (windowed view of the source PNG).
  const croppedImage = (
    <div
      className="relative overflow-hidden"
      style={{ width: cropW, height: cropH }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={d.src}
        alt=""
        className="absolute pointer-events-none max-w-none"
        style={{
          width: d.imgWidth,
          height: d.imgHeight,
          left: d.imgLeft,
          top: d.imgTop,
        }}
      />
    </div>
  );

  // Outer wrapper handles position + entrance animation; inner handles rotation.
  return (
    <motion.div
      className="absolute pointer-events-none flex items-center justify-center"
      style={{
        left: decoLeft,
        bottom: -(d.bottomOffset ?? 0),
        width: d.width,
        height: d.height,
        zIndex: 20,
      }}
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.94 }}
      transition={SOFT_SPRING}
    >
      {d.rotation ? (
        <div
          style={{
            transform: `rotate(${d.rotation}deg)`,
            transformOrigin: "center",
          }}
        >
          {croppedImage}
        </div>
      ) : (
        croppedImage
      )}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Mobile home — stacked header, full-width hero, vertical card list.
   Tap a card to open its overlay (which renders as a bottom sheet on
   mobile).
   ────────────────────────────────────────────────────────────────── */

// NOTE: the full mobile experience (burger menu + drawer + bottom sheets
// for each overlay) lives below this component and remains wired up
// internally. We're currently showing a "coming soon" placeholder on
// mobile while we iterate on the mobile UX. To re-enable the full mobile
// home, rename `MobileHome` → `MobileHomeFull` (or similar) and swap the
// `if (isMobile)` branch in V2Page to render it again.
function MobileHome({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  thumbs,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openOverlayId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setOpenOverlayId,
}: {
  thumbs: Thumb[];
  openOverlayId: string | null;
  setOpenOverlayId: (id: string | null) => void;
}) {
  return <MobileComingSoon />;
}

function MobileComingSoon() {
  return (
    <main
      className="w-full flex flex-col items-center"
      style={{
        minHeight: "100dvh",
        background: "#fefdfd",
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 28,
        paddingBottom: 32,
      }}
    >
      {/* Signature pinned at the top */}
      <motion.div
        className="cursor-default w-full"
        style={{ maxWidth: 280, height: 28 }}
        initial={{ rotate: 0.6, opacity: 0, y: -8 }}
        animate={{ rotate: 0.6, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/v2/signature.svg"
          alt="Micaela Dixon"
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </motion.div>

      {/* Centred message */}
      <div
        className="flex-1 flex flex-col items-center justify-center text-center"
        style={{ width: "100%", maxWidth: 360, gap: 16 }}
      >
        <motion.p
          className="m-0"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 600,
            fontSize: 22,
            lineHeight: "30px",
            letterSpacing: "-0.7px",
            color: "#1a1a1a",
          }}
        >
          this experience is currently only optimised for desktop{" "}
          <span style={{ display: "inline-block" }}>:)</span>
        </motion.p>
        <motion.p
          className="m-0"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            fontSize: 17,
            lineHeight: "26px",
            letterSpacing: "-0.5px",
            color: "#8c8c8c",
          }}
        >
          I&rsquo;m working on it! come back soon.
        </motion.p>
      </div>

      {/* Soft footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: 12,
          color: "#a8a8a8",
          letterSpacing: "-0.2px",
        }}
      >
        micaela dixon · 2026
      </motion.div>
    </main>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MobileHomeFull({
  thumbs,
  openOverlayId,
  setOpenOverlayId,
}: {
  thumbs: Thumb[];
  openOverlayId: string | null;
  setOpenOverlayId: (id: string | null) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main
      className="w-full"
      style={{
        minHeight: "100dvh",
        background: "#fefdfd",
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 28,
        paddingBottom: 32,
      }}
    >
      {/* Header — signature + burger on top row, tagline below */}
      <header className="flex flex-col" style={{ gap: 12, marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ gap: 12 }}>
          <motion.div
            className="cursor-default"
            style={{ width: 240, height: 22 }}
            initial={{ rotate: 0.6 }}
            whileTap={{
              rotate: [0.6, -1.4, 1.8, -0.4, 0.6],
              scale: 1.04,
            }}
            transition={{
              rotate: { duration: 0.9, ease: [0.22, 0.61, 0.36, 1] },
              scale: { type: "spring", stiffness: 240, damping: 18 },
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/v2/signature.svg"
              alt="Micaela Dixon"
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </motion.div>

          <MobileBurgerButton onClick={() => setMenuOpen(true)} />
        </div>
        <p
          className="font-medium"
          style={{
            color: "#636363",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 16,
            lineHeight: "22px",
            letterSpacing: "-0.7px",
            margin: 0,
          }}
        >
          designing the warm human touch in AI experiences.
        </p>
      </header>

      {/* Hero video — fills the rest of the screen now that the sections
          live behind the burger menu. */}
      <div
        className="relative overflow-hidden w-full"
        style={{
          aspectRatio: "4096 / 2286",
          borderRadius: 16,
        }}
      >
        <video
          src="/v2/hero.mp4"
          poster="/v2/hero.png"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-label="Scenic Rio archway, animated"
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Slide-in menu drawer */}
      <AnimatePresence>
        {menuOpen && (
          <MobileMenuDrawer
            thumbs={thumbs}
            onSelect={(id) => {
              setMenuOpen(false);
              setOpenOverlayId(id);
            }}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence>
        {openOverlayId === "about" && (
          <AboutOverlay onClose={() => setOpenOverlayId(null)} />
        )}
        {openOverlayId === "vibe-coding" && (
          <VibeCodingOverlay onClose={() => setOpenOverlayId(null)} />
        )}
        {openOverlayId === "speaking-teaching" && (
          <SpeakingTeachingOverlay onClose={() => setOpenOverlayId(null)} />
        )}
        {openOverlayId === "projects" && (
          <ProjectsOverlay onClose={() => setOpenOverlayId(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}

function MobileBurgerButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="open menu"
      className="grid place-items-center cursor-pointer shrink-0"
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        background: "transparent",
        border: "1px solid #636363",
        color: "#636363",
      }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
        <path
          d="M1 1.5h16M1 7h16M1 12.5h16"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </motion.button>
  );
}

function MobileMenuDrawer({
  thumbs,
  onSelect,
  onClose,
}: {
  thumbs: Thumb[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  // Lock body scroll while the drawer is open (prevents the home page
  // from scrolling underneath when the drawer is being touched).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "rgba(0, 0, 0, 0.35)" }}
      />

      {/* Right-side slide-in drawer */}
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="navigation"
        className="absolute top-0 right-0 bottom-0 flex flex-col"
        style={{
          width: "82%",
          maxWidth: 360,
          background: "#fffdf6",
          boxShadow: "-20px 0 50px -10px rgba(0,0,0,0.2)",
          touchAction: "pan-y",
        }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.4 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 100 || info.velocity.x > 500) onClose();
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            padding: "24px 20px 16px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              color: "#8c8c8c",
            }}
          >
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="close menu"
            className="grid place-items-center cursor-pointer"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: "transparent",
              border: "1px solid #636363",
              color: "#636363",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 14,
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: "-0.5px",
            }}
          >
            x
          </button>
        </div>

        <div
          style={{
            height: 1,
            background: "rgba(99, 99, 99, 0.1)",
            margin: "0 20px",
          }}
        />

        {/* Section list */}
        <ul
          className="flex flex-col list-none p-0 m-0 flex-1"
          style={{ gap: 4, padding: "16px 12px" }}
        >
          {thumbs.map((t, i) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.08 + i * 0.05,
                duration: 0.35,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            >
              <MobileSectionCard thumb={t} onClick={() => onSelect(t.id)} />
            </motion.li>
          ))}
        </ul>

        {/* Footer hint */}
        <div
          className="shrink-0"
          style={{
            padding: "16px 24px 28px",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 12,
            color: "#a8a8a8",
            letterSpacing: "-0.2px",
          }}
        >
          micaela dixon · 2026
        </div>
      </motion.aside>
    </motion.div>
  );
}

function MobileSectionCard({
  thumb,
  onClick,
}: {
  thumb: Thumb;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex items-center w-full cursor-pointer"
      style={{
        background: "transparent",
        border: "none",
        borderRadius: 14,
        padding: "10px 12px",
        gap: 14,
      }}
      whileTap={{ scale: 0.98, background: "rgba(99, 99, 99, 0.06)" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {/* Thumbnail icon (square crop of the Figma decoration image) */}
      <div
        className="relative overflow-hidden shrink-0"
        style={{ width: 56, height: 56, borderRadius: 12 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb.src}
          alt=""
          className="absolute pointer-events-none max-w-none"
          style={{
            width: thumb.imgWidth,
            aspectRatio: "1 / 1",
            left: thumb.imgLeft,
            top: thumb.imgTop,
          }}
        />
      </div>

      {/* Label + chevron */}
      <div
        className="flex items-center justify-between flex-1"
        style={{ gap: 8 }}
      >
        <span
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            fontSize: 17,
            letterSpacing: "-0.5px",
            color: "#1a1a1a",
            textAlign: "left",
          }}
        >
          {thumb.label}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{ color: "#a8a8a8", flexShrink: 0 }}
        >
          <path
            d="M5 2l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.button>
  );
}
