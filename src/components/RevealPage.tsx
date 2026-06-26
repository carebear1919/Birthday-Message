import React, { useState, useEffect, useRef } from "react";
import { Lock, Unlock, ChevronLeft, ChevronRight, BookOpen, Calendar, HelpCircle } from "lucide-react";
import { Message, BirthdayPage, ApiResponse } from "../types";

interface RevealPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export default function RevealPage({ slug, onNavigate }: RevealPageProps) {
  const [celebrantName, setCelebrantName] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingPage, setCheckingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data State
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 0 is Cover Page, 1..N are messages, N+1 is back cover or finished

  // Swipe Gestures
  const touchStartX = useRef<number | null>(null);

  // Initial fetch of page details to display name on password gate
  useEffect(() => {
    async function checkPage() {
      try {
        setCheckingPage(true);
        const res = await fetch(`/api/birthday-pages/${slug}`);
        const resJson: ApiResponse<BirthdayPage> = await res.json();
        if (resJson.success && resJson.data) {
          setCelebrantName(resJson.data.celebrant_name);
        } else {
          setError("This birthday page doesn't exist — check your link!");
        }
      } catch (err) {
        setError("Error opening database. Please try again.");
      } finally {
        setCheckingPage(false);
      }
    }
    checkPage();
  }, [slug]);

