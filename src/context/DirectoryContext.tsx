import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Business, FilterState, Review, ViewKey } from "../types";
import { BUSINESSES, NEIGHBORHOODS } from "../data/mockData";

const BOOKMARKS_KEY = "yuloan.bookmarks";
const REVIEWS_KEY = "yuloan.reviews";

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface DirectoryContextValue {
  businesses: Business[];
  reviews: Review[];
  view: ViewKey;
  setView: (view: ViewKey) => void;
  selectedId: string | null;
  openBusiness: (id: string) => void;
  closeBusiness: () => void;
  filter: FilterState;
  setFilter: (patch: Partial<FilterState>) => void;
  resetFilters: () => void;
  bookmarkedIds: string[];
  toggleBookmark: (id: string) => void;
  addReview: (businessId: string, review: Omit<Review, "id" | "businessId" | "helpful" | "avatarHue" | "isLocal">, hue: number) => void;
  filtered: Business[];
  getBusiness: (id: string) => Business | undefined;
  isBookmarked: (id: string) => boolean;
  totalOpenNow: number;
}

const DEFAULT_FILTER: FilterState = {
  query: "",
  category: "",
  neighborhood: "",
  minRating: 0,
  maxPrice: 4,
  openNow: false,
  sort: "rating",
};

const DirectoryContext = createContext<DirectoryContextValue | null>(null);

function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

function isOpenAt(hours: Record<number, { open: string; close: string; closed?: boolean }>, now: Date): boolean {
  const day = now.getDay();
  const slot = hours[day];
  if (!slot || slot.closed) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  const open = parseMinutes(slot.open);
  const close = parseMinutes(slot.close);
  if (close === 1439) return true; // 24h
  if (close < open) return mins >= open || mins < close; // overnight
  return mins >= open && mins < close;
}

export function DirectoryProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewKey>("home");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilterState] = useState<FilterState>(DEFAULT_FILTER);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => loadJSON(BOOKMARKS_KEY, []));
  const [userReviews, setUserReviews] = useState<Review[]>(() => loadJSON(REVIEWS_KEY, []));

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(userReviews));
  }, [userReviews]);

  const setFilter = useCallback((patch: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilterState(DEFAULT_FILTER), []);

  const openBusiness = useCallback((id: string) => {
    setSelectedId(id);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const closeBusiness = useCallback(() => {
    setSelectedId(null);
    setView("search");
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  }, []);

  const addReview: DirectoryContextValue["addReview"] = useCallback(
    (businessId, review, hue) => {
      const newReview: Review = {
        ...review,
        id: `ur-${Date.now()}`,
        businessId,
        helpful: 0,
        avatarHue: hue,
        isLocal: true,
      };
      setUserReviews((prev) => [newReview, ...prev]);
    },
    []
  );

  const businesses = useMemo<Business[]>(() => {
    const byId = new Map(BUSINESSES.map((b) => [b.id, b]));
    for (const r of userReviews) {
      const biz = byId.get(r.businessId);
      if (!biz) continue;
      const baseCount = BUSINESSES.find((b) => b.id === biz.id)?.reviewCount ?? 0;
      const merged = [...BUSINESSES.find((b) => b.id === biz.id)!.reviews, ...userReviews.filter((x) => x.businessId === biz.id)];
      const avg = merged.reduce((s, x) => s + x.rating, 0) / Math.max(merged.length, 1);
      biz.reviewCount = baseCount + userReviews.filter((x) => x.businessId === biz.id).length;
      biz.rating = Math.round(avg * 10) / 10;
      biz.reviews = merged;
    }
    return [...byId.values()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userReviews]);

  const filtered = useMemo(() => {
    const q = filter.query.trim().toLowerCase();
    let list = businesses.filter((b) => {
      if (filter.category && b.category !== filter.category) return false;
      if (filter.neighborhood && b.neighborhood !== filter.neighborhood) return false;
      if (b.rating < filter.minRating) return false;
      if (filter.maxPrice < 4 && PRICE_INDEX[b.price] > filter.maxPrice) return false;
      if (filter.openNow && !isOpenAt(b.hours, new Date())) return false;
      if (q) {
        const hay = [b.name, b.tagline, b.description, b.neighborhood, b.area, ...b.subcategory, ...b.keywords]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (filter.sort === "reviews") return b.reviewCount - a.reviewCount;
      if (filter.sort === "distance") return a.distanceFromCenterKm - b.distanceFromCenterKm;
      return b.rating - a.rating;
    });
    return list;
  }, [businesses, filter]);

  const getBusiness = useCallback((id: string) => businesses.find((b) => b.id === id), [businesses]);

  const isBookmarked = useCallback((id: string) => bookmarkedIds.includes(id), [bookmarkedIds]);

  const totalOpenNow = useMemo(
    () => BUSINESSES.filter((b) => isOpenAt(b.hours, new Date())).length,
    []
  );

  const value: DirectoryContextValue = {
    businesses,
    reviews: userReviews,
    view,
    setView,
    selectedId,
    openBusiness,
    closeBusiness,
    filter,
    setFilter,
    resetFilters,
    bookmarkedIds,
    toggleBookmark,
    addReview,
    filtered,
    getBusiness,
    isBookmarked,
    totalOpenNow,
  };

  return <DirectoryContext.Provider value={value}>{children}</DirectoryContext.Provider>;
}

const PRICE_INDEX: Record<string, number> = { $: 1, $$: 2, $$$: 3, $$$$: 4 };

export function useDirectory(): DirectoryContextValue {
  const ctx = useContext(DirectoryContext);
  if (!ctx) throw new Error("useDirectory must be used within DirectoryProvider");
  return ctx;
}

export { NEIGHBORHOODS };