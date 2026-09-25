import { Bookmark, MagnifyingGlass, MapPin, SquaresFour, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useDirectory, NEIGHBORHOODS } from "../context/DirectoryContext";
import type { ViewKey } from "../types";

const TABS: { key: ViewKey; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "search", label: "Explore" },
  { key: "bookmarks", label: "Bookmarks" },
];

export default function Navbar() {
  const { view, setView, bookmarkedIds, setFilter, totalOpenNow } = useDirectory();
  const [scrolled, setScrolled] = useState(false);
  const [queryDraft, setQueryDraft] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (v: ViewKey) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const runSearch = (q: string) => {
    setFilter({ query: q });
    go("search");
    setSearchOpen(false);
    setQueryDraft("");
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b bg-white/85 backdrop-blur-md transition-all ${
          scrolled ? "border-slate-200/80 shadow-sm" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button onClick={() => go("home")} className="group flex items-center gap-2" aria-label="Yuloan Buzz home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#E05833] to-[#F59E0B] text-white shadow-sm transition-transform group-hover:scale-105">
              <SquaresFour size={18} weight="fill" />
            </span>
            <span className="hidden sm:block">
              <span className="block text-left text-[15px] font-extrabold leading-none tracking-tight text-slate-900">
                Yuloan<span className="text-[#E05833]">Buzz</span>
              </span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Addis Ababa
              </span>
            </span>
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            className="ml-2 hidden flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-left text-sm text-slate-400 transition-colors hover:border-slate-300 hover:bg-white md:flex md:max-w-md"
          >
            <MagnifyingGlass size={16} />
            <span className="truncate">Search businesses, cuisines, services...</span>
          </button>

          <nav className="ml-auto flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => go(t.key)}
                className={`relative rounded-full px-3 py-2 text-sm font-semibold transition-colors sm:px-4 ${
                  view === t.key ? "text-[#E05833]" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
                {t.key === "bookmarks" && bookmarkedIds.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#E05833] px-1 text-[10px] font-bold text-white">
                    {bookmarkedIds.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <button
            onClick={() => setSearchOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:text-[#E05833] md:hidden"
            aria-label="Search"
          >
            <MagnifyingGlass size={17} />
          </button>
        </div>
        <div className="border-t border-slate-100 px-4 py-1.5 md:hidden">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium text-slate-500 [scrollbar-width:none]">
            <MapPin size={13} className="shrink-0 text-[#E05833]" />
            {NEIGHBORHOODS.slice(0, 5).map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  setFilter({ neighborhood: n.id });
                  go("search");
                }}
                className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-slate-600 transition-colors hover:bg-[#E05833]/10 hover:text-[#E05833]"
              >
                {n.name}
              </button>
            ))}
            <span className="ml-auto shrink-0 text-[11px] font-bold text-emerald-600">● {totalOpenNow} open now</span>
          </div>
        </div>
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} draft={queryDraft} onDraft={setQueryDraft} onSubmit={runSearch} />}
    </>
  );
}

function SearchOverlay({
  onClose,
  draft,
  onDraft,
  onSubmit,
}: {
  onClose: () => void;
  draft: string;
  onDraft: (v: string) => void;
  onSubmit: (q: string) => void;
}) {
  const { businesses, filtered } = useDirectory();
  const q = draft.trim().toLowerCase();
  const suggestions = q
    ? businesses
        .filter((b) =>
          [b.name, b.tagline, b.neighborhood, ...b.subcategory, ...b.keywords].join(" ").toLowerCase().includes(q)
        )
        .slice(0, 5)
    : filtered.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 px-4 pt-20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <MagnifyingGlass size={20} className="text-[#E05833]" />
          <input
            autoFocus
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit(draft)}
            placeholder="Try 'kitfo', 'jazz', 'Sarbet'..."
            className="flex-1 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close search">
            <X size={18} />
          </button>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {suggestions.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-slate-400">No matches yet. Press Enter to search everything.</li>
          )}
          {suggestions.map((b) => (
            <li key={b.id}>
              <button
                onClick={() => {
                  onSubmit(b.name);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-orange-50"
              >
                <img src={b.photos[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">{b.name}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {b.neighborhood} · ★ {b.rating.toFixed(1)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}