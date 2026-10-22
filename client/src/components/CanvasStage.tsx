import React, { useEffect, useRef, useState } from "react";
import { C, F } from "../theme";
import { sound } from "../utils/audio";
import { num } from "../utils/format";
import { sweepOnce } from "../utils/motion";

export type VehicleType = "car" | "train" | "probe" | "lab";

interface CanvasStageProps {
  v: number;
  s0: number;
  timeCurrent: number;
  timeTarget: number;
  isRunning: boolean;
  isNightMode: boolean;
  vehicleType: VehicleType;
  onSelectVehicle: (type: VehicleType) => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
  color: string;
}

interface Assets {
  [key: string]: HTMLImageElement;
}

const VEHICLES: { key: VehicleType; label: string; short: string }[] = [
  { key: "car", label: "Mobil · Jalan raya", short: "Mobil" },
  { key: "train", label: "Maglev · Kota", short: "Maglev" },
  { key: "probe", label: "Probe · Angkasa", short: "Probe" },
  { key: "lab", label: "Troli · Lab", short: "Troli" },
];

const ASSET_SOURCES: [string, string][] = [
  ["bg_highway", "/assets/bg_highway.png"],
  ["bg_road", "/assets/bg_road.png"],
  ["bg_city", "/assets/bg_city.png"],
  ["bg_space", "/assets/bg_space.png"],
  ["bg_lab", "/assets/bg_lab.png"],
  ["spr_car", "/assets/spr_car.png"],
  ["spr_train", "/assets/spr_train.png"],
  ["spr_probe", "/assets/spr_probe.png"],
  ["spr_mascot", "/assets/spr_mascot.png"],
  ["spr_crate", "/assets/spr_crate.png"],
];

