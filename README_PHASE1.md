# المرحلة الأولى — الأساس الآمن (نسخة كاملة)
## تعليمات التطبيق

---

## 📦 الملفات الموجودة في هذه الحزمة

```
.env.example                          ← متغيرات البيئة المطلوبة
index.html                            ← lang=ar + dir=rtl + عنوان صحيح
server.ts                             ← الباك إند بالكامل بعد التحصين
src/utils/apiClient.ts                ← [جديد] غلاف fetch موحّد يرسل التوكن تلقائيًا
src/App.tsx                           ← مُصلَح (tailoring errors + JSON.parse محمي)
src/components/BotDashboard.tsx       ← مُصلَح (إصلاح XSS)
src/components/InterviewSim.tsx       ← مُصلَح (توكن + رسائل خطأ + فك الاعتماد على عدد ثابت 5)
src/components/OutreachPitcher.tsx    ← مُصلَح (توكن + رسائل خطأ)
src/components/AtsChecker.tsx         ← مُصلَح (توكن + حد حجم PDF + base64 أسرع)
src/components/ContractAdvisor.tsx    ← مُصلَح (توكن + تنويه قانوني جديد)
src/components/JobsBoard.tsx          ← مُصلَح (زر تقديم معطّل بوضوح بدل وهم العمل)
```

---

## ✅ كل اللي تم إصلاحه

### الباك إند (server.ts)
| # | المشكلة | الحل |
|---|---|---|
| 1 | CORS مفتوح بالكامل | قائمة بيضاء حقيقية + رفض صريح لغير المسموح |
| 2 | JWT_SECRET افتراضي ضعيف | رفض تشغيل السيرفر في production بدونه |
| 3 | express.json حد 100kb | رُفع لـ 15mb |
| 4 | `/api/admin/stats` بدون حماية | يتطلب `requireAdmin` (إيميل من ADMIN_EMAILS فقط) |
| 5 | `POST /api/agencies` بدون حماية | يتطلب `requireAuth` + حد أدنى لطول الوصف |
| 6 | `POST /api/agencies/:id/review` بدون حماية | يتطلب `requireAuth` + التحقق من rating (1-5 صحيح) + منع تكرار التقييم + الاسم من التوكن لا من الطلب |
| 7 | `POST /api/telegram/trigger-broadcast` بدون حماية | يتطلب `requireAdmin` |
| 8 | كل endpoints الـ AI بدون حماية | تتطلب `requireAuth` — توفير تكلفة Gemini من زوار غير مسجلين |
| 9 | `/api/chat` غير موجود بالمرة | أُضيف بالكامل مع fallback ذكي |
| 10 | حد أدنى لكلمة المرور غير موجود | 8 أحرف على الأقل |
| 11 | Rate limiting على auth ضعيف | شُدِّد لمنع Brute Force |

### الفرونت إند
| # | الملف | المشكلة | الحل |
|---|---|---|---|
| 12 | BotDashboard.tsx | ثغرة XSS | إزالة dangerouslySetInnerHTML + تنظيف HTML tags |
| 13 | InterviewSim.tsx | لا يرسل توكن | يستخدم apiFetchJson |
| 14 | InterviewSim.tsx | اعتماد صارم على 5 أسئلة ثابتة | يعتمد على questions.length الفعلي |
| 15 | OutreachPitcher.tsx | لا يرسل توكن | يستخدم apiFetchJson |
| 16 | AtsChecker.tsx | لا يرسل توكن + لا حد لحجم PDF | توكن + حد 10MB + readAsDataURL |
| 17 | ContractAdvisor.tsx | لا تنويه قانوني بالمرة | تنويهان واضحان (عام + ملاصق للنتيجة) |
| 18 | App.tsx | فشل التخصيص بالـAI صامت تمامًا | رسالة خطأ واضحة (state + UI جديدين) |
| 19 | App.tsx | JSON.parse(localStorage) بدون حماية (موضعان) | محميان الآن بـ try/catch |
| 20 | JobsBoard.tsx | زر "تقديم الآن" يشير لـ # بصمت | زر معطّل بوضوح بصري + tooltip |
| 21 | index.html | lang="en" بدون dir="rtl" + عنوان افتراضي | lang="ar" dir="rtl" + عنوان "مسار" |

---

## 📋 خطوات التطبيق

### 1. استبدل الملفات
```bash
cp <هذه_الحزمة>/server.ts .
cp <هذه_الحزمة>/index.html .
cp <هذه_الحزمة>/.env.example .
cp <هذه_الحزمة>/src/App.tsx src/
cp <هذه_الحزمة>/src/utils/apiClient.ts src/utils/
cp <هذه_الحزمة>/src/components/*.tsx src/components/
```

### 2. أنشئ `.env.local`
```bash
cp .env.example .env.local
```
عدّل فيه `GEMINI_API_KEY` و `JWT_SECRET` (ولّده بـ: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) و `ADMIN_EMAILS`.

### 3. ثبّت وشغّل
```bash
npm install
npm run dev
```

---

## 🧪 اختبارات سريعة

```bash
# المفروض ترجع 401 — دليل إن الحماية شغالة
curl http://localhost:3000/api/admin/stats
curl -X POST http://localhost:3000/api/agencies -H "Content-Type: application/json" -d '{"name":"test"}'
```

ثم في المتصفح:
- سجّل دخول وجرّب محاكي المقابلات — لازم يشتغل
- افتح "مستشار العقود" — لازم تشوف صندوق تنويه أصفر
- افتح لوحة الوظائف — الوظائف بدون رابط حقيقي تظهر "غير متاح حاليًا" بدل زر وهمي

---

## 📌 الخطوة الجاية

**قاعدة بيانات Supabase** — نقل `users.json` وبيانات المكاتب الـ133 من الكود لـ PostgreSQL حقيقي.

**قولّي لما تجرّب وتتأكد إن كل شيء شغال، أو لو طلع أي خطأ.**
