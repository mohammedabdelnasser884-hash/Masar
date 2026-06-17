import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Calendar, Loader2, Link, MapPin, Briefcase, RefreshCw, Send, HelpCircle, CheckCircle, Info, Database, Play, ToggleLeft, ToggleRight, XCircle } from "lucide-react";
import { Job } from "../types";

interface SmartMatchingHubProps {
  email: string;
  language: "ar" | "en";
  t: any;
  onTailorTrigger: (job: Job) => void;
  cvData: any;
}

export const SmartMatchingHub: React.FC<SmartMatchingHubProps> = ({
  email,
  language,
  t,
  onTailorTrigger,
  cvData
}) => {
  const isRtl = language === "ar";
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  // Crawler & Simulator states
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlerLogs, setCrawlerLogs] = useState<string[]>([]);
  const [crawlerActiveSources, setCrawlerActiveSources] = useState({
    facebook: true,
    telegram: true,
    linkedin: true,
    google: true
  });
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["مصر", "الرياض", "جدة", "عن بعد"]);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Egypt/Gulf Agencies tracked from User's Checkpoint:
  const TRACKED_COMPANIES = [
    { name: "شركة الطائف للتوظيف", url: "https://www.facebook.com/share/1ZFyLpySWY/?mibextid=wwXIfr" },
    { name: "شركة المعالي جروب للتوظيف", url: "https://www.facebook.com/share/1WWqWkbmZ7/?mibextid=wwXIfr" },
    { name: "شركة انفراد للتوظيف", url: "https://www.facebook.com/enfrad.hr1" },
    { name: "شركة آل زيدان للتوظيف", url: "https://www.facebook.com/share/1ExjNEQbF5/?mibextid=wwXIfr" },
    { name: "شركة مسار للتوظيف", url: "https://www.facebook.com/share/19gP" },
    { name: "شركة تراست جروب للتوظيف", url: "https://www.facebook.com/share/1KywnpW7g6/?mibextid=wwXIfr" },
    { name: "شركة جوب واي للتوظيف الطبي", url: "https://www.facebook.com/share/1GY8z6dVsn/?mibextid=wwXIfr" },
    { name: "شركة استدامة للتوظيف", url: "https://www.facebook.com/share/16K4p6qkhi/?mibextid=wwXIfr" },
    { name: "شركة هورايزون للتوظيف", url: "https://www.facebook.com/share/16RpKeXe6Q/?mibextid=wwXIfr" }
  ];

  const loadMatches = async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("masar_token");
      const res = await fetch("/api/jobs/matched", {
        headers: {
          "Authorization": `Bearer ${token || ""}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setJobs(data.matches || []);
        setReport(data.dailyReport || "");
      } else {
        setError(isRtl ? "فشل تصفية ومطابقة الوظائف الشاغرة." : "Failed to filter matched vacancies.");
      }
    } catch (e) {
      setError(isRtl ? "مستطلعات المطابقة معطلة مؤقتاً." : "Handshake matching is offline.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const runLiveCrawlSimulation = async () => {
    setIsCrawling(true);
    setCrawlerLogs([]);

    const log = (msg: string) => setCrawlerLogs(prev => [...prev, msg]);

    log(isRtl ? "🔍 جاري البحث في قاعدة بيانات مسار..." : "🔍 Searching Masar jobs database...");
    log(isRtl
      ? `📍 النطاق الجغرافي: ${selectedLocations.length > 0 ? selectedLocations.join(" - ") : "كل المناطق"}`
      : `📍 Scope: ${selectedLocations.length > 0 ? selectedLocations.join(" - ") : "All regions"}`
    );

    await loadMatches(true);

    log(isRtl ? "✅ تم جلب أفضل الوظائف المطابقة لملفك الشخصي" : "✅ Matched jobs loaded from your profile");
    setIsCrawling(false);
  };

  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
      setSelectedLocations(selectedLocations.filter((item) => item !== loc));
    } else {
      setSelectedLocations([...selectedLocations, loc]);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [email]);

  // Scroll terminal logs container to bottom on update
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [crawlerLogs]);

  return (
    <div className="space-y-6 text-slate-800">
      {/* Dynamic Intro Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl space-y-5">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-200 border border-indigo-500/30 px-3 py-1 rounded-xl text-xs font-bold leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              {isRtl ? "نظام البحث السمانتي والمطابقة المهنية" : "Active Match & Alignment Engine"}
            </span>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">{isRtl ? "مطابقة الفرص الذكية وتخطيط مسار" : "Intelligent Job Alignment Engine"}</h2>
            <p className="text-xs text-indigo-100/80 max-w-2xl leading-relaxed">
              {isRtl
                ? "قاطع مهارات وسيرتك الذاتية مع قاعدة بيانات مسار التي تحتوي على مئات شواغر من الشركات المعتمدة والموثقة، ليمدك الذكاء الاصطناعي بتقرير توافق كامل."
                : "Match your core skills and CV to hundreds of active contracts and corporate vacancies from accredited employers inside Masar's database."}
            </p>
          </div>
          
          <button
            onClick={runLiveCrawlSimulation}
            disabled={isCrawling || loading}
            className="text-xs bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold px-5 py-3 rounded-xl transition duration-200 flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-500/20 mr-auto"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isCrawling ? "animate-spin" : ""}`} />
            <span>{isRtl ? "أطلق معالج الفحص والمطابقة ⚡" : "Initiate Alignment Process ⚡"}</span>
          </button>
        </div>

        {/* Search Configuration Grid */}
        <div className="border-t border-white/10 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Source Info */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-indigo-200 block">
              {isRtl ? "مصادر البحث" : "Search Sources"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className="flex items-center gap-1.5 bg-indigo-600/20 border border-indigo-500/30 px-2.5 py-1.5 rounded-xl text-[10.5px] text-indigo-200 font-medium">
                ✓ {isRtl ? "قاعدة بيانات مسار" : "Masar Jobs Database"}
              </span>
              <span className="flex items-center gap-1.5 bg-indigo-600/20 border border-indigo-500/30 px-2.5 py-1.5 rounded-xl text-[10.5px] text-indigo-200 font-medium">
                ✓ {isRtl ? "وكالات التوظيف المسجلة" : "Registered Agencies"}
              </span>
            </div>
          </div>

          {/* Location Targeting */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-indigo-200 block">
              {isRtl ? "نطاق الفرز المستهدف" : "Geographical Focus Area"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {["مصر", "الرياض", "جدة", "عن بعد", "الشرقية", "الإسكندرية", "دبي"].map((loc) => {
                const isActive = selectedLocations.includes(loc);
                return (
                  <button
                    key={loc}
                    onClick={() => toggleLocation(loc)}
                    className={`text-[10px] px-2.5 py-1.5 rounded-xl font-bold border transition duration-150 ${
                      isActive 
                        ? "bg-indigo-600 text-white border-transparent" 
                        : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Terminal Block during active crawling simulation */}
      {isCrawling && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-inner space-y-3.5">
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-black text-rose-400 font-sans ml-1">TERMINAL - MASAR LIVE AUTO-CRAWL</span>
            </div>
            <span>STREAMS: ON-AIR</span>
          </div>

          <div className="font-mono text-[11px] leading-relaxed text-emerald-400 h-44 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
            {crawlerLogs.map((log, index) => (
              <div key={index} className="flex gap-1.5 items-start animate-fade-in">
                <span className="text-slate-500 shrink-0 select-none">[{index + 1}]</span>
                <span className="break-words">{log}</span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
            <span>THREADS: 4 ACTIVE</span>
            <span>SYSTEM OVERLOAD: 1.2%</span>
          </div>
        </div>
      )}

      {/* Main matching content */}
      {loading && !isCrawling ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-50 rounded-3xl space-y-3 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500 animate-pulse">
            {isRtl
              ? "جاري مواءمة وسحب الشواغر الموثقة من قواعد البيانات..."
              : "Running live semantic scan of aggregated jobs database..."}
          </p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold text-center leading-relaxed">
          ⚠️ {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI MATCH REPORT BANNER */}
          {report && !isCrawling && (
            <div className="bg-gradient-to-r from-indigo-50/50 via-sky-50/20 to-emerald-50/50 border border-indigo-100/60 rounded-3xl p-6 relative overflow-hidden space-y-3 shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                  {isRtl ? "تقرير التحليل والمطابقة التفاعلي اليومي" : "INTELLIGENT DAILY ALIGNMENT REPORT"}
                </span>
                <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-lg font-bold font-mono">
                  {isRtl ? "تزامن حي" : "LIVE FEED"}
                </span>
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-semibold">
                {report}
              </p>
            </div>
          )}

          {/* Tracked Companies directory quick access block */}
          {!isCrawling && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="p-1 bg-amber-50 text-amber-600 rounded-lg"><Database className="w-4 h-4" /></span>
                <div>
                  <h4 className="text-xs font-black text-slate-900">{isRtl ? "شركات توظيف السفريات المعتمدة المستهدفة بالزحف" : "Facebook Agency Watchlists Scraped Today"}</h4>
                  <p className="text-[10px] text-slate-400 font-sans">{isRtl ? "منصات موثوقة ننسق معها تصفية وقراءة منشوراتها اللحظية" : "Accredited channels monitored for real-time postings"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {TRACKED_COMPANIES.map((company, idx) => (
                  <a
                    key={idx}
                    href={company.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 rounded-xl text-center transition group cursor-pointer"
                  >
                    <span className="text-[10.5px] font-bold text-slate-700 block truncate group-hover:text-indigo-900">{company.name}</span>
                    <span className="text-[8.5px] text-indigo-600 font-bold opacity-80 group-hover:opacity-100">{isRtl ? "رابط فيسبوك 🔗" : "FB Profile 🔗"}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Matches Listings */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
              {isRtl ? `شواغر مطابقة لمهاراتك وتفضيلاتك اليوم (${jobs.filter(j => j.matchScore >= 60).length})` : `Best AI Opportunities Found (${jobs.filter(j => j.matchScore >= 60).length})`}
            </h4>

            {jobs.filter(j => j.matchScore >= 60).length === 0 ? (
              <div className="bg-slate-50 border p-12 rounded-3xl text-center text-slate-400 text-xs shadow-sm">
                {isRtl
                  ? "لا توجد فرص متطابقة بأكثر من 60% حتى الآن. أضف المزيد من المهارات أو المجالات المستهدفة في ملفك الشخصي أو قم بتشغيل 'الزاحف الذكي' بالاعلى لاستكشاف شواغر جديدة."
                  : "No high score (60%+) matches detected today. Expand skills or locations inside your Profile."}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobs
                  .filter(j => j.matchScore >= 60)
                  .map((job) => (
                    <div
                      key={job.id}
                      className="bg-white border border-slate-100/80 hover:border-indigo-100 hover:shadow-lg transition-all rounded-3xl p-6 relative flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in"
                    >
                      {/* Job metadata */}
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900">{job.title}</h4>
                          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl font-bold">
                            {job.company}
                          </span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider border ${
                              job.type === "remote"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : job.type === "onsite"
                                ? "bg-slate-50 text-slate-600 border-slate-100"
                                : "bg-blue-50 text-blue-700 border-blue-100"
                            }`}
                          >
                            {job.type === "remote" ? (isRtl ? "عن بعد" : "Remote") : job.type === "onsite" ? (isRtl ? "حضوري" : "On-site") : (isRtl ? "هجين" : "Hybrid")}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 font-sans leading-relaxed line-clamp-3 md:line-clamp-2">
                          {job.description}
                        </p>

                        {/* MATCH SCORE BLOCK */}
                        <div className="mt-3 bg-indigo-50/15 border border-indigo-100/40 rounded-2xl p-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-extrabold text-indigo-950 uppercase tracking-widest flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                              {isRtl ? "تقرير ملاءمة خوارزميات التوظيف" : "ATS PRECISE SCORE METRICS"}
                            </span>
                            <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                              job.matchScore >= 80 ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"
                            }`}>
                              {job.matchScore}% {isRtl ? "تطابق ممتاز" : "Excellent Match"}
                            </span>
                          </div>

                          {/* Matching terms matched */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {job.matchedKeywords && job.matchedKeywords.length > 0 ? (
                              job.matchedKeywords.map((tag: string, idx: number) => (
                                <span key={idx} className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                                  ✓ {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-[9px] text-slate-400 font-bold">{isRtl ? "مطابقة مجالية مستنبطة" : "Implied structural alignment"}</span>
                            )}
                            
                            {job.matchedLocations && job.matchedLocations.length > 0 && (
                              job.matchedLocations.map((loc: string, idx: number) => (
                                <span key={`loc-${idx}`} className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                                  📍 {loc}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1.5 text-slate-400 font-sans text-[10.5px]">
                          <span className="flex items-center gap-1">📍 {job.location}</span>
                          {job.salary && <span className="flex items-center gap-1">💵 {job.salary}</span>}
                          <span>⏱️ {isRtl ? "المصدر والقناة التوظيفية" : "Source"}: <strong className="text-slate-600 font-sans">{job.source}</strong></span>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex shrink-0 gap-2 flex-row md:flex-col pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 items-stretch md:items-end justify-end">
                        <button
                          onClick={() => onTailorTrigger(job)}
                          className="bg-slate-900 hover:bg-black text-white font-extrabold text-xs py-3 px-4.5 rounded-xl transition duration-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-300 fill-indigo-300" />
                          <span>{t.tailorThis}</span>
                        </button>
                        <a
                          href={job.url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-3 px-4.5 rounded-xl transition duration-200 flex items-center justify-center text-center cursor-pointer shadow-md shadow-indigo-600/10 active:scale-95 border border-indigo-500/20"
                        >
                          <span>{t.applyNow}</span>
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
