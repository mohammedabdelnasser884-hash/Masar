import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  MessageSquareCode, 
  Building2, 
  FileCheck, 
  ArrowUpRight, 
  ChevronRight, 
  UserCheck,
  Award,
  BookOpen,
  Settings,
  Scale,
  TrendingUp,
  MapPin,
  ClipboardList,
  Fingerprint,
  Mail,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeftRight
} from "lucide-react";
import { CVData } from "../types";

interface MasarJourneyHomeProps {
  language: "ar" | "en";
  cvData: CVData;
  onNavigateTab: (tabId: string, subTab?: string) => void;
  onSyncToCV: (profile: any) => void;
  activeUserName?: string;
  activeUserEmail: string;
}

export const MasarJourneyHome: React.FC<MasarJourneyHomeProps> = ({
  language,
  cvData,
  onNavigateTab,
  onSyncToCV,
  activeUserName,
  activeUserEmail
}) => {
  const isRtl = language === "ar";
  const [atsScore, setAtsScore] = useState(85);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Demo general professional profile injector
  const injectDemoProfile = () => {
    const generalProfile = {
      personal: {
        name: activeUserName || (isRtl ? "أحمد جلال" : "Ahmed Galal"),
        title: isRtl ? "مدير مشاريع وأخصائي تطوير الأعمال" : "Project Manager & Business Development Specialist",
        email: activeUserEmail || "ahmed.galal@example.com",
        phone: "+966 50 123 4567",
        location: isRtl ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia",
        website: "linkedin.com/in/ahmed-galal-pmp",
        summary: isRtl 
          ? "مدير مشاريع وتشغيل متميز ذو خبرة تفوق ٧ سنوات في قيادة فرق العمل، تحسين الكفاءة التشغيلية، ومتابعة تنفيذ المشاريع الكبرى بمصر والخليج للتأكد من موافقة معايير الجودة والتسليم في الموعد المحدد."
          : "Highly accomplished Project & Operations Manager with 7+ years of expertise in leading cross-functional teams, steering corporate growth, and managing resource allocations across Egypt and GCC markets."
      },
      skills: isRtl 
        ? ["إدارة المشاريع", "تطوير الأعمال", "كفاءة التشغيل", "التخطيط الاستراتيجي", "إدارة المخاطر", "التخطيط المالي", "قيادة فرق العمل"]
        : ["Project Management", "Business Development", "Operational Excellence", "Strategic Planning", "Risk Management", "Budgeting", "Team Leadership"],
      experience: [
        {
          id: `exp-l1-${Date.now()}`,
          company: isRtl ? "مجموعة الفطيم القابضة - الرياض" : "Al-Futtaim Group - Riyadh",
          role: isRtl ? "مدير مشاريع وتشغيل أول" : "Senior Operations & Project Manager",
          duration: "2023 - الآن",
          description: isRtl 
            ? "• الإشراف على تسليم المشاريع التجارية بنسبة نجاح تفوق الخطط التشغيلية.\n• تحسين مؤشرات الأداء الرئيسي للتشغيل بنسبة ٣٠٪ وتطوير مهارات فريق العمل المكون من ١٢ أخصائياً."
            : "• Supervised commercial project delivery surpassing operating goals by 15%.\n• Optimized team KPIs by 30% and cultivated training matrices for 12 operations specialists."
        }
      ],
      education: [
        {
          id: `edu-l1-${Date.now()}`,
          institution: isRtl ? "كلية التجارة وإدارة الأعمال - جامعة القاهرة" : "Faculty of Commerce - Cairo University",
          degree: isRtl ? "بكالوريوس إدارة الأعمال بتقدير جيد جداً" : "Bachelor of Business Administration - Very Good Grade",
          duration: "2015 - 2019"
        }
      ],
      projects: [],
      languages: [
        { id: "lang-l1", name: isRtl ? "العربية" : "Arabic", level: isRtl ? "اللغة الأم" : "Native" },
        { id: "lang-l2", name: isRtl ? "الإنجليزية" : "English", level: isRtl ? "مستوى مهني مميز" : "Professional" }
      ],
      selectedTemplate: "classic"
    };

    onSyncToCV(generalProfile);
    
    // Sleek in-UI Toast trigger instead of window.alert()
    setToastMessage(isRtl 
      ? "🪄 تم حقن وتهيئة ملفك كأخصائي تطوير أعمال وإدارة مشاريع! تفضل بالذهاب لصانع الـ CV الآن."
      : "🪄 Sample Professional profile loaded successfully! Navigate to the CV tab to review."
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return isRtl ? "صباح الخير" : "Good morning";
    if (hours < 18) return isRtl ? "مساء الخير" : "Good afternoon";
    return isRtl ? "مساء الخير" : "Good evening";
  };

  // Compute dynamic score based on cvData
  useEffect(() => {
    let score = 30; // base logic score
    if (cvData.personal?.name) score += 15;
    if (cvData.personal?.title) score += 15;
    if (cvData.personal?.summary) score += 15;
    if (cvData.experience?.length > 0) score += (cvData.experience.length * 10);
    if (cvData.skills?.length > 0) score += Math.min(15, cvData.skills.length * 2);
    score = Math.min(98, score);
    setAtsScore(score);
  }, [cvData]);

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className={`space-y-8 md:space-y-10 animate-fade-in ${isRtl ? "text-right" : "text-left"} pb-12`}>
      
      {/* 🔔 PREMIUM TOAST NOTIFICATION PORTAL */}
      {toastMessage && (
        <div className="fixed top-6 left-6 right-6 md:left-auto md:right-6 z-50 max-w-md bg-slate-900 border border-emerald-500/30 text-white rounded-2xl p-5 shadow-2xl flex items-start gap-4 animate-slide-in duration-300">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold shrink-0">✨</div>
          <div className="space-y-1 flex-1 text-right">
            <h4 className="text-xs font-black text-slate-100">{isRtl ? "تنبيه النظام الذكي" : "System Notification"}</h4>
            <p className="text-[11px] leading-relaxed text-slate-300">{toastMessage}</p>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-sans shrink-0 ml-1 bg-slate-800/50 p-1.5 px-2.5 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 🚀 STUNNING NEW GREETING HERO SECTION - COMPACTED & POLISHED */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-850 rounded-3xl p-5 md:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{isRtl ? "بوابة التميز المهني الذكية" : "Executive Vocational Control Hub"}</span>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] md:text-xs font-medium text-indigo-300/80 tracking-wider block font-sans uppercase">
                {getGreeting()}
              </span>
              <h2 className="text-xl md:text-3xl font-extrabold tracking-tight leading-snug text-white">
                {isRtl 
                  ? `${activeUserName || "عزيزنا الباحث عن التميز"}`
                  : `${activeUserName || "Professional Client"}`}
              </h2>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl font-sans font-light">
              {isRtl 
                ? "ابدأ بتصميم سيرتك الذاتية متوافقةً بالكامل مع فلاتر الـ ATS وتفادى استبعاد طلبك. تصفّح الوظائف المباشرة في الخليج ومصر وتواصل مع مكاتب التوظيف المعتمدة عبر قنوات تواصل رسمية مباشرة وبدون وسطاء."
                : "Accelerate your career trajectory: refine your profile for picky ATS screeners, scan verified Gulf postings, and pitch to licensed personnel offices directly."}
            </p>
 
            {/* Sandbox Quick Access button with gorgeous style */}
            <div className="pt-3 border-t border-slate-800/60 space-y-2">
              <p className="text-[11px] text-indigo-200/80 font-medium">
                {isRtl ? "💡 صممنا محتوى نموذجياً لملفك، هل تود حقن سيرة ذاتية جاهزة لتجربة المنصة؟" : "💡 Want to quick-start? Inject a ready-made demo profile to test the dashboard:"}
              </p>
              <button
                type="button"
                onClick={injectDemoProfile}
                className="bg-indigo-600 hover:bg-indigo-500 active:scale-98 border border-indigo-500/30 text-[11px] font-black text-white px-4 py-2 rounded-xl transition duration-150 inline-flex items-center gap-2 shadow-md shadow-indigo-600/15 cursor-pointer"
                id="inject-demo-profile-btn"
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                <span>{isRtl ? "حقن نموذج سيرة ذاتية جاهزة للمعاينة 📝" : "Load Professional Resume Sample 📝"}</span>
              </button>
            </div>
          </div>
 
          {/* Dynamic Interactive ATS Metric Gauge Panel - Slicker and tighter */}
          <div className="lg:col-span-5 bg-slate-950/90 backdrop-blur-md border border-slate-800/85 p-5 md:p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-xs md:text-sm font-bold text-slate-100">{isRtl ? "تحليل ملاءمة الـ ATS" : "ATS Quality Matrix"}</h3>
                <span className="text-[10px] text-slate-500 block leading-none">{isRtl ? "معايير تتبع المتقدمين الخليجية" : "Gulf compliance target score"}</span>
              </div>
              <span className={`font-sans font-extrabold text-[11px] md:text-xs px-2.5 py-0.5 rounded-md border ${
                atsScore >= 80 
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                  : "text-amber-400 bg-amber-500/10 border-amber-500/20"
              }`}>
                {atsScore}%
              </span>
            </div>
 
            {/* Progress Bar & Subcriteria checklist */}
            <div className="space-y-3">
              <div className="h-1.5 w-full bg-slate-900/80 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    atsScore >= 80 
                      ? "bg-gradient-to-r from-emerald-500 to-indigo-500" 
                      : "bg-gradient-to-r from-amber-500 to-indigo-500"
                  }`}
                  style={{ width: `${atsScore}%` }}
                />
              </div>
 
              {/* Dynamic Feedback Checklist based on actual CVData */}
              <div className="grid grid-cols-2 gap-2.5 text-[10px] sm:text-[11px] text-slate-400 pt-0.5 font-sans">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${cvData.personal?.name ? "text-emerald-500" : "text-slate-700"}`} />
                  <span>{isRtl ? "البيانات الأساسية" : "Bio Content"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${cvData.personal?.summary ? "text-emerald-500" : "text-slate-700"}`} />
                  <span>{isRtl ? "الملخص المهني" : "Summary Bio"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${(cvData.experience && cvData.experience.length > 0) ? "text-emerald-500" : "text-slate-700"}`} />
                  <span>{isRtl ? "سجل الخبرات" : "Experience Block"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${(cvData.skills && cvData.skills.length > 0) ? "text-emerald-500" : "text-slate-700"}`} />
                  <span>{isRtl ? "المهارات المستخرجة" : "Keyword Checklist"}</span>
                </div>
              </div>
            </div>
 
            <button
              onClick={() => onNavigateTab("cv_ats", "ats")}
              className="w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500/20 rounded-xl text-xs font-black transition cursor-pointer select-none"
              id="ats-check-nav-btn"
            >
              {isRtl ? "تشغيل الفحص التفصيلي والحقن ←" : "Run Deep ATS Optimization Scan ←"}
            </button>
          </div>
        </div>
      </div>

      {/* 📊 BENTO GRID METRICS - ULTRA POLISHED, AIRY SPACING WITH ZERO REDUNDANCY */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white border text-slate-900 border-slate-100/80 p-6 rounded-[1.75rem] space-y-3 group shadow-2xs hover:shadow-md hover:border-indigo-150 transition-all duration-300">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <TrendingUp className="w-4.5 h-4.5 shrink-0" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono tracking-wider">{isRtl ? "مؤشر جاهزية الـ ATS" : "ATS Readiness"}</span>
            <div className="text-3xl font-sans font-black text-indigo-600 mt-0.5">{atsScore}%</div>
            <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 mt-2 font-sans">
              {atsScore >= 80 ? (isRtl ? "مستوى ممتاز ومعتمد" : "Excellent compliance") : (isRtl ? "مستوى بحاجة لاستكمال" : "Needs fine tuning")}
            </p>
          </div>
        </div>

        <div className="bg-white border text-slate-900 border-slate-100/80 p-6 rounded-[1.75rem] space-y-3 group shadow-2xs hover:shadow-md hover:border-emerald-150 transition-all duration-300">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ClipboardList className="w-4.5 h-4.5 shrink-0" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono tracking-wider">{isRtl ? "الخبرات المضافة" : "Work Experiences"}</span>
            <div className="text-3xl font-sans font-black text-emerald-600 mt-0.5">{cvData.experience?.length || 0}</div>
            <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 mt-2 font-sans">
              {cvData.experience?.length ? (isRtl ? "سجل خبرات متكامل" : "No nodes input") : (isRtl ? "لم يتم الإدخال بعد" : "No entries yet")}
            </p>
          </div>
        </div>

        <div className="bg-white border text-slate-900 border-slate-100/80 p-6 rounded-[1.75rem] space-y-3 group shadow-2xs hover:shadow-md hover:border-sky-150 transition-all duration-300">
          <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
            <Fingerprint className="w-4.5 h-4.5 shrink-0" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono tracking-wider">{isRtl ? "المهارات والكلمات" : "Keywords & Skills"}</span>
            <div className="text-3xl font-sans font-black text-sky-600 mt-0.5">{cvData.skills?.length || 0}</div>
            <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 mt-2 font-sans">
              {cvData.skills?.length ? (isRtl ? "كلمات مفتاحية فعالة" : "Indexed keywords") : (isRtl ? "بانتظار الإضافة" : "Ready to feed")}
            </p>
          </div>
        </div>

        <div className="bg-white border text-slate-900 border-slate-100/80 p-6 rounded-[1.75rem] space-y-3 group shadow-2xs hover:shadow-md hover:border-amber-150 transition-all duration-300">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Building2 className="w-4.5 h-4.5 shrink-0" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono tracking-wider">{isRtl ? "مكاتب التوظيف المعتمدة" : "Licensed Agencies"}</span>
            <div className="text-3xl font-sans font-black text-amber-600 mt-0.5">58</div>
            <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 mt-2 font-sans">
              {isRtl ? "قنوات اتصال مباشرة" : "Direct channels loaded"}
            </p>
          </div>
        </div>
      </section>

      {/* 🧭 PREMIUM FLAT DESIGN CARDS HUB - HIGHLY SPACIOUS & AIRY */}
      <section className="space-y-6">
        <div className="border-b pb-3 border-slate-100">
          <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase font-mono">
            {isRtl ? "أقسام التنقل المهني السريع والمباشر 🧭" : "CORE SYSTEM DIRECTIVES 🧭"}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: isRtl ? "صناعة السيرة الذاتية" : "CV & Profile Builder",
              description: isRtl ? "تحرير بياناتك، مهاراتك، فحص الـ ATS وقوالب جاهزة للتصدير المباشر" : "Complete experience records and inject smart templates with instant preview",
              icon: FileText,
              tab: "cv_ats",
              subTab: "edit",
              badge: isRtl ? "الملف الأساسي" : "Essential",
              color: "border-slate-100/80 hover:border-indigo-500 hover:shadow-indigo-500/5 hover:bg-indigo-50/5 text-indigo-600"
            },
            {
              title: isRtl ? "الفرص والوظائف النشطة" : "Active Vacancies",
              description: isRtl ? "استكشف الشواغر المتاحة محلياً وفي الخليج ومطابقتها التلقائية مع خبراتك" : "Browse open matching roles and track your application compliance",
              icon: Briefcase,
              tab: "jobs",
              subTab: "board",
              badge: isRtl ? "الفرص الحية" : "Live Feed",
              color: "border-slate-100/80 hover:border-emerald-500 hover:shadow-emerald-500/5 hover:bg-emerald-50/5 text-emerald-600"
            },
            {
              title: isRtl ? "مكاتب التوظيف المعتمدة" : "Recruitment Bureau Directory",
              description: isRtl ? "أضخم دليل للمكاتب والأصحاب المعتمدين مع واتساب مباشر لتقديم السير الذاتية" : "Verified Egyptian agency index with direct recruitment email & verified WhatsApp link",
              icon: Building2,
              tab: "networking",
              subTab: "agencies",
              badge: isRtl ? "محدّث بالكامل" : "Massive List",
              color: "border-slate-100/80 hover:border-amber-500 hover:shadow-amber-500/5 hover:bg-amber-50/5 text-amber-600"
            },
            {
              title: isRtl ? "محاكي المقابلات بالذكاء الاصطناعي" : "AI Vocal Mock Interview",
              description: isRtl ? "تدرب عملياً بصوتك وأجب على أسئلة لجان الاستماع مع مراجعة وتقييم فوري" : "Vocal evaluation drills and tailored realworld simulation feedback",
              icon: MessageSquareCode,
              tab: "interview",
              subTab: "",
              badge: isRtl ? "جاهز مائة بالمائة" : "Practice Ready",
              color: "border-slate-100/80 hover:border-purple-500 hover:shadow-purple-500/5 hover:bg-purple-50/5 text-purple-600"
            },
            {
              title: isRtl ? "فاحص عروض العمل وعقود السفر" : "Job Offer & Contract Advisor",
              description: isRtl ? "مستشارك الذكي لتحليل بنود عقود العمل وعروض الوظائف وحمايتك من الشروط غير العادلة" : "Evaluate foreign job offers, salary criteria, benefit packages, and travel requirements",
              icon: FileCheck,
              tab: "contracts",
              subTab: "audit",
              badge: isRtl ? "حماية وامتثال" : "Legal Assessor",
              color: "border-slate-100/80 hover:border-rose-500 hover:shadow-rose-500/5 hover:bg-rose-50/5 text-rose-600"
            },
            {
              title: isRtl ? "إعدادات وتصدير النظام" : "Global Settings",
              description: isRtl ? "إدارة التزامن الاحتياطي، تحميل البيانات، وتخصيص إعدادات مسار بلس" : "Manage local caches, check credentials, import exports, and system controls",
              icon: Settings,
              tab: "diagnostics",
              subTab: "",
              badge: isRtl ? "لوحة التحكم" : "Administrator",
              color: "border-slate-100/80 hover:border-slate-600 hover:shadow-xs hover:bg-slate-50 text-slate-700"
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                onClick={() => onNavigateTab(item.tab, item.subTab)}
                className={`bg-white border rounded-[1.75rem] p-6 cursor-pointer group transition-all duration-200 flex flex-col justify-between h-[11.5rem] shadow-sm hover:scale-[1.02] ${item.color}`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="p-2.5 border bg-slate-50 group-hover:bg-white rounded-xl transition duration-150">
                      <Icon className="w-5 h-5 text-inherit shrink-0" />
                    </span>
                    <span className="text-[9px] font-extrabold uppercase font-sans border tracking-wider px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600">
                      {item.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition tracking-wide">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-sans mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end text-[10px] text-slate-400 group-hover:text-slate-950 transition-all font-extrabold font-sans pt-2">
                  <span>{isRtl ? "ابدأ الآن" : "Launch Option"}</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition shrink-0 ml-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
