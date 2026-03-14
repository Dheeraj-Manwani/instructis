export interface Student {
  id: string;
  name: string;
  rollNo: string;
  avatar: string;
  phone: string;
  parentPhone: string;
  jeePercentile: number;
  neetPercentile: number;
  jeeRank: number;
  marks: { math: number; physics: number; chemistry: number; biology?: number };
  improvement: number;
  weakTopics: string[];
}

export const students: Student[] = [
  {
    id: "1", name: "Rahul Sharma", rollNo: "JA-2025-001", avatar: "RS",
    phone: "+91 98765 43210", parentPhone: "+91 98765 43211",
    jeePercentile: 92.5, neetPercentile: 88.2, jeeRank: 1524,
    marks: { math: 234, physics: 198, chemistry: 212 },
    improvement: 12, weakTopics: ["Thermodynamics", "Electrostatics"],
  },
  {
    id: "2", name: "Priya Joshi", rollNo: "JA-2025-002", avatar: "PJ",
    phone: "+91 98765 43220", parentPhone: "+91 98765 43221",
    jeePercentile: 94.1, neetPercentile: 91.5, jeeRank: 1102,
    marks: { math: 256, physics: 221, chemistry: 238 },
    improvement: 8, weakTopics: ["Organic Chemistry", "Optics"],
  },
  {
    id: "3", name: "Tanvi Mehta", rollNo: "JA-2025-003", avatar: "TM",
    phone: "+91 98765 43230", parentPhone: "+91 98765 43231",
    jeePercentile: 96.8, neetPercentile: 95.2, jeeRank: 542,
    marks: { math: 278, physics: 245, chemistry: 262 },
    improvement: 15, weakTopics: ["Electrostatics"],
  },
  {
    id: "4", name: "Aditya Verma", rollNo: "JA-2025-004", avatar: "AV",
    phone: "+91 98765 43240", parentPhone: "+91 98765 43241",
    jeePercentile: 89.3, neetPercentile: 85.1, jeeRank: 2341,
    marks: { math: 198, physics: 176, chemistry: 189 },
    improvement: 5, weakTopics: ["Thermodynamics", "Organic Chemistry", "Electrostatics"],
  },
  {
    id: "5", name: "Sameer Gupta", rollNo: "JA-2025-005", avatar: "SG",
    phone: "+91 98765 43250", parentPhone: "+91 98765 43251",
    jeePercentile: 78.6, neetPercentile: 72.3, jeeRank: 5890,
    marks: { math: 145, physics: 132, chemistry: 156 },
    improvement: -3, weakTopics: ["Thermodynamics", "Electrostatics", "Organic Chemistry"],
  },
  {
    id: "6", name: "Rohan Kumar", rollNo: "JA-2025-006", avatar: "RK",
    phone: "+91 98765 43260", parentPhone: "+91 98765 43261",
    jeePercentile: 91.2, neetPercentile: 89.8, jeeRank: 1823,
    marks: { math: 221, physics: 208, chemistry: 195 },
    improvement: 10, weakTopics: ["Organic Chemistry"],
  },
];

export const batchName = "JEE Advanced 2025 - Batch A";
export const totalStudents = 120;

export const performanceTrend = [
  { month: "Sep", marks: 520, percentile: 78 },
  { month: "Oct", marks: 580, percentile: 84 },
  { month: "Nov", marks: 640, percentile: 89 },
  { month: "Dec", marks: 695, percentile: 92.5 },
];

export function getPercentileColor(p: number): string {
  if (p >= 95) return "text-success";
  if (p >= 85) return "text-primary";
  if (p >= 75) return "text-warning";
  return "text-destructive";
}

export function getPercentileBg(p: number): string {
  if (p >= 95) return "bg-success/10 text-success";
  if (p >= 85) return "bg-primary/10 text-primary";
  if (p >= 75) return "bg-warning/10 text-warning";
  return "bg-destructive/10 text-destructive";
}
