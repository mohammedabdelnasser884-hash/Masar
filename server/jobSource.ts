import path from "path";
import fs from "fs";
import { Job } from "../src/types.js";

const FILE_PATH = path.join(process.cwd(), "data", "stored_jobs.json");
const CACHE_HOURS = 6;

// ─── Fallback jobs (يُستخدم لو فشل كل شيء) ─────────────────────
const SEED_JOBS: Job[] = [
  { id: "seed-1", title: "محاسب مالي أول", company: "مجموعة طلعت مصطفى", location: "القاهرة، مصر", type: "onsite", description: "إعداد القوائم المالية وتسوية الحسابات البنكية والتعامل مع الضرائب.", source: "وظفني", salary: "15,000 - 20,000 EGP", createdAt: Date.now() - 7200000 },
  { id: "seed-2", title: "مهندس برمجيات React", company: "أقدار تك", location: "جدة، السعودية", type: "remote", description: "مطلوب مطور واجهات React + TypeScript للعمل عن بعد بمرونة تامة.", source: "وظفني", salary: "8,000 - 11,000 SAR", createdAt: Date.now() - 18000000 },
  { id: "seed-3", title: "أخصائي موارد بشرية", company: "STC", location: "الرياض، السعودية", type: "hybrid", description: "دعم عمليات التوظيف والتدريب والتقييم السنوي وفق نظام العمل السعودي.", source: "Bayt", salary: "12,000 - 16,000 SAR", createdAt: Date.now() - 28800000 },
  { id: "seed-4", title: "أخصائي تسويق رقمي", company: "وكالة رن ميديا", location: "الدوحة، قطر", type: "remote", description: "إدارة الإعلانات الممولة على جوجل وفيسبوك وتقارير الأداء للعملاء.", source: "Bayt", salary: "5,000 - 7,500 QAR", createdAt: Date.now() - 10800000 },
  { id: "seed-5", title: "مدير مشاريع هندسية", company: "الدار العقارية", location: "دبي، الإمارات", type: "onsite", description: "إدارة المشاريع الإنشائية في دبي. خبرة 8 سنوات كحد أدنى.", source: "Bayt", salary: "25,000 - 35,000 AED", createdAt: Date.now() - 64800000 },
  { id: "seed-6", title: "ممثل خدمة عملاء", company: "Vodafone Egypt", location: "الإسكندرية، مصر", type: "onsite", description: "كول سنتر براتب مجزي وتأمين طبي واجتماعي. مستوى إنجليزي مقبول.", source: "وظفني", salary: "7,000 - 9,000 EGP", createdAt: Date.now() - 43200000 },
];

// ─── RSS Parser بسيط ─────────────────────────────────────────────
function parseRssJobs(xml: string, source: string, maxItems = 15): Job[] {
  const jobs: Job[] = [];
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

  for (let i = 0; i < Math.min(items.length, maxItems); i++) {
    const item = items[i];
    const get = (tag: string) => {
      const m = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return (m?.[1] || m?.[2] || "").trim();
    };

    const title = get("title");
    const link  = get("link") || get("guid");
    const desc  = get("description").replace(/<[^>]*>/g, "").slice(0, 350);
    const pubDate = get("pubDate");

    if (!title) continue;

    // استخلاص الموقع من العنوان أو الوصف
    let location = "غير محدد";
    const locMatches = [
      "مصر", "Egypt", "القاهرة", "Cairo", "الإسكندرية", "Alexandria",
      "السعودية", "Saudi", "الرياض", "Riyadh", "جدة", "Jeddah",
      "الإمارات", "UAE", "دبي", "Dubai", "أبوظبي",
      "قطر", "Qatar", "الدوحة", "Doha",
      "الكويت", "Kuwait", "البحرين", "Bahrain", "عُمان", "Oman",
      "عن بعد", "Remote", "ريموت"
    ];
    for (const loc of locMatches) {
      if (title.includes(loc) || desc.includes(loc)) {
        location = loc;
        break;
      }
    }

    // تحديد نوع العمل
    let type: Job["type"] = "onsite";
    if (/remote|عن بعد|ريموت|من المنزل/i.test(title + desc)) type = "remote";
    else if (/hybrid|هجين/i.test(title + desc)) type = "hybrid";

    jobs.push({
      id: `rss-${source}-${i}-${Date.now()}`,
      title: title.slice(0, 100),
      company: get("author") || get("dc:creator") || source,
      location,
      type,
      description: desc || "اضغط لمشاهدة التفاصيل الكاملة.",
      source,
      url: link,
      createdAt: pubDate ? new Date(pubDate).getTime() : Date.now() - i * 3600000,
    });
  }

  return jobs;
}

