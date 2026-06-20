import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { groqChat } from "./src/utils/groqClient.js";
import { migrateFromJsonIfNeeded } from "./server/db.js";

// Load environment variables
dotenv.config();
migrateFromJsonIfNeeded(); // One-time migration from legacy users.json (if present)

import { getStoredJobs, forceRefreshJobs } from "./server/jobSource.js";
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

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// ─── Rate Limiters ──────────────────────────────────────────────
// عام: 100 طلب لكل 15 دقيقة لكل IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { success: false, message: "طلبات كثيرة جداً. حاول بعد قليل." },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI Routes: 20 طلب لكل 15 دقيقة — حماية لـ Groq quota
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { success: false, message: "تجاوزت الحد المسموح من طلبات الذكاء الاصطناعي. حاول بعد 15 دقيقة." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth: 10 محاولات لكل 15 دقيقة — حماية من brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { success: false, message: "محاولات تسجيل كثيرة جداً. حاول بعد 15 دقيقة." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use("/api/", generalLimiter);


// -------------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------------

// 1. JOBS GET ENDPOINT with filters and colloquial expansion
app.get("/api/jobs", async (req, res) => {
  try {
    const { keyword, location, type } = req.query;
    
    let jobs = await getStoredJobs();

    // Map and expand colloquial search phrase
    if (keyword && typeof keyword === "string" && keyword.trim() !== "") {
      const normalizedKeyword = normalizeSearchQuery(keyword);
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(normalizedKeyword.toLowerCase()) ||
        job.description.toLowerCase().includes(normalizedKeyword.toLowerCase()) ||
        job.company.toLowerCase().includes(normalizedKeyword.toLowerCase())
      );
    }

    if (location && typeof location === "string" && location.trim() !== "") {
      const normalizedLocation = normalizeSearchQuery(location);
      jobs = jobs.filter(job => 
        job.location.toLowerCase().includes(normalizedLocation.toLowerCase())
      );
    }

    if (type && typeof type === "string" && type !== "all") {
      jobs = jobs.filter(job => job.type === type);
    }

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});


// 1.1 FORCE REFRESH JOBS (تحديث فوري للوظائف)
app.post("/api/jobs/refresh", async (req, res) => {
  try {
    const jobs = await forceRefreshJobs();
    res.json({ success: true, count: jobs.length, message: `تم تحديث ${jobs.length} وظيفة` });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});


// 1.0 DEMO LOGIN — no credentials needed
app.post("/api/auth/demo", async (req, res) => {
  const demoUser = {
    id: "demo-" + Date.now(),
    email: "demo@masar.dev",
    name: "مستخدم تجريبي",
    profile: {
      personal: {
        name: "أحمد محمد جلال",
        title: "محاسب مالي أول",
        email: "demo@masar.dev",
        phone: "+20 102 345 6789",
        location: "القاهرة، مصر",
        website: "",
        summary: "محاسب مالي خبرة ٥ سنوات في تمويل الشركات وإعداد القوائم الختامية."
      },
      skills: ["التحليل المالي", "Odoo ERP", "Excel المتقدم", "محاسبة التكاليف"],
      experience: [{ id: "exp-1", company: "شركة النيل للتجارة", role: "محاسب مالي أول", duration: "2023 - الآن", description: "إعداد القوائم المالية وتسوية الحسابات البنكية." }],
      education: [{ id: "edu-1", institution: "جامعة عين شمس", degree: "بكالوريوس محاسبة - جيد جداً", duration: "2017 - 2021" }],
      languages: [{ id: "l1", name: "العربية", level: "اللغة الأم" }, { id: "l2", name: "الإنجليزية", level: "جيد جداً" }],
      projects: [],
      targetFields: [],
      targetLocations: []
    }
  };
  res.json({ success: true, user: demoUser });
});

// 1.1 USER AUTH & REGISTER
app.post("/api/auth/register", authLimiter, (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "يرجى تعبئة جميع الحقول المطلوبة." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "البريد الإلكتروني غير صالح." });
    }
    const result = registerUser(email, password, name);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 1.2 USER LOGIN
app.post("/api/auth/login", authLimiter, (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "يرجى إدخال البريد الإلكتروني وكلمة المرور." });
    }
    const result = loginUser(email, password);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 1.3 USER PROFILE GET
app.get("/api/profile", (req, res) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "البريد الإلكتروني للمستخدم مطلوب." });
    }
    const result = getProfile(email);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 1.4 USER PROFILE UPDATE
