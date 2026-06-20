import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import jwt from "jsonwebtoken";
import cors from "cors";
import rateLimit from "express-rate-limit";

dotenv.config();

import { getStoredJobs } from "./server/jobSource.js";
import { getInfluencerPosts } from "./server/influencers.js";
import { getStoredAgencies, saveAgencies } from "./server/agencies.js";
import {
  startTelegramBot,
  stopTelegramBot,
  handleBotMessage,
  triggerDailyVacancyBroadcast,
  botLogs,
  getBotSubscriptions,
  isActualTokenActive
} from "./server/telegram.js";
import { normalizeSearchQuery } from "./src/utils/colloquial.js";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getMatchedJobs
} from "./server/users.js";

// ─────────────────────────────────────────────
// FIX #1 — JWT_SECRET: رفض التشغيل بدون secret حقيقي في production
// ─────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: JWT_SECRET environment variable is not set. Refusing to start.");
    process.exit(1);
  } else {
    console.warn("WARNING: JWT_SECRET not set. Using insecure dev fallback. NEVER deploy this.");
  }
}
const SECRET = JWT_SECRET || "dev_only_insecure_secret_do_not_deploy";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.set("trust proxy", 1);

// FIX #2 — express.json: رفع الحد من 100kb الافتراضي إلى 15mb لدعم PDF upload
app.use(express.json({ limit: "15mb" }));

// ─────────────────────────────────────────────
// FIX #3 — CORS: قائمة بيضاء حقيقية بدل قبول الكل
// ─────────────────────────────────────────────
const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  // production domains — يُضاف من .env
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.APP_URL ? [process.env.APP_URL] : []),
]);

app.use(cors({
  origin: (originStr, callback) => {
    // طلبات بدون origin (mobile apps, Postman, server-to-server) — مسموح في dev فقط
    if (!originStr) {
      if (process.env.NODE_ENV === "production") {
        return callback(new Error("Origin required in production"), false);
      }
      return callback(null, true);
    }
    // run.app لـ Google Cloud Run (staging)
    if (originStr.includes(".run.app") || originStr.includes(".railway.app")) {
      return callback(null, true);
    }
    if (ALLOWED_ORIGINS.has(originStr)) {
      return callback(null, true);
    }
    // رفض أي origin غير معروف
    return callback(new Error(`CORS: Origin ${originStr} not allowed`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ─────────────────────────────────────────────
// RATE LIMITERS
// ─────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "لقد تجاوزت الحد الأقصى للطلبات. يرجى الانتظار قليلاً." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,                   // شُدِّد من 50 إلى 20 لمنع Brute Force
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "محاولات دخول متكررة. يرجى الانتظار 15 دقيقة." }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "تم استهلاك حد طلبات الذكاء الاصطناعي. يرجى الانتظار." }
});

// FIX #4 — Admin limiter: حد صارم على endpoints الإدارة
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "تجاوزت حد طلبات لوحة الإدارة." }
});

app.use(generalLimiter);

// ─────────────────────────────────────────────
// AUTH MIDDLEWARE
// ─────────────────────────────────────────────
export interface AuthenticatedRequest extends express.Request {
  user?: { email: string; id: string };
}

function requireAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "غير مصرح بالدخول، يرجى تسجيل الدخول أولاً." });
  }
  try {
    const decoded = jwt.verify(token, SECRET) as { email: string; id: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "جلسة منتهية، يرجى إعادة تسجيل الدخول." });
  }
}

// FIX #5 — requireAdmin: middleware منفصل للـ endpoints الإدارية
function requireAdmin(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "غير مصرح." });
  }
  try {
    const decoded = jwt.verify(token, SECRET) as { email: string; id: string; role?: string };
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);
    if (!ADMIN_EMAILS.includes(decoded.email)) {
      return res.status(403).json({ success: false, message: "ليس لديك صلاحية الوصول." });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "جلسة منتهية." });
  }
}

// ─────────────────────────────────────────────
// GEMINI CLIENT
// ─────────────────────────────────────────────
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
  }
  return aiClient;
}

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

