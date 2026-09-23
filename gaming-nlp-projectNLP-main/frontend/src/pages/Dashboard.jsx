import { useEffect, useState } from "react";
import { Flame, Sparkles, BarChart3, Search, X } from "lucide-react";
import { getSportsTrends, getTrendingVideos, getLatestVideos, getMostViewedVideos, getMostCommentedVideos } from "../api/client.js";
import VideoCard from "../components/VideoCard.jsx";
import { VideoCardSkeleton, EmptyState, ErrorState } from "../components/Skeletons.jsx";

const tabsByLang = {
  th: [
    { key: "trending", label: "ยอดนิยม" },
    { key: "latest", label: "ล่าสุด" },
    { key: "most-viewed", label: "ผู้ชมมากที่สุด" },
    { key: "most-commented", label: "คอมเมนต์มากที่สุด" },
  ],
  en: [
    { key: "trending", label: "Trending" },
    { key: "latest", label: "Latest" },
    { key: "most-viewed", label: "Most Viewed" },
    { key: "most-commented", label: "Most Commented" },
  ],
};

const fetchers = {
  trending: getTrendingVideos,
  latest: getLatestVideos,
  "most-viewed": getMostViewedVideos,
  "most-commented": getMostCommentedVideos,
};

const sportsByLang = {
  th: [
    { key: "all", label: "ทั้งหมด", query: "", icon: "✦" },
    { key: "football", label: "ฟุตบอล", query: "football", icon: "⚽" },
    { key: "volleyball", label: "วอลเลย์บอล", query: "volleyball", icon: "🏐" },
    { key: "badminton", label: "แบดมินตัน", query: "badminton", icon: "🏸" },
    { key: "basketball", label: "บาสเกตบอล", query: "basketball", icon: "🏀" },
    { key: "boxing", label: "มวย", query: "boxing", icon: "🥊" },
    { key: "motorsport", label: "มอเตอร์สปอร์ต", query: "motorsport", icon: "🏎️" },
    { key: "esports", label: "อีสปอร์ต", query: "esports", icon: "🎮" },
  ],
  en: [
    { key: "all", label: "All sports", query: "", icon: "✦" },
    { key: "football", label: "Football", query: "football", icon: "⚽" },
    { key: "volleyball", label: "Volleyball", query: "volleyball", icon: "🏐" },
    { key: "badminton", label: "Badminton", query: "badminton", icon: "🏸" },
    { key: "basketball", label: "Basketball", query: "basketball", icon: "🏀" },
    { key: "boxing", label: "Boxing", query: "boxing", icon: "🥊" },
    { key: "motorsport", label: "Motorsport", query: "motorsport", icon: "🏎️" },
    { key: "esports", label: "Esports", query: "esports", icon: "🎮" },
  ],
};

function formatCount(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value ?? 0);
}

