'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, PlusCircle, Link2, Copy, Check, Trash2, Eye, House } from "lucide-react";
import Link from "next/link";

interface SavedWall {
  celebrantName: string;
  slug: string;
  friendLink: string;
  celebrantLink: string;
  password: string;
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const [inputSlug, setInputSlug] = useState("");
  const [celebSlug, setCelebSlug] = useState("");
  const [celebPassword, setCelebPassword] = useState("");
  const [savedWalls, setSavedWalls] = useState<SavedWall[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("scrapbook-walls") || "[]");
      setSavedWalls(data);
    } catch {
      // ignore
    }
  }, []);

  const handleSlugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSlug.trim()) {
      const clean = inputSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      router.push(`/${clean}`);
    }
  };

  const handleCelebSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (celebSlug.trim() && celebPassword.trim()) {
      const clean = celebSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      router.push(`/${clean}/reveal`);
    }
  };

  const copyLink = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${url}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const removeWall = (slug: string) => {
    const updated = savedWalls.filter(w => w.slug !== slug);
    setSavedWalls(updated);
    localStorage.setItem("scrapbook-walls", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#fff8f6] flex flex-col">
      <header className="w-full bg-[#fff8f6]/85 backdrop-blur-md sticky top-0 z-50 border-b border-[#dcc0c1]/40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#a4384c]" />
            <span className="font-sans font-bold text-xl italic text-[#a4384c] tracking-tight">HushBook</span>
          </div>
          <Link
            href="/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-[#a4384c] hover:bg-[#a4384c]/10 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Scrapbook</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center py-8 md:py-12">
        <div className="w-full max-w-4xl mx-auto px-4 space-y-8 animate-scaleUp">
          {/* Hero */}
          <div className="text-center">
            <div className="inline-flex w-16 h-16 bg-[#ffd9dc] text-[#a4384c] rounded-full items-center justify-center shadow-inner text-3xl mb-4">
              💝
            </div>
            <h1 className="font-sans text-4xl md:text-5xl font-bold text-[#a4384c] tracking-tight">
              HushBook <span className="hidden sm:inline">— Secret Birthday Scrapbooks</span>
            </h1>
            <p className="font-caveat text-2xl text-[#6e5f60] mt-2">
              &ldquo;Handcrafted memories that live forever in a digital notebook&rdquo;
            </p>
            <p className="text-sm text-[#564243] leading-relaxed max-w-md mx-auto mt-4">
              Leave private, hidden birthday greetings, taped stickers, and pinned photos. The celebrant unlocks them later with a password to flip through them like a real physical journal!
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create"
                className="bg-[#a4384c] hover:bg-[#852036] text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 group text-sm"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Create Birthday Wall</span>
              </Link>
            </div>
          </div>

          {/* Slug lookup */}
          <div className="max-w-sm mx-auto w-full">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-[#dcc0c1]/40 dot-grid relative">
              <div className="absolute -top-2 left-6 w-16 h-4 washi-tape-primary rotate-6 z-10" />
              <h3 className="text-xs font-bold text-[#6a5b5c] uppercase tracking-wider mb-3 text-center">
                Have a scrapbook link from a friend?
              </h3>
              <form onSubmit={handleSlugSubmit} className="flex gap-2 bg-[#fff0ee]/40 rounded-xl p-1.5 border-2 border-[#dcc0c1]">
                <input
                  type="text"
                  placeholder="Enter link name..."
                  value={inputSlug}
                  onChange={(e) => setInputSlug(e.target.value)}
                  className="flex-grow bg-transparent border-none px-3 text-sm focus:outline-none placeholder-[#564243]/40 text-[#251916] font-medium"
                />
                <button type="submit" className="bg-[#6a5b5c] hover:bg-[#514344] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                  Go ▷
                </button>
              </form>
            </div>
          </div>

          {/* Celebrant access */}
          <div className="max-w-sm mx-auto w-full">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-[#dcc0c1]/40 dot-grid relative">
              <div className="absolute -bottom-2 right-6 w-16 h-4 washi-tape-secondary rotate-6 z-10" />
              <h3 className="text-xs font-bold text-[#6a5b5c] uppercase tracking-wider mb-3 text-center">
                🎁 Are you the celebrant?
              </h3>
              <form onSubmit={handleCelebSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter link name..."
                  value={celebSlug}
                  onChange={(e) => setCelebSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  className="w-full bg-[#fff0ee]/40 border-2 border-[#dcc0c1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#a4384c] placeholder-[#564243]/40 text-[#251916] font-medium"
                />
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Your secret password..."
                    value={celebPassword}
                    onChange={(e) => setCelebPassword(e.target.value)}
                    className="flex-1 bg-[#fff0ee]/40 border-2 border-[#dcc0c1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#a4384c] placeholder-[#564243]/40 text-[#251916] font-medium"
                  />
                  <button type="submit" className="bg-[#a4384c] hover:bg-[#852036] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer">
                    Open ▷
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Your Walls */}
          {savedWalls.length > 0 && (
            <div className="max-w-2xl mx-auto w-full">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-[#dcc0c1]/40 dot-grid relative overflow-hidden">
                <div className="absolute -bottom-2 right-8 w-20 h-5 washi-tape-secondary -rotate-3 z-10" />
                <h2 className="font-marker text-2xl text-[#a4384c] mb-6 flex items-center gap-2">
                  📖 Your Scrapbooks
                </h2>
                <div className="space-y-4">
                  {savedWalls.map((wall) => (
                    <div key={wall.slug} className="bg-[#fff0ee]/40 rounded-xl p-4 border border-[#dcc0c1]/40">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-[#a4384c] text-base truncate">{wall.celebrantName}</h3>
                          <p className="text-xs text-[#564243] mt-0.5">
                            Created {new Date(wall.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeWall(wall.slug)}
                          className="text-[#897173] hover:text-red-500 transition-colors p-1 cursor-pointer"
                          title="Remove from list"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 bg-white rounded-lg p-2.5 border border-[#dcc0c1]/30 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#6a5b5c] uppercase whitespace-nowrap">Friends:</span>
                          <span className="text-xs text-[#564243] truncate font-mono">{wall.friendLink}</span>
                          <button
                            onClick={() => copyLink(wall.friendLink, `f-${wall.slug}`)}
                            className="ml-auto text-[#a4384c] hover:text-[#852036] p-1 cursor-pointer"
                          >
                            {copiedId === `f-${wall.slug}` ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <Link
                            href={wall.friendLink}
                            className="bg-[#ffd9dc] text-[#a4384c] px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#ffb2ba] transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </Link>
                          <Link
                            href={wall.celebrantLink}
                            className="bg-[#a4384c] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#852036] transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Reveal
                          </Link>
                        </div>
                      </div>
                      <div className="mt-2 bg-white/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#6a5b5c] uppercase">Password:</span>
                        <span className="text-xs font-mono text-[#564243]">{wall.password}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
