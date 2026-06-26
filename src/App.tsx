/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CreatePage from "./components/CreatePage";
import ContributorPage from "./components/ContributorPage";
import RevealPage from "./components/RevealPage";
import { Sparkles, Heart, BookOpen, Gift, Send, Lock } from "lucide-react";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [inputSlug, setInputSlug] = useState("");

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState(null, "", to);
    setCurrentPath(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Basic Router logic
  // /create
  // /:slug/reveal -> length >= 3 and ends with /reveal
  // /:slug -> any other single folder name

  const renderContent = () => {
    const trimmedPath = currentPath.replace(/^\/|\/$/g, ""); // remove starting/trailing slashes

    if (trimmedPath === "" || trimmedPath === "index.html") {
      // Return beautiful landing home page
      return (
        <div className="relative w-full max-w-4xl mx-auto px-4 py-10 md:py-16 text-center animate-scaleUp">
          <div className="absolute top-10 left-10 opacity-10 text-7xl select-none animate-bounce-slow">🌸</div>
          <div className="absolute bottom-10 right-10 opacity-10 text-7xl select-none animate-bounce-slow">🎨</div>

          <div className="paper-canvas bg-white rounded-2xl p-8 md:p-14 shadow-2xl border border-[#dcc0c1]/40 dot-grid relative overflow-hidden flex flex-col items-center">
            {/* Seam bound guide line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-[2px] bg-[#a4384c]/15 border-l border-[#a4384c]/10 border-r border-[#a4384c]/10 pointer-events-none" />
            <div className="absolute top-0 right-12 w-20 h-6 washi-tape-primary rotate-6" />

            <div className="max-w-xl mx-auto space-y-8 pl-6 md:pl-10">
              {/* Flower / Love Icon overlay */}
              <div className="inline-flex w-16 h-16 bg-[#ffd9dc] text-[#a4384c] rounded-full items-center justify-center shadow-inner text-3xl">
                💝
              </div>

              <div className="space-y-3">
                <h1 className="font-sans text-4xl md:text-5xl font-bold text-[#a4384c] tracking-tight">
                  Scrapbook Birthday Wall
                </h1>
                <p className="font-caveat text-2xl text-[#6e5f60]">
                  "Handcrafted memories that live forever in a digital notebook"
                </p>
              </div>

              <p className="text-sm text-[#564243] leading-relaxed max-w-md mx-auto">
                Leave private, hidden birthday greetings, taped stickers, and pinned photos. The celebrant unlocks them later with a password to flip through them like a real physical journal!
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/create")}
                  className="bg-[#a4384c] hover:bg-[#852036] text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer text-sm"
                  id="home-btn-create"
                >
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Create Birthday Wall</span>
                </button>
              </div>

              {/* Enter existing slug form */}
              <div className="border-t border-[#dcc0c1]/40 pt-8 max-w-sm mx-auto">
                <h3 className="text-xs font-bold text-[#6a5b5c] uppercase tracking-wider mb-3">
                  Have a scrapbook link from a friend?
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputSlug.trim()) {
                      const clean = inputSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
                      navigate(`/${clean}`);
                    }
                  }}
                  className="flex gap-2 bg-[#fff0ee]/40 rounded-xl p-1.5 border-2 border-[#dcc0c1]"
                >
                  <input
                    type="text"
                    placeholder="Enter link name..."
                    value={inputSlug}
                    onChange={(e) => setInputSlug(e.target.value)}
                    className="flex-grow bg-transparent border-none px-3 text-sm focus:outline-none placeholder-[#564243]/40 text-[#251916] font-medium"
                    id="home-input-slug"
                  />
                  <button
                    type="submit"
                    className="bg-[#6a5b5c] hover:bg-[#514344] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    id="home-btn-go"
                  >
                    Go ▷
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (trimmedPath === "create") {
      return <CreatePage onNavigate={navigate} />;
    }

    // Check if path is of type slug/reveal
    const parts = trimmedPath.split("/");
    if (parts.length === 2 && parts[1] === "reveal") {
      return <RevealPage slug={parts[0]} onNavigate={navigate} />;
    }

    // Default: treating it as slug
    if (parts.length === 1) {
      return <ContributorPage slug={parts[0]} onNavigate={navigate} />;
    }

    // fallback
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <h2 className="text-2xl font-bold text-[#a4384c]">404 - Not Found</h2>
        <p className="text-sm text-[#564243] mt-2 mb-6">The page you are looking for does not exist.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#a4384c] text-white px-6 py-2 rounded-full font-bold"
          id="btn-404-home"
        >
          Go Home
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fff8f6] text-[#251916] font-sans flex flex-col">
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-grow flex items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
}

