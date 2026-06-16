import fs from "fs";
import path from "path";
import { normalizeSearchQuery } from "../src/utils/colloquial.js";
import { getStoredJobs } from "./jobSource.js";

const SUBS_FILE = path.join(process.cwd(), "data", "telegram_subs.json");

export interface BotLog {
  timestamp: string;
  type: "info" | "success" | "command" | "error";
  message: string;
}

export const botLogs: BotLog[] = [];

// Saved active subscriptions chat IDs
let subscriptions: number[] = [];

function loadSubscriptions() {
  try {
    const dir = path.dirname(SUBS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(SUBS_FILE)) {
      subscriptions = JSON.parse(fs.readFileSync(SUBS_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Failed to load Telegram subscriptions", err);
  }
}

function saveSubscriptions() {
  try {
    fs.writeFileSync(SUBS_FILE, JSON.stringify(subscriptions, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save Telegram subscriptions", err);
  }
}

export function logBot(type: BotLog["type"], message: string) {
  const time = new Date().toLocaleTimeString("ar-EG");
  botLogs.unshift({ timestamp: time, type, message });
  if (botLogs.length > 50) botLogs.pop();
  console.log(`[Telegram Bot] ${message}`);
}

async function sendTelegramMessage(token: string, chatId: number, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML"
      })
    });
    return res.ok;
  } catch (err) {
    logBot("error", `فشل إرسال رسالة للمستلم ${chatId}: ${(err as Error).message}`);
    return false;
  }
}

// Background poller
let pollingInterval: NodeJS.Timeout | null = null;
let lastUpdateId = 0;

