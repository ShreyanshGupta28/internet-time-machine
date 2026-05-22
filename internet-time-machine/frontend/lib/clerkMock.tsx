"use client";

import React from "react";

// Mock ClerkProvider that just passes through
export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Mock useAuth Hook returning fully authenticated state for offline preview
export function useAuth() {
  return {
    isSignedIn: true,
    isLoaded: true,
    userId: "mock_guest_explorer",
    getToken: async () => "mock_guest_jwt_token",
  };
}

// Mock useUser Hook returning a sleek demo profile
export function useUser() {
  return {
    user: {
      id: "mock_guest_explorer",
      firstName: "Temporal",
      lastName: "Explorer",
      imageUrl: "https://img.clerk.com/mock-avatar.png",
      emailAddresses: [{ emailAddress: "explorer@chronos.io" }],
    },
    isLoaded: true,
  };
}

// premium mock Sign In component
export function SignIn(props: any) {
  return (
    <div className="w-full max-w-md bg-bg-secondary border border-border-bright rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden select-none">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full filter blur-2xl pointer-events-none" />
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold text-text-primary tracking-wide">
          Sync Temporal Terminal
        </h2>
        <p className="text-xs text-text-secondary">
          Enter credentials to connect your private collection
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-text-muted">
            Terminal Access Email
          </label>
          <input
            type="email"
            value="explorer@chronos.io"
            disabled
            className="w-full bg-bg-input border border-border-default rounded-xl px-4 py-3 text-xs text-text-primary outline-none focus:border-gold transition-colors opacity-70 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-text-muted">
            Temporal Passkey
          </label>
          <input
            type="password"
            value="••••••••••••"
            disabled
            className="w-full bg-bg-input border border-border-default rounded-xl px-4 py-3 text-xs text-text-primary outline-none focus:border-gold transition-colors opacity-70 cursor-not-allowed"
          />
        </div>

        <button
          type="button"
          onClick={() => window.location.href = "/"}
          className="w-full py-3 bg-gradient-to-r from-gold to-gold-light text-bg-base text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] hover:shadow-gold/20"
        >
          Establish Secure Sync
        </button>
      </form>

      <div className="border-t border-border-subtle pt-4 text-center">
        <p className="text-[10px] text-text-muted font-mono leading-relaxed">
          Offline Terminal Mode Active.<br />
          Click above to return to the interactive timeline.
        </p>
      </div>
    </div>
  );
}

// premium mock Sign Up component
export function SignUp(props: any) {
  return (
    <div className="w-full max-w-md bg-bg-secondary border border-border-bright rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden select-none">
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 rounded-full filter blur-2xl pointer-events-none" />
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold text-text-primary tracking-wide">
          Provision Keycard
        </h2>
        <p className="text-xs text-text-secondary">
          Request cryptographic access credentials
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-text-muted">
              First Name
            </label>
            <input
              type="text"
              placeholder="Temporal"
              disabled
              className="w-full bg-bg-input border border-border-default rounded-xl px-4 py-3 text-xs text-text-primary outline-none focus:border-gold transition-colors opacity-70"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-text-muted">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Explorer"
              disabled
              className="w-full bg-bg-input border border-border-default rounded-xl px-4 py-3 text-xs text-text-primary outline-none focus:border-gold transition-colors opacity-70"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-text-muted">
            Request Email
          </label>
          <input
            type="email"
            value="explorer@chronos.io"
            disabled
            className="w-full bg-bg-input border border-border-default rounded-xl px-4 py-3 text-xs text-text-primary outline-none focus:border-gold transition-colors opacity-70 cursor-not-allowed"
          />
        </div>

        <button
          type="button"
          onClick={() => window.location.href = "/"}
          className="w-full py-3 bg-gradient-to-r from-gold to-gold-light text-bg-base text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] hover:shadow-gold/20"
        >
          Issue Cryptographic Key
        </button>
      </form>

      <div className="border-t border-border-subtle pt-4 text-center">
        <p className="text-[10px] text-text-muted font-mono leading-relaxed">
          Offline Terminal Mode Active.<br />
          Click above to register and enter.
        </p>
      </div>
    </div>
  );
}
