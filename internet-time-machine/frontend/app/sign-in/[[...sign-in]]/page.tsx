"use client";

import React from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 select-none relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gold/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Brand Branding Details */}
      <div className="text-center space-y-2 mb-8 z-10">
        <h2 className="font-display text-3xl font-extrabold text-text-primary tracking-wide">
          Terminal Authentication
        </h2>
        <p className="text-xs text-text-secondary font-mono">
          CHRONOS EPOCH ENGINE SECURITY GATEWAY
        </p>
      </div>

      {/* Clerk Widget */}
      <div className="z-10 shadow-2xl rounded-2xl border border-border-default/40 overflow-hidden bg-bg-secondary">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
        />
      </div>
    </div>
  );
}
