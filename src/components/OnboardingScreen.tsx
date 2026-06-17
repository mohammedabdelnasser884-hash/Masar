import React, { useState } from "react";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";

interface Goal {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  navigateTo: string;
  subTab?: string;
}

interface OnboardingScreenProps {
  userName: string;
  language: "ar" | "en";
  onDone: (tabId: string, subTab?: string) => void;
}

const GOALS_AR: Goal[] = [
  {
    id: "cv",
    emoji: "📝",
    title: "أبني سيرتي الذاتية",
    subtitle: "أنشئ أو حسّن سيرتك وصدّرها PDF",
    navigateTo: "cv_ats",
    subTab: "edit"
  },
  {
    id: "ats",
    emoji: "🎯",
    title: "أعرف ليه مش بتتقبل",
    subtitle: "افحص سيرتك على أنظمة الفرز الآلي ATS",
    navigateTo: "cv_ats",
    subTab: "ats"
  },
  {
    id: "jobs",
    emoji: "💼",
    title: "أدور على وظيفة",
    subtitle: "ابحث في أحدث الفرص المناسبة ليك",
    navigateTo: "jobs"
  },
  {
    id: "interview",
    emoji: "🎙️",
    title: "أتدرب على المقابلات",
    subtitle: "محاكاة مقابلة حقيقية مع تقييم فوري",
    navigateTo: "interview"
  },
  {
    id: "contract",
    emoji: "📜",
    title: "أفحص عقد شغل",
    subtitle: "راجع عقدك قبل ما توقّع عليه",
    navigateTo: "contracts",
    subTab: "audit"
  },
  {
    id: "agency",
    emoji: "🏢",
    title: "أتواصل مع مكاتب توظيف",
    subtitle: "دليل مكاتب التوظيف المعتمدة",
    navigateTo: "networking",
    subTab: "agencies"
  }
];

const GOALS_EN: Goal[] = [
  {
    id: "cv",
    emoji: "📝",
    title: "Build my CV",
    subtitle: "Create or improve your resume and export as PDF",
    navigateTo: "cv_ats",
    subTab: "edit"
  },
  {
    id: "ats",
    emoji: "🎯",
    title: "Find out why I'm not getting callbacks",
    subtitle: "Check your CV against ATS screening systems",
    navigateTo: "cv_ats",
    subTab: "ats"
  },
  {
    id: "jobs",
    emoji: "💼",
    title: "Search for jobs",
    subtitle: "Browse the latest matching opportunities",
    navigateTo: "jobs"
  },
  {
    id: "interview",
    emoji: "🎙️",
    title: "Practice interviews",
    subtitle: "Realistic mock interview with instant feedback",
    navigateTo: "interview"
  },
  {
    id: "contract",
    emoji: "📜",
    title: "Review a job contract",
    subtitle: "Check your offer before signing",
    navigateTo: "contracts",
    subTab: "audit"
  },
  {
    id: "agency",
    emoji: "🏢",
    title: "Connect with recruiters",
    subtitle: "Directory of verified recruitment agencies",
    navigateTo: "networking",
    subTab: "agencies"
  }
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ userName, language, onDone }) => {
  const isRtl = language === "ar";
  const goals = isRtl ? GOALS_AR : GOALS_EN;
  const [selected, setSelected] = useState<string | null>(null);
  const [going, setGoing] = useState(false);
  const [error, setError] = useState(false);

  const rawFirst = userName?.split(" ")[0] || "";
  const firstName = rawFirst.length > 1 ? rawFirst : (isRtl ? "أهلاً بيك" : "there");

  const handleSelect = (goal: Goal) => {
    setSelected(goal.id);
    setGoing(true);
    setError(false);
    setTimeout(() => {
      try {
        onDone(goal.navigateTo, goal.subTab);
      } catch {
        setError(true);
        setGoing(false);
        setSelected(null);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:"linear-gradient(135deg,#f8f9fc 0%,#eef2ff 100%)"}} dir={isRtl ? "rtl" : "ltr"}>
      <div className="w-full max-w-lg space-y-6 masar-animate-up">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-4xl">👋</div>
          <h1 className="text-2xl font-black text-slate-900">
            {isRtl ? `أهلاً ${firstName}!` : `Hey ${firstName}!`}
          </h1>
          <p className="text-slate-500 text-sm">
            {isRtl ? "إيه اللي عايز تعمله دلوقتي؟" : "What are you looking to do right now?"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center gap-2 text-xs text-rose-700 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{isRtl ? "حدث خطأ، حاول مرة أخرى." : "Something went wrong. Please try again."}</span>
          </div>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {goals.map((goal) => {
            const isChosen = selected === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => handleSelect(goal)}
                disabled={going}
                className={`group relative text-right p-5 rounded-2xl border-2 transition-all duration-200 text-start masar-animate-up
                  ${isChosen
                    ? "border-indigo-500 text-white scale-[1.02]"
                    : "masar-card hover:border-indigo-300 hover:-translate-y-1"
                  } disabled:cursor-not-allowed`}
                style={isChosen ? {background:"linear-gradient(135deg,#6366f1,#4f46e5)",boxShadow:"0 8px 24px rgba(99,102,241,0.35)"} : {}}
              >
                <span className="text-2xl block mb-2">{goal.emoji}</span>
                <p className={`text-sm font-black mb-1 ${isChosen ? "text-white" : "text-slate-900 group-hover:text-indigo-700"} transition-colors`}>
                  {goal.title}
                </p>
                <p className={`text-xs leading-snug ${isChosen ? "text-indigo-100" : "text-slate-400"}`}>
                  {goal.subtitle}
                </p>

                {isChosen && (
                  <div className="absolute top-3 left-3">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Skip */}
        <div className="text-center">
          <button
            onClick={() => onDone("home")}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
          >
            {isRtl ? "أو اكتشف التطبيق بنفسي" : "Or explore on my own"}
          </button>
        </div>
      </div>
    </div>
  );
};
