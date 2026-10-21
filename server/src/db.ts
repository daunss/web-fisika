import { Database } from "bun:sqlite";
import { resolve } from "path";

const dbPath = resolve(import.meta.dir, "../fisika.db");
export const db = new Database(dbPath, { create: true });

// Aktifkan WAL mode untuk performa baca/tulis optimal
db.run("PRAGMA journal_mode = WAL;");

// Inisialisasi tabel
db.run(`
  CREATE TABLE IF NOT EXISTS simulations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    v REAL NOT NULL,
    s0 REAL NOT NULL,
    t REAL NOT NULL,
    s_final REAL NOT NULL,
    delta_s REAL NOT NULL,
    a_val REAL NOT NULL DEFAULT 0.0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS experiments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_no INTEGER NOT NULL,
    distance_s REAL NOT NULL,
    time_t1 REAL NOT NULL,
    time_t2 REAL NOT NULL,
    time_t3 REAL NOT NULL,
    time_avg REAL NOT NULL,
    v_calc REAL NOT NULL,
    v_theory REAL NOT NULL DEFAULT 0.25,
    error_pct REAL NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed data praktikum awal jika masih kosong (Sesuai Praktikum Mobil Mainan GLB)
const countExp = db.query("SELECT COUNT(*) as count FROM experiments").get() as { count: number };
if (countExp.count === 0) {
  seedDefaultExperiments();
}

export function seedDefaultExperiments() {
  db.run("DELETE FROM experiments;");
  const insert = db.prepare(`
    INSERT INTO experiments (test_no, distance_s, time_t1, time_t2, time_t3, time_avg, v_calc, v_theory, error_pct, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialData = [
    { test_no: 1, distance_s: 0.20, time_t1: 0.82, time_t2: 0.80, time_t3: 0.81, v_theory: 0.25, notes: "Lintasan 20 cm - Start awal stabil" },
    { test_no: 2, distance_s: 0.40, time_t1: 1.62, time_t2: 1.65, time_t3: 1.61, v_theory: 0.25, notes: "Lintasan 40 cm - Gerak konstan" },
    { test_no: 3, distance_s: 0.60, time_t1: 2.45, time_t2: 2.42, time_t3: 2.44, v_theory: 0.25, notes: "Lintasan 60 cm - Roda lurus tanpa slip" },
    { test_no: 4, distance_s: 0.80, time_t1: 3.26, time_t2: 3.23, time_t3: 3.28, v_theory: 0.25, notes: "Lintasan 80 cm - Laju linier stabil" },
    { test_no: 5, distance_s: 1.00, time_t1: 4.08, time_t2: 4.04, time_t3: 4.07, v_theory: 0.25, notes: "Lintasan 100 cm - Garis akhir meteran" },
  ];

  for (const item of initialData) {
    const time_avg = Number(((item.time_t1 + item.time_t2 + item.time_t3) / 3).toFixed(3));
    const v_calc = Number((item.distance_s / time_avg).toFixed(4));
    const error_pct = Number((Math.abs((v_calc - item.v_theory) / item.v_theory) * 100).toFixed(2));
    insert.run(item.test_no, item.distance_s, item.time_t1, item.time_t2, item.time_t3, time_avg, v_calc, item.v_theory, error_pct, item.notes);
  }
}
