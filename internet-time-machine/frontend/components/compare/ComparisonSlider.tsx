"use client";

import React, { useState, useRef, useEffect } from "react";
import { Snapshot } from "@/types/domain";
import { formatDate } from "@/lib/utils";

interface ComparisonSliderProps {
  domain: string;
  beforeSnapshot: Snapshot;
  afterSnapshot: Snapshot;
}

export default function ComparisonSlider({
  domain,
  beforeSnapshot,
  afterSnapshot,
}: ComparisonSliderProps) {
  const [sliderPercent, setSliderPercent] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 1. Keyboard Listeners (Left/Right Arrows move slider by 5%)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSliderPercent((prev) => Math.max(2, prev - 5));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSliderPercent((prev) => Math.min(98, prev + 5));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2. Drag percentage calculations
  const calculatePercent = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(2, Math.min((x / rect.width) * 100, 98));
    setSliderPercent(percent);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    calculatePercent(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    calculatePercent(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Slider Viewport Box */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative aspect-video w-full border border-border-bright rounded-2xl overflow-hidden bg-bg-base cursor-ew-resize shadow-2xl"
      >
        {/* AFTER Layer (Full Width Base) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-bg-card to-bg-elevated flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="absolute top-4 right-4 bg-teal/10 border border-teal/30 px-3 py-1 rounded-full text-teal text-xs font-mono">
            After • {formatDate(afterSnapshot.captured_at)}
          </div>
          <div className="space-y-2 max-w-md">
            <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">Modern Snapshot Era</span>
            <h4 className="font-display text-4xl font-extrabold text-text-primary tracking-wide">{domain}</h4>
            <p className="text-xs text-text-secondary line-clamp-1 italic font-serif">
              "{afterSnapshot.page_title || "No Title Recorded"}"
            </p>
            <div className="text-[10px] text-text-muted font-mono pt-4 bg-bg-secondary/40 rounded border border-border-subtle p-2">
              Wayback Snapshot: {afterSnapshot.wayback_ts}
            </div>
          </div>
        </div>

        {/* BEFORE Layer (Clipped Overlay) */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-gold-dim/20 to-amber/5 border-r border-gold/40 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
          style={{
            clipPath: `inset(0 ${100 - sliderPercent}% 0 0)`,
          }}
        >
          {/* Wrap in relative container matching parent size to prevent squishing */}
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute top-4 left-4 bg-gold/10 border border-gold-dim px-3 py-1 rounded-full text-gold text-xs font-mono">
              Before • {formatDate(beforeSnapshot.captured_at)}
            </div>
            <div className="space-y-2 max-w-md">
              <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">Retro Snapshot Era</span>
              <h4 className="font-display text-4xl font-extrabold text-text-primary tracking-wide">{domain}</h4>
              <p className="text-xs text-text-secondary line-clamp-1 italic font-serif">
                "{beforeSnapshot.page_title || "No Title Recorded"}"
              </p>
              <div className="text-[10px] text-text-muted font-mono pt-4 bg-bg-secondary/40 rounded border border-border-subtle p-2">
                Wayback Snapshot: {beforeSnapshot.wayback_ts}
              </div>
            </div>
          </div>
        </div>

        {/* Separator Slider Handle Bar */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gold pointer-events-none"
          style={{ left: `${sliderPercent}%` }}
        >
          {/* Draggable Circle Handle Icon */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-gold text-bg-base border border-bg-secondary rounded-full flex items-center justify-center shadow-2xl cursor-ew-resize">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Helper Scrubber Instructions details */}
      <div className="flex items-center justify-between text-[10px] text-text-muted font-mono px-1">
        <span>← Drag scrubber or press Arrow keys to scrub →</span>
        <span>Split: {Math.round(sliderPercent)}% / {100 - Math.round(sliderPercent)}%</span>
      </div>
    </div>
  );
}
