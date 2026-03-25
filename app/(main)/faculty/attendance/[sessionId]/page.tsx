"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";
import { useBreadcrumb } from "@/store/BreadcrumbContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LoadingButton from "@/components/LoadingButton";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { fetchSessionDetail, updateAttendance, type FacultySessionDetail } from "@/lib/api/attendance";

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

export default function FacultyAttendanceSessionPage() {
  const queryClient = useQueryClient();
  const { setBreadcrumb } = useBreadcrumb();
  const params = useParams();
  const sessionId = (params.sessionId as string | undefined) ?? "";

  const {
    data: detail,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: sessionId
      ? (["attendance", "sessions", "details", sessionId] as const)
      : ["attendance-detail-none"],
    queryFn: () => fetchSessionDetail(sessionId),
    enabled: !!sessionId,
  });

  const [editAttendanceByStudentId, setEditAttendanceByStudentId] = useState<
    Record<string, { isPresent: boolean }>
  >({});

  useEffect(() => {
    if (!detail) return;
    const dateLabel = new Date(detail.date).toLocaleDateString();
    setBreadcrumb([
      { label: "Attendance", href: "/faculty/attendance" },
      { label: `${dateLabel} - ${detail.subject}` },
    ]);
  }, [detail, setBreadcrumb]);

  useEffect(() => {
    if (!detail) return;
    const next: Record<string, { isPresent: boolean }> = {};
    for (const st of detail.batchStudents) {
      const att = detail.attendances.find((a) => a.studentId === st.id);
      next[st.id] = { isPresent: att?.isPresent ?? false };
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditAttendanceByStudentId(next);
  }, [detail]);

  const presentCount = useMemo(() => {
    return Object.values(editAttendanceByStudentId).filter((x) => x.isPresent).length;
  }, [editAttendanceByStudentId]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!detail) throw new Error("Missing session details");
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
      if (detail) {
        await queryClient.invalidateQueries({
          queryKey: ["attendance", "sessions", "details", detail.id] as const,
        });
        await queryClient.invalidateQueries({
          queryKey: ["attendance", "sessions", "list", detail.batchId] as const,
        });
      }
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update attendance"),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Edit Attendance</CardTitle>
          <CardDescription>Toggle present/absent and save changes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading || isFetching || !detail ? (
            <TableSkeleton rows={8} columns={3} />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className={subjectBadgeClass(detail.subject as Subject)}>
                  {detail.subject}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(detail.date).toLocaleDateString()}
                </span>
                <span className="text-sm text-muted-foreground">Topic: {detail.topic ?? "—"}</span>
              </div>

              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-[280px]">Student</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.batchStudents.map((st) => {
                      const state = editAttendanceByStudentId[st.id];
                      const isPresent = state?.isPresent ?? false;
                      return (
                        <TableRow key={st.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 rounded-md">
                                <AvatarFallback>{initials(st.user.name)}</AvatarFallback>
                              </Avatar>
                              <p className="font-medium truncate">{st.user.name}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{st.rollNo}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="outline"
                              className={[
                                "rounded-full px-4",
                                isPresent
                                  ? "bg-emerald-500/15 border-emerald-600 text-emerald-700 hover:bg-emerald-500/25"
                                  : "bg-muted/50 border-border text-muted-foreground hover:bg-muted/70",
                              ].join(" ")}
                              onClick={() =>
                                setEditAttendanceByStudentId((prev) => ({
                                  ...prev,
                                  [st.id]: { isPresent: !prev[st.id]?.isPresent },
                                }))
                              }
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

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {presentCount} / {detail.batchStudents.length} students present
                </p>
                <LoadingButton
                  loading={saveMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => saveMutation.mutate()}
                >
                  Save Changes
                </LoadingButton>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

