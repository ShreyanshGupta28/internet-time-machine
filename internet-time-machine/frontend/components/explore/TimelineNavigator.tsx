"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTimelineStore } from "@/store/timelineStore";
import { formatDate } from "@/lib/utils";
import { Snapshot } from "@/types/domain";

export default function TimelineNavigator() {
  const {
    snapshots,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    next,
    prev,
    togglePlay,
    setIsPlaying,
  } = useTimelineStore();

  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const total = snapshots.length;
  const currentSnapshot: Snapshot | undefined = snapshots[currentIndex];

  // 1. Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setIsPlaying(false);
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIsPlaying(false);
        prev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev, setIsPlaying]);

  // 2. Autoplay Interval
  useEffect(() => {
    if (!isPlaying || total === 0) return;
    const interval = setInterval(() => {
      next();
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, next, total]);

  // 3. Drag Coordinates Translation Helper
  const updateIndexFromX = useCallback((clientX: number) => {
    if (!trackRef.current || total <= 1) return;
    const rect = trackRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = mouseX / rect.width;
    const targetIndex = Math.round(percent * (total - 1));
    setCurrentIndex(targetIndex);
  }, [total, setCurrentIndex]);

  // Mouse / Touch Event Handlers for Draggability
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPlaying(false);
    setIsDragging(true);
    updateIndexFromX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPlaying(false);
    setIsDragging(true);
    if (e.touches.length > 0) {
      updateIndexFromX(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updateIndexFromX(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.touches.length > 0) {
        updateIndexFromX(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, updateIndexFromX]);

  if (total === 0 || !currentSnapshot) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-[100px] bg-bg-secondary border-t border-border-default flex items-center justify-center text-text-muted">
        No snapshots loaded.
      </div>
    );
  }

  // Calculate year intervals to show at regular ticks
  const firstYear = new Date(snapshots[0].captured_at).getUTCFullYear();
  const lastYear = new Date(snapshots[total - 1].captured_at).getUTCFullYear();
  const yearDiff = lastYear - firstYear;
  
  const yearTicks: number[] = [];
  if (yearDiff <= 8) {
    for (let y = firstYear; y <= lastYear; y++) yearTicks.push(y);
  } else {
    // Generate ~6 evenly spaced years
    const step = yearDiff / 5;
    for (let i = 0; i <= 5; i++) {
      const year = Math.round(firstYear + i * step);
      if (!yearTicks.includes(year)) yearTicks.push(year);
    }
  }

  // Map year tick to pixel percentage
  const getYearLeftPercent = (year: number) => {
    if (total <= 1) return 0;
    const startMs = new Date(snapshots[0].captured_at).getTime();
    const endMs = new Date(snapshots[total - 1].captured_at).getTime();
    const targetMs = Date.UTC(year, 0, 1);
    
    if (targetMs <= startMs) return 0;
    if (targetMs >= endMs) return 100;
    
    return ((targetMs - startMs) / (endMs - startMs)) * 100;
  };

  const handleTrackMouseMove = (e: React.MouseEvent) => {
    if (!trackRef.current || total === 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = mouseX / rect.width;
    const hoverIdx = Math.round(percent * (total - 1));
    setHoveredIndex(hoverIdx);
    setTooltipPos({ x: e.clientX, y: rect.top - 50 });
  };

  const currentPercent = total > 1 ? (currentIndex / (total - 1)) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[100px] bg-bg-secondary border-t border-border-default px-6 py-4 flex flex-col justify-between select-none z-40 shadow-2xl">
      {/* Top controls: Play button & current snapshot details */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsPlaying(false);
              prev();
            }}
            className="p-1 text-text-secondary hover:text-gold transition-colors"
            title="Previous (Left Arrow)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 px-3 py-1 bg-bg-elevated border border-border-bright rounded-full text-gold hover:bg-border-subtle transition-all duration-200"
          >
            {isPlaying ? (
              <>
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-gold rounded-full" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              next();
            }}
            className="p-1 text-text-secondary hover:text-gold transition-colors"
            title="Next (Right Arrow)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <span className="text-text-muted text-[10px] font-mono ml-2">
            Snapshot {currentIndex + 1} of {total}
          </span>
        </div>

        {/* Current Date Display */}
        <div className="text-right">
          <span className="text-text-gold font-display text-sm font-semibold tracking-wide">
            {formatDate(currentSnapshot.captured_at)}
          </span>
        </div>
      </div>

      {/* Center timeline track and year tags */}
      <div className="relative mt-2">
        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseMove={handleTrackMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
          className="relative h-2 bg-bg-primary border border-border-subtle rounded-full cursor-pointer flex items-center"
        >
          {/* Progress bar fill */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gold/30 rounded-full"
            style={{ width: `${currentPercent}%` }}
          />

          {/* Individual snapshot circles */}
          {snapshots.map((snap, idx) => {
            const percent = total > 1 ? (idx / (total - 1)) * 100 : 0;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={snap.wayback_ts}
                className={`absolute w-1.5 h-1.5 rounded-full -ml-[3px] transition-transform ${
                  isCurrent
                    ? "bg-amber scale-150 z-20"
                    : "bg-border-bright hover:bg-amber hover:scale-125"
                }`}
                style={{ left: `${percent}%` }}
              />
            );
          })}

          {/* Draggable Scrubber handle */}
          <div
            className={`absolute w-5 h-5 bg-amber border-2 border-gold rounded-full -ml-2.5 shadow-lg flex items-center justify-center transition-shadow cursor-grab ${
              isDragging ? "cursor-grabbing shadow-gold/30" : "hover:scale-105"
            }`}
            style={{ left: `${currentPercent}%` }}
          >
            <div className="w-1.5 h-1.5 bg-bg-base rounded-full" />
          </div>
        </div>

        {/* Year Ticks Below Track */}
        <div className="relative h-4 mt-1 text-[10px] text-text-muted font-mono">
          {yearTicks.map((year) => {
            const left = getYearLeftPercent(year);
            return (
              <span
                key={year}
                className="absolute -translate-x-1/2"
                style={{ left: `${left}%` }}
              >
                {year}
              </span>
            );
          })}
        </div>
      </div>

      {/* Tooltip on Dot Hover */}
      {hoveredIndex !== null && snapshots[hoveredIndex] && (
        <div
          className="fixed bg-bg-elevated border border-border-bright text-text-primary px-3 py-1.5 rounded shadow-2xl text-[11px] font-mono pointer-events-none -translate-x-1/2 z-50 transition-opacity"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="text-gold font-bold">
            {formatDate(snapshots[hoveredIndex].captured_at)}
          </div>
          <div className="text-text-secondary truncate max-w-[200px]">
            {snapshots[hoveredIndex].page_title || "No Title"}
          </div>
        </div>
      )}
    </div>
  );
}
