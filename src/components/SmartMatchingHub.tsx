import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, MapPin, Briefcase, RefreshCw, ExternalLink, CheckCircle, Search, Filter } from "lucide-react";
import { Job } from "../types";

interface SmartMatchingHubProps {
  email: string;
  language: "ar" | "en";
  t: any;
  onTailorTrigger: (job: Job) => void;
  cvData: any;
}

export const SmartMatchingHub: React.FC<SmartMatchingHubProps> = ({
  email, language, t, onTailorTrigger, cvData
}) => {
  const isRtl = language === "ar";
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [filterType, setFilterType] = useState<"all" | "remote" | "onsite" | "hybrid">("all");

  // ── Build smart search query from CV ─────────────────────────
  const buildQuery = () => {
    if (!cvData?.personal?.title && !cvData?.skills?.length) return "";
    const title = cvData.personal?.title || "";
    const topSkill = cvData.skills?.[0] || "";
    return title || topSkill;
  };

  // ── Calculate real match score from CV ───────────────────────
  const calcMatch = (job: any): number => {
    if (!cvData?.skills?.length && !cvData?.personal?.title) return 50;
    let score = 40;
    const cvText = [
      cvData.personal?.title,
      cvData.personal?.summary,
      ...(cvData.skills || []),
      ...(cvData.experience || []).map((e: any) => `${e.role} ${e.description}`)
    ].join(" ").toLowerCase();

    const jobText = `${job.title} ${job.description} ${job.company}`.toLowerCase();
    const jobWords = jobText.split(/\s+/).filter((w: string) => w.length > 3);
    const matchedWords = jobWords.filter((w: string) => cvText.includes(w));
    score += Math.min(50, Math.round((matchedWords.length / Math.max(jobWords.length, 1)) * 100));

    // Location bonus
    if (job.type === "remote") score += 8;
    return Math.min(98, Math.max(30, score));
  };

  const loadMatches = async (forceRefresh = false) => {
    forceRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const query = buildQuery();
      const url = query
        ? `/api/jobs?keyword=${encodeURIComponent(query)}`
        : "/api/jobs";

      if (forceRefresh) await fetch("/api/jobs/refresh", { method: "POST" });

      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.jobs?.length > 0) {
        const scored = data.jobs
          .map((j: any) => ({ ...j, matchScore: calcMatch(j) }))
          .sort((a: any, b: any) => b.matchScore - a.matchScore);
        setJobs(scored);
        setLastUpdated(new Date().toLocaleTimeString(isRtl ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" }));
      } else {
        setError(isRtl ? "لم يتم العثور على وظائف مطابقة." : "No matching jobs found.");
      }
    } catch {
      setError(isRtl ? "تعذّر الاتصال بمصادر الوظائف." : "Could not connect to job sources.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadMatches(); }, [email, language]);

  const filtered = jobs.filter(j => filterType === "all" || j.type === filterType);

  const typeColors: Record<string, string> = {
    remote: "masar-badge-indigo",
    onsite: "masar-badge-slate",
    hybrid: "masar-badge-violet"
  };
  const typeLabels: Record<string, string> = {
    remote: isRtl ? "عن بعد" : "Remote",
    onsite: isRtl ? "حضوري" : "On-site",
    hybrid: isRtl ? "هجين" : "Hybrid"
  };

  return (
    <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>

      {/* Header */}
      <div className="rounded-3xl p-6 text-white masar-animate-up"
        style={{background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#312e81 100%)"}}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-300 font-bold uppercase tracking-widest">
                {isRtl ? "مطابقة ذكية" : "Smart Match"}
              </span>
            </div>
            <h2 className="text-xl font-black">
              {isRtl ? "وظائف مختارة ليك بالذكاء الاصطناعي" : "AI-Matched Jobs for You"}
            </h2>
            <p className="text-xs text-indigo-200 max-w-md leading-relaxed">
              {isRtl
                ? `بناءً على سيرتك ومهاراتك — بنجيب الوظائف الأنسب ليك من Wuzzuf وBayt وRemotive.`
                : `Based on your CV and skills — we pull the best matches from Wuzzuf, Bayt & Remotive.`}
            </p>
          </div>
          <button onClick={() => loadMatches(true)} disabled={refreshing || loading}
            className="flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl transition disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? (isRtl ? "جاري التحديث..." : "Refreshing...") : (isRtl ? "تحديث الوظائف" : "Refresh Jobs")}
          </button>
        </div>

        {/* CV Match Info */}
        {cvData?.personal?.title && (
          <div className="mt-4 flex items-center gap-2 bg-white/8 rounded-xl px-4 py-2.5 border border-white/10 w-fit">
            <Search className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
            <span className="text-xs text-indigo-100">
              {isRtl ? `بتدوّر على: "${cvData.personal.title}"` : `Searching for: "${cvData.personal.title}"`}
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "remote", "onsite", "hybrid"] as const).map(type => (
          <button key={type} onClick={() => setFilterType(type)}
            className={`masar-badge cursor-pointer transition-all ${
              filterType === type ? "masar-badge-indigo font-black scale-105" : "masar-badge-slate hover:bg-slate-200"
            }`}>
            {type === "all" ? (isRtl ? "الكل" : "All") : typeLabels[type]}
            {type !== "all" && (
              <span className="mr-1 opacity-60">
                ({jobs.filter(j => j.type === type).length})
              </span>
            )}
          </button>
        ))}
        {lastUpdated && (
          <span className="mr-auto text-[10px] text-slate-400 self-center">
            {isRtl ? `آخر تحديث ${lastUpdated}` : `Updated ${lastUpdated}`}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="masar-card p-8 flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">
            {isRtl ? "جاري تحميل الوظائف المناسبة..." : "Loading matched jobs..."}
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="masar-card p-5 text-center space-y-2">
          <p className="text-sm text-slate-500">{error}</p>
          <button onClick={() => loadMatches()} className="masar-btn masar-btn-ghost text-xs px-4 py-2">
            {isRtl ? "حاول مرة أخرى" : "Try Again"}
          </button>
        </div>
      )}

      {/* Jobs Grid */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((job, i) => (
            <div key={job.id || i}
              className="masar-card masar-job-card p-5 masar-animate-up">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-slate-900 text-sm">{job.title}</h3>
                    {job.matchScore >= 80 && (
                      <span className="masar-badge masar-badge-emerald text-[10px]">
                        <CheckCircle className="w-3 h-3" />
                        {isRtl ? "تطابق عالي" : "High Match"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{job.company}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`masar-badge text-[10px] ${typeColors[job.type] || "masar-badge-slate"}`}>
                      {typeLabels[job.type] || job.type}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3" />{job.location}
                    </span>
                    {job.salary && (
                      <span className="text-[11px] text-slate-400">{job.salary}</span>
                    )}
                  </div>
                  {job.description && (
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  )}
                </div>

                {/* Match Score */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-center font-black ${
                    job.matchScore >= 80 ? "masar-score-excellent" :
                    job.matchScore >= 60 ? "masar-score-good" : "masar-score-poor"
                  }`}>
                    <span className="text-lg leading-none">{job.matchScore}%</span>
                    <span className="text-[9px] font-semibold opacity-70">
                      {isRtl ? "تطابق" : "match"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-50">
                <button onClick={() => onTailorTrigger(job)}
                  className="flex-1 masar-btn masar-btn-primary text-xs py-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isRtl ? "خصّص سيرتي لها" : "Tailor My CV"}
                </button>
                {job.url && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer"
                    className="masar-btn masar-btn-ghost text-xs py-2 px-3">
                    <ExternalLink className="w-3.5 h-3.5" />
                    {isRtl ? "التقدم" : "Apply"}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && jobs.length > 0 && (
        <div className="masar-card p-8 text-center space-y-2">
          <p className="text-2xl">🔍</p>
          <p className="text-sm font-bold text-slate-700">
            {isRtl ? "لا توجد وظائف بهذا الفلتر" : "No jobs with this filter"}
          </p>
          <button onClick={() => setFilterType("all")} className="masar-btn masar-btn-ghost text-xs px-4 py-2">
            {isRtl ? "عرض الكل" : "Show All"}
          </button>
        </div>
      )}
    </div>
  );
};
