import React, { useEffect, useRef, useState } from "react";
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
import { TabNav } from "./components/TabNav";
import { MobileDock } from "./components/MobileDock";
import { ToastHost, toast } from "./components/Toast";
import type { TabKey } from "./tabs";
import { sound } from "./utils/audio";
import { apiGet, apiSend } from "./utils/api";
import { num } from "./utils/format";
import { useSceneReveal } from "./utils/motion";

interface SimulationRecord {
  success: boolean;
  id: number;
}

interface ExperimentInput {
  test_no: number;
  distance_s: number;
  time_t1: number;
  time_t2: number;
  time_t3: number;
  v_theory?: number;
  notes?: string;
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan tak terduga.";
}

export const App: React.FC = () => {
  // --- state simulasi ---
  const [v, setV] = useState<number>(20);
  const [s0, setS0] = useState<number>(0);
  const [timeTarget, setTimeTarget] = useState<number>(30);
  const [timeCurrent, setTimeCurrent] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSlowMo, setIsSlowMo] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");

  // --- state antarmuka ---
  const [activeTab, setActiveTab] = useState<TabKey>("simulator");
  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(true);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [experiments, setExperiments] = useState<ExperimentItem[]>([]);
  const [isLoadingExp, setIsLoadingExp] = useState<boolean>(false);

  const lastTimeRef = useRef<number>(performance.now());
  const sceneRef = useSceneReveal(activeTab);

  const currentDistance = s0 + v * timeCurrent;
  const targetDistance = s0 + v * timeTarget;

  // --- data praktikum ---
  useEffect(() => {
    void fetchExperiments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchExperiments() {
    setIsLoadingExp(true);
    try {
      const json = await apiGet<{ success: boolean; count: number; data: ExperimentItem[] }>(
        "/api/experiments"
      );
      setExperiments(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      toast(describe(error), "error");
    } finally {
      setIsLoadingExp(false);
    }
  }

  // --- loop waktu ---
  useEffect(() => {
    let animId = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.1, Math.max(0, (now - lastTimeRef.current) / 1000));
      lastTimeRef.current = now;

      if (isRunning) {
        const speedMultiplier = isSlowMo ? 0.5 : 1;
        setTimeCurrent((prev) => Math.min(timeTarget, prev + dt * speedMultiplier));
      }

      animId = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [isRunning, isSlowMo, timeTarget]);

  // Selesai tepat satu kali saat waktu menyentuh target.
  useEffect(() => {
    if (!isRunning || timeCurrent < timeTarget) return;
    setIsRunning(false);
    setIsFinished(true);
    sound.playSuccess();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#f6c453", "#4fc4a8", "#ef6f5e"],
    });
  }, [isRunning, timeCurrent, timeTarget]);

  // --- kendali simulasi ---
  const handleTogglePlay = () => {
    sound.playClick();
    if (!isRunning) sound.playStart();
    if (isFinished || timeCurrent >= timeTarget) {
      setTimeCurrent(0);
      setIsFinished(false);
    }
    lastTimeRef.current = performance.now();
    setIsRunning((prev) => !prev);
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
      const result = await apiSend<SimulationRecord>("/api/simulations", "POST", {
        name: `GLB ${vehicleType} v=${v} m/s t=${timeTarget} s`,
        v,
        s0,
        t: timeTarget,
        notes: `Wahana ${vehicleType} dari s₀=${s0} m sejauh ${(v * timeTarget).toFixed(1)} m`,
      });
      sound.playSuccess();
      toast(`Simulasi #${result.id} tersimpan di Riwayat.`, "ok");
    } catch (error) {
      toast(describe(error), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExperiment = async (exp: ExperimentInput) => {
    try {
      await apiSend("/api/experiments", "POST", exp);
      await fetchExperiments();
      toast("Hasil pengukuran ditambahkan.", "ok");
    } catch (error) {
      toast(describe(error), "error");
      throw error;
    }
  };

  const handleResetDefaults = async () => {
    try {
      await apiSend("/api/experiments/reset-defaults", "POST");
      await fetchExperiments();
      toast("Data praktikum dikembalikan ke set awal.", "info");
    } catch (error) {
      toast(describe(error), "error");
    }
  };

  const handleDeleteExperiment = async (id: number) => {
    try {
      await apiSend(`/api/experiments/${id}`, "DELETE");
      await fetchExperiments();
      toast("Baris pengukuran dihapus.", "info");
    } catch (error) {
      toast(describe(error), "error");
    }
  };

  const handleSelectTab = (tab: TabKey) => {
    if (tab === activeTab) return;
    sound.playClick();
    setActiveTab(tab);
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>

      {scanlinesEnabled && <div className="scanlines" aria-hidden="true" />}

      <HudTop
        isRunning={isRunning}
        isFinished={isFinished}
        timeCurrent={timeCurrent}
        timeTarget={timeTarget}
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={() => {
          sound.playClick();
          setScanlinesEnabled((prev) => !prev);
        }}
        isNightMode={isNightMode}
        onToggleNightMode={() => {
          sound.playClick();
          setIsNightMode((prev) => !prev);
        }}
        sfxEnabled={sfxEnabled}
        onToggleSfx={() => setSfxEnabled((prev) => !prev)}
      />

      <main className="shell" id="main">
        <TabNav activeTab={activeTab} onSelect={handleSelectTab} />

        <div className="scene" ref={sceneRef}>
          {activeTab === "simulator" && (
            <div className="sim-grid">
              <div className="sim-visual">
                <div data-reveal>
                  <CanvasStage
                    v={v}
                    s0={s0}
                    timeCurrent={timeCurrent}
                    timeTarget={timeTarget}
                    isRunning={isRunning}
                    isNightMode={isNightMode}
                    vehicleType={vehicleType}
                    onSelectVehicle={setVehicleType}
                  />
                </div>

                <div className="telemetry" data-reveal>
                  <div className="tel-cell">
                    <span className="tel-label">Odometer</span>
                    <span className="tel-value is-core">
                      {num(currentDistance, 1)}
                      <span className="tel-unit">m</span>
                    </span>
                    <span className="tel-note">Target {num(targetDistance, 1)} m</span>
                  </div>

                  <div className="tel-cell">
                    <span className="tel-label">Kecepatan (v)</span>
                    <span className="tel-value">
                      {num(v, 1)}
                      <span className="tel-unit">m/s</span>
                    </span>
                    <span className="tel-note">Konstan sepanjang lintasan</span>
                  </div>

                  <div className="tel-cell">
                    <span className="tel-label">Percepatan (a)</span>
                    <span className="tel-value is-support">
                      0,00
                      <span className="tel-unit">m/s²</span>
                    </span>
                    <span className="tel-note">Syarat GLB terpenuhi</span>
                  </div>

                  <div className="tel-cell">
                    <span className="tel-label">Kronometer (t)</span>
                    <span className="tel-value">
                      {num(timeCurrent, 1)}
                      <span className="tel-unit">/ {num(timeTarget, 0)} s</span>
                    </span>
                    <span className="tel-note">
                      Sisa {num(Math.max(0, timeTarget - timeCurrent), 1)} s
                    </span>
                  </div>
                </div>
              </div>

              <div className="sim-console" data-reveal>
                <Controls
                  v={v}
                  s0={s0}
                  timeTarget={timeTarget}
                  timeCurrent={timeCurrent}
                  isRunning={isRunning}
                  isSlowMo={isSlowMo}
                  isSaving={isSaving}
                  vehicleType={vehicleType}
                  onSetV={setV}
                  onSetS0={setS0}
                  onSetTimeTarget={setTimeTarget}
                  onTogglePlay={handleTogglePlay}
                  onToggleSlowMo={() => {
                    sound.playClick();
                    setIsSlowMo((prev) => !prev);
                  }}
                  onStepForward={handleStepForward}
                  onReset={handleReset}
                  onSaveSimulation={handleSaveSimulation}
                  onSelectVehicle={setVehicleType}
                />
              </div>

              <div className="sim-charts" data-reveal>
                <LiveCharts v={v} s0={s0} timeTarget={timeTarget} timeCurrent={timeCurrent} />
              </div>
            </div>
          )}

          {activeTab === "validation" && (
            <ValidationPanel v={v} s0={s0} timeTarget={timeTarget} />
          )}

          {activeTab === "praktikum" && (
            <PraktikumPanel
              experiments={experiments}
              onAddExperiment={handleAddExperiment}
              onResetDefaults={handleResetDefaults}
              onDeleteExperiment={handleDeleteExperiment}
              isLoading={isLoadingExp}
            />
          )}

          {activeTab === "comparison" && <ComparisonPanel />}

          {activeTab === "quiz" && <QuizPanel />}

          {activeTab === "history" && <HistoryPanel />}
        </div>
      </main>

      <MobileDock
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isRunning={isRunning}
        timeCurrent={timeCurrent}
        timeTarget={timeTarget}
        v={v}
        onTogglePlay={handleTogglePlay}
        onStepForward={handleStepForward}
        onReset={handleReset}
        currentDistance={currentDistance}
      />

      <ToastHost />
    </div>
  );
};

export default App;
