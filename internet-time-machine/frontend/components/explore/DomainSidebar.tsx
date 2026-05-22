"use client";

import React, { useState } from "react";
import BiographyPanel from "./BiographyPanel";
import { useTimelineStore } from "@/store/timelineStore";
import { formatDate } from "@/lib/utils";

interface DomainSidebarProps {
  domain: string;
}

export default function DomainSidebar({ domain }: DomainSidebarProps) {
  const [activeTab, setActiveTab] = useState<"story" | "snapshots">("story");
  const { snapshots, currentIndex, setCurrentIndex, setIsPlaying } = useTimelineStore();

  const handleSnapshotClick = (index: number) => {
    setIsPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <div className="w-full lg:w-[350px] shrink-0 flex flex-col h-full bg-bg-primary rounded-xl overflow-hidden shadow-xl border border-border-subtle">
      {/* Tabs Header */}
      <div className="flex border-b border-border-default bg-bg-elevated p-1 select-none">
        <button
          onClick={() => setActiveTab("story")}
          className={`flex-1 py-2 text-xs font-mono font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "story"
              ? "bg-bg-secondary text-gold border border-border-bright"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>AI Story</span>
        </button>
        <button
          onClick={() => setActiveTab("snapshots")}
          className={`flex-1 py-2 text-xs font-mono font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "snapshots"
              ? "bg-bg-secondary text-gold border border-border-bright"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Snapshots ({snapshots.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 min-h-0">
        {activeTab === "story" ? (
          <BiographyPanel domain={domain} />
        ) : (
          <div className="h-full bg-bg-secondary border border-border-default rounded-xl p-4 overflow-y-auto pr-1.5 scrollbar-thin select-none">
            <div className="space-y-1">
              {snapshots.map((snap, idx) => {
                const isSelected = idx === currentIndex;
                return (
                  <button
                    key={snap.wayback_ts}
                    onClick={() => handleSnapshotClick(idx)}
                    className={`w-full px-3 py-2 text-left text-xs font-mono rounded-lg transition-all flex items-center justify-between gap-2 border ${
                      isSelected
                        ? "bg-gold/10 border-gold text-gold font-bold"
                        : "border-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                    }`}
                  >
                    <span className="truncate max-w-[200px]">
                      {snap.page_title || `${domain} Capture`}
                    </span>
                    <span className="shrink-0 text-[10px] text-text-muted">
                      {formatDate(snap.captured_at)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
