import { ArrowRight, ArrowUpRight, Bookmark, Check, Clock, MagnifyingGlass, MapPin, SealCheck, SlidersHorizontal, X } from "@phosphor-icons/react";
import { useState } from "react";
import { CATEGORIES } from "../data/mockData";
import { useDirectory, NEIGHBORHOODS } from "../context/DirectoryContext";
import InteractiveMap from "./Widgets";
import type { Business } from "../types";

function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
        active ? "bg-[#E05833] text-white shadow-md shadow-orange-500/25" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {active && <Check size={14} weight="bold" />}
      {label}
    </button>
  );
}

function Filters() {
  const { filter, setFilter, resetFilters, businesses } = useDirectory();
  const activeCount =
    (filter.category ? 1 : 0) +
    (filter.neighborhood ? 1 : 0) +
    (filter.minRating > 0 ? 1 : 0) +
    (filter.maxPrice < 4 ? 1 : 0) +
    (filter.openNow ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-slate-900">
          <SlidersHorizontal size={16} /> Filters
        </h3>
        {activeCount > 0 && (
          <button onClick={resetFilters} className="text-xs font-bold text-[#E05833] hover:underline">
            Reset all ({activeCount})
          </button>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Category</p>
        <div className="flex flex-col gap-1">
          <Pill active={filter.category === ""} onClick={() => setFilter({ category: "" })} label="All categories" />
          {CATEGORIES.map((c) => (
            <Pill
              key={c.id}
              active={filter.category === c.id}
              onClick={() => setFilter({ category: c.id })}
              label={`${c.name} (${businesses.filter((b) => b.category === c.id).length})`}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Neighborhood</p>
        <div className="flex flex-col gap-1">
          <Pill active={filter.neighborhood === ""} onClick={() => setFilter({ neighborhood: "" })} label="All areas" />
          {NEIGHBORHOODS.map((n) => (
            <Pill
              key={n.id}
              active={filter.neighborhood === n.id}
              onClick={() => setFilter({ neighborhood: n.id })}
              label={n.name}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Minimum rating</p>
          <span className="text-xs font-bold text-amber-500">{filter.minRating > 0 ? `${filter.minRating}+ ★` : "Any"}</span>
        </div>
        <div className="flex gap-1.5">
          {[0, 3, 3.5, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setFilter({ minRating: r })}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-bold transition-colors ${
                filter.minRating === r
                  ? "border-[#E05833] bg-[#E05833]/10 text-[#E05833]"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {r === 0 ? "Any" : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Price</p>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((p) => (
            <button
              key={p}
              onClick={() => setFilter({ maxPrice: filter.maxPrice === p ? 4 : p })}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-bold transition-colors ${
                filter.maxPrice === p
                  ? "border-[#E05833] bg-[#E05833]/10 text-[#E05833]"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {"$".repeat(p)}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setFilter({ openNow: !filter.openNow })}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
          filter.openNow ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:border-orange-200"
        }`}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Clock size={15} className="text-emerald-500" /> Open now
        </span>
        <span className={`relative h-6 w-11 rounded-full transition-colors ${filter.openNow ? "bg-emerald-500" : "bg-slate-200"}`}>
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${filter.openNow ? "left-[22px]" : "left-0.5"}`}
          />
        </span>
      </button>
    </div>
  );
}

function ResultCard({ b }: { b: Business }) {
  const { openBusiness, toggleBookmark, isBookmarked } = useDirectory();
  const saved = isBookmarked(b.id);
  return (
    <div className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg">
      <button onClick={() => openBusiness(b.id)} className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28" aria-label={b.name}>
        <img
          src={b.photos[0]}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {b.verified && (
          <span className="absolute bottom-1.5 right-1.5 grid h-5 w-5 place-items-center rounded-full bg-white/95 shadow">
            <SealCheck size={12} weight="fill" className="text-[#E05833]" />
          </span>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <button onClick={() => openBusiness(b.id)} className="text-left">
            <h3 className="text-[15px] font-extrabold leading-tight text-slate-900 transition-colors group-hover:text-[#E05833]">
              {b.name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-slate-500">{b.tagline}</p>
          </button>
          <button
            onClick={() => toggleBookmark(b.id)}
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all ${
              saved ? "bg-[#E05833] text-white shadow-md shadow-orange-500/30" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
            aria-label={saved ? "Remove bookmark" : "Bookmark"}
          >
            <Bookmark size={14} weight={saved ? "fill" : "regular"} />
          </button>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-500">
          <span className="font-bold text-amber-500">★ {b.rating.toFixed(1)}</span>
          <span className="text-slate-400">({b.reviewCount})</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400">{b.price}</span>
          <span className="text-slate-300">·</span>
          <MapPin size={11} className="text-[#E05833]" />
          {b.neighborhood}
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{b.description}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {b.subcategory.slice(0, 2).map((s) => (
            <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SearchPage() {
  const { filtered, filter, setFilter, resetFilters } = useDirectory();
  const [showFilters, setShowFilters] = useState(true);
  const cat = CATEGORIES.find((c) => c.id === filter.category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#E05833]">
            {cat ? cat.name : "All categories"}{" "}
            {filter.neighborhood && `· ${NEIGHBORHOODS.find((n) => n.id === filter.neighborhood)?.name}`}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {filter.query ? `Results for "${filter.query}"` : "Explore Addis Ababa"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? "place" : "places"} found
            {filter.openNow && " · open now"}
            {filter.minRating > 0 && ` · ${filter.minRating}+ stars`}
            {filter.maxPrice < 4 && ` · up to ${"$".repeat(filter.maxPrice)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
            {(["rating", "reviews", "distance"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter({ sort: s })}
                className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                  filter.sort === s ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {s === "distance" ? "Nearest" : s}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-colors lg:hidden ${
              showFilters ? "border-[#E05833] bg-[#E05833] text-white" : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm [scrollbar-width:thin]">
            <Filters />
          </div>
        </aside>

        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
                  <MagnifyingGlass size={26} />
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">No matches found</h3>
                <p className="max-w-sm text-sm text-slate-500">
                  Try a different keyword or clear the filters to see everything Addis has to offer.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-2 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-700"
                >
                  <ArrowRight size={14} className="rotate-180" /> Reset everything
                </button>
              </div>
            )}
            {filtered.map((b) => (
              <ResultCard key={b.id} b={b} />
            ))}
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24">
              <InteractiveMap height="h-[520px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Bookmarks ---------------- */

function RemoveBookmark({ id }: { id: string }) {
  const { toggleBookmark } = useDirectory();
  return (
    <button
      onClick={() => toggleBookmark(id)}
      className="flex items-center gap-1 rounded-full border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
    >
      <X size={12} weight="bold" /> Remove
    </button>
  );
}

function BookmarkRow({ b }: { b: Business }) {
  const { openBusiness } = useDirectory();
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-orange-200 hover:shadow-lg">
      <button onClick={() => openBusiness(b.id)} className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24" aria-label={b.name}>
        <img src={b.photos[0]} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </button>
      <button onClick={() => openBusiness(b.id)} className="min-w-0 flex-1 text-left">
        <h3 className="truncate text-[15px] font-extrabold text-slate-900 group-hover:text-[#E05833]">{b.name}</h3>
        <p className="mt-0.5 truncate text-xs text-slate-500">{b.tagline}</p>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          <span className="font-bold text-amber-500">★ {b.rating.toFixed(1)}</span>
          <span className="text-slate-400">({b.reviewCount})</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400">{b.price}</span>
          <span className="text-slate-300">·</span>
          <MapPin size={11} className="text-[#E05833]" />
          {b.neighborhood}
        </div>
      </button>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          onClick={() => openBusiness(b.id)}
          className="flex items-center gap-1 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700 sm:flex-row-reverse"
        >
          View <ArrowUpRight size={13} />
        </button>
        <RemoveBookmark id={b.id} />
      </div>
    </div>
  );
}

export function BookmarksPage() {
  const { bookmarkedIds, businesses, setFilter, setView } = useDirectory();
  const saved = businesses.filter((b) => bookmarkedIds.includes(b.id));

  if (saved.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#E05833] to-[#F59E0B] text-white shadow-xl shadow-orange-500/25">
          <Bookmark size={36} weight="fill" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Your saved list is empty</h1>
        <p className="max-w-sm text-sm text-slate-500">
          Tap the bookmark icon on any business to build your personal Addis shortlist — great for planning a weekend out.
        </p>
        <button
          onClick={() => {
            setFilter({});
            setView("search");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="mt-2 flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-700"
        >
          <MagnifyingGlass size={16} /> Start exploring
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Your bookmarks</h1>
      <p className="mt-1 text-sm text-slate-500">
        {saved.length} saved {saved.length === 1 ? "place" : "places"} · ready when you are
      </p>
      <div className="mt-6 grid gap-4">
        {saved.map((b) => (
          <BookmarkRow key={b.id} b={b} />
        ))}
      </div>
    </div>
  );
}