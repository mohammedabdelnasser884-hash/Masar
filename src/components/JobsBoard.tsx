import React, { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, Sparkles, Loader2, RefreshCw, CheckCircle, HelpCircle, ArrowUpRight } from "lucide-react";
import { Job, CVData } from "../types";

interface JobsBoardProps {
  onTailorTrigger: (job: Job) => void;
  language: "ar" | "en";
  t: any;
  cvData: CVData;
}

export const JobsBoard: React.FC<JobsBoardProps> = ({ onTailorTrigger, language, t, cvData }) => {
  const isRtl = language === "ar";
  const [jobs, setJobs] = useState<Job[]>([]);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<"all" | "remote" | "onsite" | "hybrid">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchJobs = async (customKeyword = keyword, customLocation = location) => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams();
      if (customKeyword.trim()) queryParams.append("keyword", customKeyword);
      if (customLocation.trim()) queryParams.append("location", customLocation);
      if (type !== "all") queryParams.append("type", type);

      const res = await fetch(`/api/jobs?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
      } else {
        throw new Error(data.message || "Failed to fetch jobs");
      }
    } catch (err) {
      setError(isRtl ? "حدث خطأ أثناء جلب الوظائف. يرجى المحاولة لاحقاً." : "Could not retrieve jobs. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Run initial search on mount
  useEffect(() => {
    searchJobs();
  }, [type]);

  const handleColloquialSearch = (colloquialTerm: string) => {
    setKeyword(colloquialTerm);
    setLocation("");
    searchJobs(colloquialTerm, "");
  };

  // SMART MATCHER ENGINE FOR EACH JOB
  const getSmartMatch = (job: Job) => {
    let score = 55; // base score
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    
    const cvTitle = (cvData?.personal?.title || "").toLowerCase();
    const jobTitle = job.title.toLowerCase();
    
    // Title word overlaps
    const titleWords = cvTitle.split(/\s+/).filter(w => w.length > 2);
    let titleMatched = false;
    titleWords.forEach(w => {
      if (jobTitle.includes(w)) {
        titleMatched = true;
      }
    });

    if (titleMatched) {
      score += 25;
    } else {
      score += 10;
    }
    
    // Skills matching
    const skillsList = cvData?.skills || [];
    skillsList.forEach(skill => {
      const s = skill.toLowerCase();
      if (jobTitle.includes(s) || job.description.toLowerCase().includes(s)) {
        matchedSkills.push(skill);
        score += 6;
      } else {
        if (missingSkills.length < 3) {
          missingSkills.push(skill);
        }
      }
    });

    // clamp
    score = Math.min(97, Math.max(65, score));

    let explanation = "";
    if (isRtl) {
      explanation = titleMatched 
        ? `يتطابق المسمى بشكل ممتاز مع ترشيحك كـ "${cvData?.personal?.title || "تخصصك"}". قمنا برصد مهارات مشتركة تعزز قبولك منها (${matchedSkills.slice(0, 2).join("، ") || "التحليلات والمبادرة"}).`
        : `تنسجم خبرتك نسبياً مع المهارات المطلوبة مثل ${cvData?.skills?.slice(0, 2).join("، ") || "أدواتك الأساسية"}. ننصح بإقران شهادات مهنية لرفع مستوى العبور.`;
    } else {
      explanation = titleMatched
        ? `High-velocity fit with your target career profile as a "${cvData?.personal?.title || "Specialist"}". Overlapping direct skills found: (${matchedSkills.slice(0, 2).join(", ") || "core initiatives"}).`
        : `Moderate overlap discovered via your core tools like ${cvData?.skills?.slice(0, 2).join(", ") || "primary tags"}. Leverage our V2 CV Tailoring to boost compatibility.`;
    }

    return {
      score,
      matchedSkills,
      missingSkills,
      explanation
    };
  };

  return (
    <div className="space-y-6">
      {/* Search Bar Chamber */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
          <span>🔍</span>
          <span>{isRtl ? "ابحث عن فرصتك الوظيفية" : "Find Your Next Career Opportunity"}</span>
        </h3>

        {/* Form Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t.searchJobs}
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all font-sans"
            />
          </div>

          <div className="md:col-span-3 relative">
            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t.filterCity}
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all font-sans"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all font-sans"
            >
              <option value="all">{t.allTypes}</option>
              <option value="remote">{t.remoteOnly}</option>
              <option value="onsite">{t.onsiteOnly}</option>
              <option value="hybrid">{t.hybridOnly}</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={() => searchJobs()}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{isRtl ? "بحث" : "Search"}</span>}
            </button>
          </div>
        </div>

        {/* Colloquial Suggestion Panel */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-xs text-slate-500 font-medium">{t.colloquialTip}</span>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => handleColloquialSearch("شغلانة جدة")}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-2.5 py-1.5 rounded-lg border border-indigo-100 shadow-sm transition-colors cursor-pointer"
            >
              🇸🇦 شغلانة جدة
            </button>
            <button
              onClick={() => handleColloquialSearch("مرتب محاسب قطر")}
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium px-2.5 py-1.5 rounded-lg border border-amber-100 shadow-sm transition-colors cursor-pointer"
            >
              🇶🇦 مرتب محاسب قطر
            </button>
            <button
              onClick={() => handleColloquialSearch("شغل من البيت برمجيات")}
              className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium px-2.5 py-1.5 rounded-lg border border-teal-100 shadow-sm transition-colors cursor-pointer"
            >
              💻 شغل من البيت برمجيات
            </button>
          </div>
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
          <p className="text-xs text-slate-500 animate-pulse">{isRtl ? "جاري تصفية وجلب أحدث الوظائف المسجلة كل 6 ساعات..." : "Updating postings indexing live caches..."}</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-sans">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-slate-50 border p-12 rounded-2xl text-center text-slate-500 text-sm space-y-2">
          <p>{t.noJobs}</p>
          <button
            onClick={() => searchJobs("", "")}
            className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isRtl ? "إعادة تحميل الكل" : "Reset Filters"}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border hover:border-indigo-100 hover:shadow-md transition-all rounded-2xl p-6 relative flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Side Info */}
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-md font-bold text-slate-900">{job.title}</h4>
                  <span className="text-[10pt] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                    {job.company}
                  </span>
                  <span
                    className={`text-[9pt] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      job.type === "remote"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : job.type === "onsite"
                        ? "bg-slate-50 text-slate-600 border"
                        : "bg-blue-50 text-blue-700 border border-blue-100"
                    }`}
                  >
                    {job.type === "remote" ? (isRtl ? "عن بعد" : "Remote") : job.type === "onsite" ? (isRtl ? "حضوري" : "On-site") : (isRtl ? "هجين" : "Hybrid")}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-sans leading-relaxed line-clamp-3 md:line-clamp-2">{job.description}</p>
                
                {/* SMART MATCH CARD V2 */}
                {(() => {
                  const match = getSmartMatch(job);
                  return (
                    <div className="mt-3 bg-indigo-50/45 border border-indigo-100/60 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                          <span className="text-[10px] font-extrabold text-indigo-950 uppercase tracking-wider">
                            {isRtl ? "نظام الترشيح التلقائي والمطابقة المستهدفة" : "AUTO-MATCH & PROFILE RECOMMENDER"}
                          </span>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          match.score > 85 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        }`}>
                          {match.score}% {isRtl ? "تطابق ريادي" : "Aesthetic Fit"}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed font-semibold">
                        {match.explanation}
                      </p>
                      
                      {/* EXPLAINABLE FACTORS */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {match.matchedSkills.slice(0, 3).map((sk, index) => (
                          <span key={index} className="text-[9px] font-bold text-emerald-800 bg-emerald-50/70 border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-0.5">
                            <span className="text-[11px] text-emerald-600">✓</span> {sk}
                          </span>
                        ))}
                        {match.missingSkills.slice(0, 2).map((sk, index) => (
                          <span key={index} className="text-[9px] font-bold text-indigo-800 bg-indigo-50/70 border border-indigo-100 px-2 py-0.5 rounded flex items-center gap-0.5">
                            <span className="text-[10px] text-indigo-500">📍</span> {isRtl ? `توصية لـ ATS: ${sk}` : `ATS Recommendation: ${sk}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-slate-500 font-sans text-xs">
                  <span className="flex items-center gap-1">📍 {job.location}</span>
                  {job.salary && <span className="flex items-center gap-1">💵 {job.salary}</span>}
                  <span>⏱️ {t.sourcePlatform}: <strong className="text-slate-700">{job.source}</strong></span>
                </div>
              </div>

              {/* Right Side action items */}
              <div className="flex shrink-0 gap-2 flex-row md:flex-col pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 items-end">
                <button
                  onClick={() => onTailorTrigger(job)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.tailorThis}</span>
                </button>
                <a
                  href={job.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center text-center"
                >
                  <span>{t.applyNow}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
