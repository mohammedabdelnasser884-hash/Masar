import bcrypt from "bcryptjs";
import { db } from "./db.js";
import { getStoredJobs } from "./jobSource.js";

export interface UserProfile {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    website?: string;
  };
  experience: {
    id: string;
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  education: {
    id: string;
    institution: string;
    degree: string;
    duration: string;
  }[];
  projects: {
    id: string;
    title: string;
    description: string;
    technologies?: string;
  }[];
  languages: {
    id: string;
    name: string;
    level: string;
  }[];
  skills: string[];
  targetFields: string[];
  targetLocations: string[];
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  profile: UserProfile;
}

// ─── Row mapper ───────────────────────────────────────────────────
function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    profile: JSON.parse(row.profile_json),
  };
}

function findUserByEmail(email: string): User | undefined {
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim());
  return row ? rowToUser(row) : undefined;
}

// ─── 1. REGISTER ────────────────────────────────────────────────
export function registerUser(email: string, plainPassword: string, name: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const exists = findUserByEmail(normalizedEmail);
  if (exists) {
    return { success: false, message: "هذا البريد الإلكتروني مسجل بالفعل!" };
  }

  const defaultProfile: UserProfile = {
    personal: {
      name,
      title: "أخصائي / مهتم بوظائف جديدة",
      email: normalizedEmail,
      phone: "",
      location: "القاهرة, مصر",
      summary: "عضو جديد في منصة مسار. مهتم بالحصول على أفضل عروض التوظيف وتفصيل السيرة الذاتية بما يتناسب مع فلاتر شركات توظيف الخليج ومصر."
    },
    experience: [],
    education: [],
    projects: [],
    languages: [
      { id: "lang-default", name: "العربية", level: "اللغة الأم" }
    ],
    skills: ["التنظيم العملي", "حل المشكلات"],
    targetFields: ["إدارية", "محاسبة", "سوشيال ميديا"],
    targetLocations: ["القاهرة", "الرياض", "عن بعد"]
  };

  const passwordHash = bcrypt.hashSync(plainPassword, 10);
  const newUser: User = {
    id: `user-${Date.now()}`,
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
    profile: defaultProfile
  };

  db.prepare(`
    INSERT INTO users (id, email, password_hash, created_at, profile_json)
    VALUES (?, ?, ?, ?, ?)
  `).run(newUser.id, newUser.email, newUser.passwordHash, newUser.createdAt, JSON.stringify(newUser.profile));

  return { success: true, user: { id: newUser.id, email: newUser.email, profile: newUser.profile } };
}

// ─── 2. LOGIN ───────────────────────────────────────────────────
export function loginUser(email: string, plainPassword: string) {
  const candidate = findUserByEmail(email);
  const user = candidate && bcrypt.compareSync(plainPassword, candidate.passwordHash) ? candidate : undefined;

  if (!user) {
    return { success: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة!" };
  }

  return { success: true, user: { id: user.id, email: user.email, profile: user.profile } };
}

// ─── 3. GET PROFILE ─────────────────────────────────────────────
export function getProfile(email: string) {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, message: "لم يتم العثور على المستخدم!" };
  }
  return { success: true, profile: user.profile };
}

// ─── 4. UPDATE PROFILE ──────────────────────────────────────────
export function updateProfile(email: string, profile: UserProfile) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = findUserByEmail(normalizedEmail);

  if (!user) {
    return { success: false, message: "المستخدم غير موجود!" };
  }

  db.prepare("UPDATE users SET profile_json = ? WHERE email = ?")
    .run(JSON.stringify(profile), normalizedEmail);

  return { success: true, profile };
}

// ─── 5. MATCHED JOBS COMPILER ────────────────────────────────────
export async function getMatchedJobs(email: string) {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, message: "المستخدم غير موجود لعقد مطابقة!" };
  }

  const allJobs = await getStoredJobs();
  const profile = user.profile;

  const profileText = [
    profile.personal.title,
    profile.personal.summary,
    ...(profile.skills || []),
    ...(profile.targetFields || []),
  ].join(" ").toLowerCase();

  const scored = allJobs.map(job => {
    const jobText = `${job.title} ${job.description} ${job.company}`.toLowerCase();
    const words = jobText.split(/\s+/).filter(w => w.length > 3);
    const matched = words.filter(w => profileText.includes(w));
    let score = 35 + Math.min(55, Math.round((matched.length / Math.max(words.length, 1)) * 110));

    if (profile.targetLocations?.some(loc => job.location.includes(loc))) score += 5;
    if (job.type === "remote" && profile.targetLocations?.some(l => l.includes("عن بعد") || l.toLowerCase().includes("remote"))) score += 8;

    return { ...job, matchScore: Math.min(98, Math.max(25, score)) };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);

  return { success: true, jobs: scored.slice(0, 20) };
}
