import React, { useState, useEffect } from "react";
import {
  Briefcase,
  FileText,
  MessageSquareCode,
  Building2,
  TrendingUp,
  Plus,
  Trash2,
  Printer,
  Copy,
  Upload,
  Languages,
  Sparkles,
  Loader2,
  FileJson,
  FileCheck,
  Undo2,
  Home,
  User,
  Users,
  Activity,
  Brain,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles as SparklesIcon
} from "lucide-react";

import { CVData, Job } from "./types";
import { translations } from "./utils/translations";
import { ResumePreview } from "./components/ResumePreview";
import { JobsBoard } from "./components/JobsBoard";
import { AtsChecker } from "./components/AtsChecker";
import { InterviewSim } from "./components/InterviewSim";
import { AgenciesRegistry } from "./components/AgenciesRegistry";
import { BotDashboard } from "./components/BotDashboard";
import { OutreachPitcher } from "./components/OutreachPitcher";
import { ContractAdvisor } from "./components/ContractAdvisor";
import { CareerAccelerator } from "./components/CareerAccelerator";
import { AuthScreen } from "./components/AuthScreen";
import { UserProfile } from "./components/UserProfile";
import { SmartMatchingHub } from "./components/SmartMatchingHub";
import { telemetry } from "./utils/telemetry";
import { DiagnosticsPanel } from "./components/DiagnosticsPanel";
import { MasarJourneyHome } from "./components/MasarJourneyHome";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { MasarCoach } from "./components/MasarCoach";

const DEFAULT_CV_AR: CVData = {
  personal: {
    name: "أحمد محمد محمود جلال",
    title: "محاسب مالي أول",
    email: "ahmed.galal@example.com",
    phone: "+20 102 345 6789",
    location: "القاهرة الجديدة، مصر",
    website: "linkedin.com/in/ahmed-galal-rec",
    summary: "محاسب مالـي خبرة ٥ سنوات في تمويل الشركات وإعداد القوائم الختامية والميزانيات العمومية. مهارة عالية في ضبط حسابات المخازن، التخطيط الضريبي والتأكد من الامتثال المالي الكامل. أسعى لتسخير خبرة العمل على أنظمة ERP والمهارات التحليلية للمساهمة في تعزيز الكفاءات التشغيلية بالشركة."
  },
  experience: [
    {
      id: "exp-1",
      company: "شركة النيل للتجارة والاستثمار",
      role: "محاسب مالي أول",
      duration: "2023 - الآن",
      description: "• قيادة عمليات إقفال الحسابات الشهرية والسنوية والتسويات البنكية لأكثر من ٧ فروع.\n• إعداد القوائم المالية الأساسية والتدفقات النقدية وفقاً للمعايير المصرية والدولية.\n• تصميم نموذج جرد رقمي للمخازن وفر الكثير من الوقت وحَمى الأصول من الفاقد."
    },
    {
      id: "exp-2",
      company: "أوراسكوم للانشاءات",
      role: "محاسب تكاليف ومواقع",
      duration: "2021 - 2023",
      description: "• مراقبة تكلفة الخامات وساعات عمل المهندسين في المواقع الإنشائية الكبرى.\n• مراجعة مطالبات المقاولين من الباطن وصرف مستحقاتهم حسب الجداول الزمنية.\n• العمل المباشر كحلقة وصل بين الإدارة المالية ومواقع التنفيذ."
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "جامعة عين شمس - كلية التجارة",
      degree: "بكالوريوس محاسبة بتقدير عام جيد جداً",
      duration: "2017 - 2021"
    }
  ],
  projects: [
    {
      id: "pro-1",
      title: "أتمتة محاسبة الفروع بمصر",
      description: "تطوير ودمج خط ربط حسابات الفروع بالإدارة الرئيسية عبر واجهات ذكية، مما قلل وقت التسوية بنسبة ٤٠٪.",
      technologies: "Odoo ERP, MS Excel Advanced"
    }
  ],
  languages: [
    { id: "lang-1", name: "العربية", level: "اللغة الأم" },
    { id: "lang-2", name: "الإنجليزية", level: "مستوى جيد جداً" }
  ],
  skills: ["التحليل المالي", "تخطيط الميزانيات", "برمجيات ERP Odoo", "محاسبة التكاليف", "التسوية الضريبية", "مهارات الإكسيل المتقدمة"],
  selectedTemplate: "classic"
};

const DEFAULT_CV_EN: CVData = {
  personal: {
    name: "Ahmed Mohamed Galal",
    title: "Senior Financial Accountant",
    email: "ahmed.galal@example.com",
    phone: "+20 102 345 6789",
    location: "New Cairo, Egypt",
    website: "linkedin.com/in/ahmed-galal-rec",
    summary: "Dedicated Senior Accountant with 5+ years of experience in corporate finance, ledger reconciliations, cost monitoring, and tax compliance. Highly skilled in deploying enterprise Odoo ERP frameworks to streamline inter-departmental books."
  },
  experience: [
    {
      id: "exp-1",
      company: "Nile Trade & Investment Group",
      role: "Senior Accountant",
      duration: "2023 - Present",
      description: "- Engineered monthly and annual general ledger reconciliations for over 7 busy distribution sites.\n- Drafted detailed financial statements and cash flow audits complying with global GAAP specs.\n- Boosted stock checking accuracy by 25% by automating warehouse logging sheets."
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "Ain Shams University",
      degree: "B.Sc. in Commerce (Major in Accounting), Excellent Grade",
      duration: "2017 - 2021"
    }
  ],
  projects: [
    {
      id: "pro-1",
      title: "Consolidated Branch ERP Migration",
      description: "Led branch accounts consolidation during major integration, reducing closing delays by 40%.",
      technologies: "Odoo ERP, MS Excel Macros, SQL pivots"
    }
  ],
  languages: [
    { id: "lang-1", name: "Arabic", level: "Native Speed" },
    { id: "lang-2", name: "English", level: "Conversational/Business" }
  ],
  skills: ["Financial Analysis", "Budget Planning", "Cost Accounting", "Odoo ERP Framework", "GAAP Standard Auditor", "Advanced MS Excel Macros"],
  selectedTemplate: "classic"
};

