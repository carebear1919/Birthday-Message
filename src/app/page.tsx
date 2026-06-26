'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [inputSlug, setInputSlug] = useState("");

  const handleSlugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSlug.trim()) {
      const clean = inputSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      router.push(`/${clean}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f6] flex flex-col">
      <header className="w-full bg-[#fff8f6]/85 backdrop-blur-md sticky top-0 z-50 border-b border-[#dcc0c1]/40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#a4384c]" />
            <span className="font-sans font-bold text-xl italic text-[#a4384c] tracking-tight">Scrapbooker</span>
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

      <main className="flex-grow flex items-center justify-center">
        <div className="relative w-full max-w-4xl mx-auto px-4 py-10 md:py-16 text-center animate-scaleUp">
          <div className="absolute top-10 left-10 opacity-10 text-7xl select-none animate-bounce-slow">🌸</div>
          <div className="absolute bottom-10 right-10 opacity-10 text-7xl select-none animate-bounce-slow">🎨</div>

          <div className="paper-canvas bg-white rounded-2xl p-8 md:p-14 shadow-2xl border border-[#dcc0c1]/40 dot-grid relative overflow-hidden flex flex-col items-center">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-[2px] bg-[#a4384c]/15 border-l border-[#a4384c]/10 border-r border-[#a4384c]/10 pointer-events-none" />
            <div className="absolute top-0 right-12 w-20 h-6 washi-tape-primary rotate-6" />

            <div className="max-w-xl mx-auto space-y-8 pl-6 md:pl-10">
              <div className="inline-flex w-16 h-16 bg-[#ffd9dc] text-[#a4384c] rounded-full items-center justify-center shadow-inner text-3xl">
                💝
              </div>

              <div className="space-y-3">
                <h1 className="font-sans text-4xl md:text-5xl font-bold text-[#a4384c] tracking-tight">
                  Scrapbook Birthday Wall
                </h1>
                <p className="font-caveat text-2xl text-[#6e5f60]">
                  &ldquo;Handcrafted memories that live forever in a digital notebook&rdquo;
                </p>
              </div>

              <p className="text-sm text-[#564243] leading-relaxed max-w-md mx-auto">
                Leave private, hidden birthday greetings, taped stickers, and pinned photos. The celebrant unlocks them later with a password to flip through them like a real physical journal!
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/create"
                  className="bg-[#a4384c] hover:bg-[#852036] text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 group text-sm"
                >
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Create Birthday Wall</span>
                </Link>
              </div>

              <div className="border-t border-[#dcc0c1]/40 pt-8 max-w-sm mx-auto">
                <h3 className="text-xs font-bold text-[#6a5b5c] uppercase tracking-wider mb-3">
                  Have a scrapbook link from a friend?
                </h3>
                <form
                  onSubmit={handleSlugSubmit}
                  className="flex gap-2 bg-[#fff0ee]/40 rounded-xl p-1.5 border-2 border-[#dcc0c1]"
                >
                  <input
                    type="text"
                    placeholder="Enter link name..."
                    value={inputSlug}
                    onChange={(e) => setInputSlug(e.target.value)}
                    className="flex-grow bg-transparent border-none px-3 text-sm focus:outline-none placeholder-[#564243]/40 text-[#251916] font-medium"
                  />
                  <button
                    type="submit"
                    className="bg-[#6a5b5c] hover:bg-[#514344] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Go ▷
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
