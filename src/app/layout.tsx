import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpotCheck — Kumar's Review Journal",
  description:
    "Honest, unfiltered reviews of food and places. No influencer hype — just real takes from firsthand experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 min-h-screen">{children}</body>
    </html>
  );
}