// ─── NAV ITEMS (single source of truth) ──────────────────────
const NAV_ITEMS = (isRtl: boolean) => [
  { id: "home",        label: isRtl ? "الرئيسية"          : "Home",          icon: Home },
  { id: "profile",     label: isRtl ? "ملفي الشخصي"      : "My Profile",    icon: User },
  { id: "cv_ats",      label: isRtl ? "السيرة الذاتية"   : "CV Builder",    icon: FileText },
  { id: "networking",  label: isRtl ? "التوظيف والتواصل" : "Networking",    icon: Building2 },
  { id: "jobs",        label: isRtl ? "الوظائف"          : "Jobs",          icon: Briefcase },
  { id: "matched",     label: isRtl ? "مطابقة الوظائف"   : "Smart Match",   icon: Users },
  { id: "interview",   label: isRtl ? "المقابلات"        : "Interviews",    icon: MessageSquareCode },
  { id: "accelerator", label: isRtl ? "مسرّع المسار"     : "Accelerator",   icon: Activity },
  { id: "contracts",   label: isRtl ? "فحص العقود"       : "Contracts",     icon: FileCheck },
  { id: "coach",        label: isRtl ? "مرشد المسار"        : "My Coach",       icon: Brain },
  { id: "diagnostics", label: isRtl ? "الإعدادات"        : "Settings",      icon: Settings },
];

