"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-bg-base border-t border-border-subtle/50 py-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand Serif Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display text-lg font-bold text-text-primary tracking-wider group-hover:text-gold transition-colors">
              CHRONOS<span className="text-gold font-sans font-extrabold text-xs ml-1">V2</span>
            </span>
          </Link>

          {/* Architectural Notes */}
          <div className="text-[10px] font-mono text-text-secondary">
            Digital archaeology powered by <strong className="text-text-primary">Wayback Machine CDX</strong> & <strong className="text-text-primary">Anthropic Claude-3.5-Sonnet</strong>.
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
            <Link href="/" className="hover:text-gold transition-colors">[ Home ]</Link>
            <Link href="/dashboard" className="hover:text-teal transition-colors">[ Library ]</Link>
          </div>
        </div>

        <div className="border-t border-border-subtle/20 pt-6 flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-text-muted gap-4">
          <span>&copy; 2026 Chronos Lab. Open-source under MIT License.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            <span>Terminal status: Online</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
