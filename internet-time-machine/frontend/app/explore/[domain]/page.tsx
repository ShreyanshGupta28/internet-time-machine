"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDomainHistory } from "@/hooks/useDomainHistory";
import { useTimelineStore } from "@/store/timelineStore";
import SnapshotViewer from "@/components/explore/SnapshotViewer";
import DomainSidebar from "@/components/explore/DomainSidebar";
import SnapshotToolbar from "@/components/explore/SnapshotToolbar";
import TimelineNavigator from "@/components/explore/TimelineNavigator";

export default function ExplorePage() {
  const params = useParams();
  const rawDomain = params.domain as string;
  const domain = decodeURIComponent(rawDomain);

  const { data, isLoading, isError, error } = useDomainHistory(domain);
  const setSnapshots = useTimelineStore((state) => state.setSnapshots);

  // Sync snapshot results into global Zustand store on load
  useEffect(() => {
    if (data?.snapshots) {
      setSnapshots(data.snapshots);
    }
  }, [data?.snapshots, setSnapshots]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] select-none">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-border-default rounded-full" />
          <div className="absolute inset-0 border-4 border-t-gold rounded-full animate-spin" />
        </div>
        <h3 className="font-display text-lg font-bold text-text-primary mt-6 tracking-wide">Initializing Time Machine</h3>
        <p className="text-text-secondary text-xs mt-2 font-mono">Retrieving snapshots from Wayback Machine...</p>
      </div>
    );
  }

  if (isError || !data) {
    const errDetail: any = error;
    const msg = errDetail?.detail?.message || errDetail?.detail || "Could not retrieve historical archives.";
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] p-6 text-center select-none">
        <div className="w-16 h-16 bg-error/10 border border-error/20 rounded-full flex items-center justify-center text-error mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="font-display text-xl font-bold text-text-primary mb-2">Temporal Connection Failure</h3>
        <p className="text-text-secondary text-xs max-w-sm mb-6 leading-relaxed">
          {msg}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 bg-gold text-bg-base font-semibold hover:bg-gold-light rounded-lg text-xs tracking-wider transition-all"
        >
          Re-establish Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4 pb-[120px] max-w-7xl mx-auto w-full px-4 md:px-6">
      {/* Top controls & search details */}
      <SnapshotToolbar domainMetadata={data} />

      {/* Main interaction panels split: Sidebar & Viewport mock */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-6 min-h-0">
        <DomainSidebar domain={data.domain} />
        <SnapshotViewer />
      </div>

      {/* Scrubber Navigation overlay */}
      <TimelineNavigator />
    </div>
  );
}
