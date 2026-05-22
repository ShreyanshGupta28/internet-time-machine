"use client";

import React, { useState, useMemo } from "react";
import { SavedDomain } from "@/types/domain";
import SavedCard from "./SavedCard";
import Link from "next/link";

interface SavedGridProps {
  bookmarks: SavedDomain[];
  onUpdateNote: (domain: string, note: string | null) => Promise<void>;
  onDelete: (domain: string) => Promise<void>;
}

type SortOption = "date-desc" | "date-asc" | "alpha-asc" | "alpha-desc";

export default function SavedGrid({ bookmarks, onUpdateNote, onDelete }: SavedGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  // Filter & Sort Bookmarks
  const processedBookmarks = useMemo(() => {
    let result = [...bookmarks];

    // 1. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((b) => b.domain.toLowerCase().includes(q));
    }

    // 2. Sort results
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.saved_at).getTime() - new Date(b.saved_at).getTime();
      }
      if (sortBy === "alpha-asc") {
        return a.domain.localeCompare(b.domain);
      }
      if (sortBy === "alpha-desc") {
        return b.domain.localeCompare(a.domain);
      }
      return 0;
    });

    return result;
  }, [bookmarks, searchQuery, sortBy]);

  if (bookmarks.length === 0) {
    return (
      <div className="bg-bg-secondary border border-border-default rounded-2xl p-12 text-center max-w-xl mx-auto shadow-2xl select-none">
        <div className="w-16 h-16 bg-gold/10 border border-gold-dim rounded-full flex items-center justify-center text-gold mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-bold text-text-primary mb-3">
          Your Library is Empty
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-8">
          You haven't bookmarked any internet history domains yet. Search a website, inspect its snapshots, and bookmark it to begin building your personal timeline museum.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-gold text-bg-base font-bold rounded-xl hover:bg-gold-light transition-all shadow-lg"
        >
          Explore Web Archives
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtering and Search Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-bg-secondary border border-border-default rounded-2xl p-4 shadow-lg select-none">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search saved libraries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-input border border-border-default focus:border-gold rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary outline-none transition-all"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase hidden md:inline">
            Sort by:
          </span>
          <div className="relative w-full sm:w-44">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-bg-input border border-border-default hover:border-gold-dim rounded-xl px-3 py-2.5 text-xs text-text-primary outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="date-desc">Newest Bookmarked</option>
              <option value="date-asc">Oldest Bookmarked</option>
              <option value="alpha-asc">Domain (A - Z)</option>
              <option value="alpha-desc">Domain (Z - A)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gold">
              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      {processedBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedBookmarks.map((bookmark) => (
            <SavedCard
              key={bookmark.id}
              bookmark={bookmark}
              onUpdateNote={onUpdateNote}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-bg-secondary border border-border-default border-dashed rounded-2xl p-12 text-center select-none">
          <p className="text-text-secondary text-sm">
            No bookmarked domains match your filter "{searchQuery}".
          </p>
        </div>
      )}
    </div>
  );
}
