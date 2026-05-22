"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Biography, DesignEra, KeyMoment } from "@/types/domain";
import { formatDate } from "@/lib/utils";

interface BiographyPanelProps {
  domain: string;
}

export default function BiographyPanel({ domain }: BiographyPanelProps) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  
  const [status, setStatus] = useState<"idle" | "loading" | "streaming" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [tokens, setTokens] = useState("");
  const [biography, setBiography] = useState<Biography | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // 1. Check if biography exists on mount/domain changes
  useEffect(() => {
    let active = true;
    setStatus("loading");
    setTokens("");
    setBiography(null);

    const checkCachedBiography = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/biography/${domain}`);
        if (response.ok) {
          const data = await response.json();
          if (active) {
            setBiography(data);
            setStatus("done");
          }
        } else if (response.status === 404) {
          if (active) setStatus("idle");
        } else {
          if (active) setStatus("error");
        }
      } catch (err) {
        if (active) {
          logger.error(err);
          setStatus("idle"); // Fallback to idle so they can try generating
        }
      }
    };

    checkCachedBiography();

    return () => {
      active = false;
    };
  }, [domain, BACKEND_URL]);

  // Scroll to bottom as tokens arrive during streaming
  useEffect(() => {
    if (scrollRef.current && status === "streaming") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [tokens, status]);

  // 2. SSE Streaming Call
  const generateBiography = async () => {
    if (!isSignedIn) return;
    setStatus("loading");
    setTokens("");
    setErrorMessage("");

    try {
      const token = await getToken();
      
      // Fetch via Next.js SSE proxy route
      const response = await fetch(`/api/biography-stream?domain=${domain}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errObj = await response.json().catch(() => ({}));
        throw new Error(errObj.detail || "Story generation failed.");
      }

      setStatus("streaming");
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Stream reader not supported.");

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // keep incomplete line

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(cleanLine.slice(6));
            if (data.type === "token") {
              setTokens((prev) => prev + data.content);
            } else if (data.type === "complete") {
              setBiography(data.biography);
              setStatus("done");
            } else if (data.type === "error") {
              throw new Error(data.message || "Failed during streaming.");
            }
          } catch (jsonErr) {
            // Ignore partial lines or parse failures
          }
        }
      }
    } catch (err: any) {
      logger.error(err);
      setErrorMessage(err.message || "An unexpected error occurred during generation.");
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary border border-border-default rounded-xl p-4 overflow-hidden relative">
      {/* Scrollable Container */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-1.5 scrollbar-thin">
        
        {/* State: Idle / 404 (Prompt generation) */}
        {status === "idle" && (
          <div className="flex flex-col items-center justify-center text-center p-6 min-h-[300px]">
            <div className="w-12 h-12 bg-gold/10 border border-gold-dim rounded-full flex items-center justify-center text-gold mb-4 animate-pulse">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-display text-base font-bold text-text-primary mb-2">Unwritten Story</h3>
            <p className="text-text-secondary text-xs max-w-xs mb-6 leading-relaxed">
              Every website has a journey. Let our AI digital historian reconstruct the design timeline and milestones for <strong className="text-text-primary">{domain}</strong>.
            </p>
            {isLoaded ? (
              isSignedIn ? (
                <button
                  onClick={generateBiography}
                  className="px-5 py-2 bg-gold text-bg-base font-semibold hover:bg-gold-light rounded-lg text-xs tracking-wider transition-all duration-200"
                >
                  Generate Biography
                </button>
              ) : (
                <div className="text-xs text-text-muted bg-bg-primary border border-border-subtle p-3 rounded-lg">
                  Please sign in to generate this website biography.
                </div>
              )
            ) : (
              <div className="w-24 h-8 skeleton" />
            )}
          </div>
        )}

        {/* State: Loading / Skeletons */}
        {status === "loading" && (
          <div className="space-y-4 p-2">
            <div className="w-1/3 h-5 skeleton" />
            <div className="w-full h-4 skeleton" />
            <div className="w-full h-4 skeleton" />
            <div className="w-5/6 h-4 skeleton" />
            <div className="w-full h-12 skeleton mt-6" />
          </div>
        )}

        {/* State: Streaming text chunks */}
        {status === "streaming" && (
          <div className="prose-biography select-text">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{tokens}</ReactMarkdown>
            {/* Pulsing cursor block */}
            <span className="inline-block w-2 h-4 bg-gold ml-1 animate-pulse" />
          </div>
        )}

        {/* State: Done (Display Narrative + Eras + Key Moments) */}
        {status === "done" && biography && (
          <div className="space-y-6">
            {/* One-liner Tagline */}
            {biography.one_liner && (
              <div className="border-l-2 border-gold pl-3 py-1 bg-gold/5 italic text-text-primary text-xs font-serif leading-relaxed">
                "{biography.one_liner}"
              </div>
            )}

            {/* Markdown narrative */}
            <div className="prose-biography select-text">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{biography.biography_md}</ReactMarkdown>
            </div>

            {/* Design Eras chips */}
            {biography.design_eras && biography.design_eras.length > 0 && (
              <div className="space-y-3 border-t border-border-default pt-4">
                <h4 className="text-xs uppercase font-mono tracking-wider text-text-gold font-bold">Design Eras</h4>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin select-none">
                  {biography.design_eras.map((era: DesignEra) => (
                    <div
                      key={era.name}
                      className="shrink-0 w-52 bg-bg-primary border border-border-bright hover:border-gold p-3 rounded-lg transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <span className="block text-[10px] text-text-muted font-mono">{era.start} – {era.end}</span>
                        <h5 className="text-xs font-bold text-text-primary mt-1 font-display truncate">{era.name}</h5>
                      </div>
                      <p className="text-[10px] text-text-secondary line-clamp-2 mt-2 leading-relaxed">{era.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Moments Vertical Timeline */}
            {biography.key_moments && biography.key_moments.length > 0 && (
              <div className="space-y-3 border-t border-border-default pt-4 pb-2">
                <h4 className="text-xs uppercase font-mono tracking-wider text-text-gold font-bold">Milestones</h4>
                <div className="relative pl-4 space-y-4 border-l border-border-bright mt-2">
                  {biography.key_moments.map((moment: KeyMoment, index: number) => (
                    <div key={index} className="relative select-text">
                      {/* Timeline Dot Indicator */}
                      <span className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full bg-gold border border-bg-secondary" />
                      <span className="block text-[10px] text-text-gold font-mono font-bold">{moment.date}</span>
                      <h5 className="text-xs font-bold text-text-primary mt-0.5">{moment.title}</h5>
                      <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">{moment.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-[9px] text-text-muted font-mono text-center pt-2 select-none">
              Generated: {formatDate(biography.generated_at)}
            </div>
          </div>
        )}

        {/* State: Error */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center text-center p-6 min-h-[300px]">
            <div className="w-12 h-12 bg-error/10 border border-error/20 rounded-full flex items-center justify-center text-error mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-display text-base font-bold text-text-primary mb-2">Generation Failed</h3>
            <p className="text-text-secondary text-xs max-w-xs mb-6 leading-relaxed">
              {errorMessage || "The AI model encountered an error constructing this narrative. Try re-generating."}
            </p>
            <button
              onClick={generateBiography}
              className="px-4 py-2 bg-bg-elevated border border-border-bright text-text-primary hover:border-gold rounded-lg text-xs font-semibold tracking-wide transition-all"
            >
              Retry Story
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple browser-safe console logger fallback
const logger = {
  error: (...args: any[]) => {
    try {
      console.error(...args);
    } catch (_) {}
  }
};