  // Handle password unlocking
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/birthday-pages/${slug}/reveal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const resJson: ApiResponse<{ celebrant_name: string; messages: Message[] }> = await response.json();

      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || "Incorrect password. Please try again.");
      }

      if (resJson.data) {
        setMessages(resJson.data.messages);
        setAuthenticated(true);
        setCurrentPageIndex(0); // Start at cover page
      }
    } catch (err: any) {
      setError(err.message || "Failed to unlock.");
    } finally {
      setLoading(false);
    }
  };

  // Nav Handlers
  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < messages.length) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const threshold = 50; // min distance for swipe

    if (diffX > threshold) {
      // Swiped Left -> Next page
      handleNextPage();
    } else if (diffX < -threshold) {
      // Swiped Right -> Prev page
      handlePrevPage();
    }
    touchStartX.current = null;
  };

  // Pre-configured stickers list for random templates
  const stickers = [
    { text: "🌸", style: "text-rose-400 rotate-[8deg] text-3xl" },
    { text: "✨", style: "text-amber-400 -rotate-12 text-2xl" },
    { text: "💖", style: "text-red-400 rotate-6 text-3xl animate-pulse" },
    { text: "🎈", style: "text-indigo-400 -rotate-6 text-3xl" },
    { text: "⭐", style: "text-yellow-400 rotate-12 text-2xl" },
    { text: "🌟", style: "text-amber-400 -rotate-[15deg] text-2xl" },
    { text: "🎉", style: "text-emerald-400 rotate-4 text-3xl" },
  ];

  if (checkingPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#a4384c] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[#6e5f60] font-sans font-medium text-sm">Opening mailbox...</p>
      </div>
    );
  }

  // --- 1. Password Gate View ---
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 animate-fadeIn">
        <div className="bg-[#ffffff] rounded-2xl shadow-xl p-8 border border-[#dcc0c1]/40 dot-grid relative text-center">
          {/* Tape decorative accent */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#6a5b5c]/25 backdrop-blur-[1px] rotate-1"></div>

          <div className="w-16 h-16 bg-[#ffd9dc] text-[#a4384c] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>

          <h2 className="text-2xl font-sans font-bold text-[#a4384c]">
            Birthday Surprise Box
          </h2>
          <p className="text-sm text-[#564243] mt-2 mb-6">
            Enter your secret lock password to unlock the scrapbook left by your friends for{" "}
            <strong className="text-[#a4384c]">{celebrantName || "the celebrant"}</strong>!
          </p>

          {error && (
            <div className="bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#400011] rounded-xl px-4 py-2.5 mb-5 text-xs text-left">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative hover:scale-[1.01] transition-transform duration-200">
              <input
                type="password"
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#fff0ee]/30 border-2 border-[#dcc0c1] rounded-xl py-3 px-4 pl-10 text-base text-[#251916] placeholder-[#564243]/50 focus:border-[#a4384c] focus:outline-none"
                id="input-reveal-password"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#897173]" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#a4384c] hover:bg-[#852036] disabled:bg-[#6a5b5c]/60 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              id="submit-reveal-unlock"
            >
              <Unlock className="w-4 h-4" />
              <span>{loading ? "Unlocking Scrapbook..." : "Unlock Surprise 🎁"}</span>
            </button>
          </form>

          <p className="mt-6 text-[10px] text-gray-400 uppercase tracking-wider">
            🔒 Secured & Handcrafted for you
          </p>
        </div>
      </div>
    );
  }

  // --- 2. Scrapbook Notebook Render ---
  const totalSpreads = messages.length;
  const isCoverPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === totalSpreads + 1; // back cover or finished
  const currentMsg = currentPageIndex > 0 && currentPageIndex <= totalSpreads ? messages[currentPageIndex - 1] : null;

  // Render randomized decorations per layout_template
  const renderStickers = (templateId: number) => {
    const stickerLeft = stickers[(templateId + 1) % stickers.length];
    const stickerRight = stickers[(templateId + 3) % stickers.length];

    return (
      <>
        {/* Sizable decorations floating */}
        <div className={`absolute top-4 left-6 select-none pointer-events-none ${stickerLeft.style}`}>
          {stickerLeft.text}
        </div>
        <div className={`absolute bottom-6 right-8 select-none pointer-events-none ${stickerRight.style}`}>
          {stickerRight.text}
        </div>
      </>
    );
  };

  return (
    <div className="relative w-full max-w-[1000px] mx-auto px-2 md:px-8 py-6 md:py-12 animate-scaleUp">
      
      {/* Upper header action info */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pl-4 pr-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#a4384c] font-sans">
            🎉 {celebrantName}'s Birthday Wall
          </h1>
          <p className="text-xs text-[#564243] font-medium">
            Flip through the scrapbook pages to see what friends wrote.
          </p>
        </div>
        <button
          onClick={() => {
            setAuthenticated(false);
            setPassword("");
            setMessages([]);
            setCurrentPageIndex(0);
          }}
          className="text-xs font-bold text-[#6a5b5c] px-4 py-2 bg-[#f2dedf] hover:bg-[#d5c2c3] rounded-full transition-colors flex items-center gap-1 shadow-sm"
          id="btn-lock-scrapbook"
        >
          🔒 Lock Scrapbook
        </button>
      </div>

      <div 
        className="relative w-full flex items-center group touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Outer Left Navigation Button (Desktop) */}
        <button
          onClick={handlePrevPage}
          disabled={currentPageIndex === 0}
          className="absolute -left-3 md:-left-12 lg:-left-16 z-40 bg-[#fff8f6]/95 hover:bg-[#a4384c] hover:text-white disabled:opacity-30 disabled:pointer-events-none p-3.5 rounded-full text-[#a4384c] transition-all shadow-lg border border-[#dcc0c1]/40 active:scale-95 cursor-pointer"
          title="Previous Page"
          id="btn-page-prev"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        {/* ================= PHYSICAL JOURNAL CONTAINER ================= */}
        <div className="relative w-full bg-[#fcf8f2] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border-8 border-[#f5ddd9] min-h-[460px] md:min-h-[520px]">
          
          {/* CENTER METAL RING BINDER SPINE (Visible on desktop) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 z-30 hidden md:flex flex-col justify-around py-6 pointer-events-none">
            <div className="w-full h-3 binder-ring rounded-full"></div>
            <div className="w-full h-3 binder-ring rounded-full"></div>
            <div className="w-full h-3 binder-ring rounded-full"></div>
            <div className="w-full h-3 binder-ring rounded-full"></div>
            <div className="w-full h-3 binder-ring rounded-full"></div>
            <div className="w-full h-3 binder-ring rounded-full"></div>
            <div className="w-full h-3 binder-ring rounded-full"></div>
            <div className="w-full h-3 binder-ring rounded-full"></div>
          </div>

          {/* Render 3 Page states: Cover, Messages Spreads, or Final Back Cover */}
          {isCoverPage ? (
            // --- A. COVER PAGE SPREAD ---
            <div className="w-full flex flex-col md:flex-row h-full min-h-[460px] md:min-h-[520px]">
              {/* Left Side cover */}
              <div className="w-full md:w-1/2 dot-grid p-6 md:p-12 border-b-2 md:border-b-0 md:border-r border-[#dcc0c1]/40 flex flex-col justify-center items-center text-center relative bg-[#fffdfa]">
                <div className="absolute top-6 left-6 w-20 h-7 washi-tape-primary rotate-12 z-10"></div>
                <div className="w-24 h-24 bg-[#ffd9dc] rounded-full flex items-center justify-center text-[#a4384c] text-5xl animate-bounce shadow-inner mb-6">
                  🎁
                </div>
                <h3 className="font-marker text-3xl md:text-4xl text-[#a4384c] uppercase tracking-wide">
                  Surprise Book
                </h3>
                <div className="w-20 h-1 bg-[#a4384c] mt-4 opacity-50"></div>
              </div>

              {/* Right Side cover details */}
              <div className="w-full md:w-1/2 dot-grid p-6 md:p-12 flex flex-col justify-center items-center text-center relative bg-[#fdfaf7]">
                <div className="absolute bottom-6 right-6 w-16 h-16 animate-pulse select-none text-4xl">🌸</div>
                <h2 className="font-marker text-3xl md:text-4xl text-[#a4384c] leading-tight">
                  Happy Birthday, {celebrantName}! 🎉
                </h2>
                <p className="font-caveat text-2xl text-[#564243] mt-6 max-w-sm leading-relaxed">
                  "Your friends have gathered here to craft a physical journal of precious memories and heartwarming messages."
                </p>
                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#a4384c] font-sans animate-pulse">
                  <span>Click right arrow to flip pages</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ) : isLastPage ? (
            // --- B. END PAGE SPREAD ---
            <div className="w-full flex flex-col md:flex-row h-full min-h-[460px] md:min-h-[520px]">
              <div className="w-full md:w-1/2 dot-grid p-8 md:p-12 border-b-2 md:border-b-0 md:border-r border-[#dcc0c1]/40 flex flex-col justify-center items-center text-center bg-[#fffdfa] relative">
                <span className="text-6xl animate-spin-slow">💐</span>
                <h2 className="font-marker text-2xl text-[#a4384c] mt-4">That's All!</h2>
                <p className="font-caveat text-xl text-[#564243] mt-3">
                  We hope these sweet words made your day sparkle.
                </p>
              </div>
              <div className="w-full md:w-1/2 dot-grid p-8 md:p-12 flex flex-col justify-center items-center text-center bg-[#fdfaf7] relative">
                <div className="bg-[#ffd9dc]/40 border-2 border-[#dcc0c1] p-4 rounded-xl rotate-[-2deg] max-w-xs shadow-sm">
                  <p className="text-xs font-sans font-bold text-[#a4384c] tracking-widest uppercase mb-1">
                    Keep Memories Warm
                  </p>
                  <p className="font-caveat text-[#564243] text-lg">
                    You can revisit this notebook anytime using your lock password.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate("/create")}
                  className="mt-8 bg-[#a4384c] hover:bg-[#852036] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md active:scale-95 transition-all"
                  id="btn-reveal-back"
                >
                  Create Another Scrapbook
                </button>
              </div>
            </div>
          ) : (
            // --- C. ACTIVE MESSAGE PAGE SPREAD ---
            // We use templates 1-4.
            // Spreads have a left-page and right-page.
            // On desktop: left page is first, right page is second.
            // On mobile: they stack.
            <div className="w-full flex flex-col md:flex-row h-full min-h-[460px] md:min-h-[520px] relative animate-fadeIn">
              {renderStickers(currentMsg?.layout_template || 1)}

              {/* TEMPLATE DESTRUCTURING AND RENDERING */}
              {(() => {
                const t = currentMsg?.layout_template || 1;
                const messageParts = currentMsg ? currentMsg.message_text.split("\n\n").filter(Boolean) : [];
                // Fallback to split by paragraphs if only single lines
                const notes = messageParts.length > 0 ? messageParts : [currentMsg?.message_text || ""];

                const renderPhotoPolaroid = (rotation: number) => {
                  if (!currentMsg?.photo_url) return null;
                  return (
                    <div 
                      className="bg-white p-3 pb-8 shadow-xl border border-[#dcc0c1]/40 flex flex-col items-center transition-all hover:scale-105 duration-300 relative max-w-[240px] md:max-w-[270px] mx-auto polaroid-shadow"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      {/* Polaroid Top Washi Tape */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-16 h-4 washi-tape-secondary rotate-3 z-10"></div>
                      
                      <div className="w-full aspect-square bg-[#fffcf9] overflow-hidden relative border border-gray-100">
                        <img 
                          src={currentMsg.photo_url} 
                          alt={`Memory from ${currentMsg.sender_name}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <span className="font-caveat text-sm font-bold text-[#564243] tracking-wide">
                          ✨ captured moments
                        </span>
                      </div>
                    </div>
                  );
                };

                const renderNoteBlocks = (bgClass: string, textRotate: number) => {
                  return (
                    <div className="space-y-4 w-full flex flex-col items-center">
                      {notes.map((note, index) => (
                        <div 
                          key={index}
                          className={`${bgClass} p-4 md:p-5 note-shadow rounded-sm w-[90%] md:w-[85%] relative border border-[#dcc0c1]/10`}
                          style={{ transform: `rotate(${textRotate + (index * 2)}deg)` }}
                        >
                          <p className="font-caveat text-lg md:text-xl text-[#251916] leading-relaxed italic whitespace-pre-wrap">
                            "{note}"
                          </p>
                          {index === notes.length - 1 && (
                            <div className="absolute -bottom-2 -right-2 text-rose-400 text-lg">❤️</div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                };

                // PRESET LAYOUT ARRANGEMENTS (1 - 4)
                if (t === 1) {
                  // Layout 1: Photo left, Message right
                  return (
                    <>
                      {/* Left Page */}
                      <div className="w-full md:w-1/2 dot-grid p-6 md:p-10 border-b-2 md:border-b-0 md:border-r border-[#dcc0c1]/40 flex items-center justify-center bg-[#fffdfa]">
                        {currentMsg?.photo_url ? (
                          renderPhotoPolaroid(currentMsg.rotation_deg)
                        ) : (
                          <div className="text-center p-6 bg-[#fff0ee]/40 rounded-xl border border-dashed border-[#ffb2ba] max-w-xs rotate-[-1deg]">
                            <span className="text-4xl">💌</span>
                            <p className="font-caveat text-lg mt-2 text-[#6e5f60]">Filled with thoughts from the heart</p>
                          </div>
                        )}
                      </div>
                      {/* Right Page */}
                      <div className="w-full md:w-1/2 dot-grid p-6 md:p-10 flex flex-col justify-center bg-[#fdfaf7]">
                        <div className="mb-4 text-center md:text-left">
                          <h4 className="font-marker text-3xl text-[#a4384c] tracking-tight transform -rotate-1">
                            {currentMsg?.sender_name}
                          </h4>
                        </div>
                        {renderNoteBlocks("bg-[#ffd9dc]/40", 2)}
                      </div>
                    </>
                  );
                } else if (t === 2) {
                  // Layout 2: Message left, Photo right
                  return (
                    <>
                      {/* Left Page */}
                      <div className="w-full md:w-1/2 dot-grid p-6 md:p-10 border-b-2 md:border-b-0 md:border-r border-[#dcc0c1]/40 flex flex-col justify-center bg-[#fffdfa]">
                        <div className="mb-4 text-center md:text-left">
                          <h4 className="font-marker text-3xl text-[#a4384c] tracking-tight transform rotate-2">
                            {currentMsg?.sender_name}
                          </h4>
                        </div>
                        {renderNoteBlocks("bg-[#f2dedf]/50", -2)}
                      </div>
                      {/* Right Page */}
                      <div className="w-full md:w-1/2 dot-grid p-6 md:p-10 flex items-center justify-center bg-[#fdfaf7]">
                        {currentMsg?.photo_url ? (
                          renderPhotoPolaroid(currentMsg.rotation_deg)
                        ) : (
                          <div className="text-center p-6 bg-[#ffd9dc]/20 rounded-xl border border-dashed border-[#dcc0c1] max-w-xs rotate-2">
                            <span className="text-4xl">✨</span>
                            <p className="font-caveat text-lg mt-2 text-[#6e5f60]">Sending warm hugs and smiles!</p>
                          </div>
                        )}
                      </div>
                    </>
                  );
                } else if (t === 3) {
                  // Layout 3: Photo top-center (Left page), Message below (Right page)
                  return (
                    <>
                      {/* Left Page */}
                      <div className="w-full md:w-1/2 dot-grid p-6 md:p-10 border-b-2 md:border-b-0 md:border-r border-[#dcc0c1]/40 flex flex-col justify-center bg-[#fffdfa]">
                        <div className="text-center mb-4">
                          <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-gray-400">
                            A lovely snapshot from
                          </h4>
                          <h4 className="font-marker text-3xl text-[#a4384c] mt-1 transform -rotate-1">
                            {currentMsg?.sender_name}
                          </h4>
                        </div>
                        <div className="flex items-center justify-center">
                          {currentMsg?.photo_url ? (
                            renderPhotoPolaroid(currentMsg.rotation_deg)
                          ) : (
                            <div className="p-8 text-center bg-[#e9e2d3]/30 rounded-xl border border-[#dcc0c1] rotate-1">
                              <span className="text-5xl">🎂</span>
                              <p className="font-caveat text-lg mt-2 text-[#514344]">A beautiful virtual flower vine</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Right Page */}
                      <div className="w-full md:w-1/2 dot-grid p-6 md:p-10 flex flex-col justify-center bg-[#fdfaf7]">
                        {renderNoteBlocks("bg-[#fff0ee]/70", 1)}
                      </div>
                    </>
                  );
                } else {
                  // Layout 4: Mixed cream notes and pinned photo
                  return (
                    <>
                      {/* Left Page */}
                      <div className="w-full md:w-1/2 dot-grid p-6 md:p-10 border-b-2 md:border-b-0 md:border-r border-[#dcc0c1]/40 flex flex-col justify-center bg-[#fffdfa]">
                        <div className="mb-4 text-center">
                          <h4 className="font-marker text-3xl text-[#a4384c] tracking-tight font-bold rotate-1">
                            {currentMsg?.sender_name}
                          </h4>
                        </div>
                        {renderNoteBlocks("bg-[#ffd9dc]/30", -1)}
                      </div>
                      {/* Right Page */}
                      <div className="w-full md:w-1/2 dot-grid p-6 md:p-10 flex flex-col justify-center items-center bg-[#fdfaf7]">
                        {currentMsg?.photo_url ? (
                          renderPhotoPolaroid(currentMsg.rotation_deg)
                        ) : (
                          <div className="text-center p-6 bg-[#fff0ee]/60 rounded-xl border border-dashed border-[#ffb2ba] max-w-xs rotate-3">
                            <span className="text-4xl">💖</span>
                            <p className="font-caveat text-lg mt-2 text-[#a4384c]">Keep shining bright forever!</p>
                          </div>
                        )}
                      </div>
                    </>
                  );
                }
              })()}
            </div>
          )}
        </div>

        {/* Outer Right Navigation Button (Desktop) */}
        <button
          onClick={handleNextPage}
          disabled={currentPageIndex === totalSpreads + 1}
          className="absolute -right-3 md:-right-12 lg:-right-16 z-40 bg-[#fff8f6]/95 hover:bg-[#a4384c] hover:text-white disabled:opacity-30 disabled:pointer-events-none p-3.5 rounded-full text-[#a4384c] transition-all shadow-lg border border-[#dcc0c1]/40 active:scale-95 cursor-pointer"
          title="Next Page"
          id="btn-page-next"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>

      {/* Spreads Page Indicator */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="bg-[#ffd9dc]/80 px-6 py-2 rounded-full shadow-sm border border-[#ffb2ba]/40">
          <span className="font-marker text-base text-[#a4384c]">
            {currentPageIndex === 0
              ? "Cover Page"
              : currentPageIndex === totalSpreads + 1
              ? "The End"
              : `${currentPageIndex} / ${totalSpreads}`}
          </span>
        </div>
        
        {/* Decorative mini dots slider */}
        <div className="flex gap-2.5">
          <div 
            onClick={() => setCurrentPageIndex(0)}
            className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${currentPageIndex === 0 ? "bg-[#a4384c] w-6" : "bg-[#dcc0c1]"}`}
          />
          {messages.map((_, index) => (
            <div 
              key={index}
              onClick={() => setCurrentPageIndex(index + 1)}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${currentPageIndex === index + 1 ? "bg-[#a4384c] w-6" : "bg-[#dcc0c1]"}`}
            />
          ))}
          <div 
            onClick={() => setCurrentPageIndex(totalSpreads + 1)}
            className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${currentPageIndex === totalSpreads + 1 ? "bg-[#a4384c] w-6" : "bg-[#dcc0c1]"}`}
          />
        </div>
      </div>

      {/* Empty State warning */}
      {totalSpreads === 0 && (
        <div className="mt-6 text-center max-w-sm mx-auto p-4 bg-[#ffd9dc]/20 rounded-xl border border-dashed border-[#ffb2ba] text-xs text-[#a4384c]">
          🎂 No messages have been submitted yet! Send the Contributor Link to friends so they can write.
        </div>
      )}
    </div>
  );
}