// ─── مصادر RSS المجانية ───────────────────────────────────────────
const RSS_SOURCES = [
  // Wuzzuf - مصر
  {
    name: "Wuzzuf",
    url: "https://wuzzuf.net/jobs/egypt/rss",
  },
  // Bayt - مصر والخليج
  {
    name: "Bayt",
    url: "https://www.bayt.com/en/egypt/jobs/rss/",
  },
  // Bayt - السعودية
  {
    name: "Bayt KSA",
    url: "https://www.bayt.com/en/saudi-arabia/jobs/rss/",
  },
  // Bayt - الإمارات
  {
    name: "Bayt UAE",
    url: "https://www.bayt.com/en/uae/jobs/rss/",
  },
  // Tanqeeb - الخليج
  {
    name: "Tanqeeb",
    url: "https://tanqeeb.com/rss/jobs",
  },
];

// ─── جلب وظائف بـ Remote Jobs API (مجاني) ───────────────────────
async function fetchRemoteJobs(): Promise<Job[]> {
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?limit=10&category=software-dev", {
      headers: { "User-Agent": "MasarJobsApp/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json() as any;
    return (data.jobs || []).slice(0, 10).map((j: any, i: number) => ({
      id: `remotive-${i}`,
      title: j.title,
      company: j.company_name,
      location: "Remote - " + (j.candidate_required_location || "Worldwide"),
      type: "remote" as const,
      description: (j.description || "").replace(/<[^>]*>/g, "").slice(0, 300),
      source: "Remotive",
      url: j.url,
      salary: j.salary || "",
      createdAt: new Date(j.publication_date || Date.now()).getTime(),
    }));
  } catch {
    return [];
  }
}

// ─── جلب RSS من مصدر واحد ─────────────────────────────────────────
async function fetchRss(source: { name: string; url: string }): Promise<Job[]> {
  try {
    const res = await fetch(source.url, {
      headers: {
        "User-Agent": "MasarJobsApp/1.0",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const jobs = parseRssJobs(xml, source.name);
    console.log(`✅ ${source.name}: جلبنا ${jobs.length} وظيفة`);
    return jobs;
  } catch (err) {
    console.log(`⚠️ ${source.name}: فشل الجلب -`, (err as Error).message);
    return [];
  }
}

// ─── الدالة الرئيسية: جلب وحفظ كل الوظائف ───────────────────────
async function fetchAndCacheJobs(): Promise<Job[]> {
  console.log("🔄 جاري جلب الوظائف من المصادر الحقيقية...");

  // جلب كل المصادر بالتوازي
  const [remoteJobs, ...rssBatches] = await Promise.all([
    fetchRemoteJobs(),
    ...RSS_SOURCES.map(fetchRss),
  ]);

  const rssJobs = rssBatches.flat();
  const allJobs = [...rssJobs, ...remoteJobs];

  // لو مفيش نتائج، نرجع الـ seeds
  if (allJobs.length < 5) {
    console.log("⚠️ نتائج قليلة، بنضيف الوظائف الافتراضية...");
    const merged = [...SEED_JOBS, ...allJobs];
    saveJobs(merged);
    return merged;
  }

  // إزالة التكرار بالعنوان
  const seen = new Set<string>();
  const unique = allJobs.filter(j => {
    const key = j.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // ترتيب بالأحدث
  unique.sort((a, b) => b.createdAt - a.createdAt);

  saveJobs(unique);
  console.log(`✅ تم حفظ ${unique.length} وظيفة حقيقية`);
  return unique;
}

function saveJobs(jobs: Job[]) {
  const dir = path.dirname(FILE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE_PATH, JSON.stringify(jobs, null, 2), "utf-8");
}

// ─── الدالة المُصدَّرة ────────────────────────────────────────────
export async function getStoredJobs(): Promise<Job[]> {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // تحقق من الـ cache
    if (fs.existsSync(FILE_PATH)) {
      const stats = fs.statSync(FILE_PATH);
      const ageHours = (Date.now() - stats.mtime.getTime()) / 3600000;
      const cached: Job[] = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));

      if (ageHours < CACHE_HOURS && cached.length > 0) {
        console.log(`📦 Cache صالح (${cached.length} وظيفة، عمره ${ageHours.toFixed(1)} ساعة)`);
        return cached;
      }
    }

    // Cache منتهي أو مفيش → جلب جديد
    return await fetchAndCacheJobs();

  } catch (err) {
    console.error("خطأ في getStoredJobs:", err);
    return SEED_JOBS;
  }
}

// ─── تحديث يدوي (من endpoint) ────────────────────────────────────
export async function forceRefreshJobs(): Promise<Job[]> {
  return await fetchAndCacheJobs();
}
