"use client";

import React, { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console
    try {
      console.error("Explore error boundary caught:", error);
    } catch (_) {}
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] p-6 text-center select-none max-w-xl mx-auto">
      <div className="w-16 h-16 bg-error/10 border border-error/20 rounded-full flex items-center justify-center text-error mb-4">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="font-display text-xl font-bold text-text-primary mb-2">Temporal Anomaly Detected</h3>
      <p className="text-text-secondary text-xs mb-6 leading-relaxed">
        The explore view encountered an internal render error: <span className="font-mono bg-bg-secondary p-1 border border-border-subtle rounded text-gold">{error.message || "Unknown anomaly"}</span>
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="px-5 py-2 bg-gold text-bg-base font-semibold hover:bg-gold-light rounded-lg text-xs tracking-wider transition-all"
        >
          Reset Engine
        </button>
        <button
          onClick={() => window.location.href = "/"}
          className="px-5 py-2 bg-bg-elevated border border-border-bright text-text-secondary hover:text-text-primary rounded-lg text-xs font-semibold tracking-wider transition-all"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
