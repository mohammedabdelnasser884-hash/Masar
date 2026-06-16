import React, { useState } from "react";
import { Sparkles, Copy, Send, Linkedin, Mail, MessageSquare, AlertCircle, Loader2, Check } from "lucide-react";
import { CVData } from "../types";

interface OutreachPitcherProps {
  cvData: CVData;
  language: "ar" | "en";
}

export function OutreachPitcher({ cvData, language }: OutreachPitcherProps) {
  const isRtl = language === "ar";
  const [targetCompany, setTargetCompany] = useState("");
  const [targetRole, setTargetRole] = useState(cvData.personal.title || "");
  const [jdText, setJdText] = useState("");
  const [platform, setPlatform] = useState<"linkedin" | "email" | "whatsapp">("linkedin");
  const [tone, setTone] = useState<"formal" | "friendly" | "persuasive">("formal");
  const [loading, setLoading] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState("");
  const [isSimulated, setIsSimulated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setCopied(false);
    try {
      const res = await fetch("/api/ai/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvData,
          targetCompany,
          targetRole,
          jdText,
          platform,
          tone,
          language
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedPitch(data.pitch);
        setIsSimulated(!!data.simulated);
      } else {
        alert(isRtl ? "فشلت عملية إنشاء الرسالة." : "Failed to generate outreach pitch.");
      }
    } catch (err) {
      console.error(err);
      alert(isRtl ? "حدث خطأ غير متوقع." : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="outreach-pitcher-section" className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isRtl ? "صانع رسائل التواصل الذكي بالذكاء الاصطناعي" : "AI Recruiter Outreach Pitcher"}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isRtl
                ? "ولّد رسائل وخطابات مخصصة وقوية لإرسالها لمكاتب التوظيف والمسؤولين على لينكد إن، الإيميل أو الواتساب استناداً لسيرتك الحالية."
                : "Generate micro-tailored outreach pitches for HR partners, agency recruiters, and leaders based on your master CV."}
            </p>
          </div>
        </div>

        {/* INPUT FORM BLOCK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2">
              {isRtl ? "١. تفاصيل جهة التواصل والوظيفة" : "1. Target Details"}
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {isRtl ? "الشركة أو مكتب التوظيف المستهدف" : "Target Recruiter Agency / Company"}
              </label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder={isRtl ? "مثال: مجموعة الأمانة، شركة المعالي، أوراسكوم" : "e.g. Al-Maaly Group, Amazon, Nile HR"}
                className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:border-indigo-500 transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  {isRtl ? "المسمى الوظيفي المطلوب" : "Target Job Title"}
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder={isRtl ? "مثال: محاسب مالي أول" : "e.g. Senior Accountant"}
                  className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 font-sans">
                  {isRtl ? "اسم المرشح (من السيرة الذاتية)" : "Candidate Name (From CV)"}
                </label>
                <input
                  type="text"
                  disabled
                  value={cvData.personal.name || ""}
                  className="w-full px-4 py-2 bg-slate-100 border text-slate-500 rounded-xl text-xs outline-none font-medium cursor-not-allowed font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {isRtl ? "توصيف أو متطلبات إضافية (اختياري)" : "Add specific requirements / JD (Optional)"}
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={3}
                placeholder={isRtl ? "انسخ هنا متطلبات الوظيفة أو أي لمسة تود تسليط الضوء عليها..." : "Paste specific key competencies or instructions..."}
                className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:border-indigo-500 transition-all font-sans"
              />
            </div>
          </div>

          {/* CHANNELS AND TONE CONFIGURATION */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2">
              {isRtl ? "٢. تنسيق الرسالة والأسلوب" : "2. Channel & Tone Customizer"}
            </h3>

            {/* CHANNEL SELECTOR */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600 block">
                {isRtl ? "المنصة المستهدفة للإرسال:" : "Target Communication Service:"}
              </span>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "linkedin", name: isRtl ? "لينكد إن" : "LinkedIn", icon: Linkedin, color: "text-blue-600 bg-blue-50 border-blue-200" },
                  { id: "email", name: isRtl ? "بريد إلكتروني" : "E-mail", icon: Mail, color: "text-purple-600 bg-purple-50 border-purple-200" },
                  { id: "whatsapp", name: isRtl ? "واتساب/تليجرام" : "Chat Apps", icon: MessageSquare, color: "text-emerald-600 bg-emerald-50 border-emerald-200" }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPlatform(item.id as any)}
                      className={`py-3 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        platform === item.id
                          ? "ring-2 ring-indigo-500 bg-white border-transparent"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-bold">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TONE SELECTOR */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600 block">
                {isRtl ? "أسلوب الخطاب المهني:" : "Professional Tone of Voice:"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: "formal", ar: "رسمي ووقور 👔", en: "Elegant Formal" },
                  { id: "friendly", ar: "ودود ولبق 🤝", en: "Friendly & Warm" },
                  { id: "persuasive", ar: "مباشرة وبالأرقام 🎯", en: "Persuasive Pitch" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id as any)}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs text-center transition-all cursor-pointer ${
                      tone === t.id
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-100"
                    }`}
                  >
                    {isRtl ? t.ar : t.en}
                  </button>
                ))}
              </div>
            </div>

            {/* GENERATION TRIGGER */}
            <div className="pt-4">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-slate-900 to-indigo-900 hover:from-slate-850 hover:to-indigo-850 text-white font-bold text-xs py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition disabled:opacity-75 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isRtl ? "جاري صياغة رسالتك بالذكاء الاصطناعي..." : "Generating pitch with Gemini..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isRtl ? "ابدأ صياغة الرسالة الآن ✨" : "Draft Outreach Message ✨"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* OUTPUT BLOCK */}
        {generatedPitch && (
          <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                {isRtl ? "📋 الرسالة المقترحة من قبل مسار الذكي" : "📋 Generated Outreach Pitch Result"}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">{isRtl ? "تم النسخ!" : "Copied!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isRtl ? "نسخ النص" : "Copy Pitch"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Simulated Live Mockup of Messenger */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 max-w-2xl mx-auto shadow-inner">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-200/50 pb-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-slate-400 font-mono ml-2 font-bold uppercase">
                  {platform === "linkedin"
                    ? "LINKEDIN INBOX INVITATION PITCH"
                    : platform === "email"
                    ? "EMAIL CLIENT PITCH OUTLINE"
                    : "DIRECT MESSENGER CHAT TEXT"}
                </span>
              </div>

              {platform === "email" && (
                <div className="mb-3 text-[11px] space-y-1 font-sans border-b pb-2 text-slate-600">
                  <p>
                    <strong>Subject:</strong> {isRtl ? `طلب انضمام شواغر ${targetRole} - المرشح ${cvData.personal.name}` : `Inquiry / CV Application: ${targetRole} - ${cvData.personal.name}`}
                  </p>
                </div>
              )}

              <div className="text-xs text-slate-800 font-normal leading-relaxed whitespace-pre-wrap font-sans select-all select-text">
                {generatedPitch}
              </div>
            </div>

            {isSimulated && (
              <div className="flex items-center gap-2 justify-center bg-amber-50/65 px-4 py-2 border border-amber-100 rounded-lg max-w-lg mx-auto">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] text-amber-800 font-medium">
                  {isRtl
                    ? "*تم توليد الرسالة افتراضياً بمراعاة بيانات سيرتك وخبراتك للتوضيح لعدم تمكين مفتاح Gemini."
                    : "*Demo simulation rendered. Set GEMINI_API_KEY inside Settings to fetch live tailored drafts."}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
