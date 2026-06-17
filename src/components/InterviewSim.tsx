import React, { useState } from "react";
import { Send, Star, AlertCircle, Loader2, Undo, Play, MessageSquareCode } from "lucide-react";
import { getAuthHeaders } from "../App";

interface InterviewSimProps {
  language: "ar" | "en";
  t: any;
}

export const InterviewSim: React.FC<InterviewSimProps> = ({ language, t }) => {
  const isRtl = language === "ar";
  const [jobTitle, setJobTitle] = useState("");
  const [stage, setStage] = useState<"idle" | "loading" | "chatting" | "submitting" | "finished">("idle");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedbacks, setFeedbacks] = useState<{ score: number; text: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const startInterview = async () => {
    if (!jobTitle.trim()) {
      setErrorMsg(isRtl ? "يرجى إدخال المسمى الوظيفي المستهدف." : "Please type a target job title.");
      return;
    }
    setErrorMsg("");
    setStage("loading");

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ jobTitle })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIdx(0);
        setAnswers([]);
        setFeedbacks([]);
        setCurrentAnswer("");
        setStage("chatting");
      } else {
        throw new Error(data.message || "Failed to load questions");
      }
    } catch (err) {
      setErrorMsg(isRtl ? "فشل بدء المقابلة. يرجى التحقق من الشبكة والمحاولة لاحقاً." : "Initialization failed. Check network and retry.");
      setStage("idle");
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    setStage("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          question: questions[currentIdx],
          answer: currentAnswer,
          jobTitle
        })
      });
      const data = await res.json();

      if (data.success) {
        setFeedbacks([...feedbacks, { score: data.score || 4, text: data.feedback || "" }]);
        setAnswers([...answers, currentAnswer]);
        setCurrentAnswer("");
        
        if (currentIdx < 4) {
          setCurrentIdx(currentIdx + 1);
          setStage("chatting");
        } else {
          setStage("finished");
        }
      } else {
        throw new Error(data.message || "Failed evaluation");
      }
    } catch (err) {
      setErrorMsg(isRtl ? "فشل تقييم الإجابة. أعد المحاولة." : "Could not evaluate. Try again.");
      setStage("chatting");
    }
  };

  const calculateAverageScore = () => {
    if (feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((acc, f) => acc + f.score, 0);
    return Number((total / feedbacks.length).toFixed(1));
  };

  const resetInterview = () => {
    setJobTitle("");
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers([]);
    setFeedbacks([]);
    setCurrentAnswer("");
    setErrorMsg("");
    setStage("idle");
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="bg-white text-slate-800 rounded-[2.5rem] border border-slate-100 p-8 md:p-14 space-y-10 shadow-sm relative overflow-hidden text-right print:text-left">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-slate-100 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl shadow-2xs">
            <MessageSquareCode className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{t.intHeader}</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">{isRtl ? "تدريب تفاعلي عبر الذكاء الاصطناعي مع تقييم لحظي لكل إجابة صوتاً وكتابةً" : "Interact and master live interview feedback powered by Gemini AI"}</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 py-3.5 px-5 rounded-2xl flex items-center gap-2.5 text-xs font-medium font-sans">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STAGE: IDLE */}
      {stage === "idle" && (
        <div className="space-y-8 pt-4 max-w-xl mx-auto text-center md:py-10 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-100 text-slate-400">
              <MessageSquareCode className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed max-w-md mx-auto font-sans font-light">
              {t.intIntro}
            </p>
          </div>

          <div className="space-y-3.5 pt-4">
            <label className="block text-slate-700 text-xs font-black uppercase tracking-wider text-right font-sans">
              {t.intJobTitle}
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={isRtl ? "مثال: محاسب تكاليف ومخازن، مطور React..." : "e.g., Financial Accountant, UI Tester..."}
              className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white text-xs md:text-sm font-sans px-5 py-4 rounded-2xl outline-none transition duration-150 shadow-2xs placeholder:text-slate-400 text-slate-800"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={startInterview}
              className="w-full md:w-auto md:px-10 bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition duration-200 text-xs md:text-sm font-black text-white py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/15 cursor-pointer mx-auto"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{t.intStartBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE: LOADING */}
      {stage === "loading" && (
        <div className="flex flex-col items-center justify-center py-20 space-y-5 relative z-10">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          </div>
          <p className="text-slate-600 text-xs md:text-sm font-medium animate-pulse">{isRtl ? "جاري قياس وصياغة ٥ أسئلة مخصصة من Gemini AI..." : "Formulating 5 candidate questions with Gemini AI..."}</p>
        </div>
      )}

      {/* STAGE: CHATTING OR SUBMITTING */}
      {(stage === "chatting" || stage === "submitting") && (
        <div className="space-y-8 md:py-4 relative z-10 text-right">
          {/* Progress gauge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 border-b border-slate-100 pb-5">
            <span className="font-extrabold font-sans">
              {t.intQuestionOf ? t.intQuestionOf.replace("{index}", String(currentIdx + 1)) : `السؤال ${currentIdx + 1} من 5`}
            </span>
            <div className="flex gap-1.5 direction-ltr">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 w-10 rounded-full transition-all duration-300 ${
                    i < currentIdx 
                      ? "bg-emerald-500" 
                      : i === currentIdx 
                        ? "bg-indigo-600 animate-pulse w-14" 
                        : "bg-slate-150 bg-slate-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current Question */}
          <div className="bg-indigo-50/30 border border-indigo-100/50 p-6 md:p-8 rounded-3xl space-y-4 shadow-3xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 font-sans block leading-none">
              {isRtl ? "سؤال المقابلة الحالي:" : "Current Interview Question:"}
            </span>
            <p className="text-sm md:text-base font-extrabold leading-relaxed text-slate-900">{questions[currentIdx]}</p>
          </div>

          {/* Answer Inputs */}
          <div className="space-y-3.5">
            <label className="block text-slate-700 text-xs font-black uppercase tracking-wider font-sans">{t.intYourAnswer}</label>
            <textarea
              rows={5}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              disabled={stage === "submitting"}
              placeholder={isRtl ? "اكتب إجابتك الاحترافية بالتفصيل لتحصل على أفضل تقييم..." : "Formulate your thorough response to receive maximum stars..."}
              className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 text-xs md:text-sm p-4 rounded-2xl outline-none transition duration-150 disabled:opacity-60 leading-relaxed font-sans shadow-2xs placeholder:text-slate-400 text-slate-800"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end pt-2">
            <button
              onClick={submitAnswer}
              disabled={!currentAnswer.trim() || stage === "submitting"}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-20 transition duration-200 font-bold text-xs md:text-sm text-white px-8 py-4 rounded-xl flex items-center justify-center gap-2"
            >
              {stage === "submitting" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRtl ? "جاري التقييم..." : "Evaluating..."}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.intSubmitAns}</span>
                </>
              )}
            </button>
          </div>

          {/* Display feedback of PREVIOUS questions to help them learn */}
          {feedbacks.length > 0 && (
            <div className="space-y-4 pt-8 border-t border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-sans">
                {isRtl ? "تقييمات الأسئلة السابقة:" : "Prior Rounds Evaluations:"}
              </h4>
              <div className="space-y-4">
                {feedbacks.map((fb, idx) => (
                  <div key={idx} className="bg-slate-50/50 border border-slate-100 p-6 rounded-3xl space-y-3 shadow-3xs text-right">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-600 font-sans">
                        {isRtl ? `الرد على السؤال ${idx + 1}` : `Round ${idx + 1} Assessment`}
                      </span>
                      <div className="flex gap-0.5 text-amber-500">
                        {[...Array(5)].map((_, sIdx) => (
                          <Star
                            key={sIdx}
                            className={`w-4 h-4 ${sIdx < fb.score ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans font-light">{fb.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STAGE: FINISHED REPORT CARD */}
      {stage === "finished" && (
        <div className="space-y-8 py-4 max-w-xl mx-auto relative z-10 text-right">
          <div className="text-center space-y-3">
            <div className="inline-flex bg-emerald-50 text-emerald-600 p-4 rounded-full text-3xl shadow-3xs">
              <span>🏆</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-950">{t.intReport}</h3>
            <p className="text-xs text-slate-500">{t.intSuccess}</p>
          </div>

          {/* Major score widget */}
          <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex flex-col items-center justify-center space-y-4 shadow-3xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-sans">{t.intAvgScore}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-slate-900">{calculateAverageScore()}</span>
              <span className="text-lg text-slate-400">/ 5</span>
            </div>
            <div className="flex gap-1.5 text-amber-500 pb-1">
              {[...Array(5)].map((_, sIdx) => (
                <Star
                  key={sIdx}
                  className={`w-6 h-6 ${sIdx < Math.round(calculateAverageScore()) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                />
              ))}
            </div>
          </div>

          {/* Question breakdown list */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
              {isRtl ? "تفصيل الأداء لكل سؤال:" : "Performance Breakdown per Round:"}
            </h4>
            <div className="space-y-5">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-3 shadow-3xs text-xs">
                  <div className="font-extrabold text-slate-800 text-sm leading-relaxed">
                    {idx + 1}. {q}
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-slate-600 leading-relaxed font-sans font-light">
                    <span className="font-bold text-slate-700 block mb-1">
                      {isRtl ? "إجابتك:" : "Your Response:"}
                    </span>
                    {answers[idx]}
                  </div>
                  <div className="text-slate-600 leading-relaxed pt-1 flex gap-2.5 font-sans">
                    <span className="text-indigo-600 font-bold shrink-0">
                      {isRtl ? "توجيه روبوت المقابلات:" : "Advisor Response:"}
                    </span>
                    <span className="font-light">{feedbacks[idx]?.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reset tab */}
          <button
            onClick={resetInterview}
            className="w-full bg-slate-900 hover:bg-slate-800 active:scale-98 transition duration-200 py-4 rounded-2xl font-black text-xs md:text-sm text-white flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
          >
            <Undo className="w-4 h-4 text-white" />
            <span>{t.intRetake}</span>
          </button>
        </div>
      )}
    </div>
  );
};
