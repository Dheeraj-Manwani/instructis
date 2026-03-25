"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useBreadcrumb } from "@/store/BreadcrumbContext";
import { getProfile } from "@/lib/api/profile";
import { fetchAssignments, submitAssignment, uploadAssignmentAttachment } from "@/lib/api/assignments";
import type { StudentAssignmentListItem } from "@/lib/api/assignments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoadingButton from "@/components/LoadingButton";

type VirtualStatus = "PENDING" | "LATE" | "SUBMITTED" | "GRADED";

function getVirtualStatus(a: StudentAssignmentListItem): VirtualStatus {
  if (a.submission) {
    if (a.submission.status === "GRADED") return "GRADED";
    if (a.submission.status === "LATE") return "LATE";
    // Covers SUBMITTED
    return "SUBMITTED";
  }
  if (a.dueDate) {
    const dueMs = new Date(a.dueDate).getTime();
    if (dueMs < Date.now()) return "LATE";
  }
  return "PENDING";
}

function getStatusPillClass(status: VirtualStatus) {
  switch (status) {
    case "PENDING":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-600/30";
    case "LATE":
      return "bg-amber-500/10 text-amber-700 border-amber-600/30";
    case "SUBMITTED":
      return "bg-blue-500/10 text-blue-700 border-blue-600/30";
    case "GRADED":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-600/30";
    default:
      return "bg-muted";
  }
}

function statusButtonClass(status: VirtualStatus) {
  switch (status) {
    case "PENDING":
      return "bg-emerald-600 hover:bg-emerald-700 text-white";
    case "LATE":
      return "border-amber-600 text-amber-700 bg-transparent";
    case "SUBMITTED":
      return "border-blue-600 text-blue-700 bg-transparent";
    case "GRADED":
      return "border-emerald-600 text-emerald-700 bg-transparent";
  }
}

function subjectBarClass(subject: StudentAssignmentListItem["subject"]) {
  switch (subject) {
    case "PHYSICS":
      return "bg-indigo-600";
    case "CHEMISTRY":
      return "bg-emerald-600";
    case "MATHEMATICS":
      return "bg-violet-600";
    case "ZOOLOGY":
      return "bg-amber-600";
    case "BOTANY":
      return "bg-lime-600";
    default:
      return "bg-muted-foreground";
  }
}

