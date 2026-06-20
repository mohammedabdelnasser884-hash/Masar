/**
 * apiClient.ts
 * ─────────────────────────────────────────────
 * Wrapper موحّد حول fetch يضيف Authorization header تلقائيًا
 * من localStorage، ويوحّد معالجة الأخطاء (401 خاصة).
 *
 * الهدف: بعد تأمين السيرفر (requireAuth على endpoints الـ AI)،
 * كل نداء API بيحتاج التوكن. بدل تكرار الكود في كل مكوّن،
 * نمرّ من هنا مرة واحدة.
 */

const TOKEN_KEY = "masar_token";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export interface ApiFetchOptions extends RequestInit {
  /** لو true، الطلب يفشل بدون رمي خطأ لو مفيش توكن (نادر الاستخدام) */
  skipAuthRequired?: boolean;
}

export class ApiAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiAuthError";
  }
}

/**
 * نداء API موحّد:
 * - يضيف Content-Type: application/json تلقائيًا
 * - يضيف Authorization: Bearer <token> تلقائيًا لو موجود
 * - يرمي ApiAuthError واضح عند 401 بدل ما الكود المستدعي يحلل response.ok بنفسه
 */
export async function apiFetch(url: string, options: ApiFetchOptions = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // التوكن منتهي أو غير موجود — ننظف الجلسة المحلية
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("masar_active_user");
    } catch {
      /* noop */
    }
    throw new ApiAuthError("جلستك منتهية، يرجى تسجيل الدخول مرة أخرى.");
  }

  return response;
}

/** نسخة مختصرة: نداء وإرجاع JSON مباشرة + رمي خطأ واضح عند فشل الشبكة */
export async function apiFetchJson<T = any>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await apiFetch(url, options);
  } catch (err) {
    if (err instanceof ApiAuthError) throw err;
    throw new Error("تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.");
  }

  if (response.status === 413) {
    throw new Error("حجم الملف كبير جدًا. يرجى رفع ملف أصغر من 10 ميجابايت.");
  }
  if (response.status === 429) {
    throw new Error("لقد تجاوزت الحد المسموح من الطلبات. يرجى الانتظار قليلاً والمحاولة لاحقًا.");
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error("استجابة غير متوقعة من الخادم.");
  }

  if (!response.ok && data?.success === false) {
    throw new Error(data.message || "حدث خطأ غير متوقع.");
  }

  return data as T;
}
