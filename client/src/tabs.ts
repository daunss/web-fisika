export type TabKey =
  | "simulator"
  | "validation"
  | "praktikum"
  | "comparison"
  | "quiz"
  | "history";

export interface TabDef {
  key: TabKey;
  index: string;
  label: string;
  short: string;
  icon: string;
}

export const TABS: TabDef[] = [
  {
    key: "simulator",
    index: "01",
    label: "Simulator",
    short: "Sim",
    icon: "/pixel-icons/speedometer.png",
  },
  {
    key: "validation",
    index: "02",
    label: "Rumus GLB",
    short: "Rumus",
    icon: "/pixel-icons/formula_book.png",
  },
  {
    key: "praktikum",
    index: "03",
    label: "Praktikum",
    short: "Lab",
    icon: "/pixel-icons/flask_lab.png",
  },
  {
    key: "comparison",
    index: "04",
    label: "3 Pilar",
    short: "Pilar",
    icon: "/pixel-icons/scales_balance.png",
  },
  {
    key: "quiz",
    index: "05",
    label: "Kuis",
    short: "Kuis",
    icon: "/pixel-icons/quiz_box.png",
  },
  {
    key: "history",
    index: "06",
    label: "Riwayat",
    short: "Log",
    icon: "/pixel-icons/floppy_disk.png",
  },
];

export const VEHICLE_LABEL: Record<string, string> = {
  car: "Mobil",
  train: "Maglev",
  probe: "Probe",
  lab: "Troli",
};
