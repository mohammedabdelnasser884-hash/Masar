import path from "path";
import fs from "fs";
import { Agency } from "../src/types.js";

const FILE_PATH = path.join(process.cwd(), "data", "stored_agencies.json");

const SEED_AGENCIES: Agency[] = [
  // General Agencies (trustedByOwner: false)
  {
    id: "agency-general-1",
    name: "شركة تراست جروب للتوظيف",
    phone: "01000234561",
    address: "شارع مصطفى النحاس، مدينة نصر، القاهرة",
    description: "تراست جروب من المكاتب الممتازة والشهيرة في إلحاق العمالة المصرية بالخارج وتوفير المقابلات المباشرة مع اللجان السعودية والخليجية لكافة التخصصات.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1KywnpW7g6/?mibextid=wwXIfr",
    trustedByOwner: false
  },
  {
    id: "agency-general-2",
    name: "شركة جوب واي للتوظيف الطبي",
    phone: "01122334455",
    address: "المنيل، القاهرة",
    description: "مؤسسة طبية متخصصة ومصنفة بالدرجة الأولى لتوفير أرقى الفرص المتاحة للأطباء البشريين والأسنان والصيادلة والتمريض في كبرى المجمعات الطبية والمستشفيات بالسعودية.",
    rating: 4.9,
    reviews: [],
    facebook: "https://www.facebook.com/share/1GY8z6dVsn/?mibextid=wwXIfr",
    trustedByOwner: false
  },
  {
    id: "agency-general-3",
    name: "شركة استدامة للتوظيف",
    phone: "01555443322",
    address: "الدقي، الجيزة",
    description: "واحدة من المكاتب المتميزة في استقطاب وتعيين الكوادر الهندسية والفنية والحرفية بالخليج العربي ومتابعة ممتازة للرواتب وحقوق العاملين.",
    rating: 4.7,
    reviews: [],
    facebook: "https://www.facebook.com/share/16K4p6qkhi/?mibextid=wwXIfr",
    trustedByOwner: false
  },
  {
    id: "agency-general-4",
    name: "شركة هورايزون للتوظيف",
    phone: "0237651234",
    address: "المهندسين، الجيزة",
    description: "شركة هورايزون مرخصة رسميًا ومشهورة بسد الاحتياجات الوظيفية للشركات السعودية خصوصًا في قطاع المقاولات، المحاسبة، وتكنولوجيا المعلومات.",
    rating: 4.6,
    reviews: [],
    facebook: "https://www.facebook.com/share/16RpKeXe6Q/?mibextid=wwXIfr",
    trustedByOwner: false
  },

  // Personally Vouched & Highly Trusted Agencies (trustedByOwner: true)
  {
    id: "agency-trusted-1",
    name: "شركة الطائف للتوظيف",
    phone: "0233042111",
    address: "77 شارع سوريا، المهندسين، الجيزة",
    description: "إحدى كبرى الشركات المرخصة وأوسعها انتشاراً، إشراف ومصداقية تامة في تجهيز مقابلات المعلمين والأطباء والمهندسين. من أفضل البيئات الموثوق والآمنة للتعامل.",
    rating: 4.9,
    reviews: [
      {
        id: "rev-eltaef-1",
        userName: "أحمد منصور (معلم حاسب)",
        rating: 5,
        comment: "سافرت معهم والحمد لله شركة محترمة وأصحابها في غاية الأمانة والوضوح والالتزام.",
        date: "2026-05-20"
      }
    ],
    facebook: "https://www.facebook.com/share/1ZFyLpySWY/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-2",
    name: "شركة المعالي جروب للتوظيف",
    phone: "01000004561",
    address: "21 شارع السخاوي، روكسي، مصر الجديدة، القاهرة",
    description: "من أعرق مكاتب التوظيف في مصر (رخصة 466)، متفردة بتعاوناتها الاستراتيجية لخدمة القطاع الطبي والتعليمي، التزام كامل ببنود العقود وحقوق المرشحين.",
    rating: 4.9,
    reviews: [
      {
        id: "rev-elmaaly-1",
        userName: "م. محمد الغديري",
        rating: 5,
        comment: "المعالي غنية عن التعريف وأصحابها ناس أفاضل يراعون الله في كل المسافرين والتعاقدات.",
        date: "2026-06-02"
      }
    ],
    facebook: "https://www.facebook.com/share/1WWqWkbmZ7/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-3",
    name: "شركة انفراد للتوظيف",
    phone: "01022340567",
    address: "شارع القصر العيني، القاهرة",
    description: "شركة انفراد صاحبة سمعة ذهبية وخبرة استثنائية في انتقاء وإلحاق الكفاءات بمختلف القطاعات الهندسية والإدارية والمالية. نوصي بها لصدق المعاملة والشفافية.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/enfrad.hr1",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-4",
    name: "شركة آل زيدان للتوظيف",
    phone: "01233445566",
    address: "المعادي، القاهرة",
    description: "إدارة محترفة متخصصة في توثيق العلاقات الخليجية وتأمين عقود وظيفية ممتازة لحديثي وذوي الخبرة بمختلف دول الخليج العربي.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1ExjNEQbF5/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-5",
    name: "شركة مسار للتوظيف",
    phone: "01144556677",
    address: "شارع جامعة الدول، المهندسين، الجيزة",
    description: "مجموعات مسار المعتمدة توفر أرقى المقابلات والنزاهة والتدقيق الممتاز للأخصائيين ومحاسبين التكاليف بقطاع التجزئة والمقاولات في مصر والخليج.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/19gPvHW6fL/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-6",
    name: "شركة أبو عالية للتوظيف",
    phone: "01007788991",
    address: "مصر الجديدة، القاهرة",
    description: "شركة مرخصة معتمدة بخبرة عالية ومتابعة شخصية ودقيقة لكل إجراءات السفر، ممتازة جدًا لراغبي الفرص الحقيقية والمثبتة رسميًا.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1Dv6zUY1Sj/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-7",
    name: "شركة السلسبيل للتوظيف",
    phone: "01222883311",
    address: "وسط البلد، القاهرة",
    description: "مصداقية عالية للغاية في استلام وتأمين كافة أنواع التأشيرات والوظائف التخصصية بالمملكة ككل، معاملتهم محترمة وسريعة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1EJFF8wYre/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-8",
    name: "شركة جوب هانتر للتوظيف",
    phone: "01099887766",
    address: "عباس العقاد، مدينة نصر، القاهرة",
    description: "تمتلك عقودًا حصرية وشراكات ضخمة مع أرقى الهيئات الطبية والتجارية والمقاولات في السعودية والخليج، تتميز بالأمانة والسرعة الفائقة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1CWhR3QHW7/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-9",
    name: "شركة أرتك للتوظيف",
    phone: "01122888800",
    address: "الدقي، الجيزة",
    description: "مؤسسة مرموقة تقدم خدمات استشارية وجمع الكفاءات الطبية والتعليمية والمهنية، خدماتها نزيهة ومواعيدها دقيقة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1D7GLQXEt4/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-10",
    name: "شركة العاصمة للتوظيف",
    phone: "0225112233",
    address: "رمسيس، وسط القاهرة",
    description: "تقدم حلول توظيف ممتازة بوضوح تام، وتتابع العقد بدقة لضمان حصول المرشح على حقوق الراتب والسكن والتأمين.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/17KeRKA7cP/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-11",
    name: "شركة رواد الخليج للتوظيف",
    phone: "01011223344",
    address: "شبرا، القاهرة",
    description: "من المكاتب المعتمدة رسمياً والتي يتابع أصحابها الكرام كل صغيرة وكبيرة لخدمة المسافر، متخصصة في الفئات الطبية والتعليمية والسائقين.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1FDmBbKYLy/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-12",
    name: "شركة محمد سعد للتوظيف",
    phone: "01511223344",
    address: "حلوان، القاهرة",
    description: "إدارة موثوقة ومحترمة تهتم بكل المرشحين وتضمن مطابقة الراتب المتفق عليه وتعمل بأمانة تامة ومصداقية يشهد لها الجميع.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/profile.php?id=61551200990707",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-13",
    name: "شركة الركن الملكي للتوظيف",
    phone: "01033445588",
    address: "الجيزة، مصر",
    description: "توفير كامل الدعم للمسافرين وتواجد مستمر للإجابة على استفسارات العملاء بكل احترام ومصداقية ودعم مهني كامل.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1Bbbr9qYCL/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-14",
    name: "شركة معالينا للتوظيف",
    phone: "01155006622",
    address: "شبرا الخيمة، القليوبية",
    description: "أخلاق معتمدة وإدارة موثوقة تسهل جميع الإجراءات وبأقل عمولات مستحقة دون مبالغة وشروط مطابقة للعقد.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1P71MkM5vu/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-15",
    name: "شركة بايونير للتوظيف",
    phone: "01077665544",
    address: "شارع الهرم، الجيزة",
    description: "بايونير لتوفير الكفاءات بالخارج، مشهود لها بالدقة الفنية ومراعاة الشروط القانونية الصارمة لحقوق الكوادر المسافرة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/14Ky85m6BMq/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-16",
    name: "شركة منارة الخليج للتوظيف",
    phone: "01211155566",
    address: "المنصورة، الدقهلية",
    description: "إحدى الشركات المعتمدة والرائدة تاريخياً في توفير عقود مميزة للأطباء بكبرى مستشفيات المملكة بجميع المناطق.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1BEzZKbnES/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-17",
    name: "شركة الملتقى للتوظيف",
    phone: "01099881122",
    address: "مصر الجديدة، القاهرة",
    description: "خدمات ممتازة وفريق عمل متعاون يسعى لتحقيق مصلحة المرشح بكل أمانة ووضوح ويسهل إجراءات الفحص والجامعة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/17c36KBqB3/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-18",
    name: "شركة الفنار للتوظيف",
    phone: "0237339488",
    address: "27 شارع مصدق، الدقي، الجيزة",
    description: "من الأسماء الرائدة تاريخيًا بمصر، التزام كامل ومصداقية لا متناهية ومقابلات على أعلى مستوى مع كبرى الإدارات التعليمية والطبية بالخليج.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1EvGtB9iRL/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-19",
    name: "شركة النخبة للتوظيف",
    phone: "01000667788",
    address: "مصر الجديدة، القاهرة",
    description: "شركة استشارية ممتازة لتوظيف الكفاءات بجميع تخصصات التعليم والقطاع الهندسي والصحة، رعاية ومساندة كاملة للمرشح في الفحص والتعاقد.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/16xYbfrvFV/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-20",
    name: "شركة أجادة للتوظيف",
    phone: "01122336699",
    address: "مدينة نصر، القاهرة",
    description: "مكتب عريق شعاره الإجادة والأمانة العملية، يقدم فرصًا متميزة للغاية بتعاقدات وتسهيلات رائعة تضمن راحة تامة طيلة فترة التواجد بالخارج.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1BvpQ6Dm6j/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-21",
    name: "شركة رويال للتوظيف",
    phone: "01055566677",
    address: "المعادي، القاهرة",
    description: "رويال للتوظيف، تلتزم بأعلى معايير المصداقية ولديهم تواصل وتعاون رائع لراحة المسافرين وضمان تنفيذ شروط الاتفاقية.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/14L9kYSx6PE/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-22",
    name: "شركة المجموعة الدولية للتوظيف",
    phone: "01288998811",
    address: "فيصل، الجيزة",
    description: "توفير كامل الدعم الفني والحرفي والمهني وسائقي النقل الثقيل والمبيعات بدقة ومصداقية وحسن تعامل مع كافة المرشحين.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1D7HGm8S28/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-23",
    name: "شركة دار الخبرة للتوظيف",
    phone: "01522330044",
    address: "مصر الجديدة، القاهرة",
    description: "أصحابها ناس أفاضل يتقون الله في شروط العقود والتعامل، رائدة في الكفاءات الهندسية ورعاية المشاريع وتسهيل أمور السفر.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/16K9ZRrjTy/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-24",
    name: "شركة سما جروب للتوظيف",
    phone: "01122446688",
    address: "المنيل، القاهرة",
    description: "إدارة محترمة ونسعى في توفير التسهيلات اللازمة والمقابلات العادلة للأخصائيين والمعلمين والتمريض بأمانة لا غبار عليها.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1BHt1hHkkX/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-25",
    name: "شركة شاشة للتوظيف",
    phone: "01022448800",
    address: "المهندسين، الجيزة",
    description: "صاحبة باقة متميزة من المقابلات وسرعة الفحص في السفر المباشر لكبرى كافيهات ومطاعم وفنادق ومجمعات وصيدليات الرياض والدمام.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1BWQ5Ys1AV/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-26",
    name: "شركة البكري للتوظيف",
    phone: "01233669911",
    address: "شبرا، القاهرة",
    description: "إدارة رائدة وصاحبة مصداقية تامة، يتابعون الشكاوى باحتراف وممتازين للتعاون مع الأطباء والصيادلة والمهندسين.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1Bokx8TfL7/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-27",
    name: "شركة وش السعد للتوظيف",
    phone: "01000443355",
    address: "وسط البلد، القاهرة",
    description: "من الأسماء المحترمة والشهيرة ولديهم دقة في تسهيل المعاملات وسجل ممتاز في إنجاح مقابلات السفر بكل أمانة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/16stAEsR9V/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-28",
    name: "شركة المواهب للتوظيف",
    phone: "01588772211",
    address: "الهرم، الجيزة",
    description: "مجموعات محترمة لتوفير كفاءات التشغيل واللوجستيات والمقاولات والسائقين والمطاعم مع ضمان الراتب والامتيازات كاملة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1BhF93W6do/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-29",
    name: "شركة غرناطة للتوظيف",
    phone: "01155442299",
    address: "الدقي، الجيزة",
    description: "مكتب غرناطة العريق يتميز برقي التعامل مع كافة الفئات والسرعة في تحضير المقابلات والتساهل التام مع المرشحين.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/14JUgnWctDQ/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-30",
    name: "شركة الهداية للتوظيف",
    phone: "01011554400",
    address: "شبرا، القاهرة",
    description: "إدارة فاضلة تخاف الله في العاملين وتعطي عقوداً ممتازة متطابقة في الراتب وتوفر سبل الراحة للمسافرين.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/18cVTsDaWp/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-31",
    name: "شركة دجلة للتوظيف",
    phone: "01211226699",
    address: "مصر الجديدة، القاهرة",
    description: "إحدى واجهات التوظيف المعتمدة لتقديم أفضل الهيئات والمقاولات في المنطقة مع الالتزام التام وحسن السمعة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1F2aHLX1qg/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-32",
    name: "شركة الأمراء للتوظيف",
    phone: "01000662211",
    address: "المعادي، القاهرة",
    description: "شركة رائعة ومعتمدة، تتعامل بأشد درجات الاحترافية في التوثيق والمتابعة الكاملة لضمان كرامة وحقوق المرشحين.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/14RmgB3BHab/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-33",
    name: "شركة الوجيه للتوظيف",
    phone: "01122003344",
    address: "شارع مصدق، الجيزة",
    description: "الوجيه للتوظيف توفر عقودًا تخصصية بالرياض وجدة بخطى سريعة ومصداقية تامة، ناس محترمين وأفاضل.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1Py8QDnan4/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-34",
    name: "شركة العماد للتوظيف",
    phone: "01022881144",
    address: "رمسيس، القاهرة",
    description: "تتميز العماد بالترتيب والصدق في الإعلان عن الوظائف، وتقدم دائماً تفاصيل العقد كاملة دون تزييف.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/173sDHiXh8/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-35",
    name: "شركة الباحة للتوظيف",
    phone: "01288442200",
    address: "المنيل، القاهرة",
    description: "مجموعات محترمة جدا وسجل حافل من ترحال المئات من المدرسين والمهندسين مع الحفاظ على الأمانة العملية والمصداقية.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/161NuDiEUJ/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-36",
    name: "شركة الرواد العرب للتوظيف",
    phone: "01155883300",
    address: "فيصل، الجيزة",
    description: "خبرة واسعة وسمعة ممتازة للتوظيف بالوطن العربي والشرق الأوسط، ناس متميزون في المقابلات وسرعة الفحص والتبادل.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/165PEHycqe/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-37",
    name: "شركة الخليجية للتوظيف",
    phone: "01033221199",
    address: "شبرا، القاهرة",
    description: "إدارة موثوقة ونبيلة، تحرص أشد الحرص على دقة البيانات وسلامة العقود وحماية حقوق العاملين من أطباء ومهندسين وسائقين.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/19qVFjcwba/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-38",
    name: "شركة الجازوي جروب للتوظيف",
    phone: "01522883322",
    address: "رمسيس، وسط البلد، القاهرة",
    description: "مجموعة الجازوي من مكاتب التوظيف الموثوقة جداً التي تتمتع بسمعة ذهبية وسرعة مميزة في إنجاز المقابلات وبأمانة تامة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1CjVjDQgbQ/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-39",
    name: "شركة برفكت للتوظيف",
    phone: "01211559900",
    address: "الدقي، الجيزة",
    description: "مجموعات برفكت توفر بيئة تواصل ممتازة مع المجموعات الخليجية، تتميز بتوافق معايير الجودة والاستشارات والوضوح التام للشروط والرواتب.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1Chu9F5968/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-40",
    name: "شركة الاتحاد الخليجي للتوظيف",
    phone: "01033446699",
    address: "المعادي، القاهرة",
    description: "صاحبة فروع متعددة وعلاقات ممتازة تخاف الله في المرشحين وتضمن وصول المرشح لوظيفته بجميع الحقوق المتفق عليها.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/18CdWdR5zR/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-41",
    name: "شركة الرياة للتوظيف",
    phone: "01122884400",
    address: "شارع الهرم، الجيزة",
    description: "إدارة محترمة للغاية وصاحبة مصداقية تامة، يتابعون الشكاوى باحتراف وممتازين للتعاون وتدقيق العقود الطبية والهندسية.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/17Wx7qoVxx/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-42",
    name: "شركة المستقبل الجديد للتوظيف",
    phone: "01511225588",
    address: "مصر الجديدة، القاهرة",
    description: "تتميز باحترافية كاملة وتسهيل جميع الإجراءات من فيش وفحص وجامعة، أصحابها ناس محترمين نوصي بهم وبشدة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1C41rpTCKc/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-43",
    name: "شركة ابن الدسوقي للتوظيف",
    phone: "01000223388",
    address: "شبرا، القاهرة",
    description: "مكتب عتيق وصاحب مصداقية، تعامل محترم من الإدارة ووضوح تام في العمولات والخطوات مع التزام قانوني صارم.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1Etno3SYtA/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-44",
    name: "شركة الصفا والمروة للتوظيف",
    phone: "01222448833",
    address: "وسط البلد، القاهرة",
    description: "تتمتع بسمعة ممتازة ومصداقية يشهد لها المئات من المعلمين والأطباء المسافرين عبر مقابلاتها النزيهة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1ATfjFihN3/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-45",
    name: "شركة دلة للتوظيف",
    phone: "01155991100",
    address: "حلوان، القاهرة",
    description: "مجموعات محترمة تهتم بمطابقة شروط السفر للرواتب وتسهل جميع أمور المرشحين بأعلى مستويات من الأمانة والسرعة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1BavvybuHj/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-46",
    name: "شركة حواس للتوظيف",
    phone: "01033228800",
    address: "الدقي، الجيزة",
    description: "تواصل ممتاز ومعاملات سريعة ودقيقة ومحترمة من الإدارة، ممتازة للبحث عن فرص حقيقية تضمن حقوق المسافر بشكل تام.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1BfucKi2be/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-47",
    name: "شركة الأحمدي للتوظيف",
    phone: "01211556622",
    address: "المهندسين، الجيزة",
    description: "توفير عقود متميزة للغاية، والالتزام بأعلى معايير المصداقية القانونية، وتواصل مع المرشح لضمان كافة المزايا المتفق عليها.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1BKpiNwS57/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-48",
    name: "شركة المختبر للتوظيف",
    phone: "01099663300",
    address: "رمسيس، القاهرة",
    description: "إدارة ملتزمة بكلمتها، سمعتهم ممتازة جدا ومشهود لهم في توظيف المهن الفنية والأخصائيين والمحاسبين بأعلى درجات النزاهة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/16EJ7tao6g/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-49",
    name: "شركة المهندس الدولية للتوظيف",
    phone: "01155882200",
    address: "الدقي، الجيزة",
    description: "إدارة محترمة ومطابقة لشروط الاستدامة، تتميز برعاية حقيقية ومصداقية تامة نوصي بها كافة المرشحين الباحثين عن فرص آمنة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1CeRi6rwSL/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-50",
    name: "شركة بيست فيوتشر للتوظيف",
    phone: "01011550099",
    address: "مدينة نصر، القاهرة",
    description: "بيست فيوتشر للتوظيف، يتابع أصحابها تيسير السفر وتأمين شروط العمل، محترمين وتواصلهم مستمر وسريع لراحة المرشحين.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/1AnZooXsdX/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-51",
    name: "شركة الرياض للتوظيف",
    phone: "01288550011",
    address: "الدقي، الجيزة",
    description: "صاحبة سجل متميز في إلحاق الكفاءات بمختلف القطاعات الطبية والهندسية والإدارية، وتعتبر من الشركات الموثوقة ذات الشهرة الواسعة.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/17SjsKDK9x/?mibextid=wwXIfr",
    trustedByOwner: true
  },
  {
    id: "agency-trusted-52",
    name: "شركة الجامعة للتوظيف",
    phone: "01000662288",
    address: "مصر الجديدة، القاهرة",
    description: "إدارة عريقة ممتازة تتميز بسلامة المعاملات والرواتب ومتابعة شروط العقود بكل احترام مع كافة جهات التوظيف بالخارج.",
    rating: 4.8,
    reviews: [],
    facebook: "https://www.facebook.com/share/17TgemCZN4/?mibextid=wwXIfr",
    trustedByOwner: true
  }
];

export function getStoredAgencies(): Agency[] {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(SEED_AGENCIES, null, 2), "utf-8");
      return SEED_AGENCIES;
    }

    const content = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading stored agencies database.", error);
    return SEED_AGENCIES;
  }
}

export function saveAgencies(agencies: Agency[]): void {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(agencies, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save agencies to disk.", error);
  }
}
