import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, Sparkles, RefreshCw, Brain, Target, Map, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "coach" | "user";
  text: string;
  timestamp: number;
}

interface CoachMode {
  id: "diagnose" | "plan" | "chat";
  icon: string;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
}

interface MasarCoachProps {
  cvData: any;
  language: "ar" | "en";
  userName?: string;
}

// ─── Modes ────────────────────────────────────────────────────────
const MODES: CoachMode[] = [
  {
    id: "diagnose",
    icon: "🎯",
    labelAr: "تشخيص وضعي",
    labelEn: "Diagnose Me",
    descAr: "حلّل نقاط قوتي وضعفي دلوقتي",
    descEn: "Analyze my strengths & gaps now",
  },
  {
    id: "plan",
    icon: "🗺️",
    labelAr: "خطتي الأسبوعية",
    labelEn: "My Weekly Plan",
    descAr: "ارسمّلي خطة خطوة بخطوة",
    descEn: "Give me a step-by-step roadmap",
  },
  {
    id: "chat",
    icon: "💬",
    labelAr: "محادثة حرة",
    labelEn: "Free Chat",
    descAr: "اسأل أي سؤال وأنا عارف سيرتك",
    descEn: "Ask anything — I know your full profile",
  },
];

// ─── Build rich context from CV ───────────────────────────────────
function buildUserContext(cvData: any, language: string): string {
  if (!cvData?.personal) return "لا توجد بيانات للمستخدم.";

  const p = cvData.personal;
  const expYears = cvData.experience?.length
    ? cvData.experience.map((e: any) => `${e.role} في ${e.company} (${e.duration})`).join(" | ")
    : "لا توجد خبرات مسجلة";
  const edu = cvData.education?.map((e: any) => `${e.degree} - ${e.institution}`).join(" | ") || "—";
  const skills = cvData.skills?.join("، ") || "—";
  const langs = cvData.languages?.map((l: any) => `${l.name} (${l.level})`).join("، ") || "—";

  // Pull any saved session data
  const atsScore = localStorage.getItem("masar_last_ats_score") || null;
  const interviewAvg = localStorage.getItem("masar_last_interview_avg") || null;
  const savedJobs = localStorage.getItem("masar_saved_jobs") || null;

  return `
=== بيانات المستخدم الكاملة ===
الاسم: ${p.name}
المسمى الوظيفي الحالي: ${p.title}
الموقع: ${p.location}
الملخص المهني: ${p.summary}

الخبرات: ${expYears}
التعليم: ${edu}
المهارات: ${skills}
اللغات: ${langs}

${atsScore ? `آخر نتيجة ATS: ${atsScore}%` : "لم يجرِ فحص ATS بعد"}
${interviewAvg ? `متوسط درجات المقابلات: ${interviewAvg}/5` : "لم يتدرب على المقابلات بعد"}
${savedJobs ? `الوظائف المحفوظة: ${savedJobs}` : "لا توجد وظائف محفوظة بعد"}
لغة التطبيق: ${language === "ar" ? "العربية" : "الإنجليزية"}
  `.trim();
}

// ─── System Prompt ────────────────────────────────────────────────
function buildSystemPrompt(mode: CoachMode["id"], context: string, isAr: boolean): string {
  const persona = isAr
    ? `أنت "مرشد المسار" — مستشار مهني ذكي ومتخصص في سوق العمل المصري والخليجي.
أسلوبك: دافئ، صريح، عملي. بتتكلم بالعربية الفصحى البسيطة المفهومة.
مهم جداً: أنت مش chatbot عادي — أنت عارف كل حاجة عن المستخدم من بياناته أدناه.
ابدأ دايماً باسم المستخدم وأظهر إنك فاهم وضعه بالتحديد.
ردودك: مركزة، قابلة للتنفيذ، مش أكتر من 200 كلمة.`
    : `You are "Masar Coach" — a smart career advisor specialized in Egyptian and Gulf job markets.
Style: warm, direct, practical. You speak in clear simple English.
Important: You're NOT a generic chatbot — you know everything about this user from their data below.
Always start with the user's name and show you understand their specific situation.
Keep responses focused, actionable, under 200 words.`;

  const modeInstructions: Record<string, string> = {
    diagnose: isAr
      ? `وضعك: مرحلة التشخيص.
حلّل بيانات المستخدم وقدّم:
1. ✅ أقوى 3 نقاط عنده
2. ⚠️ أهم 3 فجوات أو مشاكل
3. 🎯 الفرصة الأكبر اللي يركز عليها دلوقتي
كن محدداً بأمثلة من بياناته الفعلية.`
      : `Mode: Diagnosis.
Analyze the user's data and provide:
1. ✅ Their top 3 strengths
2. ⚠️ Their 3 biggest gaps or problems
3. 🎯 The single biggest opportunity to focus on now
Be specific with examples from their actual data.`,

    plan: isAr
      ? `وضعك: مرحلة التخطيط.
ارسم خطة أسبوعية واضحة وقابلة للتنفيذ:
- الأسبوع الأول: خطوات فورية
- الأسبوع الثاني: خطوات البناء
- الأسبوع الثالث: خطوات التقديم
كل خطوة: محددة، واقعية، مرتبطة ببياناته الفعلية.`
      : `Mode: Planning.
Create a clear, actionable weekly roadmap:
- Week 1: Immediate actions
- Week 2: Building steps
- Week 3: Application steps
Each step: specific, realistic, tied to their actual data.`,

    chat: isAr
      ? `وضعك: محادثة حرة.
أجب على أسئلة المستخدم مع الأخذ في الاعتبار كل بياناته المذكورة أدناه.
خليك عملي ومباشر. لو السؤال مش واضح، اسأله سؤال واحد بس للتوضيح.`
      : `Mode: Free chat.
Answer the user's questions while considering all their data below.
Be practical and direct. If the question is unclear, ask ONE clarifying question.`,
  };

  return `${persona}

${modeInstructions[mode]}

${context}`;
}

