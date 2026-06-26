'use client';

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { useParams } from "next/navigation";
import { Lock, Unlock, ChevronLeft, ChevronRight, House } from "lucide-react";
import Link from "next/link";
import { getCelebrantName, revealMessages } from "@/app/actions/create-page";
import type { Message } from "@/types";
import dynamic from "next/dynamic";

const FlipBook = dynamic(() => import("react-pageflip").then(m => m.default), {
  ssr: false,
  loading: () => null,
}) as React.ComponentType<any>;

const stickers = [
  { text: "🌸", style: "text-rose-400 rotate-[8deg] text-3xl" },
  { text: "✨", style: "text-amber-400 -rotate-12 text-2xl" },
  { text: "💖", style: "text-red-400 rotate-6 text-3xl" },
  { text: "🎈", style: "text-indigo-400 -rotate-6 text-3xl" },
  { text: "⭐", style: "text-yellow-400 rotate-12 text-2xl" },
  { text: "🌟", style: "text-amber-400 -rotate-[15deg] text-2xl" },
  { text: "🎉", style: "text-emerald-400 rotate-4 text-3xl" },
];

function MobileMessagePage({ msg }: { msg: Message }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const page = pageRef.current;
    const text = textRef.current;
    if (!page || !text) return;

    const prevOverflow = page.style.overflow;
    page.style.overflow = 'hidden';

    let lo = 9, hi = 28;
    for (let i = 0; i < 8; i++) {
      const mid = (lo + hi) / 2;
      text.style.fontSize = `${mid}px`;
      void page.offsetHeight;
      if (page.scrollHeight > page.clientHeight) {
        hi = mid;
      } else {
        lo = mid;
      }
    }
    text.style.fontSize = `${lo}px`;
    page.style.overflow = prevOverflow;
  }, [msg.message_text]);

  const notes = msg.message_text.split("\n\n").filter(Boolean);
  const blocks = notes.length > 0 ? notes : [msg.message_text];

  return (
    <div ref={pageRef} className="bg-[#fffdfa] dot-grid p-2 flex flex-col relative overflow-hidden h-full">
      {(() => {
        const shuffled = shuffleArray(stickers);
        return (
          <>
            <div className={`absolute top-2 left-3 select-none pointer-events-none ${shuffled[0]?.style || ""}`}>
              {shuffled[0]?.text}
            </div>
            <div className={`absolute bottom-2 right-3 select-none pointer-events-none ${shuffled[1]?.style || ""}`}>
              {shuffled[1]?.text}
            </div>
          </>
        );
      })()}
      <div className="flex flex-col items-center gap-1 my-auto w-full">
        {msg.photo_url ? (
          <div className="flex items-center justify-center w-full shrink-0">
            <div
              className="bg-white p-1 pb-2 shadow-md border border-[#dcc0c1]/40 flex flex-col items-center w-full max-w-[100px] polaroid-shadow"
              style={{ transform: `rotate(${msg.rotation_deg}deg)` }}
            >
              <div className="w-full aspect-square bg-[#fffcf9] overflow-hidden relative border border-gray-100">
                <img src={msg.photo_url} alt={`Memory from ${msg.sender_name}`} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        ) : null}
        <div className="text-center">
          <h4 className="font-marker text-sm text-[#a4384c] tracking-tight break-words leading-tight">{msg.sender_name}</h4>
        </div>
        <div ref={textRef} className="w-full space-y-1" style={{ lineHeight: 1.3 }}>
          {blocks.length > 0 ? (
            blocks.map((note, idx) => (
              <div key={idx} className="bg-[#ffd9dc]/40 p-1.5 rounded-sm w-full border border-[#dcc0c1]/10">
                <p className="font-caveat text-[#251916] leading-relaxed whitespace-pre-wrap">
                  &ldquo;{note}&rdquo;
                </p>
              </div>
            ))
          ) : (
            <div className="bg-[#ffd9dc]/40 p-1.5 rounded-sm w-full border border-[#dcc0c1]/10">
              <p className="font-caveat text-[#251916] leading-relaxed whitespace-pre-wrap">
                &ldquo;&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RevealPage() {
  const { slug } = useParams<{ slug: string }>();
  const bookRef = useRef<any>(null);
  const touchStartXRef = useRef<number | null>(null);

  const [celebrantName, setCelebrantName] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingPage, setCheckingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  // Mobile page-flip animation: key forces remount → CSS animation always restarts
  const [pageKey, setPageKey] = useState(0);
  const [navDir, setNavDir] = useState<"next" | "prev">("next");

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 640);
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    async function checkPage() {
      try {
        setCheckingPage(true);

        // Check localStorage for cached unlock
        const cached = localStorage.getItem(`hushbook-${slug}`);
        if (cached) {
          const data = JSON.parse(cached);
          setMessages(data.messages);
          setPageCount(data.messages.length * 2 + 4);
          setCelebrantName(data.celebrant_name);
          setAuthenticated(true);
          setCheckingPage(false);
          return;
        }

        const name = await getCelebrantName(slug);
        if (!name) {
          setError("This birthday page doesn't exist — check your link!");
        } else {
          setCelebrantName(name);
        }
      } catch {
        setError("Error loading page.");
      } finally {
        setCheckingPage(false);
      }
    }
    checkPage();
  }, [slug]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError(null);

    try {
      const data = await revealMessages(slug, password);
      setMessages(data.messages);
      setPageCount(data.messages.length * 2 + 4);
      setCelebrantName(data.celebrant_name);
      setAuthenticated(true);
      localStorage.setItem(`hushbook-${slug}`, JSON.stringify({
        celebrant_name: data.celebrant_name,
        messages: data.messages,
      }));
    } catch (err: any) {
      setError(err.message || "Failed to unlock.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = useCallback(() => {
    if (isMobile) {
      setNavDir("prev");
      setPageKey(k => k + 1);
      setCurrentPage(p => Math.max(0, p - 1));
    } else if (bookRef.current?.pageFlip) {
      bookRef.current.pageFlip().flipPrev();
    }
  }, [isMobile]);

  const handleNextPage = useCallback(() => {
    if (isMobile) {
      setNavDir("next");
      setPageKey(k => k + 1);
      setCurrentPage(p => p + 1);
    } else if (bookRef.current?.pageFlip) {
      bookRef.current.pageFlip().flipNext();
    }
  }, [isMobile]);

  const handleFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  const handleInit = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) {
      setNavDir("next");
      setPageKey(k => k + 1);
      setCurrentPage(p => p + 1);
    } else {
      setNavDir("prev");
      setPageKey(k => k + 1);
      setCurrentPage(p => Math.max(0, p - 1));
    }
  }, []);

  const renderPhotoCard = (msg: Message, rotation: number) => {
    if (!msg.photo_url) return null;
    return (
      <div
        className="bg-white p-2 pb-4 sm:p-3 sm:pb-8 shadow-xl border border-[#dcc0c1]/40 flex flex-col items-center mx-auto w-full max-w-[160px] sm:max-w-[220px] polaroid-shadow"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-16 h-4 washi-tape-secondary rotate-3 z-10" />
        <div className="w-full aspect-square bg-[#fffcf9] overflow-hidden relative border border-gray-100">
          <img
            src={msg.photo_url}
            alt={`Memory from ${msg.sender_name}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-2 sm:mt-3 text-center">
          <span className="font-caveat text-xs sm:text-sm font-bold text-[#564243] tracking-wide">✨ captured moments</span>
        </div>
      </div>
    );
  };

  const renderNoteBlocks = (msg: Message, bgClass: string, textRotate: number) => {
    const notes = msg.message_text.split("\n\n").filter(Boolean);
    const blocks = notes.length > 0 ? notes : [msg.message_text];

    return (
      <div className="space-y-3 w-full flex flex-col items-center">
        {blocks.map((note, idx) => (
          <div
            key={idx}
            className={`${bgClass} p-2.5 sm:p-3 md:p-4 note-shadow rounded-sm w-full md:w-[90%] relative border border-[#dcc0c1]/10`}
            style={{ transform: `rotate(${textRotate + idx * 2}deg)` }}
          >
            <p className="font-caveat text-sm sm:text-base md:text-lg text-[#251916] leading-relaxed whitespace-pre-wrap">
              &ldquo;{note}&rdquo;
            </p>
            {idx === blocks.length - 1 && (
              <div className="absolute -bottom-2 -right-2 text-rose-400 text-lg">❤️</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPageStickers = (templateId: number) => {
    const shuffled = shuffleArray(stickers);
    return (
      <>
        <div className={`absolute top-2 left-3 select-none pointer-events-none ${shuffled[0]?.style || ""}`}>
          {shuffled[0]?.text}
        </div>
        <div className={`absolute bottom-2 right-3 select-none pointer-events-none ${shuffled[1]?.style || ""}`}>
          {shuffled[1]?.text}
        </div>
      </>
    );
  };

  const buildPages = (mobile: boolean) => {
    const pages: React.ReactNode[] = [];

    // Page 0: Left cover
    pages.push(
      <div key="cover-left" className="bg-[#fffdfa] dot-grid p-4 md:p-8 flex flex-col justify-center items-center text-center relative overflow-hidden h-full">
        <div className="absolute top-4 left-4 w-16 h-6 washi-tape-primary rotate-12 z-10" />
        <div className="w-20 h-20 bg-[#ffd9dc] rounded-full flex items-center justify-center text-[#a4384c] text-4xl shadow-inner mb-4 shrink-0">
          🎁
        </div>
        <h3 className="font-marker text-2xl md:text-3xl text-[#a4384c] uppercase tracking-wide">Surprise Book</h3>
        <div className="w-16 h-0.5 bg-[#a4384c] mt-4 opacity-50 shrink-0" />
      </div>
    );

    // Page 1: Right cover
    pages.push(
      <div key="cover-right" className="bg-[#fdfaf7] dot-grid p-4 md:p-8 flex flex-col justify-center items-center text-center relative overflow-hidden h-full">
        <div className="absolute bottom-4 right-4 text-3xl animate-pulse select-none">🌸</div>
        <h2 className="font-marker text-2xl md:text-3xl text-[#a4384c] leading-tight">
          Happy Birthday, {celebrantName}! 🎉
        </h2>
        <p className="font-caveat text-lg text-[#564243] mt-4 max-w-xs leading-relaxed">
          Your friends have gathered here to craft a physical journal of precious memories.
        </p>
      </div>
    );

    // Message pages
    messages.forEach((msg, i) => {
      const t = msg.layout_template;

      if (mobile) {
        pages.push(<MobileMessagePage key={`msg-${i}`} msg={msg} />);
      } else {
        const leftContent: React.ReactNode[] = [];
        const rightContent: React.ReactNode[] = [];

        const senderEl = (
          <div className="mb-3 text-center">
            <h4 className="font-marker text-xl sm:text-2xl md:text-3xl text-[#a4384c] tracking-tight break-words">{msg.sender_name}</h4>
          </div>
        );

        if (t === 1) {
          leftContent.push(
            <div key="photo" className="flex items-center justify-center w-full h-full">
              {msg.photo_url ? renderPhotoCard(msg, msg.rotation_deg) : (
                <div className="text-center p-3 sm:p-4 bg-[#fff0ee]/40 rounded-xl border border-dashed border-[#ffb2ba] w-full max-w-[160px] sm:max-w-[180px] rotate-[-1deg]">
                  <span className="text-2xl sm:text-3xl">💌</span>
                  <p className="font-caveat text-sm sm:text-base mt-1 sm:mt-2 text-[#6e5f60]">Filled with thoughts from the heart</p>
                </div>
              )}
            </div>
          );
          rightContent.push(
            <div key="notes" className="flex flex-col justify-center items-center w-full h-full">
              {senderEl}
              {renderNoteBlocks(msg, "bg-[#ffd9dc]/40", 2)}
            </div>
          );
        } else if (t === 2) {
          leftContent.push(
            <div key="notes" className="flex flex-col justify-center items-center w-full h-full">
              {senderEl}
              {renderNoteBlocks(msg, "bg-[#f2dedf]/50", -2)}
            </div>
          );
          rightContent.push(
            <div key="photo" className="flex items-center justify-center w-full h-full">
              {msg.photo_url ? renderPhotoCard(msg, msg.rotation_deg) : (
                <div className="text-center p-3 sm:p-4 bg-[#ffd9dc]/20 rounded-xl border border-dashed border-[#dcc0c1] w-full max-w-[160px] sm:max-w-[180px] rotate-2">
                  <span className="text-2xl sm:text-3xl">✨</span>
                  <p className="font-caveat text-sm sm:text-base mt-1 sm:mt-2 text-[#6e5f60]">Sending warm hugs!</p>
                </div>
              )}
            </div>
          );
        } else if (t === 3) {
          leftContent.push(
            <div key="sender-photo" className="flex flex-col justify-center items-center w-full h-full gap-2">
              {senderEl}
              {msg.photo_url ? renderPhotoCard(msg, msg.rotation_deg) : (
                <div className="p-3 sm:p-4 text-center bg-[#e9e2d3]/30 rounded-xl border border-[#dcc0c1] rotate-1 w-full max-w-[160px] sm:max-w-[180px]">
                  <span className="text-3xl sm:text-4xl">🎂</span>
                  <p className="font-caveat text-sm sm:text-base mt-1 text-[#514344]">A beautiful memory</p>
                </div>
              )}
            </div>
          );
          rightContent.push(
            <div key="notes" className="flex flex-col justify-center items-center w-full h-full">
              {renderNoteBlocks(msg, "bg-[#fff0ee]/70", 1)}
            </div>
          );
        } else {
          leftContent.push(
            <div key="notes" className="flex flex-col justify-center items-center w-full h-full">
              {senderEl}
              {renderNoteBlocks(msg, "bg-[#ffd9dc]/30", -1)}
            </div>
          );
          rightContent.push(
            <div key="photo" className="flex items-center justify-center w-full h-full">
              {msg.photo_url ? renderPhotoCard(msg, msg.rotation_deg) : (
                <div className="text-center p-3 sm:p-4 bg-[#fff0ee]/60 rounded-xl border border-dashed border-[#ffb2ba] w-full max-w-[160px] sm:max-w-[180px] rotate-3">
                  <span className="text-2xl sm:text-3xl">💖</span>
                  <p className="font-caveat text-sm sm:text-base mt-1 sm:mt-2 text-[#a4384c]">Keep shining!</p>
                </div>
              )}
            </div>
          );
        }

        pages.push(
          <div key={`msg-${i}-left`} className="bg-[#fffdfa] dot-grid p-3 sm:p-4 md:p-6 flex items-center justify-center relative overflow-hidden h-full">
            {renderPageStickers(t)}
            {leftContent}
          </div>
        );
        pages.push(
          <div key={`msg-${i}-right`} className="bg-[#fdfaf7] dot-grid p-3 sm:p-4 md:p-6 flex items-center justify-center relative overflow-hidden h-full">
            {renderPageStickers(t + 1)}
            {rightContent}
          </div>
        );
      }
    });

    // End pages
    const totalMsgs = messages.length;
    const pageCls = "p-4 md:p-8 flex flex-col justify-center items-center text-center relative overflow-hidden h-full";
    if (totalMsgs === 0) {
      pages.push(
        <div key="empty-left" className={`bg-[#fffdfa] dot-grid ${pageCls}`}>
          <span className="text-5xl shrink-0">🎂</span>
          <h2 className="font-marker text-2xl text-[#a4384c] mt-4">No messages yet!</h2>
          <p className="font-caveat text-lg text-[#564243] mt-3">Share the contributor link with friends so they can write.</p>
        </div>
      );
      pages.push(
        <div key="empty-right" className={`bg-[#fdfaf7] dot-grid ${pageCls}`}>
          <span className="text-5xl shrink-0">💝</span>
          <p className="font-caveat text-lg text-[#564243] mt-4">Check back soon for sweet surprises!</p>
        </div>
      );
    } else {
      pages.push(
        <div key="end-left" className={`bg-[#fffdfa] dot-grid ${pageCls}`}>
          <span className="text-5xl animate-spin-slow shrink-0">💐</span>
          <h2 className="font-marker text-2xl text-[#a4384c] mt-4">That&apos;s All!</h2>
          <p className="font-caveat text-lg text-[#564243] mt-3">We hope these sweet words made your day sparkle.</p>
        </div>
      );
      pages.push(
        <div key="end-right" className={`bg-[#fdfaf7] dot-grid ${pageCls}`}>
          <div className="bg-[#ffd9dc]/40 border-2 border-[#dcc0c1] p-3 rounded-xl rotate-[-2deg] max-w-[200px] shadow-sm shrink-0">
            <p className="font-caveat text-[#564243] text-base">You can revisit this notebook anytime using your lock password.</p>
          </div>
          <Link
            href="/"
            className="mt-6 bg-[#a4384c] hover:bg-[#852036] text-white px-5 py-2 rounded-full text-xs font-bold shadow-md active:scale-95 transition-all shrink-0"
          >
            Back to Home
          </Link>
        </div>
      );
    }

    return pages;
  };

  if (checkingPage) {
    return (
      <div className="min-h-screen bg-[#fff8f6] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#a4384c] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-[#6e5f60] font-medium text-sm">Opening mailbox...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#fff8f6] flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#dcc0c1]/40 dot-grid relative text-center">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#6a5b5c]/25 backdrop-blur-[1px] rotate-1" />

            <div className="w-16 h-16 bg-[#ffd9dc] text-[#a4384c] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>

            <h2 className="text-2xl font-sans font-bold text-[#a4384c]">Birthday Surprise Box</h2>
            <p className="text-sm text-[#564243] mt-2 mb-6">
              Enter your secret password to unlock the scrapbook left by your friends for{" "}
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
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#897173]" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#a4384c] hover:bg-[#852036] disabled:bg-[#6a5b5c]/60 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>{loading ? "Unlocking Scrapbook..." : "Unlock Surprise 🎁"}</span>
              </button>
            </form>

            <div className="mt-6 flex justify-center">
              <Link href="/" className="text-xs text-[#6a5b5c] hover:text-[#a4384c] transition-colors flex items-center gap-1">
                <House className="w-3 h-3" /> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pages = buildPages(isMobile);
  const totalPages = pages.length;
  const currentMsgIndex = Math.max(0, isMobile ? currentPage - 2 : Math.floor((currentPage - 2) / 2));
  const displayLabel =
    currentPage < 2 ? "Cover" :
    currentPage >= totalPages - 2 ? "The End" :
    `${currentMsgIndex + 1} / ${messages.length || 0}`;

  return (
    <div className="min-h-screen bg-[#fff8f6] flex flex-col">
      <header className="w-full bg-[#fff8f6]/85 backdrop-blur-md sticky top-0 z-50 border-b border-[#dcc0c1]/40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <span className="text-2xl">💝</span>
            <span className="font-sans font-bold text-xl italic text-[#a4384c] tracking-tight hidden sm:inline">HushBook</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#564243] font-medium hidden sm:block">🎉 {celebrantName}&apos;s Wall</span>
            <button
              onClick={() => {
                localStorage.removeItem(`hushbook-${slug}`);
                setAuthenticated(false);
                setPassword("");
                setMessages([]);
                setCurrentPage(0);
              }}
              className="text-xs font-bold text-[#6a5b5c] px-3 py-1.5 bg-[#f2dedf] hover:bg-[#d5c2c3] rounded-full transition-colors cursor-pointer"
              title="Lock this scrapbook"
            >
              🔒 Lock
            </button>
            <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-[#6a5b5c] hover:bg-[#a4384c]/10 transition-colors">
              <House className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-2 md:py-8 min-h-0">
        <div className="w-full max-w-[1000px] mx-auto px-2 md:px-8 animate-scaleUp">
          <div className="relative w-full flex items-center group">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 0}
              className="absolute -left-2 sm:-left-3 md:-left-12 lg:-left-16 z-40 bg-[#fff8f6]/95 hover:bg-[#a4384c] hover:text-white disabled:opacity-30 disabled:pointer-events-none p-2 sm:p-3 rounded-full text-[#a4384c] transition-all shadow-lg border border-[#dcc0c1]/40 active:scale-95 cursor-pointer touch-manipulation"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            </button>

            {isMobile ? (
              /* ── Mobile: single-page pager — key remount forces CSS animation to restart ── */
              <div
                className="relative w-full bg-[#fcf8f2] rounded-2xl shadow-2xl border-4 border-[#f5ddd9]"
                style={{ height: 'min(calc(100svh - 200px), 600px)', minHeight: '350px', overflow: 'hidden' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  key={pageKey}
                  className={`w-full h-full ${navDir === "next" ? "page-flip-in-next" : "page-flip-in-prev"}`}
                >
                  {pages[currentPage]}
                </div>
              </div>
            ) : (
              /* ── Desktop: FlipBook ── */
              <div className="relative w-full bg-[#fcf8f2] rounded-2xl shadow-2xl overflow-hidden border-4 md:border-8 border-[#f5ddd9] min-h-[350px] md:min-h-[500px]">
                {/* Binder rings */}
                <div className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 z-30 hidden md:flex flex-col justify-around py-6 pointer-events-none">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-full h-3 binder-ring rounded-full" />
                  ))}
                </div>
                <FlipBook
                  ref={bookRef}
                  width={450}
                  height={560}
                  size="stretch"
                  minWidth={280}
                  maxWidth={900}
                  minHeight={350}
                  maxHeight={600}
                  showPageCorners={false}
                  mobileScrollSupport={false}
                  onFlip={handleFlip}
                  onInit={handleInit}
                  flippingTime={600}
                  className="w-full h-full"
                >
                  {pages}
                </FlipBook>
              </div>
            )}

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - (isMobile ? 1 : 2)}
              className="absolute -right-2 sm:-right-3 md:-right-12 lg:-right-16 z-40 bg-[#fff8f6]/95 hover:bg-[#a4384c] hover:text-white disabled:opacity-30 disabled:pointer-events-none p-2 sm:p-3 rounded-full text-[#a4384c] transition-all shadow-lg border border-[#dcc0c1]/40 active:scale-95 cursor-pointer touch-manipulation"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="bg-[#ffd9dc]/80 px-6 py-2 rounded-full shadow-sm border border-[#ffb2ba]/40">
              <span className="font-marker text-base text-[#a4384c]">{displayLabel}</span>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-center max-w-full px-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                if (isMobile) {
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx)}
                      className={`rounded-full cursor-pointer transition-all shrink-0 ${
                        currentPage === idx
                          ? "bg-[#a4384c] w-5 sm:w-6 h-2.5"
                          : "bg-[#dcc0c1] w-2 h-2 sm:w-2.5 sm:h-2.5"
                      }`}
                    />
                  );
                }
                return idx % 2 === 0 && (
                  <button
                    key={idx}
                    onClick={() => {
                      if (bookRef.current?.pageFlip) {
                        bookRef.current.pageFlip().flip(idx);
                      }
                    }}
                    className={`rounded-full cursor-pointer transition-all shrink-0 ${
                      currentPage >= idx && currentPage < idx + 2
                        ? "bg-[#a4384c] w-5 sm:w-6 h-2.5"
                        : "bg-[#dcc0c1] w-2 h-2 sm:w-2.5 sm:h-2.5"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
