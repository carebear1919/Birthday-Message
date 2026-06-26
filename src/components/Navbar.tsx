import React from "react";
import { Sparkles, Heart, HelpCircle, PlusCircle } from "lucide-react";

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function Navbar({ currentPath, onNavigate }: NavbarProps) {
  return (
    <header className="w-full bg-[#fff8f6]/85 backdrop-blur-md sticky top-0 z-50 border-b border-[#dcc0c1]/40 shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate("/create")}
          className="flex items-center gap-2 group cursor-pointer"
          id="nav-logo"
        >
          <Sparkles className="w-6 h-6 text-[#a4384c] group-hover:rotate-12 transition-transform" />
          <span className="font-sans font-bold text-xl italic text-[#a4384c] tracking-tight">
            Scrapbooker
          </span>
        </button>

        {/* Minimal Navigation items */}
        <div className="flex items-center gap-3 md:gap-6">
          {currentPath !== "/create" && (
            <button
              onClick={() => onNavigate("/create")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-[#a4384c] hover:bg-[#a4384c]/10 transition-colors"
              id="nav-btn-create"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Scrapbook</span>
            </button>
          )}

          <a
            href="https://ai.studio/build"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#564243] opacity-70 hover:opacity-100 transition-opacity"
          >
            AI Studio Build
          </a>
        </div>
      </div>
    </header>
  );
}