// JOBS — public read, مقبول
app.get("/api/jobs", async (req, res) => {
  try {
    const { keyword, location, type } = req.query;
    let jobs = await getStoredJobs();
    if (keyword && typeof keyword === "string" && keyword.trim()) {
      const norm = normalizeSearchQuery(keyword);
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(norm.toLowerCase()) ||
        j.description.toLowerCase().includes(norm.toLowerCase()) ||
        j.company.toLowerCase().includes(norm.toLowerCase())
      );
    }
    if (location && typeof location === "string" && location.trim()) {
      const norm = normalizeSearchQuery(location);
      jobs = jobs.filter(j => j.location.toLowerCase().includes(norm.toLowerCase()));
    }
    if (type && typeof type === "string" && type !== "all") {
      jobs = jobs.filter(j => j.type === type);
    }
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// FIX #6 — /api/admin/stats: يتطلب admin الآن
app.get("/api/admin/stats", adminLimiter, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    let usersCount = 0;
    try {
      const usersPath = path.join(process.cwd(), "data", "users.json");
      if (fs.existsSync(usersPath)) {
        const parsed = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
        if (Array.isArray(parsed)) usersCount = parsed.length;
      }
    } catch (e) {
      console.error("Error reading stats:", e);
    }
    const jobs = await getStoredJobs();
    res.json({ success: true, jobsCount: jobs.length, usersCount });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// AUTH — register
app.post("/api/auth/register", authLimiter, (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "يرجى تعبئة جميع الحقول المطلوبة." });
    }
    // حد أدنى لكلمة المرور
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." });
    }
    const result = registerUser(email, password, name);
    if (!result.success || !result.user) return res.status(400).json(result);
    const token = jwt.sign({ email: result.user.email, id: result.user.id }, SECRET, { expiresIn: "7d" });
    res.json({ success: true, user: result.user, token });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// AUTH — login
app.post("/api/auth/login", authLimiter, (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "يرجى إدخال البريد الإلكتروني وكلمة المرور." });
    }
    const result = loginUser(email, password);
    if (!result.success || !result.user) return res.status(400).json(result);
    const token = jwt.sign({ email: result.user.email, id: result.user.id }, SECRET, { expiresIn: "7d" });
    res.json({ success: true, user: result.user, token });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// PROFILE
