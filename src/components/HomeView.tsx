import {
  ArrowRight,
  Bookmark,
  Coffee,
  Flame,
  MagnifyingGlass,
  MapPin,
  MusicNotes,
  SealCheck,
  ShoppingBag,
  Sparkle,
  Wrench,
} from "@phosphor-icons/react";
import { useState } from "react";
import type { Icon } from "@phosphor-icons/react";
import { CATEGORIES } from "../data/mockData";
import { useDirectory, NEIGHBORHOODS } from "../context/DirectoryContext";
import InteractiveMap, { Stars } from "./Widgets";
import type { Business, Category } from "../types";

const ICONS: Record<string, Icon> = {
  Coffee,
  Flame,
  ShoppingBag,
  Wrench,
  MusicNotes,
};

function Hero() {
  const { setFilter, setView, totalOpenNow, businesses } = useDirectory();
  const [q, setQ] = useState("");
  const popular = ["kitfo", "coffee", "jazz", "spa", "gelato"];

  const go = () => {
    setFilter({ query: q });
    setView("search");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPopular = (p: string) => {
    setFilter({ query: p });
    setView("search");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1600&q=80)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/80 to-slate-950" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#E05833]/40 blur-[100px]" />
      <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#F59E0B]/30 blur-[110px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur">
          <Sparkle size={14} weight="fill" />
          Addis Ababa&apos;s local business buzz · {businesses.length} places listed
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl">
          Discover the best of{" "}
          <span className="bg-gradient-to-r from-[#F59E0B] via-[#E05833] to-[#E05833] bg-clip-text text-transparent">
            Addis Ababa
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-300 sm:text-lg">
          From century-old coffee counters to rooftop jazz nights — search, compare and review the places locals love.
        </p>

        <div className="mt-8 w-full max-w-2xl">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white p-1.5 shadow-2xl shadow-black/40 sm:gap-3">
            <MagnifyingGlass size={20} className="ml-3 shrink-0 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go()}
              placeholder="Search 'kitfo', 'rooftop coffee', 'Sarbet'..."
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-base"
            />
            <button
              onClick={go}
              className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-[#E05833] to-[#F59E0B] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-transform hover:scale-105 active:scale-95 sm:px-7"
            >
              Search
              <MagnifyingGlass size={16} weight="bold" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Trending:</span>
            {popular.map((p) => (
              <button
                key={p}
                onClick={() => goPopular(p)}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-medium text-slate-200 transition-colors hover:border-amber-400/50 hover:text-amber-300"
              >
                {p}
              </button>
            ))}
            <span className="ml-1 flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 font-bold text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {totalOpenNow} open now
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ c }: { c: Category }) {
  const { setFilter, setView, businesses } = useDirectory();
  const count = businesses.filter((b) => b.category === c.id).length;
  const Icon = ICONS[c.id] ?? Coffee;
  return (
    <button
      onClick={() => {
        setFilter({ category: c.id });
        setView("search");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10"
    >
      <span className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 opacity-0 transition-opacity group-hover:opacity-100" />
      <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.hue} text-white shadow-md`}>
        <Icon size={22} weight="fill" />
      </span>
      <span className="mt-4 text-base font-extrabold text-slate-900">{c.name}</span>
      <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{c.description}</span>
      <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-bold text-[#E05833]">
        {count} places
        <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}

function FeaturedCard({ b }: { b: Business }) {
  const { openBusiness, toggleBookmark, isBookmarked } = useDirectory();
  const saved = isBookmarked(b.id);
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10">
      <button onClick={() => openBusiness(b.id)} className="relative block h-44 overflow-hidden" aria-label={b.name}>
        <img
          src={b.photos[0]}
          alt={b.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-900 backdrop-blur">
          ★ {b.rating.toFixed(1)} ({b.reviewCount})
        </span>
        {b.verified && (
          <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/90 backdrop-blur">
            <SealCheck size={16} weight="fill" className="text-[#E05833]" />
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col p-4">
        <button onClick={() => openBusiness(b.id)} className="text-left">
          <h3 className="text-sm font-extrabold text-slate-900 transition-colors group-hover:text-[#E05833]">{b.name}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{b.tagline}</p>
        </button>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-500">
          <span className="text-slate-400">{b.price}</span>
          <span className="text-slate-300">·</span>
          <MapPin size={11} className="text-[#E05833]" />
          {b.neighborhood}
          <span className="text-slate-300">·</span>
          {b.subcategory[0]}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <Stars rating={b.rating} size={12} />
          <button
            onClick={() => toggleBookmark(b.id)}
            className={`grid h-8 w-8 place-items-center rounded-full transition-all ${
              saved ? "bg-[#E05833] text-white shadow-md shadow-orange-500/30" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
            aria-label={saved ? "Remove bookmark" : "Bookmark"}
          >
            <Bookmark size={15} weight={saved ? "fill" : "regular"} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ExploreButton({ label, dark, inverted }: { label: string; dark?: boolean; inverted?: boolean }) {
  const { setView } = useDirectory();
  return (
    <button
      onClick={() => {
        setView("search");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className={`group flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all ${
        inverted
          ? "bg-white text-slate-900 hover:bg-amber-300"
          : dark
            ? "border border-white/20 text-white hover:border-amber-400 hover:text-amber-300"
            : "border border-slate-200 bg-white text-slate-700 hover:border-[#E05833] hover:text-[#E05833]"
      }`}
    >
      {label}
      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function NeighborhoodCard({ id }: { id: string }) {
  const { setFilter, setView, businesses } = useDirectory();
  const n = NEIGHBORHOODS.find((x) => x.id === id);
  if (!n) return null;
  const count = businesses.filter((b) => b.neighborhood === id).length;
  return (
    <button
      onClick={() => {
        setFilter({ neighborhood: id });
        setView("search");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
    >
      <span className="text-lg font-extrabold text-slate-900">{n.name}</span>
      <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{n.area}</span>
      <span className="mt-2 block text-xs leading-relaxed text-slate-500">{n.vibe}</span>
      <span className="mt-3 flex items-center gap-1 text-xs font-bold text-[#E05833]">
        {count} places <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  const Icon = ICONS[icon] ?? Coffee;
  return (
    <div className="flex items-center gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#E05833] to-[#F59E0B] text-white shadow-lg">
        <Icon size={22} weight="fill" />
      </span>
      <div>
        <p className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { businesses } = useDirectory();
  const featured = businesses.filter((b) => b.featured).slice(0, 6);

  return (
    <div>
      <Hero />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Browse by category</h2>
            <p className="mt-1 text-sm text-slate-500">Six neighborhoods, dozens of scenes — start somewhere delicious.</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.id} c={c} />
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#E05833]">
                <Flame size={14} weight="fill" /> Curated for you
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">Featured businesses</h2>
            </div>
            <ExploreButton label="Explore all" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((b) => (
              <FeaturedCard key={b.id} b={b} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-slate-950">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
                <MapPin size={14} weight="fill" /> Explore the map
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Every neighborhood, one map</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                Bole&apos;s nightlife, Piassa&apos;s coffee history, Sarbet&apos;s boutiques, Kazanchis&apos; jazz halls. Tap a
                pin and jump straight into the buzz.
              </p>
              <ExploreButton label="Open the map" dark inverted />
            </div>
            <div className="p-6 sm:p-10">
              <InteractiveMap height="h-[320px]" />
            </div>
          </div>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {NEIGHBORHOODS.map((n) => (
            <NeighborhoodCard key={n.id} id={n.id} />
          ))}
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
          <Stat label="Places listed" value={String(businesses.length)} icon="Coffee" />
          <Stat label="Verified businesses" value={String(businesses.filter((b) => b.verified).length)} icon="Wrench" />
          <Stat label="Average rating" value="4.5★" icon="Wrench" />
        </div>
      </section>
    </div>
  );
}