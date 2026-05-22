"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [urlInput, setUrlInput] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const popularShowcases = [
    { domain: "apple.com", label: "Apple", desc: "Minimalism to design titan", color: "from-amber to-gold" },
    { domain: "google.com", label: "Google", desc: "The minimalist search box", color: "from-blue to-teal" },
    { domain: "wikipedia.org", label: "Wikipedia", desc: "Universal cataloging", color: "from-purple to-pink" },
    { domain: "spacejam.com", label: "Space Jam", desc: "Frozen 1996 retro archive", color: "from-orange to-red" },
  ];

  const handleNormalizeAndExplore = (input: string) => {
    if (!input.trim()) {
      setErrorMessage("Please enter a valid website address.");
      return;
    }

    setErrorMessage("");
    setIsNavigating(true);

    // 1. Domain Parser Normalization
    let domain = input.trim().toLowerCase();
    
    // Remove protocol and sub-paths
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");
    domain = domain.split("/")[0];

    // Basic domain validation pattern
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    
    if (!domainRegex.test(domain)) {
      setErrorMessage("Please enter a valid domain name (e.g. apple.com).");
      setIsNavigating(false);
      return;
    }

    // 2. Redirect to temporal explore view
    router.push(`/explore/${encodeURIComponent(domain)}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNormalizeAndExplore(urlInput);
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-16 px-4 md:px-8 max-w-5xl mx-auto w-full select-none">
      {/* Decorative Gradient Background Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Main Hero Copy Container */}
      <div className="text-center space-y-6 max-w-3xl z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest rounded-full">
          <span className="w-1.5 h-1.5 bg-gold rounded-full animate-ping" />
          <span>Epoch Temporal Explorer</span>
        </span>

        <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-text-primary leading-tight tracking-wide">
          The Web's Interactive <br />
          <span className="bg-gradient-to-r from-gold via-gold-light to-teal bg-clip-text text-transparent">
            Time Machine
          </span>
        </h1>

        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl mx-auto">
          Embark on a digital archaeology expedition. Scrub through thirty years of layout changes, compare before-and-after evolution sliders, and stream AI biographies of the web's design epochs.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="w-full max-w-xl mt-10 z-10">
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div className="relative flex items-center bg-bg-secondary border border-border-default hover:border-gold-dim focus-within:border-gold rounded-2xl p-1.5 shadow-2xl transition-all">
            <input
              type="text"
              placeholder="Search website URL (e.g. apple.com, geocities.com)..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm text-text-primary px-4 py-3 outline-none min-w-0"
              disabled={isNavigating}
            />

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-bg-base text-xs font-mono font-extrabold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-bg-base border-t-transparent rounded-full animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <span>Chronos</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {errorMessage && (
            <p className="text-xs text-error/90 font-mono text-center">{errorMessage}</p>
          )}
        </form>
      </div>

      {/* Historical Showcase Cards Grid */}
      <div className="w-full max-w-4xl mt-16 z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-border-subtle/50 pb-2">
          <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
            Curated Showcase Museums
          </span>
          <span className="text-[9px] font-mono text-text-gold font-bold">
            Select to instant launch
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularShowcases.map((sc) => (
            <button
              key={sc.domain}
              onClick={() => handleNormalizeAndExplore(sc.domain)}
              disabled={isNavigating}
              className="bg-bg-secondary/40 border border-border-default/60 hover:border-gold/40 hover:bg-bg-secondary rounded-2xl p-5 text-left transition-all hover:translate-y-[-2px] group flex flex-col justify-between h-36 relative overflow-hidden active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {/* Highlight backdrop */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${sc.color} opacity-[0.03] group-hover:opacity-[0.08] rounded-full filter blur-xl transition-opacity`} />
              
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-text-muted group-hover:text-gold transition-colors uppercase">
                  {sc.domain}
                </span>
                <h4 className="font-display text-lg font-bold text-text-primary">
                  {sc.label}
                </h4>
              </div>

              <p className="text-[11px] text-text-secondary leading-normal">
                {sc.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