function getDueRow(a: StudentAssignmentListItem, virtualStatus: VirtualStatus) {
  if (virtualStatus === "LATE") {
    return { label: "Overdue", className: "text-destructive font-semibold" };
  }
  if (virtualStatus === "SUBMITTED") {
    return { label: "Submitted", className: "text-blue-700 font-semibold" };
  }
  if (virtualStatus === "GRADED") {
    return { label: "Graded", className: "text-emerald-700 font-semibold" };
  }

  if (!a.dueDate) return { label: "No due date", className: "text-muted-foreground font-semibold" };

  const dueMs = new Date(a.dueDate).getTime();
  const diffDays = Math.ceil((dueMs - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 3) return { label: `Due in ${diffDays} days`, className: "text-amber-700 font-semibold" };
  return { label: `Due in ${diffDays} days`, className: "text-emerald-700 font-semibold" };
}

export default function StudentAssignmentsPage() {
  const { setBreadcrumb } = useBreadcrumb();
  const queryClient = useQueryClient();

  useEffect(() => {
    setBreadcrumb([{ label: "Assignments" }]);
  }, [setBreadcrumb]);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const batchId = profile?.student?.batchId ?? "";

  const queryKey = batchId
    ? (["assignments", "student", "list", batchId] as const)
    : ["assignments", "student", "none"] as const;

  const {
    data: assignmentsRaw,
    isLoading: isAssignmentsLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchAssignments({ batchId }),
    enabled: !!batchId,
  });

  const assignments = (assignmentsRaw ?? []) as StudentAssignmentListItem[];

  const subjectOptions = useMemo(() => {
    const set = new Set<string>();
    for (const a of assignments) set.add(a.subject);
    return Array.from(set.values());
  }, [assignments]);

  const [subjectFilter, setSubjectFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const vs = getVirtualStatus(a);
      if (subjectFilter !== "ALL" && a.subject !== subjectFilter) return false;
      if (statusFilter !== "ALL" && vs !== statusFilter) return false;
      return true;
    });
  }, [assignments, subjectFilter, statusFilter]);

  const [submitOpen, setSubmitOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<StudentAssignmentListItem | null>(null);

  const activeVirtualStatus: VirtualStatus | null = activeAssignment ? getVirtualStatus(activeAssignment) : null;

  const [submitNote, setSubmitNote] = useState("");
  const [submitAttachmentUrl, setSubmitAttachmentUrl] = useState("");

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!activeAssignment) throw new Error("No assignment selected");
      return submitAssignment(activeAssignment.id, {
        note: submitNote.trim().length ? submitNote.trim() : undefined,
        attachmentUrl: submitAttachmentUrl.trim().length ? submitAttachmentUrl.trim() : undefined,
      });
    },
    onSuccess: async () => {
      toast.success("Assignment submitted");
      setSubmitOpen(false);
      setViewOpen(false);
      setActiveAssignment(null);
      setSubmitNote("");
      setSubmitAttachmentUrl("");
      if (batchId) {
        await queryClient.invalidateQueries({ queryKey });
      }
    },
    onError: (e: Error) => toast.error(e.message || "Failed to submit"),
  });

  const uploadSubmitAttachmentMutation = useMutation({
    mutationFn: async (file: File) => uploadAssignmentAttachment(file),
    onSuccess: ({ url }) => {
      setSubmitAttachmentUrl(url);
      toast.success("Attachment uploaded");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to upload attachment"),
  });

  const openSubmit = (a: StudentAssignmentListItem) => {
    setActiveAssignment(a);
    setSubmitNote("");
    setSubmitAttachmentUrl(a.submission?.attachmentUrl ?? "");
    setSubmitOpen(true);
  };

  const openView = (a: StudentAssignmentListItem) => {
    setActiveAssignment(a);
    setViewOpen(true);
  };

  if (isProfileLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">Loading…</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">My Assignments</h1>
        <p className="text-muted-foreground text-sm">View and submit your assignments.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Filter by subject and status.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Subject</p>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Subjects</SelectItem>
                {subjectOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Status</p>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="LATE">Late</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="GRADED">Graded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isAssignmentsLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[220px] rounded-lg border bg-muted/20" />
          <div className="h-[220px] rounded-lg border bg-muted/20" />
          <div className="h-[220px] rounded-lg border bg-muted/20" />
          <div className="h-[220px] rounded-lg border bg-muted/20" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-muted-foreground text-sm py-10 text-center">No assignments found.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((a) => {
            const vs = getVirtualStatus(a);
            const dueRow = getDueRow(a, vs);
            return (
              <Card key={a.id} className="overflow-hidden">
                <div className={`h-1.5 w-full ${subjectBarClass(a.subject)}`} />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate">{a.title}</CardTitle>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{a.batch.name}</Badge>
                        <Badge variant="outline">{a.subject}</Badge>
                      </div>
                    </div>
                    <Badge className={getStatusPillClass(vs)}>{vs}</Badge>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Due: </span>
                    <span className={dueRow.className}>{dueRow.label}</span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Set by {a.facultyName}
                    {a.maxMarks != null ? ` • Out of ${a.maxMarks} marks` : ""}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <Button
                      className={statusButtonClass(vs)}
                      variant="outline"
                      onClick={() => {
                        if (vs === "PENDING" || vs === "LATE") openSubmit(a);
                        else openView(a);
                      }}
                    >
                      {vs === "PENDING"
                        ? "Submit Assignment"
                        : vs === "LATE"
                          ? "Submit Late"
                          : vs === "SUBMITTED"
                            ? "View Submission"
                            : "View Feedback →"}
                    </Button>
                    <span />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
          </DialogHeader>

          {activeAssignment && activeVirtualStatus ? (
            <div className="space-y-4">
              {activeVirtualStatus === "LATE" && (
                <div className="rounded-md border border-amber-600/30 bg-amber-500/10 p-3">
                  <p className="text-sm font-medium text-amber-700">Warning: This assignment is overdue. Submitting late.</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold">{activeAssignment.title}</p>
                {activeAssignment.description && (
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{activeAssignment.description}</p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Attachment (optional)</p>
                <Input
                  type="file"
                  accept="*/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    uploadSubmitAttachmentMutation.mutate(file);
                    e.currentTarget.value = "";
                  }}
                  disabled={uploadSubmitAttachmentMutation.isPending || submitMutation.isPending}
                />
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {uploadSubmitAttachmentMutation.isPending
                    ? "Uploading..."
                    : "Upload a file or paste a direct link below."}
                </p>
                <Input
                  className="mt-2"
                  value={submitAttachmentUrl}
                  onChange={(e) => setSubmitAttachmentUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={submitMutation.isPending}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Note (optional)</p>
                <textarea
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  rows={4}
                  value={submitNote}
                  onChange={(e) => setSubmitNote(e.target.value)}
                  placeholder="Add any notes for your faculty..."
                />
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSubmitOpen(false)} disabled={submitMutation.isPending}>
                  Cancel
                </Button>
                <LoadingButton
                  loading={submitMutation.isPending || uploadSubmitAttachmentMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={uploadSubmitAttachmentMutation.isPending}
                  onClick={() => submitMutation.mutate()}
                >
                  Submit
                </LoadingButton>
              </DialogFooter>
            </div>
          ) : (
            <div className="py-6 text-sm text-muted-foreground">Select an assignment.</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submission</DialogTitle>
          </DialogHeader>

          {activeAssignment?.submission ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold">{activeAssignment.title}</p>
                {activeAssignment.description && (
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{activeAssignment.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Your submission note</p>
                <p className="text-sm whitespace-pre-wrap">{activeAssignment.submission.note ?? "—"}</p>
              </div>

              {activeAssignment.submission.attachmentUrl && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Attachment</p>
                  <a
                    className="text-sm text-primary underline break-all"
                    href={activeAssignment.submission.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {activeAssignment.submission.attachmentUrl}
                  </a>
                </div>
              )}

              {activeAssignment.submission.status === "GRADED" ? (
                <div className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 p-4 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Faculty feedback</p>
                  <p className="text-sm whitespace-pre-wrap">{activeAssignment.submission.feedback ?? "—"}</p>
                  <div className="text-sm font-semibold text-emerald-700">
                    Marks: {activeAssignment.submission.marksAwarded ?? "—"} / {activeAssignment.maxMarks ?? "—"}
                  </div>
                  {activeAssignment.submission.gradedAt && (
                    <div className="text-sm text-muted-foreground">
                      Graded at:{" "}
                      {new Date(activeAssignment.submission.gradedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Submitted:{" "}
                  {activeAssignment.submission.submittedAt
                    ? new Date(activeAssignment.submission.submittedAt).toLocaleString()
                    : "—"}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="py-6 text-sm text-muted-foreground">No submission found.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

