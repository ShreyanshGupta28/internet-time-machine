"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DomainMetadata } from "@/types/domain";
import BookmarkButton from "../shared/BookmarkButton";

interface SnapshotToolbarProps {
  domainMetadata: DomainMetadata;
}

export default function SnapshotToolbar({ domainMetadata }: SnapshotToolbarProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsSearching(true);
    let domain = searchInput.trim().toLowerCase();
    
    // Normalize domain
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");
    domain = domain.split("/")[0];

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (domainRegex.test(domain)) {
      router.push(`/explore/${encodeURIComponent(domain)}`);
      setSearchInput("");
    } else {
      alert("Please enter a valid website address (e.g. google.com)");
    }
    setIsSearching(false);
  };

  return (
    <div className="bg-bg-secondary border border-border-default rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none">
      {/* Title & Metadata stats */}
      <div className="shrink-0">
        <h2 className="font-display text-xl font-bold text-text-primary tracking-wide flex items-center gap-2">
          <span>{domainMetadata.domain}</span>
        </h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary mt-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            First captured: <strong>{domainMetadata.first_captured || "Unknown"}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-teal rounded-full" />
            Last captured: <strong>{domainMetadata.last_captured || "Unknown"}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber rounded-full" />
            Snapshots: <strong>{domainMetadata.total_snapshots || domainMetadata.snapshots.length}</strong>
          </span>
        </div>
      </div>

      {/* Exploration Compact Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-grow max-w-sm w-full md:mx-4">
        <div className="relative flex items-center bg-bg-base border border-border-subtle hover:border-gold-dim focus-within:border-gold rounded-xl p-1 shadow-md transition-all">
          <svg className="w-4 h-4 text-text-muted ml-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search another website..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={isSearching}
            className="flex-grow bg-transparent border-none text-xs text-text-primary pl-2 pr-2 py-1.5 outline-none min-w-0 font-mono"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-3 py-1.5 bg-gold text-bg-base text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-gold-light transition-all flex items-center gap-1 active:scale-95 shrink-0"
          >
            {isSearching ? (
              <span className="w-2.5 h-2.5 border border-bg-base border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Chronos</span>
            )}
          </button>
        </div>
      </form>

      {/* Action buttons */}
      <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
        <BookmarkButton domain={domainMetadata.domain} />
        
        <Link
          href={`/compare/${domainMetadata.domain}`}
          className="flex-1 md:flex-initial px-4 py-2 bg-bg-elevated border border-border-bright hover:border-gold rounded-lg text-xs font-semibold text-text-primary hover:text-text-primary flex items-center justify-center gap-1.5 transition-all"
        >
          <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>Compare Eras</span>
        </Link>
      </div>
    </div>
  );
}
