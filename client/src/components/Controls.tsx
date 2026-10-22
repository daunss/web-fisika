import React from "react";
import { FastForward, Gauge, Pause, Play, RotateCcw, Save } from "lucide-react";
import { sound } from "../utils/audio";
import { num } from "../utils/format";
import { Card, CardHead } from "./ui";
import { RetroGauge } from "./RetroGauge";
import type { VehicleType } from "./CanvasStage";

interface Preset {
  key: string;
  name: string;
  detail: string;
  v: number;
  s0: number;
  t: number;
  vehicle: VehicleType;
}

const PRESETS: Preset[] = [
  { key: "video", name: "Kasus video", detail: "v 20 · t 30 s", v: 20, s0: 0, t: 30, vehicle: "car" },
  { key: "maglev", name: "Maglev kota", detail: "v 80 · t 15 s", v: 80, s0: 0, t: 15, vehicle: "train" },
  { key: "probe", name: "Probe angkasa", detail: "v 150 · t 20 s", v: 150, s0: 0, t: 20, vehicle: "probe" },
  { key: "lab", name: "Troli lab", detail: "v 0,25 · t 4 s", v: 0.25, s0: 0, t: 4, vehicle: "lab" },
  { key: "offset", name: "Offset awal", detail: "s₀ 50 m", v: 15, s0: 50, t: 20, vehicle: "car" },
];

interface ControlsProps {
  v: number;
  s0: number;
  timeTarget: number;
  timeCurrent: number;
  isRunning: boolean;
  isSlowMo: boolean;
  isSaving: boolean;
  vehicleType: VehicleType;
  onSetV: (v: number) => void;
  onSetS0: (s0: number) => void;
  onSetTimeTarget: (t: number) => void;
  onTogglePlay: () => void;
  onToggleSlowMo: () => void;
  onStepForward: () => void;
  onReset: () => void;
  onSaveSimulation: () => void;
  onSelectVehicle: (type: VehicleType) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  v,
  s0,
  timeTarget,
  timeCurrent,
  isRunning,
  isSlowMo,
  isSaving,
  vehicleType,
  onSetV,
  onSetS0,
  onSetTimeTarget,
  onTogglePlay,
  onToggleSlowMo,
  onStepForward,
  onReset,
  onSaveSimulation,
  onSelectVehicle,
}) => {
  const applyPreset = (preset: Preset) => {
    sound.playClick();
    onReset();
    onSetV(preset.v);
    onSetS0(preset.s0);
    onSetTimeTarget(preset.t);
    onSelectVehicle(preset.vehicle);
  };

  const isPresetActive = (preset: Preset) =>
    preset.v === v && preset.s0 === s0 && preset.t === timeTarget && preset.vehicle === vehicleType;

  const deltaS = v * timeTarget;

  return (
    <Card accent="amber" className="console">
      <CardHead
        index="02"
        title="Panel kontrol"
        icon={<Gauge size={15} />}
        meta={<span>{isSlowMo ? "0,5× lambat" : "1,0× waktu nyata"}</span>}
      />

      <div className="card-body">
        <div className="console-actions">
          <button
            type="button"
            className={`btn btn-primary btn-block ${isRunning ? "is-running" : ""}`}
            onClick={onTogglePlay}
          >
            {isRunning ? <Pause size={15} /> : <Play size={15} />}
            {isRunning ? "Jeda simulasi" : timeCurrent > 0 ? "Lanjutkan" : "Mulai simulasi"}
          </button>

          <button
            type="button"
            className={`btn btn-sm ${isSlowMo ? "btn-active" : ""}`}
            aria-pressed={isSlowMo}
            onClick={onToggleSlowMo}
            title="Jalankan waktu simulasi setengah kecepatan"
          >
            <FastForward size={13} /> Lambat
          </button>

          <button
            type="button"
            className="btn btn-sm"
            disabled={isRunning || timeCurrent >= timeTarget}
            onClick={onStepForward}
            title="Maju 0,5 sekon saat simulasi berhenti"
          >
            +0,5 s
          </button>

          <button
            type="button"
            className="btn btn-sm btn-support"
            disabled={isSaving}
            onClick={onSaveSimulation}
            title="Simpan running ini ke riwayat"
          >
            <Save size={13} /> {isSaving ? "Menyimpan" : "Simpan"}
          </button>

          <button type="button" className="btn btn-sm btn-danger" onClick={onReset}>
            <RotateCcw size={13} /> Reset
          </button>
        </div>

        <div className="gauge-row">
          <RetroGauge value={v} max={160} size={92} label="Laju v" unit="m/s" />
          <div className="gauge-facts">
            <div className="fact">
              <span className="fact-label">Kecepatan</span>
              <span className="fact-value">
                {num(v, 1)} <span>m/s</span>
              </span>
            </div>
            <div className="fact">
              <span className="fact-label">Percepatan</span>
              <span className="fact-value">
                0,00 <span>m/s²</span>
              </span>
            </div>
            <div className="fact">
              <span className="fact-label">Perpindahan target</span>
              <span className="fact-value">
                {num(deltaS, 1)} <span>m</span>
              </span>
            </div>
          </div>
        </div>

        <div className="fields">
          <div className="field">
            <div className="field-head">
              <label className="field-label" htmlFor="ctrl-v">
                Kecepatan konstan (v)
              </label>
              <span className="field-value">
                {num(v, 1)} <span>m/s</span>
              </span>
            </div>
            <input
              id="ctrl-v"
              type="range"
              className="range"
              min="0.2"
              max="150"
              step="0.1"
              value={v}
              onChange={(event) => onSetV(parseFloat(event.target.value) || 0.2)}
            />
            <div className="field-scale">
              <span>0,2</span>
              <span>150</span>
            </div>
          </div>

          <div className="field">
            <div className="field-head">
              <label className="field-label" htmlFor="ctrl-s0">
                Posisi awal (s₀)
              </label>
              <span className="field-value">
                {num(s0, 0)} <span>m</span>
              </span>
            </div>
            <input
              id="ctrl-s0"
              type="range"
              className="range"
              min="0"
              max="100"
              step="5"
              value={s0}
              onChange={(event) => onSetS0(parseFloat(event.target.value) || 0)}
            />
            <div className="field-scale">
              <span>0</span>
              <span>100</span>
            </div>
          </div>

          <div className="field">
            <div className="field-head">
              <label className="field-label" htmlFor="ctrl-t">
                Durasi target (t)
              </label>
              <span className="field-value">
                {num(timeTarget, 0)} <span>s</span>
              </span>
            </div>
            <input
              id="ctrl-t"
              type="range"
              className="range"
              min="2"
              max="60"
              step="1"
              value={timeTarget}
              onChange={(event) => onSetTimeTarget(parseFloat(event.target.value) || 2)}
            />
            <div className="field-scale">
              <span>2</span>
              <span>60</span>
            </div>
          </div>
        </div>

        <div className="presets">
          <span className="field-label">Preset kasus</span>
          <div className="chips">
            {PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className="chip"
                aria-pressed={isPresetActive(preset)}
                onClick={() => applyPreset(preset)}
              >
                <span className="chip-name">{preset.name}</span>
                <span className="chip-detail">{preset.detail}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Controls;
