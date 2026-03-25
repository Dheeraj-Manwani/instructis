"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";
import { useBreadcrumb } from "@/store/BreadcrumbContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingButton from "@/components/LoadingButton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { queryKeys } from "@/lib/api/query-keys";
import {
  fetchAssignmentDetail,
  gradeSubmission,
  updateAssignment,
  deleteAssignment,
  type AssignmentDetailForFaculty,
  type AssignmentSubmissionRow,
} from "@/lib/api/assignments";
import { fetchTopicsBySubject } from "@/lib/api/topics";

const SUBJECTS = ["PHYSICS", "CHEMISTRY", "MATHEMATICS", "ZOOLOGY", "BOTANY"] as const;
type Subject = (typeof SUBJECTS)[number];

function subjectBarClass(subject: Subject) {
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

function statusBadgeClass(status: string, maxMarks: number | null) {
  switch (status) {
    case "PENDING":
      return "bg-muted text-muted-foreground border-border";
    case "SUBMITTED":
      return "bg-blue-500/10 text-blue-700 border-blue-600/30";
    case "LATE":
      return "bg-amber-500/10 text-amber-700 border-amber-600/30";
    case "GRADED":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-600/30";
    default:
      return "bg-muted";
  }
}

function formatDueDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

function toDatetimeLocalValue(iso: string | null) {
  if (!iso) return "";
  // Convert ISO to a datetime-local compatible string.
  return new Date(iso).toISOString().slice(0, 16);
}

export default function FacultyAssignmentDetailPage() {
  const queryClient = useQueryClient();
  const { setBreadcrumb } = useBreadcrumb();

  const params = useParams();
  const assignmentId = (params.id as string | undefined) ?? "";

  const { data: assignment, isLoading } = useQuery({
    queryKey: assignmentId
      ? (["assignments", "faculty", "details", assignmentId] as const)
      : ["assignment-detail-none"],
    queryFn: () => fetchAssignmentDetail(assignmentId),
    enabled: !!assignmentId,
  });

  useEffect(() => {
    if (!assignment) return;
    setBreadcrumb([
      { label: "Assignments", href: "/faculty/assignments" },
      { label: assignment.title },
    ]);
  }, [assignment, setBreadcrumb]);

  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTopicId, setEditTopicId] = useState<string>("");
  const [editDueDateLocal, setEditDueDateLocal] = useState("");
  const [editMaxMarks, setEditMaxMarks] = useState<string>("");
  const [editAttachmentUrl, setEditAttachmentUrl] = useState<string>("");

  const { data: topics = [] } = useQuery({
    queryKey: assignment?.subject ? queryKeys.topics.list(assignment.subject) : ["topics-none"],
    queryFn: () => fetchTopicsBySubject(assignment?.subject ?? "PHYSICS"),
    enabled: !!assignment && editOpen,
  });

  useEffect(() => {
    if (!assignment || !editOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditTitle(assignment.title);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditDescription(assignment.description ?? "");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditTopicId(assignment.topic?.id ?? "");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditDueDateLocal(toDatetimeLocalValue(assignment.dueDate));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditMaxMarks(assignment.maxMarks != null ? String(assignment.maxMarks) : "");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditAttachmentUrl(assignment.attachmentUrl ?? "");
  }, [assignment, editOpen]);

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<{
      title: string;
      description: string | null;
      topicId: string | undefined;
      dueDate: string | undefined;
      maxMarks: number | undefined;
      attachmentUrl: string | undefined;
    }>) => {
      if (!assignment) throw new Error("Missing assignment");
      const dueDateISO = payload.dueDate ? new Date(payload.dueDate).toISOString() : undefined;
      const maxMarksNumber = payload.maxMarks;
      return updateAssignment(assignment.id, {
        title: payload.title,
        description: payload.description ?? undefined,
        topicId: payload.topicId,
        dueDate: payload.dueDate ? dueDateISO : undefined,
        maxMarks: typeof maxMarksNumber === "number" ? maxMarksNumber : undefined,
        attachmentUrl: payload.attachmentUrl,
      });
    },
    onSuccess: async () => {
      toast.success("Assignment updated");
      setEditOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["assignments", "faculty", "details", assignmentId] as const,
      });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update assignment"),
  });

  const publishCloseMutation = useMutation({
    mutationFn: async ({ nextStatus }: { nextStatus: "PUBLISHED" | "CLOSED" }) => {
      if (!assignment) throw new Error("Missing assignment");
      return updateAssignment(assignment.id, { status: nextStatus });
    },
    onSuccess: async () => {
      toast.success("Status updated");
      if (assignmentId) {
        await queryClient.invalidateQueries({
          queryKey: ["assignments", "faculty", "details", assignmentId] as const,
        });
      }
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!assignment) throw new Error("Missing assignment");
      await deleteAssignment(assignment.id);
    },
    onSuccess: () => {
      toast.success("Assignment deleted");
      routerReplace("/faculty/assignments");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete assignment"),
  });

  // Simple router replacement without importing useRouter: use window location.
  // (This page still runs client-side under the authenticated dashboard.)
  const routerReplace = (path: string) => {
    window.location.href = path;
  };

  const [gradingStudentId, setGradingStudentId] = useState<string>("");
  const [gradeMarks, setGradeMarks] = useState<string>("");
  const [gradeFeedback, setGradeFeedback] = useState<string>("");

  const [viewRow, setViewRow] = useState<AssignmentSubmissionRow | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const gradeMutation = useMutation({
    mutationFn: async (payload: { row: AssignmentSubmissionRow; marks: number; feedback?: string }) => {
      if (!assignment) throw new Error("Missing assignment");
      return gradeSubmission(assignment.id, payload.row.studentId, {
        marksAwarded: payload.marks,
        feedback: payload.feedback,
      });
    },
    onSuccess: async () => {
      toast.success("Grade saved");
      setGradingStudentId("");
      setGradeMarks("");
      setGradeFeedback("");
      if (assignmentId) {
        await queryClient.invalidateQueries({
          queryKey: ["assignments", "faculty", "details", assignmentId] as const,
        });
      }
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save grade"),
  });

  const maxMarks = assignment?.maxMarks ?? null;

  const submissions = assignment?.submissions ?? [];

  const isGradingOpen = (studentId: string) => gradingStudentId === studentId;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-2xl">{assignment?.title ?? "Assignment"}</CardTitle>
              {assignment && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge className={subjectBarClass(assignment.subject as Subject)}>{assignment.subject}</Badge>
                  <Badge variant="secondary">{assignment.batch.name}</Badge>
                  <Badge className={statusBadgeClass(assignment.status, assignment.maxMarks)}>{assignment.status}</Badge>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={!assignment} onClick={() => setEditOpen(true)}>
                Edit
              </Button>
              {assignment?.status === "DRAFT" && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={publishCloseMutation.isPending}
                  onClick={() => publishCloseMutation.mutate({ nextStatus: "PUBLISHED" })}
                >
                  Publish
                </Button>
              )}
              {assignment?.status === "PUBLISHED" && (
                <Button
                  className="bg-slate-600 hover:bg-slate-700 text-white"
                  disabled={publishCloseMutation.isPending}
                  onClick={() => publishCloseMutation.mutate({ nextStatus: "CLOSED" })}
                >
                  Close
                </Button>
              )}
              {assignment?.status === "DRAFT" && (
                <Button
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (!window.confirm("Delete this assignment?")) return;
                    deleteMutation.mutate();
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
          {assignment && (
            <CardDescription className="mt-3">
              Due:{" "}
              <span className={assignment.dueDate && new Date(assignment.dueDate).getTime() < new Date().getTime() ? "text-destructive font-medium" : "text-foreground font-medium"}>
                {formatDueDate(assignment.dueDate)}
              </span>{" "}
              {assignment.maxMarks != null ? `• Max marks: ${assignment.maxMarks}` : ""}
              {assignment.topic?.name ? ` • Topic: ${assignment.topic.name}` : ""}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoading || !assignment ? (
            <div className="py-6 text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-4">
              {assignment.description && (
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-sm whitespace-pre-wrap">{assignment.description}</p>
                </div>
              )}
              {assignment.attachmentUrl && (
                <div className="rounded-lg border border-border bg-muted/10 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Attachment</p>
                  <a className="text-sm text-primary underline" href={assignment.attachmentUrl} target="_blank" rel="noreferrer">
                    {assignment.attachmentUrl}
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Submissions</CardTitle>
          <CardDescription>Grade student submissions inline.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6">
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">Loading submissions...</p>
              </div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No submissions found.</div>
          ) : (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((row) => {
                    const status = row.status;
                    const badgeText =
                      status === "PENDING"
                        ? "Not Submitted"
                        : status === "SUBMITTED"
                          ? "Submitted"
                          : status === "LATE"
                            ? "Late"
                            : row.marksAwarded != null && maxMarks != null
                              ? `Graded ${row.marksAwarded}/${maxMarks}`
                              : "Graded";

                    return (
                      <TableRow key={row.studentId} className="border-b border-border/50 last:border-0">
                        <TableCell className="font-medium">{row.studentName}</TableCell>
                        <TableCell className="font-mono">{row.rollNo}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadgeClass(status, maxMarks)}>
                            {badgeText}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {row.note ? `${row.note.slice(0, 24)}${row.note.length > 24 ? "..." : ""}` : "—"}
                          {row.attachmentUrl && (
                            <div className="mt-1">
                              <Button
                                type="button"
                                variant="link"
                                className="p-0 h-auto text-primary"
                                onClick={() => {
                                  setViewRow(row);
                                  setViewOpen(true);
                                }}
                              >
                                View
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {row.marksAwarded != null ? row.marksAwarded : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {isGradingOpen(row.studentId) ? (
                            <div className="space-y-2 min-w-[260px]">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">Marks</p>
                                  <Input
                                    type="number"
                                    value={gradeMarks}
                                    min={0}
                                    max={maxMarks != null ? maxMarks : undefined}
                                    onChange={(e) => setGradeMarks(e.target.value)}
                                  />
                                </div>
                                <div className="pt-6 text-right">
                                  <p className="text-xs text-muted-foreground">
                                    {maxMarks != null ? `Out of ${maxMarks}` : "—"}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">Feedback</p>
                                <textarea
                                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                  rows={3}
                                  value={gradeFeedback}
                                  onChange={(e) => setGradeFeedback(e.target.value)}
                                  placeholder="Add feedback (optional)"
                                />
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" onClick={() => setGradingStudentId("")} disabled={gradeMutation.isPending}>
                                  Cancel
                                </Button>
                                <LoadingButton
                                  loading={gradeMutation.isPending}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() => {
                                    const marksNum = Number(gradeMarks);
                                    if (Number.isNaN(marksNum)) {
                                      toast.error("Enter valid marks");
                                      return;
                                    }
                                    if (maxMarks != null && marksNum > maxMarks) {
                                      toast.error(`Marks cannot exceed ${maxMarks}`);
                                      return;
                                    }
                                    gradeMutation.mutate({
                                      row,
                                      marks: marksNum,
                                      feedback: gradeFeedback.trim().length ? gradeFeedback.trim() : undefined,
                                    });
                                  }}
                                >
                                  Save Grade
                                </LoadingButton>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={status === "PENDING" || gradeMutation.isPending}
                                onClick={() => {
                                  setGradingStudentId(row.studentId);
                                  setGradeMarks(row.marksAwarded != null ? String(row.marksAwarded) : "");
                                  setGradeFeedback(row.feedback ?? "");
                                }}
                              >
                                Grade
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setViewRow(row);
                                  setViewOpen(true);
                                }}
                              >
                                View
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <CardDescription>Update title, topic, due date, marks, and attachment.</CardDescription>
          </DialogHeader>

          {assignment && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Title</p>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Topic (optional)</p>
                <Select value={editTopicId} onValueChange={setEditTopicId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select topic (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {topics.map((t: { id: string; name: string }) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Description</p>
                <textarea
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Due Date</p>
                <Input type="datetime-local" value={editDueDateLocal} onChange={(e) => setEditDueDateLocal(e.target.value)} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Max Marks</p>
                <Input type="number" value={editMaxMarks} onChange={(e) => setEditMaxMarks(e.target.value)} min={0} placeholder="e.g. 50" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Attachment URL</p>
                <Input value={editAttachmentUrl} onChange={(e) => setEditAttachmentUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <LoadingButton
              loading={updateMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                const maxMarksNumber = editMaxMarks.trim().length ? Number(editMaxMarks) : undefined;
                const dueDate = editDueDateLocal.trim().length ? editDueDateLocal : undefined;
                updateMutation.mutate({
                  title: editTitle,
                  description: editDescription.trim().length ? editDescription : null,
                  topicId: editTopicId.trim().length ? editTopicId : undefined,
                  dueDate,
                  maxMarks: maxMarksNumber,
                  attachmentUrl: editAttachmentUrl.trim().length ? editAttachmentUrl : undefined,
                });
              }}
            >
              Save
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {viewRow ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold">{viewRow.studentName}</p>
                <p className="text-sm text-muted-foreground">Roll: {viewRow.rollNo}</p>
                <p className="mt-1 text-sm">
                  Status:{" "}
                  <span className="font-medium">
                    {viewRow.status}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Student Note</p>
                <p className="text-sm whitespace-pre-wrap">
                  {viewRow.note ?? "—"}
                </p>
              </div>

              {viewRow.attachmentUrl && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Attachment</p>
                  <a
                    className="text-sm text-primary underline break-all"
                    href={viewRow.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {viewRow.attachmentUrl}
                  </a>
                </div>
              )}

              {viewRow.status === "GRADED" && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Faculty Feedback</p>
                  <p className="text-sm whitespace-pre-wrap">{viewRow.feedback ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    Marks: {viewRow.marksAwarded ?? "—"}{" "}
                    {assignment?.maxMarks != null ? `/ ${assignment.maxMarks}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Graded at:{" "}
                    {viewRow.gradedAt ? new Date(viewRow.gradedAt).toLocaleString() : "—"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-sm text-muted-foreground">Select a submission row.</div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewOpen(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

