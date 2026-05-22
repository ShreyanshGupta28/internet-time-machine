"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTimelineStore } from "@/store/timelineStore";
import { formatDate } from "@/lib/utils";

const Marquee = "marquee" as any;

export default function SnapshotViewer() {
  const { snapshots, currentIndex, prev, next } = useTimelineStore();
  const currentSnapshot = snapshots[currentIndex];

  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [renderingMode, setRenderingMode] = useState<"simulated" | "live">("simulated");
  const [exploreMode, setExploreMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [simulationNotice, setSimulationNotice] = useState("");

  // Interactive Web 1.0 Guestbook states
  const [gbName, setGbName] = useState("");
  const [gbComment, setGbComment] = useState("");
  const [gbEntries, setGbEntries] = useState([
    { name: "Surfer99", comment: "Awesome page! Love the animated GIFs! A++", date: "1999-07-15" },
    { name: "NetWizard", comment: "Cool time machine app. Design is out of this world!", date: "1999-08-02" }
  ]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset loading & error on snapshot index change
  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    setSimulationNotice("");
  }, [currentIndex]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setIsError(true);
    // Graceful fallback to Simulation Mode on iframe error!
    setRenderingMode("simulated");
    setSimulationNotice("Live archive unavailable or blocked. Displaying premium simulated retro layout instead.");
    // Clear notification after 5s
    setTimeout(() => setSimulationNotice(""), 6000);
  };

  const triggerToast = () => {
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 2500);
    return () => clearTimeout(timer);
  };

  const handleGuestbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gbName.trim() || !gbComment.trim()) return;
    setGbEntries([
      { name: gbName.trim(), comment: gbComment.trim(), date: new Date().toISOString().split("T")[0] },
      ...gbEntries
    ]);
    setGbName("");
    setGbComment("");
  };

  if (!currentSnapshot) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-border-subtle bg-bg-secondary rounded-xl text-text-muted select-none">
        <svg className="w-12 h-12 mb-2 animate-pulse text-border-bright" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Select a snapshot to begin travelling in time</span>
      </div>
    );
  }

  // Parse details for simulator
  let cleanDomain = "website.com";
  if (currentSnapshot.wayback_url) {
    const lastHttpIndex = Math.max(
      currentSnapshot.wayback_url.lastIndexOf("/http://"),
      currentSnapshot.wayback_url.lastIndexOf("/https://")
    );
    if (lastHttpIndex !== -1) {
      const isHttps = currentSnapshot.wayback_url.indexOf("/https://") === lastHttpIndex;
      const urlPart = currentSnapshot.wayback_url.slice(lastHttpIndex + (isHttps ? 9 : 8));
      cleanDomain = urlPart.replace(/^www\./i, "").split("/")[0];
    } else {
      const match = currentSnapshot.wayback_url.match(/https?:\/\/(?:www\.)?([^\/]+)/i);
      if (match && match[1]) {
        cleanDomain = match[1];
      }
    }
  }
  const domainClean = cleanDomain.split(".")[0];
  const domainTitle = domainClean.charAt(0).toUpperCase() + domainClean.slice(1);
  const rawDate = currentSnapshot.captured_at;
  const year = new Date(rawDate).getFullYear();

  // Determine Epoch Era
  let era: "web1" | "web2" | "flat" | "modern" = "modern";
  if (year <= 2002) {
    era = "web1";
  } else if (year <= 2010) {
    era = "web2";
  } else if (year <= 2018) {
    era = "flat";
  } else {
    era = "modern";
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 border border-border-default bg-bg-secondary rounded-xl overflow-hidden shadow-2xl relative">
      {/* Top Toolbar / Cosmetic Browser Head */}
      <div className="bg-bg-elevated border-b border-border-default px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-30 select-none">
        
        {/* Browser dots + Viewport toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 bg-[#ef4444] rounded-full" />
            <span className="w-3 h-3 bg-[#eab308] rounded-full" />
            <span className="w-3 h-3 bg-[#22c55e] rounded-full" />
          </div>

          {/* Desktop/Mobile viewport pills */}
          <div className="flex bg-bg-base border border-border-subtle p-0.5 rounded-lg text-[10px] font-medium font-mono text-text-secondary">
            <button
              onClick={() => setViewMode("desktop")}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === "desktop" ? "bg-border-bright text-text-primary font-bold" : "hover:text-text-primary"
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === "mobile" ? "bg-border-bright text-text-primary font-bold" : "hover:text-text-primary"
              }`}
            >
              Mobile
            </button>
          </div>
        </div>

        {/* URL Bar */}
        <div className="flex-1 min-w-[150px] max-w-md mx-auto">
          <div className="bg-bg-base border border-border-subtle px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary truncate flex items-center justify-center gap-1.5 select-all">
            <svg className="w-3.5 h-3.5 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="truncate">{renderingMode === "live" ? currentSnapshot.wayback_url : `simulation://${cleanDomain}/${year}`}</span>
          </div>
        </div>

        {/* Right options: Mode Toggles & Date */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Simulated vs Live Selector */}
          <div className="flex bg-bg-base border border-border-subtle p-0.5 rounded-lg text-[10px] font-mono text-text-secondary">
            <button
              onClick={() => setRenderingMode("simulated")}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                renderingMode === "simulated" ? "bg-gold/15 text-gold font-bold border border-gold/30" : "hover:text-text-primary"
              }`}
              title="Instant interactive retro replica"
            >
              <span className="w-1 h-1 bg-gold rounded-full" />
              <span>Simulated</span>
            </button>
            <button
              onClick={() => setRenderingMode("live")}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                renderingMode === "live" ? "bg-teal/15 text-teal font-bold border border-teal/30" : "hover:text-text-primary"
              }`}
              title="Fetch pages from Wayback Machine"
            >
              <span className="w-1 h-1 bg-teal rounded-full" />
              <span>Live Wayback</span>
            </button>
          </div>

          {/* Clicks Mode Switch (only relevant for Live IFrame) */}
          {renderingMode === "live" && (
            <button
              onClick={() => setExploreMode(!exploreMode)}
              className={`px-3 py-1 border text-[11px] font-mono rounded-lg transition-all ${
                exploreMode
                  ? "bg-teal/15 border-teal text-teal"
                  : "border-border-bright text-text-secondary hover:text-text-primary"
              }`}
              title={exploreMode ? "Clicks permitted inside page" : "Time travel scroll-lock enabled"}
            >
              {exploreMode ? "Explore" : "Lock"}
            </button>
          )}

          {/* Date pill */}
          <div className="px-3 py-1 bg-gold/10 border border-gold-dim rounded-full text-gold font-mono text-[11px] font-medium tracking-wide">
            {formatDate(currentSnapshot.captured_at)}
          </div>
        </div>
      </div>

      {/* Graceful Fallback / Notification Toast */}
      {simulationNotice && (
        <div className="bg-amber/15 border-b border-amber/30 text-amber text-xs py-2 px-4 font-mono text-center z-25 flex items-center justify-center gap-2 select-none animate-fadeIn">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{simulationNotice}</span>
        </div>
      )}

      {/* Main Viewport Window */}
      <div className="flex-1 min-h-[500px] bg-bg-base relative flex justify-center items-stretch overflow-hidden">
        
        {/* Render Live IFrame Mode */}
        {renderingMode === "live" ? (
          <>
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-bg-base/80 z-20 flex flex-col items-center justify-center">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-2 border-border-bright rounded-full" />
                  <div className="absolute inset-0 border-2 border-t-gold rounded-full animate-spin" />
                </div>
                <span className="text-xs font-mono text-text-muted mt-4 select-none">Loading Wayback Capture...</span>
              </div>
            )}

            {isError ? (
              <div className="absolute inset-0 bg-bg-secondary flex flex-col items-center justify-center p-6 text-center z-25 select-none">
                <div className="w-16 h-16 bg-error/10 border border-error/20 rounded-full flex items-center justify-center text-error mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-text-primary mb-2">Snapshot Unavailable</h3>
                <p className="text-text-secondary text-xs max-w-sm mb-6 leading-relaxed">
                  Wayback Machine returned a loading error for this capture. It may have expired or been blocked. Try adjacent snapshots.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsError(false);
                      prev();
                    }}
                    className="px-4 py-1.5 bg-bg-elevated border border-border-bright text-text-primary hover:border-gold rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1"
                  >
                    ← Prev Date
                  </button>
                  <button
                    onClick={() => {
                      setIsError(false);
                      next();
                    }}
                    className="px-4 py-1.5 bg-bg-elevated border border-border-bright text-text-primary hover:border-gold rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1"
                  >
                    Next Date →
                  </button>
                </div>
              </div>
            ) : (
              /* Responsive Iframe Frame Container */
              <div
                className={`transition-all duration-300 flex items-stretch ${
                  viewMode === "mobile"
                    ? "w-[390px] my-6 rounded-[40px] border-[12px] border-bg-card shadow-2xl relative"
                    : "w-full h-full"
                }`}
              >
                {/* Click Interceptor Overlay */}
                {!exploreMode && (
                  <div
                    onClick={triggerToast}
                    className="absolute inset-0 bg-transparent cursor-default z-10"
                    title="Use bottom timeline to scrub in time. Enable Explore Mode to click links inside."
                  />
                )}

                {/* Wayback IFrame */}
                <iframe
                  ref={iframeRef}
                  key={currentSnapshot.wayback_ts}
                  src={currentSnapshot.wayback_url}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              </div>
            )}
          </>
        ) : (
          /* Render Simulation Mode Viewport */
          <div
            className={`transition-all duration-300 flex flex-col items-stretch overflow-y-auto w-full h-full bg-slate-900 ${
              viewMode === "mobile" ? "max-w-[390px] my-6 rounded-[32px] border-[8px] border-bg-card shadow-2xl relative" : "w-full h-full"
            }`}
          >
            {/* Simulation Interface Render */}
            {era === "web1" && (
              <div className="flex-grow bg-[#c0c0c0] font-serif text-[#000] p-4 flex flex-col justify-start select-text leading-normal min-h-[500px]">
                {/* Vintage Netscape header decoration */}
                <div className="bg-[#b3b3b3] border-b-2 border-white p-2 mb-4 text-xs font-sans font-bold flex items-center justify-between border-2 border-r-gray border-b-gray border-t-white border-l-white">
                  <span>Netscape Navigator 4.0 - [{domainTitle} Welcome Page]</span>
                  <span className="text-[10px] font-mono text-gray-700 bg-gray-300 px-1 border border-black">File Edit View Go</span>
                </div>

                {/* Construction Warning Badge */}
                <div className="border-4 border-yellow-400 bg-black text-yellow-400 font-mono p-3 text-center mb-6 flex items-center justify-center gap-3 border-dashed">
                  <span className="text-xl animate-bounce">🚧</span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest">Under Construction</h4>
                    <p className="text-[9px]">Welcome to early Web 1.0! Best viewed in 800x600 resolution.</p>
                  </div>
                  <span className="text-xl animate-bounce">🚧</span>
                </div>

                {/* Grid Table Layout */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow">
                  {/* Left Column (Clunky Links) */}
                  <div className="md:col-span-1 bg-[#dcdcdc] border-2 border-t-white border-l-white border-r-gray border-b-gray p-3 flex flex-col gap-2 font-mono text-xs">
                    <span className="font-bold border-b border-black pb-1 mb-1 text-[10px] uppercase">Navigation</span>
                    <a href="#welcome" className="text-blue-800 underline hover:text-red-600">🏠 [Home Page]</a>
                    <a href="#about" className="text-blue-800 underline hover:text-red-600">📝 [Company Info]</a>
                    <a href="#products" className="text-blue-800 underline hover:text-red-600">💾 [Product Line]</a>
                    <a href="#guestbook" className="text-blue-800 underline hover:text-red-600">📖 [Sign Guestbook]</a>
                    
                    <div className="mt-4 border border-black p-2 bg-[#c0c0c0] text-center">
                      <span className="block text-[8px] uppercase">Hit Counter</span>
                      <span className="font-mono text-red-600 font-bold tracking-wider text-base">0000{1999 + year % 100}</span>
                    </div>
                  </div>

                  {/* Main content table */}
                  <div className="md:col-span-3 bg-white border-2 border-t-gray border-l-gray border-r-white border-b-white p-4">
                    <Marquee className="text-xs text-blue-900 font-bold mb-4 bg-yellow-100 py-1 border border-black">
                      +++ Welcome to the official digitized historical homepage of {cleanDomain.toUpperCase()}! Scrub the scrubber below to travel forward in time +++
                    </Marquee>

                    <h1 className="text-2xl font-extrabold text-blue-900 border-b border-gray-400 pb-2">{domainTitle} Corporation</h1>
                    <p className="text-xs mt-3 leading-relaxed">
                      Established in the glorious dawn of the World Wide Web, we are proud to offer high-quality digital solutions. Our network servers operate at blazing-fast 56k dial-up bandwidth to guarantee immediate download response times globally!
                    </p>

                    <div className="mt-6 border-2 border-dashed border-gray-400 p-3 bg-gray-50">
                      <h4 className="text-xs font-bold text-red-800">Latest Updates (Archived Capture: {year})</h4>
                      <ul className="list-disc pl-4 text-[10px] mt-2 space-y-1">
                        <li>New desktop wallpaper download available for Microsoft Windows 98.</li>
                        <li>Interactive CGI forms are fully operational!</li>
                      </ul>
                    </div>

                    {/* Interactive Guestbook section */}
                    <div id="guestbook" className="mt-8 border-t border-gray-300 pt-4">
                      <h3 className="text-sm font-bold text-blue-900 mb-2">📖 Vintage Interactive Guestbook</h3>
                      <form onSubmit={handleGuestbookSubmit} className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Your Surfer Name"
                            value={gbName}
                            onChange={(e) => setGbName(e.target.value)}
                            className="border border-gray-400 p-1 text-[11px] font-mono outline-none focus:border-blue-900"
                          />
                          <input
                            type="text"
                            placeholder="Leave your comments..."
                            value={gbComment}
                            onChange={(e) => setGbComment(e.target.value)}
                            className="border border-gray-400 p-1 text-[11px] font-mono outline-none focus:border-blue-900"
                          />
                        </div>
                        <button type="submit" className="px-3 py-1 bg-gray-300 border-2 border-t-white border-l-white border-r-gray border-b-gray text-xs font-bold active:border-t-gray active:border-l-gray active:border-r-white active:border-b-white">
                          SUBMIT COMMENT
                        </button>
                      </form>

                      {/* Entries */}
                      <div className="mt-4 space-y-2 max-h-32 overflow-y-auto pr-1">
                        {gbEntries.map((entry, i) => (
                          <div key={i} className="text-[10px] bg-[#dcdcdc] p-2 border border-white">
                            <span className="font-bold text-blue-900">{entry.name}</span>
                            <span className="text-gray-600 ml-2">({entry.date})</span>
                            <p className="mt-1 italic">"{entry.comment}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {era === "web2" && (
              <div className="flex-grow bg-[#f5f5f5] text-[#333] font-sans flex flex-col justify-start select-text leading-normal min-h-[500px]">
                {/* Glossy Header Bar */}
                <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 p-4 border-b-4 border-orange-500 shadow-md text-white flex justify-between items-center">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-white drop-shadow flex items-center gap-1.5">
                      <span>{domainTitle}</span>
                      <span className="bg-orange-500 text-[8px] font-mono px-1 py-0.5 rounded text-white font-extrabold uppercase animate-pulse">BETA</span>
                    </h1>
                    <p className="text-[9px] text-blue-100">Web 2.0 Community Network Hub</p>
                  </div>
                  
                  {/* Glossy blue pills buttons */}
                  <div className="flex gap-2 text-xs font-mono">
                    <span className="px-3 py-1 bg-blue-700/60 hover:bg-blue-700 rounded-full border border-blue-400 cursor-pointer transition-all shadow-inner">Home</span>
                    <span className="px-3 py-1 bg-blue-700/60 hover:bg-blue-700 rounded-full border border-blue-400 cursor-pointer transition-all shadow-inner">Services</span>
                    <span className="px-3 py-1 bg-blue-700/60 hover:bg-blue-700 rounded-full border border-blue-400 cursor-pointer transition-all shadow-inner">Forum</span>
                  </div>
                </div>

                {/* Main Hub Split Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 flex-grow">
                  {/* Content columns */}
                  <div className="md:col-span-2 space-y-4">
                    {/* Glossy Card */}
                    <div className="bg-white border border-gray-300 rounded-xl p-5 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-slate-100 to-transparent opacity-50" />
                      <h2 className="text-base font-bold text-blue-900 border-b border-gray-200 pb-2 flex items-center gap-1">
                        🚀 Welcome to our Web 2.0 Platform ({year})
                      </h2>
                      <p className="text-xs text-gray-700 mt-3 leading-relaxed">
                        We have upgraded our network! Now fully utilizing asynchronous Javascript and XML (AJAX) to deliver highly fluid, interactive widgets and immediate server page refreshes. Share bookmark articles, upload tags, and join our scaling online community database!
                      </p>
                      
                      <button className="mt-4 px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-700 border border-blue-800 text-white rounded-lg text-xs font-semibold shadow hover:from-blue-400 hover:to-blue-600 active:scale-95 transition-all">
                        Create Free Account!
                      </button>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-xl p-5 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-slate-100 to-transparent opacity-50" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600">Company Announcements</h3>
                      <div className="mt-3 space-y-3">
                        <div className="text-xs">
                          <span className="font-bold text-gray-900 block">System Refactor: Community Tags Launched</span>
                          <span className="text-[10px] text-gray-500 font-mono">Posted: {year}-06-12</span>
                          <p className="text-[11px] text-gray-600 mt-1">Users can now assign tags to arbitrary content nodes across our centralized indexing service.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar (RSS feeds & XML tags) */}
                  <div className="md:col-span-1 space-y-4">
                    <div className="bg-gradient-to-b from-orange-50 to-orange-100/50 border border-orange-200 rounded-xl p-4 shadow-sm">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-[9px] text-white font-bold rounded font-mono uppercase tracking-widest shrink-0">
                        XML RSS FEED
                      </span>
                      <h4 className="text-xs font-bold text-orange-900 mt-2">Subscribe to Feeds</h4>
                      <p className="text-[10px] text-orange-800 mt-1 leading-relaxed">Copy our RSS XML feeds into Google Reader or Netvibes to stream hourly design updates directly.</p>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-xl p-4 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-800 border-b border-gray-100 pb-1.5 mb-2">Popular Tag Clouds</h4>
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-mono">
                        <span className="px-2 py-1 bg-gray-100 hover:bg-orange-100 rounded text-gray-600 border border-gray-200 cursor-pointer">ajax (14)</span>
                        <span className="px-2 py-1 bg-gray-100 hover:bg-orange-100 rounded text-gray-600 border border-gray-200 cursor-pointer">social (29)</span>
                        <span className="px-2 py-1 bg-gray-100 hover:bg-orange-100 rounded text-gray-600 border border-gray-200 cursor-pointer">sharing (8)</span>
                        <span className="px-2 py-1 bg-gray-100 hover:bg-orange-100 rounded text-gray-600 border border-gray-200 cursor-pointer">glossy (17)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {era === "flat" && (
              <div className="flex-grow bg-white text-slate-800 font-sans flex flex-col justify-start select-text leading-normal min-h-[500px]">
                {/* Flat Minimalist Navbar */}
                <div className="bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center">
                  <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0" />
                    <span>{domainTitle}</span>
                  </h1>

                  {/* Hamburger icon for mobile / flat navigation list */}
                  <div className="flex gap-4 text-xs font-semibold text-slate-500">
                    <span className="hover:text-slate-900 cursor-pointer">Features</span>
                    <span className="hover:text-slate-900 cursor-pointer">Pricing</span>
                    <span className="hover:text-slate-900 cursor-pointer">Company</span>
                  </div>
                </div>

                {/* Hero section */}
                <div className="bg-slate-50 py-12 px-6 text-center border-b border-slate-100">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-blue-500 uppercase">
                    Epoch Flat Paradigm ({year})
                  </span>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2 max-w-xl mx-auto leading-tight">
                    Simple layouts. Beautiful digital designs.
                  </h2>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-3 leading-relaxed">
                    Embracing modern flat styles. Removing outdated glossy textures and realistic skeuomorphic shadows to focus directly on crisp readable text and unified mobile-responsive spacing grids.
                  </p>
                  <div className="mt-5 flex justify-center gap-3">
                    <button className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 active:scale-95 transition-all">
                      Get Started
                    </button>
                    <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 active:scale-95 transition-all">
                      Learn More
                    </button>
                  </div>
                </div>

                {/* 3-Column Service Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 max-w-4xl mx-auto w-full">
                  <div className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mb-3">📱</div>
                      <h4 className="text-xs font-bold text-slate-900">Mobile-First Response</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">Flexible grid viewports adapt naturally to tablet and handheld screen limits.</p>
                  </div>
                  
                  <div className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold mb-3">⚡</div>
                      <h4 className="text-xs font-bold text-slate-900">Immediate Speeds</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">Ultra-light weight assets compress download rates by stripping unnecessary visual clutter.</p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold mb-3">⚙️</div>
                      <h4 className="text-xs font-bold text-slate-900">Flat Architecture</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">Pure solid vector shapes ensure crisp resolutions across high density display viewports.</p>
                  </div>
                </div>
              </div>
            )}

            {era === "modern" && (
              <div className="flex-grow bg-[#080c18] text-[#c9a227] font-sans flex flex-col justify-start select-text leading-normal min-h-[500px]">
                {/* Premium Dark Glass Navbar */}
                <div className="backdrop-blur-md bg-white/5 border-b border-white/10 py-4 px-6 flex justify-between items-center sticky top-0 z-20">
                  <h1 className="text-sm font-extrabold tracking-widest uppercase flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-gradient-to-r from-gold via-amber to-teal rounded-full animate-pulse" />
                    <span className="bg-gradient-to-r from-gold via-gold-light to-white bg-clip-text text-transparent">{domainTitle} V2</span>
                  </h1>

                  <div className="flex gap-4 text-[10px] font-mono tracking-widest text-text-secondary">
                    <span className="hover:text-gold cursor-pointer transition-colors uppercase">Network</span>
                    <span className="hover:text-gold cursor-pointer transition-colors uppercase">History</span>
                    <span className="hover:text-gold cursor-pointer transition-colors uppercase">Metrics</span>
                  </div>
                </div>

                {/* Hero Dashboard Block */}
                <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
                  <div className="bg-gradient-to-br from-gold/10 via-teal/5 to-transparent border border-gold-dim/40 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full filter blur-2xl pointer-events-none" />
                    
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gold/15 border border-gold-dim text-[8px] font-mono uppercase tracking-widest rounded-full text-gold shrink-0">
                      <span className="w-1 h-1 bg-gold rounded-full animate-ping" />
                      <span>Temporal Sync Successful ({year})</span>
                    </span>

                    <h2 className="text-xl font-bold font-display text-text-primary tracking-wide mt-4">
                      Reconstructed Design Evolution
                    </h2>
                    <p className="text-xs text-text-secondary mt-2 leading-relaxed max-w-lg">
                      Successfully simulated website status of <strong className="text-text-primary">{cleanDomain}</strong>. The bottom timeline controls scrub between historical epochs dynamically. Re-generate the biography panel on the left to stream AI digital historic narrative summaries.
                    </p>
                  </div>

                  {/* SVG Mock Traffic Chart Panel */}
                  <div className="bg-bg-elevated/40 border border-border-default/60 rounded-2xl p-5 shadow-xl">
                    <div className="flex justify-between items-center border-b border-border-subtle/50 pb-3 mb-4 select-none">
                      <div>
                        <h4 className="text-xs font-bold font-display text-text-primary">Historical Network Weighting</h4>
                        <p className="text-[10px] text-text-muted mt-0.5 font-mono">Epoch temporal data distributions</p>
                      </div>
                      <span className="text-[9px] font-mono text-gold-dim font-bold bg-gold/10 px-2 py-0.5 rounded border border-gold-dim">LIVE METRICS</span>
                    </div>

                    {/* SVG Chart bars */}
                    <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-border-subtle font-mono text-[9px]">
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gold/25 border border-gold/40 rounded-t-md hover:bg-gold/40 transition-all cursor-pointer" style={{ height: "45%" }} title="Web 1.0 weight: 45%" />
                        <span className="text-text-muted">Web1</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-teal/25 border border-teal/40 rounded-t-md hover:bg-teal/40 transition-all cursor-pointer" style={{ height: "65%" }} title="Web 2.0 weight: 65%" />
                        <span className="text-text-muted">Web2</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-amber/25 border border-amber/40 rounded-t-md hover:bg-amber/40 transition-all cursor-pointer" style={{ height: "85%" }} title="Flat UI weight: 85%" />
                        <span className="text-text-muted">Flat</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gradient-to-t from-gold/30 to-teal/30 border border-gold/40 rounded-t-md hover:opacity-80 transition-all cursor-pointer" style={{ height: "98%" }} title="Modern weight: 98%" />
                        <span className="text-gold font-bold">Modern</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating AI badge widget */}
                <div className="absolute bottom-6 right-6 select-none animate-bounce bg-bg-card border border-border-bright p-3 rounded-2xl shadow-2xl text-[9px] font-mono text-text-primary z-10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-teal rounded-full animate-ping" />
                  <span>Chronos AI Assistant Active</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* premium central Toast when click is intercepted */}
      {showToast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-bg-card border border-border-bright px-4 py-2.5 rounded-xl shadow-2xl text-xs font-mono text-text-primary z-50 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 bg-amber rounded-full animate-ping" />
          <span>Timeline Lock active — use bottom navigator or enable "Explore Mode" to browse</span>
        </div>
      )}
    </div>
  );
}
