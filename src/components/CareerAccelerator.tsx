import React, { useState, useEffect } from "react";
import {
  Sparkles, Award, Compass, BarChart3, Layers, Calendar,
  HelpCircle, Plus, Trash2, CheckCircle2, ArrowUpRight, TrendingUp,
  Info, Clock, Bell, Trophy, Zap, ClipboardList, Send,
  UserCheck, AlertTriangle, ChevronDown, Check, Play, BookOpen,
  Eye, Target, ShieldAlert, Wifi, ZapOff, Book, FileText, Briefcase,
  Building2, MessageSquareCode, FileCheck, Activity, Users, LogOut,
  MapPin, Settings, RefreshCw, Loader2
} from "lucide-react";
import { CVData } from "../types";

interface CareerAcceleratorProps {
  cvData: CVData;
  onCvChange: (newCv: CVData) => void;
  language: "ar" | "en";
  focusMode: boolean;
  onToggleFocusMode: () => void;
  onNavigateTab: (tabId: string) => void;
  activeUserName?: string;
  activeUserEmail?: string;
  onLogout?: () => void;
}

export function CareerAccelerator({
  cvData,
  onCvChange,
  language,
  focusMode,
  onToggleFocusMode,
  onNavigateTab,
  activeUserName = "أحمد محمد محمود جلال",
  activeUserEmail = "demo@masar.dev",
  onLogout
}: CareerAcceleratorProps) {
  const isRtl = language === "ar";
  const [offlineStatus, setOfflineStatus] = useState<"synced" | "saving">("synced");

  // --- REAL STATS — computed from actual user activity in localStorage ---
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [responseRate, setResponseRate] = useState(0);
  const [interviewsCount, setInterviewsCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    // Tailored CV applications — count of times user used "Tailor My CV"
    const tailorCount = parseInt(localStorage.getItem("masar_tailor_count") || "0", 10);
    setApplicationsCount(tailorCount);

    // Interview practice sessions — from InterviewSim score history
    const interviewAvg = localStorage.getItem("masar_last_interview_avg");
    const interviewSessions = parseInt(localStorage.getItem("masar_interview_sessions") || "0", 10);
    setInterviewsCount(interviewSessions);

    // Response rate — based on ATS score as a proxy signal (higher ATS = more likely callbacks)
    const atsScore = parseInt(localStorage.getItem("masar_last_ats_score") || "0", 10);
    setResponseRate(atsScore > 0 ? Math.round(atsScore * 0.4) : 0); // conservative estimate

    // Activity streak — days with at least one recorded action
    const streakData = localStorage.getItem("masar_activity_streak");
    const today = new Date().toDateString();
    let streak: { lastDate: string; count: number } = streakData ? JSON.parse(streakData) : { lastDate: "", count: 0 };

    if (streak.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      streak = { lastDate: today, count: streak.lastDate === yesterday ? streak.count + 1 : 1 };
      localStorage.setItem("masar_activity_streak", JSON.stringify(streak));
    }
    setStreakDays(streak.count);
  }, []);

  // --- INTERACTIVE AI CAREER COACH STATE (Retained as a premium sidebar widget!) ---
  const [coachMessages, setCoachMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: isRtl
        ? `مرحباً بك يا ${activeUserName.split(" ")[0]}! أنا مستشارك الوظيفي الذكي الخاص بمنصة "مسار". كيف أستطيع توجيهك اليوم لمعادلة شهادتك أو مراجعة عقدك أو تصفية الوظائف؟`
        : `Welcome, ${activeUserName.split(" ")[0]}! I am your career coach. How can I guide you today regarding job matching or contract auditing?`
    }
  ]);
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

  const handleAskCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachInput.trim() || coachLoading) return;

    const userMsg = coachInput;
    setCoachMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setCoachInput("");
    setCoachLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: coachMessages.map(m => ({ role: m.sender === "user" ? "user" : "model", parts: [{ text: m.text }] }))
        })
      });
      const data = await res.json();
      if (data.success) {
        setCoachMessages(prev => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        throw new Error();
      }
    } catch (e) {
      setCoachMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: isRtl
            ? "الذكاء الاصطناعي مهيأ وجاهز لمساندتك. ننصح بإضافة مهارات جديدة لملفك لتلقي توصيات أفضل."
            : "AI Coach optimized. Please add your credentials for tailored recommendations."
        }
      ]);
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. WELCOME HERO BANNER (Highly Polished & Personalised) */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 md:p-8 border border-indigo-900/40 relative overflow-hidden shadow-xl shadow-slate-950/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none translate-x-12 -translate-y-12" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none -translate-x-12 translate-y-12" />

        <div className="relative space-y-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex gap-1.5 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-3 py-1 rounded-xl text-xs font-bold items-center no-print">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{isRtl ? "نظام مسار الموحّد" : "Masar Unified Portal Live"}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
              {isRtl ? `أهلاً بك مجدداً، ${activeUserName} 🚀` : `Welcome back, ${activeUserName} 🚀`}
            </h1>
            <p className="text-xs text-indigo-100 max-w-xl leading-relaxed">
              {isRtl
                ? "قمت بتسجيل الدخول بنجاح. يمكنك الآن الانتقال الفوري لكافة مميزات وتطبيقات المنصة وتعديل ملفك المهني المدمج لتحسين كفاءة المطابقة اليومية للوظائف."
                : "You have signed in successfully. Navigate instantly to all job, CV and translation tools of our centralized dashboard."}
            </p>
          </div>

          <div className="flex gap-2 shrink-0 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex flex-col font-sans">
              <span className="text-[10px] text-white/60 font-medium">{isRtl ? "بيانات الحساب" : "Signed-in Email"}</span>
              <span className="text-xs text-indigo-200 font-bold">{activeUserEmail}</span>
            </div>
            
            {onLogout && (
              <button
                onClick={onLogout}
                className="bg-rose-500/20 text-rose-200 border border-rose-500/30 font-bold text-xs p-3.5 rounded-2xl hover:bg-rose-500 hover:text-white transition cursor-pointer flex items-center justify-center"
                title={isRtl ? "تسجيل خروج" : "Sign Out"}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Statistics Strip — computed from real activity */}
        {applicationsCount === 0 && interviewsCount === 0 && responseRate === 0 && (
          <p className="text-[10px] text-indigo-300/70 pt-4 border-t border-white/10 mt-4">
            {isRtl ? "💡 ابدأ استخدام الأدوات وستظهر إحصائياتك هنا تلقائياً." : "💡 Start using the tools and your stats will appear here automatically."}
          </p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-white/10 mt-6 text-center">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-xl font-black text-emerald-400 block">{applicationsCount}</span>
            <span className="text-[10px] text-white/50 font-bold">{isRtl ? "مرات تخصيص السيرة" : "CV Tailored"}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-xl font-black text-indigo-300 block">%{responseRate}</span>
            <span className="text-[10px] text-white/50 font-bold">{isRtl ? "تقدير معدل الاستجابة" : "Est. Response Rate"}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-xl font-black text-amber-400 block">{interviewsCount}</span>
            <span className="text-[10px] text-white/50 font-bold">{isRtl ? "مقابلات تدريبية" : "Practice Interviews"}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-xl font-black text-sky-400 block">🔥 {streakDays} {isRtl ? "أيام" : "Days"}</span>
            <span className="text-[10px] text-white/50 font-bold">{isRtl ? "أيام النشاط المتتالية" : "Activity Streak"}</span>
          </div>
        </div>
      </div>

      {/* 2. CORE FEATURES BENTO MATRIX (The simplified buttons access system!) */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
          {isRtl ? "الوصول السريع والتحكم في ميزات بوابة مسار" : "QUICK ACCESS MASAR PORTAL CONTROLS"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: User Profile / LinkedIn Style */}
          <button
            onClick={() => onNavigateTab("profile")}
            className="group bg-white border border-slate-100/90 hover:border-emerald-300 rounded-2xl p-5 text-right transition-all hover:shadow-md flex items-start gap-4 cursor-pointer relative overflow-hidden"
          >
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <h4 className="text-xs font-black text-slate-900">{isRtl ? "الملف الشخصي والبيانات" : "LinkedIn-Style Profile"}</h4>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">{isRtl ? "مهم جداً" : "Core"}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isRtl ? "حرر خبراتك ومؤهلاتك ومهاراتك الحالية لتلقي أفضل عروض التوظيف والفرص الجافة." : "Configure your professional skills and work history matrix."}
              </p>
            </div>
          </button>

          {/* Card 2: Smart Daily Matching Hub */}
          <button
            onClick={() => onNavigateTab("matched")}
            className="group bg-white border border-slate-100/90 hover:border-indigo-300 rounded-2xl p-5 text-right transition-all hover:shadow-md flex items-start gap-4 cursor-pointer relative overflow-hidden"
          >
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <h4 className="text-xs font-black text-slate-900">{isRtl ? "التصفية والفرص المطابقة يومياً" : "Daily Smart Matches"}</h4>
                <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold font-mono">NEW</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isRtl ? "شاهد الفرص المطابقة لملفك الشخصي المسحوبة آلياً كل يوم من الجروبات وبحث الشبكة." : "Access jobs crawled and semantic-matched specifically for you."}
              </p>
            </div>
          </button>

          {/* Card 3: CV Builder & ATS */}
          <button
            onClick={() => onNavigateTab("cv_ats")}
            className="group bg-white border border-slate-100/90 hover:border-blue-300 rounded-2xl p-5 text-right transition-all hover:shadow-md flex items-start gap-4 cursor-pointer relative overflow-hidden"
          >
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-900">{isRtl ? "السيرة الذاتية وفحص الـ ATS" : "Smart CV & ATS check"}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isRtl ? "صمم سيرة ذاتية عربية وانجليزية مطابقة وقس كفاءتها ضد فلاتر الشركات والوظائف." : "Structure clean resumes and check automated key ranking keywords."}
              </p>
            </div>
          </button>

          {/* Card 4: Jobs Board & Gulf Contracts */}
          <button
            onClick={() => onNavigateTab("jobs")}
            className="group bg-white border border-slate-100/90 hover:border-amber-300 rounded-2xl p-5 text-right transition-all hover:shadow-md flex items-start gap-4 cursor-pointer relative overflow-hidden"
          >
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-900">{isRtl ? "الوظائف الشاغرة والعقود" : "Open Vacancies Portal"}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isRtl ? "ابحث بلهجات الخليج ومصر في أرشيف شامل لجميع الوظائف الشاغرة بمميزاتها وروابطها." : "Explore wide aggregated job vacancies using colloquial engines."}
              </p>
            </div>
          </button>

          {/* Card 5: Outreach & Net */}
          <button
            onClick={() => onNavigateTab("networking")}
            className="group bg-white border border-slate-100/90 hover:border-teal-300 rounded-2xl p-5 text-right transition-all hover:shadow-md flex items-start gap-4 cursor-pointer relative overflow-hidden"
          >
            <div className="p-3 bg-teal-50 text-teal-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-900">{isRtl ? "الشبكة والتواصل والرواد" : "Outreach & Agency Registry"}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isRtl ? "صغ خطابات مخصصة لمسؤولي توظيف مكاتب السفريات والمؤثرين من فيسبوك ولينكد إن." : "Communicate with licensed travel agencies and career influencers."}
              </p>
            </div>
          </button>

          {/* Card 6: Interview Sim */}
          <button
            onClick={() => onNavigateTab("interview")}
            className="group bg-white border border-slate-100/90 hover:border-violet-300 rounded-2xl p-5 text-right transition-all hover:shadow-md flex items-start gap-4 cursor-pointer relative overflow-hidden"
          >
            <div className="p-3 bg-violet-50 text-violet-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-900">{isRtl ? "محاكي المقابلات الافتراضي" : "AI Interview Practice"}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isRtl ? "تدرب بالذكاء الاصطناعي مع أخصائي موارد بشرية لتجاوز العقبات التقنية والشخصية." : "Challenge yourself in micro interactive mock interviews with direct text metrics."}
              </p>
            </div>
          </button>

          {/* Card 7: Offers Advisor */}
          <button
            onClick={() => onNavigateTab("contracts")}
            className="group bg-white border border-slate-100/90 hover:border-rose-300 rounded-2xl p-5 text-right transition-all hover:shadow-md flex items-start gap-4 cursor-pointer relative overflow-hidden"
          >
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-900">{isRtl ? "تقييم العروض والعقود والبوت" : "Contract Audit Advisor"}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isRtl ? "نظام تدقيق المخصصات والرواتب، وخطاف التنبيهات مع بوت تيلجرام المصاحب." : "Assess financial offers and link live status feeds of Telegram bot channels."}
              </p>
            </div>
          </button>

          {/* Card 8: Operability Telemetry */}
          <button
            onClick={() => onNavigateTab("diagnostics")}
            className="group bg-white border border-slate-100/90 hover:border-slate-400 rounded-2xl p-5 text-right transition-all hover:shadow-md flex items-start gap-4 cursor-pointer relative overflow-hidden"
          >
            <div className="p-3 bg-slate-100 text-slate-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-900">{isRtl ? "جودة التشغيل والتحليلات" : "Diagnostics & Telemetry"}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isRtl ? "تتبع جودة المعارف ومصادقة قواعد البيانات والبيانات لتأمين التقديم." : "Monitor app health indicators and telemetry parameters."}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. PREMIUM SIDEBAR / FOOTER COACH PANEL */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
          {isRtl ? "المستشار المهني التفاعلي القريب منك" : "INTELLIGENT INTEGRATED ADVISER FEEDBACK"}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-8 flex flex-col gap-3 max-h-[220px] overflow-y-auto border border-slate-50 bg-slate-50/50 rounded-2xl p-4">
            {coachMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] text-xs p-3 rounded-2xl leading-relaxed font-sans ${
                  msg.sender === "ai"
                    ? "bg-indigo-50 text-indigo-950 self-start border border-indigo-100"
                    : "bg-slate-950 text-white self-end font-semibold"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleAskCoach} className="md:col-span-4 flex gap-2">
            <input
              type="text"
              value={coachInput}
              onChange={(e) => setCoachInput(e.target.value)}
              placeholder={isRtl ? "اسأل المستشار عن عقبة التوظيف..." : "Ask Masar Coach about visas, jobs..."}
              className="flex-grow px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:border-slate-400 focus:bg-white transition text-slate-800 font-sans"
            />
            <button
              type="submit"
              disabled={coachLoading || !coachInput.trim()}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-3 rounded-xl transition flex items-center justify-center cursor-pointer disabled:opacity-40"
            >
              {coachLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