app.get("/api/profile", requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(400).json({ success: false, message: "البريد الإلكتروني غير معروف." });
    const result = getProfile(email);
    if (!result.success) return res.status(404).json(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

app.put("/api/profile", requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(400).json({ success: false, message: "غير مصرح." });
    const result = updateProfile(email, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

app.get("/api/jobs/matched", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(400).json({ success: false, message: "غير مصرح." });
    const result = await getMatchedJobs(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// INFLUENCERS
app.get("/api/influencers", async (req, res) => {
  try {
    const posts = await getInfluencerPosts();
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// AGENCIES — public read
app.get("/api/agencies", (req, res) => {
  try {
    res.json({ success: true, agencies: getStoredAgencies() });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// FIX #7 — POST /api/agencies: يتطلب تسجيل دخول الآن + validation
app.post("/api/agencies", requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { name, phone, address, description, image, facebook, telegram, website, email, whatsapp } = req.body;
    if (!name?.trim() || !phone?.trim() || !address?.trim() || !description?.trim()) {
      return res.status(400).json({ success: false, message: "يرجى تعبئة جميع الحقول المطلوبة." });
    }
    // حد أدنى للطول
    if (description.trim().length < 20) {
      return res.status(400).json({ success: false, message: "الوصف يجب أن يكون 20 حرفاً على الأقل." });
    }
    const current = getStoredAgencies();
    const newAgency = {
      id: `agency-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      description: description.trim(),
      image: image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop",
      rating: 0,
      reviews: [],
      userAdded: true,
      addedBy: req.user!.email,      // تسجيل من أضاف المكتب
      facebook: facebook?.trim() || "",
      telegram: telegram?.trim() || "",
      website: website?.trim() || "",
      email: email?.trim() || "",
      whatsapp: whatsapp?.trim() || ""
    };
    current.unshift(newAgency);
    saveAgencies(current);
    res.json({ success: true, message: "تم إضافة مكتب التوظيف وسيُراجع قبل الظهور للعموم.", agency: newAgency });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// FIX #8 — POST /api/agencies/:id/review: يتطلب تسجيل دخول + validation على rating
app.post("/api/agencies/:id/review", requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userName = req.user!.email;  // الاسم من التوكن لا من المستخدم

    if (!rating || !comment?.trim()) {
      return res.status(400).json({ success: false, message: "التقييم والتعليق مطلوبان." });
    }
    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: "التقييم يجب أن يكون رقمًا صحيحًا بين 1 و5." });
    }
    if (comment.trim().length < 10) {
      return res.status(400).json({ success: false, message: "التعليق يجب أن يكون 10 أحرف على الأقل." });
    }

    const current = getStoredAgencies();
    const idx = current.findIndex(a => a.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: "المكتب غير موجود." });

    // منع المستخدم من تقييم نفس المكتب مرتين
    const alreadyReviewed = current[idx].reviews.some((r: any) => r.userEmail === userName);
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: "لقد قيّمت هذا المكتب من قبل." });
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      userName,
      userEmail: userName,
      rating: numRating,
      comment: comment.trim(),
      date: new Date().toISOString().split("T")[0]
    };

    current[idx].reviews.unshift(newReview);
    const total = current[idx].reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    current[idx].rating = Number((total / current[idx].reviews.length).toFixed(1));

    saveAgencies(current);
    res.json({ success: true, message: "تم تسجيل تقييمك بنجاح.", agency: current[idx] });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// TELEGRAM STATUS — public read (لا يكشف بيانات حساسة)
app.get("/api/telegram/status", (req, res) => {
  res.json({
    success: true,
    activeToken: isActualTokenActive(),
    logsCount: botLogs.length,
    subscriptionsCount: getBotSubscriptions().length
  });
});

// TELEGRAM TEST COMMAND — يتطلب دخول
app.post("/api/telegram/test-command", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { text, username, chatId } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "النص مطلوب." });
    const messagePayload = {
      chat: { id: chatId ? Number(chatId) : 555777 },
      from: { first_name: username || "مستخدم تجريبي" },
      text
    };
    const replies = await handleBotMessage("SIMULATION_TOKEN", messagePayload, true);
    res.json({ success: true, replies });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// FIX #9 — TELEGRAM BROADCAST: يتطلب admin فقط
app.post("/api/telegram/trigger-broadcast", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const stats = await triggerDailyVacancyBroadcast();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// CV ATS ANALYZER
app.post("/api/cv/ats", aiLimiter, requireAuth, async (req: AuthenticatedRequest, res) => {
  const { cvText, cvPdf, jobDescription } = req.body;
  if ((!cvText && !cvPdf) || !jobDescription) {
    return res.status(400).json({ success: false, message: "يرجى إدخال نص الـ CV أو رفع PDF مع وصف الوظيفة." });
  }
  const ai = getGeminiClient();
  if (!ai) {
    const randomScore = Math.floor(Math.random() * 25) + 55;
    return res.json({
      success: true, simulated: true, score: randomScore,
      missingKeywords: ["نظم إدارة علاقات العملاء (CRM)", "ERP Odoo", "تحليل القوائم المالية"],
      formattingFeedback: "القالب مريح. تجنب الجداول المعقدة وتقسيم متعدد الأعمدة.",
      recommendations: "أعد صياغة أدوارك بأفعال عمل قوية مع أرقام قابلة للقياس."
    });
  }
  try {
    let contents: any;
    if (cvPdf) {
      contents = { parts: [
        { inlineData: { data: cvPdf, mimeType: "application/pdf" } },
        { text: `Analyze this resume PDF against the job description for ATS compatibility. Return strict JSON with keys: score (0-100), missingKeywords (array), formattingFeedback (string), recommendations (string). Prefer Arabic if content is Arabic.\n\nJob Description:\n${jobDescription}` }
      ]};
    } else {
      contents = `Analyze this resume for ATS compatibility against the job description. Return strict JSON with keys: score (0-100), missingKeywords (array), formattingFeedback (string), recommendations (string). Prefer Arabic.\n\nJob:\n${jobDescription}\n\nResume:\n${cvText}`;
    }
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents, config: { responseMimeType: "application/json" } });
    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, simulated: false, ...parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في فحص الذكاء الاصطناعي: " + (err as Error).message });
  }
});

// CV EXTRACT TEXT
app.post("/api/cv/extract-text", aiLimiter, requireAuth, async (req: AuthenticatedRequest, res) => {
  const { cvPdf } = req.body;
  if (!cvPdf) return res.status(400).json({ success: false, message: "ملف الـ PDF مطلوب." });
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({ success: true, simulated: true, text: "أحمد محمود\nمحاسب مالي أول\nالقاهرة، مصر\nخبرة 5 سنوات." });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: { parts: [
        { inlineData: { data: cvPdf, mimeType: "application/pdf" } },
        { text: "Extract all visible text from this PDF resume exactly as-is. No commentary, just the raw extracted text." }
      ]}
    });
    res.json({ success: true, simulated: false, text: response.text || "" });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في استخراج النص: " + (err as Error).message });
  }
});

// CV TAILOR
app.post("/api/cv/tailor", aiLimiter, requireAuth, async (req: AuthenticatedRequest, res) => {
  const { cvData, jobDescription } = req.body;
  if (!cvData || !jobDescription) return res.status(400).json({ success: false, message: "البيانات ناقصة." });
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      success: true, simulated: true,
      tailoredSummary: "محترف شغوف ومتطلع للنمو في كبرى الشركات عبر توظيف خبراتي المتوافقة مع احتياجات الوظيفة المطلوبة.",
      tailoredSkills: ["التحليل المالي", "إدخال البيانات", "حل المشكلات", ...cvData.skills]
    });
  }
  try {
    const prompt = `You are an expert HR tailoring assistant. Rewrite the professional summary and optimize the skills list to match the job description. Do NOT invent fake credentials. Prefer Arabic. Return strict JSON with keys: tailoredSummary (string), tailoredSkills (array of strings).\n\nJob:\n${jobDescription}\n\nCurrent Summary: ${cvData.personal?.summary}\nCurrent Skills: ${cvData.skills?.join(", ")}`;
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    res.json({ success: true, simulated: false, ...JSON.parse(response.text || "{}") });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// INTERVIEW START
app.post("/api/interview/start", aiLimiter, requireAuth, async (req: AuthenticatedRequest, res) => {
  const { jobTitle, cvData } = req.body;
  if (!jobTitle) return res.status(400).json({ success: false, message: "المسمى الوظيفي مطلوب." });
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      success: true, simulated: true,
      questions: [
        "أخبرني عن نفسك وعن تجربتك المهنية.",
        `لماذا تريد العمل في مجال ${jobTitle}؟`,
        "ما أكبر إنجاز حققته في مسيرتك المهنية؟",
        "كيف تتعامل مع ضغوط العمل والمواعيد النهائية؟",
        "أين ترى نفسك بعد 5 سنوات؟"
      ]
    });
  }
  try {
    const prompt = `Generate exactly 5 professional interview questions in Arabic for a "${jobTitle}" position. Tailor to candidate skills: ${cvData?.skills?.join(", ") || "general"}. Return strict JSON array of 5 strings under key "questions".`;
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    res.json({ success: true, simulated: false, ...JSON.parse(response.text || "{}") });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// INTERVIEW EVALUATE
app.post("/api/interview/evaluate", aiLimiter, requireAuth, async (req: AuthenticatedRequest, res) => {
  const { question, answer, jobTitle } = req.body;
  if (!question || !answer) return res.status(400).json({ success: false, message: "السؤال والإجابة مطلوبان." });
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      success: true, simulated: true,
      score: 7, maxScore: 10,
      feedback: "إجابة جيدة! حاول إضافة مثال عملي محدد من تجربتك لتقوية إجابتك.",
      improvedAnswer: "يمكنك تعزيز إجابتك بذكر موقف محدد واجهته وكيف تعاملت معه بنجاح."
    });
  }
  try {
    const prompt = `Evaluate this interview answer for a "${jobTitle}" role. Question: "${question}". Answer: "${answer}". Return strict JSON: score (1-10), feedback (string in Arabic), improvedAnswer (string in Arabic).`;
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    res.json({ success: true, simulated: false, ...JSON.parse(response.text || "{}") });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// PROFILE PARSE FROM PDF
app.post("/api/profile/parse", aiLimiter, requireAuth, async (req: AuthenticatedRequest, res) => {
  const { cvPdf } = req.body;
  if (!cvPdf) return res.status(400).json({ success: false, message: "ملف الـ PDF مطلوب." });
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({ success: true, simulated: true, profile: { name: "اسم المستخدم", title: "المسمى الوظيفي", summary: "ملخص مهني.", skills: ["مهارة 1", "مهارة 2"] } });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: { parts: [
        { inlineData: { data: cvPdf, mimeType: "application/pdf" } },
        { text: "Extract structured profile data from this resume PDF. Return strict JSON: { name, title, summary, skills (array), experience (array of {role,company,duration,description}), education (array of {degree,institution,year}) }. Prefer Arabic for field values if resume is in Arabic." }
      ]}
    });
    res.json({ success: true, simulated: false, profile: JSON.parse(response.text || "{}") });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// FIX #10 — /api/chat: إضافة endpoint المستشار الوظيفي الذي كان مفقودًا بالكامل
app.post("/api/chat", aiLimiter, requireAuth, async (req: AuthenticatedRequest, res) => {
  const { message, cvData, conversationHistory } = req.body;
  if (!message?.trim()) return res.status(400).json({ success: false, message: "الرسالة مطلوبة." });
  const ai = getGeminiClient();
  if (!ai) {
    const fallbacks = [
      "بناءً على ما شاركته، أنصحك بالتركيز على تطوير مهاراتك في المجالات المطلوبة في سوق العمل حاليًا.",
      "سيرتك الذاتية تحتاج إلى إبراز إنجازاتك بأرقام قابلة للقياس مثل 'زادت المبيعات بنسبة 20%'.",
      "لتحضير المقابلات، ابحث عن الشركة جيدًا وجهّز أمثلة عملية من تجربتك باستخدام أسلوب STAR."
    ];
    return res.json({ success: true, simulated: true, reply: fallbacks[Math.floor(Math.random() * fallbacks.length)] });
  }
  try {
    const systemPrompt = `أنت مستشار توظيف ذكي ومتخصص في سوق العمل العربي، وتساعد الباحثين عن عمل في مصر ودول الخليج. أجب بالعربية دائمًا. كن محددًا وعمليًا. ${cvData ? `بيانات المستخدم: الاسم: ${cvData.personal?.name || "غير محدد"}، المسمى: ${cvData.personal?.title || "غير محدد"}، المهارات: ${cvData.skills?.slice(0,5).join("، ") || "غير محددة"}.` : ""}`;
    const history = Array.isArray(conversationHistory) ? conversationHistory.slice(-6) : [];
    const messages = [
      ...history.map((m: any) => ({ role: m.role, parts: [{ text: m.content }] })),
      { role: "user", parts: [{ text: message }] }
    ];
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: [{ role: "user", parts: [{ text: systemPrompt }] }, ...messages] });
    res.json({ success: true, simulated: false, reply: response.text || "" });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// AI PITCH
app.post("/api/ai/pitch", aiLimiter, requireAuth, async (req: AuthenticatedRequest, res) => {
  const { platform, targetRole, targetCompany, cvData, language } = req.body;
  const isAr = language === "ar";
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({ success: true, simulated: true, pitch: `مرحبًا، أنا ${cvData?.personal?.name || "اسم المستخدم"} أبحث عن فرصة في مجال ${targetRole} في ${targetCompany}. أودّ مناقشة كيف يمكنني المساهمة في فريقكم.` });
  }
  try {
    const prompt = `Write a professional ${platform} outreach message in ${isAr ? "Arabic" : "English"} for a candidate applying for "${targetRole}" at "${targetCompany}". Candidate: ${cvData?.personal?.name}, Skills: ${cvData?.skills?.slice(0,5).join(", ")}. Keep it concise, authentic, and compelling. Return only the raw message text.`;
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt });
    res.json({ success: true, simulated: false, pitch: response.text || "" });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// AI CONTRACT AUDIT
app.post("/api/ai/contract-audit", aiLimiter, requireAuth, async (req: AuthenticatedRequest, res) => {
  const { jobTitle, salary, currency, country, hasHousing, hasTransport, hasMedical, hasFlights, extraText, language } = req.body;
  const isAr = language === "ar";
  const ai = getGeminiClient();

  if (!ai) {
    const numSalary = Number(salary) || 4000;
    let rank = "مقبول ومتوازن ⚖️"; let score = 4; let explanation = "";
    if (country === "KSA") {
      if (numSalary < 3500) { rank = "تحذيري وضئيل ⚠️"; score = 2; explanation = `الراتب (${numSalary} ${currency}) منخفض لـ "${jobTitle}" بالسعودية.`; }
      else if (numSalary >= 8000) { rank = "ممتاز ومجزي ✨"; score = 5; explanation = `راتب ممتاز (${numSalary} ${currency}) يتيح ادخارًا ممتازًا.`; }
      else { explanation = `الراتب (${numSalary} ${currency}) متوسط ومقبول.`; }
    } else {
      if (numSalary < 4000) { rank = "مستوى منخفض ⚠️"; score = 2.5; explanation = `العرض (${numSalary} ${currency}) أقل من المتوسط المعتاد بدول الخليج.`; }
      else { rank = "مكافئ ومجزي ✅"; score = 4.5; explanation = `العرض (${numSalary} ${currency}) يوفر معيشة مريحة.`; }
    }
    return res.json({
      success: true, simulated: true, starsScore: score, fairnessStatus: rank, financialSummary: explanation,
      pitfalls: ["تأكد من صياغة العقد باللغتين العربية والإنجليزية.", "تحقق من غرامات إنهاء العقد مبكرًا.", "تأكد من طبيعة السكن (مستقل أم مشترك)."],
      checklists: ["حجز موعد الكشف الطبي عبر منصة وافد (Wafid).", "توثيق الشهادة من الخارجية المصرية.", "حجز بصمة من مكاتب تسهيل/VFS."]
    });
  }
  try {
    const prompt = `You are an expert HR legal consultant for Egyptian workers going to Gulf countries. Audit this job offer and provide detailed advice.\n\nOffer: ${jobTitle}, ${salary} ${currency}, Country: ${country}\nBenefits: Housing:${hasHousing}, Transport:${hasTransport}, Medical:${hasMedical}, Flights:${hasFlights}\nExtra: ${extraText || "none"}\n\nReturn strict JSON in ${isAr ? "Arabic" : "English"}: { starsScore (1-5), fairnessStatus (string), financialSummary (string), pitfalls (string array), checklists (string array of Egyptian admin steps) }`;
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    res.json({ success: true, simulated: false, ...JSON.parse(response.text || "{}") });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// ─────────────────────────────────────────────
// VITE / STATIC SERVING
// ─────────────────────────────────────────────
async function startServer() {
  startTelegramBot();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
    console.log("✓ Vite dev middleware mounted");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
    console.log("✓ Serving production build from /dist");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✓ Masar server running on http://localhost:${PORT}`);
    console.log(`  ENV: ${process.env.NODE_ENV || "development"}`);
    console.log(`  CORS origins: ${[...ALLOWED_ORIGINS].join(", ")}`);
  });
}

startServer();
