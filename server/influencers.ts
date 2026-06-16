import path from "path";
import fs from "fs";
import { InfluencerPost } from "../src/types.js";

const FILE_PATH = path.join(process.cwd(), "data", "influencer_posts.json");

const DEFAULT_POSTS: InfluencerPost[] = [
  {
    id: "inf-1",
    name: "إبراهيم الحربي | مستشار توظيف",
    handle: "@Alharbi_Rec",
    platform: "Twitter",
    content: "يا شباب، نصيحة هامة جداً لـ ATS: السير الذاتية ذات العمود المعقد أو التي تحتوي على جداول وصور تُرفض تلقائياً من 90% من الأنظمة الحديثة. اعتمدوا البساطة وعمود واحد والخطوط المباشرة مثل Tajawal أو Arial لضمان عبور آمن للمكالمة.",
    timeLabel: "منذ ساعتين",
    avatarColor: "bg-blue-600 text-white"
  },
  {
    id: "inf-2",
    name: "مروة المصري - خبيرة HR مصر",
    handle: "marwa-el-masry",
    platform: "LinkedIn",
    content: "مطلوب مكاتب توظيف أمينة تفرز السير الذاتية وتسهل التوظيف بالخليج لراغبي العمل من مصر. التقييمات الإيجابية للمكاتب الشفافة هي ما يبحث عنه الشباب اليوم لتجنب المستغلين. سأنشر غداً قائمة بالشركات المعتمدة رسمياً بقوانين العمل المصرية.",
    timeLabel: "منذ 6 ساعات",
    avatarColor: "bg-teal-600 text-white"
  },
  {
    id: "inf-3",
    name: "خالد بن محمد | وظائف الخليج",
    handle: "@Khalid_Jobs_GCC",
    platform: "Twitter",
    content: "فرص عمل ضخمة في قطاع المحاسبة والمبيعات بالرياض وجدة خلال الربع الحالي. المهارات المطلوبة رقم واحد هي التعامل مع ERP Systems (سواء Odoo أو SAP) واللغة الإنجليزية للمقابلة. استعدوا عبر محاكي المقابلات لتثقيف أنفسكم بالأسئلة الشائعة.",
    timeLabel: "منذ 10 ساعات",
    avatarColor: "bg-slate-700 text-white"
  },
  {
    id: "inf-4",
    name: "م. محمد جلال - توظيف المطورين",
    handle: "m-galal-tech",
    platform: "LinkedIn",
    content: "لا تكتب مهارات عامة في سيرتك الذاتية من أجل حشو الكلمات فقط! قم بتفصيل دورك بكل مشروع. ATS يبحث عن السياق وليس مجرد الاسم. استخدام الذكاء الاصطناعي لـ 'تفصيل' سيرتك بناء على التوصيف الوظيفي سيرفع نسبة التوافق لـ 80% فما فوق.",
    timeLabel: "أمس",
    avatarColor: "bg-indigo-600 text-white"
  }
];

export async function getInfluencerPosts(): Promise<InfluencerPost[]> {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let shouldUpdate = false;
    let cached: InfluencerPost[] = [];

    if (fs.existsSync(FILE_PATH)) {
      const stats = fs.statSync(FILE_PATH);
      const mtime = stats.mtime.getTime();
      const ageHours = (Date.now() - mtime) / (1000 * 60 * 60);

      // Cache expires every 12 hours
      if (ageHours >= 12) {
        shouldUpdate = true;
      }

      const fileContent = fs.readFileSync(FILE_PATH, "utf-8");
      cached = JSON.parse(fileContent);
    } else {
      shouldUpdate = true;
    }

    if (shouldUpdate || cached.length === 0) {
      console.log("12 Hours Cache expired or missing. Fetching/Updating influencer posts...");
      cached = DEFAULT_POSTS.map(post => ({
        ...post,
        timeLabel: `تحديث منذ ${Math.floor(Math.random() * 4) + 1} ساعة`
      }));
      fs.writeFileSync(FILE_PATH, JSON.stringify(cached, null, 2), "utf-8");
    }

    return cached;
  } catch (error) {
    console.error("Error reading stored influencer posts fall-backing to default lists.", error);
    return DEFAULT_POSTS;
  }
}