app.post("/api/profile", (req, res) => {
  try {
    const { email, profile } = req.body;
    if (!email || !profile) {
      return res.status(400).json({ success: false, message: "بيانات تحديث الملف غير مكتملة." });
    }
    const result = updateProfile(email, profile);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 1.5 SMART PERSONALIZED COMPILER MATCHES
app.get("/api/jobs/matched", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "البريد الإلكتروني مطلوب للمطابقة." });
    }
    const result = await getMatchedJobs(email);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 2. INFLUENCERS GET ENDPOINT
app.get("/api/influencers", async (req, res) => {
  try {
    const posts = await getInfluencerPosts();
    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 3. EGYPTIAN AGENCIES GET ENDPOINT
app.get("/api/agencies", (req, res) => {
  try {
    const agencies = getStoredAgencies();
    res.json({ success: true, count: agencies.length, agencies });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 4. ADD NEW AGENCY
app.post("/api/agencies", (req, res) => {
  try {
    const { name, phone, address, description, image, facebook, telegram, website } = req.body;
    if (!name || !phone || !address || !description) {
      return res.status(400).json({ success: false, message: "يرجى تعبئة جميع الحقول المطلوبة." });
    }

    const current = getStoredAgencies();
    const newAgency = {
      id: `agency-${Date.now()}`,
      name,
      phone,
      address,
      description,
      image: image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop",
      rating: 5,
      reviews: [],
      userAdded: true,
      facebook: facebook || "",
      telegram: telegram || "",
      website: website || ""
    };

    current.unshift(newAgency);
    saveAgencies(current);

    res.json({ success: true, message: "تم إضافة مكتب التوظيف بنجاح!", agency: newAgency });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 5. REVIEW/RATE AGENCY
app.post("/api/agencies/:id/review", (req, res) => {
  try {
    const { id } = req.params;
    const { userName, rating, comment } = req.body;

    if (!userName || !rating || !comment) {
      return res.status(400).json({ success: false, message: "البيانات المدخلة ناقصة." });
    }

    const current = getStoredAgencies();
    const agencyIndex = current.findIndex(a => a.id === id);

    if (agencyIndex === -1) {
      return res.status(404).json({ success: false, message: "لم يتم العثور على المكتب." });
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      userName,
      rating: Number(rating),
      comment,
      date: new Date().toISOString().split("T")[0]
    };

    const agency = current[agencyIndex];
    agency.reviews.unshift(newReview);

    // Recalculate rating
    const totalStars = agency.reviews.reduce((acc, r) => acc + r.rating, 0);
    agency.rating = Number((totalStars / agency.reviews.length).toFixed(1));

    saveAgencies(current);

    res.json({ success: true, message: "تم تسجيل مراجعتك بنجاح!", agency });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 6. TELEGRAM STATUS & SUB LOGS DIRECTORY
app.get("/api/telegram/status", (req, res) => {
  res.json({
    success: true,
    activeToken: isActualTokenActive(),
    logs: botLogs,
    subscriptionsCount: getBotSubscriptions().length
  });
});

// 7. TELEGRAM TEST / SIMULATION
app.post("/api/telegram/test-command", async (req, res) => {
  try {
    const { text, username, chatId } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "النص مطلوب." });

    const messagePayload = {
      chat: { id: chatId ? Number(chatId) : 555777 },
      from: { first_name: username || "مستخدم تجريبي" },
      text: text
    };

    const replies = await handleBotMessage("SIMULATION_TOKEN", messagePayload, true);
    res.json({ success: true, replies });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 8. TELEGRAM TRIGGER BROADCASTVacancies
app.post("/api/telegram/trigger-broadcast", async (req, res) => {
  try {
    const stats = await triggerDailyVacancyBroadcast();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// -------------------------------------------------------------------
// AI SERVICE HOOKS - Powered by Groq (Free) with llama-3.3-70b
// -------------------------------------------------------------------

// 9. ATS ANALYZER (COMPUTES ATS SCORE, REMOVES POOR FORMATS & DECLARES GAP KEYWORDS)
app.post("/api/cv/ats", aiLimiter, async (req, res) => {
  const { cvText, jobDescription } = req.body;
  if (!cvText || !jobDescription) {
    return res.status(400).json({ success: false, message: "يرجى ملء نص الـ CV ووصف الوظيفة." });
  }

  try {
    const result = await groqChat([
      {
        role: "system",
        content: "أنت محلل ATS خبير. أجب دائماً بـ JSON صالح فقط بدون أي نص إضافي."
      },
      {
        role: "user",
        content: `قارن السيرة الذاتية بالوصف الوظيفي وأعطني تحليل ATS دقيق.
اللغة: استخدم نفس لغة المدخلات (عربي إن كانت عربية).

الوصف الوظيفي:
${jobDescription}

نص السيرة الذاتية:
${cvText}

أعطني JSON بهذه المفاتيح فقط:
{
  "score": رقم من 0 إلى 100,
  "missingKeywords": مصفوفة من الكلمات المفتاحية الناقصة,
  "formattingFeedback": نص نقد التنسيق,
  "recommendations": نص التوصيات العملية
}`
      }
    ], true);

    const parsed = JSON.parse(result);
    res.json({ success: true, simulated: false, ...parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في تحليل ATS: " + (err as Error).message });
  }
});

// 10. AI CV CUSTOM TAILORER
app.post("/api/cv/tailor", aiLimiter, async (req, res) => {
  const { cvData, jobDescription } = req.body;
  if (!cvData || !jobDescription) {
    return res.status(400).json({ success: false, message: "البيانات ناقصة." });
  }

  try {
    const groqResult = await groqChat([
      { role: "system", content: "أنت مساعد HR خبير في تخصيص السير الذاتية. أجب بـ JSON فقط." },
      { role: "user", content: `خصّص الملخص المهني وقائمة المهارات لتتناسب مع الوظيفة المستهدفة.

الوصف الوظيفي:
${jobDescription}

الملخص الحالي: ${cvData.personal.summary}
المهارات الحالية: ${cvData.skills.join(", ")}

أعطني JSON:
{"tailoredSummary": "ملخص محسّن", "tailoredSkills": ["مهارة1", "مهارة2"]}` }
    ], true);
    const parsed = JSON.parse(groqResult);
    res.json({ success: true, simulated: false, ...parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// 11. INTERVIEW SIMULATION - COMMENCE
app.post("/api/interview/start", aiLimiter, async (req, res) => {
  const { jobTitle } = req.body;
  if (!jobTitle) return res.status(400).json({ success: false, message: "مسمى الوظيفة مطلوب." });

  try {
    const groqResult = await groqChat([
      { role: "system", content: "أنت محاور وظيفي خبير. أجب بـ JSON فقط." },
      { role: "user", content: `اكتب 5 أسئلة مقابلة عملية ومتنوعة لوظيفة: "${jobTitle}".
إن كان المسمى بالعربية، اكتب الأسئلة بالعربية.
JSON فقط: {"questions": ["س1","س2","س3","س4","س5"]}` }
    ], true);
    const parsed = JSON.parse(groqResult);
    res.json({ success: true, simulated: false, questions: parsed.questions || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// 12. INTERVIEW EVALUATOR & SCORE RECORDER
app.post("/api/interview/evaluate", aiLimiter, async (req, res) => {
  const { question, answer, jobTitle } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ success: false, message: "السؤال والإجابة مطلوبان." });
  }

  try {
    const groqResult = await groqChat([
      { role: "system", content: "أنت مقيّم مقابلات خبير. أجب بـ JSON فقط." },
      { role: "user", content: `قيّم إجابة المرشح على سؤال المقابلة لوظيفة "${jobTitle}".

السؤال: ${question}
الإجابة: ${answer}

أعطني JSON:
{"score": رقم 1-5, "feedback": "تقييم بنّاء واضح"}` }
    ], true);
    const parsed = JSON.parse(groqResult);
    res.json({ success: true, simulated: false, ...parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// 12.5 AI RESUME / PORTFOLIO PARSER
app.post("/api/profile/parse", aiLimiter, async (req, res) => {
  const { cvText } = req.body;
  if (!cvText || cvText.trim() === "") {
    return res.status(400).json({ success: false, message: "يرجى تقديم نص السيرة الذاتية لاستخلاصه." });
  }

  try {
    const groqResult = await groqChat([
      { role: "system", content: "أنت نظام استخلاص بيانات سير ذاتية. أجب بـ JSON فقط." },
      { role: "user", content: `استخلص بيانات السيرة الذاتية وأعطني JSON منظم.

نص السيرة:
${cvText}

JSON المطلوب:
{
  "profile": {
    "personal": {"name":"","title":"","email":"","phone":"","location":"","summary":"","website":""},
    "skills": [],
    "targetFields": [],
    "targetLocations": [],
    "experience": [{"id":"exp-1","company":"","role":"","duration":"","description":""}],
    "education": [{"id":"edu-1","institution":"","degree":"","duration":""}]
  }
}` }
    ], true);
    const parsed = JSON.parse(groqResult);
    if (!parsed.profile) throw new Error("Missing profile in AI output");
    if (!Array.isArray(parsed.profile.experience)) parsed.profile.experience = [];
    if (!Array.isArray(parsed.profile.education)) parsed.profile.education = [];
    res.json({ success: true, simulated: false, profile: parsed.profile });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل الاستخلاص: " + (err as Error).message });
  }
});

// 13. AI OUTREACH MESSAGE GENERATOR (PITCHER)
app.post("/api/ai/pitch", aiLimiter, async (req, res) => {
  const { cvData, targetCompany, targetRole, jdText, platform, tone, language } = req.body;
  if (!cvData) {
    return res.status(400).json({ success: false, message: "بيانات السيرة الذاتية مفقودة." });
  }

  const isAr = language === "ar";
  try {
    const groqResult = await groqChat([
      { role: "system", content: `أنت مدرب مهني خبير في كتابة رسائل التقديم الاحترافية. اكتب بـ${isAr ? "العربية" : "الإنجليزية"} فقط. لا تستخدم JSON.` },
      { role: "user", content: `اكتب رسالة تقديم احترافية للمرشح التالي:

الاسم: ${cvData.personal.name}
المسمى: ${cvData.personal.title}
الملخص: ${cvData.personal.summary}
المهارات: ${cvData.skills.join(", ")}

الوظيفة المستهدفة: ${targetRole}
الشركة: ${targetCompany || "الشركة المستهدفة"}
المنصة: ${platform} (linkedin: 300 حرف max | email: رسالة كاملة | whatsapp: ودية ومختصرة)
الأسلوب: ${tone}

اكتب الرسالة مباشرة بدون مقدمة.` }
    ], false);
    res.json({ success: true, simulated: false, pitch: groqResult });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// 14. AI CONTRACT SAFETY AUDIT & TRAVEL ROADMAP ADVISOR
app.post("/api/ai/contract-audit", aiLimiter, async (req, res) => {
  const { jobTitle, salary, currency, country, hasHousing, hasTransport, hasMedical, hasFlights, extraText, language } = req.body;
  
  const isAr = language === "ar";
  try {
    const groqResult = await groqChat([
      { role: "system", content: `أنت مستشار قانوني HR خبير في سوق العمل الخليجي. أجب بـ JSON فقط باللغة ${isAr ? "العربية" : "الإنجليزية"}.` },
      { role: "user", content: `قيّم عرض العمل التالي:

المسمى: ${jobTitle}
الراتب: ${salary} ${currency}
الدولة: ${country}
السكن: ${hasHousing ? "مدفوع" : "غير مدفوع"}
المواصلات: ${hasTransport ? "مدفوعة" : "غير مدفوعة"}
التأمين الطبي: ${hasMedical ? "موجود" : "غير موجود"}
تذاكر الطيران: ${hasFlights ? "موجودة" : "غير موجودة"}
تفاصيل إضافية: ${extraText || "لا يوجد"}

أعطني JSON:
{
  "starsScore": رقم 1-5,
  "fairnessStatus": "تقييم العرض",
  "financialSummary": "تحليل مفصل للراتب والمعيشة",
  "pitfalls": ["تحذير1","تحذير2","تحذير3"],
  "checklists": ["خطوة إجرائية 1","خطوة 2","خطوة 3","خطوة 4","خطوة 5"]
}` }
    ], true);
    const parsed = JSON.parse(groqResult);
    res.json({ success: true, simulated: false, ...parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});




// /api/chat — CareerAccelerator chat (alias to coach endpoint)
app.post("/api/chat", aiLimiter, async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ success: false });
  try {
    const messages = [
      ...(history || []).map((h: any) => ({
        role: h.role === "model" ? "assistant" : "user",
        content: Array.isArray(h.parts) ? h.parts[0]?.text || "" : h.content || ""
      })),
      { role: "user", content: message }
    ];
    const reply = await groqChat([
      { role: "system", content: "أنت مساعد مهني ذكي متخصص في التوظيف وتطوير المسار المهني. أجب بإيجاز وعملية." },
      ...messages
    ], false);
    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// ─── MASAR COACH ENDPOINT ─────────────────────────────────────────
app.post("/api/coach/chat", aiLimiter, async (req, res) => {
  const { systemPrompt, messages } = req.body;
  if (!systemPrompt || !messages?.length) {
    return res.status(400).json({ success: false, message: "systemPrompt and messages required" });
  }

  try {
    const reply = await groqChat([
      { role: "system", content: systemPrompt },
      ...messages
    ], false);
    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// -------------------------------------------------------------------
// VITE DEV / PROD MIDDLEWARE INTEGRATION
// -------------------------------------------------------------------

async function startServer() {
  // Start the background telegram bot client (safe to trigger)
  startTelegramBot();

  if (process.env.NODE_ENV !== "production") {
    // Vite Dev Server Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware handles asset rendering.");
  } else {
    // Production Assets Client
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving build files statically from dist folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server successfully running on http://localhost:${PORT}`);
  });
}

startServer();
