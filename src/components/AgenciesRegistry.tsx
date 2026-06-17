import React, { useState, useEffect } from "react";
import { Building2, Phone, MapPin, Star, Plus, AlertCircle, Loader2, Globe, Facebook, Send, Mail, MessageCircle } from "lucide-react";
import { Agency } from "../types";
import { getAuthHeaders } from "../App";

interface AgenciesRegistryProps {
  language: "ar" | "en";
  t: any;
}

export const AgenciesRegistry: React.FC<AgenciesRegistryProps> = ({ language, t }) => {
  const isRtl = language === "ar";
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeReviewAgency, setActiveReviewAgency] = useState<string | null>(null);

  // New Agency Form fields
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newFacebook, setNewFacebook] = useState("");
  const [newTelegram, setNewTelegram] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // New Review Form fields
  const [revUser, setRevUser] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState("");
  const [revError, setRevError] = useState("");

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agencies");
      const data = await res.json();
      if (data.success) {
        setAgencies(data.agencies || []);
      }
    } catch (err) {
      console.error("Failed to load agencies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const handleAddAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!newName || !newPhone || !newAddress || !newDesc) {
      setFormError(isRtl ? "برجاء استيفاء جميع الخانات المطلوبة." : "All fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/agencies", {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          address: newAddress,
          description: newDesc,
          facebook: newFacebook,
          telegram: newTelegram,
          website: newWebsite,
          email: newEmail,
          whatsapp: newWhatsapp
        })
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess(isRtl ? "تم إضافة مكتب التوظيف بنجاح!" : "Agency added successfully!");
        setNewName("");
        setNewPhone("");
        setNewAddress("");
        setNewDesc("");
        setNewFacebook("");
        setNewTelegram("");
        setNewWebsite("");
        setNewEmail("");
        setNewWhatsapp("");
        fetchAgencies();
        setTimeout(() => setShowAddForm(false), 1500);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const handleAddReview = async (agencyId: string) => {
    setRevError("");
    if (!revUser || !revComment) {
      setRevError(isRtl ? "يرجى تعبئة الاسم والتعليق." : "Please enter your name and comments.");
      return;
    }

    try {
      const res = await fetch(`/api/agencies/${agencyId}/review`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          userName: revUser,
          rating: revRating,
          comment: revComment
        })
      });
      const data = await res.json();
      if (data.success) {
        setRevUser("");
        setRevComment("");
        setRevRating(5);
        fetchAgencies();
        setActiveReviewAgency(null);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setRevError((err as Error).message);
    }
  };

  const filtered = agencies
    .filter((agency) =>
      agency.name.toLowerCase().includes(search.toLowerCase()) ||
      agency.address.toLowerCase().includes(search.toLowerCase()) ||
      agency.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // Sort trusted agencies first
      const aTrusted = a.trustedByOwner ? 1 : 0;
      const bTrusted = b.trustedByOwner ? 1 : 0;
      if (aTrusted !== bTrusted) {
        return bTrusted - aTrusted;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.agencySearch}
          className="w-full sm:max-w-xs px-4 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:border-indigo-500 font-sans"
        />

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto shrink-0 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.agencyAddBtn}</span>
        </button>
      </div>

      {/* STAGE: ADD AGENCY COLLAPSIBLE FORM */}
      {showAddForm && (
        <form onSubmit={handleAddAgency} className="bg-white border rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-800 border-b pb-2">{t.agencyFormTitle}</h3>

          {formError && (
            <div className="bg-rose-50 text-rose-700 border text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="bg-emerald-50 text-emerald-700 border text-xs p-3 rounded-lg">
              {formSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{t.agencyName}</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={isRtl ? "مثال: البسام لتوظيف الأطباء (ترخيص ٤٩٠)" : "e.g., Al Bassam Medical Licensing Bureau"}
                className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{t.agencyPhone}</label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="0224095811"
                className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">{t.agencyAddress}</label>
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder={isRtl ? "شارع الطيران، مدينة نصر، القاهرة" : "Tayaran Street, Cairo"}
              className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">{t.agencyDesc}</label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder={isRtl ? "اكتب نبذة عن التخصصات التي يوفرها المكتب، الوجهات في الخليج وهل توجد تاشيرات حرة..." : "Recruitment agency focus, destinations etc."}
              className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isRtl ? "رابط فيسبوك (اختياري)" : "Facebook Link (Optional)"}</label>
              <input
                type="text"
                value={newFacebook}
                onChange={(e) => setNewFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isRtl ? "رابط تليجرام (اختياري)" : "Telegram Link (Optional)"}</label>
              <input
                type="text"
                value={newTelegram}
                onChange={(e) => setNewTelegram(e.target.value)}
                placeholder="https://t.me/..."
                className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isRtl ? "الموقع الإلكتروني (اختياري)" : "Website (Optional)"}</label>
              <input
                type="text"
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isRtl ? "البريد الإلكتروني للتقديم (اختياري)" : "Recruitment Email (Optional)"}</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="cv@agency.com"
                className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isRtl ? "رابط واتساب مباشر (اختياري)" : "WhatsApp Direct Link (Optional)"}</label>
              <input
                type="text"
                value={newWhatsapp}
                onChange={(e) => setNewWhatsapp(e.target.value)}
                placeholder="https://wa.me/20100000000"
                className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-250 cursor-pointer"
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 rounded-lg text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
            >
              {t.agencySubmit}
            </button>
          </div>
        </form>
      )}

      {/* AGENCY LISTING GRID */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-50 border p-12 rounded-2xl text-center text-slate-500 text-xs">
          {isRtl ? "لا توجد مكاتب توظيف مطابقة للبحث." : "No recruitment agencies match filter guidelines."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((agency) => {
            const isTrusted = agency.trustedByOwner;
            return (
              <div 
                key={agency.id} 
                className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 transition-all ${
                  isTrusted 
                    ? "bg-emerald-50/[0.08] border-emerald-200/60 shadow-[0_2px_8px_-3px_rgba(16,185,129,0.1)]" 
                    : "bg-white border-slate-100/85"
                }`}
              >
                <div className="space-y-3">
                  {/* Agency Title bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl border ${
                        isTrusted 
                          ? "bg-emerald-100/45 text-emerald-700 border-emerald-200/40" 
                          : "bg-indigo-50 text-indigo-600 border-slate-100"
                      }`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">{agency.name}</h4>
                          {isTrusted && (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-lg border border-emerald-200">
                              <span>★ {isRtl ? "موصى به" : "Vouched"}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rating Stars badge */}
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-100/70 px-2 py-0.5 rounded-lg text-amber-700 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{agency.rating || "5.0"}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed leading-[1.6]">{agency.description}</p>

                {/* Contacts details */}
                <div className="space-y-1.5 text-slate-500 font-sans text-xs pt-2">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{agency.phone}</span>
                  </div>
                  {agency.email && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="break-all">{agency.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{agency.address}</span>
                  </div>
                </div>

                {/* Direct Action Contact Channels */}
                {(agency.whatsapp || agency.email) && (
                  <div className="flex gap-2 pt-2 pb-1">
                    {agency.whatsapp && (
                      <a
                        href={agency.whatsapp}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 font-bold rounded-xl text-[11px] transition duration-200 select-none cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{isRtl ? "واتساب مباشر" : "WhatsApp"}</span>
                      </a>
                    )}
                    
                    {agency.email && (
                      <a
                        href={`mailto:${agency.email}?subject=${encodeURIComponent(
                          isRtl ? "تقديم طلب توظيف وسيرة ذاتية عبر بوابة مسار" : "Job Application & Resume - Masar Portal"
                        )}&body=${encodeURIComponent(
                          isRtl
                            ? "السلام عليكم ورحمة الله وبركاته،\nأود التقديم لوظائف ملائمة لتخصصي وتجهيز المقابلات المباشرة عبر مكتبكم الموقر. مرفق لكم سيرتي الذاتية ومؤهلاتي بفارغ الصبر."
                            : "Hello,\nI would like to apply for recruitment vacancies matching my profile and coordinate direct interviews through your agency. Please find attached my CV & credentials."
                        )}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 font-bold rounded-xl text-[11px] transition duration-200 select-none cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{isRtl ? "مراسلة بالإيميل" : "Send Email"}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Social links / entry channels */}
                {(agency.facebook || agency.telegram || agency.website) && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100/65 mt-1">
                    {agency.website && (
                      <a
                        href={agency.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-sans font-medium transition-all"
                      >
                        <Globe className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{isRtl ? "الموقع" : "Website"}</span>
                      </a>
                    )}
                    {agency.facebook && (
                      <a
                        href={agency.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-[11px] font-sans font-medium transition-all"
                      >
                        <Facebook className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{isRtl ? "فيسبوك" : "Facebook"}</span>
                      </a>
                    )}
                    {agency.telegram && (
                      <a
                        href={agency.telegram}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-100 text-sky-700 rounded-lg text-[11px] font-sans font-medium transition-all"
                      >
                        <Send className="w-3.5 h-3.5 text-sky-500" />
                        <span>{isRtl ? "تليجرام" : "Telegram"}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>


              {/* REVIEWS DISCLOSURE */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">
                    {t.agencyReviewTitle.replace("{count}", String(agency.reviews.length))}
                  </span>
                  <button
                    onClick={() => setActiveReviewAgency(activeReviewAgency === agency.id ? null : agency.id)}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer text-xs"
                  >
                    {activeReviewAgency === agency.id ? (isRtl ? "إخفاء التقييم" : "Hide rating") : t.reviewAddBtn}
                  </button>
                </div>

                {/* Add Review Panel inside agency */}
                {activeReviewAgency === agency.id && (
                  <div className="bg-slate-50 p-4 rounded-xl border space-y-3 animate-fadeIn">
                    <h5 className="text-xs font-bold text-slate-700">{isRtl ? "اكتب رأيك الأمين:" : "Your assessment:"}</h5>
                    {revError && <div className="text-[10px] text-rose-600 font-sans">{revError}</div>}
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-0.5">
                        <label className="text-[10px] text-slate-500 font-semibold">{t.reviewUser}</label>
                        <input
                          type="text"
                          value={revUser}
                          onChange={(e) => setRevUser(e.target.value)}
                          placeholder={isRtl ? "الاسم" : "Name"}
                          className="w-full px-2 py-1.5 bg-white border rounded outline-none text-xs"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10px] text-slate-500 font-semibold">{t.reviewStars}</label>
                        <select
                          value={revRating}
                          onChange={(e) => setRevRating(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border rounded outline-none text-xs font-mono"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ 5</option>
                          <option value="4">⭐⭐⭐⭐ 4</option>
                          <option value="3">⭐⭐⭐ 3</option>
                          <option value="2">⭐⭐ 2</option>
                          <option value="1">⭐ 1</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] text-slate-500 font-semibold">{t.reviewComment}</label>
                      <textarea
                        rows={2}
                        value={revComment}
                        onChange={(e) => setRevComment(e.target.value)}
                        placeholder={isRtl ? "كيف كانت تجربتك؟ الرسوم، المصداقية..." : "Brief commentary..."}
                        className="w-full px-2 py-1.5 bg-white border rounded outline-none text-xs"
                      />
                    </div>

                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => setActiveReviewAgency(null)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded text-[10px] font-semibold cursor-pointer"
                      >
                        {isRtl ? "إلغاء" : "Cancel"}
                      </button>
                      <button
                        onClick={() => handleAddReview(agency.id)}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        {t.reviewSubmit}
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews Stream list */}
                {agency.reviews.length > 0 ? (
                  <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 pt-1">
                    {agency.reviews.map((r) => (
                      <div key={r.id} className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 text-xs space-y-1 font-sans">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-700">{r.userName}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-amber-500">★</span>
                            <span className="font-semibold text-slate-500">{r.rating}/5</span>
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px] font-sans">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic pt-1 text-center font-sans">
                    {isRtl ? "لا توجد مراجعات مكتوبة بعد. كن أول من يكتب تقييمه!" : "No reviews submitted yet."}
                  </p>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
