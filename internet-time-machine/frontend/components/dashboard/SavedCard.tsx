"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SavedDomain } from "@/types/domain";
import { formatDate } from "@/lib/utils";

interface SavedCardProps {
  bookmark: SavedDomain;
  onUpdateNote: (domain: string, note: string | null) => Promise<void>;
  onDelete: (domain: string) => Promise<void>;
}

export default function SavedCard({ bookmark, onUpdateNote, onDelete }: SavedCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState(bookmark.personal_note || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveNote = async () => {
    setIsSaving(true);
    try {
      await onUpdateNote(bookmark.domain, noteContent.trim() ? noteContent.trim() : null);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelNote = () => {
    setNoteContent(bookmark.personal_note || "");
    setIsEditing(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(bookmark.domain);
    } catch (err) {
      console.error("Failed to delete bookmark:", err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-bg-secondary border border-border-default hover:border-gold/40 rounded-2xl p-6 shadow-xl transition-all hover:translate-y-[-2px] flex flex-col justify-between gap-6 group relative overflow-hidden">
      {/* Decorative Gold Glow Header Backdrop */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/50 via-gold to-teal/50 opacity-50 group-hover:opacity-100 transition-opacity" />

      {/* Main Info */}
      <div className="space-y-4">
        {/* Domain name and main navigation */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-xl font-bold text-text-primary tracking-wide break-all">
              {bookmark.domain}
            </h3>
            <span className="block text-[10px] font-mono text-text-muted">
              Bookmarked: {formatDate(bookmark.saved_at)}
            </span>
          </div>

          {/* Delete action button */}
          {!isDeleting ? (
            <button
              onClick={() => setIsDeleting(true)}
              className="text-text-muted hover:text-error/80 transition-colors p-1"
              title="Delete Bookmark"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteConfirm}
                className="px-2 py-1 bg-error/20 border border-error/40 text-error rounded text-[10px] font-bold uppercase transition-all"
              >
                Confirm
              </button>
              <button
                onClick={() => setIsDeleting(false)}
                className="px-2 py-1 bg-bg-elevated border border-border-default text-text-secondary rounded text-[10px] uppercase transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Temporal Stats */}
        <div className="grid grid-cols-2 gap-4 bg-bg-base/40 border border-border-subtle rounded-xl p-3 text-[11px]">
          <div>
            <span className="block text-[8px] font-mono uppercase text-text-muted">
              Earliest Captured
            </span>
            <span className="font-bold text-gold font-mono">
              {bookmark.first_captured ? formatDate(bookmark.first_captured) : "N/A"}
            </span>
          </div>
          <div>
            <span className="block text-[8px] font-mono uppercase text-text-muted">
              Latest Snapshot
            </span>
            <span className="font-bold text-teal font-mono">
              {bookmark.latest_snapshot_ts
                ? formatDate(
                    bookmark.latest_snapshot_ts.substring(0, 4) +
                      "-" +
                      bookmark.latest_snapshot_ts.substring(4, 6) +
                      "-" +
                      bookmark.latest_snapshot_ts.substring(6, 8)
                  )
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Note Box */}
        <div className="space-y-1.5 pt-2 border-t border-border-subtle/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
              Research Notes
            </span>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-[10px] font-mono text-gold hover:text-gold-light transition-colors"
              >
                [ Edit ]
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2 mt-2">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write observations about layout shift, typography, typography evolution, and brand voice changes..."
                className="w-full bg-bg-input border border-border-default focus:border-gold rounded-lg p-2.5 text-xs text-text-primary outline-none transition-all resize-none min-h-[70px]"
                maxLength={400}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelNote}
                  className="px-2.5 py-1 bg-bg-elevated text-text-secondary hover:text-text-primary border border-border-default rounded text-[10px] font-medium transition-all"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-2.5 py-1 bg-gold text-bg-base hover:bg-gold-light font-bold rounded text-[10px] transition-all flex items-center gap-1"
                  disabled={isSaving}
                >
                  {isSaving && <span className="w-2.5 h-2.5 border-2 border-bg-base border-t-transparent rounded-full animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-secondary leading-relaxed bg-bg-input/20 border border-border-subtle/30 rounded-lg p-3 italic min-h-[50px]">
              {bookmark.personal_note ? `"${bookmark.personal_note}"` : "No notes recorded. Tap Edit to add observations."}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Call-to-Actions */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <Link
          href={`/explore/${encodeURIComponent(bookmark.domain)}`}
          className="px-3 py-2 bg-bg-elevated border border-border-bright hover:border-gold rounded-xl text-center text-xs font-semibold text-text-primary hover:text-text-primary flex items-center justify-center gap-1.5 transition-all shadow-md"
        >
          <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span>Explore</span>
        </Link>

        <Link
          href={`/compare/${encodeURIComponent(bookmark.domain)}`}
          className="px-3 py-2 bg-bg-elevated border border-border-bright hover:border-teal rounded-xl text-center text-xs font-semibold text-text-primary hover:text-text-primary flex items-center justify-center gap-1.5 transition-all shadow-md"
        >
          <svg className="w-3.5 h-3.5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          <span>Compare</span>
        </Link>
      </div>
    </div>
  );
}
