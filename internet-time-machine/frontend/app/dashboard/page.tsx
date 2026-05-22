"use client";

import React from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import useSaved from "@/hooks/useSaved";
import SavedGrid from "@/components/dashboard/SavedGrid";
import Link from "next/link";

export default function DashboardPage() {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { savedQuery, deleteMutation, updateMutation } = useSaved();

  const isLoaded = isAuthLoaded && isUserLoaded;

  // 1. Auth Loading State
  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] select-none">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-border-default rounded-full" />
          <div className="absolute inset-0 border-4 border-t-gold rounded-full animate-spin" />
        </div>
        <h3 className="font-display text-lg font-bold text-text-primary mt-6 tracking-wide">
          Syncing Temporal Keycard
        </h3>
        <p className="text-text-secondary text-xs mt-2 font-mono">
          Authenticating terminal session...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!isSignedIn) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] p-6 text-center select-none">
        <div className="w-16 h-16 bg-error/10 border border-error/20 rounded-full flex items-center justify-center text-error mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-bold text-text-primary mb-3">
          Restricted Temporal Access
        </h3>
        <p className="text-text-secondary text-sm max-w-sm mb-8 leading-relaxed">
          The dashboard lists your personalized timeline bookmarks and research notes. Please authenticate to access your temporal collection.
        </p>
        <Link
          href="/sign-in"
          className="px-6 py-3 bg-gold text-bg-base font-bold rounded-xl hover:bg-gold-light transition-all shadow-lg text-sm"
        >
          Authenticate Terminal
        </Link>
      </div>
    );
  }

  // 3. Query States
  const { data, isLoading: isQueryLoading, isError, error } = savedQuery;

  const handleUpdateNote = async (domain: string, note: string | null) => {
    await updateMutation.mutateAsync({ domain, personalNote: note });
  };

  const handleDeleteBookmark = async (domain: string) => {
    await deleteMutation.mutateAsync(domain);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 pb-[120px] max-w-7xl mx-auto w-full px-4 md:px-6">
      {/* Dashboard Greeting Header */}
      <div className="bg-bg-secondary border border-border-default rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg select-none relative overflow-hidden">
        {/* Glow backdrop decorator */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="space-y-1 z-10">
          <span className="text-[10px] font-mono tracking-widest text-text-gold uppercase font-bold">
            Private Collections Terminal
          </span>
          <h1 className="font-display text-3xl font-bold text-text-primary tracking-wide">
            Welcome back, {user?.firstName || "Explorer"}
          </h1>
          <p className="text-xs text-text-secondary">
            Manage your curated domains, edit layout analysis notes, and re-launch snapshots in the explorer.
          </p>
        </div>

        {/* Counter Widget */}
        <div className="bg-bg-base border border-border-subtle rounded-2xl px-6 py-4 flex flex-col justify-center items-center md:items-end gap-0.5 min-w-44 z-10">
          <span className="text-[8px] font-mono uppercase text-text-muted tracking-wider">
            Curated Museums
          </span>
          <span className="text-3xl font-extrabold text-gold font-mono leading-none">
            {data?.saved?.length || 0}
          </span>
          <span className="text-[9px] font-mono text-text-secondary mt-1">
            Web domains saved
          </span>
        </div>
      </div>

      {/* Main Saved Books Display */}
      {isQueryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={`shimmer-${i}`}
              className="bg-bg-secondary border border-border-default rounded-2xl p-6 h-[280px] flex flex-col justify-between select-none"
            >
              <div className="space-y-4">
                <div className="h-6 w-32 skeleton" />
                <div className="h-4 w-24 skeleton" />
                <div className="h-12 w-full skeleton mt-4" />
                <div className="h-16 w-full skeleton mt-4" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="h-9 skeleton" />
                <div className="h-9 skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-bg-secondary border border-border-default rounded-2xl p-12 text-center max-w-xl mx-auto shadow-2xl select-none">
          <div className="w-16 h-16 bg-error/10 border border-error/20 rounded-full flex items-center justify-center text-error mx-auto mb-4">
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
            Failed to Load Library
          </h3>
          <p className="text-text-secondary text-xs leading-relaxed mb-6">
            {(error as any)?.message || "A secure server connection could not be made."}
          </p>
          <button
            onClick={() => savedQuery.refetch()}
            className="px-5 py-2 bg-gold text-bg-base font-semibold hover:bg-gold-light rounded-lg text-xs tracking-wider transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <SavedGrid
          bookmarks={data?.saved || []}
          onUpdateNote={handleUpdateNote}
          onDelete={handleDeleteBookmark}
        />
      )}
    </div>
  );
}
