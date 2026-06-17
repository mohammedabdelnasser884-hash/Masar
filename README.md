<div align="center">

# 🚀 مسار المهنية
### منصة التوظيف الذكية للعالم العربي

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

</div>

---

## ✨ المميزات

| الميزة | الوصف |
|--------|-------|
| 📝 **CV Builder** | بناء سيرة ذاتية احترافية بـ 3 قوالب |
| 🎯 **ATS Checker** | فحص توافق السيرة مع أنظمة الفرز الآلي |
| 💼 **وظائف حقيقية** | من Wuzzuf + Bayt + Remotive مباشرة |
| 🎙️ **محاكاة المقابلات** | أسئلة حقيقية وتقييم فوري بالـ AI |
| 🤖 **مرشد المسار** | كوتش مهني يعرف سيرتك كاملة |
| 📜 **فحص العقود** | تحليل عروض العمل قبل التوقيع |
| ✉️ **رسائل التقديم** | صياغة ذكية لـ LinkedIn وواتساب والإيميل |

---

## 🛠️ تشغيل محلي

```bash
git clone https://github.com/your-repo/masar-career
cd masar-career
npm install
cp .env.example .env
# حط GROQ_API_KEY في ملف .env
npm run dev
```

---

## 🚀 النشر على Railway (مجاني)

1. روح على [railway.app](https://railway.app)
2. اضغط **New Project** → **Deploy from GitHub**
3. اختار الـ repo
4. في **Variables** أضف:
   ```
   GROQ_API_KEY=your_key_here
   NODE_ENV=production
   ```
5. Railway هيعمل build ونشر تلقائي ✅

---

## 🌐 النشر على Render (مجاني)

1. روح على [render.com](https://render.com)
2. **New Web Service** → اختار الـ repo
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. أضف `GROQ_API_KEY` في Environment Variables

---

## ⚙️ متغيرات البيئة

| المتغير | مطلوب | الوصف |
|---------|-------|-------|
| `GROQ_API_KEY` | ✅ | مفتاح Groq AI (مجاني من console.groq.com) |
| `PORT` | ❌ | رقم البورت (افتراضي: 3000) |
| `NODE_ENV` | ❌ | `production` للنشر |
| `TELEGRAM_BOT_TOKEN` | ❌ | اختياري — بوت تليجرام |

---

## 🏗️ التقنيات المستخدمة

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express
- **AI**: Groq API (llama-3.3-70b) — مجاني ١٠٠٪
- **Jobs Data**: Wuzzuf RSS + Bayt RSS + Remotive API

---

<div align="center">
صُنع بـ ❤️ للعالم العربي
</div>
