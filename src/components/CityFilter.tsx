"use client";

import { MapPin } from "lucide-react";

interface CityFilterProps {
  cities: { city: string; count: number }[];
  selected: string;
  onChange: (city: string) => void;
}

export default function CityFilter({ cities, selected, onChange }: CityFilterProps) {
  const total = cities.reduce((s, c) => s + c.count, 0);
  const usCaCities = cities.filter((c) => c.city !== "Global");
  const global = cities.find((c) => c.city === "Global");

  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 min-w-[160px]"
      >
        <option value="all">All cities ({total})</option>
        {usCaCities.map(({ city, count }) => (
          <option key={city} value={city}>
            {city} ({count})
          </option>
        ))}
        {global && (
          <option value="Global">Global ({global.count})</option>
        )}
      </select>
    </div>
  );
}
