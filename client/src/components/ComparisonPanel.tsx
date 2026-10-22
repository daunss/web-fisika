import React, { useEffect, useState } from "react";
import { CheckCircle2, FlaskConical, GitCompare, Lightbulb, Sigma } from "lucide-react";
import { apiGet } from "../utils/api";
import { num } from "../utils/format";
import { Badge, Card, CardHead, StateBlock } from "./ui";

interface ComparisonData {
  pillar_overview: {
    topic: string;
    velocity_theory_mps: number | null;
    velocity_simulation_mps: number | null;
    velocity_experiment_avg_mps: number | null;
    overall_error_percentage: number | null;
  };
  comparison_table: {
    test_no: number;
    time_avg_s: number | null;
    s_theory_m: number | null;
    s_simulation_m: number | null;
    s_experiment_m: number | null;
    error_percentage: number | null;
    notes: string;
  }[];
  scientific_discussion: string[];
}

function errorTone(value: number | null): "ok" | "warn" | "alert" | "muted" {
  if (value === null || !Number.isFinite(value)) return "muted";
  if (value < 2) return "ok";
  if (value < 5) return "warn";
  return "alert";
}

function errorLabel(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Belum dihitung";
  if (value < 2) return "Selisih kecil";
  if (value < 5) return "Selisih wajar";
  return "Perlu ditinjau";
}

export const ComparisonPanel: React.FC = () => {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    apiGet<ComparisonData>("/api/comparison")
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gagal memuat perbandingan.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card data-reveal>
        <div className="card-body">
          <StateBlock
            kind="loading"
            title="Memuat perbandingan tiga pilar"
            text="Menghimpun nilai teori, simulasi, dan praktikum dari server."
          />
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card accent="coral" data-reveal>
        <div className="card-body">
          <StateBlock
            kind="error"
            title="Data perbandingan tidak tersedia"
            text={error || "Server tidak mengembalikan data."}
          />
        </div>
      </Card>
    );
  }

  const overview = data.pillar_overview;
  const theory = overview.velocity_theory_mps;
  const simulation = overview.velocity_simulation_mps;
  const experiment = overview.velocity_experiment_avg_mps;
  const overallError = overview.overall_error_percentage;

  const deltaSimulation =
    theory !== null && simulation !== null ? Math.abs(simulation - theory) : null;
  const deltaExperiment =
    theory !== null && experiment !== null ? Math.abs(experiment - theory) : null;

  return (
    <div className="stack">
      <div className="panel-lead" data-reveal>
        <div className="panel-lead-text">
          <h2>Triangulasi tiga pilar kinematika</h2>
          <p>
            Satu besaran yang sama diukur dengan tiga cara berbeda: persamaan teori, simulasi
            komputer, dan praktikum dengan stopwatch. Selisih antar pilar menjadi bahan diskusi,
            bukan angka yang dipaksa nol.
          </p>
        </div>
        <div className="actions-row">
          <Badge tone={errorTone(overallError)}>
            {errorLabel(overallError)} · {num(overallError, 2)}%
          </Badge>
        </div>
      </div>

      <div className="triple">
        <Card accent="amber" data-reveal>
          <CardHead index="01" title="Teori analitis" icon={<Sigma size={15} />} meta={<span>a = 0</span>} />
          <div className="card-body">
            <div className="calc-formula is-core">{num(theory, 2)} m/s</div>
            <div className="calc-label" style={{ marginTop: "6px" }}>
              Kecepatan acuan
            </div>
            <p className="calc-note">
              Dari persamaan s = s₀ + v·t pada kondisi tanpa percepatan. Nilai ini menjadi
              pembanding tetap bagi dua pilar lainnya.
            </p>
          </div>
        </Card>

        <Card accent="mint" data-reveal>
          <CardHead
            index="02"
            title="Simulasi web"
            icon={<CheckCircle2 size={15} />}
            meta={<span>produk 1</span>}
          />
          <div className="card-body">
            <div className="calc-formula is-support">{num(simulation, 2)} m/s</div>
            <div className="calc-label" style={{ marginTop: "6px" }}>
              Selisih terhadap teori
            </div>
            <p className="calc-note">
              {deltaSimulation === null
                ? "Belum ada nilai pembanding."
                : `${num(deltaSimulation, 4)} m/s. Simulasi memakai rumus yang sama, jadi selisih yang tersisa menunjukkan galat pembulatan mesin.`}
            </p>
          </div>
        </Card>

        <Card data-reveal>
          <CardHead
            index="03"
            title="Praktikum nyata"
            icon={<FlaskConical size={15} />}
            meta={<span>produk 3</span>}
          />
          <div className="card-body">
            <div className="calc-formula">{num(experiment, 4)} m/s</div>
            <div className="calc-label" style={{ marginTop: "6px" }}>
              Selisih terhadap teori
            </div>
            <p className="calc-note">
              {deltaExperiment === null
                ? "Belum ada data pengukuran."
                : `${num(deltaExperiment, 4)} m/s. Selisih ini wajar muncul dari reaksi tangan saat menekan stopwatch dan gesekan permukaan lintasan.`}
            </p>
          </div>
        </Card>
      </div>

      <Card data-reveal>
        <CardHead
          index="04"
          title="Tabel perbandingan per uji"
          icon={<GitCompare size={15} />}
          meta={<span>{data.comparison_table.length} baris</span>}
        />
        {data.comparison_table.length === 0 ? (
          <div className="card-body">
            <StateBlock
              kind="empty"
              title="Belum ada baris perbandingan"
              text="Tambahkan data praktikum agar tabel ini terisi."
            />
          </div>
        ) : (
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap">
              <div className="table-hint">Geser tabel ke samping untuk melihat semua kolom</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Uji</th>
                    <th scope="col">t̄</th>
                    <th scope="col">s teori</th>
                    <th scope="col">s simulasi</th>
                    <th scope="col">s eksperimen</th>
                    <th scope="col">Galat</th>
                    <th scope="col">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.comparison_table.map((row) => {
                    const highError = row.error_percentage !== null && row.error_percentage >= 5;
                    return (
                      <tr key={row.test_no}>
                        <td className="is-num is-core">#{row.test_no}</td>
                        <td className="is-num">{num(row.time_avg_s, 3)} s</td>
                        <td className="is-num">{num(row.s_theory_m, 3)} m</td>
                        <td className="is-num is-support">{num(row.s_simulation_m, 3)} m</td>
                        <td className="is-num">{num(row.s_experiment_m, 2)} m</td>
                        <td className={`is-num ${highError ? "is-alert" : "is-dim"}`}>
                          {num(row.error_percentage, 2)}%
                        </td>
                        <td className="is-dim">{row.notes || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      <Card accent="mint" data-reveal>
        <CardHead
          index="05"
          title="Pembahasan sumber selisih"
          icon={<Lightbulb size={15} />}
          meta={<span>{data.scientific_discussion.length} poin</span>}
        />
        <div className="card-body">
          <div className="stack" style={{ gap: "8px" }}>
            {data.scientific_discussion.map((item, index) => (
              <div className="note is-support" key={index}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ComparisonPanel;
