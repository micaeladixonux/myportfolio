"use client";

import { ReactNode } from "react";
import { motion, PanInfo } from "framer-motion";

/**
 * Bottom-sheet shell for mobile overlays. Slides up from the bottom on
 * open, swipe-down-to-dismiss with velocity, and a small drag handle at
 * top to advertise the gesture. The card is full-bleed (edge-to-edge)
 * with a rounded top — iOS-style modal feel.
 *
 * Content scrolls within the sheet (overflow-y: auto on a wrapper). The
 * dismiss gesture is captured on the SHEET, not its scrollable content,
 * so users can scroll the content freely without accidentally dismissing.
 */
export function MobileSheet({
  onClose,
  children,
  ariaLabel,
}: {
  onClose: () => void;
  children: ReactNode;
  ariaLabel: string;
}) {
  function handleDragEnd(
    _: unknown,
    info: PanInfo,
  ) {
    // Dismiss if the user dragged the sheet meaningfully down or flicked it
    // with enough velocity. Either threshold alone is enough — covers both
    // slow-drag-to-bottom and quick-flick gestures.
    if (info.offset.y > 120 || info.velocity.y > 600) {
      onClose();
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {/* Dim backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "rgba(0, 0, 0, 0.35)" }}
      />

      {/* The sheet itself — slides up from bottom */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className="absolute left-0 right-0 bottom-0 flex flex-col"
        style={{
          background: "#fffdf6",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          // Leave a small gap at the very top so the page header peeks
          // through above the sheet — keeps the "this is an overlay"
          // affordance, mirrors iOS card-modal style.
          top: 56,
          boxShadow: "0 -20px 50px -10px rgba(0,0,0,0.18)",
          touchAction: "pan-y",
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={handleDragEnd}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center"
          style={{ paddingTop: 10, paddingBottom: 8, flexShrink: 0 }}
          aria-hidden
        >
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: "#d6d2c4",
            }}
          />
        </div>

        {/* Scrollable content area */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Standard close button for inside a mobile sheet. Positioned absolutely
 * by callers — provided as a shared component so all overlays use the
 * same look.
 */
export function MobileCloseButton({
  onClose,
  top = 20,
  right = 20,
}: {
  onClose: () => void;
  top?: number;
  right?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="close"
      className="absolute grid place-items-center cursor-pointer"
      style={{
        top,
        right,
        width: 40,
        height: 40,
        borderRadius: 20,
        background: "transparent",
        border: "1px solid #636363",
        color: "#636363",
        fontFamily: "var(--font-inter), Inter, sans-serif",
        fontSize: 16,
        fontWeight: 500,
        lineHeight: 1,
        letterSpacing: "-1px",
        zIndex: 30,
      }}
    >
      x
    </button>
  );
}
