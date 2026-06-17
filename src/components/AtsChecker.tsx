import React, { useState } from "react";
import { CheckSquare, AlertCircle, Loader2, RefreshCw } from "lucide-react";

interface AtsCheckerProps {
  language: "ar" | "en";
  t: any;
  preFilledCvText?: string;
  preFilledJd?: string;
}

export const AtsChecker: React.FC<AtsCheckerProps> = ({ language, t, preFilledCvText = "", preFilledJd = "" }) => {
  const isRtl = language === "ar";
  const [cvText, setCvText] = useState(preFilledCvText);
  const [jdText, setJdText] = useState(preFilledJd);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any | null>(null);

  const handleEvaluate = async () => {
    if (!cvText.trim() || !jdText.trim()) {
      setError(isRtl ? "يرجى تعبئة كلا الحقلين لإجراء الفحص." : "Resume text and job description must both be provided.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/cv/ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, jobDescription: jdText })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        if (data.score) localStorage.setItem("masar_last_ats_score", String(data.score));
      } else {
        throw new Error(data.message || "Auditing failed.");
      }
    } catch (err) {
      setError(isRtl ? "حدث خطأ أثناء إجراء الفحص. حاول مجدداً." : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "masar-score-excellent border-emerald-200";
    if (score >= 60) return "masar-score-good border-amber-200";
    return "masar-score-poor border-rose-200";
  };

  return (
    <div className="masar-card p-6 md:p-8 space-y-6 masar-animate-up">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <CheckSquare className="w-6 h-6 text-indigo-600" />
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t.atsHeader}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{isRtl ? "قياس المعايير وفجوات التوظيف إلكترونياً" : "Assess criteria matching against target job profiles"}</p>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-50/30">
        {t.atsTip}
      </p>

      {error && (
        <div className="bg-rose-50 text-rose-700 border border-rose-200 p-4 rounded-xl flex items-center gap-2 text-sm font-sans">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Two Pane Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{t.cvPaste}</label>
          <textarea
            rows={10}
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder={isRtl ? "الصق هنا نص سيرتك الذاتية (اسمك، خبراتك، تعليمك، مهاراتك)..." : "Paste your resume plain text here..."}
            className="masar-input text-xs"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{t.jdPaste}</label>
          <textarea
            rows={10}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder={isRtl ? "الصق هنا وصف ومتطلبات الوظيفة الشاغرة التي تريد التقدم إليها..." : "Paste the target job description parameters..."}
            className="masar-input text-xs"
          />
        </div>
      </div>

      {/* Button trigger */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="masar-btn masar-btn-dark w-full md:w-auto px-8 py-3 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isRtl ? "جاري التحليل بالذكاء الاصطناعي..." : "Analyzing with AI..."}</span>
            </>
          ) : (
            <span>{t.atsEvaluateBtn}</span>
          )}
        </button>
      </div>

      {/* Audit Result Display panel */}
      {result && !result.score && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-3 text-sm text-amber-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{isRtl ? "لم يتمكن الذكاء الاصطناعي من تحليل النص. تأكد من إدخال نص كافٍ وحاول مجدداً." : "AI could not parse the result. Ensure enough text is provided and try again."}</span>
        </div>
      )}

      {result && result.score && (
        <div className="border-t border-slate-100 pt-8 mt-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            {/* Circle Score Meter */}
            <div className={`w-28 h-28 shrink-0 rounded-full border-4 flex flex-col items-center justify-center font-sans ${getScoreColor(result.score)}`}>
              <span className="text-4xl font-extrabold">{result.score || 0}</span>
              <span className="text-[9pt] font-bold uppercase tracking-wider">{isRtl ? "نسبة التوافق" : "Match %"}</span>
            </div>

            <div className="space-y-2 text-center md:text-right">
              <h4 className="text-md font-bold text-slate-800">{t.atsScore}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{isRtl ? `درجة سيرتك هي ${result.score}٪. تهدف الشركات عادة لعبور تصفية تزيد عن ٧٥٪ للوصول للمقابلة الشخصية.` : `Your calculated score is ${result.score}%. Aiming for 75%+ ensures higher conversion.`}</p>
              {result.simulated && (
                <span className="inline-block text-[8.5pt] bg-amber-50 text-amber-700 font-bold border border-amber-100 rounded px-2 py-0.5">
                  {t.atsSimulatedWarning}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Missing Keywords Column */}
            <div className="masar-card p-5 space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
                ⚠️ {t.atsKeywordsMissing}
              </h5>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Array.isArray(result.missingKeywords) && result.missingKeywords.length > 0 ? (
                  result.missingKeywords.map((tag: string, idx: number) => (
                    <span key={idx} className="text-[10px] bg-rose-50 border border-rose-100 text-rose-700 font-medium px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">{isRtl ? "لا توجد مهارات مفقودة!" : "All keys registered!"}</span>
                )}
              </div>
            </div>

            {/* Critique column */}
            <div className="masar-card p-5 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
                📐 {t.atsFormatCritique}
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">{result.formattingFeedback || ("No critique registered.")}</p>
            </div>

            {/* Recommendations Column */}
            <div className="masar-card p-5 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
                💡 {t.atsRec}
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">{result.recommendations || ("Optimized resume guidelines.")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
