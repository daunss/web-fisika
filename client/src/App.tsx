import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { HudTop } from "./components/HudTop";
import { CanvasStage, type VehicleType } from "./components/CanvasStage";
import { Controls } from "./components/Controls";
import { LiveCharts } from "./components/LiveCharts";
import { ValidationPanel } from "./components/ValidationPanel";
import { PraktikumPanel, type ExperimentItem } from "./components/PraktikumPanel";
import { ComparisonPanel } from "./components/ComparisonPanel";
import { QuizPanel } from "./components/QuizPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { MobileFloatingDock, type TabKey } from "./components/MobileFloatingDock";
import { sound } from "./utils/audio";
import { API_BASE } from "./utils/config";

export const App: React.FC = () => {
  // --- Simulation State ---
  const [v, setV] = useState<number>(20); // Kecepatan konstan m/s
  const [s0, setS0] = useState<number>(0); // Posisi awal meter
  const [timeTarget, setTimeTarget] = useState<number>(30); // Durasi sekon
  const [timeCurrent, setTimeCurrent] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSlowMo, setIsSlowMo] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");

  // --- UI & Environment State ---
  const [activeTab, setActiveTab] = useState<TabKey>("simulator");
  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(true);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [experiments, setExperiments] = useState<ExperimentItem[]>([]);
  const [isLoadingExp, setIsLoadingExp] = useState<boolean>(false);

  const lastTimeRef = useRef<number>(performance.now());

  // Load Initial Practical Data
  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    setIsLoadingExp(true);
    try {
      const res = await fetch(`${API_BASE}/api/experiments`);
      const json = await res.json();
      if (json.data) setExperiments(json.data);
    } catch (e) {
      console.error("Gagal load experiments:", e);
    } finally {
      setIsLoadingExp(false);
    }
  };

  // Main Simulation Loop
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isRunning) {
        const speedMultiplier = isSlowMo ? 0.5 : 1.0;
        setTimeCurrent((prev) => {
          const next = prev + dt * speedMultiplier;
          if (next >= timeTarget) {
            setIsRunning(false);
            setIsFinished(true);
            sound.playSuccess();
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.6 },
              colors: ["#f6c453", "#4fc4a8", "#ef6f5e", "#5b8dd9"],
            });
            return timeTarget;
          }
          return next;
        });
      }

      animId = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [isRunning, isSlowMo, timeTarget]);

  // Controls Handlers
  const handleTogglePlay = () => {
    sound.playClick();
    if (!isRunning) {
      sound.playStart();
    }
    if (isFinished) {
      setTimeCurrent(0);
      setIsFinished(false);
    }
    lastTimeRef.current = performance.now();
    setIsRunning(!isRunning);
  };

  const handleStepForward = () => {
    if (isRunning) return;
    sound.playClick();
    setTimeCurrent((prev) => {
      const next = Math.min(timeTarget, prev + 0.5);
      if (next >= timeTarget) {
        setIsFinished(true);
        sound.playSuccess();
      }
      return next;
    });
  };

  const handleReset = () => {
    sound.playReset();
    setIsRunning(false);
    setIsFinished(false);
    setTimeCurrent(0);
  };

  const handleSaveSimulation = async () => {
    setIsSaving(true);
    sound.playClick();
    try {
      const res = await fetch(`${API_BASE}/api/simulations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `GLB [${vehicleType.toUpperCase()}] v=${v}m/s, t=${timeTarget}s`,
          v,
          s0,
          t: timeTarget,
          notes: `Wahana ${vehicleType.toUpperCase()} melaju dari s₀=${s0}m sejauh ${(v * timeTarget).toFixed(1)}m`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        sound.playSuccess();
        alert(`★ Data simulasi #${data.id} berhasil disimpan ke Riwayat!`);
      }
    } catch (e) {
      alert("Gagal menyimpan data simulasi.");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExperiment = async (exp: any) => {
    await fetch(`${API_BASE}/api/experiments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exp),
    });
    fetchExperiments();
  };

  const handleResetDefaults = async () => {
    await fetch(`${API_BASE}/api/experiments/reset-defaults`, { method: "POST" });
    fetchExperiments();
  };

  const handleDeleteExperiment = async (id: number) => {
    await fetch(`${API_BASE}/api/experiments/${id}`, { method: "DELETE" });
    fetchExperiments();
  };

  // Calculations
  const currentDistance = s0 + v * timeCurrent;
  const targetDistance = s0 + v * timeTarget;

  return (
    <div className="grid-paper-bg" style={{ minHeight: "100vh", position: "relative" }}>
      {/* Optional CRT Scanlines */}
      {scanlinesEnabled && <div className="scanlines-overlay" />}

      {/* Top Telemetry & Controls HUD */}
      <HudTop
        isRunning={isRunning}
        isFinished={isFinished}
        timeCurrent={timeCurrent}
        timeTarget={timeTarget}
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={() => {
          sound.playClick();
          setScanlinesEnabled(!scanlinesEnabled);
        }}
        isNightMode={isNightMode}
        onToggleNightMode={() => {
          sound.playClick();
          setIsNightMode(!isNightMode);
        }}
        sfxEnabled={sfxEnabled}
        onToggleSfx={() => setSfxEnabled(!sfxEnabled)}
      />

      <div className="app-container">
        {/* Navigation Tabs (Desktop view, hidden on mobile in favor of floating dock) */}
        <div className="pixel-tabs-wrapper desktop-tabs-nav">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("simulator");
            }}
            className={`pixel-tab-item ${activeTab === "simulator" ? "active" : ""}`}
            title="Tab 1: Simulator Visual & Grafik Realtime"
          >
            <img src="/pixel-icons/speedometer.png" alt="Speedometer" className="pixel-tab-icon" />
            <span>[ 01 ] SIMULATOR</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("validation");
            }}
            className={`pixel-tab-item ${activeTab === "validation" ? "active" : ""}`}
            title="Tab 2: Validasi Rumus GLB Komputasi vs Teori"
          >
            <img src="/pixel-icons/formula_book.png" alt="Formula" className="pixel-tab-icon" />
            <span>[ 02 ] RUMUS GLB</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("praktikum");
            }}
            className={`pixel-tab-item ${activeTab === "praktikum" ? "active" : ""}`}
            title="Tab 3: Data Praktikum Riil Produk 3 & Regresi Linier"
          >
            <img src="/pixel-icons/flask_lab.png" alt="Praktikum" className="pixel-tab-icon" />
            <span>[ 03 ] PRAKTIKUM</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("comparison");
            }}
            className={`pixel-tab-item ${activeTab === "comparison" ? "active" : ""}`}
            title="Tab 4: Komparasi 3 Pilar Kinematika"
          >
            <img src="/pixel-icons/scales_balance.png" alt="Komparasi" className="pixel-tab-icon" />
            <span>[ 04 ] 3 PILAR</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("quiz");
            }}
            className={`pixel-tab-item ${activeTab === "quiz" ? "active" : ""}`}
            title="Tab 5: Kuis Kilat Kinematika GLB"
          >
            <img src="/pixel-icons/quiz_box.png" alt="Kuis" className="pixel-tab-icon" />
            <span>[ 05 ] KUIS KILAT</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("history");
            }}
            className={`pixel-tab-item ${activeTab === "history" ? "active" : ""}`}
            title="Tab 6: Log Riwayat Simulasi"
          >
            <img src="/pixel-icons/floppy_disk.png" alt="Riwayat" className="pixel-tab-icon" />
            <span>[ 06 ] RIWAYAT</span>
          </button>
        </div>

        {/* TAB 1: SIMULATOR & GRAFIK REALTIME */}
        {activeTab === "simulator" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* 1. Main Canvas Stage (Visual 60 FPS Pixel Art Engine) */}
            <CanvasStage
              v={v}
              s0={s0}
              timeCurrent={timeCurrent}
              timeTarget={timeTarget}
              isRunning={isRunning}
              isNightMode={isNightMode}
              vehicleType={vehicleType}
              onSelectVehicle={setVehicleType}
              onReset={handleReset}
            />

            {/* 2. Cockpit Gauges Readout Banner with Pixel Art Badges */}
            <div className="grid-cockpit">
              {/* Odometer */}
              <div className="pixel-card pixel-card-accent-amber cockpit-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", textTransform: "uppercase" }}>ODOMETER REALTIME</span>
                  <img src="/pixel-icons/speedometer.png" alt="" style={{ width: "20px", height: "20px", objectFit: "contain", imageRendering: "pixelated" }} />
                </div>
                <div className="cockpit-val" style={{ color: "#f6c453" }}>
                  {currentDistance.toFixed(1)} <span style={{ fontSize: "0.95rem", color: "#e8e3d3" }}>METER</span>
                </div>
                <span style={{ fontSize: "0.85rem", color: "#8ea3c9", fontFamily: "var(--font-mono)" }}>Target: {targetDistance.toFixed(1)} m</span>
              </div>

              {/* Speedometer */}
              <div className="pixel-card pixel-card-accent-mint cockpit-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", textTransform: "uppercase" }}>SPEEDOMETER (v)</span>
                  <img src="/pixel-icons/logo.png" alt="" style={{ width: "20px", height: "20px", objectFit: "contain", imageRendering: "pixelated" }} />
                </div>
                <div className="cockpit-val" style={{ color: "#4fc4a8" }}>
                  {v.toFixed(1)} <span style={{ fontSize: "0.95rem", color: "#e8e3d3" }}>M/S</span>
                </div>
                <span style={{ fontSize: "0.85rem", color: "#4fc4a8", fontFamily: "var(--font-mono)" }}>KONSTAN MUTLAK ★</span>
              </div>

              {/* Accelerometer */}
              <div className="pixel-card pixel-card-accent-coral cockpit-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", textTransform: "uppercase" }}>PERCEPATAN (a)</span>
                  <img src="/pixel-icons/formula_book.png" alt="" style={{ width: "20px", height: "20px", objectFit: "contain", imageRendering: "pixelated" }} />
                </div>
                <div className="cockpit-val" style={{ color: "#ef6f5e" }}>
                  0.00 <span style={{ fontSize: "0.95rem", color: "#e8e3d3" }}>M/S²</span>
                </div>
                <span style={{ fontSize: "0.85rem", color: "#ef6f5e", fontFamily: "var(--font-mono)" }}>a = 0 (SYARAT GLB)</span>
              </div>

              {/* Stopwatch */}
              <div className="pixel-card cockpit-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", textTransform: "uppercase" }}>CHRONOMETER (t)</span>
                  <img src="/pixel-icons/flask_lab.png" alt="" style={{ width: "20px", height: "20px", objectFit: "contain", imageRendering: "pixelated" }} />
                </div>
                <div className="cockpit-val" style={{ color: "#fbf6e9" }}>
                  {timeCurrent.toFixed(1)} <span style={{ fontSize: "0.95rem", color: "#8ea3c9" }}>/ {timeTarget.toFixed(0)}s</span>
                </div>
                <span style={{ fontSize: "0.85rem", color: "#8ea3c9", fontFamily: "var(--font-mono)" }}>
                  Sisa: {Math.max(0, timeTarget - timeCurrent).toFixed(1)}s
                </span>
              </div>
            </div>

            {/* 3. Controls Panel (Sliders, Buttons, Presets, Tachometer Gauge) */}
            <Controls
              v={v}
              s0={s0}
              timeTarget={timeTarget}
              timeCurrent={timeCurrent}
              isRunning={isRunning}
              isSlowMo={isSlowMo}
              onSetV={setV}
              onSetS0={setS0}
              onSetTimeTarget={setTimeTarget}
              onTogglePlay={handleTogglePlay}
              onToggleSlowMo={() => {
                sound.playClick();
                setIsSlowMo(!isSlowMo);
              }}
              onStepForward={handleStepForward}
              onReset={handleReset}
              onSaveSimulation={handleSaveSimulation}
              isSaving={isSaving}
              vehicleType={vehicleType}
              onSelectVehicle={setVehicleType}
            />

            {/* 4. Dual Live Realtime Physics Charts */}
            <LiveCharts
              v={v}
              s0={s0}
              timeTarget={timeTarget}
              timeCurrent={timeCurrent}
            />
          </div>
        )}

        {/* TAB 2: VALIDASI RUMUS MATEMATIS */}
        {activeTab === "validation" && (
          <ValidationPanel v={v} s0={s0} timeTarget={timeTarget} />
        )}

        {/* TAB 3: PENGOLAH DATA PRAKTIKUM MANDIRI */}
        {activeTab === "praktikum" && (
          <PraktikumPanel
            experiments={experiments}
            onAddExperiment={handleAddExperiment}
            onResetDefaults={handleResetDefaults}
            onDeleteExperiment={handleDeleteExperiment}
            isLoading={isLoadingExp}
          />
        )}

        {/* TAB 4: MODUL ANALISIS KOMPARASI 3 PILAR */}
        {activeTab === "comparison" && <ComparisonPanel />}

        {/* TAB 5: KUIS KILAT KINEMATIKA GLB */}
        {activeTab === "quiz" && <QuizPanel />}

        {/* TAB 6: RIWAYAT SIMULASI SQLITE */}
        {activeTab === "history" && <HistoryPanel />}
      </div>

      {/* FLOATING MOBILE NAVIGATION DOCK & TACTILE QUICK ACTION FAB */}
      <MobileFloatingDock
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isRunning={isRunning}
        timeCurrent={timeCurrent}
        timeTarget={timeTarget}
        v={v}
        onTogglePlay={handleTogglePlay}
        onStepForward={handleStepForward}
        onReset={handleReset}
        currentDistance={currentDistance}
      />
    </div>
  );
};

export default App;
