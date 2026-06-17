import React, { useState, useEffect } from "react";
import { User, Briefcase, GraduationCap, Sparkles, Plus, Trash2, Save, FileCheck, ArrowLeftRight, Check, Loader2 } from "lucide-react";
import { UserProfile as UserProfileType } from "../../server/users";

interface UserProfileProps {
  email: string;
  language: "ar" | "en";
  onProfileUpdated: (updatedProfile: UserProfileType) => void;
  // Allows syncing directly to the default CV state to update resume layout too!
  onSyncToCV: (profile: UserProfileType) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  email,
  language,
  onProfileUpdated,
  onSyncToCV
}) => {
  const isRtl = language === "ar";
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Master profile state
  const [profile, setProfile] = useState<UserProfileType>({
    personal: { name: "", title: "", email: email, phone: "", location: "", summary: "", website: "" },
    experience: [],
    education: [],
    projects: [],
    languages: [],
    skills: [],
    targetFields: [],
    targetLocations: []
  });

  // Auxiliary string states for easy array tags input
  const [skillsInput, setSkillsInput] = useState("");
  const [fieldsInput, setFieldsInput] = useState("");
  const [locationsInput, setLocationsInput] = useState("");

  // AI Resume Parser States
  const [cvTextToParse, setCvTextToParse] = useState("");
  const [parsing, setParsing] = useState(false);
  const [isParserOpen, setIsParserOpen] = useState(false);

  const handleParseCV = async () => {
    if (!cvTextToParse.trim() || parsing) return;
    setParsing(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/profile/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText: cvTextToParse })
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setSkillsInput(data.profile.skills?.join(", ") || "");
        setFieldsInput(data.profile.targetFields?.join(", ") || "");
        setLocationsInput(data.profile.targetLocations?.join(", ") || "");
        setSuccess(isRtl 
          ? "تم فك وتحليل سيرتك الذاتية بنجاح بنسبة 100%! تم ملء كافة الحقول بالأسفل تلقائياً، يرجى مراجعتها وتعديلها ثم الضغط على 'حفظ الملف' لتوسيع نطاق المزامنة." 
          : "Your CV has been parsed successfully! All columns populated automatically. Please review and click 'Save Changes' below."
        );
        setCvTextToParse("");
        setIsParserOpen(false);
      } else {
        setError(data.message || (isRtl ? "لم نتمكن من تحليل واستخلاص البيانات، يرجى المحاولة بنص آخر." : "Failed to extract structured resume coordinates."));
      }
    } catch (e) {
      setError(isRtl ? "خدمة الذكاء الاصطناعي معطلة مؤقتاً." : "Handshake parser is currently offline.");
    } finally {
      setParsing(false);
    }
  };

  // Temp item states for experience / education entries
  const [newExpCompany, setNewExpCompany] = useState("");
  const [newExpRole, setNewExpRole] = useState("");
  const [newExpDuration, setNewExpDuration] = useState("");
  const [newExpDesc, setNewExpDesc] = useState("");

  const [newEduInst, setNewEduInst] = useState("");
  const [newEduDegree, setNewEduDegree] = useState("");
  const [newEduDuration, setNewEduDuration] = useState("");

  // Fetch initial profile
  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/profile?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setSkillsInput(data.profile.skills?.join(", ") || "");
        setFieldsInput(data.profile.targetFields?.join(", ") || "");
        setLocationsInput(data.profile.targetLocations?.join(", ") || "");
      } else {
        setError(isRtl ? "فشل جلب الملف الشخصي." : "Failed to fetch user profile.");
      }
    } catch (err) {
      setError(isRtl ? "مستشعر الشبكة متعطل." : "Network handshake failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [email]);

  const handleSaveProfile = async (silent = false) => {
    setSaving(true);
    setError("");
    if (!silent) setSuccess("");

    // Prepare updated lists from raw text tags
    const cleanSkills = skillsInput.split(",").map(s => s.trim()).filter(Boolean);
    const cleanFields = fieldsInput.split(",").map(f => f.trim()).filter(Boolean);
    const cleanLocations = locationsInput.split(",").map(l => l.trim()).filter(Boolean);

    const updatedProfile: UserProfileType = {
      ...profile,
      skills: cleanSkills,
      targetFields: cleanFields,
      targetLocations: cleanLocations
    };

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, profile: updatedProfile })
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        onProfileUpdated(data.profile);
        if (!silent) {
          setSuccess(isRtl ? "تمت مزامنة وحفظ ملفك الشخصي بنجاح! 🚀" : "Your profile has been saved successfully! 🚀");
          // Clear notification
          setTimeout(() => setSuccess(""), 4000);
        }
      } else {
        setError(data.message || (isRtl ? "فشل الحفظ." : "Save failed."));
      }
    } catch (err) {
      setError(isRtl ? "خطأ في الاتصال بالخادم." : "Could not reach server.");
    } finally {
      setSaving(false);
    }
  };

  // Add Item Helpers
  const handleAddExperience = () => {
    if (!newExpCompany || !newExpRole) return;
    const newEntry = {
      id: `exp-${Date.now()}`,
      company: newExpCompany,
      role: newExpRole,
      duration: newExpDuration || (isRtl ? "الآن" : "Present"),
      description: newExpDesc
    };
    const updated = { ...profile, experience: [...profile.experience, newEntry] };
    setProfile(updated);
    // Reset fields
    setNewExpCompany("");
    setNewExpRole("");
    setNewExpDuration("");
    setNewExpDesc("");
  };

  const handleRemoveExperience = (id: string) => {
    setProfile({
      ...profile,
      experience: profile.experience.filter(e => e.id !== id)
    });
  };

  const handleAddEducation = () => {
    if (!newEduInst || !newEduDegree) return;
    const newEntry = {
      id: `edu-${Date.now()}`,
      institution: newEduInst,
      degree: newEduDegree,
      duration: newEduDuration
    };
    const updated = { ...profile, education: [...profile.education, newEntry] };
    setProfile(updated);
    // Reset fields
    setNewEduInst("");
    setNewEduDegree("");
    setNewEduDuration("");
  };

  const handleRemoveEducation = (id: string) => {
    setProfile({
      ...profile,
      education: profile.education.filter(e => e.id !== id)
    });
  };

  const handleSyncToCVEditor = () => {
    // Sync current values (incorporating skills & target field mappings)
    const cleanSkills = skillsInput.split(",").map(s => s.trim()).filter(Boolean);
    const updatedProfile = {
      ...profile,
      skills: cleanSkills,
      targetFields: fieldsInput.split(",").map(f => f.trim()).filter(Boolean),
      targetLocations: locationsInput.split(",").map(l => l.trim()).filter(Boolean)
    };
    onSyncToCV(updatedProfile);
    setSuccess(isRtl ? "تمت كبسلة ومزامنة بياناتك مع قوالب السيرة الذاتية الذكية بنجاح! 🎉" : "Successfully synced your data sheets directly with active CV templates! 🎉");
    setTimeout(() => setSuccess(""), 4000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500">{isRtl ? "جاري استيراد ملفك المهني الموثق..." : "Bootstrapping your digital career index..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex gap-1 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-3 py-1 rounded-xl text-xs font-bold items-center">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? "بوابة الملف الشخصي الاحترافي" : "LinkedIn-Style Verified Profile"}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
            <span>👤</span>
            <span>{profile.personal.name || (isRtl ? "ملفك الموطّن" : "Your Career Profile")}</span>
          </h2>
          <p className="text-xs text-indigo-100 max-w-xl leading-relaxed">
            {isRtl
              ? "املأ تفاصيل خبرتك وسنوات عملك، وسنتولى تصفية وسحب أفضل الإعلانات من الجروبات والمواقع والبحث عبر الإنترنت ومطابقتها معك يومياً بشكل تلقائي."
              : "Keep your details updated. Our crawler evaluates web job boards, Facebook pools, and Telegram indexers to feed matching roles daily."}
          </p>
        </div>

        <div className="flex gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleSyncToCVEditor}
            className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/40 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>{isRtl ? "مزامنة مع قالب الـ CV" : "Sync directly to active CV"}</span>
          </button>
          <button
            onClick={() => handleSaveProfile(false)}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-600/10"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isRtl ? "حفظ الملف" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold text-center">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold text-center animate-pulse">
          🎉 {success}
        </div>
      )}

      {/* 🌟 NEW: FAST AI CAREER PROFILE PARSER IMPORT BANNER */}
      <div className="bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-white border border-indigo-100/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xl animate-pulse">🪄</span>
            <div>
              <h3 className="text-sm font-black text-indigo-950 flex items-center gap-1.5">
                <span>{isRtl ? "استيراد وتفريغ البيانات بضغطة واحدة بالذكاء الاصطناعي" : "Fast AI Career Profile Auto-Parser"}</span>
                <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-black">AI POWERED</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                {isRtl 
                  ? "انسخ وصق نص سيرتك الذاتية الحالية هنا ليتولى نظام الـ AI تعبئة وتحديث كافة بيانات ملفك الشخصي وسيرتك الذاتية خلال ثوانٍ معدودة." 
                  : "Paste any raw resume text below. Our AI extracts personal info, dates, skills, and histories to build your digital dossier easily."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsParserOpen(!isParserOpen)}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>{isParserOpen ? (isRtl ? "إغلاق المعالج" : "Close Parser") : (isRtl ? "افتح المستخلص الذكي ⚡" : "Open AI Parser ⚡")}</span>
          </button>
        </div>

        {isParserOpen && (
          <div className="pt-3 border-t border-indigo-100/50 space-y-3">
            <textarea
              rows={5}
              value={cvTextToParse}
              onChange={(e) => setCvTextToParse(e.target.value)}
              placeholder={isRtl 
                ? "الصق تفاصيل سيرتك الذاتية هنا (مثال: الاسم، البريد، الخبرات السابقة مع الفترات الزمنية والجامعة...)" 
                : "Paste your raw text (e.g. John Doe, Web Developer at Tech Inc (2021-2023), BS Computer Science...)"}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800 font-sans leading-relaxed"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleParseCV}
                disabled={parsing || !cvTextToParse.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-600/10"
              >
                {parsing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <span>🪄</span>}
                <span>{parsing ? (isRtl ? "جاري استخلاص وحقن البيانات وحساب الملاءمة..." : "Parsing & extracting...") : (isRtl ? "تفريغ فوري وتحديث الملف" : "Extract & Populate Now")}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column (Personal details & targets) */}
        <div className="lg:col-span-12 space-y-6">
          {/* SEC 1: Personal Profile Info */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
              <span className="p-1.5 bg-slate-50 text-slate-600 rounded-lg"><User className="w-4 h-4" /></span>
              <span>{isRtl ? "معلومات الاتصال والتعريف الأساسية" : "Personal Dossier"}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{isRtl ? "الاسم الكامل" : "Full Name"}</label>
                <input
                  type="text"
                  value={profile.personal.name}
                  onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, name: e.target.value } })}
                  placeholder={isRtl ? "مثال: أحمد جلال" : "Ahmed Galal"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800 font-sans font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{isRtl ? "المسمى الوظيفي المستهدف" : "Target Job Title"}</label>
                <input
                  type="text"
                  value={profile.personal.title}
                  onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, title: e.target.value } })}
                  placeholder={isRtl ? "محاسب مالي، مهندس واجهات..." : "Financial Analyst, UI Engineer..."}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800 font-sans font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{isRtl ? "رقم الهاتف" : "Phone Number"}</label>
                <input
                  type="text"
                  value={profile.personal.phone}
                  onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, phone: e.target.value } })}
                  placeholder="+20 100..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{isRtl ? "مكان الإقامة" : "Current Location"}</label>
                <input
                  type="text"
                  value={profile.personal.location}
                  onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, location: e.target.value } })}
                  placeholder={isRtl ? "القاهرة، مصر" : "Cairo, Egypt"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800 font-sans"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500">{isRtl ? "رابط موقعك / لينكد إن" : "Website / LinkedIn Profile URL"}</label>
                <input
                  type="text"
                  value={profile.personal.website}
                  onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, website: e.target.value } })}
                  placeholder="linkedin.com/in/..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800 font-sans"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500">{isRtl ? "الملخص التعريفي القصير" : "Professional Objective / Summary"}</label>
                <textarea
                  rows={3}
                  value={profile.personal.summary}
                  onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, summary: e.target.value } })}
                  placeholder={isRtl ? "اكتب نبذة مهنية تلخص فيها خبراتك وأهدافك..." : "Briefly summarize your experience sheets..."}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800 font-sans"
                />
              </div>
            </div>
          </div>

          {/* SEC 2: Automated Match Filters */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
              <span className="p-1.5 bg-slate-50 text-slate-600 rounded-lg"><Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /></span>
              <span>{isRtl ? "تفضيلات محرك البحث والمطابقة الذكية" : "Target Smart Match Criteria"}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center flex-wrap">
                  <label className="text-xs font-bold text-slate-500">{isRtl ? "مسميات مهنية مستهدفة" : "Target Fields/Roles"}</label>
                  <span className="text-[10px] text-slate-400 font-sans">{isRtl ? "افصل بفاصلة" : "comma-split"}</span>
                </div>
                <input
                  type="text"
                  value={fieldsInput}
                  onChange={(e) => setFieldsInput(e.target.value)}
                  placeholder={isRtl ? "محاسب، مالي، مراجع" : "Accounting, Financial, Audit"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800 font-sans"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center flex-wrap">
                  <label className="text-xs font-bold text-slate-500">{isRtl ? "الأماكن المستهدفة" : "Preferred Locations"}</label>
                  <span className="text-[10px] text-slate-400 font-sans">{isRtl ? "افصل بفاصلة" : "comma-split"}</span>
                </div>
                <input
                  type="text"
                  value={locationsInput}
                  onChange={(e) => setLocationsInput(e.target.value)}
                  placeholder={isRtl ? "القاهرة، الرياض، عن بعد" : "Cairo, Riyadh, Remote"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800 font-sans"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center flex-wrap">
                  <label className="text-xs font-bold text-slate-500">{isRtl ? "مهاراتك الرئيسية" : "Skills Board Tags"}</label>
                  <span className="text-[10px] text-slate-400 font-sans">{isRtl ? "افصل بفاصلة" : "comma-split"}</span>
                </div>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder={isRtl ? "تحليل مالي، إكسيل، محاسبة" : "Excel, Analysis, ERP"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800 font-sans"
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[10.5px] leading-relaxed text-slate-600 font-medium">
              💡 {isRtl
                ? "تأثير التعبئة: يعتمد المترجم والمطابق الآلي على الكلمات المفتاحية المدرجة هنا لفحص الوظائف الشاغرة وحساب نسبة ملاءمتها اليومية لسيرتك الذاتية."
                : "Match Tuning: Our daily indexing loop scores crawled positions based on these comma-split tokens."}
            </div>
          </div>

          {/* SEC 3: Work Experience List */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
              <span className="p-1.5 bg-slate-50 text-slate-600 rounded-lg"><Briefcase className="w-4 h-4" /></span>
              <span>{isRtl ? "الخبرة المهنية وعقود العمل السابقة" : "Work History Tracker"}</span>
            </h3>

            {/* List rendered */}
            {profile.experience && profile.experience.length > 0 ? (
              <div className="space-y-3 pb-2">
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="p-4 bg-slate-50/70 border rounded-xl flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="text-xs bg-slate-200 text-slate-800 font-extrabold px-2 py-0.5 rounded-md">{exp.company}</span>
                        <span className="text-xs font-bold text-slate-700">{exp.role}</span>
                        <span className="text-[10px] text-slate-400 font-sans font-medium">({exp.duration})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">{isRtl ? "لا توجد خبرات مسجلة الآن. أضف خبرتك بالأسفل." : "No registered histories yet."}</p>
            )}

            {/* Exp Input Block */}
            <div className="p-4 border border-slate-100/80 rounded-2xl bg-slate-50/45 space-y-3">
              <span className="text-xs font-black text-slate-700 block">{isRtl ? "اضافة خبرة مهنية جديدة" : "Add Experience Block"}</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder={isRtl ? "اسم جهة العمل / الشركة" : "Company Name"}
                  value={newExpCompany}
                  onChange={(e) => setNewExpCompany(e.target.value)}
                  className="px-3 py-2 bg-white border rounded-xl text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder={isRtl ? "المسمى الوظيفي" : "Role"}
                  value={newExpRole}
                  onChange={(e) => setNewExpRole(e.target.value)}
                  className="px-3 py-2 bg-white border rounded-xl text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder={isRtl ? "الفترة الزمنية (مثال: 2023 - الآن)" : "Duration (e.g., 2021 - 2023)"}
                  value={newExpDuration}
                  onChange={(e) => setNewExpDuration(e.target.value)}
                  className="px-3 py-2 bg-white border rounded-xl text-xs outline-none font-sans"
                />
              </div>
              <textarea
                placeholder={isRtl ? "تفاصيل مهامك الوظيفية (يفضل نقاط تبدأ بأفعال قوية)" : "Professional responsibilities/impact metrics..."}
                value={newExpDesc}
                onChange={(e) => setNewExpDesc(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-white border rounded-xl text-xs outline-none font-sans"
              />
              <button
                type="button"
                onClick={handleAddExperience}
                className="bg-slate-900 border border-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? "إضافة الخبرة للملف" : "Add to History"}</span>
              </button>
            </div>
          </div>

          {/* SEC 4: Education History List */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
              <span className="p-1.5 bg-slate-50 text-slate-600 rounded-lg"><GraduationCap className="w-4 h-4" /></span>
              <span>{isRtl ? "المؤهلات العلمية والدراسة" : "Academic Achievements"}</span>
            </h3>

            {/* List rendered */}
            {profile.education && profile.education.length > 0 ? (
              <div className="space-y-3 pb-2">
                {profile.education.map((edu) => (
                  <div key={edu.id} className="p-4 bg-slate-50/70 border rounded-xl flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="text-xs bg-indigo-50 text-indigo-800 font-extrabold px-2 py-0.5 rounded-lg border border-indigo-100">{edu.institution}</span>
                        <span className="text-xs font-bold text-slate-700">{edu.degree}</span>
                        <span className="text-[10px] text-slate-400 font-sans font-medium">({edu.duration})</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">{isRtl ? "لا توجد مؤهلات مسجلة. أضف مؤهلك في النموذج بالأسفل." : "No academic histories yet."}</p>
            )}

            {/* Edu Input Block */}
            <div className="p-4 border border-slate-100/80 rounded-2xl bg-slate-50/45 space-y-3">
              <span className="text-xs font-black text-slate-700 block">{isRtl ? "أضف مؤهلاً جامعياً أو دراسياً" : "Add Education Entry"}</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder={isRtl ? "اسم الكلية أو الجامعة والمعهد" : "Institution / University"}
                  value={newEduInst}
                  onChange={(e) => setNewEduInst(e.target.value)}
                  className="px-3 py-2 bg-white border rounded-xl text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder={isRtl ? "الدرجة العلمية والتقدير" : "Degree / Major"}
                  value={newEduDegree}
                  onChange={(e) => setNewEduDegree(e.target.value)}
                  className="px-3 py-2 bg-white border rounded-xl text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder={isRtl ? "المدة (مثال: 2017 - 2021)" : "Duration (e.g., 2017 - 2021)"}
                  value={newEduDuration}
                  onChange={(e) => setNewEduDuration(e.target.value)}
                  className="px-3 py-2 bg-white border rounded-xl text-xs outline-none font-sans"
                />
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="bg-slate-900 border border-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? "إضافة المؤهل للملف" : "Add to Academic"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
