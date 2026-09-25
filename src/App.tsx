import { MapTrifold } from "@phosphor-icons/react";
import { DirectoryProvider, useDirectory, NEIGHBORHOODS } from "./context/DirectoryContext";
import Navbar from "./components/Navbar";
import Home from "./components/HomeView";
import { SearchPage, BookmarksPage } from "./components/SearchView";
import DetailPage from "./components/DetailView";
import type { ViewKey } from "./types";

export default function App() {
  return (
    <DirectoryProvider>
      <AppShell />
    </DirectoryProvider>
  );
}

function AppShell() {
  const { view, selectedId } = useDirectory();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <Navbar />
      {view === "home" && <Home />}
      {view === "search" && <SearchPage />}
      {view === "detail" && selectedId && <DetailPage id={selectedId} />}
      {view === "bookmarks" && <BookmarksPage />}
      <Footer />
    </div>
  );
}

function Footer() {
  const { setView, setFilter } = useDirectory();
  const go = (v: ViewKey) => {
    setView(v);
    window.scrollTo({ top: 0 });
  };
  return (
    <footer className="border-t border-slate-100 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 text-base font-extrabold text-white">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#E05833] to-[#F59E0B] text-white">
                <MapTrifold size={16} weight="fill" />
              </span>
              Yuloan<span className="text-[#E05833]">Buzz</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              The local directory for Addis Ababa — discover, compare and review the businesses shaping the city.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Explore</p>
            <div className="mt-3 flex flex-col items-start gap-2 text-sm text-slate-300">
              {(["home", "search", "bookmarks"] as ViewKey[]).map((v) => (
                <button key={v} onClick={() => go(v)} className="capitalize transition-colors hover:text-amber-300">
                  {v === "search" ? "Explore businesses" : v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Top neighborhoods</p>
            <div className="mt-3 flex flex-col items-start gap-2 text-sm text-slate-300">
              {NEIGHBORHOODS.slice(0, 4).map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setFilter({ neighborhood: n.id });
                    go("search");
                  }}
                  className="transition-colors hover:text-amber-300"
                >
                  {n.name} · {n.area}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Yuloan Buzz · Made with ☕ in Addis Ababa · MVP demo data
        </p>
      </div>
    </footer>
  );
}