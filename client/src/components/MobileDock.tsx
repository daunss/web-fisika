import React, { useState } from "react";
import { ChevronDown, ChevronUp, FastForward, Pause, Play, RotateCcw } from "lucide-react";
import { sound } from "../utils/audio";
import { num } from "../utils/format";
import { TABS, type TabKey } from "../tabs";

interface MobileDockProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isRunning: boolean;
  timeCurrent: number;
  timeTarget: number;
  v: number;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onReset: () => void;
  currentDistance: number;
}

export const MobileDock: React.FC<MobileDockProps> = ({
  activeTab,
  onSelectTab,
  isRunning,
  timeCurrent,
  timeTarget,
  v,
  onTogglePlay,
  onStepForward,
  onReset,
  currentDistance,
}) => {
  const [expanded, setExpanded] = useState(true);
  const atEnd = timeCurrent >= timeTarget;

  return (
    <nav className="dock" aria-label="Navigasi cepat">
      {activeTab === "simulator" && (
        <div className="dock-fab">
          {expanded ? (
            <>
              <div className="fab-telemetry">
                <span>
                  s <b className="fab-s">{num(currentDistance, 1)} m</b>
                </span>
                <span>
                  v <b>{num(v, 0)} m/s</b>
                </span>
                <span>
                  t <b className="fab-t">{num(timeCurrent, 1)} s</b>
                </span>
              </div>

              <div className="fab-actions">
                <button
                  type="button"
                  className={`fab-btn fab-btn-play ${isRunning ? "is-running" : ""}`}
                  onClick={() => {
                    sound.playClick();
                    onTogglePlay();
                  }}
                >
                  {isRunning ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isRunning ? "Jeda" : timeCurrent > 0 ? "Lanjut" : "Mulai"}</span>
                </button>

                <button
                  type="button"
                  className="fab-btn"
                  disabled={isRunning || atEnd}
                  onClick={() => {
                    sound.playClick();
                    onStepForward();
                  }}
                >
                  <FastForward size={13} />
                  <span>+0.5s</span>
                </button>

                <button
                  type="button"
                  className="fab-btn fab-btn-reset"
                  onClick={() => {
                    sound.playClick();
                    onReset();
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  className="fab-collapse"
                  aria-label="Sembunyikan kontrol simulator"
                  aria-expanded
                  onClick={() => setExpanded(false)}
                >
                  <ChevronDown size={15} />
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              className="fab-pill"
              aria-expanded={false}
              onClick={() => setExpanded(true)}
            >
              <span className={`fab-status ${isRunning ? "is-running" : ""}`} aria-hidden="true" />
              <span>Kontrol simulator</span>
              <ChevronUp size={13} />
            </button>
          )}
        </div>
      )}

      <div className="dock-items">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              className={`dock-item ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              aria-label={tab.label}
              onClick={() => {
                sound.playClick();
                onSelectTab(tab.key);
              }}
            >
              <img className="dock-icon" src={tab.icon} alt="" />
              <span className="dock-label">{tab.short}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileDock;
