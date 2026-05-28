"use client";

import { CATEGORIES, Category } from "@/lib/types";

interface CategoryFilterProps {
  selected: Category | "all";
  onChange: (category: Category | "all") => void;
}

export default function CategoryFilter({
  selected,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selected === "all"
            ? "bg-stone-900 text-white shadow-sm"
            : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:bg-stone-50"
        }`}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selected === cat.value
              ? "bg-stone-900 text-white shadow-sm"
              : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:bg-stone-50"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