export default function App() {
  const [language, setLanguage]         = useState<"ar" | "en">("ar");
  const [activeTab, setActiveTab]       = useState<string>("home");
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [activeUser, setActiveUser] = useState<{ id: string; email: string; name: string; profile: any } | null>(() => {
    const saved = localStorage.getItem("masar_active_user");
    if (saved) { try { return JSON.parse(saved); } catch { return null; } }
    return null;
  });

  const handleAuthSuccess = (user: any) => {
    setActiveUser(user);
    localStorage.setItem("masar_active_user", JSON.stringify(user));
    if (user.profile) handleSyncToCV(user.profile);
    // Show onboarding only for first-time users
    const seen = localStorage.getItem(`masar_onboarded_${user.id}`);
    if (!seen) setShowOnboarding(true);
    else setActiveTab("home");
  };

  const handleOnboardingDone = (tabId: string, subTab?: string) => {
    if (activeUser) localStorage.setItem(`masar_onboarded_${activeUser.id}`, "1");
    setShowOnboarding(false);
    navigate(tabId, subTab);
  };

  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem("masar_active_user");
    setShowOnboarding(false);
    setActiveTab("home");
  };

  const handleProfileUpdated = (updatedProfile: any) => {
    if (activeUser) {
      const updatedUser = { ...activeUser, profile: updatedProfile };
      setActiveUser(updatedUser);
      localStorage.setItem("masar_active_user", JSON.stringify(updatedUser));
    }
  };

  const handleSyncToCV = (profile: any) => {
    const mappedCv: CVData = {
      personal: {
        name: profile.personal?.name || "",
        title: profile.personal?.title || "",
        email: profile.personal?.email || "",
        phone: profile.personal?.phone || "",
        location: profile.personal?.location || "",
        website: profile.personal?.website || "",
        summary: profile.personal?.summary || ""
      },
      experience: profile.experience || [],
      education: profile.education || [],
      projects: profile.projects || [],
      languages: profile.languages || [],
      skills: profile.skills || [],
      selectedTemplate: "classic"
    };
    setCvData(mappedCv);
    localStorage.setItem("masar_cv_v1_ar", JSON.stringify(mappedCv));
  };

  // Sub-tab states
  const [cvSubTab, setCvSubTab]             = useState<"edit" | "ats">("edit");
  const [netSubTab, setNetSubTab]           = useState<"pitcher" | "agencies" | "influencers">("pitcher");
  const [contractsSubTab, setContractsSubTab] = useState<"audit" | "telegram">("audit");

  // Focus mode
  const [focusMode, setFocusMode] = useState(() => localStorage.getItem("masar_focus_mode") === "true");
  const handleToggleFocusMode = () => {
    const next = !focusMode;
    setFocusMode(next);
    localStorage.setItem("masar_focus_mode", String(next));
  };

  useEffect(() => {
    focusMode ? telemetry.startFocusTracking() : telemetry.stopFocusTracking();
  }, [focusMode]);

  // CV state
  const [cvData, setCvData] = useState<CVData>(() => {
    const saved = localStorage.getItem("masar_cv_v1_ar");
    return saved ? JSON.parse(saved) : DEFAULT_CV_AR;
  });

  const [influencers, setInfluencers]             = useState<any[]>([]);
  const [influencersLoading, setInfluencersLoading] = useState(false);
  const [atsCvText, setAtsCvText]                 = useState("");
  const [atsJd, setAtsJd]                         = useState("");
  const [tailorJdText, setTailorJdText]           = useState("");
  const [tailoringLoading, setTailoringLoading]   = useState(false);
  const [tailorSuccess, setTailorSuccess]         = useState("");

  const t = translations[language];
  const isRtl = language === "ar";

  useEffect(() => {
    telemetry.logEvent(`Navigated to Tab: ${activeTab}`, "navigation", `User switched to: ${activeTab}`);
  }, [activeTab]);

  const [lastSavedTime, setLastSavedTime] = useState("");
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  useEffect(() => {
    if (cvData) {
      telemetry.pushCvState(cvData);
      setIsDraftSaving(true);
      const timer = setTimeout(() => {
        setIsDraftSaving(false);
        setLastSavedTime(new Date().toLocaleTimeString());
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [cvData]);

  const handleUndo = () => { const res = telemetry.undo(cvData); if (res) setCvData(res.previous); };
  const handleRedo = () => { const res = telemetry.redo(cvData); if (res) setCvData(res.next); };

  useEffect(() => {
    localStorage.setItem(`masar_cv_v1_${language}`, JSON.stringify(cvData));
  }, [cvData, language]);

  const toggleLanguage = () => {
    const next = language === "ar" ? "en" : "ar";
    setLanguage(next);
    const saved = localStorage.getItem(`masar_cv_v1_${next}`);
    setCvData(saved ? JSON.parse(saved) : (next === "ar" ? DEFAULT_CV_AR : DEFAULT_CV_EN));
  };

  const fetchInfluencers = async () => {
    setInfluencersLoading(true);
    try {
      const res = await fetch("/api/influencers");
      const data = await res.json();
      if (data.success) setInfluencers(data.posts || []);
    } catch (err) { console.error(err); }
    finally { setInfluencersLoading(false); }
  };

  useEffect(() => { if (activeTab === "influencers") fetchInfluencers(); }, [activeTab]);

  // CV CRUD
  const handlePersonalChange = (field: string, value: string) =>
    setCvData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));

  const addExperience = () => setCvData(prev => ({ ...prev, experience: [...prev.experience, { id: `exp-${Date.now()}`, company: "", role: "", duration: "", description: "" }] }));
  const removeExperience = (id: string) => setCvData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  const updateExperience = (id: string, field: string, value: string) => setCvData(prev => ({ ...prev, experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e) }));

  const addEducation = () => setCvData(prev => ({ ...prev, education: [...prev.education, { id: `edu-${Date.now()}`, institution: "", degree: "", duration: "", details: "" }] }));
  const removeEducation = (id: string) => setCvData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  const updateEducation = (id: string, field: string, value: string) => setCvData(prev => ({ ...prev, education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e) }));

  const addProject = () => setCvData(prev => ({ ...prev, projects: [...prev.projects, { id: `proj-${Date.now()}`, title: "", description: "", technologies: "" }] }));
  const removeProject = (id: string) => setCvData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  const updateProject = (id: string, field: string, value: string) => setCvData(prev => ({ ...prev, projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p) }));

  const addLanguageNode = () => setCvData(prev => ({ ...prev, languages: [...prev.languages, { id: `lang-${Date.now()}`, name: "", level: "" }] }));
  const removeLanguageNode = (id: string) => setCvData(prev => ({ ...prev, languages: prev.languages.filter(l => l.id !== id) }));
  const updateLanguageNode = (id: string, field: string, value: string) => setCvData(prev => ({ ...prev, languages: prev.languages.map(l => l.id === id ? { ...l, [field]: value } : l) }));
  const handleSkillsChange = (val: string) => setCvData(prev => ({ ...prev, skills: val.split(/[,,،\n]/).map(s => s.trim()).filter(Boolean) }));

  const exportJsonBackup = () => {
    const blob = new Blob([JSON.stringify(cvData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `masar_cv_backup_${language}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed?.personal) { setCvData(parsed); alert(isRtl ? "تم استعادة النسخة بنجاح!" : "Backup restored!"); }
      } catch { alert("Invalid JSON format."); }
    };
    reader.readAsText(file);
  };

  const triggerTailorFromJob = (job: Job) => {
    setTailorJdText(`مطلوب الشغل بـ: ${job.title}\nالشركة: ${job.company}\nالتوصيف والمهام المطلوبة:\n${job.description}`);
    setAtsJd(job.description);
    const expText = cvData.experience.map(e => `${e.role} at ${e.company}:${e.description}`).join("\n");
    setAtsCvText(`Name: ${cvData.personal.name}\nTitle: ${cvData.personal.title}\nSummary: ${cvData.personal.summary}\nExperience:\n${expText}\nSkills: ${cvData.skills.join(", ")}`);
    setActiveTab("cv_ats");
  };

  const executeAiTailoring = async () => {
    if (!tailorJdText.trim()) return;
    setTailoringLoading(true);
    setTailorSuccess("");
    try {
      const res = await fetch("/api/cv/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData, jobDescription: tailorJdText })
      });
      const data = await res.json();
      if (data.success) {
        setCvData(prev => ({ ...prev, personal: { ...prev.personal, summary: data.tailoredSummary || prev.personal.summary }, skills: data.tailoredSkills || prev.skills }));
        setTailorSuccess(isRtl ? "✨ تم تخصيص الملخص والمهارات بالذكاء الاصطناعي بنجاح!" : "✨ Summary and skills updated with AI successfully!");
      }
    } catch (err) { console.error(err); }
    finally { setTailoringLoading(false); }
  };

  const copyPlaintextSummary = () => {
    const expText = cvData.experience.map(e => `- ${e.role} @ ${e.company} (${e.duration})\n  ${e.description}`).join("\n\n");
    const eduText = cvData.education.map(ed => `- ${ed.degree} @ ${ed.institution} (${ed.duration})`).join("\n");
    const text = `=== ${cvData.personal.name} ===\n${cvData.personal.title}\n✉️ ${cvData.personal.email} | 📞 ${cvData.personal.phone}\n📍 ${cvData.personal.location}\n\n--- SUMMARY ---\n${cvData.personal.summary}\n\n--- EXPERIENCE ---\n${expText}\n\n--- EDUCATION ---\n${eduText}\n\n--- SKILLS ---\n${cvData.skills.join(" • ")}`.trim();
    navigator.clipboard.writeText(text);
    alert(isRtl ? "تم نسخ السيرة النصية بنجاح!" : "Plain CV text copied!");
  };

  const navItems = NAV_ITEMS(isRtl);

  const navigate = (tabId: string, subTab?: string) => {
    setActiveTab(tabId);
    if (subTab) {
      if (tabId === "cv_ats") setCvSubTab(subTab as any);
      if (tabId === "networking") setNetSubTab(subTab as any);
      if (tabId === "contracts") setContractsSubTab(subTab as any);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{background:"#f8f9fc"}}>

      {/* ─── TOP HEADER ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 masar-glass border-b border-white/60 no-print" style={{borderBottom:"1px solid rgba(226,232,240,0.8)"}}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">

          {/* Brand */}
          <button onClick={() => activeUser && navigate("home")}
            className="flex items-center gap-2.5 shrink-0 group">
            <div className="p-2 rounded-xl transition" style={{background:"linear-gradient(135deg,#6366f1,#4f46e5)",boxShadow:"0 2px 8px rgba(99,102,241,0.35)"}}>
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition tracking-tight">
                {isRtl ? "مسار المهنية" : "Masar Career"}
              </span>
              <span className="block text-[9px] text-slate-400">{isRtl ? "بوابة العبور الوظيفي" : "Unified Outplacement Gateway"}</span>
            </div>
          </button>

          {/* Right controls */}
          {activeUser && (
            <div className="flex items-center gap-2">
              <button onClick={toggleLanguage}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition">
                <Languages className="w-3.5 h-3.5" />
                {t.langToggle}
              </button>
              {activeUser && <>
              <button onClick={() => setIsPricingOpen(true)}
                className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition">
                ⚡ {isRtl ? "ترقية" : "Upgrade"}
              </button>
              <button onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition"
                title={isRtl ? "تسجيل خروج" : "Logout"}>
                <LogOut className="w-4 h-4" />
              </button>
              {/* Mobile menu toggle */}
              <button onClick={() => setMobileMenuOpen(v => !v)}
                className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-xl transition">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              </>}
            </div>
          )}
        </div>

        {/* Mobile Drawer Nav */}
        {activeUser && mobileMenuOpen && (
          <div className="md:hidden px-4 py-3 grid grid-cols-2 gap-1.5 masar-glass" style={{borderTop:"1px solid rgba(226,232,240,0.8)"}}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => navigate(item.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${isActive ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* ─── AUTH GATE ───────────────────────────────────────── */}
      {!activeUser ? (
        <main className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center">
          <AuthScreen onAuthSuccess={handleAuthSuccess} language={language} />
        </main>
      ) : showOnboarding ? (
        <OnboardingScreen
          userName={activeUser.profile?.personal?.name || activeUser.name}
          language={language}
          onDone={handleOnboardingDone}
        />
      ) : (
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex gap-6">

          {/* ─── SIDEBAR (desktop only) ───────────────────── */}
          <aside className="hidden md:flex flex-col gap-3 w-52 shrink-0 no-print">
            {/* User card */}
            <div className="masar-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 text-white" style={{background:"linear-gradient(135deg,#6366f1,#4f46e5)"}}>
                {(activeUser.profile?.personal?.name || activeUser.name || "م")[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{activeUser.profile?.personal?.name || activeUser.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{activeUser.email}</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="masar-card overflow-hidden p-1.5 space-y-0.5">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id ||
                  (item.id === "cv_ats" && activeTab === "cv_ats");
                return (
                  <button key={item.id} onClick={() => navigate(item.id)}
                    className={`masar-sidebar-item ${isActive ? "active" : ""}`}>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                    {isActive && <span className="mr-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{background:"#a5b4fc"}} />}
                  </button>
                );
              })}
            </nav>

            {/* Upgrade CTA */}
            <button onClick={() => setIsPricingOpen(true)}
              className="masar-btn masar-btn-primary w-full text-xs font-black py-3">
              ⚡ {isRtl ? "ترقية إلى بلاس" : "Upgrade to Pro"}
            </button>
          </aside>

          {/* ─── MAIN CONTENT ─────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6 pb-20 md:pb-6">

            {activeTab === "home" && (
              <MasarJourneyHome
                language={language} cvData={cvData}
                onNavigateTab={navigate}
                onSyncToCV={handleSyncToCV}
                activeUserName={activeUser?.profile?.personal?.name || activeUser?.name}
                activeUserEmail={activeUser?.email}
              />
            )}

            {activeTab === "accelerator" && (
              <CareerAccelerator
                cvData={cvData} onCvChange={setCvData} language={language}
                focusMode={focusMode} onToggleFocusMode={handleToggleFocusMode}
                onNavigateTab={navigate}
                activeUserName={activeUser?.profile?.personal?.name || activeUser?.name}
                activeUserEmail={activeUser?.email}
                onLogout={handleLogout}
              />
            )}

            {activeTab === "profile" && (
              <UserProfile email={activeUser.email} language={language}
                onProfileUpdated={handleProfileUpdated} onSyncToCV={handleSyncToCV} />
            )}

            {activeTab === "matched" && (
              <SmartMatchingHub email={activeUser.email} language={language} t={t}
                onTailorTrigger={triggerTailorFromJob} cvData={cvData} />
            )}

            {activeTab === "jobs" && (
              <JobsBoard onTailorTrigger={triggerTailorFromJob} language={language} t={t} cvData={cvData} />
            )}

            {/* ─── CV BUILDER ─────────────────────────────── */}
            {activeTab === "cv_ats" && (
              <div className="space-y-5">
                {/* Sub-tab pills */}
                <div className="flex p-1 rounded-2xl max-w-sm" style={{background:"#f1f5f9",border:"1px solid #e8eaf0"}}>
                  {[["edit", isRtl ? "📝 تعديل السيرة" : "📝 Edit & Preview"], ["ats", isRtl ? "🎯 فحص ATS" : "🎯 ATS Check"]].map(([v, l]) => (
                    <button key={v} onClick={() => setCvSubTab(v as any)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${cvSubTab === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}>
                      {l}
                    </button>
                  ))}
                </div>

                {cvSubTab === "edit" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Form */}
                    <div className="lg:col-span-7 space-y-5">

                      {/* AI Tailor */}
                      <div className="rounded-2xl p-5 space-y-3 text-white" style={{background:"linear-gradient(135deg,#1e1b4b,#0f172a)",border:"1px solid rgba(99,102,241,0.2)"}}>
                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> {t.tailorWithAI}
                        </h3>
                        <p className="text-[11px] text-indigo-200 leading-relaxed">{t.summaryAIWarning}</p>
                        <textarea rows={3} value={tailorJdText} onChange={e => setTailorJdText(e.target.value)}
                          placeholder={isRtl ? "الصق التوصيف الوظيفي هنا..." : "Paste targeted JD here..."}
                          className="w-full bg-indigo-900/40 text-xs placeholder-slate-400 border border-indigo-800 focus:border-indigo-400 rounded-xl px-3 py-2.5 outline-none text-white" />
                        {tailorSuccess && <p className="text-emerald-400 text-xs font-semibold">{tailorSuccess}</p>}
                        <div className="flex justify-end">
                          <button onClick={executeAiTailoring} disabled={tailoringLoading || !tailorJdText.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-xs font-black text-white px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition">
                            {tailoringLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{isRtl ? "جاري التخصيص..." : "Processing..."}</> : <><Sparkles className="w-3.5 h-3.5" />{t.tailorBtn}</>}
                          </button>
                        </div>
                      </div>

                      {/* Personal Info */}
                      <div className="masar-card p-5 space-y-5 masar-animate-up">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                          <div className="space-y-1">
                            <h3 className="text-sm font-extrabold text-slate-800">{t.personalInfo}</h3>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold">
                              <span className={`w-1.5 h-1.5 rounded-full ${isDraftSaving ? "bg-amber-400 animate-ping" : "bg-emerald-500 animate-pulse"}`} />
                              <span className={isDraftSaving ? "text-amber-500" : "text-emerald-600"}>
                                {isDraftSaving ? (isRtl ? "جاري الحفظ..." : "Saving...") : lastSavedTime ? (isRtl ? `حُفظ ${lastSavedTime}` : `Saved ${lastSavedTime}`) : (isRtl ? "متزامن" : "Synced")}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <button onClick={handleUndo} disabled={!telemetry.canUndo()}
                              className="text-[10px] px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 border transition disabled:opacity-40 bg-white text-slate-700 hover:bg-slate-50 border-slate-200">
                              <Undo2 className="w-3 h-3" /> {isRtl ? "تراجع" : "Undo"}
                            </button>
                            <button onClick={handleRedo} disabled={!telemetry.canRedo()}
                              className="text-[10px] px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 border transition disabled:opacity-40 bg-white text-slate-700 hover:bg-slate-50 border-slate-200">
                              {isRtl ? "إعادة" : "Redo"}
                            </button>
                            <button onClick={exportJsonBackup}
                              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-200/50">
                              <FileJson className="w-3 h-3" /> {t.backupExport}
                            </button>
                            <label className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-200/50 cursor-pointer">
                              <Upload className="w-3 h-3" /> {t.backupImport}
                              <input type="file" accept=".json" onChange={importJsonBackup} className="hidden" />
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {[["name", t.fullName], ["title", t.jobTitle], ["email", t.email], ["phone", t.phone], ["location", t.location], ["website", t.website]].map(([f, l]) => (
                            <div key={f} className="space-y-1">
                              <label className="font-semibold text-slate-700">{l}</label>
                              <input type="text" value={(cvData.personal as any)[f]} onChange={e => handlePersonalChange(f, e.target.value)}
                                className="masar-input text-xs" />
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">{t.summary}</label>
                          <textarea rows={4} value={cvData.personal.summary} onChange={e => handlePersonalChange("summary", e.target.value)}
                            className="masar-input text-xs" />
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="masar-card p-5 space-y-4 masar-animate-up">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h3 className="text-sm font-extrabold text-slate-800">{t.experience}</h3>
                          <button onClick={addExperience} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> {t.addMore}
                          </button>
                        </div>
                        {cvData.experience.map((exp, idx) => (
                          <div key={exp.id} className="p-4 rounded-xl space-y-3 relative text-xs" style={{background:"#f8f9fc",border:"1px solid #eef0f5"}}>
                            <button onClick={() => removeExperience(exp.id)} className="absolute top-4 left-4 text-rose-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                            <span className="font-bold text-slate-400">#{idx + 1}</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <input value={exp.role} onChange={e => updateExperience(exp.id, "role", e.target.value)} placeholder={isRtl ? "المسمى الوظيفي" : "Role / Title"} className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full" />
                              <input value={exp.company} onChange={e => updateExperience(exp.id, "company", e.target.value)} placeholder={isRtl ? "اسم الشركة" : "Company"} className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input value={exp.duration} onChange={e => updateExperience(exp.id, "duration", e.target.value)} placeholder={isRtl ? "المدة" : "Duration"} className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full" />
                              <input value={exp.location || ""} onChange={e => updateExperience(exp.id, "location", e.target.value)} placeholder={isRtl ? "الموقع" : "Location"} className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full" />
                            </div>
                            <textarea rows={3} value={exp.description} onChange={e => updateExperience(exp.id, "description", e.target.value)} placeholder={isRtl ? "المهام والإنجازات..." : "Responsibilities..."} className="w-full px-3 py-2 bg-white border rounded-lg text-xs outline-none" />
                          </div>
                        ))}
                      </div>

                      {/* Education */}
                      <div className="masar-card p-5 space-y-4 masar-animate-up">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h3 className="text-sm font-extrabold text-slate-800">{t.education}</h3>
                          <button onClick={addEducation} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> {t.addMore}
                          </button>
                        </div>
                        {cvData.education.map((edu, idx) => (
                          <div key={edu.id} className="p-4 rounded-xl space-y-3 relative text-xs" style={{background:"#f8f9fc",border:"1px solid #eef0f5"}}>
                            <button onClick={() => removeEducation(edu.id)} className="absolute top-4 left-4 text-rose-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                            <span className="font-bold text-slate-400">#{idx + 1}</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <input value={edu.institution} onChange={e => updateEducation(edu.id, "institution", e.target.value)} placeholder={isRtl ? "المؤسسة التعليمية" : "School"} className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full" />
                              <input value={edu.degree} onChange={e => updateEducation(edu.id, "degree", e.target.value)} placeholder={isRtl ? "الدرجة والتخصص" : "Degree"} className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input value={edu.duration} onChange={e => updateEducation(edu.id, "duration", e.target.value)} placeholder={isRtl ? "الفترة" : "Duration"} className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full" />
                              <input value={edu.details || ""} onChange={e => updateEducation(edu.id, "details", e.target.value)} placeholder={isRtl ? "التقدير / GPA" : "Details / GPA"} className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Projects */}
                      <div className="masar-card p-5 space-y-4 masar-animate-up">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h3 className="text-sm font-extrabold text-slate-800">{t.projects}</h3>
                          <button onClick={addProject} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> {t.addMore}
                          </button>
                        </div>
                        {cvData.projects.map((proj, idx) => (
                          <div key={proj.id} className="p-4 rounded-xl space-y-3 relative text-xs" style={{background:"#f8f9fc",border:"1px solid #eef0f5"}}>
                            <button onClick={() => removeProject(proj.id)} className="absolute top-4 left-4 text-rose-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                            <span className="font-bold text-slate-400">#{idx + 1}</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <input value={proj.title} onChange={e => updateProject(proj.id, "title", e.target.value)} placeholder={isRtl ? "عنوان المشروع" : "Project Title"} className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full" />
                              <input value={proj.technologies || ""} onChange={e => updateProject(proj.id, "technologies", e.target.value)} placeholder={isRtl ? "التقنيات" : "Technologies"} className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full" />
                            </div>
                            <textarea rows={2} value={proj.description} onChange={e => updateProject(proj.id, "description", e.target.value)} placeholder={isRtl ? "وصف المشروع..." : "Description..."} className="w-full px-3 py-2 bg-white border rounded-lg text-xs outline-none" />
                          </div>
                        ))}
                      </div>

                      {/* Languages */}
                      <div className="masar-card p-5 space-y-4 masar-animate-up">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h3 className="text-sm font-extrabold text-slate-800">{t.languages}</h3>
                          <button onClick={addLanguageNode} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> {t.addMore}
                          </button>
                        </div>
                        {cvData.languages.map((lang, idx) => (
                          <div key={lang.id} className="flex items-center gap-2 text-xs">
                            <button onClick={() => removeLanguageNode(lang.id)} className="text-rose-400 hover:text-rose-600 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                            <input value={lang.name} onChange={e => updateLanguageNode(lang.id, "name", e.target.value)} placeholder={isRtl ? "اللغة" : "Language"} className="flex-1 px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none" />
                            <input value={lang.level} onChange={e => updateLanguageNode(lang.id, "level", e.target.value)} placeholder={isRtl ? "المستوى" : "Level"} className="flex-1 px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none" />
                          </div>
                        ))}
                      </div>

                      {/* Skills */}
                      <div className="masar-card p-5 space-y-4 masar-animate-up">
                        <h3 className="text-sm font-extrabold text-slate-800 border-b pb-2">{t.skills}</h3>
                        <textarea rows={2} defaultValue={cvData.skills.join(", ")} onChange={e => handleSkillsChange(e.target.value)}
                          placeholder={isRtl ? "المهارات مفصولة بفواصل..." : "Skills, separated, by, commas..."}
                          className="masar-input text-xs" />
                        <div className="flex flex-wrap gap-1.5">
                          {cvData.skills.map((tag, i) => <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">{tag}</span>)}
                        </div>
                      </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="lg:col-span-5 space-y-5">
                      <div className="bg-white border rounded-2xl p-4 shadow-xs sticky top-20 z-10 space-y-4 no-print">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">{t.templateChoose}</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[["classic", isRtl ? "كلاسيكي" : "Classic"], ["modern", isRtl ? "حديث" : "Modern"], ["academic", isRtl ? "أكاديمي" : "Academic"]].map(([id, label]) => (
                              <button key={id} onClick={() => setCvData(prev => ({ ...prev, selectedTemplate: id as any }))}
                                className={`py-2 px-1 text-[11px] font-bold rounded-lg text-center transition ${cvData.selectedTemplate === id ? "text-white" : "text-slate-600 hover:bg-slate-50"}`} style={cvData.selectedTemplate === id ? {background:"linear-gradient(135deg,#1e293b,#0f172a)"} : {background:"#f8f9fc",border:"1px solid #e8eaf0"}}>
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 border-t pt-3">
                          <button className="masar-btn masar-btn-dark w-full py-3 text-xs"
                            onClick={() => {
                              if (!cvData.personal?.name?.trim()) {
                                alert(isRtl ? "⚠️ أضف اسمك أولاً قبل الطباعة." : "⚠️ Please add your name before printing.");
                                return;
                              }
                              if (!cvData.experience?.length && !cvData.education?.length) {
                                alert(isRtl ? "⚠️ أضف خبرة أو تعليم واحد على الأقل." : "⚠️ Add at least one experience or education entry.");
                                return;
                              }
                              window.print();
                            }}>
                            <Printer className="w-4 h-4" /> {t.printCv}
                          </button>
                          <button onClick={copyPlaintextSummary} className="masar-btn masar-btn-ghost w-full py-3 text-xs">
                            <Copy className="w-4 h-4 text-slate-400" /> {t.copyPlain}
                          </button>
                        </div>
                      </div>
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xl bg-slate-300 p-2 no-print">
                        <ResumePreview cvData={cvData} language={language} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <AtsChecker language={language} t={t} preFilledCvText={cvData.personal.summary} preFilledJd="" />
                )}
              </div>
            )}

            {activeTab === "interview" && <InterviewSim language={language} t={t} />}

            {/* ─── NETWORKING ─────────────────────────────── */}
            {activeTab === "networking" && (
              <div className="space-y-5">
                <div className="flex p-1 rounded-2xl max-w-md" style={{background:"#f1f5f9",border:"1px solid #e8eaf0"}}>
                  {[["pitcher", isRtl ? "✉️ صانع الرسائل" : "✉️ Outreach"], ["agencies", isRtl ? "🏢 مكاتب التوظيف" : "🏢 Agencies"], ["influencers", isRtl ? "💡 رواد الخليج" : "💡 Influencers"]].map(([v, l]) => (
                    <button key={v} onClick={() => setNetSubTab(v as any)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${netSubTab === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}>
                      {l}
                    </button>
                  ))}
                </div>
                {netSubTab === "pitcher" && <OutreachPitcher cvData={cvData} language={language} />}
                {netSubTab === "agencies" && <AgenciesRegistry language={language} t={t} />}
                {netSubTab === "influencers" && (
                  <div className="bg-white rounded-2xl border p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-3 border-b pb-4">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">{isRtl ? "مستشعر رواد التوظيف" : "Influencer Insights"}</h2>
                        <p className="text-xs text-slate-400">{isRtl ? "محدثة كل ١٢ ساعة" : "Updated every 12 hours"}</p>
                      </div>
                    </div>
                    {influencersLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-slate-400" /></div>
                    ) : influencers.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-xl space-y-2">
                        <p className="text-xs text-slate-500">{isRtl ? "جاري تحميل المقالات..." : "Loading insights..."}</p>
                        <button onClick={fetchInfluencers} className="text-xs text-indigo-600 font-bold underline">{isRtl ? "تحديث الآن" : "Refresh"}</button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {influencers.map(post => (
                          <div key={post.id} className="border rounded-2xl p-4 space-y-2 bg-slate-50/30 hover:border-slate-300 transition">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${post.avatarColor}`}>{post.name[0]}</div>
                                <div>
                                  <p className="font-bold text-slate-800">{post.name}</p>
                                  <p className="text-[10px] text-slate-400">{post.handle}</p>
                                </div>
                              </div>
                              <span className="text-[10px] bg-slate-100 border text-slate-500 px-2 py-0.5 rounded-lg font-bold uppercase">{post.platform}</span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">{post.content}</p>
                            <p className="text-[10px] text-slate-400 text-left">{post.timeLabel}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ─── CONTRACTS ──────────────────────────────── */}
            {activeTab === "contracts" && (
              <div className="space-y-5">
                <div className="flex p-1 rounded-2xl max-w-sm" style={{background:"#f1f5f9",border:"1px solid #e8eaf0"}}>
                  {[["audit", isRtl ? "📜 فحص العقود" : "📜 Contract Audit"], ["telegram", isRtl ? "🤖 بوت التنبيهات" : "🤖 Bot Node"]].map(([v, l]) => (
                    <button key={v} onClick={() => setContractsSubTab(v as any)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${contractsSubTab === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}>
                      {l}
                    </button>
                  ))}
                </div>
                {contractsSubTab === "audit" && <ContractAdvisor language={language} />}
                {contractsSubTab === "telegram" && <BotDashboard language={language} t={t} />}
              </div>
            )}

            {activeTab === "coach" && (
              <MasarCoach
                cvData={cvData}
                language={language}
                userName={activeUser?.profile?.personal?.name || activeUser?.name}
              />
            )}

            {activeTab === "diagnostics" && (
              <DiagnosticsPanel language={language} cvData={cvData}
                onResetCv={() => setCvData({ personal: { name: "", title: "", email: "", phone: "", location: "", website: "", summary: "" }, experience: [], education: [], projects: [], languages: [], skills: [], selectedTemplate: "classic" })}
                onAutofillDemo={() => setCvData(language === "ar" ? DEFAULT_CV_AR : DEFAULT_CV_EN)} />
            )}
          </div>
        </main>
      )}

      {/* ─── MOBILE BOTTOM NAV ───────────────────────────────── */}
      {activeUser && (
        <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden no-print masar-glass" style={{borderTop:"1px solid rgba(226,232,240,0.8)"}}>
          <div className="flex items-center justify-around px-1 py-2">
            {navItems.slice(0, 5).map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => navigate(item.id)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${isActive ? "text-indigo-600" : "text-slate-400"}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-semibold leading-tight">{item.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* ─── PRICING MODAL ──────────────────────────────────── */}
      {isPricingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)"}}>
          <div className="masar-card max-w-4xl w-full p-6 md:p-8 space-y-6 masar-animate-scale" style={{borderRadius:"28px"}}>
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600">{isRtl ? "باقات مسار" : "MASAR PLANS"}</span>
                <h3 className="text-lg font-black text-slate-950 pt-1">{isRtl ? "اختر الترقية المناسبة ⚡" : "Supercharge Your Job Search ⚡"}</h3>
              </div>
              <button onClick={() => setIsPricingOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-black border border-slate-100">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Free */}
              <div className="masar-card rounded-3xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg font-bold">Standard</span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{isRtl ? "الباقة المجانية" : "Basic"}</h4>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">{isRtl ? "للخريجين والمبتدئين" : "For entry candidates"}</p>
                  </div>
                  <div className="text-2xl font-black text-slate-900">$0<span className="text-xs text-slate-400 font-normal"> / Mo</span></div>
                  <ul className="space-y-2 text-[11px] text-slate-600 border-t pt-3">
                    <li>✓ {isRtl ? "محرر السيرة الذاتية" : "CV Builder"}</li>
                    <li>✓ {isRtl ? "دليل مكاتب التوظيف" : "Agency Directory"}</li>
                    <li>✓ {isRtl ? "حفظ ونسخ احتياطي" : "Local backup"}</li>
                  </ul>
                </div>
                <button onClick={() => setIsPricingOpen(false)} className="w-full py-2.5 bg-slate-200 text-slate-800 font-black text-xs rounded-xl">
                  {isRtl ? "مفعلة حالياً" : "Current Plan"}
                </button>
              </div>

              {/* Pro */}
              <div className="bg-gradient-to-br from-indigo-50/20 to-indigo-100/10 border border-indigo-200 rounded-3xl p-5 space-y-4 flex flex-col justify-between relative ring-2 ring-indigo-600/50">
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full whitespace-nowrap">
                  {isRtl ? "الأكثر مبيعاً 🔥" : "MOST POPULAR 🔥"}
                </div>
                <div className="space-y-3 pt-1">
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-lg font-black">Pro</span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{isRtl ? "الباقة الاحترافية" : "Pro Job Hunter"}</h4>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">{isRtl ? "للراغبين في السفر والترقي" : "Max AI power"}</p>
                  </div>
                  <div className="text-2xl font-black text-indigo-600">$14<span className="text-xs text-slate-400 font-normal"> / Mo</span></div>
                  <ul className="space-y-2 text-[11px] text-slate-600 border-t border-indigo-100 pt-3">
                    <li>✓ <b>{isRtl ? "فحص ATS غير محدود" : "Unlimited ATS Audits"}</b></li>
                    <li>✓ {isRtl ? "رسائل تقديم بالذكاء الاصطناعي" : "AI Cover Letters"}</li>
                    <li>✓ {isRtl ? "تنبيهات تليجرام وواتساب" : "WhatsApp/Telegram alerts"}</li>
                    <li>✓ {isRtl ? "حقن المهارات المفقودة" : "Auto keyword injection"}</li>
                  </ul>
                </div>
                <button onClick={() => { alert(isRtl ? "⚡ جاري إعداد بوابة الدفع!" : "⚡ Setting up payment!"); setIsPricingOpen(false); }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition">
                  {isRtl ? "اشترك الآن" : "Upgrade to Pro"}
                </button>
              </div>

              {/* Legal */}
              <div className="rounded-3xl p-5 space-y-4 flex flex-col justify-between text-white" style={{background:"linear-gradient(135deg,#0f172a,#1a1040)"}}>
                <div className="space-y-3">
                  <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg font-bold">Premium Legal</span>
                  <div>
                    <h4 className="text-sm font-black text-white">{isRtl ? "المستشار القانوني" : "Legal Counsel"}</h4>
                    <p className="text-[10.5px] text-slate-300 mt-0.5">{isRtl ? "للمحامين والمستشارين" : "For attorneys & advisors"}</p>
                  </div>
                  <div className="text-2xl font-black text-amber-400">$24<span className="text-xs text-slate-400 font-normal"> / Mo</span></div>
                  <ul className="space-y-2 text-[11px] text-slate-300 border-t border-slate-800 pt-3">
                    <li>✓ {isRtl ? "قوالب CV قانونية فاخرة" : "Legal CV templates"}</li>
                    <li>✓ {isRtl ? "مكتبة صياغات قانونية" : "Brief templates library"}</li>
                    <li className="font-bold text-amber-400">✓ {isRtl ? "فحص عقود العمل الخليجي" : "Gulf Labor Law audits"}</li>
                    <li>✓ {isRtl ? "تحديثات قانون العمل" : "Labor law updates"}</li>
                  </ul>
                </div>
                <button onClick={() => { alert(isRtl ? "⚖️ جاري تجهيز الباقة القانونية!" : "⚖️ Setting up Legal bundle!"); setIsPricingOpen(false); }}
                  className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs rounded-xl transition">
                  {isRtl ? "تفعيل المستشار" : "Unlock Legal Suite"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-7xl mx-auto text-center pt-8 mt-12 text-slate-300 text-[11px] px-4 pb-24 md:pb-10 no-print masar-divider">
        <p>© 2026 {isRtl ? "مسار - البوابة المفتوحة للباحثين عن العمل." : "Masar Job Hub & Intelligent ATS CV Portal."}</p>
      </footer>
    </div>
  );
}
