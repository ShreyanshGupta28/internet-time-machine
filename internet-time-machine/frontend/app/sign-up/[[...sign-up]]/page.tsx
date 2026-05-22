"use client";

import React from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 select-none relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gold/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Brand Branding Details */}
      <div className="text-center space-y-2 mb-8 z-10">
        <h2 className="font-display text-3xl font-extrabold text-text-primary tracking-wide">
          Register New Account
        </h2>
        <p className="text-xs text-text-secondary font-mono">
          ESTABLISH CORRESPONDING TEMPORAL COORDINATES
        </p>
      </div>

      {/* Clerk Widget */}
      <div className="z-10 shadow-2xl rounded-2xl border border-border-default/40 overflow-hidden bg-bg-secondary">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          afterSignUpUrl="/dashboard"
        />
      </div>
    </div>
  );
}
