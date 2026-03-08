// Performance data for MHCC SPV-01 — combines IoT, harvest, and financial metrics

export interface SensorReading {
  id: string;
  deviceName: string;
  location: string;
  metric: string;
  unit: string;
  current: number;
  threshold: { min: number; max: number };
  status: "normal" | "warning" | "critical";
  lastUpdated: string;
  history: { date: string; value: number }[];
}

export interface HarvestRecord {
  month: string;
  cherryIntake: number; // kg
  greenYield: number; // kg
  conversionRate: number; // %
  gradeAPercent: number;
}

export interface FinancialQuarter {
  quarter: string;
  revenue: number; // FCFA
  operatingCost: number;
  netMargin: number; // %
  loanRepayment: number;
}

export interface NDVIReading {
  date: string;
  value: number;
  source: string;
}

export const mockSensors: SensorReading[] = [
  {
    id: "SM-01", deviceName: "SoilProbe Alpha-1", location: "Plot A — Nkwen (1,420m)",
    metric: "Soil Moisture", unit: "%", current: 22.4,
    threshold: { min: 18, max: 35 }, status: "normal", lastUpdated: "2 min ago",
    history: [
      { date: "Mar 1", value: 19.8 }, { date: "Mar 2", value: 20.1 }, { date: "Mar 3", value: 21.5 },
      { date: "Mar 4", value: 23.2 }, { date: "Mar 5", value: 22.8 }, { date: "Mar 6", value: 22.1 },
      { date: "Mar 7", value: 22.4 },
    ],
  },
  {
    id: "SM-02", deviceName: "SoilProbe Alpha-2", location: "Plot C — Fongo-Tongo (1,650m)",
    metric: "Soil Moisture", unit: "%", current: 26.1,
    threshold: { min: 18, max: 35 }, status: "normal", lastUpdated: "5 min ago",
    history: [
      { date: "Mar 1", value: 24.3 }, { date: "Mar 2", value: 25.0 }, { date: "Mar 3", value: 25.8 },
      { date: "Mar 4", value: 26.5 }, { date: "Mar 5", value: 27.1 }, { date: "Mar 6", value: 26.8 },
      { date: "Mar 7", value: 26.1 },
    ],
  },
  {
    id: "TH-01", deviceName: "WeatherNode Bravo-1", location: "Plot A — Nkwen (1,420m)",
    metric: "Temperature", unit: "°C", current: 21.3,
    threshold: { min: 15, max: 28 }, status: "normal", lastUpdated: "2 min ago",
    history: [
      { date: "Mar 1", value: 20.1 }, { date: "Mar 2", value: 19.8 }, { date: "Mar 3", value: 21.0 },
      { date: "Mar 4", value: 22.5 }, { date: "Mar 5", value: 21.8 }, { date: "Mar 6", value: 20.9 },
      { date: "Mar 7", value: 21.3 },
    ],
  },
  {
    id: "RH-01", deviceName: "WeatherNode Bravo-1", location: "Plot A — Nkwen (1,420m)",
    metric: "Relative Humidity", unit: "%", current: 78.2,
    threshold: { min: 60, max: 90 }, status: "normal", lastUpdated: "2 min ago",
    history: [
      { date: "Mar 1", value: 72.0 }, { date: "Mar 2", value: 74.5 }, { date: "Mar 3", value: 76.1 },
      { date: "Mar 4", value: 79.3 }, { date: "Mar 5", value: 80.1 }, { date: "Mar 6", value: 78.8 },
      { date: "Mar 7", value: 78.2 },
    ],
  },
  {
    id: "RF-01", deviceName: "RainGauge Charlie-1", location: "Plot B — Dschang (1,780m)",
    metric: "Rainfall (7-day)", unit: "mm", current: 42.6,
    threshold: { min: 20, max: 80 }, status: "normal", lastUpdated: "1 hr ago",
    history: [
      { date: "Mar 1", value: 8.2 }, { date: "Mar 2", value: 0.0 }, { date: "Mar 3", value: 12.4 },
      { date: "Mar 4", value: 5.6 }, { date: "Mar 5", value: 0.0 }, { date: "Mar 6", value: 9.8 },
      { date: "Mar 7", value: 6.6 },
    ],
  },
  {
    id: "WB-01", deviceName: "Weighbridge Delta-1", location: "MHCC Mill — Dschang",
    metric: "Cherry Intake (today)", unit: "kg", current: 1240,
    threshold: { min: 500, max: 3000 }, status: "normal", lastUpdated: "30 min ago",
    history: [
      { date: "Mar 1", value: 980 }, { date: "Mar 2", value: 1100 }, { date: "Mar 3", value: 1350 },
      { date: "Mar 4", value: 1280 }, { date: "Mar 5", value: 1420 }, { date: "Mar 6", value: 1150 },
      { date: "Mar 7", value: 1240 },
    ],
  },
];

export const mockNDVI: NDVIReading[] = [
  { date: "Oct 2024", value: 0.42, source: "Sentinel-2" },
  { date: "Nov 2024", value: 0.48, source: "Sentinel-2" },
  { date: "Dec 2024", value: 0.53, source: "Sentinel-2" },
  { date: "Jan 2025", value: 0.58, source: "Sentinel-2" },
  { date: "Feb 2025", value: 0.61, source: "Sentinel-2" },
  { date: "Mar 2025", value: 0.63, source: "Sentinel-2" },
];

export const mockHarvestData: HarvestRecord[] = [
  { month: "Nov 2024", cherryIntake: 8200, greenYield: 1640, conversionRate: 20.0, gradeAPercent: 72 },
  { month: "Dec 2024", cherryIntake: 14500, greenYield: 3045, conversionRate: 21.0, gradeAPercent: 78 },
  { month: "Jan 2025", cherryIntake: 18200, greenYield: 4004, conversionRate: 22.0, gradeAPercent: 81 },
  { month: "Feb 2025", cherryIntake: 16800, greenYield: 3528, conversionRate: 21.0, gradeAPercent: 79 },
  { month: "Mar 2025", cherryIntake: 12400, greenYield: 2604, conversionRate: 21.0, gradeAPercent: 76 },
];

export const mockFinancials: FinancialQuarter[] = [
  { quarter: "Q4 2024", revenue: 15200000, operatingCost: 12800000, netMargin: 15.8, loanRepayment: 0 },
  { quarter: "Q1 2025", revenue: 28400000, operatingCost: 22100000, netMargin: 22.2, loanRepayment: 4700000 },
];

export const performanceSummary = {
  totalCherryIntake: "70.1 MT",
  cherryTarget: "90 MT",
  cherryPercent: 77.9,
  totalGreenExport: "14.8 MT",
  greenTarget: "18 MT",
  greenPercent: 82.2,
  avgGradeA: "77.2%",
  activeSensors: 6,
  totalSensors: 6,
  ndviCurrent: 0.63,
  ndviThreshold: 0.55,
  nextRepayment: "Jul 15, 2025",
  nextRepaymentAmount: "4,700,000 FCFA",
  cumulativeRevenue: "43.6M FCFA",
  projectedIRR: "18.7%",
};
