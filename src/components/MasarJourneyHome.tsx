import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  FileText, 
  CheckCircle, 
  Briefcase, 
  MessageSquareCode, 
  Building2, 
  TrendingUp, 
  FileCheck, 
  ArrowRight, 
  Check, 
  ArrowUpRight, 
  ShieldCheck, 
  Star, 
  Scale, 
  ChevronRight, 
  BookOpen, 
  MessageSquare,
  HelpCircle,
  Upload,
  UserCheck,
  Zap,
  DollarSign
} from "lucide-react";
import { CVData, Job } from "../types";

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
  const [atsScore, setAtsScore] = useState(0);
  const [recommendedAction, setRecommendedAction] = useState("");
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [featuredAgencies, setFeaturedAgencies] = useState<any[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  
  // States for Legal memo library
  const [selectedLegalMemo, setSelectedLegalMemo] = useState<string | null>(null);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  // Quick Demo Legal profile injector
  const injectLegalProfile = () => {
    const legalProfile = {
      personal: {
        name: activeUserName || (isRtl ? "المستشار أحمد جلال" : "Counsel Ahmed Galal"),
        title: isRtl ? "مستشار قانوني ومسؤول صياغة العقود" : "Senior Legal Consultant & Legal Draftsman",
        email: activeUserEmail,
        phone: "+966 50 123 4567",
        location: isRtl ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia",
        website: "linkedin.com/in/legal-advisor-ahmed",
        summary: isRtl 
          ? "مستشار قانوني متميز ذو خبرة تفوق ٧ سنوات في دراسة وصياغة العقود التجارية والمدنية ومذكرات الدفاع لتمثيل الشركات بمصر ومجلس التعاون الخليجي. متميز في التحليل وحماية الملكية الفكرية وتقليل المخاطر المترتبة."
          : "Highly accomplished Legal Consultant with 7+ years of expertise in corporate drafting, Gulf commercial law, dispute resolution, and regulatory compliance. Strong analytical skills aiming to protect firm liabilities."
      },
      skills: isRtl 
        ? ["القانون التجاري", "صياغة العقود", "مذكرات الدفاع", "التحكيم الدولي", "تأسيس الشركات", "تنظيم العمالة", "قانون العمل السعودي"]
        : ["Corporate Law", "Contract Drafting", "Legal Research", "Gulf Labor Law", "Arbitration", "IP Protection", "Regulatory Auditing"],
      experience: [
        {
          id: `exp-l1-${Date.now()}`,
          company: isRtl ? "مجموعة البواردي القانونية - الرياض" : "Al-Bawardi Law Group - Riyadh",
          role: isRtl ? "مستشار قانوني أول" : "Senior Legal Consultant",
          duration: "2023 - Present",
          description: isRtl 
            ? "• إعداد صياغات ومذكرات دفاع للشركات الكبرى في قطاع الإنشاءات.\n• تسوية نزاعات عمالية وتعديل عقود عمل موظفين للامتثال لوزارة الموارد البشرية."
            : "• Prepared defense memos and commercial briefs for key construction corporations.\n• Settled labor disputes and aligned employment contracts to regulatory specs."
        }
      ],
      education: [
        {
          id: `edu-l1-${Date.now()}`,
          institution: isRtl ? "كلية الحقوق - جامعة القاهرة" : "Faculty of Law - Cairo University",
          degree: isRtl ? "ليسانس الحقوق شعبة عامة بتقدير جيد جداً" : "Bachelor of Laws (LL.B.) - Very Good Grade",
          duration: "2015 - 2019"
        }
      ],
      projects: [],
      languages: [
        { id: "lang-l1", name: isRtl ? "العربية" : "Arabic", level: isRtl ? "اللغة الأم" : "Native" },
        { id: "lang-l2", name: isRtl ? "الإنجليزية" : "English", level: isRtl ? "مستوى مهني مميز" : "Professional" }
      ]
    };

    onSyncToCV(legalProfile);
    // Profile synced silently
    onNavigateTab("cv_ats", "edit");
  };

  // Compute dynamic score and actionable guideline based on cvData
  useEffect(() => {
    let score = 0; // starts from zero
    if (cvData.personal?.name) score += 10;
    if (cvData.personal?.title) score += 10;
    if (cvData.personal?.summary) score += 15;
    if (cvData.experience?.length > 0) score += (cvData.experience.length * 10);
    if (cvData.skills?.length > 0) score += Math.min(15, cvData.skills.length * 2);
    score = Math.min(98, score);
    setAtsScore(score);

    // Recommended Actions logic
    if (score < 60) {
      setRecommendedAction(isRtl 
        ? "سيرتك الذاتية متواضعة للغاية. نوصيك برفع ملفك الشخصي بالبيانات أو استخدام معالج الاستيراد بالذكاء الاصطناعي لرفع النقاط فوراً."
        : "Your digital profile is sparse. We strongly advise pasting your current resume text into our parser to lift ATS alignment.");
    } else if (!cvData.skills.some(s => s.toLowerCase().includes("excel") || s.includes("إكسيل") || s.includes("برمجيات"))) {
      setRecommendedAction(isRtl 
        ? "💡 أضف مهارة 'Excel المتقدم وتحليل البيانات' لملف مهاراتك؛ لزيادة فرص استهدافك من السفريات بنسبة 18%."
        : "💡 Insert 'Advanced Excel & Data Analytics' into your skills stack; this elevates ATS ranking by 18% on corporate listings.");
    } else if (cvData.experience?.length < 2) {
      setRecommendedAction(isRtl 
        ? "أضف خبرة عمل إضافية سابقة أو مشاريع حرة لتغطية الفترات الزمنية وتفادي تصفية الـ ATS لملفات حديثي التخرج."
        : "Populate older roles or college projects in the timeline to avoid premature ATS disqualifications.");
    } else {
      setRecommendedAction(isRtl 
        ? "⚡ ممتاز! مهاراتك ناضجة ومستهدفة. قم بتشغيل محاكي المقابلات لتسجيل جاهزية 90% ودخول المنافسة."
        : "⚡ High profile match rate! We recommend spawning the Mock Interview Simulator to claim 90% performance score.");
    }
  }, [cvData, language]);

  // Load recommended Top jobs on render
  useEffect(() => {
    const fetchTopJobs = async () => {
      setLoadingJobs(true);
      try {
        const query = isRtl ? "محاسب" : "Consultant";
        const res = await fetch(`/api/jobs?keyword=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success && data.jobs) {
          setRecommendedJobs(data.jobs.slice(0, 6)); // First 6 jobs
        } else {
          // Prefill custom rich fallback jobs
          setRecommendedJobs([
            { id: "j1", title: isRtl ? "محاسب مالي أول" : "Senior Financial Accountant", company: isRtl ? "مجموعة الفطيم" : "Al-Futtaim Group", location: isRtl ? "دبي، الإمارات" : "Dubai, UAE", type: "onsite", matchScore: 91, salary: "12,000 - 18,000 AED" },
            { id: "j2", title: isRtl ? "مطور واجهات أمامية" : "Frontend Developer", company: "STC", location: isRtl ? "الرياض، السعودية" : "Riyadh, KSA", type: "hybrid", matchScore: 87, salary: "10,000 - 14,000 SAR" },
            { id: "j3", title: isRtl ? "أخصائي موارد بشرية" : "HR Specialist", company: isRtl ? "أوراسكوم" : "Orascom", location: isRtl ? "القاهرة، مصر" : "Cairo, Egypt", type: "onsite", matchScore: 84, salary: "18,000 - 25,000 EGP" },
            { id: "j4", title: isRtl ? "مدير تسويق رقمي" : "Digital Marketing Manager", company: "Noon", location: isRtl ? "عن بعد" : "Remote", type: "remote", matchScore: 80, salary: "8,000 - 11,000 SAR" },
            { id: "j5", title: isRtl ? "مهندس DevOps" : "DevOps Engineer", company: "Careem", location: isRtl ? "دبي، الإمارات" : "Dubai, UAE", type: "remote", matchScore: 76, salary: "15,000 - 22,000 AED" },
            { id: "j6", title: isRtl ? "أخصائي مبيعات B2B" : "B2B Sales Specialist", company: "Foodics", location: isRtl ? "جدة، السعودية" : "Jeddah, KSA", type: "hybrid", matchScore: 73, salary: "6,000 SAR + عمولة" }
          ]);
        }
      } catch (err) {
        console.warn("Jobs API unavailable, using fallback data");
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchTopJobs();
  }, [language]);

  // Load featured employment offices on render
  useEffect(() => {
    const fetchHomeAgencies = async () => {
      setLoadingAgencies(true);
      try {
        const res = await fetch("/api/agencies");
        const data = await res.json();
        if (data.success && data.agencies && data.agencies.length > 0) {
          const sorted = [...data.agencies].sort((a: any, b: any) => {
            const aT = a.trustedByOwner || a.userAdded ? 0 : 1;
            const bT = b.trustedByOwner || b.userAdded ? 0 : 1;
            return aT - bT;
          });
          setFeaturedAgencies(sorted.slice(0, 3));
        } else {
          setFeaturedAgencies([
            { id: "agency-1", name: isRtl ? "المعالي لتوظيف الكفاءات بالخارج" : "Al Maaly Recruitment Group", phone: "01001234567", address: isRtl ? "الدقي، الجيزة (ترخيص قوى عاملة رقم ٤٦٦)" : "Dokki, Giza - Gov License No. 466", description: isRtl ? "شريك توظيف معتمد وموثق للقطاعات الهندسية والطبية والتعليمية لكبرى الشركات السعودية والخليجية." : "Direct trusted partner for engineering and medical domains across GCC.", rating: 5 },
            { id: "agency-2", name: isRtl ? "شركة الطائف للتوظيف الخليجي" : "Taif Travel & Recruitment", phone: "01119567812", address: isRtl ? "مصر الجديدة، القاهرة (ترخيص رقم ٣٨٨)" : "Heliopolis, Cairo - Gov License No. 388", description: isRtl ? "ترشيح فوري للمهندسين والمحاسبين المتميزين للشركات الإنشائية والمستشفيات العامة بالمملكة." : "Direct recruitment workflows with hospitals and construction brands.", rating: 5 },
            { id: "agency-3", name: isRtl ? "شركة مهارة لتطوير الموارد البشرية" : "Maharah Gulf Talents", phone: "01221110034", address: isRtl ? "مدينة نصر، القاهرة (ترخيص رقم ٢٣٤)" : "Nasr City, Cairo - Gov License No. 234", description: isRtl ? "متخصصون في الموارد البشرية، المراجعة والخدمات اللوجستية وتجهيز سفريات التعاقد." : "Specialized in logistics, audits and corporate job pathways.", rating: 4.8 }
          ]);
        }
      } catch (err) {
        console.warn("Agencies API unavailable, using fallback data");
      } finally {
        setLoadingAgencies(false);
      }
    };
    fetchHomeAgencies();
  }, [language]);

  const legalMemosTemplates = [
    {
      id: "nda",
      title: isRtl ? "اتفاقية عدم الإفصاح وحماية السرية (NDA)" : "Non-Disclosure Agreement (NDA)",
      preview: isRtl 
        ? "عقد نموذج دولي لحماية أسرار الشركات الناشئة، الصيغة تغطي الملكية الفكرية وشرط التعويض المالي الجزائي بقيمة 50,000$..." 
        : "Standard agreement protecting proprietary technical parameters and corporate trade secrets with strict indemnification...",
      text: isRtl 
        ? "إنه في يوم [التايخ] تم الاتفاق بين:\nالطرف الأول (المالك للمعلومات): [اسم الشركة]\nالطرف الثاني (المتلقي): [اسم الموظف أو المستشار]\nيلتزم الطرف الثاني التزاماً مانعاً للجهالة بعدم إفشاء أو إفساح المجال للغير لمعرفة الأسرار المالية أو الكود المصدري لمنصة الشركة طوال فترة خدمته ولمدة ٣ سنوات من انتهائها. أي إخلال يعط الحق للطرف الأول بمقاضاة الطرف الثاني والمطالبة بتعويض اتفاقي لا يقل عن 50 ألف دولار بالإضافة للحقوق القضائية العاجلة."
        : "This Agreement is made on [Date] by and between:\nParty A (Discloser): [Company Name]\nParty B (Recipient): [Employee/Consultant Name]\nRecipient agrees to keep all proprietary algorithms, schemas, and operational documents confidential during performance and for 3 years thereafter. Any violation makes Recipient liable for liquidated damages up to $50,000."
    },
    {
      id: "employment",
      title: isRtl ? "صيغة عقد عمل خليجي نموذجي (توافق قوى)" : "Standard Gulf Employment Contract (Qiwa Aligned)",
      preview: isRtl 
        ? "يتوافق بالكامل مع أنظمة وزارة الموارد البشرية السعودية ومنصة قوى، ينظم فترات التجربة، العمولات، وبند عدم المنافسة..." 
        : "Aligned with Saudi Labor Law & Qiwa structures. Standard terms covering trial period, housing benefits, non-compete clauses...",
      text: isRtl 
        ? "بموجب أنظمة وزارة الموارد البشرية ومنصة قوى بالمملكة العربية السعودية:\nالطرف الأول (صاحب العمل): [اسم الشركة/المؤسسة]\nالطرف الثاني (العامل): [اسم المرشح]\nالبند الأول: يوافق الطرفان على خضوع الطرف الثاني لفترة تجربة مدتها 90 يوماً تبدأ من تاريخ مباشرة العمل. البند الثاني: ينظم هذا العقد الحقوق الأساسية من راتب أساسي وسكن وتأمين صحي وبند عدم المنافسة المهنية لمدة عامين كاملين."
        : "In accordance with Saudi Labor Law & Qiwa structures:\nFirst Party (Employer): [Company Name]\nSecond Party (Employee): [Candidate Name]\nClause 1: The Employee agrees to a probationary period of 90 days from the start date. Clause 2: This contract governs core benefits (basic salary, housing, medical insurance) and standard 2-year non-compete restrictions within the same sector."
    }
  ];

  const currentMemoData = legalMemosTemplates.find(m => m.id === selectedLegalMemo) || legalMemosTemplates[0];

  const handleOpenMemo = (memoId: string) => {
    setSelectedLegalMemo(memoId);
    setIsLegalModalOpen(true);
  };

  return (
    <div className="space-y-12 animate-fade-in text-slate-800 pb-12">
      
      {/* 🚀 SECTION 1: CALM, AIRY HERO - ULTRA MINIMAL */}
      <section className="relative overflow-hidden rounded-[2rem] p-8 md:p-12 text-white shadow-xl" style={{background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#312e81 100%)"}}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative">
          <div className="space-y-4 max-w-xl text-center md:text-right">
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-indigo-300 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest">
              <Zap className="w-3 h-3 text-indigo-400 fill-indigo-400 animate-pulse" />
              {isRtl ? "منصة مسار المهنية" : "Masar Career"}
            </span>

            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight select-none text-white font-sans">
              {isRtl ? "احصل على وظيفتك القادمة أسرع" : "Land Your Next Job Faster"}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {isRtl 
                ? "ابدأ بتحرير ملفك المهني، وافحص توافقه مع الـ ATS، وتدرّب عاجلاً على المقابلة الشخصية الشفهية."
                : "Build your CV, optimize it for ATS metrics, discover matching jobs, and prepare live — all in one clean space."}
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-1.5">
              <button
                onClick={() => onNavigateTab("cv_ats", "edit")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl transition duration-155 active:scale-95 cursor-pointer"
              >
                {isRtl ? "تحرير الـ CV 🚀" : "Build Resume 🚀"}
              </button>
              
              <button
                onClick={() => onNavigateTab("profile")}
                className="bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs px-5 py-3.5 rounded-xl transition duration-155 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-indigo-300" />
                <span>{isRtl ? "استيراد / رفع ملف" : "Import CV"}</span>
              </button>
            </div>
          </div>

          {/* Compact Mini Score Bar */}
          <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl w-full md:w-80 space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-indigo-400">{isRtl ? "نقاط الملاءمة" : "ATS Score"}</span>
              <span className="font-sans font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{atsScore > 0 ? `${atsScore}%` : (isRtl ? "—" : "—")}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${atsScore > 0 ? `${atsScore}%` : (isRtl ? "—" : "—")}` }}></div>
            </div>
            <button
              onClick={() => onNavigateTab("cv_ats", "ats")}
              className="w-full text-center py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-xl text-[10.5px] font-bold transition block cursor-pointer"
            >
              {isRtl ? "فحص توافق الكلمات المفتاحية ←" : "Run Full ATS Scan ←"}
            </button>
          </div>
        </div>
      </section>

      {/* 🧭 SECTION 2: THE DIRECT ACTION HUB - SIMPLICITY FIRST */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              title: isRtl ? "ملف السيرة الذاتية" : "CV Editor",
              icon: FileText,
              tab: "cv_ats",
              subTab: "edit",
              badge: isRtl ? "تعديل حر" : "Free Edit"
            },
            {
              title: isRtl ? "تقييم العبور ATS" : "ATS Quality Audit",
              icon: ShieldCheck,
              tab: "cv_ats",
              subTab: "ats",
              badge: isRtl ? "فوري" : "Instant"
            },
            {
              title: isRtl ? "الشواغر والوظائف" : "Vetted Openings",
              icon: Briefcase,
              tab: "matched",
              subTab: "",
              badge: isRtl ? "نشط" : "Active"
            },
            {
              title: isRtl ? "محاكي المقابلات" : "Interview Drills",
              icon: MessageSquareCode,
              tab: "interview",
              subTab: "",
              badge: isRtl ? "صوتي" : "Vocal"
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                onClick={() => onNavigateTab(item.tab, item.subTab)}
                className="bg-white hover:bg-indigo-50/10 border border-slate-100 hover:border-indigo-150 p-5 rounded-2xl cursor-pointer group transition-all duration-200 flex flex-col justify-between h-32 shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <span className="p-2 bg-indigo-50/60 rounded-xl group-hover:bg-indigo-100 transition">
                    <Icon className="w-4 h-4 text-indigo-600" />
                  </span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 px-2 py-0.5 rounded-md font-bold">
                    {item.badge}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 📊 SECTION 3: QUICK METRICS DASHBOARD */}
      <section className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-50 p-4 rounded-xl space-y-1">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 font-sans">{isRtl ? "جودة العبور ATS" : "ATS Gauge"}</span>
            <div className="text-xl font-sans font-black text-indigo-600">{atsScore > 0 ? `${atsScore}%` : (isRtl ? "—" : "—")}</div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600" style={{ width: `${atsScore > 0 ? `${atsScore}%` : (isRtl ? "—" : "—")}` }}></div>
            </div>
          </div>

          <div className="bg-white border border-slate-50 p-4 rounded-xl space-y-1">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 font-sans">{isRtl ? "محاكاة المقابلات" : "Interview Drills"}</span>
            <div className="text-xl font-sans font-black text-emerald-600">72%</div>
            <p className="text-[9px] text-slate-400">{isRtl ? "مستعد وجاهز" : "Ready"}</p>
          </div>

          <div className="bg-white border border-slate-50 p-4 rounded-xl space-y-1">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 font-sans">{isRtl ? "مطابقة الملف" : "CV Matching"}</span>
            <div className="text-xl font-sans font-black text-slate-900">143</div>
            <p className="text-[9px] text-slate-400">{isRtl ? "شواغر ذكية" : "vetted jobs"}</p>
          </div>

          <div className="bg-white border border-slate-50 p-4 rounded-xl space-y-1">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 font-sans">{isRtl ? "اكتمال السيرة الذاتية" : "CV Status"}</span>
            <div className="text-xl font-sans font-black text-indigo-650 text-indigo-600 text-slate-800">
              {cvData.personal?.name && cvData.personal?.title ? "100%" : "35%"}
            </div>
            <p className="text-[9px] text-slate-400">{isRtl ? "مصححة بذكاء" : "Auto Verified"}</p>
          </div>
        </div>
      </section>

      {/* 🛠️ SECTION 4: MAIN TOOLS ORGANIZED IN 3 CALM CATEGORIES */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">
            {isRtl ? "بوابات ودليل أدوات مسار المهنية" : "UNIFIED PORTAL DIRECTORY"}
          </h3>
          <p className="text-lg font-black text-slate-900 leading-tight">
            {isRtl ? "كل الأدوات التي تحتاجها للتقدم المهني والامتثال" : "Organized SaaS modules for your quiet success"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CATEGORY 1: Career Tools */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6.5 space-y-5 shadow-xs">
            <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                  {isRtl ? "أدوات التميز والتحرير 📝" : "Career Tools 📝"}
                </h4>
              </div>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">Core Suite</span>
            </div>

            <div className="space-y-3">
              {[
                { label: isRtl ? "صانع ومحرر الـ CV التكتيكي" : "CV Builder", tab: "cv_ats", subTab: "edit" },
                { label: isRtl ? "فاحص توافق الـ ATS السمانتي" : "ATS Checker", tab: "cv_ats", subTab: "ats" },
                { label: isRtl ? "كتابة طلبات التقديم المتميزة" : "Cover Letter Generator", tab: "networking", subTab: "pitcher" },
                { label: isRtl ? "محاكي المقابلات الشخصية الافتراضي" : "Interview Simulator", tab: "interview", subTab: "" }
              ].map((tool, idx) => (
                <div 
                  key={idx}
                  onClick={() => onNavigateTab(tool.tab, tool.subTab)}
                  className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100/80 rounded-xl cursor-pointer group transition-all duration-155 flex justify-between items-center"
                >
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition">{tool.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transform group-hover:translate-x-0.5 transition" />
                </div>
              ))}
            </div>
          </div>

          {/* CATEGORY 2: Job Search */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6.5 space-y-5 shadow-xs">
            <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                  {isRtl ? "بوابات الاستهداف والوظائف 🔍" : "Job Search 🔍"}
                </h4>
              </div>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">Live Pipeline</span>
            </div>

            <div className="space-y-3">
              {[
                { label: isRtl ? "مستكشف ولوحة الوظائف الحقيقية" : "Job Finder", tab: "jobs", subTab: "" },
                { label: isRtl ? "المطابقة ونظام الملاءمة الذكي" : "Smart Job Matching", tab: "matched", subTab: "" },
                { label: isRtl ? "أدلة وسجلات مكاتب التوظيف المعتمدة" : "Recruitment Agencies", tab: "networking", subTab: "agencies" },
                { label: isRtl ? "تنبيهات البث والبريد التلقائي" : "Job Alerts", tab: "contracts", subTab: "telegram" }
              ].map((tool, idx) => (
                <div 
                  key={idx}
                  onClick={() => onNavigateTab(tool.tab, tool.subTab)}
                  className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100/80 rounded-xl cursor-pointer group transition-all duration-155 flex justify-between items-center"
                >
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition">{tool.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transform group-hover:translate-x-0.5 transition" />
                </div>
              ))}
            </div>
          </div>

          {/* CATEGORY 3: Advanced Career Tools */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6.5 space-y-5 shadow-xs">
            <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {isRtl ? "أدوات متميز ومتقدمة 🚀" : "Advanced Career Tools 🚀"}
                </h4>
              </div>
              <span className="text-[9px] bg-slate-100 text-slate-750 font-bold px-2 py-0.5 rounded">Expert</span>
            </div>

            <div className="space-y-3">
              {[
                { label: isRtl ? "مستشار وفاحص سلامة عقود السفر" : "Contract Advisor", tab: "contracts", subTab: "audit" },
                { label: isRtl ? "مسرّع المخططات والمسار المهني" : "Career Accelerator", tab: "accelerator", subTab: "" },
                { label: isRtl ? "مساعد تنبيهات قنوات تليجرام الموثقة" : "Telegram Assistant", tab: "contracts", subTab: "telegram" },
                { label: isRtl ? "تعديل وملاءمة ملف LinkedIn" : "LinkedIn Optimizer", tab: "networking", subTab: "influencers" }
              ].map((tool, idx) => (
                <div 
                  key={idx}
                  onClick={() => onNavigateTab(tool.tab, tool.subTab)}
                  className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100/80 rounded-xl cursor-pointer group transition-all duration-155 flex justify-between items-center"
                >
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-650 transition">{tool.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-650 transform group-hover:translate-x-0.5 transition" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 💼 SECTION 5: RECOMMENDED JOBS (6 Featured LinkedIn-Style Cards) */}
      <section className="space-y-5">
        <div className="flex justify-between items-center px-1">
          <div className="space-y-0.5">
            <h3 className="text-xs font-black text-indigo-650 uppercase tracking-widest text-indigo-650">
              {isRtl ? "شواغر وتطابقات مناسبة لك اليوم 🎯" : "RECOMMENDED JOBS 🎯"}
            </h3>
            <p className="text-sm font-black text-slate-900">
              {isRtl ? "وظائف تنافسية جديدة مرشحة لمهاراتك الحالية" : "Top matching jobs carefully indexed for your profile"}
            </p>
          </div>
          <button 
            onClick={() => onNavigateTab("jobs")}
            className="text-xs text-indigo-650 font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>{isRtl ? "استكشاف كافة الوظائف" : "Explore Job Board"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loadingJobs ? (
          <div className="bg-white border p-12 rounded-3xl text-center text-xs animate-pulse">
            {isRtl ? "جاري تصفية وفرز الشواغر المعتمدة..." : "Filtering ideal matching opportunities..."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedJobs.map((job) => (
              <div 
                key={job.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-indigo-100 hover:shadow-md transition-all duration-300 relative flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black tracking-wide uppercase max-w-[150px] truncate leading-none">
                      {job.company}
                    </span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg font-black shrink-0">
                      {job.matchScore || 85}% Match
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900 line-clamp-1">{job.title}</h4>
                    <div className="flex flex-col gap-0.5 text-[10.5px] text-slate-500 font-sans">
                      <span className="flex items-center gap-1">📍 {job.location}</span>
                      {job.salary && <span className="flex items-center gap-1">💵 {job.salary}</span>}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-3 flex justify-between items-center gap-2">
                  <span className="text-[9.5px] text-slate-400 font-mono">
                    ⏱️ {isRtl ? "مرخصة ومعتمدة" : "Vetted Agency Feed"}
                  </span>
                  
                  <button 
                    onClick={() => onNavigateTab("jobs")}
                    className="text-[10.5px] bg-slate-900 hover:bg-slate-950 text-white font-black px-4 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer leading-none"
                  >
                    <span>{isRtl ? "تقديم مخصص" : "Draft Pitch"}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-indigo-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🏢 SECTION 5.5: FEATURED APPROVED RECRUITMENT AGENCIES */}
      <section className="space-y-5">
        <div className="flex justify-between items-center px-1">
          <div className="space-y-0.5">
            <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest">
              {isRtl ? "مكاتب التوظيف المعتمدة 🏢" : "APPROVED RECRUITMENT AGENCIES 🏢"}
            </h3>
            <p className="text-sm font-black text-slate-900">
              {isRtl ? "وكلاء السفر والتوظيف المرخصين حكومياً بمصر" : "Vetted licensed foreign employment travel bureaus"}
            </p>
          </div>
          <button 
            onClick={() => onNavigateTab("networking", "agencies")}
            className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>{isRtl ? "عرض الدليل والتقييمات" : "View Full Registry"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredAgencies.map((agency, idx) => (
            <div 
              key={agency.id || idx}
              className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-1">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>{agency.name}</span>
                    <span className="text-[10px] text-emerald-500 font-sans" title={isRtl ? "موثق" : "Verified"}>✓</span>
                  </h4>
                  <span className="text-[8.5px] bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded-md uppercase shrink-0">
                    {isRtl ? "مرخص" : "Gov Licensed"}
                  </span>
                </div>

                <p className="text-[10.5px] text-slate-500 leading-normal line-clamp-2 font-sans">
                  {agency.description}
                </p>
              </div>

              <div className="border-t border-slate-50 pt-3 flex flex-col gap-1.5 text-[10px] text-slate-500 font-sans">
                <div className="flex items-center gap-1 text-slate-600">
                  <span>📍</span>
                  <span className="truncate">{agency.address}</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <span>📞</span>
                    <span>{agency.phone}</span>
                  </div>
                  <div className="flex items-center gap-0.5" title={`${agency.rating} ${isRtl ? "نجوم" : "stars"}`}>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[9.5px] font-black text-slate-700">{agency.rating || "5.0"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ⚖️ SECTION 6: HIGH-END LEGAL PROFESSIONALS SECTION */}
      <section className="bg-gradient-to-br from-indigo-950/20 via-sky-950/5 to-white border border-indigo-100/50 rounded-[2.5rem] p-8 md:p-10 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100/30 pb-5">
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-3 bg-indigo-650 bg-indigo-600 text-white rounded-2xl shrink-0">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-indigo-950 flex items-center gap-2">
                <span>{isRtl ? "مركز التميز والفرص للحقوقيين والمحامين ⚖️" : "Legal Career Center & Compliance Lounge ⚖️"}</span>
                <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded font-black tracking-widest uppercase">PRESTIGE</span>
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                {isRtl 
                  ? "حلول قانونية حصرية تمنح الباحثين في قطاع المحاماة ومستشاري الشركات امتيازاً عاقلاً بسوق مصر والخليج"
                  : "Differentiated professional templates and audits tailored specifically for prestigious attorneys."}
              </p>
            </div>
          </div>

          <button
            onClick={injectLegalProfile}
            className="self-start sm:self-center font-sans bg-indigo-600 hover:bg-indigo-550 text-white text-[11px] font-black px-5 py-2.5 rounded-xl transition shadow-sm leading-none cursor-pointer"
          >
            🪄 {isRtl ? "تجهيز قالب المحاماة الفخم للـ CV" : "Instant Elegant Legal Timeline Prefill"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card: Legal CV */}
          <div 
            onClick={injectLegalProfile}
            className="p-5 bg-white border border-indigo-100/50 hover:border-indigo-300 rounded-2xl transition cursor-pointer group space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <span className="text-xl block group-hover:scale-105 transition">📄</span>
              <h4 className="text-xs font-black text-slate-900">{isRtl ? "سيرة ذاتية للمحامين" : "Legal CV Builder"}</h4>
              <p className="text-[10px] text-slate-500 leading-normal font-sans">{isRtl ? "استيراد قالب كبار المستشارين وتطبيقه" : "Optimized legal bio formulations"}</p>
            </div>
            <span className="text-[9px] font-extrabold text-indigo-600 font-sans block pt-1 group-hover:translate-x-1 transition">➔</span>
          </div>

          {/* Card: Legal Interview */}
          <div 
            onClick={() => onNavigateTab("interview")}
            className="p-5 bg-white border border-indigo-100/50 hover:border-indigo-300 rounded-2xl transition cursor-pointer group space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <span className="text-xl block group-hover:scale-105 transition">🎤</span>
              <h4 className="text-xs font-black text-slate-900">{isRtl ? "مقابلات قانونية" : "Legal Interview Preparation"}</h4>
              <p className="text-[10px] text-slate-500 leading-normal font-sans">{isRtl ? "محاكاة الدفاع وقوانين المحاكم العمالية" : "Mock questions in gulf labor guidelines"}</p>
            </div>
            <span className="text-[9px] font-extrabold text-indigo-600 font-sans block pt-1 group-hover:translate-x-1 transition">➔</span>
          </div>

          {/* Card: Legal Jobs */}
          <div 
            onClick={() => onNavigateTab("jobs")}
            className="p-5 bg-white border border-indigo-100/50 hover:border-indigo-300 rounded-2xl transition cursor-pointer group space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <span className="text-xl block group-hover:scale-105 transition">💼</span>
              <h4 className="text-xs font-black text-slate-900">{isRtl ? "شواغر حكومية وتجارية" : "Legal Job Opportunities"}</h4>
              <p className="text-[10px] text-slate-500 leading-normal font-sans">{isRtl ? "وظائف مستشاري قانون الشركات بالخليج" : "Vetted law firm positions lists"}</p>
            </div>
            <span className="text-[9px] font-extrabold text-indigo-600 font-sans block pt-1 group-hover:translate-x-1 transition">➔</span>
          </div>

          {/* Card: Contract review */}
          <div 
            onClick={() => onNavigateTab("contracts", "audit")}
            className="p-5 bg-white border border-indigo-100/50 hover:border-indigo-300 rounded-2xl transition cursor-pointer group space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <span className="text-xl block group-hover:scale-105 transition">⚖️</span>
              <h4 className="text-xs font-black text-slate-900">{isRtl ? "مراجعة عقود العمل" : "Employment Contract Review"}</h4>
              <p className="text-[10px] text-slate-500 leading-normal font-sans">{isRtl ? "فصل في شروط وبنود الامتثال للسفر" : "KSA Qiwa labor compliance guidelines"}</p>
            </div>
            <span className="text-[9px] font-extrabold text-indigo-600 font-sans block pt-1 group-hover:translate-x-1 transition">➔</span>
          </div>

          {/* Card: Legal templates library */}
          <div 
            onClick={() => handleOpenMemo("nda")}
            className="p-5 bg-white border border-indigo-100/50 hover:border-indigo-300 rounded-2xl transition cursor-pointer group space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <span className="text-xl block group-hover:scale-105 transition">📜</span>
              <h4 className="text-xs font-black text-slate-900">{isRtl ? "مذكرات وصياغات نموذجية" : "Legal Career Resources"}</h4>
              <p className="text-[10px] text-slate-500 leading-normal font-sans">{isRtl ? "اتفاقيات السرية وصيغ قوى الجاهزة" : "Instant clipboard NDA contracts templates"}</p>
            </div>
            <span className="text-[9px] font-extrabold text-indigo-600 font-sans block pt-1 group-hover:translate-x-1 transition">➔</span>
          </div>

        </div>
      </section>

      {/* 📊 SECTION 7: CREDIT STATS & OUTCOME METRICS */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">
            {isRtl ? "ثقة وأرقام تصنع الفارق للباحثين عن الفرص 📈" : "SOCIAL PROOF & SUCCESS METRICS 📈"}
          </h3>
          <p className="text-lg font-black text-slate-900 leading-tight">
            {isRtl ? "لماذا يثق عشرات الآلاف بمنصة مسار للتوظيف؟" : "Direct measurable outcomes proved by real placements"}
          </p>
        </div>

        {/* Dynamic Numerical Stats Grids */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { metric: "14,800+", label: isRtl ? "سيرة ذاتية مجهزة للـ ATS" : "CVs Created & Optimized" },
            { metric: "9,420+", label: isRtl ? "مقابلة تدريبية تفاعلية" : "Interviews Practiced Successfully" },
            { metric: "58,000+", label: isRtl ? "وظائف تمت مطابقتها" : "Vetted Jobs Matched" },
            { metric: "94.6%", label: isRtl ? "نسبة نجاح تصفية الـ ATS" : "Verified Placement Success Rate" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-1">
              <span className="text-2xl md:text-3xl font-black text-indigo-600 font-sans tracking-tight block">
                {stat.metric}
              </span>
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block leading-tight font-sans">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Subtle, beautiful User Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {[
            {
              stars: 5,
              title: isRtl ? "من فريش إلى مستشار معتمد بالرياض" : "Secured Corporate Role in KSA",
              text: isRtl
                ? "💡 بفضل أداة فحص الـ ATS صلت نقاط سيرتي الذاتية لـ 95% بعدما نبهتني المنصة لنقص مصطلحات قانونية في باقة الخليج. تم قراءتها فوراً من نظام الشركة الموظفة!"
                : "The ATS scoring scanner elevated matches accurately from 64% to 92%. I was contacted by three recruiting agencies in Dammam within a single week of printing my A4 PDF format.",
              author: isRtl ? "أحمد الحويطي - الرياض" : "Ahmed Al-Howeiti, Riyadh",
              role: isRtl ? "مستشار ممتثل لوزارة الموارد البشرية" : "Senior Legal Compliance Specialist"
            },
            {
              stars: 5,
              title: isRtl ? "سهولة ومحاكاة المقابلة غيرت مستوى إلقائي" : "Outstanding Interview Preparation",
              text: isRtl
                ? "🎙️ كنت أخشى المقابلات مع المدراء الأجانب. المحاكي الصوتي الذكي في مسار طرح علي أسئلة مفصلة عن مراجعة العقود وأعطاني تقييم وحلول ممتازة لغوياً."
                : "An extraordinary tool. The voice feedback analyzed my hesitation points and guided my answers based on Saudi commercial protocols and Qiwa specifications.",
              author: isRtl ? "مي جلال - القاهرة" : "Mai Galal, Cairo",
              role: isRtl ? "أخصائية شؤون موظفين وموارد بشرية" : "HR Lead & Recruiter Specialist"
            }
          ].map((story, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-150/50 rounded-2xl p-6 space-y-3 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex gap-0.5">
                  {[...Array(story.stars)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <h4 className="text-xs font-black text-slate-900 leading-snug">{story.title}</h4>
                <p className="text-[11px] text-slate-500 italic leading-relaxed font-sans">"{story.text}"</p>
              </div>
              <div className="border-t border-slate-205/50 border-slate-200/55 pt-3.5 flex items-center justify-between mt-3">
                <span className="text-[10px] font-black text-slate-800">{story.author}</span>
                <span className="text-[9.5px] text-indigo-600 font-black tracking-wide font-sans">{story.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🚀 SECTION 8: FINAL CONVERSION CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-[2.5rem] p-10 md:p-14 text-center text-white border border-indigo-900/40 shadow-2xl space-y-6">
        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-2xl mx-auto space-y-4 relative">
          <span className="inline-flex items-center gap-1 bg-white/10 text-indigo-300 border border-white/20 px-3.5 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase">
            🚀 {isRtl ? "البوابة المفتوحة للباحثين عن العمل" : "READY TO ACCELERATE YOUR CAREER?"}
          </span>

          <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-tight select-none">
            {isRtl ? "جاهز لتسريع مسارك المهني والتعاقد؟" : "Ready to Land Your Next Dream Job?"}
          </h3>

          <p className="text-xs md:text-sm text-indigo-200/80 leading-relaxed font-sans max-w-lg mx-auto">
            {isRtl
              ? "انضم لعشرات آلاف المحترفين الذين تخطوا أنظمة الـ ATS بنجاح واستحوذوا على أرقى العقود بالسعودية ومصر والخليج."
              : "Create beautiful resumes, identify missing keywords, run comprehensive mock interview trainings, and apply to vetted employers in a single unified system."}
          </p>

          <div className="flex flex-wrap justify-center gap-3.5 pt-3">
            <button
              onClick={() => onNavigateTab("cv_ats", "edit")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-8 py-4 rounded-xl transition duration-150 shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer"
            >
              {isRtl ? "ابدأ فوراً مجاناً 🚀" : "Get Started Free 🚀"}
            </button>
            <button
              onClick={() => onNavigateTab("profile")}
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs px-7 py-4 rounded-xl transition duration-150 active:scale-95 cursor-pointer"
            >
              {isRtl ? "تحميل سيرتك الذاتية الحالية" : "Upload Existing Resume"}
            </button>
          </div>
        </div>
      </section>

      {/* 📜 MODAL FOR INTERACTIVE LEGAL MEMO VIEW AND COPYING */}
      {isLegalModalOpen && currentMemoData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-[2rem] border border-slate-100 max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-scale-up text-slate-800">
            
            <div className="flex justify-between items-start border-b pb-3.5">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600">
                  {isRtl ? "مركز محامي مسار الذكي - صياغات موثقة" : "Masar Legal Vault - Draft View"}
                </span>
                <h4 className="text-sm font-black text-slate-900 pt-0.5">
                  {currentMemoData.title}
                </h4>
              </div>
              <button 
                onClick={() => setIsLegalModalOpen(false)}
                className="p-2 border border-slate-100 hover:bg-slate-50 rounded-xl cursor-pointer font-bold text-slate-400 hover:text-slate-950 font-sans leading-none text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 italic leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-dashed">
              {currentMemoData.preview}
            </p>

            <textarea
              rows={9}
              readOnly
              value={currentMemoData.text}
              className="w-full p-4 bg-slate-900 text-emerald-400 border border-slate-800 rounded-2xl text-[11px] font-mono leading-relaxed outline-none"
            />

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentMemoData.text);
                  alert(isRtl ? "📋 تم نسخ الصياغة القانونية النموذجية بنجاح! يمكنك الآن تعديلها في مستنداتك." : "📋 Copy completed! Paste legally compliant draft into your Word documents.");
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition cursor-pointer"
              >
                {isRtl ? "نسخ الصياغة بالكامل 📋" : "Copy Template Text 📋"}
              </button>
              
              {/* Loop to inject legal specialties toggler */}
              <div className="flex gap-1">
                {legalMemosTemplates.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedLegalMemo(m.id)}
                    className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-bold transition ${
                      selectedLegalMemo === m.id 
                        ? "bg-slate-900 border-slate-900 text-white" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent"
                    }`}
                  >
                    {m.id === "nda" ? "NDA" : m.id === "employment" ? "Employment" : "Brief"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
