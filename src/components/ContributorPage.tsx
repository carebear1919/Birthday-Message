import React, { useState, useEffect, useRef } from "react";
import { Camera, Send, FileImage, Check, Trash2, ShieldAlert } from "lucide-react";
import { BirthdayPage, ApiResponse } from "../types";

interface ContributorPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export default function ContributorPage({ slug, onNavigate }: ContributorPageProps) {
  const [pageData, setPageData] = useState<BirthdayPage | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Form State
  const [senderName, setSenderName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Status State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch page info on mount
  useEffect(() => {
    async function fetchPage() {
      try {
        setLoadingPage(true);
        const res = await fetch(`/api/birthday-pages/${slug}`);
        const resJson: ApiResponse<BirthdayPage> = await res.json();
        
        if (!res.ok || !resJson.success) {
          setNotFound(true);
        } else if (resJson.data) {
          setPageData(resJson.data);
        }
      } catch (err) {
        console.error("Error fetching page details", err);
        setNotFound(true);
      } finally {
        setLoadingPage(false);
      }
    }
    fetchPage();
  }, [slug]);

  // Handle image changes
  const handlePhotoChange = (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setSubmitError("Only image files (jpeg, png, webp, gif) are permitted.");
      return;
    }
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Photo size must be less than 5MB.");
      return;
    }

