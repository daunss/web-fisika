import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import { db, seedDefaultExperiments } from "./db";
import { existsSync } from "fs";
import { resolve } from "path";

const PORT = Number(process.env.PORT || process.env.BACKEND_PORT) || 3000;
const HOST = process.env.HOST || process.env.BACKEND_HOST || "0.0.0.0";
const clientDistPath = process.env.CLIENT_DIST_PATH
  ? resolve(process.cwd(), process.env.CLIENT_DIST_PATH)
  : resolve(import.meta.dir, "../../client/dist");
const corsOrigin = process.env.CORS_ORIGIN === "*" ? true : (process.env.CORS_ORIGIN || true);

const app = new Elysia()
  .use(
    cors({
      origin: corsOrigin,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "API Simulasi Fisika GLB & Praktikum",
          version: "1.0.0",
          description: "REST API untuk Simulasi Gerak Lurus Beraturan (GLB) & Pengolahan Data Praktikum Fisika Dasar",
        },
        tags: [
          { name: "Simulation", description: "Penyimpanan dan riwayat run simulasi komputer" },
          { name: "Experiment", description: "Pengambilan data nyata praktikum fisika sederhana" },
          { name: "Comparison", description: "Analisis komparasi 3 pilar: Teori, Simulasi, dan Eksperimen" },
        ],
      },
    })
  )


  // Health check
  .get("/api/health", () => ({
    status: "online",
    timestamp: new Date().toISOString(),
    runtime: "Bun " + Bun.version,
    framework: "Elysia.js",
    database: "SQLite (Native bun:sqlite)",
    theme: "Pixel GLB Sci-Fi",
  }))

  // --- SIMULATION ROUTES ---
  .get("/api/simulations", () => {
    const rows = db.query("SELECT * FROM simulations ORDER BY id DESC LIMIT 50").all();
    return { success: true, count: rows.length, data: rows };
  })

  .post(
    "/api/simulations",
    ({ body }) => {
      const { name, v, s0, t: duration, notes } = body;
      const s_final = Number((s0 + v * duration).toFixed(4));
      const delta_s = Number((v * duration).toFixed(4));
      const a_val = 0.0;

      const stmt = db.prepare(`
        INSERT INTO simulations (name, v, s0, t, s_final, delta_s, a_val, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(name || `GLB v=${v}m/s`, v, s0, duration, s_final, delta_s, a_val, notes || "");

      return {
        success: true,
        message: "Data simulasi berhasil disimpan ke SQLite",
        id: info.lastInsertRowid,
        calculation: {
          formula: "s = s0 + (v * t)",
          steps: `${s0} + (${v} * ${duration}) = ${s_final} meter`,
          delta_s: `${delta_s} meter`,
          acceleration: "a = 0 m/s² (Kecepatan Konstan)",
        },
      };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        v: t.Number(),
        s0: t.Number(),
        t: t.Number(),
        notes: t.Optional(t.String()),
      }),
    }
  )

  .delete("/api/simulations/:id", ({ params }) => {
    const id = Number(params.id);
    db.run("DELETE FROM simulations WHERE id = ?", [id]);
    return { success: true, message: `Simulasi #${id} berhasil dihapus` };
  })

  // --- EXPERIMENT (PRAKTIKUM) ROUTES ---
  .get("/api/experiments", () => {
    const rows = db.query("SELECT * FROM experiments ORDER BY distance_s ASC").all();
    return { success: true, count: rows.length, data: rows };
  })

  .post(
    "/api/experiments",
    ({ body }) => {
      const { test_no, distance_s, time_t1, time_t2, time_t3, v_theory = 0.25, notes } = body;
      const time_avg = Number(((time_t1 + time_t2 + time_t3) / 3).toFixed(3));
      const v_calc = Number((distance_s / time_avg).toFixed(4));
      const error_pct = Number((Math.abs((v_calc - v_theory) / v_theory) * 100).toFixed(2));

      const stmt = db.prepare(`
        INSERT INTO experiments (test_no, distance_s, time_t1, time_t2, time_t3, time_avg, v_calc, v_theory, error_pct, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(test_no, distance_s, time_t1, time_t2, time_t3, time_avg, v_calc, v_theory, error_pct, notes || "");

      return {
        success: true,
        message: "Data praktikum berhasil dicatat",
        id: info.lastInsertRowid,
        time_avg,
        v_calc,
        error_pct,
      };
    },
    {
      body: t.Object({
        test_no: t.Number(),
        distance_s: t.Number(),
        time_t1: t.Number(),
        time_t2: t.Number(),
        time_t3: t.Number(),
        v_theory: t.Optional(t.Number()),
        notes: t.Optional(t.String()),
      }),
    }
  )

  .post("/api/experiments/reset-defaults", () => {
    seedDefaultExperiments();
    const rows = db.query("SELECT * FROM experiments ORDER BY distance_s ASC").all();
    return { success: true, message: "Dataset praktikum berhasil direset ke nilai default", data: rows };
  })

  .delete("/api/experiments/:id", ({ params }) => {
    const id = Number(params.id);
    db.run("DELETE FROM experiments WHERE id = ?", [id]);
    return { success: true, message: `Data praktikum #${id} berhasil dihapus` };
  })

  // --- COMPARISON OF 3 PILLARS (PANDUAN PBL BAGIAN I) ---
  .get("/api/comparison", () => {
    const experiments = db.query("SELECT * FROM experiments ORDER BY distance_s ASC").all() as any[];
    
    // Hitung rata-rata kecepatan eksperimen
    const total_v_exp = experiments.reduce((acc, row) => acc + row.v_calc, 0);
    const avg_v_exp = experiments.length > 0 ? Number((total_v_exp / experiments.length).toFixed(4)) : 0.25;
    const v_theory = experiments.length > 0 ? experiments[0].v_theory : 0.25;
    const overall_error = Number((Math.abs((avg_v_exp - v_theory) / v_theory) * 100).toFixed(2));

    const comparisonTable = experiments.map((exp) => {
      // Waktu rata-rata
      const t = exp.time_avg;
      const s_theory = Number((v_theory * t).toFixed(3));
      const s_sim = s_theory; // Simulasi tepat sesuai rumus
      const s_exp = exp.distance_s;
      const delta_error = Number((Math.abs(s_exp - s_theory) / s_theory * 100).toFixed(2));

      return {
        test_no: exp.test_no,
        time_avg_s: t,
        s_theory_m: s_theory,
        s_simulation_m: s_sim,
        s_experiment_m: s_exp,
        error_percentage: delta_error,
        notes: exp.notes,
      };
    });

    return {
      success: true,
      pillar_overview: {
        topic: "Gerak Lurus Beraturan (GLB)",
        velocity_theory_mps: v_theory,
        velocity_simulation_mps: v_theory,
        velocity_experiment_avg_mps: avg_v_exp,
        overall_error_percentage: overall_error,
      },
      comparison_table: comparisonTable,
      scientific_discussion: [
        "1. Persamaan Teori (s = v * t) dan Simulasi Komputasi memberikan hasil identik dengan galat 0% karena keduanya bekerja pada kondisi ideal tanpa hambatan eksternal.",
        "2. Terdapat deviasi kecil antara data Eksperimen Riil dengan Teori/Simulasi (rata-rata galat ~1-3%).",
        "3. Faktor penyebab deviasi: (a) Gaya gesekan kinetik antara roda mobil mainan dengan permukaan lintasan, (b) Kemiringan bidang lantai yang mungkin tidak persis 0 derajat, (c) Keterbatasan waktu reaksi manusia (reaction time delay 0.1-0.2 detik) saat memicu tombol stopwatch, (d) Penurunan tegangan baterai mobil secara bertahap.",
      ],
    };
  })

  // --- EXPORT DATA ROUTE ---
  .get("/api/export", () => {
    const simulations = db.query("SELECT * FROM simulations").all();
    const experiments = db.query("SELECT * FROM experiments").all();
    return {
      metadata: {
        project: "Project-Based Learning Fisika Dasar - Program Studi Informatika",
        topic: "Kinematika: Gerak Lurus Beraturan (GLB)",
        exported_at: new Date().toISOString(),
      },
      simulations,
      experiments,
    };
  });

// Serve frontend dist jika file sudah di-build
if (existsSync(clientDistPath)) {
  app.use(staticPlugin({ assets: clientDistPath, prefix: "/" }));
  app.get("/", () => Bun.file(resolve(clientDistPath, "index.html")));
}

app.listen({ port: PORT, hostname: HOST }, () => {
  const displayHost = HOST === "0.0.0.0" ? "localhost" : HOST;
  console.log(`🚀 Server Fisika GLB (Elysia + SQLite) menyala di: http://${displayHost}:${PORT}`);
  console.log(`📑 Dokumentasi Swagger API aktif di: http://${displayHost}:${PORT}/swagger`);
});

