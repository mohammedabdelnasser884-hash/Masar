import React, { useState } from "react";
import { CheckSquare, AlertCircle, Loader2, RefreshCw, FileText, Upload, X, File, Sparkles } from "lucide-react";
import { apiFetchJson, ApiAuthError } from "../utils/apiClient";

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

  // Sync state if props change from outside trigger
  React.useEffect(() => {
    if (preFilledCvText) {
      setCvText(preFilledCvText);
      setActiveInputTab("text");
    }
  }, [preFilledCvText]);

  React.useEffect(() => {
    if (preFilledJd) {
      setJdText(preFilledJd);
    }
  }, [preFilledJd]);

  // PDF upload & extraction states
  const [cvPdf, setCvPdf] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [activeInputTab, setActiveInputTab] = useState<"pdf" | "text">("pdf");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10MB — متوافق مع حد السيرفر (15mb بعد base64 overhead)

  const processFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setError(isRtl ? "يرجى رفع ملف بصيغة PDF فقط لضمان سلامة الفحص الدقيق." : "Please upload a valid PDF file only.");
      return;
    }
    // FIX: حد حجم الملف — كان غائبًا تمامًا، يسمح برفع ملفات ضخمة تجمّد المتصفح وتفشل في السيرفر
    if (file.size > MAX_PDF_SIZE_BYTES) {
      setError(
        isRtl
          ? `حجم الملف كبير جدًا (${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت). الحد الأقصى المسموح هو 10 ميجابايت.`
          : `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 10MB.`
      );
      return;
    }
    setError("");
    setPdfName(file.name);

    // FIX: استخدام readAsDataURL المدمج بدل تحويل base64 ببايت-ببايت (أسرع بكثير لملفات كبيرة)
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1] || "";
      setCvPdf(base64);
    };
    reader.onerror = () => {
      setError(isRtl ? "حدث خطأ أثناء قراءة ملف الـ PDF." : "Error reading the PDF file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemovePdf = () => {
    setCvPdf("");
    setPdfName("");
  };

  const handleExtractText = async () => {
    if (!cvPdf || extracting) return;
    setExtracting(true);
    setError("");
    try {
      const data = await apiFetchJson<{ success: boolean; text?: string; message?: string }>(
        "/api/cv/extract-text",
        { method: "POST", body: JSON.stringify({ cvPdf }) }
      );
      if (data.success && data.text) {
        setCvText(data.text);
        setActiveInputTab("text");
      } else {
        setError(data.message || (isRtl ? "فشل استخراج النص." : "Failed to extract text."));
      }
    } catch (err) {
      if (err instanceof ApiAuthError) {
        setError(isRtl ? "يرجى تسجيل الدخول لاستخدام هذه الميزة." : "Please log in to use this feature.");
      } else {
        setError((err as Error).message || (isRtl ? "تعذّر الاتصال بالخادم." : "Could not reach the server."));
      }
    } finally {
      setExtracting(false);
    }
  };

  const handleEvaluate = async () => {
    const hasCv = activeInputTab === "pdf" ? !!cvPdf : !!cvText.trim();
    if (!hasCv || !jdText.trim()) {
      setError(
        isRtl 
          ? "يرجى توفير ملف السيرة الذاتية أو النص بالإضافة لوصف الوظيفة لإجراء الفحص." 
          : "Resume (via file or text) and job description must both be provided."
      );
      return;
    }
    setError("");
    setLoading(true);

    try {
      const reqBody = activeInputTab === "pdf" 
        ? { cvPdf, jobDescription: jdText }
        : { cvText, jobDescription: jdText };

      const data = await apiFetchJson<{ success: boolean; message?: string }>(
        "/api/cv/ats",
        { method: "POST", body: JSON.stringify(reqBody) }
      );
      if (data.success) {
        setResult(data);
      } else {
        throw new Error(data.message || "Auditing failed.");
      }
    } catch (err) {
      if (err instanceof ApiAuthError) {
        setError(isRtl ? "يرجى تسجيل الدخول لاستخدام فحص الـATS." : "Please log in to use the ATS check.");
      } else {
        setError((err as Error).message || (isRtl ? "حدث خطأ أثناء إجراء الفحص. حاول مجدداً." : "An error occurred. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 border-emerald-200 bg-emerald-50";
    if (score >= 60) return "text-amber-600 border-amber-200 bg-amber-50";
    return "text-rose-600 border-rose-200 bg-rose-50";
  };

  return (
    <div id="ats-checker-card" className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <CheckSquare id="ats-header-icon" className="w-6 h-6 text-indigo-600 animate-pulse" />
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t.atsHeader}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{isRtl ? "قياس المعايير وفجوات التوظيف إلكترونياً بواسطة الذكاء الاصطناعي" : "Assess criteria matching against target job profiles via Gemini"}</p>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-50/30">
        {t.atsTip}
      </p>

      {error && (
        <div id="ats-error-banner" className="bg-rose-50 text-rose-700 border border-rose-200 p-4 rounded-xl flex items-center gap-2 text-sm font-sans animate-bounce">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Two Pane Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Pane: CV Input containing PDF upload dropzone or text input tab selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-150 pb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{isRtl ? "سيرتك الذاتية" : "Your Resume / CV"}</span>
            <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
              <button
                type="button"
                onClick={() => setActiveInputTab("pdf")}
                className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-md transition-all cursor-pointer ${activeInputTab === "pdf" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
              >
                📁 {isRtl ? "رفع ملف PDF" : "Upload PDF"}
              </button>
              <button
                type="button"
                onClick={() => setActiveInputTab("text")}
                className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-md transition-all cursor-pointer ${activeInputTab === "text" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
              >
                ✍️ {isRtl ? "لصق نصي" : "Paste Plain Text"}
              </button>
            </div>
          </div>

          {activeInputTab === "pdf" ? (
            <div className="space-y-3">
              {/* PDF Drag & Drop Zone */}
              {!cvPdf ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${dragActive ? "border-indigo-500 bg-indigo-50/50 scale-[0.99]" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"} relative cursor-pointer`}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 text-center mb-1">
                    {isRtl ? "اسحب وأفلت ملف سيرتك الذاتية (PDF) هنا" : "Drag and drop your PDF resume here"}
                  </p>
                  <p className="text-[10px] text-slate-500 text-center">
                    {isRtl ? "أو اضغط للتصفح واختيار الملف من جهازك" : "or click to browse your local device files"}
                  </p>
                </div>
              ) : (
                <div id="pdf-uploaded-ready" className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-xl text-white">
                      <File className="w-5 h-5 mr-0.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold text-slate-800 truncate max-w-[200px]" title={pdfName}>{pdfName}</p>
                      <p className="text-[10px] text-indigo-600 font-bold">{isRtl ? "ملف PDF جاهز للفحص والتقييم" : "PDF format ready for ATS verification"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleExtractText}
                      disabled={extracting}
                      className="flex-1 sm:flex-none border border-indigo-200 hover:bg-white text-indigo-800 text-[10px] font-bold px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {extracting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>{extracting ? (isRtl ? "جاري الاستخراج..." : "Extracting...") : (isRtl ? "استخراج النص وقراءته" : "Extract text")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePdf}
                      className="bg-slate-200/80 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold p-2 rounded-lg transition-all cursor-pointer"
                      title={isRtl ? "إلغاء الملف" : "Remove File"}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <textarea
              id="cv-text-area"
              rows={10}
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder={isRtl ? "الصق هنا نص سيرتك الذاتية (اسمك، خبراتك، تعليمك، مهاراتك)..." : "Paste your resume plain text here..."}
              className="w-full bg-slate-50 border focus:bg-white focus:border-indigo-500 text-xs px-4 py-3 rounded-xl outline-none transition-all font-sans"
            />
          )}
        </div>

        {/* Right Pane: Target Job Description */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-150 pb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t.jdPaste}</span>
            <span className="text-[10px] text-slate-400 font-sans">{isRtl ? "أضف متطلبات الوظيفة للمطابقة" : "Target criteria parameters"}</span>
          </div>
          <textarea
            id="jd-text-area"
            rows={10}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder={isRtl ? "الصق هنا وصف ومتطلبات الوظيفة الشاغرة التي تريد التقدم إليها..." : "Paste the target job description parameters..."}
            className="w-full bg-slate-50 border focus:bg-white focus:border-indigo-500 text-xs px-4 py-3 rounded-xl outline-none transition-all font-sans"
          />
        </div>
      </div>

      {/* Button trigger */}
      <div className="flex justify-end pt-2">
        <button
          id="btn-evaluate"
          onClick={handleEvaluate}
          disabled={loading}
          className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 px-8 rounded-xl transition-all shadow active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isRtl ? "جاري الفحص واستخراج الفجوات بالذكاء الاصطناعي..." : "Evaluating and extracting keyword gaps..."}</span>
            </>
          ) : (
            <span>{t.atsEvaluateBtn}</span>
          )}
        </button>
      </div>

      {/* Audit Result Display panel */}
      {result && (
        <div id="ats-audit-output" className="border-t border-slate-100 pt-8 mt-6 space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            {/* Circle Score Meter */}
            <div className={`w-28 h-28 shrink-0 rounded-full border-4 flex flex-col items-center justify-center font-sans ${getScoreColor(result.score)}`}>
              <span className="text-4xl font-extrabold">{result.score || 0}</span>
              <span className="text-[9pt] font-bold uppercase tracking-wider">{isRtl ? "نسبة التوافق" : "Match %"}</span>
            </div>

            <div className="space-y-2 text-center md:text-right">
              <h4 className="text-md font-bold text-slate-800">{t.atsScore}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{isRtl ? `درجة ملاءمة سيرتك هي ${result.score}٪. تهدف الشركات عادة لعبور تصفية تزيد عن ٧٥٪ للوصول للمقابلة الشخصية.` : `Your calculated score is ${result.score}%. Aiming for 75%+ ensures higher conversion.`}</p>
              {result.simulated && (
                <span className="inline-block text-[8.5pt] bg-amber-50 text-amber-700 font-bold border border-amber-100 rounded px-2 py-0.5">
                  {t.atsSimulatedWarning}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Missing Keywords Column */}
            <div className="bg-white border rounded-2xl p-5 space-y-3 shadow-sm">
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
            <div className="bg-white border rounded-2xl p-5 space-y-2 shadow-sm col-span-1">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
                📐 {t.atsFormatCritique}
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">{result.formattingFeedback || ("No critique registered.")}</p>
            </div>

            {/* Recommendations Column */}
            <div className="bg-white border rounded-2xl p-5 space-y-2 shadow-sm col-span-1">
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
