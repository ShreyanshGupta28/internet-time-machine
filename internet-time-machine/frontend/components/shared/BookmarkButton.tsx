"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSaved } from "@/hooks/useSaved";
import { motion, AnimatePresence } from "framer-motion";

interface BookmarkButtonProps {
  domain: string;
}

export default function BookmarkButton({ domain }: BookmarkButtonProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { savedQuery, saveMutation, deleteMutation } = useSaved();
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState("");

  if (!isLoaded) {
    return <div className="w-8 h-8 skeleton rounded-lg" />;
  }

  if (!isSignedIn) {
    return null; // hide for unauthenticated users, or show disabled/prompt
  }

  const savedList = savedQuery.data?.saved || [];
  const isBookmarked = savedList.some(
    (item) => item.domain.toLowerCase() === domain.toLowerCase()
  );

  const handleToggle = () => {
    if (isBookmarked) {
      deleteMutation.mutate(domain);
    } else {
      setShowModal(true);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(
      { domain, personalNote: note.trim() || undefined },
      {
        onSuccess: () => {
          setShowModal(false);
          setNote("");
        },
      }
    );
  };

  const isMutating = saveMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        disabled={isMutating}
        className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
          isBookmarked
            ? "bg-gold/15 border-gold text-gold"
            : "border-border-bright text-text-secondary hover:text-text-primary hover:border-gold-light"
        }`}
        title={isBookmarked ? "Remove from Library" : "Bookmark to Library"}
      >
        {isMutating ? (
          <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin" />
        ) : isBookmarked ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        )}
      </motion.button>

      {/* Note Creator Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-bg-base/80 flex items-center justify-center p-4 z-50 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-secondary border border-border-bright max-w-sm w-full rounded-xl overflow-hidden shadow-2xl p-5"
            >
              <h3 className="font-display text-base font-bold text-text-primary mb-1">Add to Library</h3>
              <p className="text-text-secondary text-[11px] mb-4">
                Bookmark <span className="text-gold font-mono">{domain}</span> to your personal dashboard.
              </p>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1.5">
                    Personal Note (Optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. My childhood social network or First portfolio design"
                    rows={3}
                    maxLength={200}
                    className="w-full bg-bg-primary border border-border-subtle rounded-lg p-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold tracking-wide transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setNote("");
                    }}
                    className="px-3 py-1.5 border border-border-bright hover:bg-bg-elevated text-text-secondary hover:text-text-primary rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-gold text-bg-base font-semibold hover:bg-gold-light rounded-lg transition-colors"
                  >
                    Bookmark
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
