import React, { useState } from "react";
import { LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Logo } from "./Logo";

interface AuthScreenProps {
  onAuthSuccess: (user: { email: string; name: string; id: string; profile: any }) => void;
  language: "ar" | "en";
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, language }) => {
  const isRtl = language === "ar";
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegisterDemoUser = () => {
    // Convenience helper to quickly log in with the default demo account
    setEmail("demo@masar-app.com");
    setPassword("demo1234");
    setActiveTab("login");
    setErr("");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSuccessMsg("");

    if (!email || !password || (activeTab === "register" && !name)) {
      setErr(isRtl ? "برجاء استكمال جميع الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = activeTab === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = activeTab === "login" ? { email, password } : { email, password, name };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        if (data.token) {
          localStorage.setItem("masar_token", data.token);
        }
        setSuccessMsg(
          activeTab === "login"
            ? (isRtl ? "تم تسجيل الدخول بنجاح! جاري تحويلك..." : "Signed in successfully! Redirecting...")
            : (isRtl ? "تم إنشاء الحساب بنجاح! جاري تسجيل الدخول تلقائياً..." : "Account created! Logging in automatically...")
        );
        setTimeout(() => {
          onAuthSuccess(data.user);
        }, 1200);
      } else {
        setErr(data.message || (isRtl ? "حدث خطأ غير متوقع." : "An unexpected error occurred."));
      }
    } catch (error) {
      setErr(isRtl ? "فشل الاتصال بالخادم. يرجى التحقق من الشبكة." : "Server connection failed. Verify your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-100/90 rounded-3xl p-8 shadow-xl shadow-slate-100 flex flex-col gap-6 relative overflow-hidden">
        {/* Subtle decorative background blur */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-70 pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-emerald-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

        {/* Mascot / Title block */}
        <div className="text-center space-y-4 relative">
          <Logo size="lg" variant="full" language={language} className="mx-auto select-none justify-center" />
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {isRtl
              ? "سجل ملفك الاحترافي بنظام مسار ودع محرك السحب وحقن الـ AI يربطك بأحدث المقابلات والفرص فورياً"
              : "Register your professional profile to let our daily crawler match you directly to top vacancies."}
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex bg-slate-50 p-1 border border-slate-100 rounded-2xl transition">
          <button
            onClick={() => {
              setActiveTab("login");
              setErr("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "login" ? "bg-white text-slate-900 shadow-sm font-extrabold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{isRtl ? "تسجيل دخول" : "Sign In"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setErr("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "register" ? "bg-white text-slate-900 shadow-sm font-extrabold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isRtl ? "حساب جديد" : "Sign Up"}</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {err && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-semibold leading-relaxed animate-fade-in text-center">
            ⚠️ {err}
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-semibold leading-relaxed animate-pulse text-center">
            🎉 {successMsg}
          </div>
        )}

        {/* Auth Inputs structure */}
        <form onSubmit={handleAuth} className="space-y-4">
          {activeTab === "register" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">
                {isRtl ? "الاسم بالكامل" : "Full Name"}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isRtl ? "مثال: أحمد محمد جلال" : "e.g. Ahmed Mohamed"}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-slate-400 focus:bg-white transition font-sans text-slate-800"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">
              {isRtl ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-slate-400 focus:bg-white transition font-sans text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">
              {isRtl ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-slate-400 focus:bg-white transition font-sans text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 active:scale-98 shadow-md shadow-slate-900/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                {activeTab === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{activeTab === "login" ? (isRtl ? "تسجيل الدخول" : "Sign In") : (isRtl ? "إنشاء حساب ومتابعة" : "Create Account")}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick launch demo option to streamline testing */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            {isRtl ? "الحساب التجريبي الجاهز للمعاينة الفورية" : "DEMO / QUICK PLAYTEST"}
          </p>
          <button
            onClick={handleRegisterDemoUser}
            className="text-xs text-indigo-600 font-extrabold hover:text-indigo-800 hover:underline cursor-pointer"
          >
            {isRtl ? "🔑 تسجيل دخول تلقائي بالحساب التجريبي (demo@masar-app.com)" : "🔑 Autologin with demo@masar-app.com"}
          </button>
        </div>
      </div>
    </div>
  );
};
