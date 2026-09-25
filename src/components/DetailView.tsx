import { Bookmark, CaretDown, Check, Clock, Heart, MapPin, NavigationArrow, PhoneCall, SealCheck, Share, Sparkle, Star } from "@phosphor-icons/react";
import { useState } from "react";
import { LANDMARK_DISTANCES } from "../data/mockData";
import { useDirectory } from "../context/DirectoryContext";
import InteractiveMap, { Avatar, ReviewModal, Stars } from "./Widgets";
import type { Business } from "../types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toMins(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function openInfo(hours: Business["hours"]): { open: boolean; label: string } {
  const now = new Date();
  const day = now.getDay();
  const slot = hours[day];
  if (!slot || slot.closed) return { open: false, label: "Closed today" };
  const mins = now.getHours() * 60 + now.getMinutes();
  const openM = toMins(slot.open);
  const closeM = toMins(slot.close);
  if (closeM === 1439) return { open: true, label: "Open 24 hours" };
  const open = closeM < openM ? mins >= openM || mins < closeM : mins >= openM && mins < closeM;
  return { open, label: open ? `Open now · closes ${slot.close}` : `Closed · opens ${slot.open}` };
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-base font-extrabold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Reviews({ b, onWrite }: { b: Business; onWrite: () => void }) {
  const { reviews } = useDirectory();
  const mine = reviews.filter((r) => r.businessId === b.id && !b.reviews.some((x) => x.id === r.id));
  const all = [...b.reviews, ...mine];

  return (
    <Card title={`Reviews (${all.length})`}>
      <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
        <div className="text-center">
          <p className="text-4xl font-extrabold tracking-tight text-slate-900">{b.rating.toFixed(1)}</p>
          <Stars rating={b.rating} size={13} />
          <p className="mt-1 text-[11px] font-semibold text-slate-500">{all.length} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((s) => {
            const pct = all.length ? Math.round((all.filter((r) => Math.round(r.rating) === s).length / all.length) * 100) : 0;
            return (
              <div key={s} className="flex items-center gap-2">
                <span className="w-7 text-right text-[11px] font-bold text-slate-500">{s}★</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-[11px] font-semibold text-slate-400">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 space-y-5">
        {all.slice(0, 6).map((r) => (
          <div key={r.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
            <div className="flex items-center gap-2.5">
              <Avatar name={r.author} hue={r.avatarHue} />
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  {r.author}
                  {r.isLocal && <span className="rounded-full bg-[#E05833]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#E05833]">Local</span>}
                </p>
                <p className="text-[11px] font-semibold text-slate-400">{formatDate(r.date)}</p>
              </div>
              <span className="ml-auto flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-extrabold text-amber-600">
                <Star size={12} weight="fill" /> {r.rating.toFixed(1)}
              </span>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{r.text}</p>
            {r.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.tags.map((t) => (
                  <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs">
              <button className="flex items-center gap-1 font-bold text-slate-400 transition-colors hover:text-[#E05833]">
                <Heart size={13} weight={r.helpful > 0 ? "fill" : "regular"} /> Helpful ({r.helpful})
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onWrite}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-[#E05833]/40 py-3 text-sm font-bold text-[#E05833] transition-colors hover:bg-[#E05833]/5"
      >
        <Star size={15} weight="fill" /> Share your experience
      </button>
    </Card>
  );
}

export default function DetailPage({ id }: { id: string }) {
  const { getBusiness, toggleBookmark, isBookmarked, closeBusiness, setView, bookmarkedIds } = useDirectory();
  const [showReview, setShowReview] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showAllHours, setShowAllHours] = useState(false);
  const b = getBusiness(id);

  if (!b) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900">Business not found</h2>
        <button onClick={() => setView("search")} className="mt-4 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white">
          Back to explore
        </button>
      </div>
    );
  }

  const saved = isBookmarked(b.id);
  const now = openInfo(b.hours);
  const todayIdx = new Date().getDay();
  const hoursKeys = showAllHours ? Object.keys(b.hours) : [String(todayIdx)];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="flex items-center justify-between py-4">
        <button
          onClick={closeBusiness}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-[#E05833] hover:text-[#E05833]"
        >
          <CaretDown size={15} className="rotate-90" /> Back to results
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleBookmark(b.id)}
            className={`grid h-10 w-10 place-items-center rounded-full border transition-all ${
              saved ? "border-[#E05833] bg-[#E05833] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-[#E05833] hover:text-[#E05833]"
            }`}
            aria-label="Bookmark"
          >
            <Bookmark size={18} weight={saved ? "fill" : "regular"} />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#E05833] hover:text-[#E05833]" aria-label="Share">
            <Share size={18} />
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <div className="relative h-[360px] sm:h-[440px]">
              <img src={b.photos[photoIdx]} alt={b.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900 backdrop-blur">
                <MapPin size={13} className="text-[#E05833]" /> {b.area}, {b.neighborhood}
              </span>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div className="flex gap-1.5">
                  {b.photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${photoIdx === i ? "w-8 bg-white" : "w-3 bg-white/50"}`}
                      aria-label={`Photo ${i + 1}`}
                    />
                  ))}
                </div>
                <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700 backdrop-blur">
                  {photoIdx + 1} / {b.photos.length}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{b.name}</h1>
                {b.verified && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                    <SealCheck size={13} weight="fill" /> Verified
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">{b.tagline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-extrabold text-amber-600">
                  <Star size={15} weight="fill" /> {b.rating.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-slate-500">{b.reviewCount} reviews</span>
                <span className="text-slate-300">·</span>
                <span className="text-sm font-bold text-slate-500">{b.price}</span>
                <span className="text-slate-300">·</span>
                <span className={`flex items-center gap-1 text-sm font-semibold ${now.open ? "text-emerald-600" : "text-slate-500"}`}>
                  <Clock size={14} className={now.open ? "text-emerald-500" : "text-slate-400"} />
                  {now.label}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowReview(true)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E05833] to-[#F59E0B] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-transform hover:scale-105"
            >
              <Star size={16} weight="fill" /> Write a review
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {b.attributes.map((a) => (
              <span key={a} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                <Check size={13} className="text-emerald-500" weight="bold" /> {a}
              </span>
            ))}
          </div>

          <Card title="About">
            <p className="text-sm leading-relaxed text-slate-600">{b.description}</p>
          </Card>

          <Card title="Menu highlights">
            <div className="grid gap-2 sm:grid-cols-2">
              {b.menuHighlights.map((m) => (
                <div key={m} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700">
                  <Sparkle size={14} className="shrink-0 text-[#E05833]" weight="fill" /> {m}
                </div>
              ))}
            </div>
          </Card>

          <Reviews b={b} onWrite={() => setShowReview(true)} />
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <InteractiveMap business={b} height="h-[200px]" />
            <div className="space-y-3 p-4">
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <MapPin size={17} className="mt-0.5 shrink-0 text-[#E05833]" weight="fill" />
                <span>
                  <span className="block font-bold text-slate-900">{b.area}</span>
                  {b.address}
                </span>
              </div>
              <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-sm font-semibold text-slate-600 hover:text-[#E05833]">
                <PhoneCall size={17} className="shrink-0 text-[#E05833]" /> {b.phone}
              </a>
              <div className="border-t border-slate-100 pt-3">
                <p className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Hours
                  <button onClick={() => setShowAllHours((v) => !v)} className="flex items-center gap-0.5 text-[#E05833] uppercase">
                    {showAllHours ? "Hide" : "All"} <CaretDown size={12} className={`transition-transform ${showAllHours ? "rotate-180" : ""}`} />
                  </button>
                </p>
                <div className="mt-2 space-y-1">
                  {hoursKeys.map((dk) => {
                    const day = Number(dk);
                    const slot = b.hours[day];
                    return (
                      <div key={day} className={`flex justify-between text-sm ${day === todayIdx ? "font-bold text-slate-900" : "text-slate-500"}`}>
                        <span>
                          {DAYS[day]}
                          {day === todayIdx ? " · today" : ""}
                        </span>
                        <span className={slot.closed ? "text-slate-400" : ""}>{slot.closed ? "Closed" : `${slot.open} – ${slot.close}`}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name} ${b.area} Addis Ababa`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-slate-900 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-700"
              >
                <NavigationArrow size={16} weight="fill" /> Get directions
              </a>
              <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
                <p className="mb-1 font-bold uppercase tracking-wider text-slate-400">Landmark distances</p>
                {LANDMARK_DISTANCES.map((l) => (
                  <p key={l.from} className="flex justify-between py-0.5">
                    <span>{l.from}</span>
                    <span className="font-bold text-slate-700">{l.km} km</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          {bookmarkedIds.length > 0 ? (
            <button
              onClick={() => setView("bookmarks")}
              className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-left transition-transform hover:scale-[1.02]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/20 text-amber-600">
                <Bookmark size={20} weight="fill" />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-slate-900">{bookmarkedIds.length} bookmarked</span>
                <span className="block text-xs text-slate-500">View your saved places</span>
              </span>
            </button>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-4 text-center text-xs text-slate-500">
              <Bookmark size={16} className="mx-auto mb-1 text-slate-300" />
              Save places you love to plan your next outing.
            </div>
          )}
        </div>
      </div>

      {showReview && <ReviewModal business={b} onClose={() => setShowReview(false)} />}
    </div>
  );
}