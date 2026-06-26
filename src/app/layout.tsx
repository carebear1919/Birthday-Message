import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HushBook — Secret Birthday Scrapbooks",
  description: "Handcrafted digital scrapbooks for birthday memories — leave hidden messages and flip through them like a real journal.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#fff8f6] text-[#251916] font-sans">
        {children}
      </body>
    </html>
  );
}