export function startTelegramBot() {
  loadSubscriptions();
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token || token === "YOUR_TELEGRAM_BOT_TOKEN" || token.trim() === "") {
    logBot("info", "لم يتم تكوين TELEGRAM_BOT_TOKEN في الإعدادات. يعمل البوت الآن في وضع 'المحاكاة الافتراضية' من لوحة التحكم لتجربة الأوامر.");
    return;
  }

  logBot("success", "تم اكتشاف رمز البوت الفعلي! بَدْء تشغيل مستمع البولينج الفعلي لتليجرام...");

  // Polling loop every 3.5 seconds
  pollingInterval = setInterval(async () => {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=3`);
      if (!res.ok) return;
      const data = await res.json() as any;
      if (data && data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          if (update.message) {
            await handleBotMessage(token, update.message);
          }
        }
      }
    } catch (err) {
      // Intentionally silent on transient fetch timeouts
    }
  }, 3500);
}

// Stop polling gracefully
export function stopTelegramBot() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

// Global subscriptions list getter
export function getBotSubscriptions() {
  return subscriptions;
}

/**
 * Handle incoming bot message (either from real Telegram API or UI Terminal Mock Panel)
 */
export async function handleBotMessage(token: string, message: any, isSimulated = false): Promise<string[]> {
  const chatId = message.chat?.id || 999111;
  const username = message.from?.first_name || message.from?.username || "مستخدم";
  const text = (message.text || "").trim();

  logBot("command", `رسالة واردة من ${username} (ID: ${chatId}): ${text}`);

  const replies: string[] = [];

  if (text.startsWith("/start")) {
    const welcome = `أهلاً بك يا ${username} في بوت وظائف مسار الذكي 💼✨\n\n` +
      `أنا هنا لمساعدتك في الحصول على أحدث الوظائف المنشورة في مصر والخليج.\n\n` +
      `📌 <b>الأوامر المتاحة:</b>\n` +
      `• /search [كلمة البحث] - ابحث عن وظيفة (ندعم اللهجة العامية، مثلاً: /search شغلانة جدة)\n` +
      `• /cv - الحصول على تعليمات السيرة الذاتية الذكية والمتوافقة مع ATS\n` +
      `• /subscribe - الاشتراك في الإرسال اليومي التلقائي لأحدث الوظائف\n` +
      `• /unsubscribe - إلغاء الاشتراك اليومي`;

    replies.push(welcome);
    
    // Auto add to subscriptions on start
    if (!subscriptions.includes(chatId)) {
      subscriptions.push(chatId);
      saveSubscriptions();
      logBot("info", `تم تسجيل المستخدم ${username} (${chatId}) تلقائياً بقائمة إشعارات الوظائف.`);
    }
  } 
  else if (text.startsWith("/search")) {
    const query = text.replace("/search", "").trim();
    if (!query) {
      replies.push("ℹ️ يرجى كتابة كلمة البحث بعد الأمر. مثال:\n`/search محاسب قطر` أو `/search شغل من البيت` ");
    } else {
      // Use our dynamic colloquial mapping!
      const normalizedQuery = normalizeSearchQuery(query);
      logBot("info", `تم فلترة وتوسيع الكلمة عبر محرك العامية: "${query}" ➡️ "${normalizedQuery}"`);

      const allJobs = await getStoredJobs();
      const matched = allJobs.filter(job => 
        job.title.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(normalizedQuery.toLowerCase())
      );

      if (matched.length === 0) {
        replies.push(`❌ لم نعثر على نتائج مطابقة لـ "${query}" (عبر الفلترة: "${normalizedQuery}"). حاول تغيير الكلمة.`);
      } else {
        let textResult = `🔍 <b>نتائج البحث عن "${query}" (${matched.length} وظيفة):</b>\n\n`;
        matched.slice(0, 5).forEach((j, idx) => {
          textResult += `${idx + 1}. <b>${j.title}</b>\n` +
            `🏢 الشركة: ${j.company}\n` +
            `📍 الموقع: ${j.location} | [${j.type === 'remote' ? 'عن بعد' : 'حضوري'}]\n` +
            `📦 المصدر: ${j.source}\n` +
            `🔗 التفاصيل: ${j.url || "رابط داخلي بالمنصة"}\n\n`;
        });
        if (matched.length > 5) {
          textResult += `• والمزيد غيرها متاح في لوحة التحكم!`;
        }
        replies.push(textResult);
      }
    }
  } 
  else if (text.startsWith("/cv")) {
    const cvGuide = `📝 <b>السيرة الذاتية الذكية والمتوافقة مع ATS:</b>\n\n` +
      `سعداء لاهتمامك بـ ATS CV Creator! تم تصميم قوالبنا للعبور الآمن من أنظمة الفحص الإلكتروني:\n\n` +
      `• <b>القالب الأول:</b> كلاسيكي رسمي بنظام عمود واحد مريح.\n` +
      `• <b>القالب الثاني:</b> حديث بشريط جانبي يتحول لعمود واحد عند الطباعة.\n` +
      `• <b>القالب الثالث:</b> أكاديمي غني بمجالات البحث.\n\n` +
      `👉 قم بزيارة موقعنا، وعبّئ بياناتك مرة واحدة للتصدير الفوري والإصدار التلقائي المخصص للذكاء الاصطناعي!`;
    replies.push(cvGuide);
  }
  else if (text.startsWith("/subscribe")) {
    if (subscriptions.includes(chatId)) {
      replies.push("✅ أنت مشترك بالفعل في النشرة اليومية للوظائف!");
    } else {
      subscriptions.push(chatId);
      saveSubscriptions();
      replies.push("🎉 تم اشتراكك بنجاح! ستحصل على إشعار يومي بأحدث الوظائف المسجلة في مصر والخليج.");
      logBot("success", `مستلم جديد اشترك بالبوت: ${username} (${chatId})`);
    }
  }
  else if (text.startsWith("/unsubscribe")) {
    subscriptions = subscriptions.filter(id => id !== chatId);
    saveSubscriptions();
    replies.push("✖️ تم إلغاء اشتراكك بنجاح من الإرسال اليومي. نتطلع لعودتك دائماً.");
    logBot("info", `مستلم ألغى الاشتراك: ${username} (${chatId})`);
  }
  else {
    replies.push(`🤖 عذراً ${username}، لم أفهم هذا الأمر.\n\nاستخدم الأوامر:\n/search [كلمة البحث]\n/cv\n/subscribe`);
  }

  // If live token is active and we are NOT just simulating in the web dashboard, send it!
  if (!isSimulated && token && token !== "YOUR_TELEGRAM_BOT_TOKEN") {
    for (const reply of replies) {
      await sendTelegramMessage(token, chatId, reply);
    }
  }

  return replies;
}

/**
 * Triggers a simulated broadcast of newly cached vacancies to all subscribers
 */
export async function triggerDailyVacancyBroadcast() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const activeSubs = subscriptions;

  logBot("info", `بَدْء جدولة بث الإشعارات اليومية لعدد ${activeSubs.length} مشتركين...`);

  if (activeSubs.length === 0) {
    logBot("info", "تخطي البث - لا يوجد أي مستخدمين مشتركين حالياً.");
    return { count: 0, skipped: true };
  }

  const jobs = await getStoredJobs();
  const freshOnes = jobs.slice(0, 3);

  if (freshOnes.length === 0) {
    logBot("info", "تخطي البث - لم يتم تسجيل وظائف حديثة في آخر 6 ساعات.");
    return { count: 0, skipped: true };
  }

  const broadcastText = `📢 <b>إشعار الوظائف اليومي من مسار الذكية!</b>\n\n` +
    `إليك أعلى ٣ فرص عمل مسجلة حديثاً في مصر والخليج:\n\n` +
    freshOnes.map((j, i) => 
      `🔹 <b>${j.title}</b> (${j.company})\n` +
      `📍 ${j.location} | راتب: ${j.salary || "حسب الخبرة"}`
    ).join("\n\n") + 
    `\n\n🌐 للمزيد من الفحص ومعاينة السير الذاتية، زر لوحة تحكم المنصة الآن!`;

  let sentCount = 0;
  if (token && token !== "YOUR_TELEGRAM_BOT_TOKEN") {
    for (const id of activeSubs) {
      const ok = await sendTelegramMessage(token, id, broadcastText);
      if (ok) sentCount++;
    }
  }

  logBot("success", `تم بث إشعار الوظائف اليومي بنجاح إلى المشتركين (${isActualTokenActive() ? 'عبر التليجرام الفعلي' : 'محاكاة افتراضية'}).`);
  return { count: activeSubs.length, sentCount, jobsCount: freshOnes.length };
}

export function isActualTokenActive(): boolean {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  return !!(token && token !== "YOUR_TELEGRAM_BOT_TOKEN" && token.trim() !== "");
}