// ─── Component ────────────────────────────────────────────────────
export const MasarCoach: React.FC<MasarCoachProps> = ({ cvData, language, userName }) => {
  const isAr = language === "ar";
  const [mode, setMode] = useState<CoachMode["id"] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextVisible, setContextVisible] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load saved session
  const STORAGE_KEY = `masar_coach_session_${language}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mode && parsed.messages?.length > 0) {
          setMode(parsed.mode);
          setMessages(parsed.messages);
        }
      }
    } catch {}
  }, []);

  // Save session on every message change
  useEffect(() => {
    if (mode && messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, messages }));
    }
  }, [messages, mode]);

  const userContext = buildUserContext(cvData, language);
  const fullName = userName || cvData?.personal?.name || "";
  const firstName = fullName.split(" ")[0] || (isAr ? "صديقي" : "there");

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start mode with opening message
  const startMode = async (selectedMode: CoachMode["id"]) => {
    setMode(selectedMode);
    setMessages([]);
    setLoading(true);

    const systemPrompt = buildSystemPrompt(selectedMode, userContext, isAr);
    const hasProfile = cvData?.personal?.name && cvData?.personal?.title;
    const openingPrompt = isAr
      ? hasProfile
        ? `ابدأ المحادثة مع ${firstName} بناءً على بياناته الكاملة أعلاه. كن محدداً واذكر اسمه ومسماه الوظيفي.`
        : `المستخدم ${firstName} لم يُكمل سيرته الذاتية بعد. ابدأ بترحيب دافئ وشجّعه على إكمال بياناته خطوة بخطوة. اسأله سؤالاً واحداً فقط للبداية.`
      : hasProfile
        ? `Start the conversation with ${firstName} based on their full data above. Be specific, mention their name and job title.`
        : `${firstName} hasn't completed their CV yet. Start with a warm welcome and guide them to fill their profile step by step. Ask only ONE question to begin.`;

    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt,
          messages: [{ role: "user", content: openingPrompt }],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages([{
          id: `m-${Date.now()}`,
          role: "coach",
          text: data.reply,
          timestamp: Date.now(),
        }]);
      }
    } catch (err) {
      setMessages([{
        id: `m-err`,
        role: "coach",
        text: isAr ? "عذراً، حدث خطأ. تأكد من إعداد GROQ_API_KEY وحاول مجدداً." : "Sorry, an error occurred. Check your GROQ_API_KEY and try again.",
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Send user message
  const sendMessage = async () => {
    if (!input.trim() || loading || !mode) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: input.trim(), timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const systemPrompt = buildSystemPrompt(mode, userContext, isAr);
    const history = newMessages.map(m => ({
      role: m.role === "coach" ? "assistant" : "user",
      content: m.text,
    }));

    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, messages: history }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          id: `c-${Date.now()}`,
          role: "coach",
          text: data.reply,
          timestamp: Date.now(),
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `c-err-${Date.now()}`,
        role: "coach",
        text: isAr ? "حدث خطأ، حاول مرة أخرى." : "An error occurred, please try again.",
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reset = () => {
    setMode(null);
    setMessages([]);
    setInput("");
    localStorage.removeItem(STORAGE_KEY);
  };

  // ── Mode Selector ──────────────────────────────────────────────
  if (!mode) {
    return (
      <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="rounded-3xl p-7 text-white space-y-3 masar-animate-up" style={{background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 40%,#312e81 100%)"}}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-2xl">
              <Brain className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-black">
                {isAr ? `مرشد المسار` : "Masar Coach"}
              </h2>
              <p className="text-indigo-300 text-xs">
                {isAr ? "مش chatbot — أنا عارف سيرتك وبحللها" : "Not a chatbot — I know your full profile"}
              </p>
            </div>
          </div>

          {/* Context Preview */}
          <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)"}}>
            <button
              onClick={() => setContextVisible(!contextVisible)}
              className="w-full flex items-center justify-between text-xs text-indigo-200 font-semibold"
            >
              <span>📋 {isAr ? "اللي أنا عارفه عنك" : "What I know about you"}</span>
              {contextVisible ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {contextVisible && (
              <pre className="mt-3 text-[10px] text-indigo-100/70 whitespace-pre-wrap leading-relaxed font-mono max-h-40 overflow-y-auto">
                {userContext}
              </pre>
            )}
            {!contextVisible && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  cvData?.personal?.title,
                  cvData?.personal?.location,
                  `${cvData?.skills?.length || 0} ${isAr ? "مهارة" : "skills"}`,
                  `${cvData?.experience?.length || 0} ${isAr ? "خبرة" : "experiences"}`,
                ].filter(Boolean).map((tag, i) => (
                  <span key={i} className="text-[10px] bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mode Cards */}
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
            {isAr ? "اختار وضع المرشد" : "Choose your coaching mode"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => startMode(m.id)}
                className="group masar-card masar-glow-border p-5 text-right space-y-2 hover:-translate-y-1"
              >
                <span className="text-3xl block">{m.icon}</span>
                <p className="font-black text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
                  {isAr ? m.labelAr : m.labelEn}
                </p>
                <p className="text-xs text-slate-400 leading-snug">
                  {isAr ? m.descAr : m.descEn}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* What makes it different */}
        <div className="rounded-2xl p-4 space-y-2 masar-animate-up" style={{background:"#fffbeb",border:"1px solid rgba(245,158,11,0.15)"}}>
          <p className="text-xs font-black text-amber-700">
            ✨ {isAr ? "ليه مرشد المسار مختلف؟" : "Why Masar Coach is different?"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              isAr ? "بيعرف سيرتك كاملة" : "Knows your full CV",
              isAr ? "بيتذكر المحادثة" : "Remembers the conversation",
              isAr ? "نصايح محددة ليك أنت" : "Advice specific to YOU",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-amber-700 font-semibold">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Chat Interface ─────────────────────────────────────────────
  const currentMode = MODES.find(m => m.id === mode)!;

  return (
    <div className="flex flex-col h-[600px] masar-card overflow-hidden masar-animate-scale" dir={isAr ? "rtl" : "ltr"}>

      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-4 text-white shrink-0" style={{background:"linear-gradient(135deg,#0f172a,#1e1b4b)"}}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentMode.icon}</span>
          <div>
            <p className="text-sm font-black">{isAr ? currentMode.labelAr : currentMode.labelEn}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-[10px] text-indigo-300">
                {isAr ? "مرشد المسار — يعرف سيرتك كاملة" : "Masar Coach — knows your full profile"}
              </p>
            </div>
          </div>
        </div>
        <button onClick={reset}
          className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition-all bg-white/10 px-3 py-1.5 rounded-xl">
          <RefreshCw className="w-3 h-3" />
          {isAr ? "تغيير الوضع" : "Change mode"}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none" style={{background:"#f8f9fc"}}>
        {messages.map((msg) => (
          <div key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "masar-bubble-user"
                : "masar-bubble-coach"
            }`}>
              {msg.role === "coach" && (
                <div className="flex items-center gap-1.5 mb-1.5 opacity-70">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isAr ? "مرشد المسار" : "Masar Coach"}
                  </span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-end">
            <div className="bg-indigo-600 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
                <span className="text-xs text-indigo-200">
                  {isAr ? "المرشد بيفكر..." : "Coach is thinking..."}
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Replies */}
      {messages.length > 0 && !loading && mode === "chat" && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none shrink-0 border-t border-slate-100 bg-white">
          {(isAr ? [
            "إيه أهم مهارة ناقصاني؟",
            "كيف أحسن سيرتي؟",
            "إيه أفضل وظيفة ليا؟",
            "كيف أستعد للمقابلة؟",
          ] : [
            "What skill am I missing most?",
            "How can I improve my CV?",
            "What's the best job for me?",
            "How do I prep for interviews?",
          ]).map((q, i) => (
            <button key={i} onClick={() => { setInput(q); inputRef.current?.focus(); }}
              className="shrink-0 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-100 bg-white shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={isAr ? "اكتب سؤالك هنا..." : "Type your question here..."}
            className="masar-input flex-1 resize-none text-sm max-h-32 overflow-y-auto"
            style={{ minHeight: "42px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="masar-btn masar-btn-primary p-2.5 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-300 mt-1.5 text-center">
          {isAr ? "Enter للإرسال · Shift+Enter لسطر جديد" : "Enter to send · Shift+Enter for new line"}
        </p>
      </div>
    </div>
  );
};