    setSubmitError(null);
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !messageText || !pageData) {
      setSubmitError("Name and Message fields are required.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("page_id", pageData.id);
      formData.append("sender_name", senderName);
      formData.append("message_text", messageText);
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const res = await fetch("/api/messages", {
        method: "POST",
        body: formData,
      });

      const resJson: ApiResponse<any> = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to submit message");
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || "Could not save message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#a4384c] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#6e5f60] font-sans font-medium text-sm">Opening journal...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 animate-fadeIn">
        <div className="w-20 h-20 bg-[#ffdad6] rounded-full flex items-center justify-center mx-auto text-[#ba1a1a] shadow-inner mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-sans font-bold text-[#a4384c]">Page Not Found</h2>
        <p className="text-[#564243] mt-3 mb-8 text-sm">
          This birthday scrapbook page doesn't exist. Please check the URL link or contact the host.
        </p>
        <button
          onClick={() => onNavigate("/create")}
          className="bg-[#a4384c] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow hover:bg-[#852036] transition-colors"
          id="btn-return-create"
        >
          Create a New Scrapbook
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[720px] mx-auto px-4 py-8 md:py-12 animate-fadeIn">
      {/* Floating Doodles */}
      <div className="fixed top-24 left-10 opacity-20 pointer-events-none select-none hidden lg:block text-5xl">
        🌸
      </div>
      <div className="fixed bottom-24 right-10 opacity-20 pointer-events-none select-none hidden lg:block text-5xl">
        🎂
      </div>

      <section className="bg-[#ffffff] rounded-2xl shadow-xl relative p-6 md:p-12 dot-grid border border-[#dcc0c1]/40 overflow-hidden">
        {/* Left binding rule line */}
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-[2px] bg-[#a4384c]/15 border-l border-[#a4384c]/10 border-r border-[#a4384c]/10 pointer-events-none" />

        {/* Decorative Washi Tapes */}
        <div className="absolute -top-2 -right-4 w-28 h-7 washi-tape-primary rotate-12 z-10"></div>
        <div className="absolute -bottom-1 left-16 w-24 h-6 washi-tape-secondary rotate-3 z-10"></div>

        {!submitSuccess ? (
          <>
            {/* Header Section */}
            <div className="text-center mb-10 relative pl-6 md:pl-10">
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-5 text-9xl select-none">
                ❤️
              </span>
              <h1 className="font-sans text-3xl md:text-4xl font-bold text-[#a4384c] relative z-10 leading-tight">
                Leave a birthday message for {pageData?.celebrant_name}! 🎂
              </h1>
              <p className="font-caveat text-xl text-[#564243] mt-3 italic">
                "Your words will be cherished in their virtual scrapbook forever."
              </p>
            </div>

            {submitError && (
              <div className="bg-[#ffdad6] text-[#400011] rounded-xl px-4 py-3 border border-[#ba1a1a]/20 mb-6 text-sm">
                ⚠️ {submitError}
              </div>
            )}

            {/* The Contribution Form */}
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10 pl-6 md:pl-10">
              {/* Sender Name Field */}
              <div className="relative group">
                <div className="absolute -top-3.5 -left-2 bg-[#e9e2d3] text-[#1e1b12] px-3 py-1 text-xs font-bold rounded shadow-sm -rotate-2 z-10">
                  Your Name
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best Friend Ever"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-[#fff0ee]/20 border-2 border-[#dcc0c1] rounded-xl p-4 pt-6 text-[#251916] placeholder-[#564243]/40 focus:border-[#a4384c] focus:outline-none focus:ring-0 transition-colors"
                  id="input-sender-name"
                />
              </div>

              {/* Message Textarea */}
              <div className="relative">
                <div className="absolute -top-4 right-4 bg-[#e66a7d] text-white px-4 py-1 text-xs font-bold rounded-full shadow-sm rotate-3 z-10">
                  Wishes & Thoughts
                </div>
                <textarea
                  required
                  rows={6}
                  placeholder="Write something heartwarming, funny, or sweet..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-[#fff0ee]/20 border-2 border-[#dcc0c1] rounded-xl p-5 pt-6 font-caveat text-xl text-[#251916] placeholder-[#564243]/50 focus:border-[#a4384c] focus:outline-none focus:ring-0 resize-none transition-colors"
                  id="input-message-text"
                />
              </div>

              {/* Photo Upload Polaroid box */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer transition-transform duration-300 hover:rotate-1"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && handlePhotoChange(e.target.files[0])}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                    id="file-photo-upload"
                  />

                  {/* Polaroid Frame */}
                  <div className="bg-white p-4 pb-12 shadow-xl border border-[#dcc0c1]/50 flex flex-col items-center transition-all group-hover:shadow-2xl">
                    {photoPreview ? (
                      <div className="w-60 h-60 bg-[#fff8f6] overflow-hidden relative border border-[#dcc0c1]/40">
                        <img
                          src={photoPreview}
                          alt="Uploaded memory preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute bottom-2 right-2 bg-red-600 text-white p-2 rounded-full shadow hover:bg-red-700 transition-colors"
                          title="Remove Photo"
                          id="btn-remove-photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-60 h-60 bg-[#fff0ee]/40 border-2 border-dashed border-[#ffb2ba] flex flex-col items-center justify-center gap-3 group-hover:bg-[#e66a7d]/5 transition-colors p-4">
                        <Camera className="w-10 h-10 text-[#a4384c]/50 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-[#6a5b5c] text-center">
                          Tap or Drag to pin a photo
                        </span>
                        <span className="text-[10px] text-gray-400">
                          (Optional, max 5MB)
                        </span>
                      </div>
                    )}
                    <div className="mt-6 mb-2">
                      <div className="w-24 h-1.5 bg-[#f5ddd9] rounded-full opacity-60"></div>
                    </div>
                  </div>

                  {/* Tape decoration over polaroid */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#cbd5e1]/50 backdrop-blur-[1px] shadow-sm z-20 rotate-[-1deg]"></div>
                </div>
              </div>

              {/* Action and Stamp Section */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-6">
                {/* Stamp */}
                <div className="flex items-center gap-3 opacity-60">
                  <div className="w-14 h-14 border-2 border-dashed border-[#a4384c]/40 rounded-full flex items-center justify-center rotate-[-12deg]">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <span className="text-xs font-bold text-[#6e5f60] italic font-sans">
                    Priority Birthday Stamp
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative px-8 py-3.5 bg-[#a4384c] text-white rounded-xl font-bold hover:bg-[#852036] disabled:bg-[#6a5b5c]/60 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  id="submit-contribution"
                >
                  <span>{submitting ? "Tucking Away..." : "Add Memory"}</span>
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Confirmation State */
          <div className="text-center py-10 animate-scaleUp pl-6 md:pl-10">
            <span className="text-7xl animate-pulse inline-block">💌</span>
            <h2 className="text-3xl font-sans font-bold text-[#a4384c] mt-6">
              Your message has been tucked away!
            </h2>
            <p className="font-caveat text-2xl text-[#564243] mt-3">
              It will remain a sweet secret until {pageData?.celebrant_name} unlocks the scrapbook on their birthday.
            </p>

            <div className="mt-8 flex justify-center">
              <div className="bg-[#ffd9dc]/30 p-2 px-5 rounded-lg text-[#852036] font-caveat text-lg shadow-sm rotate-3">
                ★ Handmade with love ★
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSenderName("");
                  setMessageText("");
                  setPhotoFile(null);
                  setPhotoPreview(null);
                  setSubmitSuccess(false);
                }}
                className="px-6 py-2.5 border-2 border-[#a4384c] text-[#a4384c] rounded-full font-bold text-sm hover:bg-[#ffd9dc]/20 transition-all"
                id="btn-add-another"
              >
                Add Another message
              </button>
              <button
                onClick={() => onNavigate("/create")}
                className="px-6 py-2.5 bg-[#a4384c] text-white rounded-full font-bold text-sm hover:bg-[#852036] transition-all"
                id="btn-go-create"
              >
                Create Your Own Wall
              </button>
            </div>
          </div>
        )}

        {/* Hand-drawn stickers watercolor simulation */}
        <div className="absolute -left-12 bottom-12 opacity-80 select-none pointer-events-none hidden md:block">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYALaQCyOIhkwvw0Oy0RrTPVmsMaLmlgRvbJNG5ZbKCOeJjOyIKLlqtVrwZBauCtTRpPMfDhO8Ksc0_1ychBIGLiAs66buJLV2hr2whq97XvYOwmDPFaznuDKLYycjbKKytGTDifjtC1O0Omk9OE_WbJBZLJE0ciezwnC7d47uKh1zfJhMrnzG895O3wVSUKRnqX_6X7VDsPVcvLsd2oHD4nSdeYuEIVMnH01SbIxWf-FVRKf49a6-EuM-FswcpPvueiSjjRLNOKIL"
            className="w-24 h-auto drop-shadow-sm"
            alt="Flower decoration"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -right-8 top-12 opacity-80 select-none pointer-events-none hidden md:block">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMRYOMNjro_yE6NRlY9kcXvxAzA4jAClI6ztGm7LeyG9ex5B2X4AclpxErRIAFESnZu6_OT_exwMNd2tw7sB5IlaCTnrEDwXpRytaLFpKUAFJSmqmlyUbv8d0NkAxCKGLOTV-QqEONLjVnKLF96e5vkNujNX1BMIgRX-lhECNrN53aSYIhrdyOHilKj8vbzQ1PBj6zaFHJQfjy1TLKTvgEpYFQL1Ri7Uxm8-gI64fhtNt0T8ooqWeyvM1ahxKiHcBhxNZtupUFudPW"
            className="w-16 h-16 drop-shadow-sm rotate-12 animate-pulse"
            alt="Star sticker decoration"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Footer message */}
      <div className="mt-8 text-center text-[#6e5f60] font-sans text-xs">
        <p className="uppercase tracking-widest text-[10px]">© 2026 Scrapbooker • Keep memories warm</p>
      </div>
    </div>
  );
}
