"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useBreadcrumb } from "@/store/BreadcrumbContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LoadingButton from "@/components/LoadingButton";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchMyBatches, fetchStudentsInBatch, type BatchListItem, type StudentInBatch } from "@/lib/api/batches";
import {
  createAttendanceSession,
  fetchSessionsForBatch,
  fetchSessionDetail,
  updateAttendance,
  type FacultySessionDetail,
} from "@/lib/api/attendance";

const SUBJECTS = ["PHYSICS", "CHEMISTRY", "MATHEMATICS", "ZOOLOGY", "BOTANY"] as const;
type Subject = (typeof SUBJECTS)[number];

function subjectBadgeClass(subject: Subject) {
  switch (subject) {
    case "PHYSICS":
      return "bg-indigo-500/10 text-indigo-600 border-indigo-500/30";
    case "CHEMISTRY":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-600/30";
    case "MATHEMATICS":
      return "bg-violet-500/10 text-violet-700 border-violet-600/30";
    case "ZOOLOGY":
      return "bg-amber-500/10 text-amber-700 border-amber-600/30";
    case "BOTANY":
      return "bg-lime-500/10 text-lime-700 border-lime-600/30";
    default:
      return "bg-muted text-foreground border-border";
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/g).filter(Boolean);
  if (parts.length === 0) return "U";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return `${first}${last}`.toUpperCase();
}

type AttendanceEditMode = "view" | "edit";

