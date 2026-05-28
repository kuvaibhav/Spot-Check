"use client";

import { useState, useMemo } from "react";
import { Review, Category } from "@/lib/types";
import { filterReviews } from "@/lib/reviews";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import { SlidersHorizontal } from "lucide-react";

interface HomeClientProps {
  reviews: Review[];
}

export default function HomeClient({ reviews }: HomeClientProps) {
  const [category, setCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "rating" | "name">("date");

  const filtered = useMemo(
    () => filterReviews(reviews, { category, search, sortBy, sortOrder: "desc" }),
    [reviews, category, search, sortBy]
  );

  const stats = useMemo(() => {
    const total = reviews.length;
    const avgRating =
      total > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
        : "0";
    const wouldReturn = reviews.filter((r) => r.wouldReturn).length;
    return { total, avgRating, wouldReturn };
  }, [reviews]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-stone-100 to-stone-50 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            Honest reviews.
            <br />
            <span className="text-brand-500">No hype.</span>
          </h1>
          <p className="mt-4 text-stone-500 text-lg max-w-xl">
            My personal review journal — genuine, unfiltered takes on the food I
            eat and the places I visit. If I&apos;ve been there, it gets a SpotCheck.
          </p>

          {/* Stats */}
          <div className="mt-8 flex gap-8">
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.total}</p>
              <p className="text-xs text-stone-400 uppercase tracking-wide">Reviews</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.avgRating}</p>
              <p className="text-xs text-stone-400 uppercase tracking-wide">Avg Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.wouldReturn}</p>
              <p className="text-xs text-stone-400 uppercase tracking-wide">Would Return</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="w-full sm:w-72">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "rating" | "name")}
              className="text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="date">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="name">A — Z</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <CategoryFilter selected={category} onChange={setCategory} />
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 w-full flex-1">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-400 text-lg">No reviews found.</p>
            <p className="text-stone-300 text-sm mt-1">
              Try adjusting your search or category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
