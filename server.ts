import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import jwt from "jsonwebtoken";
import cors from "cors";
import rateLimit from "express-rate-limit";

// Load environment variables
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

const app = express();
const PORT = 3000;

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_masar_9918";

// Define custom AuthenticatedRequest interface for type safety
export interface AuthenticatedRequest extends express.Request {
  user?: {
    email: string;
    id: string;
  };
}

// -------------------------------------------------------------------
// SECURITY MIDDLEWARES & RATE LIMITERS
// -------------------------------------------------------------------

// CORS Configuration
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? (process.env.FRONTEND_URL || "https://masar-app.com")
    : true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "لقد تجاوزت الحد الأقصى للطلبات المسموح بها حالياً. يرجى الانتظار قليلاً والمحاولة لاحقاً." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "تم كشف محاولات دخول متكررة. يرجى الانتظار 15 دقيقة قبل إعادة المحاولة." }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "تم استهلاك حد الطلبات للذكاء الاصطناعي الخاص بك. يرجى الانتظار والمحاولة لاحقاً." }
});

app.use(generalLimiter);

// JWT Verification Middleware
function requireAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "غير مصرح بالدخول، يرجى تسجيل الدخول أولاً." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; id: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "جلسة منتهية، يرجى إعادة تسجيل الدخول." });
  }
}

// Helper for lazy loading Gemini Client with proper safety
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {}
    });
  }
  return aiClient;
}

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

