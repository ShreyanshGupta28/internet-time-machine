"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Explore", href: "/" },
    { name: "Dashboard", href: "/dashboard", protected: true },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname.startsWith("/explore")) return true;
    return pathname === path;
  };

  return (
    <nav className="bg-bg-secondary/80 backdrop-blur-md border-b border-border-subtle/50 sticky top-0 z-50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-amber flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-bg-base" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="font-display text-lg font-bold text-text-primary tracking-wider group-hover:text-gold transition-colors">
                CHRONOS<span className="text-gold font-sans font-extrabold text-xs ml-1">V2</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-mono uppercase tracking-widest transition-all ${
                    active
                      ? "text-gold font-bold border-b border-gold pb-1"
                      : "text-text-secondary hover:text-text-primary hover:translate-y-[-1px]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Authentication Slots */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-xs font-mono uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-bg-base text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-text-primary focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-bg-secondary border-b border-border-default/60 py-4 px-6 space-y-4">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-xs font-mono uppercase tracking-wider block py-2 ${
                    active ? "text-gold font-bold" : "text-text-secondary"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-border-subtle/50 pt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Link
                href="/sign-in"
                onClick={() => setIsOpen(false)}
                className="text-xs font-mono uppercase text-center tracking-wider text-text-secondary block py-2"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 bg-gold text-bg-base text-center text-xs font-mono font-bold uppercase tracking-wider rounded-xl block shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
