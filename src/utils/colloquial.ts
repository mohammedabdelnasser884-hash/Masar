/**
 * Colloquial Arabic mapping utility
 * Normalizes Egyptian and Gulf dialect terms to classic search terms
 */

export const COLLOQUIAL_MAP: Record<string, string> = {
  "شغلانة": "وظيفة",
  "شغلانات": "وظائف",
  "شغل": "وظائف",
  "عاوز شغل": "وظائف",
  "عايز شغل": "وظائف",
  "بدور على شغل": "وظائف",
  "مرتب": "راتب",
  "مرتبات": "رواتب",
  "فلوس": "رواتب",
  "شغلانة جدة": "وظائف جدة",
  "شغل جدة": "وظائف جدة",
  "شغلانة الرياض": "وظائف الرياض",
  "شغلانة بمصر": "وظائف بمصر",
  "شغلانة القاهرة": "وظائف القاهرة",
  
  // Specific professional mappings requested & common:
  "محاسب قطر": "محاسبة قطر",
  "مهندس قطر": "هندسة قطر",
  "محاسب دبي": "محاسبة دبي",
  "محاسب جدة": "محاسبة جدة",
  "دكتور": "طبيب",
  "سيلز": "مبيعات",
  "سيلز اوت دور": "مبيعات خارجية",
  "كول سنتر": "خدمة عملاء",
  "تلي سيلز": "تسويق هاتفي",
  "اتش ار": "موارد بشرية",
  "ديزاينر": "مصمم",
  "بروجرامر": "مبرمج",
  "شغل من البيت": "عن بعد",
  "شغل اونلاين": "عن بعد",
  "شغل عن بعد": "عن بعد",
  "حضوري": "موقع العمل",
  "رخص": "ترخيص",
  "سير في": "سيرة ذاتية",
  "سي في": "سيرة ذاتية",
};

/**
 * Normalizes colloquial inputs to standard job search queries
 */
export function normalizeSearchQuery(query: string): string {
  if (!query) return "";
  let normalized = query.trim().toLowerCase();

  // Basic cleaning (Arabic diacritics/different alphabets)
  normalized = normalized
    .replace(/[ًٌٍَُِّْ]/g, "") // Remove Al-Harakat (diacritics)
    .replace(/[أإآ]/g, "ا")     // Normalize Alifs
    .replace(/ة\b/g, "ه")       // Normalize Ta-marbuta to Ha (often typed interchangeably)
    .replace(/ى\b/g, "ي");      // Normalize Alif-maqsura to Ya

  // Check exact phrases first
  for (const [colloquial, standard] of Object.entries(COLLOQUIAL_MAP)) {
    const normalizedColloquial = colloquial
      .replace(/[أإآ]/g, "ا")
      .replace(/ة\b/g, "ه")
      .replace(/ى\b/g, "ي");

    if (normalized === normalizedColloquial) {
      return standard;
    }
  }

  // Split string and replace words
  const words = normalized.split(/\s+/);
  const mappedWords = words.map(word => {
    for (const [colloquial, standard] of Object.entries(COLLOQUIAL_MAP)) {
      const normalizedColloquial = colloquial
        .replace(/[أإآ]/g, "ا")
        .replace(/ة\b/g, "ه")
        .replace(/ى\b/g, "ي");
      
      if (word === normalizedColloquial) {
        return standard;
      }
    }
    return word;
  });

  // Reconstruct phrasing or resolve specific patterns
  let finalQuery = mappedWords.join(" ");

  // Handle specific dynamic transformations, e.g. "شغلانة [مدينة]" -> "وظائف [مدينة]"
  finalQuery = finalQuery
    .replace(/شغلانه\s+/g, "وظائف ")
    .replace(/شغل\s+/g, "وظائف ")
    .replace(/مرتب\s+/g, "راتب ")
    .replace(/محاسب\s+قاهره/g, "محاسبه القاهره")
    .replace(/محاسب\s+جده/g, "محاسبه جده")
    .replace(/محاسب\s+قطر/g, "محاسبه قطر");

  return finalQuery;
}