// Admin stats for DiagnosticsPanel
app.get("/api/admin/stats", async (req, res) => {
  try {
    let usersCount = 0;
    try {
      const usersPath = path.join(process.cwd(), "data", "users.json");
      if (fs.existsSync(usersPath)) {
        const content = fs.readFileSync(usersPath, "utf-8");
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          usersCount = parsed.length;
        }
      }
    } catch (e) {
      console.error("Error reading stats users:", e);
    }
    const jobs = await getStoredJobs();
    res.json({
      success: true,
      jobsCount: jobs.length,
      usersCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 1.1 USER AUTH & REGISTER
app.post("/api/auth/register", authLimiter, (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "يرجى تعبئة جميع الحقول المطلوبة." });
    }
    const result = registerUser(email, password, name);
    if (!result.success || !result.user) {
      return res.status(400).json(result);
    }
    const token = jwt.sign({ email: result.user.email, id: result.user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, user: result.user, token });
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
    if (!result.success || !result.user) {
      return res.status(400).json(result);
    }
    const token = jwt.sign({ email: result.user.email, id: result.user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, user: result.user, token });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 1.3 USER PROFILE GET
app.get("/api/profile", requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(400).json({ success: false, message: "البريد الإلكتروني غير معروف." });
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
app.post("/api/profile", requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const email = req.user?.email;
    const { profile } = req.body;
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
app.get("/api/jobs/matched", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(400).json({ success: false, message: "البريد الإلكتروني مطلوب للمطابقة." });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    const result = await getMatchedJobs(email, apiKey);
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
    const { name, phone, address, description, image, facebook, telegram, website, email, whatsapp } = req.body;
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
      website: website || "",
      email: email || "",
      whatsapp: whatsapp || ""
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

// 9. ATS ANALYZER (COMPUTES ATS SCORE, REMOVES POOR FORMATS & DECLARES GAP KEYWORDS)
app.post("/api/cv/ats", aiLimiter, async (req, res) => {
  const { cvText, cvPdf, jobDescription } = req.body;
  if ((!cvText && !cvPdf) || !jobDescription) {
    return res.status(400).json({ success: false, message: "يرجى ملء نص الـ CV أو رفع ملف PDF ووصف الوظيفة." });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Elegant fallback simulation is returned if API Key is omitted
    console.log("No Gemini API key. Injecting robust simulated ATS feedback.");
    const randomScore = Math.floor(Math.random() * 25) + 55; // 55-80
    return res.json({
      success: true,
      simulated: true,
      score: randomScore,
      missingKeywords: ["نظم إدارة علاقات العملاء (CRM)", "ERP Odoo", "تحليل القوائم المالية", "التفكير الاستراتيجي", "حل المشكلات المتقدم"],
      formattingFeedback: "القالب يبدو مريحاً. تجنب استخدام الجداول المعقدة أو التقسيم متعدد الأعمدة، واحرص على الاحتفاظ بهوامش 2.5 سم لضمان فك شفرة النصوص بنجاح.",
      recommendations: "قم بإعادة صياغة أدوارك في خانة الخبرات لتبدأ بأفعال عمل قوية ومقاسة بأرقام ونسب مئوية (مثلاً: زيادة المبيعات بنسبة ٢٠%)."
    });
  }

  try {
    let contents: any;
    if (cvPdf) {
      contents = {
        parts: [
          {
            inlineData: {
              data: cvPdf,
              mimeType: "application/pdf"
            }
          },
          {
            text: `Analyze the candidate resume in this attached PDF against the target job description to compute a highly accurate ATS compatibility check.
      Return the output strictly in valid JSON format (raw json data without markdown wraps). The language of study should match the input language (prefer Arabic if the resume/job is in Arabic or requested by candidate).
      
      Job Description:
      ${jobDescription}

      The output JSON must contain exactly these keys:
      {
        "score": number (0 to 100),
        "missingKeywords": array of strings (the core professional skills and keywords lacking in the CV but emphasized in the job description),
        "formattingFeedback": string (critique of templates, advice on unparsable blocks/columns/tables),
        "recommendations": string (highly localized actionable advice on optimization)
      }`
          }
        ]
      };
    } else {
      contents = `Analyze the candidate resume against the target job description to compute a highly accurate ATS compatibility check.
      Return the output strictly in valid JSON format (raw json data without markdown wraps). The language of study should match the input language (prefer Arabic if the resume/job is in Arabic).
      
      Job Description:
      ${jobDescription}

      Resume Text:
      ${cvText}

      The output JSON must contain exactly these keys:
      {
        "score": number (0 to 100),
        "missingKeywords": array of strings (the core professional skills and keywords lacking in the CV but emphasized in the job description),
        "formattingFeedback": string (critique of templates, advice on unparsable blocks/columns/tables),
        "recommendations": string (highly localized actionable advice on optimization)
      }`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, simulated: false, ...parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: "حدث خطأ أثناء فحص الذكاء الاصطناعي: " + (err as Error).message });
  }
});

// 9.5 PDF TEXT EXTRACTOR
app.post("/api/cv/extract-text", aiLimiter, async (req, res) => {
  const { cvPdf } = req.body;
  if (!cvPdf) {
    return res.status(400).json({ success: false, message: "ملف الـ PDF مطلوب." });
  }

  const ai = getGeminiClient();

  if (!ai) {
    console.log("No Gemini API key. Simulated PDF extract.");
    return res.json({
      success: true,
      simulated: true,
      text: "أحمد بن محمد محمود جلال\nمحاسب مالي أول\nالقاهرة، مصر\nخبرة ٥ سنوات كجزء من شركة النيل للتجارة والاستثمار.\nالتعليم: بكالوريوس محاسبة جامعة عين شمس.\nالمهارات: التحليل المالي، ميزانيات، تخطيط، ضرائب."
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: cvPdf,
              mimeType: "application/pdf"
            }
          },
          {
            text: "Extract all visible text from this PDF resume exactly as it is, maintaining formatting and structures where possible. Do not add any conversational remarks. Just output the extracted text."
          }
        ]
      }
    });

    res.json({
      success: true,
      simulated: false,
      text: response.text || ""
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "حدث خطأ أثناء استخراج النص: " + (err as Error).message });
  }
});

// 10. AI CV CUSTOM TAILORER
app.post("/api/cv/tailor", aiLimiter, async (req, res) => {
  const { cvData, jobDescription } = req.body;
  if (!cvData || !jobDescription) {
    return res.status(400).json({ success: false, message: "البيانات ناقصة." });
  }

  const ai = getGeminiClient();

  if (!ai) {
    console.log("No Gemini API key. Injecting tailored CV mock return.");
    // Simulated smart tailoring - append relevant skills and reorder
    const matchedSkills = ["التحليل المالي", "إدخال البيانات", "حل المشكلات المتقدم", "SAP ERP", "اتصالات الفريق"];
    return res.json({
      success: true,
      simulated: true,
      tailoredSummary: `محترف شغوف وطموح متطلع للتطبيق والنمو في كبرى الشركات والمساهمة في تحقيق الأهداف الاستراتيجية بكفاءة عالية، عبر توظيف خبراتي الطويلة المتوافقة مع احتياجات الوظيفة المطلوبة.`,
      tailoredSkills: [...matchedSkills, ...cvData.skills]
    });
  }

  try {
    const prompt = `You are an expert HR Tailoring assistant.
      Your task is to rewrite the professional summary and prioritize the candidate's skills list to be highly aligned with the target job description. Do not invent fake degrees or certifications, only adapt the summary's narrative and emphasize the correct skills.
      
      Keep the output in the matching language of the input (prefer Arabic if candidates and job details are in Arabic).
      Return the output strictly in valid JSON format (raw json data without markdown wraps):
      
      Job Description:
      ${jobDescription}

      Current CV Data:
      Summary: ${cvData.personal.summary}
      Current Skills: ${cvData.skills.join(", ")}

      The output JSON must contain exactly these keys:
      {
        "tailoredSummary": string (expertly crafted professional summary tailored for this job),
        "tailoredSkills": array of strings (reordered, expanded, and optimized skills list matching the job key parameters)
      }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, simulated: false, ...parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// 11. INTERVIEW SIMULATION - COMMENCE
app.post("/api/interview/start", aiLimiter, async (req, res) => {
  const { jobTitle } = req.body;
  if (!jobTitle) return res.status(400).json({ success: false, message: "مسمى الوظيفة مطلوب." });

  const ai = getGeminiClient();

  if (!ai) {
    console.log("No Gemini API key. Simulated Interview Start.");
    return res.json({
      success: true,
      simulated: true,
      questions: [
        "حدثنا عن نفسك وعن خبرك بمجال العمل والوظيفة المحددة؟",
        "كيف تتعامل مع ضغط العمل والمواعيد النهائية القياسية؟",
        "تخيل حدوث مشكلة تقنية حرجة في منتصف دورة العمل، ما هي خطتك للتصرف العاجل؟",
        "ما الذي يجعلك المرشح الأفضل مقارنة بالآخرين لهذا المنصب؟",
        "ما هو توقعك للراتب ومقدار المساهمة والإنجازات التي ستقدمها بالفريق؟"
      ]
    });
  }

  try {
    const prompt = `You are an expert technical interviewer.
      Generate exactly 5 distinct, practical, and highly relevant job interview questions for the following position: "${jobTitle}".
      Keep questions professional, conversational, and challenging.
      If the job title is in Arabic, generate the questions in Arabic.
      Return the output strictly in valid JSON format (raw json data without markdown wraps) with a single key "questions" being an array of 5 strings:
      {
        "questions": ["...", "...", "...", "...", "..."]
      }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
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

  const ai = getGeminiClient();

  if (!ai) {
    console.log("No Gemini API key. Simulated Question Evaluation.");
    return res.json({
      success: true,
      simulated: true,
      score: Math.floor(Math.random() * 3) + 3, // 3, 4, 5 stars
      feedback: "إجابة واضحة وتدل على فهم أساسيات العمل. يفضل تدعيم الرأي بخبرة واقعية موثقة بلغة الأرقام لإقناع مدراء التوظيف."
    });
  }

  try {
    const prompt = `Evaluate the candidate's answer for this interview question for the job of: "${jobTitle}".
      Provide constructive, friendly criticism to help the candidate improve.
      Rate the answer on a scale of 1 to 5 stars.
      Keep content in the language of the candidate's answer (prefer Arabic if answered in Arabic).
      Return the output strictly in valid JSON format (raw json data without markdown wraps) with these fields:
      {
        "score": number (1 to 5),
        "feedback": string (professional review, recommendations, highlight of strengths/weakpoints)
      }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, simulated: false, ...parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// 12.5 AI RESUME / PORTFOLIO PARSER
app.post("/api/profile/parse", aiLimiter, async (req, res) => {
  const { cvText, cvPdf } = req.body;
  if ((!cvText && !cvPdf) || (cvText && cvText.trim() === "")) {
    return res.status(400).json({ success: false, message: "يرجى تقديم نص السيرة الذاتية أو ملف PDF لاستخلاصه." });
  }

  const ai = getGeminiClient();

  if (!ai) {
    console.log("No Gemini API key. Simulated CV profile parse response.");
    return res.json({
      success: true,
      simulated: true,
      profile: {
        personal: {
          name: "أحمد بن محمد جلال",
          title: "محاسب مالي أول",
          email: "demo@masar-app.com",
          phone: "+20 102 345 6789",
          location: "القاهرة, مصر",
          summary: "محاسب مالي مميز بمراجعة القوائم والتحليل الضريبي وإدارة الدفاتر المحوسبة بنظام الـ ERP وإعداد الحسابات للمراجعة والتدقيق الخارجي.",
          website: "linkedin.com/in/ahmed-galal"
        },
        skills: ["التحليل المالي", "إدارة المخازن", "الميزانية العمومية", "Odoo ERP", "إكسيل المتقدم (Excel)", "مراجعة الحسابات"],
        targetFields: ["محاسبة مالي", "مراجعة داخلية", "إدارة حسابات"],
        targetLocations: ["الرياض", "جدة", "القاهرة", "عن بعد"],
        experience: [
          {
            id: "exp-sim-1",
            company: "العربي للأجهزة الكهربائية",
            role: "محاسب مالي أول",
            duration: "2021 - الآن",
            description: "إعداد القيود المحاسبية اليومية، والعمل على النظام السحابي، وتسوية كشوفات الحسابات البنكية ومطابقة الموردين."
          },
          {
            id: "exp-sim-2",
            company: "المكتب الهندسي للاستشارات",
            role: "محاسب مبتدئ",
            duration: "2018 - 2021",
            description: "متابعة سندات الصرف والقبض، وجرد المستودعات ربع السنوي، وتسوية عهد الموظفين."
          }
        ],
        education: [
          {
            id: "edu-sim-1",
            institution: "جامعة القاهرة",
            degree: "بكالوريوس تجارة شعبة محاسبة",
            duration: "2014 - 2018"
          }
        ]
      }
    });
  }

  try {
    let contents: any;
    if (cvPdf) {
      contents = {
        parts: [
          {
            inlineData: {
              data: cvPdf,
              mimeType: "application/pdf"
            }
          },
          {
            text: `You are an expert AI Resume Parsing service.
      Analyze the provided candidate's resume in the attached PDF file and extract its structured contents directly.
      Attempt to identify dates, companies, education metrics, target field interests, skills, and personal contacts.
      Prefer Arabic language outputs for names, titles, and descriptions if the input is primarily in Arabic or requested by candidate.
      
      Return strictly a valid JSON object matching the following structure (without any markdown code fences):
      {
        "profile": {
          "personal": {
            "name": "extracted full name (or '' if not found)",
            "title": "extracted professional title or current position",
            "email": "extracted contact email",
            "phone": "extracted phone",
            "location": "extracted residence location",
            "summary": "a short professional bio summarized from their text",
            "website": "extracted LinkedIn or portfolio hyperlink"
          },
          "skills": ["array", "of", "extracted", "skills", "maximum", "8", "items"],
          "targetFields": ["array", "of", "inferred", "job", "titles", "or", "fields", "based", "on", "history", "max", "4"],
          "targetLocations": ["array", "of", "inferred", "locations", "e.g., Cairo, Riyadh, Dubai, Remote"],
          "experience": [
            {
              "id": "exp-1",
              "company": "company name",
              "role": "assigned title",
              "duration": "years of service (e.g. 2021 - Present)",
              "description": "short breakdown of responsibilities/achievements"
            }
          ],
          "education": [
            {
              "id": "edu-1",
              "institution": "university or school",
              "degree": "degree and score as described",
              "duration": "period (e.g. 2014 - 2018)"
            }
          ]
        }
      }`
          }
        ]
      };
    } else {
      contents = {
        parts: [
          {
            text: `You are an expert AI Resume Parsing service.
      Analyze the provided candidate's raw resume/cv text and extract its structured contents directly.
      Attempt to identify dates, companies, education metrics, target field interests, skills, and personal contacts.
      Prefer Arabic language outputs for names, titles, and descriptions if the input is primarily in Arabic.
      
      Resume text content:
      ${cvText}

      Return strictly a valid JSON object matching the following structure (without any markdown code fences):
      {
        "profile": {
          "personal": {
            "name": "extracted full name (or '' if not found)",
            "title": "extracted professional title or current position",
            "email": "extracted contact email",
            "phone": "extracted phone",
            "location": "extracted residence location",
            "summary": "a short professional bio summarized from their text",
            "website": "extracted LinkedIn or portfolio hyperlink"
          },
          "skills": ["array", "of", "extracted", "skills", "maximum", "8", "items"],
          "targetFields": ["array", "of", "inferred", "job", "titles", "or", "fields", "based", "on", "history", "max", "4"],
          "targetLocations": ["array", "of", "inferred", "locations", "e.g., Cairo, Riyadh, Dubai, Remote"],
          "experience": [
            {
              "id": "exp-1",
              "company": "company name",
              "role": "assigned title",
              "duration": "years of service (e.g. 2021 - Present)",
              "description": "short breakdown of responsibilities/achievements"
            }
          ],
          "education": [
            {
              "id": "edu-1",
              "institution": "university or school",
              "degree": "degree and score as described",
              "duration": "period (e.g. 2014 - 2018)"
            }
          ]
        }
      }`
          }
        ]
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    if (!parsed.profile) {
      throw new Error("Missing profile fields in AI output format.");
    }
    
    // Normalize IDs
    if (Array.isArray(parsed.profile.experience)) {
      parsed.profile.experience = parsed.profile.experience.map((exp: any, idx: number) => ({
        ...exp,
        id: exp.id || `exp-${Date.now()}-${idx}`
      }));
    } else {
      parsed.profile.experience = [];
    }
    
    if (Array.isArray(parsed.profile.education)) {
      parsed.profile.education = parsed.profile.education.map((edu: any, idx: number) => ({
        ...edu,
        id: edu.id || `edu-${Date.now()}-${idx}`
      }));
    } else {
      parsed.profile.education = [];
    }

    res.json({ success: true, simulated: false, profile: parsed.profile });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل استخلاص البيانات: " + (err as Error).message });
  }
});

// 13. AI OUTREACH MESSAGE GENERATOR (PITCHER)
app.post("/api/ai/pitch", aiLimiter, async (req, res) => {
  const { cvData, targetCompany, targetRole, jdText, platform, tone, language } = req.body;
  if (!cvData) {
    return res.status(400).json({ success: false, message: "بيانات السيرة الذاتية مفقودة." });
  }

  const isAr = language === "ar";
  const ai = getGeminiClient();

  if (!ai) {
    console.log("No Gemini API key. Injecting rich tailored simulated pitch response.");
    let demoPitch = "";
    if (platform === "linkedin") {
      demoPitch = isAr
        ? `أهلاً بك أستاذ فريد، أرجو أن تكون بتمام الصحة. يشرفني الانضمام لشبكتك الراقية. أنا ${cvData.personal.name}، وأعمل كـ ${targetRole} بخبرة تزيد عن 5 سنوات في مجالي. لقد لفت انتباهي تميز خدماتكم في شركة "${targetCompany || "الشركة المستهدفة"}"، وأطمح للمساهمة في دعم أهدافكم عبر مهاراتي المتمثلة في: ${cvData.skills.slice(0, 3).join("، ")}. أرجو تصفح سيرة مخصصة ومشاركة تواصل قريب. خالص التقدير.`
        : `Hello, hope you're doing great. I'm honored to connect with you. I am ${cvData.personal.name}, a dedicated ${targetRole} with 5+ years of success. Impressed by ${targetCompany || "your organization"}'s standard, I am excited to outline my fit for potential openings. I'd love to share my CV for consideration. Best regards.`;
    } else if (platform === "email") {
      demoPitch = isAr
        ? `الأستاذ الفاضل / مسؤول التوظيف في ${targetCompany || "الشركة الموقرة"}\n\nتحية طيبة وبعد،،\n\nأكتب إليكم لإبداء اهتمامي العميق بالانضمام لفريق عملكم المميز كـ ${targetRole}. بصفتي محاسباً محترفاً أحمل خبرة ٥ سنوات متراكمة في إدارة ومراجعة الحسابات، فقد طورت مهارات عالية في ${cvData.skills.slice(0, 4).join("، ")} واستراتيجيات الامتثال المالي.\n\nمن خلال مراجعتي لـ ${targetCompany || "أهداف شركتكم الرائدة"}، أثق بأن مساري المهني والعملي يتوافق تماماً مع تطلعاتكم للنمو والتوسع بالأسواق.\n\nمرفق لسيادتكم نسختي الذاتية لمراجعتها في أقرب وقت. شاكراً ومقدراً وقتكم السخي.\n\nتفضلوا بقبول فائق الاحترام والتقدير،،\n\nالمرشح: ${cvData.personal.name}\nالهاتف: ${cvData.personal.phone}\nالبريد: ${cvData.personal.email}`
        : `Dear Hiring Team at ${targetCompany || "your company"},\n\nI hope this message finds you well. I am writing to express my eager interest in the ${targetRole} vacancy. With 5 years of verified professional experience, I have developed expertise in ${cvData.skills.slice(0, 4).join(", ")} and structural business growth.\n\nMy master resume outlines my alignment with your goals. I have attached my resume for your convenience. Thank you for your time and guidance.\n\nSincerely,\n${cvData.personal.name}\n${cvData.personal.phone}\n${cvData.personal.email}`;
    } else {
      demoPitch = isAr
        ? `وعليكم السلام ورحمة الله وبركاته يا فندم. أنا ${cvData.personal.name}، تواصلت مع مكتبكم الكريم بخصوص ترشيحات وظيفة ${targetRole} للخليج. خبراتي تناسب التطلعات المطلوبة بالأخص في ${cvData.skills.slice(0, 2).join("، ")}. يسعدني جداً إرسال سيرتي وملخص أعمالي لمطابقة شروطكم. شكراً لتفهمكم وبانتظار ردكم الطيب بالتفصيل! 🌹`
        : `Hello recruiter! I'm ${cvData.personal.name}, contacting regarding your latest updates for ${targetRole} vacancies. Built 5 years in active deployment specializing in ${cvData.skills.slice(0, 2).join(", ")}. Happy to drop my resume and answer requests. Thank you, have a great day! ✨`;
    }

    return res.json({ success: true, simulated: true, pitch: demoPitch });
  }

  try {
    const prompt = `You are an expert HR coach and career communication assistant.
      Your task is to write a highly compelling, personalized outreach message for a recruiter based on the candidate's CV.
      
      Target Company: "${targetCompany || "Target Employer"}"
      Target Job Title: "${targetRole}"
      Additonal requirements/context: "${jdText || "General application inquiry"}"
      Tone of speech: "${tone}" (formal, friendly, or persuasive/direct-data)
      Communication channel format: "${platform}" (linkedin connection note - max 300 chars, email cover pitcher, or whatsapp direct messenger friendly)

      Candidate CV Details:
      Candidate Name: ${cvData.personal.name}
      Job Title: ${cvData.personal.title}
      Candidate Summary: ${cvData.personal.summary}
      Key Skills: ${cvData.skills.join(", ")}
      Experiences: ${cvData.experience.map((e: any) => `${e.role} at ${e.company} (${e.duration}) - ${e.description}`).join("; ")}

      Return the message content in "${isAr ? "Arabic" : "English"}" language. Do not output JSON wrappers, markdown bold wraps (*), or subject lines unless the platform is email. If formatting is email, provide a subject line and a structured email outline. Keeping it natural and authentic is paramount. Return only the raw text of the outreach pitcher message.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    res.json({ success: true, simulated: false, pitch: response.text || "" });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// 14. AI CONTRACT SAFETY AUDIT & TRAVEL ROADMAP ADVISOR
app.post("/api/ai/contract-audit", aiLimiter, async (req, res) => {
  const { jobTitle, salary, currency, country, hasHousing, hasTransport, hasMedical, hasFlights, extraText, language } = req.body;
  
  const isAr = language === "ar";
  const ai = getGeminiClient();

  if (!ai) {
    console.log("No Gemini API key. Injecting comprehensive simulated contract evaluation.");
    
    // Customize based on inputs
    const numSalary = Number(salary) || 4000;
    let rank = "مقبول ومتوازن ⚖️";
    let explanation = "";
    let score = 4;
    
    if (country === "KSA") {
      if (numSalary < 3500) {
        rank = "تحذيري وضئيل ⚠️";
        score = 2;
        explanation = `الراتب المعروض (${numSalary} ${currency}) منخفض جداً لصاحب تخصص مهني في السعودية، ويقارب الحد الأدنى للعمالة غير الماهرة. قد تواجه صعوبات معيشية بالغة في المدن الرئيسية مثل الرياض أو جدة بسبب ارتفاع الإيجارات ومصاريف المعيشة حتى مع توفر السكن والبدلات.`;
      } else if (numSalary >= 8000) {
        rank = "ممتاز ومجزي للغاية ✨";
        score = 5;
        explanation = `هذا راتب ممتاز (${numSalary} ${currency}) لـ "${jobTitle}" في المملكة العربية السعودية. يتيح لك عيشاً ممتعاً ومستقراً وإمكانية ادخار ممتازة للمستقبل، بالأخص مع تغطية الشركة لكافة بنود السكن والمواصلات والعلاج المجانية بالكامل.`;
      } else {
        rank = "جيد جداً ومتوازن 👍";
        score = 4;
        explanation = `الراتب المعروض (${numSalary} ${currency}) متداول ومتوسط بالأسواق لـ "${jobTitle}". يمنحك نمط حياة متوسط ومستقر لشخص بمفرده، وبإمكانك ادخار قدرٍ محترم من المال شهرياً طالما تلتزم بمصاريف معيشة معقولة وتستفيد من مزايا السكن والتنقل المجاني الممنوحة لك بالعقد.`;
      }
    } else {
      if (numSalary < 4000) {
        rank = "مستوى منخفض ببعض المخاطر ⚠️";
        score = 2.5;
        explanation = `العرض المالي (${numSalary} ${currency}) متدني مقارنة بتكاليف الإعاشة بدول الخليج الشريكة، وقد تستهلك أغلب معاشك في مأكل ومشرب أساسي في ظل موجات التضخم الحالية. حاول تحسين بنود العقد.`;
      } else {
        rank = "مكافئ ومجزي بالكامل ✅";
        score = 4.5;
        explanation = `هذا العرض المالي (${numSalary} ${currency}) يوفر لك عيشاً هنيئاً ومعدل ادخار ممتاز قياساً لسوق الوظائف والبدلات الممنوحة لك.`;
      }
    }

    const demoPitfalls = isAr ? [
      "نصيحة: تأكد من صياغة العقد باللغة العربية بجانب الإنجليزية، فالقضاء المحلي بالخليج يعتمد النسخة العربية أولاً في أي نزاع.",
      "تأكد من عدم وجود غرامات تعويضية مجحفة في حال الرغبة في ترك العمل لفسخ العقد مبكراً ومراعاة فترة الإخطار القانونية.",
      "تأكد هل السكن المقدم خاص ومستقل أم مشترك مع أفراد آخرين لضمان مستوى راحتك التام.",
      "تأكد من تفاصيل شروط المكافأة وقيمة العلاوة وهل تقيد بإنتاجية معينة أم ثابتة بنظام العمل الخليجي."
    ] : [
      "Ensure the Arabic version of your contract is accurately compiled, as local Gulf labor courts recognize the Arabic contract version as sovereign.",
      "Check for penal clauses regarding early contract termination and verify standard notice periods.",
      "Inquire if the supplied housing is shared or private to protect your personal quality of living.",
      "Confirm if the medical insurance is comprehensive or primary tier to avoid surprises in private clinics."
    ];

    const stepsKsa = [
      "حجز موعد الكشف الطبي للمسافرين عبر منصة وافد (Wafid) المعتمدة لدى سفارات دول الخليج.",
      "زيارة المعامل المعتمدة بمصر (جامكا GAMCA) لإجراء فحوصات فيروسات الكبد والصدر والحصول على تقرير لائق طبياً.",
      "توثيق شهادتك وتصنيفك المهني من الخارجية المصرية والملحقية الثقافية لدولة السفر بالقاهرة.",
      "حجز بصمة العين والصورة الحيوية لدى مكاتب (تسهيل / VFS Tasheel) لإتمام تاشيرة السعودية.",
      "استخراج تصريح العمل للمصريين العاملين بالخارج وتصريح السفر العسكري للمجندين."
    ];

    const stepsGeneric = [
      "استصدار تقرير اللياقة الصحية وشهادة الخلو من الأمراض من وزارة الصحة والسكان المصرية.",
      "التوجه لمكتب الخارجية المصرية لتوثيق الشهادة العلمية وعقود كفالة العمل المعتمدة.",
      "حجز موعد بصمات حيوية وصور تاشيرة لدى السفارة المستهدفة لتأثير الإقرار.",
      "استخراج موافقة الأمن الوطني وشهادة التحركات وكافة التصاريح الأمنية اللازمة من العباسية بمصر."
    ];

    return res.json({
      success: true,
      simulated: true,
      starsScore: score,
      fairnessStatus: rank,
      financialSummary: explanation,
      pitfalls: demoPitfalls,
      checklists: country === "KSA" ? stepsKsa : stepsGeneric
    });
  }

  try {
    const prompt = `You are an expert HR legal consultant and travel advisor specializing in recruitment of Egyptians to Gulf Cooperation Council (GCC) countries.
      Given the following job offer parameters, audit its financial compatibility with living costs, highlight any hidden contractual red flags or traps, and construct a detailed preparation checklist of official administrative processes in Egypt for travel.

      Offered Job parameters:
      Job Title: "${jobTitle}"
      Offered Salary: ${salary}
      Currency used: ${currency}
      Target Destination Country Code: "${country}"
      Fringe perks provided: Housing? ${hasHousing ? "Yes" : "No"}, Transportation? ${hasTransport ? "Yes" : "No"}, Medical coverage? ${hasMedical ? "Yes" : "No"}, Annual flights tickets? ${hasFlights ? "Yes" : "No"}.
      Contract text / Extra details inputted by user:
      "${extraText || "None specified"}"

      Analyze the salary against standard cost of living index in that destination (especially big cities like Riyadh, Doha, Dubai, Kuwait City) to compute detailed, real-world metrics.
      Return the output strictly in valid JSON format (raw json data without markdown wraps). The language of output text must match "${isAr ? "Arabic" : "English"}" language exactly.
      
      The output JSON must contain exactly these keys:
      {
        "starsScore": number (1 to 5),
        "fairnessStatus": string (e.g. "Excellent", "Poor", "Highly risky" translated properly to matches),
        "financialSummary": string (expert analysis explaining if salary is sufficient to live comfortably and save money, taking into account the checked perks),
        "pitfalls": array of strings (the core legal loopholes, contract traps, labor norms to ask questions about),
        "checklists": array of strings (the step-by-step official administrative procedures in Egypt e.g. Wafid, Ministry of Labour, Ministry of Foreign Affairs stamps, GAMCA medical center, workspace biometric fingerprint appointments to get travel clearance)
      }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, simulated: false, ...parsed });
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