export default function Dashboard({ language = "th" }) {
  const [tab, setTab] = useState("trending");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sport, setSport] = useState("all");
  const [videos, setVideos] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoLimit = tab === "trending" ? 10 : 16;

  const text = {
    th: {
      hero: "กีฬาที่กำลังได้รับความนิยม",
      heroSub: "ติดตามแนวโน้มกีฬาที่มีการพูดถึงและการมีส่วนร่วมจากชุมชนอย่างต่อเนื่อง",
      title: "กีฬายอดนิยม",
      noVideos: "ไม่พบวิดีโอ",
      noVideosSub: "ลองสลับแท็บอื่น หรือตรวจสอบคีย์ YouTube API",
      fetchError: "ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่",
      searchPlaceholder: "ค้นหากีฬา เช่น ฟุตบอล หรือ วอลเลย์บอล",
      search: "ค้นหากีฬา",
    },
    en: {
      hero: "Trending sports",
      heroSub: "Monitor the sports generating the strongest attention and community engagement.",
      title: "Trending Sports",
      noVideos: "No videos found",
      noVideosSub: "Try another tab or check the YouTube API key.",
      fetchError: "Unable to load data. Please check whether the backend is running.",
      searchPlaceholder: "Search sports, e.g. football or volleyball",
      search: "Search sports",
    },
  }[language] || {
    hero: "กีฬาที่กำลังได้รับความนิยม",
    heroSub: "ติดตามแนวโน้มกีฬาที่มีการพูดถึงและการมีส่วนร่วมจากชุมชนอย่างต่อเนื่อง",
    title: "กีฬายอดนิยม",
    noVideos: "ไม่พบวิดีโอ",
    noVideosSub: "ลองสลับแท็บอื่น หรือตรวจสอบคีย์ YouTube API",
    fetchError: "ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่",
    searchPlaceholder: "ค้นหากีฬา เช่น ฟุตบอล หรือ วอลเลย์บอล",
    search: "ค้นหากีฬา",
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetcher = fetchers[tab];
    let active = true;
    Promise.all([fetcher(videoLimit, searchQuery), getSportsTrends()])
      .then(([videoList, trendData]) => {
        if (!active) return;
        setVideos(videoList.slice(0, videoLimit));
        setTrends(trendData);
      })
      .catch(() => { if (active) setError(text.fetchError); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tab, searchQuery, text.fetchError, videoLimit]);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchInput.trim();
    const matchingSport = (sportsByLang[language] || sportsByLang.th)
      .find((item) => item.query.toLowerCase() === query.toLowerCase());
    setSearchQuery(query);
    setSport(matchingSport?.key || "all");
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setSport("all");
  };

  const selectSport = (item) => {
    setSport(item.key);
    setSearchInput(item.query);
    setSearchQuery(item.query);
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      <section className="relative overflow-hidden rounded-[24px] border border-indigo-200/40 bg-gradient-to-br from-[#102a5e] via-[#1e3a8a] to-[#4c1d95] p-5 text-white shadow-[0_24px_60px_-24px_rgba(67,56,202,0.55)] sm:rounded-[28px] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_14%,_rgba(125,211,252,0.28),transparent_26%),radial-gradient(circle_at_5%_100%,_rgba(196,181,253,0.28),transparent_38%)]" />
        <div className="absolute -right-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full border border-white/20" />
        <div className="relative z-10 flex flex-col gap-6 sm:gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
              <Sparkles size={12} />
              Live Insight
            </span>
            <h2 className="text-[28px] font-black leading-tight tracking-tight sm:text-4xl">{text.hero}</h2>
            <p className="max-w-xl text-sm leading-6 text-white/80 sm:text-base">{text.heroSub}</p>
          </div>

          <div className="grid w-full grid-cols-2 gap-2.5 text-left sm:gap-3 lg:w-[360px] lg:shrink-0">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 shadow-sm shadow-indigo-950/20 backdrop-blur-md sm:p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-100">
                <Flame size={14} /> {language === "th" ? "เทรนด์กีฬา" : "Sport trends"}
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-black leading-none">{trends?.trending_sports?.length ?? 0}</span>
                <span className="pb-0.5 text-xs text-white/70">{language === "th" ? "หัวข้อ" : "topics"}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 shadow-sm shadow-indigo-950/20 backdrop-blur-md sm:p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-100">
                <BarChart3 size={14} /> {language === "th" ? "ระบบวิเคราะห์" : "Analysis"}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
                <span className="text-base font-bold">{trends?.overall_sentiment ? (language === "th" ? "พร้อมใช้งาน" : "Ready") : (language === "th" ? "กำลังอัปเดต" : "Updating")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.18)] sm:rounded-[28px] sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
            <Flame size={18} />
          </span>
          <h2 className="text-xl font-bold text-slate-900">{text.title}</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {trends?.trending_sports?.slice(0, 4).map((g) => (
            <div key={g.name} className="group flex min-h-[88px] items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:min-h-[94px] sm:p-4">
              <div className="min-w-0 pr-3">
                <p className="truncate text-base font-semibold text-slate-800">{g.name}</p>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 sm:px-2.5 sm:text-sm">
                {formatCount(g.views)} views
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">{language === "th" ? "เลือกหมวดกีฬา" : "Browse by sport"}</h2>
            {sport !== "all" && <span className="text-xs font-medium text-indigo-600">{language === "th" ? "กำลังกรองผลลัพธ์" : "Filtering results"}</span>}
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="list" aria-label="Sport categories">
            {(sportsByLang[language] || sportsByLang.th).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => selectSport(item)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  sport === item.key
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                <span aria-hidden="true">{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={submitSearch} className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={text.searchPlaceholder}
              aria-label={text.searchPlaceholder}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
            {searchInput && (
              <button type="button" onClick={clearSearch} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto">
            <Search size={16} /> {text.search}
          </button>
        </form>

        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Video filters">
          {tabsByLang[language || "th"].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                tab === t.key
                  ? "border-transparent bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => setTab((current) => current)} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading
              ? Array.from({ length: videoLimit }).map((_, i) => <VideoCardSkeleton key={i} />)
              : videos.length === 0
              ? <EmptyState title={text.noVideos} subtitle={text.noVideosSub} />
              : videos.map((v, index) => <VideoCard key={v.video_id} video={v} language={language} rank={tab === "trending" ? index + 1 : undefined} />)}
          </div>
        )}
      </section>
    </div>
  );
}
