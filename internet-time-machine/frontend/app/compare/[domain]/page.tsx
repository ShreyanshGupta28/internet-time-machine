"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDomainHistory } from "@/hooks/useDomainHistory";
import { Snapshot } from "@/types/domain";
import ComparisonSlider from "@/components/compare/ComparisonSlider";
import DateSelector from "@/components/compare/DateSelector";
import { formatDate } from "@/lib/utils";

function getElapsedDuration(startStr: string, endStr: string) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";
  let diffMs = end.getTime() - start.getTime();
  const isReverse = diffMs < 0;
  if (isReverse) diffMs = -diffMs;

  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  diffMs -= years * (1000 * 60 * 60 * 24 * 365.25);
  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375));
  diffMs -= months * (1000 * 60 * 60 * 24 * 30.4375);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const parts = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);

  return {
    text: parts.join(", "),
    isReverse,
  };
}

export default function ComparePage() {
  const params = useParams();
  const rawDomain = params.domain as string;
  const domain = decodeURIComponent(rawDomain);

  const { data, isLoading, isError, error } = useDomainHistory(domain);

  const [beforeSnapshot, setBeforeSnapshot] = useState<Snapshot | null>(null);
  const [afterSnapshot, setAfterSnapshot] = useState<Snapshot | null>(null);

  // Initialize selected snapshots (defaulting to first as oldest, and last as newest)
  useEffect(() => {
    if (data?.snapshots && data.snapshots.length > 0) {
      setBeforeSnapshot(data.snapshots[0]);
      setAfterSnapshot(data.snapshots[data.snapshots.length - 1]);
    }
  }, [data?.snapshots]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] select-none">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-border-default rounded-full" />
          <div className="absolute inset-0 border-4 border-t-gold rounded-full animate-spin" />
        </div>
        <h3 className="font-display text-lg font-bold text-text-primary mt-6 tracking-wide">
          Syncing Epoch Timelines
        </h3>
        <p className="text-text-secondary text-xs mt-2 font-mono">
          Loading comparison dashboard...
        </p>
      </div>
    );
  }

  if (isError || !data || !data.snapshots || data.snapshots.length === 0) {
    const errDetail: any = error;
    const msg =
      errDetail?.detail?.message ||
      errDetail?.detail ||
      "Could not retrieve comparison records.";
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] p-6 text-center select-none">
        <div className="w-16 h-16 bg-error/10 border border-error/20 rounded-full flex items-center justify-center text-error mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="font-display text-xl font-bold text-text-primary mb-2">
          Comparison Retrieval Failure
        </h3>
        <p className="text-text-secondary text-xs max-w-sm mb-6 leading-relaxed">{msg}</p>
        <Link
          href={`/explore/${encodeURIComponent(domain)}`}
          className="px-5 py-2 bg-gold text-bg-base font-semibold hover:bg-gold-light rounded-lg text-xs tracking-wider transition-all"
        >
          Return to Explore
        </Link>
      </div>
    );
  }

  const durationObj =
    beforeSnapshot && afterSnapshot
      ? getElapsedDuration(beforeSnapshot.captured_at, afterSnapshot.captured_at)
      : null;

  return (
    <div className="flex-1 flex flex-col gap-6 pb-[120px] max-w-7xl mx-auto w-full px-4 md:px-6">
      {/* Top Header Section */}
      <div className="bg-bg-secondary border border-border-default rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg select-none">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-text-gold uppercase font-bold">
            Interactive Comparison Slider
          </span>
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-wide flex items-center gap-2 mt-1">
            <span>{data.domain}</span>
            <span className="text-text-secondary font-sans text-lg font-normal">
              — Evolution Comparison
            </span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Drag the gold handle or press Left/Right arrow keys to scrub between retro and modern Web eras.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/explore/${encodeURIComponent(domain)}`}
            className="px-4 py-2.5 bg-bg-elevated border border-border-bright hover:border-gold rounded-xl text-xs font-semibold text-text-primary flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Explorer</span>
          </Link>
        </div>
      </div>

      {/* Main Compare Views */}
      {beforeSnapshot && afterSnapshot && (
        <div className="grid grid-cols-1 gap-6">
          {/* Comparison Slider component */}
          <ComparisonSlider
            domain={data.domain}
            beforeSnapshot={beforeSnapshot}
            afterSnapshot={afterSnapshot}
          />

          {/* Snapshot Date Selector */}
          <DateSelector
            snapshots={data.snapshots}
            beforeSnapshot={beforeSnapshot}
            afterSnapshot={afterSnapshot}
            onBeforeSelect={setBeforeSnapshot}
            onAfterSelect={setAfterSnapshot}
          />

          {/* Detailed Statistics delta card */}
          {durationObj && (
            <div className="bg-bg-secondary border border-border-default rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
                  Temporal Chronological Delta
                </span>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  {durationObj.isReverse ? "Negative Time Delta" : "Time Separation"}
                </h3>
                <p className="text-sm text-text-secondary">
                  These two snapshots are separated by{" "}
                  <strong className="text-text-primary font-mono">{durationObj.text}</strong> of
                  Internet history.
                </p>
                {durationObj.isReverse && (
                  <p className="text-xs text-error/80 italic font-mono">
                    Note: Your "Before" date is selected after your "After" date.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 bg-bg-base border border-border-subtle rounded-xl p-4 md:w-96">
                <div>
                  <span className="block text-[9px] font-mono uppercase text-text-muted">
                    Before capture
                  </span>
                  <span className="text-xs text-gold font-bold font-mono">
                    {formatDate(beforeSnapshot.captured_at)}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono uppercase text-text-muted">
                    After capture
                  </span>
                  <span className="text-xs text-teal font-bold font-mono">
                    {formatDate(afterSnapshot.captured_at)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