export default function FacultyAttendancePage() {
  const queryClient = useQueryClient();
  const { setBreadcrumb } = useBreadcrumb();

  const [tab, setTab] = useState<"take" | "history">("take");

  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<Subject>("PHYSICS");
  const [topic, setTopic] = useState<string>("");
  const [sessionNotes, setSessionNotes] = useState<string>("");
  const [sessionDate, setSessionDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const [attendanceByStudentId, setAttendanceByStudentId] = useState<
    Record<string, { isPresent: boolean }>
  >({});

  const { data: batches = [], isLoading: isBatchesLoading } = useQuery({
    queryKey: ["my-batches"],
    queryFn: fetchMyBatches,
  });

  const { data: students = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ["students-in-batch", selectedBatchId],
    queryFn: () => fetchStudentsInBatch(selectedBatchId),
    enabled: !!selectedBatchId,
  });

  useEffect(() => {
    setBreadcrumb([{ label: "Attendance" }]);
  }, [setBreadcrumb]);

  useEffect(() => {
    if (!selectedBatchId) return;
    if (isStudentsLoading) return;
    if (students.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAttendanceByStudentId({});
      return;
    }

    // Default all to present when switching batch.
    const next: Record<string, { isPresent: boolean }> = {};
    for (const st of students) {
      next[st.id] = { isPresent: true };
    }
    setAttendanceByStudentId(next);
  }, [selectedBatchId, students, isStudentsLoading]);

  const presentCount = useMemo(() => {
    return Object.values(attendanceByStudentId).filter((x) => x.isPresent).length;
  }, [attendanceByStudentId]);

  const sessionsQueryKey = selectedBatchId
    ? (["attendance", "sessions", "list", selectedBatchId] as const)
    : (["attendance", "sessions", "list", "none"] as const);

  const {
    data: sessions = [],
    isLoading: isSessionsLoading,
    isFetching: isSessionsFetching,
  } = useQuery({
    queryKey: sessionsQueryKey,
    queryFn: () => fetchSessionsForBatch(selectedBatchId),
    enabled: tab === "history" && !!selectedBatchId,
  });

  const createMutation = useMutation({
    mutationFn: createAttendanceSession,
    onSuccess: async () => {
      toast.success("Attendance saved");
      setTab("history");
      if (selectedBatchId) {
        await queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
      }
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save attendance"),
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMode, setDetailMode] = useState<AttendanceEditMode>("view");
  const [detailSessionId, setDetailSessionId] = useState<string>("");

  const {
    data: detail,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
  } = useQuery({
    queryKey: detailSessionId
      ? (["attendance", "sessions", "details", detailSessionId] as const)
      : ["attendance-detail-none"],
    queryFn: () => fetchSessionDetail(detailSessionId),
    enabled: detailOpen && !!detailSessionId,
  });

  const [editAttendanceByStudentId, setEditAttendanceByStudentId] = useState<
    Record<string, { isPresent: boolean }>
  >({});

  useEffect(() => {
    if (!detailOpen) return;
    if (!detail) return;
    if (!detail.batchStudents || detail.batchStudents.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditAttendanceByStudentId({});
      return;
    }

    const next: Record<string, { isPresent: boolean }> = {};
    for (const st of detail.batchStudents) {
      const att = detail.attendances.find((a) => a.studentId === st.id);
      next[st.id] = { isPresent: att?.isPresent ?? false };
    }
    setEditAttendanceByStudentId(next);
  }, [detailOpen, detail]);

  const saveEditMutation = useMutation({
    mutationFn: async () => {
      if (!detail) throw new Error("Session details not loaded");
      const payload = {
        attendances: Object.entries(editAttendanceByStudentId).map(([studentId, v]) => ({
          studentId,
          isPresent: v.isPresent,
        })),
      };
      return updateAttendance(detail.id, payload);
    },
    onSuccess: async () => {
      toast.success("Attendance updated");
      setDetailOpen(false);
      if (selectedBatchId) {
        await queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
      }
      if (detailSessionId) {
        await queryClient.invalidateQueries({
          queryKey: ["attendance", "sessions", "details", detailSessionId] as const,
        });
      }
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update attendance"),
  });

  const onOpenSession = (sessionId: string, mode: AttendanceEditMode) => {
    setDetailSessionId(sessionId);
    setDetailMode(mode);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground text-sm">
            Manage class attendance across your batches.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Batch</CardTitle>
          <CardDescription>Choose a batch to take attendance or view history.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
            <SelectTrigger className="w-full sm:w-[340px]">
              <SelectValue placeholder="Select batch" />
            </SelectTrigger>
            <SelectContent>
              {isBatchesLoading ? (
                <SelectItem value="__loading__" disabled>
                  Loading...
                </SelectItem>
              ) : (
                batches.map((b: BatchListItem) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} ({b.examType} - {b.year})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={tab === "take" ? "default" : "outline"}
              onClick={() => setTab("take")}
            >
              Take Attendance
            </Button>
            <Button
              variant={tab === "history" ? "default" : "outline"}
              onClick={() => setTab("history")}
              disabled={!selectedBatchId}
            >
              Session History
            </Button>
          </div>
        </CardContent>
      </Card>

      {tab === "take" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Take Attendance</CardTitle>
            <CardDescription>Mark each student as Present/Absent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">Subject</p>
                <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v as Subject)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">Topic (optional)</p>
                <Input
                  placeholder="e.g. Thermodynamics"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="w-full md:w-[220px]">
                <p className="text-xs font-medium text-muted-foreground mb-2">Date</p>
                <Input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Notes (optional)</p>
              <textarea
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                rows={3}
                placeholder="Add any session notes..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
              />
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              {isStudentsLoading ? (
                <div className="p-4">
                  <TableSkeleton rows={6} columns={4} />
                </div>
              ) : students.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No students found for this batch.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-[280px]">Student</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((st: StudentInBatch) => {
                      const state = attendanceByStudentId[st.id] ?? { isPresent: true };
                      const isPresent = state.isPresent;
                      return (
                        <TableRow key={st.id} className="border-b border-border/50 last:border-0">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 rounded-md">
                                <AvatarFallback>{initials(st.user.name)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{st.user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{st.user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{st.rollNo}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setAttendanceByStudentId((prev) => ({
                                  ...prev,
                                  [st.id]: { isPresent: !prev[st.id]?.isPresent },
                                }))
                              }
                              className={[
                                "rounded-full px-4",
                                isPresent
                                  ? "bg-emerald-500/15 border-emerald-600 text-emerald-700 hover:bg-emerald-500/25"
                                  : "bg-muted/50 border-border text-muted-foreground hover:bg-muted/70",
                              ].join(" ")}
                            >
                              {isPresent ? "Present" : "Absent"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>

            <div className="sticky bottom-0 bg-background/90 backdrop-blur-sm border-t border-border pt-4 -mx-6 px-6 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {presentCount} / {students.length} students present
                </p>
                <LoadingButton
                  loading={createMutation.isPending}
                  disabled={students.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  onClick={() => {
                    if (!selectedBatchId) {
                      toast.error("Please select a batch");
                      return;
                    }
                    if (!sessionDate) {
                      toast.error("Please select a date");
                      return;
                    }
                    if (Object.keys(attendanceByStudentId).length === 0) {
                      toast.error("Attendance records are missing");
                      return;
                    }

                    const isoDate = new Date(sessionDate).toISOString();

                    createMutation.mutate({
                      batchId: selectedBatchId,
                      subject: selectedSubject,
                      topic: topic.trim().length ? topic.trim() : undefined,
                      date: isoDate,
                      notes: sessionNotes.trim().length ? sessionNotes.trim() : undefined,
                      attendances: students.map((st) => ({
                        studentId: st.id,
                        isPresent: attendanceByStudentId[st.id]?.isPresent ?? true,
                      })),
                    });
                  }}
                >
                  Save Attendance
                </LoadingButton>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "history" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Session History</CardTitle>
            <CardDescription>View and edit past attendance sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            {isSessionsLoading ? (
              <TableSkeleton rows={8} columns={5} />
            ) : sessions.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No sessions yet for this batch.
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Date</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead className="text-right">Present/Total</TableHead>
                      <TableHead className="w-[200px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((s) => (
                      <TableRow key={s.id} className="border-b border-border/50 last:border-0">
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(s.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={subjectBadgeClass(s.subject as Subject)}>
                            {s.subject}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {s.topic ?? "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {s.presentCount} / {s.totalCount}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => onOpenSession(s.id, "view")}>
                              View
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => onOpenSession(s.id, "edit")}>
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={detailOpen} onOpenChange={(o) => setDetailOpen(o)}>
        <DialogContent
          className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto"
        >
          <DialogHeader className="space-y-1">
            <DialogTitle>Session Attendance</DialogTitle>
            {detail && (
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
                <span>{new Date(detail.date).toLocaleDateString()}</span>
                <Badge variant="secondary" className={subjectBadgeClass(detail.subject as Subject)}>
                  {detail.subject}
                </Badge>
                <span>{detail.topic ?? "—"}</span>
              </div>
            )}
          </DialogHeader>

          {isDetailLoading || isDetailFetching || !detail ? (
            <div className="py-6">
              <TableSkeleton rows={6} columns={4} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-[260px]">Student</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead className="text-right">Present/Absent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.batchStudents.map((st) => {
                      const state = editAttendanceByStudentId[st.id];
                      const isPresent = state?.isPresent ?? false;
                      const disabled = detailMode !== "edit";
                      return (
                        <TableRow key={st.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 rounded-md">
                                <AvatarFallback>{initials(st.user.name)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{st.user.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{st.rollNo}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={disabled}
                              onClick={() =>
                                setEditAttendanceByStudentId((prev) => ({
                                  ...prev,
                                  [st.id]: { isPresent: !prev[st.id]?.isPresent },
                                }))
                              }
                              className={[
                                "rounded-full px-4",
                                isPresent
                                  ? "bg-emerald-500/15 border-emerald-600 text-emerald-700 hover:bg-emerald-500/25"
                                  : "bg-muted/50 border-border text-muted-foreground hover:bg-muted/70",
                              ].join(" ")}
                            >
                              {isPresent ? "Present" : "Absent"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {detailMode === "edit" && (
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setDetailOpen(false)} disabled={saveEditMutation.isPending}>
                    Cancel
                  </Button>
                  <LoadingButton
                    loading={saveEditMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => saveEditMutation.mutate()}
                  >
                    Save Changes
                  </LoadingButton>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

