"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useBreadcrumb } from "@/store/BreadcrumbContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProfile } from "@/lib/api/profile";
import { fetchStudentAttendance, type StudentAttendanceResponse } from "@/lib/api/attendance";

const SUBJECTS = ["PHYSICS", "CHEMISTRY", "MATHEMATICS", "ZOOLOGY", "BOTANY"] as const;
type Subject = (typeof SUBJECTS)[number];

function getSubjectLabel(subject: string) {
  const found = SUBJECTS.find((s) => s === subject);
  if (!found) return subject;
  return subject.charAt(0) + subject.slice(1).toLowerCase();
}

function getColorForAttendance(percentage: number) {
  if (percentage >= 75) {
    return { stroke: "text-emerald-600", bg: "bg-emerald-500/10" };
  }
  if (percentage >= 50) {
    return { stroke: "text-amber-600", bg: "bg-amber-500/10" };
  }
  return { stroke: "text-destructive", bg: "bg-destructive/10" };
}

function CircularProgress({
  value,
  percentage,
}: {
  value: number;
  percentage: number;
}) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const color = getColorForAttendance(percentage);
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="48" height="48" viewBox="0 0 48 48" className="transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          className="text-muted-foreground"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          className={color.stroke}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-sm font-semibold">{Math.round(value)}%</span>
    </div>
  );
}

export default function StudentAttendancePage() {
  const { setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumb([{ label: "My Attendance" }]);
  }, [setBreadcrumb]);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const batchId = profile?.student?.batchId ?? "";

  const {
    data: attendance,
    isLoading: isAttendanceLoading,
    error,
  } = useQuery<StudentAttendanceResponse>({
    queryKey: batchId
      ? (["attendance", "student", "summary", batchId] as const)
      : ["attendance-student-none"],
    queryFn: () => fetchStudentAttendance(batchId),
    enabled: !!batchId,
  });

  useEffect(() => {
    if (error) toast.error("Failed to load attendance");
  }, [error]);

  const subjectSummary = attendance?.subjectSummary ?? [];
  const sessions = attendance?.sessions ?? [];

  const [subjectFilter, setSubjectFilter] = useState<string>("ALL");

  const filteredSessions = useMemo(() => {
    if (subjectFilter === "ALL") return sessions;
    return sessions.filter((s) => s.subject === subjectFilter);
  }, [sessions, subjectFilter]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground text-sm">Track your attendance across subjects.</p>
      </div>

      {isProfileLoading || !batchId ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {isProfileLoading ? "Loading profile..." : "No batch linked to your profile yet."}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Subject Summary</CardTitle>
              <CardDescription>Your attendance based on recorded sessions.</CardDescription>
            </CardHeader>
            <CardContent>
              {isAttendanceLoading ? (
                <div className="flex gap-3 overflow-x-auto">
                  <div className="w-[220px] h-[140px] rounded-lg border bg-muted/30" />
                  <div className="w-[220px] h-[140px] rounded-lg border bg-muted/30" />
                  <div className="w-[220px] h-[140px] rounded-lg border bg-muted/30" />
                </div>
              ) : subjectSummary.length === 0 ? (
                <p className="text-muted-foreground text-sm py-6 text-center">No attendance records yet.</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {subjectSummary.map((s) => {
                    const color = getColorForAttendance(s.percentage);
                    return (
                      <div key={s.subject} className="min-w-[220px] rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{getSubjectLabel(s.subject)}</p>
                            <div className="mt-2">
                              <CircularProgress value={s.percentage} percentage={s.percentage} />
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className={color.bg}>
                              {s.present} / {s.total}
                            </Badge>
                            {s.percentage < 75 && (
                              <p className="mt-2 text-xs font-medium text-destructive">⚠️ Below required attendance</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Session History</CardTitle>
              <CardDescription>Filter by subject to track your sessions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="text-sm font-medium text-muted-foreground sm:mr-2">Subject</p>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All subjects</SelectItem>
                    {subjectSummary.map((s) => (
                      <SelectItem key={s.subject} value={s.subject}>
                        {getSubjectLabel(s.subject)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isAttendanceLoading ? (
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">Loading sessions...</p>
                </div>
              ) : filteredSessions.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">No sessions found.</p>
              ) : (
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>Date</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessions.map((s) => (
                        <TableRow
                          key={s.id}
                          className={s.status === "ABSENT" ? "bg-destructive/10" : ""}
                        >
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(s.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{getSubjectLabel(s.subject)}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{s.topic ?? "—"}</TableCell>
                          <TableCell>
                            {s.status === "PRESENT" ? (
                              <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-600/30">
                                Present
                              </Badge>
                            ) : (
                              <Badge className="bg-destructive/10 text-destructive border-destructive/30">
                                Absent
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

