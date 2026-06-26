import React, { useState, useEffect } from "react";
import { Cake, Link, Lock, PersonStanding, Check, Copy, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { BirthdayPage, CreatePageResponse, ApiResponse } from "../types";

interface CreatePageProps {
  onNavigate: (path: string) => void;
}

export default function CreatePage({ onNavigate }: CreatePageProps) {
  const [celebrantName, setCelebrantName] = useState("");
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<CreatePageResponse | null>(null);
  
  const [copiedFriend, setCopiedFriend] = useState(false);
  const [copiedReveal, setCopiedReveal] = useState(false);

  // Generate slug dynamically from name if not manually modified
  useEffect(() => {
    if (!isCustomSlug && celebrantName) {
      const generated = celebrantName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-")         // replace spaces with hyphens
        .substring(0, 30);            // limit length
      setSlug(generated);
    }
  }, [celebrantName, isCustomSlug]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomSlug(true);
    // Sanitize in real-time to match regex /^[a-zA-Z0-9_\-]+$/
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setSlug(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!celebrantName || !slug || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/birthday-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          celebrant_name: celebrantName,
          slug,
          password,
        }),
      });

      const resJson: ApiResponse<CreatePageResponse> = await response.json();

      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to create scrapbook page");
      }

      if (resJson.data) {
        setSuccessData(resJson.data);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: "friend" | "reveal") => {
    try {
      const absoluteUrl = `${window.location.origin}${text}`;
      await navigator.clipboard.writeText(absoluteUrl);
      if (type === "friend") {
        setCopiedFriend(true);
        setTimeout(() => setCopiedFriend(false), 2000);
      } else {
        setCopiedReveal(true);
        setTimeout(() => setCopiedReveal(false), 2000);
      }
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-8 md:py-16">
      {/* Visual background decorations */}
      <div className="fixed top-24 left-10 opacity-15 pointer-events-none select-none hidden xl:block">
        <span className="text-8xl">🌸</span>
      </div>
      <div className="fixed bottom-24 right-10 opacity-15 pointer-events-none select-none hidden xl:block">
        <span className="text-8xl">🎂</span>
      </div>

      {/* Main Journal-like Canvas */}
      <div 
        className="paper-canvas w-full bg-[#ffffff] rounded-2xl p-6 md:p-12 shadow-xl border border-[#dcc0c1]/40 dot-grid relative overflow-hidden flex flex-col min-h-[600px]"
        id="create-container"
      >
        {/* Left vertical red binder seam guideline */}
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-[2px] bg-[#a4384c]/15 border-l border-[#a4384c]/10 border-r border-[#a4384c]/10 pointer-events-none" />

        {/* Washi tapes overlay decoration */}
        <div className="absolute -top-1 -right-4 w-28 h-7 washi-tape-primary rotate-12 z-10" />
        <div className="absolute -bottom-2 left-16 w-24 h-6 washi-tape-secondary -rotate-3 z-10" />

        <div className="pl-8 md:pl-12">
          {!successData ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#ffd9dc] text-[#a4384c] rounded-full flex items-center justify-center shadow-inner">
                  <Cake className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-sans font-bold text-[#a4384c] tracking-tight">
                    New Scrapbook
                  </h2>
                  <p className="text-sm text-[#564243] font-medium mt-1">
                    Gather love, memories, and warm wishes. Design a digital wall that feels like a handmade gift.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#400011] rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Creation Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Celebrant Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#6a5b5c] uppercase tracking-wider">
                    Celebrant Name
                  </label>
                  <div className="relative rounded-xl overflow-hidden shadow-sm hover:scale-[1.01] transition-transform duration-200">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Clara"
                      value={celebrantName}
                      onChange={(e) => setCelebrantName(e.target.value)}
                      className="w-full bg-[#fff0ee]/40 border-2 border-[#dcc0c1] rounded-xl px-4 py-3.5 pl-11 text-base text-[#251916] placeholder-[#564243]/50 focus:border-[#a4384c] focus:outline-none transition-colors"
                      id="input-celebrant-name"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#897173]">
                      <span>👤</span>
                    </div>
                  </div>
                </div>

                {/* Slug Link */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#6a5b5c] uppercase tracking-wider">
                    Scrapbook Link Slug
                  </label>
                  <div className="flex items-center bg-[#fff0ee]/40 border-2 border-dashed border-[#dcc0c1] rounded-xl px-4 py-3 shadow-inner">
                    <span className="text-[#564243]/60 text-sm font-medium mr-1 select-none">
                      scrapbook/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="maria-clara"
                      value={slug}
                      onChange={handleSlugChange}
                      className="flex-grow bg-transparent border-none p-0 text-base font-bold text-[#a4384c] focus:outline-none focus:ring-0"
                      id="input-slug"
                    />
                    <Link className="w-4 h-4 text-[#897173]" />
                  </div>
                  <p className="text-xs text-[#564243]/70 pl-1">
                    Your friends will visit this link to write their birthday pages.
                  </p>
                </div>

                {/* Secret Password */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#6a5b5c] uppercase tracking-wider">
                    Secret Lock Password
                  </label>
                  <div className="relative rounded-xl overflow-hidden shadow-sm hover:scale-[1.01] transition-transform duration-200">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#fff0ee]/40 border-2 border-[#dcc0c1] rounded-xl px-4 py-3.5 pl-11 text-base text-[#251916] placeholder-[#564243]/50 focus:border-[#a4384c] focus:outline-none transition-colors"
                      id="input-password"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#897173]" />
                  </div>
                  <p className="text-xs text-[#564243]/70 pl-1">
                    The celebrant will use this password to unlock the final journal. Keep it secret!
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-4 flex flex-col items-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#a4384c] hover:bg-[#852036] disabled:bg-[#6a5b5c]/60 text-[#ffffff] px-10 py-4 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-3 group cursor-pointer"
                    id="submit-create"
                  >
                    <span>{loading ? "Creating Scrapbook..." : "Create My Scrapbook"}</span>
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </button>
                  <p className="mt-4 text-[#6e5f60] text-sm italic font-sans flex items-center gap-1">
                    ✨ Bound with love in every pixel
                  </p>
                </div>
              </form>

              {/* Informative Step Explanation */}
              <div className="mt-12">
                <div className="bg-[#efdbdc]/40 p-6 rounded-2xl border border-[#dcc0c1]/40 relative overflow-hidden">
                  <h3 className="text-lg font-bold text-[#6a5b5c] mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#a4384c]" />
                    What happens next?
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[#a4384c] font-bold text-sm">
                        <ArrowRight className="w-4 h-4" />
                        <h4>1. The Contributor Link</h4>
                      </div>
                      <p className="text-xs text-[#564243] leading-relaxed">
                        Share this link with friends and family. This is where they will write messages, pick layouts, and pin beautiful photos securely.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[#a4384c] font-bold text-sm">
                        <BookOpen className="w-4 h-4" />
                        <h4>2. The Display Journal</h4>
                      </div>
                      <p className="text-xs text-[#564243] leading-relaxed">
                        The final masterpiece! Provide the celebrant with their link and lock password. They can flip through real-time greetings like a book.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Success / Share Screen */
            <div className="space-y-8 py-4 animate-fadeIn">
              <div className="text-center">
                <span className="text-6xl">🎉</span>
                <h2 className="text-3xl font-sans font-bold text-[#a4384c] mt-4">
                  Scrapbook Successfully Bound!
                </h2>
                <p className="text-sm text-[#564243] max-w-md mx-auto mt-2">
                  The digital pages are ready for memories! Share these special links below to get started.
                </p>
              </div>

              {/* Link Box 1: For Friends */}
              <div className="bg-[#fff0ee]/50 border-2 border-dashed border-[#dcc0c1] rounded-2xl p-5 relative">
                <div className="absolute -top-3 left-4 bg-[#ffd9dc] text-[#a4384c] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  📢 Share with Friends
                </div>
                <p className="text-xs text-[#564243] mb-3 mt-1 font-medium">
                  Send this link to friends so they can write sweet words and upload photos:
                </p>
                <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-[#dcc0c1] shadow-inner">
                  <span className="text-[#a4384c] font-mono text-sm break-all flex-grow">
                    {window.location.origin}{successData.friendLink}
                  </span>
                  <button
                    onClick={() => copyToClipboard(successData.friendLink, "friend")}
                    className="bg-[#ffd9dc] hover:bg-[#ffb2ba] text-[#a4384c] p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold whitespace-nowrap"
                    id="copy-friend-link"
                  >
                    {copiedFriend ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copiedFriend ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* Link Box 2: For Celebrant */}
              <div className="bg-[#efdbdc]/30 border border-[#dcc0c1]/40 rounded-2xl p-5 relative">
                <div className="absolute -top-3 left-4 bg-[#f2dedf] text-[#6a5b5c] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  🎁 Give to Celebrant
                </div>
                <p className="text-xs text-[#564243] mb-3 mt-1 font-medium">
                  Give this link to <strong className="text-[#a4384c]">{successData.birthdayPage.celebrant_name}</strong> along with the password so they can unlock the journal:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-[#dcc0c1] shadow-inner">
                    <span className="text-[#6a5b5c] font-mono text-sm break-all flex-grow">
                      {window.location.origin}{successData.celebrantLink}
                    </span>
                    <button
                      onClick={() => copyToClipboard(successData.celebrantLink, "reveal")}
                      className="bg-[#f2dedf] hover:bg-[#d5c2c3] text-[#6a5b5c] p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold whitespace-nowrap"
                      id="copy-celebrant-link"
                    >
                      {copiedReveal ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      {copiedReveal ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                  <div className="bg-white/80 border border-[#dcc0c1]/40 rounded-xl px-4 py-2 text-xs flex justify-between items-center text-[#564243]">
                    <span>🔑 Lock Password: <strong className="font-mono text-[#a4384c]">{password}</strong></span>
                    <span className="text-[10px] text-gray-400">Keep safe</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setCelebrantName("");
                    setSlug("");
                    setPassword("");
                    setIsCustomSlug(false);
                    setSuccessData(null);
                  }}
                  className="px-6 py-3 border-2 border-[#a4384c] text-[#a4384c] rounded-full font-bold text-sm hover:bg-[#ffd9dc]/20 active:scale-95 transition-all"
                  id="create-another"
                >
                  Create Another Wall
                </button>
                <button
                  onClick={() => onNavigate(successData.friendLink)}
                  className="px-6 py-3 bg-[#a4384c] text-[#ffffff] rounded-full font-bold text-sm hover:bg-[#852036] active:scale-95 transition-all flex items-center gap-2 justify-center"
                  id="view-friend-preview"
                >
                  <span>View Contribution Page</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sweet footer */}
      <div className="mt-8 text-center text-[#6e5f60] text-xs">
        <p className="uppercase tracking-widest text-[10px]">© 2026 Scrapbooker • Keep memories warm</p>
      </div>
    </div>
  );
}
