import type { ClassStatus, SubjectEnum } from "@prisma/client";

export const SUBJECTS: SubjectEnum[] = [
  "PHYSICS",
  "CHEMISTRY",
  "MATHEMATICS",
  "ZOOLOGY",
  "BOTANY",
];

export const SUBJECT_THEME: Record<
  SubjectEnum,
  {
    card: string;
    border: string;
    text: string;
  }
> = {
  PHYSICS: {
    card: "bg-blue-500/10",
    border: "border-blue-600/40",
    text: "text-blue-700",
  },
  CHEMISTRY: {
    card: "bg-orange-500/10",
    border: "border-orange-600/40",
    text: "text-orange-700",
  },
  MATHEMATICS: {
    card: "bg-green-500/10",
    border: "border-green-600/40",
    text: "text-green-700",
  },
  ZOOLOGY: {
    card: "bg-purple-500/10",
    border: "border-purple-600/40",
    text: "text-purple-700",
  },
  BOTANY: {
    card: "bg-teal-500/10",
    border: "border-teal-600/40",
    text: "text-teal-700",
  },
};

export const CLASS_STATUS_LABEL: Record<ClassStatus, string> = {
  SCHEDULED: "Scheduled",
  LIVE: "LIVE",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
