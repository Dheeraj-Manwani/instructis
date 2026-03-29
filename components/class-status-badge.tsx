"use client";

import { Badge } from "@/components/ui/badge";
import { CLASS_STATUS_LABEL } from "@/lib/constants/class-schedule";
import { cn } from "@/lib/utils";
import type { ClassStatus } from "@prisma/client";

const STATUS_CLASS_MAP: Record<ClassStatus, string> = {
  SCHEDULED: "bg-muted text-muted-foreground border-border",
  LIVE: "bg-emerald-500/15 text-emerald-700 border-emerald-600/40",
  COMPLETED: "bg-slate-500/10 text-slate-700 border-slate-600/30",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-600/40",
};

export function ClassStatusBadge({ status, className }: { status: ClassStatus; className?: string }) {
  return (
    <Badge className={cn(STATUS_CLASS_MAP[status], className)} variant="outline">
      {status === "LIVE" && <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
      {CLASS_STATUS_LABEL[status]}
    </Badge>
  );
}
