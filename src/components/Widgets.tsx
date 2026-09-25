import { Clock, HandHeart, MapPin, PaperPlaneTilt, Star, X } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { CATEGORIES, REVIEW_TAGS } from "../data/mockData";
import { useDirectory } from "../context/DirectoryContext";
import type { Business } from "../types";

/* ---------------- Shared UI ---------------- */

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const [whole, frac] = [Math.floor(rating), rating - Math.floor(rating)];
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          weight={n <= whole || (n === whole + 1 && frac >= 0.4) ? "fill" : "regular"}
          className={n <= whole || (n === whole + 1 && frac >= 0.4) ? "text-amber-400" : "text-slate-200"}
        />
      ))}
    </span>
  );
}

export function Avatar({ name, hue, size = 36 }: { name: string; hue: number; size?: number }) {
  const initials = name
    .replace(/[^a-zA-Z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const colors = ["bg-[#E05833]", "bg-[#F59E0B]", "bg-slate-800", "bg-slate-400"];
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${colors[Math.abs(hue) % 4]}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.34) }}
    >
      {initials || "?"}
    </span>
  );
}

/* ---------------- Interactive Map ---------------- */

const CAT_ICON_COLOR: Record<string, string> = {
  food: "#E05833",
  coffee: "#B45309",
  retail: "#DB2777",
  services: "#4F46E5",
  nightlife: "#7C3AED",
  hotels: "#0D9488",
};

const LAT_MIN = 8.968;
const LAT_MAX = 9.035;
const LNG_MIN = 38.734;
const LNG_MAX = 38.803;

function project(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100,
    y: ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 120,
  };
}

function slotOpen(slot: Business["hours"][number] | undefined): { open: boolean; label: string } {
  const now = new Date();
  const day = now.getDay();
  const s = slot ?? { open: "09:00", close: "17:00", closed: true };
  if (s.closed) return { open: false, label: "Closed today" };
  const toMins = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  };
  const mins = now.getHours() * 60 + now.getMinutes();
  const openM = toMins(s.open);
  const closeM = toMins(s.close);
  if (closeM === 1439) return { open: true, label: "Open 24 hours" };
  const open = closeM < openM ? mins >= openM || mins < closeM : mins >= openM && mins < closeM;
  return { open, label: open ? `Open · closes ${s.close}` : `Closed · opens ${s.open}` };
}

