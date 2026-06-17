import React, { useState } from "react";
import { Send, Star, AlertCircle, Loader2, Undo, Play } from "lucide-react";

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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
          const avg = feedbacks.length > 0 ? ((feedbacks.reduce((a,f)=>a+f.score,0) + (data.score||4)) / (feedbacks.length+1)).toFixed(1) : (data.score||4);
          localStorage.setItem("masar_last_interview_avg", String(avg));
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
    <div className="rounded-2xl p-6 md:p-8 space-y-6 text-white masar-animate-up" style={{background:"linear-gradient(135deg,#0f172a,#1a1040)"}}>
      {/* Header */}
      <div className="space-y-2 border-b border-slate-850 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-xl">
            <span>🎤</span>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">{t.intHeader}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{isRtl ? "تدريب تفاعلي عبر الذكاء الاصطناعي" : "Interact and master live interview feedback"}</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 text-rose-300 border border-rose-500/20 p-4 rounded-xl flex items-center gap-2 text-sm font-sans">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STAGE: IDLE */}
      {stage === "idle" && (
        <div className="space-y-6 pt-2 max-w-xl mx-auto text-center md:py-8">
          <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto">{t.intIntro}</p>

          <div className="space-y-3 pt-2">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider text-right print:text-left">
              {t.intJobTitle}
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={isRtl ? "مثال: محاسب تكاليف ومخازن، مطور React..." : "e.g., Financial Accountant, UI Tester..."}
              className="masar-input text-sm" style={{background:"rgba(0,0,0,0.3)",borderColor:"rgba(255,255,255,0.1)",color:"white"}}
            />
          </div>

          <button
            onClick={startInterview}
            className="masar-btn masar-btn-primary w-full md:w-auto md:px-8 py-3 text-sm"
          >
            <Play className="w-4 h-4" />
            <span>{t.intStartBtn}</span>
          </button>
        </div>
      )}

      {/* STAGE: LOADING */}
      {stage === "loading" && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
          <p className="text-slate-300 text-sm animate-pulse">{isRtl ? "جاري صياغة ٥ أسئلة مخصصة بالذكاء الاصطناعي..." : "Formulating 5 personalized questions with AI..."}</p>
        </div>
      )}

      {/* STAGE: CHATTING OR SUBMITTING */}
      {(stage === "chatting" || stage === "submitting") && (
        <div className="space-y-6 md:py-4">
          {/* Progress gauge */}
          <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-850 pb-3">
            <span>{t.intQuestionOf.replace("{index}", String(currentIdx + 1))}</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded ${
                    i < currentIdx ? "bg-emerald-500" : i === currentIdx ? "bg-indigo-500 animate-pulse" : "bg-slate-800"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current Question */}
          <div className="rounded-2xl p-6 space-y-3" style={{background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              {isRtl ? "سؤال المقابلة الحالي:" : "Current Interview Question:"}
            </span>
            <p className="text-md md:text-lg font-medium leading-relaxed text-slate-100">{questions[currentIdx]}</p>
          </div>

          {/* Answer Inputs */}
          <div className="space-y-3">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider">{t.intYourAnswer}</label>
            <textarea
              rows={4}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              disabled={stage === "submitting"}
              placeholder={isRtl ? "اكتب إجابتك الاحترافية بالتفصيل لتحصل على أفضل تقييم..." : "Formulate your thorough response to receive maximum stars..."}
              className="masar-input text-sm disabled:opacity-50" style={{background:"rgba(0,0,0,0.3)",borderColor:"rgba(255,255,255,0.1)",color:"white"}}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end pt-2">
            <button
              onClick={submitAnswer}
              disabled={!currentAnswer.trim() || stage === "submitting"}
              className="masar-btn masar-btn-primary px-6 py-3 text-sm disabled:opacity-20"
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
            <div className="space-y-4 pt-6 border-t border-slate-850">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {isRtl ? "تقييمات الأسئلة السابقة:" : "Prior Rounds Evaluations:"}
              </h4>
              <div className="space-y-3">
                {feedbacks.map((fb, idx) => (
                  <div key={idx} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-300">
                        {isRtl ? `الرد على السؤال ${idx + 1}` : `Round ${idx + 1} Assessment`}
                      </span>
                      <div className="flex flex-row-reverse gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, sIdx) => (
                          <Star
                            key={sIdx}
                            className={`w-3.5 h-3.5 ${sIdx < fb.score ? "fill-amber-400 text-amber-400" : "text-slate-800"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{fb.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}


      {/* STAGE: FINISHED REPORT CARD */}
      {stage === "finished" && (
        <div className="space-y-6 py-4 max-w-xl mx-auto">
          <div className="text-center space-y-2">
            <div className="inline-flex bg-emerald-500/10 text-emerald-400 p-3 rounded-full text-3xl">
              <span>🏆</span>
            </div>
            <h3 className="text-xl font-bold text-white">{t.intReport}</h3>
            <p className="text-xs text-slate-400">{t.intSuccess}</p>
          </div>

          {/* Major score widget */}
          <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl flex flex-col items-center justify-center space-y-3">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t.intAvgScore}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">{calculateAverageScore()}</span>
              <span className="text-lg text-slate-600">/ 5</span>
            </div>
            <div className="flex gap-1 text-amber-400 pb-1 flex-row-reverse">
              {[...Array(5)].map((_, sIdx) => (
                <Star
                  key={sIdx}
                  className={`w-5 h-5 ${sIdx < Math.round(calculateAverageScore()) ? "fill-amber-400 text-amber-400" : "text-slate-800"}`}
                />
              ))}
            </div>
          </div>

          {/* Question breakdown list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isRtl ? "تفصيل الأداء لكل سؤال:" : "Performance Breakdown per Round:"}
            </h4>
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-2 text-xs">
                  <div className="font-medium text-slate-300">
                    {idx + 1}. {q}
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850 text-slate-400 leading-relaxed">
                    <span className="font-bold text-slate-300 block mb-1">
                      {isRtl ? "إجابتك:" : "Your Response:"}
                    </span>
                    {answers[idx]}
                  </div>
                  <div className="text-slate-400 leading-relaxed pt-1 flex gap-2">
                    <span className="text-indigo-400 font-bold shrink-0">
                      {isRtl ? "توجيه روبوت المقابلات:" : "Advisor Response:"}
                    </span>
                    <span>{feedbacks[idx]?.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reset tab */}
          <button
            onClick={resetInterview}
            className="masar-btn masar-btn-ghost w-full py-3 text-sm text-slate-300 border-slate-700"
          >
            <Undo className="w-4 h-4" />
            <span>{t.intRetake}</span>
          </button>
        </div>
      )}
    </div>
  );
};
