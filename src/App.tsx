import React, { useState, useEffect } from "react";
import {
  Briefcase,
  FileText,
  CheckSquare,
  MessageSquareCode,
  Building2,
  TrendingUp,
  Cpu,
  Plus,
  Trash2,
  Printer,
  Copy,
  Download,
  Upload,
  Languages,
  ArrowRight,
  Sparkles,
  Loader2,
  Save,
  FileJson,
  MessageSquare,
  FileCheck,
  Undo2
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
import { Logo } from "./components/Logo";
import { Activity, LogOut, Users, Home, Settings, Code, Sparkles as SparklesIcon, Menu, ChevronDown } from "lucide-react";

// Rich initial Arabic resume sample
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

// Rich initial English resume sample
const DEFAULT_CV_EN: CVData = {
  personal: {
    name: "Ahmed Mohamed Galal",
    title: "Senior Financial Accountant",
    email: "ahmed.galal@example.com",
    phone: "+20 102 345 6789",
    location: "New Cairo, Egypt",
    website: "linkedin.com/in/ahmed-galal-rec",
    summary: "Dedicated Senior Accountant with 5+ years of experience in corporate finance, ledger reconciliations, cost monitoring, and tax compliance. Highly skilled in deploying enterprise Odoo ERP frameworks to streamline inter-departmental books. Looking to drive fiscal precision for the team."
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

export default function App() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);

  // 1. ACTIVE USER STATE FOR SECURE AUTH & PROFILES PERSISTENCE
  const [activeUser, setActiveUser] = useState<{ id: string; email: string; name: string; profile: any } | null>(() => {
    const saved = localStorage.getItem("masar_active_user");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const handleAuthSuccess = (user: any) => {
    setActiveUser(user);
    localStorage.setItem("masar_active_user", JSON.stringify(user));
    if (user.profile) {
      handleSyncToCV(user.profile);
    }
  };

  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem("masar_active_user");
    localStorage.removeItem("masar_token");
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

  // V2.6 Progressive Disclosure Sub-Tab States
  const [cvSubTab, setCvSubTab] = useState<"edit" | "ats">("edit");
  const [netSubTab, setNetSubTab] = useState<"pitcher" | "agencies" | "influencers">("agencies");
  const [contractsSubTab, setContractsSubTab] = useState<"audit" | "telegram">("audit");
  const [jobsSubTab, setJobsSubTab] = useState<"board" | "matching">("board");
  const [settingsSubTab, setSettingsSubTab] = useState<"profile" | "sync">("profile");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);

  // V2.6 Zen Focus Mode State
  const [focusMode, setFocusMode] = useState<boolean>(() => {
    return localStorage.getItem("masar_focus_mode") === "true";
  });

  const handleToggleFocusMode = () => {
    const nextMode = !focusMode;
    setFocusMode(nextMode);
    localStorage.setItem("masar_focus_mode", String(nextMode));
  };

  // V2.7 Focus tracking session timer
  useEffect(() => {
    if (focusMode) {
      telemetry.startFocusTracking();
    } else {
      telemetry.stopFocusTracking();
    }
  }, [focusMode]);

  // CV Builder master state
  const [cvData, setCvData] = useState<CVData>(() => {
    const saved = localStorage.getItem("masar_cv_v1_ar");
    return saved ? JSON.parse(saved) : DEFAULT_CV_AR;
  });

  const [influencers, setInfluencers] = useState<any[]>([]);
  const [influencersLoading, setInfluencersLoading] = useState(false);

  // pre-fill helpers for ATS Checker from trigger
  const [atsCvText, setAtsCvText] = useState("");
  const [atsJd, setAtsJd] = useState("");

  // AI custom-tailoring inputs
  const [tailorJdText, setTailorJdText] = useState("");
  const [tailoringLoading, setTailoringLoading] = useState(false);
  const [tailorSuccess, setTailorSuccess] = useState("");

  const t = translations[language];
  const isRtl = language === "ar";

  // Helper to compile total CV data to robust plain text for ATS
  const getCompiledCvText = (cv: CVData) => {
    const expText = cv.experience.map(e => `• ${e.role} @ ${e.company} (${e.duration}):\n  ${e.description}`).join("\n\n");
    const eduText = cv.education.map(e => `• ${e.degree} - ${e.institution} (${e.duration})${e.details ? ` (${e.details})` : ""}`).join("\n");
    const projText = cv.projects.map(e => `• ${e.title}:\n  ${e.description}${e.technologies ? ` (Tools: ${e.technologies})` : ""}`).join("\n");
    const langText = cv.languages.map(e => `• ${e.name} (${e.level})`).join("\n");
    const skillsText = cv.skills.join(", ");

    return `
=== ${isRtl ? "المعلومات الشخصية" : "PERSONAL INFO"} ===
${isRtl ? "الاسم" : "Name"}: ${cv.personal.name}
${isRtl ? "المسمى" : "Title"}: ${cv.personal.title}
${isRtl ? "البريد" : "Email"}: ${cv.personal.email} / ${isRtl ? "الهاتف" : "Phone"}: ${cv.personal.phone}
${isRtl ? "الموقع" : "Location"}: ${cv.personal.location}

=== ${isRtl ? "النبذة المهنية" : "SUMMARY"} ===
${cv.personal.summary}

=== ${isRtl ? "الخبرات المهنية" : "EXPERIENCE"} ===
${expText || (isRtl ? "لا يوجد خبرات مضافة بعد." : "None registered yet.")}

=== ${isRtl ? "التعليم والشهادات" : "EDUCATION"} ===
${eduText || (isRtl ? "لا يوجد دراسة مضافة بعد." : "None registered yet.")}

=== ${isRtl ? "المشاريع والأبحاث" : "PROJECTS"} ===
${projText || (isRtl ? "لا يوجد مشاريع." : "None registered yet.")}

=== ${isRtl ? "اللغات" : "LANGUAGES"} ===
${langText || (isRtl ? "العربية" : "None registered yet.")}

=== ${isRtl ? "المهارات والمعايير" : "SKILLS"} ===
${skillsText || (isRtl ? "لا يوجد مهارات مضافة." : "None registered yet.")}
    `.trim();
  };

  // V2.7 Active Tab log events
  useEffect(() => {
    telemetry.logEvent(`Navigated to Tab: ${activeTab}`, "navigation", `User switched main screen viewport to: ${activeTab}`);
  }, [activeTab]);

  // V2.7 Recovery & Undo integration
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [isDraftSaving, setIsDraftSaving] = useState<boolean>(false);

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

  const handleUndo = () => {
    const res = telemetry.undo(cvData);
    if (res) {
      setCvData(res.previous);
    }
  };

  const handleRedo = () => {
    const res = telemetry.redo(cvData);
    if (res) {
      setCvData(res.next);
    }
  };

  // Cache changes
  useEffect(() => {
    localStorage.setItem(`masar_cv_v1_${language}`, JSON.stringify(cvData));
  }, [cvData, language]);

  // Handle lang swaps, load matching standard caches
  const toggleLanguage = () => {
    const nextLang = language === "ar" ? "en" : "ar";
    setLanguage(nextLang);
    const saved = localStorage.getItem(`masar_cv_v1_${nextLang}`);
    if (saved) {
      setCvData(JSON.parse(saved));
    } else {
      setCvData(nextLang === "ar" ? DEFAULT_CV_AR : DEFAULT_CV_EN);
    }
  };

  // Fetch influencers
  const fetchInfluencers = async () => {
    setInfluencersLoading(true);
    try {
      const res = await fetch("/api/influencers");
      const data = await res.json();
      if (data.success) {
        setInfluencers(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInfluencersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "influencers") {
      fetchInfluencers();
    }
  }, [activeTab]);

  // CV CRUD event handlers
  const handlePersonalChange = (field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const addExperience = () => {
    setCvData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: `exp-${Date.now()}`, company: "", role: "", duration: "", description: "" }
      ]
    }));
  };

  const removeExperience = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id)
    }));
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    }));
  };

  const addEducation = () => {
    setCvData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: `edu-${Date.now()}`, institution: "", degree: "", duration: "", details: "" }
      ]
    }));
  };

  const removeEducation = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id)
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    }));
  };

  const addProject = () => {
    setCvData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { id: `proj-${Date.now()}`, title: "", description: "", technologies: "" }
      ]
    }));
  };

  const removeProject = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id)
    }));
  };

  const updateProject = (id: string, field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    }));
  };

  const addLanguageNode = () => {
    setCvData((prev) => ({
      ...prev,
      languages: [
        ...prev.languages,
        { id: `lang-${Date.now()}`, name: "", level: "" }
      ]
    }));
  };

  const removeLanguageNode = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l.id !== id)
    }));
  };

  const updateLanguageNode = (id: string, field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      languages: prev.languages.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    }));
  };

  const handleSkillsChange = (val: string) => {
    const list = val.split(/[,,،\n]/).map((s) => s.trim()).filter(Boolean);
    setCvData((prev) => ({ ...prev, skills: list }));
  };

  const copyPlaintextSummary = () => {
    const experiencesText = cvData.experience.map(e => `${e.role} at ${e.company}:${e.description}`).join("\n");
    const skillsText = cvData.skills.join(", ");
    const text = `Name: ${cvData.personal.name}\nTitle: ${cvData.personal.title}\nSummary: ${cvData.personal.summary}\nExperience:\n${experiencesText}\nSkills: ${skillsText}`;
    navigator.clipboard.writeText(text);
    alert(isRtl ? "تم نسخ النص بالكامل بنجاح!" : "Plaintext CV successfully copied!");
  };

  // On-demand JSON Backups
  const exportJsonBackup = () => {
    const blob = new Blob([JSON.stringify(cvData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `masar_cv_backup_${language}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.personal) {
          setCvData(parsed);
          alert(isRtl ? "تم استعادة النسخة الاحتياطية بنجاح!" : "Backup restored successfully!");
        }
      } catch (err) {
        alert("Invalid JSON format.");
      }
    };
    reader.readAsText(file);
  };

  const triggerTailorFromJob = (job: Job) => {
    // Populate tailoring JD text field
    setTailorJdText(`مطلوب الشغل بـ: ${job.title}\nالشركة: ${job.company}\nالتوصيف والمهام المطلوبة:\n${job.description}`);
    // Auto populate ATS pre-fills
    setAtsJd(job.description);
    // Assemble text for ATS CV check
    const experiencesText = cvData.experience.map(e => `${e.role} at ${e.company}:${e.description}`).join("\n");
    const skillsText = cvData.skills.join(", ");
    setAtsCvText(`Name: ${cvData.personal.name}\nTitle: ${cvData.personal.title}\nSummary: ${cvData.personal.summary}\nExperience:\n${experiencesText}\nSkills: ${skillsText}`);
    
    // Switch to CV Builder Tab
    setActiveTab("cv_ats");
    setCvSubTab("edit");
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
        setCvData((prev) => ({
          ...prev,
          personal: { ...prev.personal, summary: data.tailoredSummary || prev.personal.summary },
          skills: data.tailoredSkills || prev.skills
        }));
        setTailorSuccess(isRtl ? "✨ تم تخصيص وتحديث الملخص والمهارات بالذكاء الاصطناعي بنجاح!" : "✨ CV profile summary successfully tailored with Gemini AI!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTailoringLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 md:pb-16 font-sans overflow-x-hidden" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* MASTER TOP BILINGUAL NAVBAR - CLEAN & EXCLUSIVELY BRANDING & LOGISTICS */}
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-md border-b border-slate-100/70 transition-all duration-300 no-print">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          
          {/* Logo & Slogan Column */}
          <div className="flex items-center gap-2.5">
            <div 
              onClick={() => activeUser && setActiveTab("home")}
              className="cursor-pointer select-none inline-flex items-center"
              title={language === "ar" ? "الصفحة الرئيسية لمسار" : "Masar Home"}
            >
              <Logo size="md" variant="full" language={language} />
            </div>
          </div>

          {/* Configuration options / Collapsible Profile Selector */}
          <div className="flex items-center gap-2 relative">
            {!activeUser ? (
              // Unauthenticated state: display top-bar language selector
              <button
                type="button"
                onClick={toggleLanguage}
                className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/45 rounded-full px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
              >
                <Languages className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.langToggle}</span>
              </button>
            ) : (
              // Authenticated state: elegant drop-down menu containing both Language Choice and Log Out
              <div className="relative">
                {/* Desktop view profile button -> triggers floating dropdown box */}
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="hidden md:flex bg-slate-50 hover:bg-slate-100/85 border border-slate-200/40 rounded-full px-3 py-1.5 items-center gap-2 transition cursor-pointer shadow-2xs select-none"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
                    {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : "M"}
                  </div>
                  <span className="text-xs font-bold text-slate-700 max-w-[100px] truncate">
                    {activeUser.name ? activeUser.name.split(" ")[0] : "User"}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transform transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Mobile view profile button -> triggers full slide-out drawer */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="flex md:hidden bg-slate-50 hover:bg-slate-100/85 border border-slate-200/40 rounded-full px-3 py-1.5 items-center gap-2 transition cursor-pointer shadow-2xs select-none"
                  aria-label="Toggle user mobile menu"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white flex items-center justify-center text-xs font-black">
                    {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : "M"}
                  </div>
                  <Menu className="w-4 h-4 text-slate-600" />
                </button>

                {isUserDropdownOpen && (
                  <>
                    {/* Dark translucent click blocker overlay */}
                    <div className="fixed inset-0 z-40 hidden md:block" onClick={() => setIsUserDropdownOpen(false)} />
                    
                    {/* Collapsible Dropdown Card */}
                    <div 
                      className={`absolute hidden md:block ${isRtl ? "left-0" : "right-0"} mt-2.5 w-52 bg-white border border-slate-100/90 rounded-2xl shadow-xl p-2 z-50 animate-fade-in text-start`}
                      dir={isRtl ? "rtl" : "ltr"}
                    >
                      {/* Section Title */}
                      <div className="px-3 pt-2 pb-1.5 border-b border-slate-100">
                        <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                          {isRtl ? "بوابة الإعدادات" : "PERSONAL SETTINGS"}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">
                          {activeUser.email}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        {/* Language Selection inside dropdown */}
                        <button
                          type="button"
                          onClick={() => {
                            toggleLanguage();
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                        >
                          <Languages className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{t.langToggle}</span>
                        </button>

                        {/* Premium details inside dropdown */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsPricingOpen(true);
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>{isRtl ? "باقة مسار بلاس ⭐" : "Upgrade to Pro ⭐"}</span>
                        </button>

                        <div className="border-t border-slate-100/70 my-1"></div>

                        {/* Standalone Logout inside dropdown */}
                        <button
                          type="button"
                          onClick={() => {
                            handleLogout();
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-heavy text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer font-bold"
                        >
                          <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>{isRtl ? "تسجيل الخروج" : "Logout"}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER PORTAL MENU */}
      {activeUser && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden bg-slate-900/40 backdrop-blur-xs no-print" 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className={`w-72 bg-white h-full shadow-2xl flex flex-col p-6 space-y-4 animate-fade-in absolute top-0 bottom-0 ${isRtl ? "left-0" : "right-0"} transition-transform`} 
            onClick={(e) => e.stopPropagation()}
            style={{ direction: isRtl ? "rtl" : "ltr" }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5 text-start overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-sm">
                  {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : "M"}
                </div>
                <div className="truncate min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate leading-none">
                    {activeUser.name || "User"}
                  </p>
                  <p className="text-[10px] text-slate-550 text-slate-500 truncate mt-1 leading-none font-sans font-medium">
                    {activeUser.email}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-1 px-2 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-400 shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto">
               {[
                 { id: "home", label: isRtl ? "البداية والملخص" : "Main Dashboard", icon: Home },
                 { id: "cv_ats", label: isRtl ? "صناعة الـ CV والـ ATS" : "Smart CV Builder", icon: FileText, subTab: "edit" },
                 { id: "jobs", label: isRtl ? "الشواغر والمطابقة" : "Jobs & Matches", icon: Briefcase, subTab: "board" },
                 { id: "interview", label: isRtl ? "محاكاة المقابلة للوظيفة" : "AI Interview Simulator", icon: MessageSquareCode },
                 { id: "networking", label: isRtl ? "دلـيل مكاتب التوظيف" : "Agencies Directory", icon: Building2, subTab: "agencies" },
                 { id: "contracts", label: isRtl ? "مدقق العقود والسلامة" : "Contract Risk Advisor", icon: FileCheck, subTab: "audit" },
                 { id: "diagnostics", label: isRtl ? "الإعدادات وبيانات النظام" : "General Settings", icon: Settings }
              ].map((item) => {
                const isSelected = activeTab === item.id;
                const DrawerIcon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.subTab) {
                        if (item.id === "cv_ats") setCvSubTab(item.subTab as any);
                        if (item.id === "contracts") setContractsSubTab(item.subTab as any);
                        if (item.id === "networking") setNetSubTab(item.subTab as any);
                        if (item.id === "jobs") setJobsSubTab(item.subTab as any);
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2 px-3.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <DrawerIcon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsPricingOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl text-xs font-black transition cursor-pointer text-center"
              >
                {isRtl ? "باقة مسار بلاس ⭐" : "Upgrade to Pro ⭐"}
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleLanguage();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Languages className="w-3.5 h-3.5 text-slate-400 animate-spin-once" />
                <span>{t.langToggle}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-rose-50/50 hover:bg-rose-100 text-rose-700 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>{isRtl ? "تسجيل الخروج" : "Logout"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 MOBILE BOTTOM NAVIGATION BAR - EXTREMELY ERGONOMIC & SIMPLE */}
      {activeUser && (
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/50 py-2 pb-3.5 px-4 flex justify-around items-center md:hidden shadow-lg no-print">
          {[
            { id: "home", label: isRtl ? "الرئيسية" : "Home", icon: Home },
            { id: "cv_ats", label: isRtl ? "الـ CV" : "CV", icon: FileText, subTab: "edit" },
            { id: "jobs", label: isRtl ? "الوظائف" : "Jobs", icon: Briefcase, subTab: "board" },
            { id: "interview", label: isRtl ? "مقابلة" : "Interview", icon: MessageSquareCode }
          ].map((item) => {
            const isSelected = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.subTab) {
                    if (item.id === "cv_ats") setCvSubTab(item.subTab as any);
                    if (item.id === "jobs") setJobsSubTab(item.subTab as any);
                  }
                }}
                className={`flex flex-col items-center gap-1 cursor-pointer transition select-none ${
                  isSelected ? "text-indigo-600 scale-105" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? "stroke-2" : "stroke-1.5"}`} />
                <span className="text-[10px] font-bold leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* CORE FRAME LAYOUT */}
      {!activeUser ? (
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex justify-center items-center">
          <AuthScreen onAuthSuccess={handleAuthSuccess} language={language} />
        </main>
      ) : (
        <>
          <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* UNIFIED DESKTOP SIDEBAR - EXCLUSIVELY VISIBLE ON DESKTOP */}
            <aside className="hidden md:block md:col-span-4 lg:col-span-3 space-y-4 no-print">
              <div className="bg-white border border-slate-100/80 rounded-[2rem] p-5 shadow-2xs sticky top-24 space-y-4.5">
                {/* Desktop User Profile Card */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                    {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : "M"}
                  </div>
                  <div className="truncate text-start min-w-0">
                    <h4 className="text-xs font-black text-slate-800 truncate leading-none">
                      {activeUser.name || "User"}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate mt-1 leading-none font-sans font-medium">
                      {activeUser.email}
                    </p>
                  </div>
                </div>

                <div className="border-b pb-2.5 border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                    {isRtl ? "رحلة مسار 🧭" : "MASAR PIPELINE 🧭"}
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed font-sans pt-0.5">
                    {isRtl ? "نظّم خطوات استهدافك بنقرات موحدة" : "Navigate your hiring pipeline"}
                  </p>
                </div>

                <div className="space-y-1 font-sans">
                   {[
                    { id: "home", label: isRtl ? "الرئيسية والملخص" : "Main Dashboard", icon: Home },
                    { id: "cv_ats", label: isRtl ? "بناء وملاءمة الـ CV" : "Smart CV Builder", icon: FileText, subTab: "edit" },
                    { id: "jobs", label: isRtl ? "الشواغر والمطابقة" : "Jobs & Matches", icon: Briefcase, subTab: "board" },
                    { id: "interview", label: isRtl ? "محاكاة المقابلة بالذكاء" : "AI Interview Sim", icon: MessageSquareCode },
                    { id: "networking", label: isRtl ? "دلـيل مكاتب التوظيف" : "Agencies & Partners", icon: Building2, subTab: "agencies" },
                    { id: "contracts", label: isRtl ? "تدقيق وعروض العمل" : "Contract & Offer Audit", icon: FileCheck, subTab: "audit" },
                    { id: "diagnostics", label: isRtl ? "الإعدادات والبيانات" : "Settings & Profile", icon: Settings }
                  ].map((item) => {
                    const isSelected = activeTab === item.id;
                    const SidebarIcon = item.icon;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          if (item.subTab) {
                            if (item.id === "cv_ats") setCvSubTab(item.subTab as any);
                            if (item.id === "contracts") setContractsSubTab(item.subTab as any);
                            if (item.id === "networking") setNetSubTab(item.subTab as any);
                            if (item.id === "jobs") setJobsSubTab(item.subTab as any);
                          }
                        }}
                        className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer select-none ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md scale-[1.01]"
                            : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <SidebarIcon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                          <span>{item.label}</span>
                        </div>
                        {isSelected ? (
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        ) : (
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="border-t border-slate-100 pt-3.5 space-y-2">
                  <button
                    type="button"
                    onClick={() => setIsPricingOpen(true)}
                    className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl text-xs font-black transition cursor-pointer text-center"
                  >
                    {isRtl ? "⭐ الترقية لمسار بلس" : "⭐ Upgrade to Pro Plus"}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={toggleLanguage}
                      className="bg-slate-50 hover:bg-slate-100/90 text-slate-600 border border-slate-200/30 rounded-xl py-2 text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      title={isRtl ? "تغيير لغة العرض" : "Toggle Language"}
                    >
                      <Languages className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === "ar" ? "English" : "العربية"}</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/20 rounded-xl py-2 text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      title={isRtl ? "تسجيل الخروج" : "Logout"}
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>{isRtl ? "خروج" : "Logout"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* MASTER SCREEN ROUTER CONTAINER */}
            <div className="md:col-span-8 lg:col-span-9 space-y-6 col-span-1">
            
            {/* TAP SCREEN: MASTER JOURNEY HOME DASHBOARD */}
            {activeTab === "home" && (
              <MasarJourneyHome
                language={language}
                cvData={cvData}
                onNavigateTab={(tabId, subTab) => {
                  setActiveTab(tabId);
                  if (subTab) {
                    if (tabId === "cv_ats") setCvSubTab(subTab as any);
                    if (tabId === "contracts") setContractsSubTab(subTab as any);
                    if (tabId === "networking") setNetSubTab(subTab as any);
                    if (tabId === "jobs") setJobsSubTab(subTab as any);
                  }
                }}
                onSyncToCV={handleSyncToCV}
                activeUserName={activeUser?.profile?.personal?.name || activeUser?.name}
                activeUserEmail={activeUser?.email}
              />
            )}

            {/* TAP SCREEN: V2 CAREER ACCELERATOR CONTROL DECK */}
            {activeTab === "accelerator" && (
              <CareerAccelerator 
                cvData={cvData} 
                onCvChange={setCvData} 
                language={language}
                focusMode={focusMode}
                onToggleFocusMode={handleToggleFocusMode}
                onNavigateTab={(tabId) => setActiveTab(tabId)}
                activeUserName={activeUser?.profile?.personal?.name || activeUser?.name}
                activeUserEmail={activeUser?.email}
                onLogout={handleLogout}
              />
            )}

            {/* TAP SCREEN: JOBS PORTAL & SMART MATCH (COMBINED SCREEN FOR MAXIMUM COHESION) */}
            {activeTab === "jobs" && (
              <div className="space-y-6 animate-fade-in">
                {/* JOBS SUB-TAB TOGGLE WITH ELEGANT PILLS */}
                <div className="flex bg-slate-100 hover:bg-slate-200/65 p-1 rounded-2xl max-w-sm transition border select-none border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => setJobsSubTab("board")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      jobsSubTab === "board" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {isRtl ? "💼 مستكشف الوظائف" : "💼 Jobs Explorer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobsSubTab("matching")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      jobsSubTab === "matching" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {isRtl ? "🎯 المطابقة الذكية" : "🎯 Smart Match"}
                  </button>
                </div>

                {jobsSubTab === "board" ? (
                  <JobsBoard onTailorTrigger={triggerTailorFromJob} language={language} t={t} cvData={cvData} />
                ) : (
                  <SmartMatchingHub
                    email={activeUser.email}
                    language={language}
                    t={t}
                    onTailorTrigger={triggerTailorFromJob}
                    cvData={cvData}
                  />
                )}
              </div>
            )}

            {/* TAP SCREEN: USER PROFILE LINKEDIN STYLE */}
            {activeTab === "profile" && (
              <UserProfile
                email={activeUser.email}
                language={language}
                onProfileUpdated={handleProfileUpdated}
                onSyncToCV={handleSyncToCV}
              />
            )}

            {/* TAP SCREEN: AUTOMATED SMART DAILY MATCHING HUB */}
            {activeTab === "matched" && (
              <SmartMatchingHub
                email={activeUser.email}
                language={language}
                t={t}
                onTailorTrigger={triggerTailorFromJob}
                cvData={cvData}
              />
            )}

          {activeTab === "cv_ats" && (
            <div className="space-y-6">
              {/* SUB-TAB TOGGLE WITH ELEGANT PILLS (Progressive Disclosure) */}
              <div className="flex bg-slate-100 hover:bg-slate-200/60 p-1 rounded-2xl max-w-sm transition border select-none">
                <button
                  type="button"
                  onClick={() => setCvSubTab("edit")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    cvSubTab === "edit" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isRtl ? "📝 تعديل السيرة الذاتية والمعاينة" : "📝 Edit & Preview"}
                </button>
                <button
                  type="button"
                  onClick={() => setCvSubTab("ats")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    cvSubTab === "ats" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isRtl ? "🎯 فحص مطابقة الـ ATS" : "🎯 ATS Alignment Audit"}
                </button>
              </div>

              {cvSubTab === "edit" ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Form Input fields */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* AI TAILORING DRAWER CONTAINER */}
                    <div className="bg-indigo-950 text-white rounded-2xl p-6 border border-indigo-900 space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        <span>{t.tailorWithAI}</span>
                      </h3>
                      <p className="text-[11px] text-indigo-200 leading-relaxed">{t.summaryAIWarning}</p>
                      
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={tailorJdText}
                          onChange={(e) => setTailorJdText(e.target.value)}
                          placeholder={isRtl ? "الصق التوصيف الوظيفي للوظيفة لترتيب الكهارات وتصميم النبذة المحترفة..." : "Paste targeted JD parameters to tailor summary..."}
                          className="w-full bg-indigo-900/40 text-xs placeholder-slate-400 border border-indigo-800 focus:border-indigo-400 rounded-xl px-3 py-2.5 outline-none text-white font-sans"
                        />
                      </div>

                      {tailorSuccess && (
                         <p className="text-emerald-400 text-xs font-semibold leading-relaxed font-sans">{tailorSuccess}</p>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={executeAiTailoring}
                          disabled={tailoringLoading || !tailorJdText.trim()}
                          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 transition text-xs font-black text-white px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          {tailoringLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{isRtl ? "جاري التخصيص عبر Gemini..." : "Re-writing summary..."}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{t.tailorBtn}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Primary Data Card */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
                      
                      {/* Backup / Export header row with Undo, Redo, and Draft Alerts */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                        <div className="space-y-1">
                          <h3 className="text-sm font-extrabold text-slate-800">{t.personalInfo}</h3>
                          {/* Live Autosave Indicator */}
                          <div className="flex items-center gap-1.5 text-[10px] font-bold">
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${isDraftSaving ? "bg-amber-400 animate-ping" : "bg-emerald-500 animate-pulse"}`} />
                            <span className={isDraftSaving ? "text-amber-500" : "text-emerald-600"}>
                              {isDraftSaving 
                                ? (isRtl ? "جاري حفظ المسودة..." : "Autosaving draft...") 
                                : lastSavedTime 
                                  ? (isRtl ? `تم الحفظ تلقائياً ${lastSavedTime}` : `Draft autosaved: ${lastSavedTime}`) 
                                  : (isRtl ? "تزامن المسودة نشط" : "Draft recovered & synced")}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-1.5 font-sans">
                          {/* Undo & Redo Action triggers */}
                          <button
                            type="button"
                            onClick={handleUndo}
                            className={`text-[10px] px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 border transition cursor-pointer ${
                              telemetry.canUndo() 
                                ? "bg-white text-slate-800 hover:bg-slate-50 border-slate-200" 
                                : "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
                            }`}
                            disabled={!telemetry.canUndo()}
                            title={isRtl ? "تراجع عن التغيير الأخير" : "Undo last edit"}
                          >
                            <Undo2 className="w-3 h-3 text-slate-500" />
                            <span>{isRtl ? "تراجع" : "Undo"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleRedo}
                            className={`text-[10px] px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 border transition cursor-pointer ${
                              telemetry.canRedo() 
                                ? "bg-white text-slate-800 hover:bg-slate-50 border-slate-200" 
                                : "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
                            }`}
                            disabled={!telemetry.canRedo()}
                            title={isRtl ? "إعادة تطبيق التغيير" : "Redo previously undone change"}
                          >
                            <span>{isRtl ? "إعادة" : "Redo"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={exportJsonBackup}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-200/50 cursor-pointer"
                          >
                            <FileJson className="w-3 h-3 text-slate-500" />
                            <span>{t.backupExport}</span>
                          </button>

                          <label className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-200/50 cursor-pointer">
                            <Upload className="w-3 h-3 text-slate-500" />
                            <span>{t.backupImport}</span>
                            <input
                              type="file"
                              accept=".json"
                              onChange={importJsonBackup}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Personal detail fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">{t.fullName}</label>
                          <input
                            type="text"
                            value={cvData.personal.name}
                            onChange={(e) => handlePersonalChange("name", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">{t.jobTitle}</label>
                          <input
                            type="text"
                            value={cvData.personal.title}
                            onChange={(e) => handlePersonalChange("title", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">{t.email}</label>
                          <input
                            type="email"
                            value={cvData.personal.email}
                            onChange={(e) => handlePersonalChange("email", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">{t.phone}</label>
                          <input
                            type="text"
                            value={cvData.personal.phone}
                            onChange={(e) => handlePersonalChange("phone", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">{t.location}</label>
                          <input
                            type="text"
                            value={cvData.personal.location}
                            onChange={(e) => handlePersonalChange("location", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">{t.website}</label>
                          <input
                            type="text"
                            value={cvData.personal.website}
                            onChange={(e) => handlePersonalChange("website", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 pt-2">
                        <label className="text-xs font-semibold text-slate-700">{t.summary}</label>
                        <textarea
                          rows={4}
                          value={cvData.personal.summary}
                          onChange={(e) => handlePersonalChange("summary", e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
                        />
                      </div>
                    </div>

                    {/* Experience Forms */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-sm font-extrabold text-slate-800">{t.experience}</h3>
                        <button
                          onClick={addExperience}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.addMore}</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {cvData.experience.map((exp, idx) => (
                          <div key={exp.id} className="p-4 bg-slate-50 rounded-xl space-y-3 relative text-xs">
                            <button
                              onClick={() => removeExperience(exp.id)}
                              className="absolute top-4 left-4 text-rose-500 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-slate-500">#{idx + 1}</span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <input
                                type="text"
                                value={exp.role}
                                onChange={(e) => updateExperience(exp.id, "role", e.target.value)}
                                placeholder={isRtl ? "مسمى العمل (مثلاً: محاسب أول)" : "Role / Title"}
                                className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full font-sans"
                              />
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                                placeholder={isRtl ? "اسم الشركة" : "Company / Firm"}
                                className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full font-sans"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={exp.duration}
                                onChange={(e) => updateExperience(exp.id, "duration", e.target.value)}
                                placeholder={isRtl ? "المدة (مثال: ٢٠٢٢ - الآن)" : "Duration"}
                                className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full font-sans"
                              />
                              <input
                                type="text"
                                value={exp.location || ""}
                                onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                                placeholder={isRtl ? "الموقع (مثال: القاهرة)" : "Location (Optional)"}
                                className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full font-sans"
                              />
                            </div>

                            <textarea
                              rows={3}
                              value={exp.description}
                              onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                              placeholder={isRtl ? "تفصيل الواجبات والمهارات المكتسبة..." : "Highlight actions and specific quantitative metrics reached..."}
                              className="w-full px-3 py-2 bg-white border rounded-lg text-xs outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Education list */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-sm font-extrabold text-slate-800">{t.education}</h3>
                        <button
                          onClick={addEducation}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.addMore}</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {cvData.education.map((edu, idx) => (
                          <div key={edu.id} className="p-4 bg-slate-50 rounded-xl space-y-3 relative text-xs">
                            <button
                              onClick={() => removeEducation(edu.id)}
                              className="absolute top-4 left-4 text-rose-500 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-slate-500">#{idx + 1}</span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                                placeholder={isRtl ? "اسم الجامعة أو الكلية" : "School / University"}
                                className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full font-sans"
                              />
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                                placeholder={isRtl ? "الدرجة والتخصص (بكالوريوس تجارة)" : "Degree / Field"}
                                className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full font-sans"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={edu.duration}
                                onChange={(e) => updateEducation(edu.id, "duration", e.target.value)}
                                placeholder={isRtl ? "الفترة (مثال: ٢٠١٧ - ٢٠٢١)" : "Duration"}
                                className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full font-sans"
                              />
                              <input
                                type="text"
                                value={edu.details || ""}
                                onChange={(e) => updateEducation(edu.id, "details", e.target.value)}
                                placeholder={isRtl ? "ملاحظات تقدير/GPA (بامتياز)" : "Details / GPA"}
                                className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full font-sans"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Research / Projects */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-sm font-extrabold text-slate-800">{t.projects}</h3>
                        <button
                          onClick={addProject}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.addMore}</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {cvData.projects.map((proj, idx) => (
                          <div key={proj.id} className="p-4 bg-slate-50 rounded-xl space-y-3 relative text-xs">
                            <button
                              onClick={() => removeProject(proj.id)}
                              className="absolute top-4 left-4 text-rose-500 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-slate-500">#{idx + 1}</span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <input
                                type="text"
                                value={proj.title}
                                onChange={(e) => updateProject(proj.id, "title", e.target.value)}
                                placeholder={isRtl ? "عنوان المشروع أو البحث" : "Publication / Project Title"}
                                className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full font-sans"
                              />
                              <input
                                type="text"
                                value={proj.technologies || ""}
                                onChange={(e) => updateProject(proj.id, "technologies", e.target.value)}
                                placeholder={isRtl ? "التقنيات/المنهجية المستخدمة" : "Technologies / Tools utilized"}
                                className="px-3 py-2 bg-white border rounded-lg text-xs outline-none w-full font-sans"
                              />
                            </div>

                            <textarea
                              rows={2}
                              value={proj.description}
                              onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                              placeholder={isRtl ? "نبذة تفصيلية علمية وتطبيقية..." : "Abstract or practical outcomes achieved..."}
                              className="w-full px-3 py-2 bg-white border rounded-lg text-xs outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Languages list */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-sm font-extrabold text-slate-800">{t.languages}</h3>
                        <button
                          onClick={addLanguageNode}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.addMore}</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {cvData.languages.map((lang, idx) => (
                          <div key={lang.id} className="p-3 bg-slate-50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative w-full overflow-hidden">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <button
                                onClick={() => removeLanguageNode(lang.id)}
                                className="text-rose-500 hover:text-rose-600 cursor-pointer text-xs p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-slate-400 font-bold font-sans sm:hidden">#{idx + 1}</span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-grow w-full">
                              <input
                                type="text"
                                value={lang.name}
                                onChange={(e) => updateLanguageNode(lang.id, "name", e.target.value)}
                                placeholder={isRtl ? "اسم اللغة (مثال: الفرنسية)" : "Language"}
                                className="w-full px-3 py-1.5 bg-white border rounded outline-none min-w-0 font-sans"
                              />

                              <input
                                type="text"
                                value={lang.level}
                                onChange={(e) => updateLanguageNode(lang.id, "level", e.target.value)}
                                placeholder={isRtl ? "الدرجة (بطلاقة / مبتدئ)" : "Proficiency"}
                                className="w-full px-3 py-1.5 bg-white border rounded outline-none min-w-0 font-sans"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills tagging input */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-3">
                      <h3 className="text-sm font-extrabold text-slate-800 border-b pb-2">{t.skills}</h3>
                      <textarea
                        rows={2}
                        defaultValue={cvData.skills.join(", ")}
                        onChange={(e) => handleSkillsChange(e.target.value)}
                        placeholder={isRtl ? "ادخل المهارات وافصل بينها بفواصل (محاسبة، أودو، تحليل مالي)..." : "Integrate, skills, separated, by, commas..."}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cvData.skills.map((tag, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* LIVE PAGE VIEW PREVIEWER CANVASSES */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Print and custom configuration controller card */}
                    <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 sticky top-24 z-10 no-print">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">{t.templateChoose}</label>
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          {[
                            { id: "classic", label: isRtl ? "كلاسيكي" : "Classic" },
                            { id: "modern", label: isRtl ? "حديث" : "Modern" },
                            { id: "academic", label: isRtl ? "أكاديمي" : "Academic" }
                          ].map((temp) => (
                            <button
                              key={temp.id}
                              onClick={() => setCvData((prev) => ({ ...prev, selectedTemplate: temp.id as any }))}
                              className={`py-2 px-1 text-[11px] font-bold rounded-lg border text-center transition cursor-pointer ${
                                cvData.selectedTemplate === temp.id
                                  ? "bg-slate-900 border-slate-900 text-white"
                                  : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                              }`}
                            >
                              {temp.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => window.print()}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>{t.printCv}</span>
                        </button>

                        <button
                          onClick={copyPlaintextSummary}
                          className="w-full bg-slate-50 hover:bg-slate-100 border text-slate-705 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Copy className="w-4 h-4 text-slate-400" />
                          <span>{t.copyPlain}</span>
                        </button>
                      </div>
                    </div>

                    {/* Simulated A4 card holding PDF layout preview */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xl bg-slate-300 p-2 md:p-4 gap-2 no-print">
                      <div className="origin-top scale-[0.9] sm:scale-100 transition-transform">
                        <ResumePreview cvData={cvData} language={language} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <AtsChecker 
                  language={language} 
                  t={t} 
                  preFilledCvText={atsCvText || getCompiledCvText(cvData)} 
                  preFilledJd={atsJd} 
                />
              )}
            </div>
          )}

          {/* TAP SCREEN: ADAPTIVE INTERVIEW SIMULATOR */}
          {activeTab === "interview" && (
            <InterviewSim language={language} t={t} />
          )}

          {/* TAP SCREEN: PROGRESSIVE COHESIVE NETWORKING WORKSPACE (Agencies, Influencers, and Outreach) */}
          {activeTab === "networking" && (
            <div className="space-y-6">
              {/* SUB-TABS (Progressive Disclosure) */}
              <div className="flex bg-slate-100 hover:bg-slate-200/60 p-1 rounded-2xl max-w-md transition border select-none">
                <button
                  type="button"
                  onClick={() => setNetSubTab("pitcher")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    netSubTab === "pitcher" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isRtl ? "✉️ صانع الرسائل والترويج" : "✉️ AI Outreach Pitcher"}
                </button>
                <button
                  type="button"
                  onClick={() => setNetSubTab("agencies")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    netSubTab === "agencies" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isRtl ? "🏢 مكاتب التوظيف المعتمدة" : "🏢 Recruitment Agencies"}
                </button>
                <button
                  type="button"
                  onClick={() => setNetSubTab("influencers")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    netSubTab === "influencers" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isRtl ? "💡 مستشعر رواد الخليج" : "💡 Influencer Insights"}
                </button>
              </div>

              {netSubTab === "pitcher" && (
                <OutreachPitcher cvData={cvData} language={language} />
              )}

              {netSubTab === "agencies" && (
                <AgenciesRegistry language={language} t={t} />
              )}

              {netSubTab === "influencers" && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b pb-4 border-slate-100">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{isRtl ? "مستشعر رواد التوظيف والخليج" : "Influencers Insights Sensor"}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{isRtl ? "متابعة أحدث نصائح وتنبيهات كبار خبراء الموارد البشرية بالخليج ومصر (محدثة كل ١٢ ساعة تلقائياً)" : "Gulf recruitment guidelines tracked every 12 hours"}</p>
                    </div>
                  </div>

                  {influencersLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {influencers.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 rounded-xl space-y-3">
                          <p className="text-xs text-slate-500">{isRtl ? "جاري تحميل المقالات والنصائح التوجيهية..." : "Gathering dynamic influencer tweets..."}</p>
                          <button onClick={fetchInfluencers} className="text-xs text-indigo-600 font-bold underline">{isRtl ? "تحديث حية الآن" : "Query records live"}</button>
                        </div>
                      ) : (
                        influencers.map((post) => (
                          <div key={post.id} className="border hover:border-slate-300 transition-all rounded-2xl p-5 space-y-3 bg-slate-50/20">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-sans text-xs shrink-0 ${post.avatarColor}`}>
                                  {post.name.slice(0, 1)}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-slate-800">{post.name}</h4>
                                  <span className="text-[10px] text-slate-400 font-mono italic">{post.handle}</span>
                                </div>
                              </div>

                              <span className="text-[10px] bg-slate-100 border text-slate-500 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">
                                {post.platform}
                              </span>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">{post.content}</p>

                            <div className="flex justify-end text-[10px] text-slate-400 font-medium">
                              <span>{post.timeLabel}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAP SCREEN: PROGRESSIVE COHESIVE SAFETY & COMPLIANCE HUD (Contracts & Bot Node) */}
          {activeTab === "contracts" && (
            <div className="space-y-6">
              {/* SUB-TABS (Progressive Disclosure) */}
              <div className="flex bg-slate-100 hover:bg-slate-200/60 p-1 rounded-2xl max-w-sm transition border select-none col-span-1">
                <button
                  type="button"
                  onClick={() => setContractsSubTab("audit")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    contractsSubTab === "audit" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isRtl ? "📜 فحص سلامة العقود والسفر" : "📜 Offer & Legal Audit"}
                </button>
                <button
                  type="button"
                  onClick={() => setContractsSubTab("telegram")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    contractsSubTab === "telegram" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isRtl ? "🤖 بوت التنبيهات الذكي" : "🤖 Notification Bot Node"}
                </button>
              </div>

              {contractsSubTab === "audit" && (
                <ContractAdvisor language={language} />
              )}

              {contractsSubTab === "telegram" && (
                <BotDashboard language={language} t={t} />
              )}
            </div>
          )}

          {/* TAP SCREEN: QUALITY & TELEMETRY */}
          {activeTab === "diagnostics" && (
            <DiagnosticsPanel 
              language={language} 
              cvData={cvData}
              onResetCv={() => {
                setCvData({
                  personal: { name: "", title: "", email: "", phone: "", location: "", website: "", summary: "" },
                  experience: [],
                  education: [],
                  projects: [],
                  languages: [],
                  skills: [],
                  selectedTemplate: "classic"
                });
                telemetry.logEvent("Wiped CV dataset to zero", "action", "Cleared CV data to allow fresh candidate profile input");
              }}
              onAutofillDemo={() => {
                setCvData(language === "ar" ? DEFAULT_CV_AR : DEFAULT_CV_EN);
              }}
            />
          )}

        </div>
      </main>
      </>
      )}

      {/* 💳 INTERACTIVE HIGH-FIDELITY BILINGUAL PRICING PLAN MODAL */}
      {isPricingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-[2rem] border border-slate-100 max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl animate-scale-up text-slate-800">
            
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600">
                  {isRtl ? "باقات واشتراكات منصة مسار" : "MASAR PREMIUM & PLANS"}
                </span>
                <h3 className="text-lg md:text-xl font-black text-slate-950 pt-1">
                  {isRtl ? "اختر الترقية المناسبة لتسريع العثور على وظيفة ⚡" : "Supercharge Your Hiring Success Rate ⚡"}
                </h3>
              </div>
              
              <button
                onClick={() => setIsPricingOpen(false)}
                className="p-2 border border-slate-100 hover:bg-slate-50 rounded-xl cursor-pointer hover:text-black font-sans leading-none text-xs text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {/* Free Plan */}
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg font-bold">Standard</span>
                    <span className="text-xs text-slate-400">{isRtl ? "متاح للأبد" : "Forever free"}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{isRtl ? "الباقة الأساسية مجاناً" : "Basic Job Seeker"}</h4>
                    <p className="text-[10.5px] text-slate-500 font-sans mt-0.5">{isRtl ? "للخريجين الجدد والباحثين عن مراجعة سريعة" : "For entry candidates reviewing their resumes"}</p>
                  </div>
                  <div className="text-2xl font-black font-sans text-slate-900">
                    $0<span className="text-xs text-slate-400 font-normal"> / Mo</span>
                  </div>
                  <ul className="space-y-2 text-[11px] text-slate-600 font-sans border-t pt-3">
                    <li className="flex items-center gap-1.5">✓ {isRtl ? "محرر سيرة ذاتية ذكي كلاسيكي" : "Classic interactive CV builder"}</li>
                    <li className="flex items-center gap-1.5">✓ {isRtl ? "دليل مكاتب التوظيف المعتمدة" : "Recruitment agency indices"}</li>
                    <li className="flex items-center gap-1.5">✓ {isRtl ? "استيراد ملفات JSON ونسخ احتياطي" : "Local state persistence"}</li>
                  </ul>
                </div>
                <button 
                  onClick={() => setIsPricingOpen(false)}
                  className="w-full py-2.5 bg-slate-200 group hover:bg-slate-300 text-slate-800 font-black text-xs rounded-xl transition cursor-pointer"
                >
                  {isRtl ? "مفعلة حالياً" : "Current Plan"}
                </button>
              </div>

              {/* Pro Plan */}
              <div className="bg-gradient-to-br from-indigo-50/20 to-indigo-100/10 border border-indigo-200 rounded-3xl p-5 space-y-4 flex flex-col justify-between relative ring-2 ring-indigo-550 ring-indigo-600/50">
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full whitespace-nowrap">
                  {isRtl ? "الأكثر مبيعاً 🔥" : "MOST POPULAR 🔥"}
                </div>
                
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-lg font-black">Pro Job Hunter</span>
                    <span className="text-xs text-indigo-500 font-bold">{isRtl ? "شعبية" : "Verified"}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{isRtl ? "الباقة الاحترافية (بلاس)" : "Pro Job Hunter Plus"}</h4>
                    <p className="text-[10.5px] text-slate-500 font-sans mt-0.5">{isRtl ? "مثالية لمن يسعون للسفر وتخطي الـ ATS الصعب" : "Unlock maximum AI ATS scores & mock trainings"}</p>
                  </div>
                  <div className="text-2xl font-black font-sans text-indigo-600">
                    $14<span className="text-xs text-slate-400 font-normal"> / Mo</span>
                  </div>
                  <ul className="space-y-2 text-[11px] text-slate-600 font-sans border-t border-indigo-100 pt-3">
                    <li className="flex items-center gap-1.5">✓ <b>{isRtl ? "فحص ATS غير محدود وصيغ مطابقة" : "Unlimited ATS Audits"}</b></li>
                    <li className="flex items-center gap-1.5">✓ {isRtl ? "صانع خطابات تقديم متميزة بالذكاء الاستباقي" : "Active cover letter generation"}</li>
                    <li className="flex items-center gap-1.5">✓ {isRtl ? "تنبيهات بوت تليجرام وبوابة واتساب" : "Instant WhatsApp/Telegram push alerts"}</li>
                    <li className="flex items-center gap-1.5">✓ {isRtl ? "تحليل وحقن المهارات المفقودة" : "Inject missing keywords automatically"}</li>
                  </ul>
                </div>
                
                <button 
                  onClick={() => {
                    alert(isRtl 
                      ? "⚡ جاري إعداد بوابة التوصيل بالدفع ومزودي الخدمات المحليين (فوري / كارت بنكي)! شكراً لاختيارك مسار بلاس." 
                      : "⚡ Instantiating localized billing gateways (Fawry / Credit card validation). Thank you for backing Masar!"
                    );
                    setIsPricingOpen(false);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  {isRtl ? "اشترك ورشح ملفك الآن" : "Upgrade to Pro Plus"}
                </button>
              </div>

              {/* Premium Executive Suite */}
              <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg font-bold">Premium Executive</span>
                    <span className="text-xs text-slate-400">{isRtl ? "شاملة" : "All-Inclusive"}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{isRtl ? "باقة التميز التنفيذي بلس" : "Premium Executive Suite"}</h4>
                    <p className="text-[10.5px] text-slate-300 font-sans mt-0.5">{isRtl ? "مخصصة للمدراء والأخصائيين المتقدمين وكافة المجالات المهنية" : "Designed for lead professionals, engineers, sales directors, and managers"}</p>
                  </div>
                  <div className="text-2xl font-black font-sans text-amber-400">
                    $24<span className="text-xs text-slate-400 font-normal"> / Mo</span>
                  </div>
                  <ul className="space-y-2 text-[11px] text-slate-300 font-sans border-t border-slate-800 pt-3">
                    <li className="flex items-center gap-1.5">✓ {isRtl ? "استيراد قالب السيرة التنفيذية الفخم للـ CV" : "Instant elegant executive timeline templates"}</li>
                    <li className="flex items-center gap-1.5">✓ {isRtl ? "مكتبة كاملة لصياغات رسائل الترشيح والتقديم" : "Full corporate cover letters and outreach templates"}</li>
                    <li className="flex items-center gap-1.5 font-bold text-amber-400">✓ {isRtl ? "فحص فوري لعروض العمل وعقود السفر" : "Advanced compliance reviews for job offers"}</li>
                    <li className="flex items-center gap-1.5">✓ {isRtl ? "تنبؤات بأسواق العمل ودراسات رواتب الخليج" : "Gulf and regional labor market & salary analyzer"}</li>
                  </ul>
                </div>
                <button 
                  onClick={() => {
                    alert(isRtl ? "🚀 جاري تحضير ميزات التميز التنفيذي لإطلاق باقة مسار بلس للمحترفين." : "🚀 Setting up your executive booster tools. Welcome to Masar Executive Plus!");
                    setIsPricingOpen(false);
                  }}
                  className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs rounded-xl transition cursor-pointer"
                >
                  {isRtl ? "تفعيل باقة التميز" : "Unlock Executive Suite"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER credit terms */}
      <footer className="max-w-7xl mx-auto text-center border-t border-slate-150 pt-8 mt-12 text-slate-400 text-[11px] px-4 font-sans no-print">
        <p>© 2026 {language === "ar" ? "مسار - البوابة المفتوحة للباحثين عن العمل." : "Masar Job Hub & Intelligent ATS CV Portal."}</p>
        <p className="mt-1 text-slate-400">{isRtl ? "مصمم بنظام فحص ATS المتوافق وعينات السير الذاتية المعتمدة" : "Rendered with embedded fonts, 2.5cm margins compliance, and Gemini AI"}</p>
      </footer>
    </div>
  );
}
