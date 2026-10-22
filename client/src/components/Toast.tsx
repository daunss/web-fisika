import React, { useEffect, useRef, useState } from "react";

export type ToastKind = "ok" | "error" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

let sequence = 0;
const listeners = new Set<(item: ToastItem) => void>();

export function toast(message: string, kind: ToastKind = "ok") {
  sequence += 1;
  const item: ToastItem = { id: sequence, kind, message };
  listeners.forEach((listener) => listener(item));
}

export const ToastHost: React.FC = () => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const add = (item: ToastItem) => {
      setItems((prev) => [...prev.slice(-2), item]);
      const timer = window.setTimeout(() => {
        setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      }, 4200);
      timers.current.push(timer);
    };
    listeners.add(add);
    return () => {
      listeners.delete(add);
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="toast-host" role="status" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className={`toast toast-${item.kind}`}>
          {item.message}
        </div>
      ))}
    </div>
  );
};
