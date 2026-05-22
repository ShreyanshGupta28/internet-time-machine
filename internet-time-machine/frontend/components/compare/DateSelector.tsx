"use client";

import React from "react";
import { Snapshot } from "@/types/domain";
import { formatDate } from "@/lib/utils";

interface DateSelectorProps {
  snapshots: Snapshot[];
  beforeSnapshot: Snapshot;
  afterSnapshot: Snapshot;
  onBeforeSelect: (snapshot: Snapshot) => void;
  onAfterSelect: (snapshot: Snapshot) => void;
}

export default function DateSelector({
  snapshots,
  beforeSnapshot,
  afterSnapshot,
  onBeforeSelect,
  onAfterSelect,
}: DateSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-bg-secondary border border-border-default rounded-2xl p-6 shadow-xl">
      {/* Before / Retro Snapshot Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-mono tracking-widest text-text-muted uppercase">
          Select Retro Era (Before)
        </label>
        <div className="relative">
          <select
            value={beforeSnapshot.wayback_ts}
            onChange={(e) => {
              const selected = snapshots.find((s) => s.wayback_ts === e.target.value);
              if (selected) onBeforeSelect(selected);
            }}
            className="w-full bg-bg-input border border-border-default hover:border-gold-dim focus:border-gold rounded-xl px-4 py-3 text-sm text-text-primary outline-none transition-all appearance-none cursor-pointer"
          >
            {snapshots.map((snap) => (
              <option
                key={`before-${snap.wayback_ts}`}
                value={snap.wayback_ts}
                className="bg-bg-secondary text-text-primary"
              >
                {formatDate(snap.captured_at)} — {snap.page_title ? (snap.page_title.length > 40 ? snap.page_title.substring(0, 40) + "..." : snap.page_title) : "No Title"}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gold">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {beforeSnapshot.page_title && (
          <p className="text-xs text-text-secondary italic line-clamp-1">
            "{beforeSnapshot.page_title}"
          </p>
        )}
      </div>

      {/* After / Modern Snapshot Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-mono tracking-widest text-text-muted uppercase">
          Select Modern Era (After)
        </label>
        <div className="relative">
          <select
            value={afterSnapshot.wayback_ts}
            onChange={(e) => {
              const selected = snapshots.find((s) => s.wayback_ts === e.target.value);
              if (selected) onAfterSelect(selected);
            }}
            className="w-full bg-bg-input border border-border-default hover:border-teal focus:border-teal rounded-xl px-4 py-3 text-sm text-text-primary outline-none transition-all appearance-none cursor-pointer"
          >
            {snapshots.map((snap) => (
              <option
                key={`after-${snap.wayback_ts}`}
                value={snap.wayback_ts}
                className="bg-bg-secondary text-text-primary"
              >
                {formatDate(snap.captured_at)} — {snap.page_title ? (snap.page_title.length > 40 ? snap.page_title.substring(0, 40) + "..." : snap.page_title) : "No Title"}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-teal">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {afterSnapshot.page_title && (
          <p className="text-xs text-text-secondary italic line-clamp-1">
            "{afterSnapshot.page_title}"
          </p>
        )}
      </div>
    </div>
  );
}
