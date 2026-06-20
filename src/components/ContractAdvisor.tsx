import React, { useState } from "react";
import { FileCheck, ShieldAlert, Award, Calculator, Info, CheckCircle2, Loader2, AlertTriangle, ArrowRight, DollarSign } from "lucide-react";
import { apiFetchJson, ApiAuthError } from "../utils/apiClient";

interface ContractAdvisorProps {
  language: "ar" | "en";
}

export function ContractAdvisor({ language }: ContractAdvisorProps) {
  const isRtl = language === "ar";
  
  // Contract inputs
  const [jobTitle, setJobTitle] = useState("");
  const [salary, setSalary] = useState("");
  const [currency, setCurrency] = useState("SAR");
  const [country, setCountry] = useState("KSA");
  const [hasHousing, setHasHousing] = useState(true);
  const [hasTransport, setHasTransport] = useState(true);
  const [hasMedical, setHasMedical] = useState(true);
  const [hasFlights, setHasFlights] = useState(true);
  const [extraText, setExtraText] = useState("");

  // Loading and output
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleAudit = async () => {
    if (!jobTitle || !salary) {
      alert(isRtl ? "يرجى إدخال المسمى الوظيفي والراتب المعروض." : "Please enter the job title and salary offer.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetchJson<{ success: boolean; message?: string }>(
        "/api/ai/contract-audit",
        {
          method: "POST",
          body: JSON.stringify({ jobTitle, salary, currency, country, hasHousing, hasTransport, hasMedical, hasFlights, extraText, language })
        }
      );
      if (data.success) {
        setAuditResult(data);
      } else {
        alert(isRtl ? "تعذر الاتصال بمدقق العقود." : "Failed to generate contract audit scorecard.");
      }
    } catch (err) {
      if (err instanceof ApiAuthError) {
        alert(isRtl ? "يرجى تسجيل الدخول لاستخدام مستشار العقود." : "Please log in to use the contract advisor.");
      } else {
        alert((err as Error).message || (isRtl ? "حدث خطأ غير متوقع." : "An unexpected error occurred."));
      }
    } finally {
      setLoading(false);
    }
  };

  const countriesData = [
    { code: "KSA", ar: "المملكة العربية السعودية 🇸🇦", en: "Saudi Arabia 🇸🇦", defCurr: "SAR" },
    { code: "UAE", ar: "الإمارات العربية المتحدة 🇦🇪", en: "United Arab Emirates 🇦🇪", defCurr: "AED" },
    { code: "Qatar", ar: "دولة قطر 🇶🇦", en: "Qatar 🇶🇦", defCurr: "QAR" },
    { code: "Kuwait", ar: "دولة الكويت 🇰🇼", en: "Kuwait 🇰🇼", defCurr: "KWD" },
    { code: "Oman", ar: "سلطنة عمان 🇴🇲", en: "Oman 🇴🇲", defCurr: "OMR" },
    { code: "Egypt", ar: "جمهورية مصر العربية 🇪🇬", en: "Egypt (Local/Offices) 🇪🇬", defCurr: "EGP" }
  ];

  return (
    <div id="contract-advisor-section" className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs">
        {/* Header banner */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isRtl ? "مستشار العقود وتدقيق جهوزية السفر بالخارج ✈️" : "AI Contract & Visa Preparation Coach ✈️"}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isRtl
                ? "حلّل تفصيليًا سلامة العروض المالية الواردة من مكاتب التوظيف بالخارج وملاءمتها للمعيشة، وافهم المستندات الحكومية اللازمة لسفرك."
                : "Evaluate foreign contract proposals for salary fairness and inflation, scan for legal pitfalls, and compile your travel checklist."}
            </p>
          </div>
        </div>

        {/* FIX: تنويه قانوني واضح — كان غائبًا تمامًا، ضروري لمنصة تتعامل مع قرارات هجرة عمل حقيقية */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
            {isRtl
              ? "هذا التحليل آلي وتقريبي ويعتمد على المعطيات التي أدخلتها فقط، وهو لا يُعد استشارة قانونية رسمية ولا يحل محل محامي عمل أو مستشار هجرة مرخّص. يُرجى التحقق من تفاصيل العقد مع جهة موثوقة قبل اتخاذ أي قرار نهائي."
              : "This is an automated, approximate analysis based only on the data you entered. It is not formal legal advice and does not replace a licensed labor lawyer or immigration consultant. Please verify contract details with a trusted authority before making any final decision."}
          </p>
        </div>

        {/* INPUT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider block border-b pb-2">
              {isRtl ? "🔍 معطيات العرض الوظيفي والراتب" : "🔍 Enter Job Offer Variables"}
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{isRtl ? "بلد الوجهة المستهدف" : "Destination GCC / Country"}</label>
              <select
                value={country}
                onChange={(e) => {
                  const targetCode = e.target.value;
                  setCountry(targetCode);
                  const matched = countriesData.find(c => c.code === targetCode);
                  if (matched) setCurrency(matched.defCurr);
                }}
                className="w-full px-3 py-2 bg-white border rounded-xl text-xs outline-none focus:border-indigo-500 font-sans"
              >
                {countriesData.map(c => (
                  <option key={c.code} value={c.code}>{isRtl ? c.ar : c.en}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{isRtl ? "المسمى الوظيفي المعروض" : "Offered Job Title"}</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder={isRtl ? "مثال: مندوب مبيعات، مهندس موقع، ممرض" : "e.g. Site Engineer, Teacher, Sales Advocate"}
                className="w-full px-3 py-2 bg-white border rounded-xl text-xs outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{isRtl ? "الراتب الأساسي المعروض" : "Proposed Salary"}</label>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 bg-white border rounded-xl text-xs outline-none focus:border-indigo-500 font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{isRtl ? "العملة" : "Currency"}</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="SAR, AED"
                  className="w-full px-3 py-2 bg-white border rounded-xl text-xs outline-none focus:border-indigo-500 font-sans text-center font-bold"
                />
              </div>
            </div>

            {/* BENEFITS CHECKBOX GRID */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-600 block">
                {isRtl ? "مميزات وبدلات يتضمنها العقد مجاناً:" : "Fringes & Allowances Included:"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center gap-2 bg-white p-2.5 rounded-lg border text-xs cursor-pointer select-none">
                  <input type="checkbox" checked={hasHousing} onChange={() => setHasHousing(!hasHousing)} className="accent-indigo-500" />
                  <span>{isRtl ? "🏡 سكن مؤمن" : "🏡 Free Housing"}</span>
                </label>
                <label className="flex items-center gap-2 bg-white p-2.5 rounded-lg border text-xs cursor-pointer select-none">
                  <input type="checkbox" checked={hasTransport} onChange={() => setHasTransport(!hasTransport)} className="accent-indigo-500" />
                  <span>{isRtl ? "🚗 مواصلات / سيارة" : "🚗 Transport"}</span>
                </label>
                <label className="flex items-center gap-2 bg-white p-2.5 rounded-lg border text-xs cursor-pointer select-none">
                  <input type="checkbox" checked={hasMedical} onChange={() => setHasMedical(!hasMedical)} className="accent-indigo-500" />
                  <span>{isRtl ? "🩺 تأمين صحي" : "🩺 Medical Coverage"}</span>
                </label>
                <label className="flex items-center gap-2 bg-white p-2.5 rounded-lg border text-xs cursor-pointer select-none">
                  <input type="checkbox" checked={hasFlights} onChange={() => setHasFlights(!hasFlights)} className="accent-indigo-500" />
                  <span>{isRtl ? "✈️ تذاكر طيران سنوية" : "✈️ Annual Flight tickets"}</span>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{isRtl ? "تفاصيل العقوبة أو شروط إضافية (اختياري)" : "Add extra terms / text of offer (Optional)"}</label>
              <textarea
                value={extraText}
                onChange={(e) => setExtraText(e.target.value)}
                rows={2}
                placeholder={isRtl ? "انسخ أي بنود مثيرة للشك هنا، مثلاً: غرامات فسخ العقد المبكر..." : "Paste any conditions, e.g., early termination penalties..."}
                className="w-full px-3 py-2.5 bg-white border rounded-xl text-xs outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <button
              onClick={handleAudit}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRtl ? "جاري التدقيق المالي والحكومي..." : "Auditing terms with AI..."}</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>{isRtl ? "ابدأ التدقيق المالي والأوراق المطلوبة ⚖️" : "Assess Terms & Travel Needs ⚖️"}</span>
                </>
              )}
            </button>
          </div>

          {/* AUDIT OUTPUT DISPLAY */}
          <div className="lg:col-span-7">
            {auditResult ? (
              <div className="space-y-6">

                {/* تنويه مختصر ملاصق للنتيجة الفعلية — يراه المستخدم لحظة اتخاذ القرار */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>{isRtl ? "نتيجة تقريبية بالذكاء الاصطناعي — ليست استشارة قانونية رسمية." : "Approximate AI result — not formal legal advice."}</span>
                </div>

                {/* 1. Score Rating Callout */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                      {isRtl ? "مؤشر عدالة وموثوقية العرض" : "Offer Financial Justice Indicator"}
                    </span>
                    <h4 className="text-lg font-black mt-1">
                      {isRtl ? `درجة العرض: ${auditResult.fairnessStatus}` : `Status: ${auditResult.fairnessStatus}`}
                    </h4>
                    <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
                      {auditResult.financialSummary}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-white/10 px-6 py-4 rounded-2xl border border-white/10 min-w-32 self-stretch md:self-auto text-center">
                    <span className="text-[10px] font-bold text-slate-300 uppercase">{isRtl ? "التقييم الإجمالي" : "Rating Score"}</span>
                    <span className="text-3xl font-black text-indigo-300 mt-1">{auditResult.starsScore} / 5</span>
                  </div>
                </div>

                {/* 2. Red Flags & Pitfalls Warning Box */}
                <div className="bg-amber-50/60 border border-amber-200/80 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs mb-3">
                    <ShieldAlert className="w-4.5 h-4.5" />
                    <span>{isRtl ? "🛑 ثغرات قانونية وتنبيهات هامة للمساءلة:" : "🛑 Crucial Contract Nuances & Red Flags:"}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-amber-900 leading-relaxed font-medium">
                    {auditResult.pitfalls && auditResult.pitfalls.map((pit: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 list-none">
                        <span>⚠️</span>
                        <span>{pit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Local Egyptian Travel Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-800 border-b pb-2">
                    <div className="bg-indigo-50 p-1 rounded">✈️</div>
                    <span>{isRtl ? "مذكرة الأوراق والمستندات الحكومية للسفر من مصر:" : "Egyptian Administrative Clearance Steps for Travel:"}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {isRtl 
                      ? "بناءً على وجهة سفرك، إليك خارطة الطريق الإلزامية لتسهيل الإجراءات القانونية والمكاتب الخدمية في القاهرة ومصر لتنجح في السفر:"
                      : "Dynamic official milestones needed in Egypt based on your Gulf country travel requirements:"}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {auditResult.checklists && auditResult.checklists.map((step: string, idx: number) => (
                      <div key={idx} className="bg-white border p-3 rounded-xl flex items-start gap-2.5">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] font-black text-slate-400 block font-mono">STEP 0{idx+1}</span>
                          <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dummy/Simplay warning */}
                {auditResult.simulated && (
                  <div className="text-center py-2 bg-slate-100 text-[10px] text-slate-500 rounded-lg">
                    {isRtl
                      ? "* هذه الحسابات والتقديرات مأخوذة بناءً على أسعار المعيشة بالخليج توازناً لعام 2026. ضع مفتاح الـ API للتفعيل الكامل لـ Gemini."
                      : "* Standard parameters loaded. Add process.env.GEMINI_API_KEY to fetch bespoke living calculators."}
                  </div>
                )}

              </div>
            ) : (
              <div className="h-full min-h-[280px] border border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <Info className="w-8 h-8 text-slate-300 mb-3" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isRtl ? "بانتظار تفاصيل عرضك الوظيفي" : "Awaiting contract parameters"}
                </h4>
                <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                  {isRtl
                    ? "أدخل المسمى والبدلات باليسار لتقييم عرضك وحساب تكاليف المعيشة ومعادلة الراتب وجاهزية المكاتب الحكومية."
                    : "Fill in the job title and salary offer in the left card to parse financial limits, checks, and administrative steps."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
