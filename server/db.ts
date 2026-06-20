import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "masar.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// ─── Single shared connection ────────────────────────────────────
export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL"); // better concurrent read/write performance

// ─── Schema ───────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    profile_json TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

  CREATE TABLE IF NOT EXISTS agencies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    description TEXT,
    image TEXT,
    data_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS agency_reviews (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    date TEXT NOT NULL,
    FOREIGN KEY (agency_id) REFERENCES agencies(id)
  );

  CREATE TABLE IF NOT EXISTS jobs_cache (
    id TEXT PRIMARY KEY,
    data_json TEXT NOT NULL,
    cached_at INTEGER NOT NULL
  );
`);

console.log("✅ SQLite database ready at", DB_PATH);

// ─── Migration helper: import legacy JSON files if they exist ────
export function migrateFromJsonIfNeeded() {
  const usersJsonPath = path.join(DB_DIR, "users.json");
  const usersCount = (db.prepare("SELECT COUNT(*) as c FROM users").get() as any).c;

  if (usersCount === 0 && fs.existsSync(usersJsonPath)) {
    try {
      const legacyUsers = JSON.parse(fs.readFileSync(usersJsonPath, "utf-8"));
      if (Array.isArray(legacyUsers) && legacyUsers.length > 0) {
        const insert = db.prepare(`
          INSERT OR IGNORE INTO users (id, email, password_hash, created_at, profile_json)
          VALUES (?, ?, ?, ?, ?)
        `);
        const tx = db.transaction((rows: any[]) => {
          for (const u of rows) {
            // Skip legacy plaintext passwords — force re-registration for security
            if (u.passwordHash && u.passwordHash.length < 20) continue; // plaintext, not bcrypt hash
            insert.run(u.id, u.email, u.passwordHash, u.createdAt, JSON.stringify(u.profile));
          }
        });
        tx(legacyUsers);
        console.log(`✅ Migrated ${legacyUsers.length} users from legacy JSON (skipped insecure plaintext entries)`);
      }
    } catch (err) {
      console.warn("⚠️ Legacy migration skipped:", (err as Error).message);
    }
  }
}
