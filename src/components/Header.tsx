"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Menu, X } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <MapPin className="w-6 h-6 text-brand-500 group-hover:text-brand-600 transition-colors" />
            <span className="font-display text-xl font-bold tracking-tight">
              SpotCheck
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Reviews
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              About
            </Link>
            <Link
              href="/admin"
              className="text-sm font-medium bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Admin
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-stone-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 py-2"
              onClick={() => setMenuOpen(false)}
            >
              Reviews
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 py-2"
              onClick={() => setMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 py-2"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/admin"
              className="text-sm font-medium bg-brand-500 text-white px-4 py-2 rounded-lg text-center"
              onClick={() => setMenuOpen(false)}
            >
              Admin
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
