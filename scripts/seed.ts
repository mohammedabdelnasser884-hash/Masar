import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "data", "users.json");

async function seedDemoUser() {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(FILE_PATH)) {
      const content = fs.readFileSync(FILE_PATH, "utf-8");
      if (content.trim().startsWith("[")) {
        const users = JSON.parse(content);
        if (users.some((u: any) => u.email === "demo@masar-app.com")) {
          console.log("ℹ️ demo@masar-app.com user already seeded");
          return;
        }
      }
    }

    const passwordHash = await bcrypt.hash("demo1234", 10);
    const demoUser = {
      id: "user-demo",
      email: "demo@masar-app.com",
      passwordHash,
      createdAt: new Date().toISOString(),
      profile: {
        personal: {
          name: "أحمد محمد محمود جلال",
          title: "محاسب مالي أول",
          email: "demo@masar-app.com",
          phone: "+20 102 345 6789",
          location: "القاهرة الجديدة، مصر",
          website: "linkedin.com/in/ahmed-galal-rec",
          summary: "محاسب مالي خبرة ٥ سنوات في تمويل الشركات وإعداد القوائم الختامية والميزانيات العمومية. مهارة عالية في ضبط حسابات المخازن، التخطيط الضريبي والتأكد من الامتثال المالي الكامل. أسعى لتسخير خبرة العمل على أنظمة ERP والمهارات التحليلية للمساهمة في تعزيز الكفاءات التشغيلية بالشركة."
        },
        experience: [
          {
            id: "exp-1",
            company: "شركة النيل للتجارة والاستثمار",
            role: "محاسب مالي أول",
            duration: "2023 - الآن",
            description: "• قيادة عمليات إقفال الحسابات الشهرية والسنوية والتسويات البنكية لأكثر من ٧ فروع.\n• إعداد القوائم المالية الأساسية والتدفقات النقدية وفقاً للمعايير المصرية والدولية.\n• تصميم نموذج جرد رقمي للمخازن وفر الكثير من الوقت وحَمى الأصول من الفاقد."
          },
          {
            id: "exp-2",
            company: "أوراسكوم للانشاءات",
            role: "محاسب تكاليف ومواقع",
            duration: "2021 - 2023",
            description: "• مراقبة تكلفة الخامات وساعات عمل المهندسين في المواقع الإنشائية الكبرى.\n• مراجعة مطالبات المقاولين من الباطن وصرف مستحقاتهم حسب الجداول الزمنية.\n• العمل المباشر كحلقة وصل بين الإدارة المالية ومواقع التنفيذ."
          }
        ],
        education: [
          {
            id: "edu-1",
            institution: "جامعة عين شمس - كلية التجارة",
            degree: "بكالوريوس محاسبة بتقدير عام جيد جداً",
            duration: "2017 - 2021"
          }
        ],
        projects: [
          {
            id: "pro-1",
            title: "أتمتة محاسبة الفروع بمصر",
            description: "تطوير ودمج خط ربط حسابات الفروع بالإدارة الرئيسية عبر واجهات ذكية، مما قلل وقت التسوية بنسبة ٤٠٪.",
            technologies: "Odoo ERP, MS Excel Advanced"
          }
        ],
        languages: [
          { id: "lang-1", "name": "العربية", "level": "اللغة الأم" },
          { id: "lang-2", "name": "الإنجليزية", "level": "مستوى جيد جداً" }
        ],
        skills: ["التحليل المالي", "تخطيط الميزانيات", "برمجيات ERP Odoo", "محاسبة التكاليف", "التسوية الضريبية", "مهارات الإكسيل المتقدمة"],
        targetFields: ["محاسبة", "مالية", "تكاليف", "ERP", "إدارة حسابات"],
        targetLocations: ["القاهرة", "الرياض", "عن بعد", "Remote", "السعودية"]
      }
    };

    fs.writeFileSync(FILE_PATH, JSON.stringify([demoUser], null, 2), "utf-8");
    console.log("✅ تم إنشاء الحساب التجريبي بنجاح");
  } catch (error) {
    console.error("❌ Error seeding demo user:", error);
  }
}

seedDemoUser();
