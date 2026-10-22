import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

type Accent = "amber" | "mint" | "coral" | "none";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: Accent;
  flush?: boolean;
}

export const Card: React.FC<CardProps> = ({
  accent = "none",
  flush = false,
  className = "",
  children,
  ...rest
}) => (
  <div
    className={`card ${accent !== "none" ? `card-${accent}` : ""} ${flush ? "card-flush" : ""} ${className}`}
    {...rest}
  >
    {children}
  </div>
);

interface CardHeadProps {
  index?: string;
  title: string;
  icon?: React.ReactNode;
  meta?: React.ReactNode;
}

export const CardHead: React.FC<CardHeadProps> = ({ index, title, icon, meta }) => (
  <header className="card-head">
    <div className="card-head-main">
      {icon ? <span className="card-icon">{icon}</span> : null}
      {index ? <span className="card-index">{index}</span> : null}
      <h2 className="card-title">{title}</h2>
    </div>
    {meta ? <div className="card-meta">{meta}</div> : null}
  </header>
);

type BadgeTone = "ok" | "warn" | "alert" | "muted";

export const Badge: React.FC<{ tone?: BadgeTone; children: React.ReactNode }> = ({
  tone = "muted",
  children,
}) => <span className={`badge badge-${tone}`}>{children}</span>;

interface StateBlockProps {
  kind: "loading" | "error" | "empty";
  title: string;
  text?: string;
  action?: React.ReactNode;
}

export const StateBlock: React.FC<StateBlockProps> = ({ kind, title, text, action }) => (
  <div className={`state state-${kind}`} role={kind === "error" ? "alert" : "status"}>
    <span className="state-icon" aria-hidden="true">
      {kind === "loading" ? (
        <Loader2 size={20} className="spin" />
      ) : kind === "error" ? (
        <AlertTriangle size={20} />
      ) : (
        <span className="state-rule" />
      )}
    </span>
    <p className="state-title">{title}</p>
    {text ? <p className="state-text">{text}</p> : null}
    {action ? <div className="state-actions">{action}</div> : null}
  </div>
);

export const Spinner: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <Loader2 size={size} className="spin" aria-hidden="true" />
);