export default function InteractiveMap({ business, height = "h-[420px]" }: { business?: Business | null; height?: string }) {
  const { businesses, openBusiness, filtered } = useDirectory();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const pins = useMemo(() => (business ? [business] : filtered.length ? filtered : businesses), [business, businesses, filtered]);

  const active = business ?? (activeId ? businesses.find((b) => b.id === activeId) : null);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 ${height}`}>
      <svg viewBox="0 0 100 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="mapBase" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
        </defs>
        <rect width="100" height="120" fill="url(#mapBase)" />
        <g fill="none" stroke="#CBD5E1" strokeWidth="0.5" opacity="0.9">
          <ellipse cx="50" cy="58" rx="40" ry="24" />
          <ellipse cx="50" cy="58" rx="29" ry="15" />
          <ellipse cx="50" cy="58" rx="16" ry="7" stroke="#94A3B8" />
        </g>
        <g stroke="#E2E8F0" strokeWidth="0.4">
          <line x1="0" y1="30" x2="100" y2="30" />
          <line x1="0" y1="88" x2="100" y2="88" />
          <line x1="30" y1="0" x2="30" y2="120" />
          <line x1="74" y1="0" x2="74" y2="120" />
        </g>
        {CATEGORIES.map((c, i) => (
          <text key={c.id} x={i % 3 === 0 ? 8 : i % 3 === 1 ? 46 : 78} y={i < 3 ? 96 : 110} fontSize="2.6" fill="#94A3B8" opacity="0.7">
            {c.name.split(" ")[0]}
          </text>
        ))}
      </svg>

      {pins.map((b) => {
        const p = project(b.coords.lat, b.coords.lng);
        const isActive = active?.id === b.id;
        const isHover = hoverId === b.id;
        return (
          <button
            key={b.id}
            onClick={() => openBusiness(b.id)}
            onMouseEnter={() => setHoverId(b.id)}
            onMouseLeave={() => setHoverId(null)}
            className="absolute z-10"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: `translate(-50%, -100%) scale(${isActive || isHover ? 1.25 : 1})`,
            }}
            aria-label={b.name}
          >
            <span className="relative block">
              <span
                className="grid place-items-center rounded-full border-2 border-white text-white shadow-lg"
                style={{
                  width: isActive ? 34 : 28,
                  height: isActive ? 34 : 28,
                  background: CAT_ICON_COLOR[b.category] ?? "#E05833",
                }}
              >
                <MapPin size={isActive ? 18 : 14} weight="fill" />
              </span>
              <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-white bg-white shadow" />
              {isActive && (
                <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[115%] rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-white">
                  {b.name}
                </span>
              )}
            </span>
          </button>
        );
      })}

      <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
        <MapPin size={13} className="text-[#E05833]" />
        Addis Ababa · {pins.length} {pins.length === 1 ? "place" : "places"}
        {business && (
          <button onClick={() => setActiveId(null)} className="text-slate-400 hover:text-slate-700" aria-label="Clear selection">
            <X size={13} />
          </button>
        )}
      </div>

      {active && active.id !== business?.id && (
        <div className="absolute bottom-3 left-3 right-3 z-20 sm:left-3 sm:right-auto sm:w-72">
          <button
            onClick={() => openBusiness(active.id)}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-xl transition-transform hover:scale-[1.02]"
          >
            <img src={active.photos[0]} alt="" className="h-14 w-14 rounded-xl object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-slate-900">{active.name}</span>
              <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <span className="font-bold text-amber-500">★ {active.rating.toFixed(1)}</span>
                <span>· {active.price}</span>
                <span className="truncate">· {active.neighborhood}</span>
              </span>
              <span
                className={`mt-1 flex items-center gap-1 text-[11px] font-semibold ${
                  slotOpen(active.hours[new Date().getDay()]).open ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                <Clock size={11} weight="fill" />
                {slotOpen(active.hours[new Date().getDay()]).label}
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Review Modal ---------------- */

const LABELS = ["", "Hated it", "Meh", "Good", "Very good", "Loved it!"];

export interface ReviewDraft {
  name: string;
  rating: number;
  text: string;
  tags: string[];
}

export function ReviewModal({ business, onClose }: { business: Business; onClose: () => void }) {
  const { addReview, reviews } = useDirectory();
  const [draft, setDraft] = useState<ReviewDraft>({ name: "", rating: 0, text: "", tags: [] });
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const existing = reviews.filter((r) => r.businessId === business.id);
  const canSubmit = draft.rating > 0 && draft.name.trim().length > 1 && draft.text.trim().length > 8;

  const toggleTag = (tag: string) => {
    setDraft((d) => ({ ...d, tags: d.tags.includes(tag) ? d.tags.filter((t) => t !== tag) : [...d.tags, tag] }));
  };

  const submit = () => {
    if (!canSubmit) return;
    addReview(
      business.id,
      {
        author: draft.name.trim(),
        rating: draft.rating,
        date: new Date().toISOString().slice(0, 10),
        text: draft.text.trim(),
        tags: draft.tags,
      },
      2
    );
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <img src={business.photos[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{business.name}</p>
            <p className="text-xs text-slate-500">Share your buzz with the community</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close review modal">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#E05833] to-[#F59E0B] text-white shadow-lg">
              <HandHeart size={40} weight="fill" />
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">Medan! Review published 🎉</h3>
            <p className="max-w-sm text-sm text-slate-500">
              Your {draft.rating}-star review is live. The community rating for {business.name} has already been recalculated.
            </p>
            <button
              onClick={onClose}
              className="mt-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-700"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setDraft((d) => ({ ...d, rating: n }))}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-transform hover:scale-125"
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={38}
                        weight={n <= (hover || draft.rating) ? "fill" : "regular"}
                        className={n <= (hover || draft.rating) ? "text-amber-400" : "text-slate-300"}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm font-semibold text-slate-600">
                  {draft.rating === 0 ? "Tap a star to rate" : LABELS[draft.rating]}
                </p>
              </div>

              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Your name (shown on the review)"
                className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#E05833] focus:outline-none focus:ring-2 focus:ring-[#E05833]/20"
              />

              <textarea
                value={draft.text}
                onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                placeholder="What should others know? Best dishes, service, atmosphere..."
                rows={4}
                className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#E05833] focus:outline-none focus:ring-2 focus:ring-[#E05833]/20"
              />

              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Quick tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {REVIEW_TAGS.slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      draft.tags.includes(tag)
                        ? "border-[#E05833] bg-[#E05833]/10 text-[#E05833]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {existing.length > 0 && (
                <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
                  You already submitted {existing.length} {existing.length === 1 ? "review" : "reviews"} for this place — each one counts!
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 px-5 py-3">
              <button
                onClick={submit}
                disabled={!canSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E05833] to-[#F59E0B] py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all enabled:hover:scale-[1.02] enabled:hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <PaperPlaneTilt size={17} weight="fill" />
                Publish review
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}