export const CanvasStage: React.FC<CanvasStageProps> = ({
  v,
  s0,
  timeCurrent,
  timeTarget,
  isRunning,
  isNightMode,
  vehicleType,
  onSelectVehicle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sweepRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const imagesRef = useRef<Assets>({});
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Nilai live untuk render loop. Loop dipasang sekali; perubahan state tidak
  // boleh membatalkan dan memasang ulang requestAnimationFrame tiap frame.
  const live = useRef({
    v,
    s0,
    timeCurrent,
    timeTarget,
    isRunning,
    isNightMode,
    vehicleType,
    assetsLoaded,
  });

  useEffect(() => {
    live.current = {
      v,
      s0,
      timeCurrent,
      timeTarget,
      isRunning,
      isNightMode,
      vehicleType,
      assetsLoaded,
    };
  });

  const sCurrent = s0 + v * timeCurrent;
  const sTarget = s0 + v * timeTarget;
  const progress = timeTarget > 0 ? Math.min(100, Math.max(0, (timeCurrent / timeTarget) * 100)) : 0;

  useEffect(() => {
    let cancelled = false;
    let loaded = 0;

    ASSET_SOURCES.forEach(([key, src]) => {
      const img = new Image();
      const done = () => {
        loaded += 1;
        if (!cancelled && loaded === ASSET_SOURCES.length) setAssetsLoaded(true);
      };
      img.onload = () => {
        imagesRef.current[key] = img;
        done();
      };
      img.onerror = done;
      img.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isRunning && v > 0) {
      sound.startEngineHum(v);
    } else {
      sound.stopEngineHum();
    }
    return () => {
      sound.stopEngineHum();
    };
  }, [isRunning, v]);

  useEffect(() => {
    if (isRunning) sweepOnce(sweepRef.current);
  }, [isRunning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let frame = 0;

    const render = () => {
      const state = live.current;
      const width = canvas.width;
      const height = canvas.height;
      const sNow = state.s0 + state.v * state.timeCurrent;
      const sGoal = state.s0 + state.v * state.timeTarget;

      ctx.imageSmoothingEnabled = false;

      let bgKey = "bg_highway";
      let sprKey = "spr_car";
      let trackY = height * 0.72;
      let spriteW = 132;
      let spriteH = 66;

      if (state.vehicleType === "car") {
        bgKey = state.isNightMode ? "bg_highway" : "bg_road";
        trackY = height * 0.72;
        spriteW = 132;
        spriteH = 66;
      } else if (state.vehicleType === "train") {
        bgKey = "bg_city";
        sprKey = "spr_train";
        trackY = height * 0.68;
        spriteW = 330;
        spriteH = 63;
      } else if (state.vehicleType === "probe") {
        bgKey = "bg_space";
        sprKey = "spr_probe";
        trackY = height * 0.52;
        spriteW = 88;
        spriteH = 57;
      } else if (state.vehicleType === "lab") {
        bgKey = "bg_lab";
        sprKey = "spr_mascot";
        trackY = height * 0.74;
        spriteW = 96;
        spriteH = 48;
      }

      const bgImg = imagesRef.current[bgKey];
      const sprImg = imagesRef.current[sprKey];

      // 1. Latar paralaks
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        const bgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
        const tileW = height * bgAspect;
        const factor = state.vehicleType === "probe" ? 0.25 : 0.8;
        const offset = (((sNow * 18 * factor) % tileW) + tileW) % tileW;

        for (let tile = -1; tile <= 2; tile++) {
          ctx.drawImage(bgImg, tile * tileW - offset, 0, tileW + 1, height);
        }
      } else {
        ctx.fillStyle = state.isNightMode ? C.void : C.deep;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Tint malam
      if (state.isNightMode && state.vehicleType !== "probe") {
        ctx.fillStyle = "rgba(11, 13, 23, 0.42)";
        ctx.fillRect(0, 0, width, height);
      }

      const screenX = width * 0.32;
      const screenY = trackY - spriteH * 0.85;

      // 3. Lintasan + penanda meter
      if (state.vehicleType !== "probe") {
        ctx.fillStyle = "rgba(11, 13, 23, 0.86)";
        ctx.fillRect(0, trackY + 8, width, height - (trackY + 8));

        ctx.fillStyle =
          state.vehicleType === "train" ? C.blue : state.vehicleType === "lab" ? C.mint : C.steel;
        ctx.fillRect(0, trackY + 6, width, 3);

        const metrePx = 18;
        const baseMark = Math.floor((sNow - 40) / 10) * 10;

        for (let m = baseMark; m <= baseMark + 120; m += 10) {
          if (m < 0) continue;
          const markerX = screenX + (m - sNow) * metrePx;
          if (markerX < -40 || markerX > width + 40) continue;

          const isGoal = Math.abs(m - sGoal) < 5;
          ctx.fillStyle = isGoal ? C.mint : C.slate;
          ctx.fillRect(markerX, trackY + 9, 2, 8);

          ctx.font = `8px ${F.mono}`;
          ctx.fillStyle = isGoal ? C.mint : C.mist;
          ctx.fillText(`${m}m`, markerX - 8, trackY + 28);

          if (isGoal) drawFinishGate(ctx, markerX, trackY, m);
        }

        if (state.vehicleType === "lab" || state.vehicleType === "car") {
          ctx.fillStyle = "rgba(232, 227, 211, 0.88)";
          const baseDot = Math.floor((sNow - 20) / 2) * 2;
          for (let d = baseDot; d <= baseDot + 60; d += 2) {
            const dotX = screenX + (d - sNow) * metrePx;
            if (dotX >= 0 && dotX <= width) ctx.fillRect(dotX, trackY + 36, 3, 3);
          }
        }
      }

      // 4. Partikel
      if (state.isRunning && state.v > 0 && Math.random() < 0.65) {
        let color: string = C.paper;
        let px = screenX;
        let py = screenY + spriteH * 0.6;
        let pvx = -(1.5 + Math.random() * 2.5);
        const pvy = (Math.random() - 0.5) * 1.2;

        if (state.vehicleType === "probe") {
          color = Math.random() > 0.4 ? C.blue : C.mint;
          px = screenX - 4;
          py = screenY + spriteH * 0.5;
          pvx = -(3 + Math.random() * 3);
        } else if (state.vehicleType === "train") {
          color = C.blue;
          px = screenX + 8;
          py = trackY + 5;
          pvx = -(2 + Math.random() * 2);
        } else if (state.vehicleType === "car") {
          color = "rgba(232, 227, 211, 0.75)";
          px = screenX - 8;
          py = screenY + spriteH * 0.75;
        }

        particlesRef.current.push({
          x: px,
          y: py,
          size: 2 + Math.random() * 3,
          opacity: 0.85,
          vx: pvx,
          vy: pvy,
          color,
        });
      }

      const particles = particlesRef.current;
      if (particles.length > 220) particles.splice(0, particles.length - 220);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.size += 0.08;
        p.opacity -= 0.035;

        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.floor(p.size), Math.floor(p.size));
        ctx.globalAlpha = 1;
      }

      // 5. Sprite
      if (sprImg && sprImg.complete && sprImg.naturalWidth > 0) {
        ctx.drawImage(sprImg, screenX, screenY, spriteW, spriteH);

        if (state.vehicleType === "car" || state.vehicleType === "train") {
          const beamW = 160;
          const beam = ctx.createLinearGradient(
            screenX + spriteW,
            screenY + spriteH * 0.5,
            screenX + spriteW + beamW,
            screenY + spriteH * 0.5
          );
          beam.addColorStop(0, "rgba(255, 248, 179, 0.42)");
          beam.addColorStop(1, "rgba(255, 248, 179, 0)");
          ctx.fillStyle = beam;
          ctx.beginPath();
          ctx.moveTo(screenX + spriteW, screenY + spriteH * 0.45);
          ctx.lineTo(screenX + spriteW + beamW, screenY - 10);
          ctx.lineTo(screenX + spriteW + beamW, screenY + spriteH + 20);
          ctx.lineTo(screenX + spriteW, screenY + spriteH * 0.7);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        ctx.fillStyle = C.amber;
        ctx.fillRect(screenX, screenY, spriteW, spriteH);
      }

      // 6. Vektor kecepatan
      drawVelocityArrow(ctx, screenX + spriteW * 0.5, screenY - 20, state.v);

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="stage" aria-label="Lintasan simulasi">
      <div className="stage-viewport">
        <canvas
          ref={canvasRef}
          width={960}
          height={420}
          role="img"
          aria-label="Animasi kendaraan bergerak lurus dengan kecepatan konstan"
        />

        <div className="stage-sweep" ref={sweepRef} aria-hidden="true" />

        <div className="stage-hud" aria-hidden="true">
          <span className="stage-tag">
            <span className={`led ${isRunning ? "is-live" : ""}`} />
            {VEHICLES.find((item) => item.key === vehicleType)?.label ?? "Mobil"}
          </span>
          <span className="stage-live">
            s {num(sCurrent, 1)} / {num(sTarget, 1)} m
          </span>
        </div>
      </div>

      <div className="stage-foot">
        <div className="seg" role="group" aria-label="Pilih wahana">
          {VEHICLES.map((item) => (
            <button
              key={item.key}
              type="button"
              className="seg-btn"
              aria-pressed={vehicleType === item.key}
              onClick={() => {
                sound.playClick();
                onSelectVehicle(item.key);
              }}
            >
              {item.short}
            </button>
          ))}
        </div>

        <div className="stage-meter" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="stage-pct">{Math.round(progress)}%</span>
      </div>
    </section>
  );
};

function drawVelocityArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  velocity: number
) {
  const len = Math.min(100, Math.max(30, velocity * 2.2));

  ctx.save();
  ctx.strokeStyle = C.mint;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + len, y);
  ctx.stroke();

  ctx.fillStyle = C.mint;
  ctx.beginPath();
  ctx.moveTo(x + len + 6, y);
  ctx.lineTo(x + len - 4, y - 5);
  ctx.lineTo(x + len - 4, y + 5);
  ctx.closePath();
  ctx.fill();

  ctx.font = `bold 10px ${F.ui}`;
  ctx.fillStyle = C.paper;
  ctx.fillText(`v = ${num(velocity, 1)} m/s · a = 0`, x + 4, y - 7);
  ctx.restore();
}

function drawFinishGate(
  ctx: CanvasRenderingContext2D,
  x: number,
  trackY: number,
  targetM: number
) {
  ctx.save();
  ctx.fillStyle = C.amber;
  ctx.fillRect(x - 2, trackY - 90, 4, 98);

  const flagW = 28;
  const flagH = 18;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 2, trackY - 90, flagW, flagH);

  ctx.fillStyle = "#0b0d17";
  const sq = 6;
  for (let r = 0; r < flagH; r += sq) {
    for (let c = 0; c < flagW; c += sq) {
      if ((r / sq + c / sq) % 2 === 0) {
        ctx.fillRect(x + 2 + c, trackY - 90 + r, sq, sq);
      }
    }
  }

  ctx.font = `9px ${F.ui}`;
  ctx.fillStyle = C.amber;
  ctx.fillText(`FINISH ${num(targetM, 0)}m`, x - 18, trackY - 96);
  ctx.restore();
}

export default CanvasStage;
