"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useBreadcrumb } from "@/store/BreadcrumbContext";
import { useRouter } from "nextjs-toploader/app";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoadingButton from "@/components/LoadingButton";
import { queryKeys } from "@/lib/api/query-keys";
import {
  fetchMyBatches,
  type BatchListItem,
} from "@/lib/api/batches";
import { fetchTopicsBySubject } from "@/lib/api/topics";
import {
  fetchAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  type AssignmentListItem,
} from "@/lib/api/assignments";
import {
  type CreateAssignmentInput,
} from "@/lib/schemas/assignment.schema";

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

function statusPillClass(status: string) {
  switch (status) {
    case "DRAFT":
      return "bg-muted text-muted-foreground border-border";
    case "PUBLISHED":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-600/30";
    case "CLOSED":
      return "bg-slate-500/10 text-slate-700 border-slate-600/20";
    default:
      return "bg-muted";
  }
}

function formatDueDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

export default function FacultyAssignmentsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumb([{ label: "Assignments", href: "/faculty/assignments" }]);
  }, [setBreadcrumb]);

  const { data: batches = [] } = useQuery({
    queryKey: ["my-batches"],
    queryFn: fetchMyBatches,
  });

  const {
    data: assignmentsRaw,
    isLoading: isAssignmentsLoading,
  } = useQuery({
    queryKey: ["assignments", "faculty", "list"] as const,
    queryFn: () => fetchAssignments(),
  });

  const assignments = (assignmentsRaw ?? []) as AssignmentListItem[];

  const [batchFilter, setBatchFilter] = useState<string>("ALL");
  const [subjectFilter, setSubjectFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      if (batchFilter !== "ALL" && a.batch.id !== batchFilter) return false;
      if (subjectFilter !== "ALL" && a.subject !== subjectFilter) return false;
      if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
      return true;
    });
  }, [assignments, batchFilter, subjectFilter, statusFilter]);

  const [createOpen, setCreateOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [batchId, setBatchId] = useState("");
  const [subject, setSubject] = useState<Subject>("PHYSICS");
  const [topicId, setTopicId] = useState<string>("");
  const [dueDateLocal, setDueDateLocal] = useState<string>("");
  const [maxMarks, setMaxMarks] = useState<string>("");
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");

  const [publishNow, setPublishNow] = useState(false);

  // Topics are filtered by the selected subject.
  const { data: topics = [] } = useQuery({
    queryKey: queryKeys.topics.list(subject),
    queryFn: () => fetchTopicsBySubject(subject),
    enabled: createOpen,
  });

  useEffect(() => {
    if (!createOpen) return;
    if (batches.length > 0 && !batchId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBatchId(batches[0]!.id);
    }
  }, [createOpen, batches, batchId]);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!batchId) throw new Error("Select a batch");
      if (!title.trim()) throw new Error("Title is required");

      const dueDateISO = dueDateLocal ? new Date(dueDateLocal).toISOString() : undefined;
      const maxMarksNumber = maxMarks.trim().length ? Number(maxMarks) : undefined;

      const payload: CreateAssignmentInput = {
        title: title.trim(),
        description: description.trim().length ? description.trim() : undefined,
        subject,
        topicId: topicId.trim().length ? topicId.trim() : undefined,
        batchId,
        dueDate: dueDateISO,
        maxMarks: maxMarksNumber != null ? maxMarksNumber : undefined,
        attachmentUrl: attachmentUrl.trim().length ? attachmentUrl.trim() : undefined,
      };

      const created = (await createAssignment(payload)) as { id: string };
      if (publishNow) {
        await updateAssignment(created.id, { status: "PUBLISHED" });
      }
      return created.id;
    },
    onSuccess: async () => {
      toast.success(publishNow ? "Assignment published" : "Assignment created");
      setCreateOpen(false);
      setPublishNow(false);
      setTitle("");
      setDescription("");
      setTopicId("");
      setDueDateLocal("");
      setMaxMarks("");
      setAttachmentUrl("");
      await queryClient.invalidateQueries({
        queryKey: ["assignments", "faculty", "list"] as const,
      });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to create assignment"),
  });

  const publishCloseMutation = useMutation({
    mutationFn: async ({
      assignmentId,
      nextStatus,
    }: {
      assignmentId: string;
      nextStatus: "PUBLISHED" | "CLOSED";
    }) => updateAssignment(assignmentId, { status: nextStatus }),
    onSuccess: async () => {
      toast.success("Assignment updated");
      await queryClient.invalidateQueries({
        queryKey: ["assignments", "faculty", "list"] as const,
      });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update assignment"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await deleteAssignment(assignmentId);
    },
    onSuccess: async () => {
      toast.success("Assignment deleted");
      await queryClient.invalidateQueries({
        queryKey: ["assignments", "faculty", "list"] as const,
      });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete assignment"),
  });

  const now = new Date().getTime();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground text-sm">Create and manage assignments for your batches.</p>
        </div>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setCreateOpen(true)}>
          + Create Assignment
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Filter assignments by batch, subject, and status.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Batch</p>
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All Batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Batches</SelectItem>
                {batches.map((b: BatchListItem) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Subject</p>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Subjects</SelectItem>
                {SUBJECTS.map((s) => (
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
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
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
            const due = a.dueDate ? new Date(a.dueDate).getTime() : null;
            const overdue = due != null && due < now && a.status !== "CLOSED";
            const progressPercent = a.totalStudents > 0 ? Math.round((a.submittedCount / a.totalStudents) * 100) : 0;

            return (
              <Card key={a.id} className="overflow-hidden">
                <div className={`h-1.5 w-full ${subjectBarClass(a.subject as Subject)}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate">{a.title}</CardTitle>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{a.batch.name}</Badge>
                        <Badge variant="outline" className={statusPillClass(a.subject as string)}>
                          {a.subject}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={statusPillClass(a.status)}>{a.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">Due date</div>
                    <div className={overdue ? "text-sm font-semibold text-destructive" : "text-sm font-semibold"}>
                      {formatDueDate(a.dueDate)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {a.submittedCount} / {a.totalStudents} submitted
                    </p>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${progressPercent >= 75 ? "bg-emerald-600" : progressPercent >= 50 ? "bg-amber-600" : "bg-destructive"}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <Button variant="outline" onClick={() => router.push(`/faculty/assignments/${a.id}`)}>
                      View Submissions
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/faculty/assignments/${a.id}`)}>
                      Edit
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    {a.status === "DRAFT" && (
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() =>
                          publishCloseMutation.mutate({
                            assignmentId: a.id,
                            nextStatus: "PUBLISHED",
                          })
                        }
                      >
                        Publish
                      </Button>
                    )}
                    {a.status === "PUBLISHED" && (
                      <Button
                        className="bg-slate-600 hover:bg-slate-700 text-white"
                        onClick={() =>
                          publishCloseMutation.mutate({
                            assignmentId: a.id,
                            nextStatus: "CLOSED",
                          })
                        }
                      >
                        Close
                      </Button>
                    )}
                    {a.status === "CLOSED" && (
                      <Button variant="outline" disabled>
                        Closed
                      </Button>
                    )}

                    {a.status === "DRAFT" ? (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (!window.confirm("Delete this draft assignment?")) return;
                          deleteMutation.mutate(a.id);
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    ) : (
                      <span />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={(o) => setCreateOpen(o)}>
        <DialogContent className="max-w-md w-full right-0 left-auto top-0 translate-x-0 translate-y-0 rounded-l-none">
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
            <CardDescription>Set details and save as Draft or Publish.</CardDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Title</p>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter Test - Kinematics" />
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Batch</p>
              <Select value={batchId} onValueChange={setBatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b: BatchListItem) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Subject</p>
              <Select
                value={subject}
                onValueChange={(v) => {
                  setSubject(v as Subject);
                  setTopicId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Topic (optional)</p>
              <Select value={topicId} onValueChange={setTopicId}>
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
              <p className="text-xs font-medium text-muted-foreground mb-2">Description (optional)</p>
              <textarea
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add assignment description..."
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Due Date</p>
                <Input type="datetime-local" value={dueDateLocal} onChange={(e) => setDueDateLocal(e.target.value)} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Max Marks (optional)</p>
                <Input type="number" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} min={0} placeholder="e.g. 50" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Attachment URL (optional)</p>
                <Input value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPublishNow(false);
                createMutation.mutate();
              }}
              disabled={createMutation.isPending}
            >
              Save as Draft
            </Button>
            <LoadingButton
              loading={createMutation.isPending && publishNow}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                setPublishNow(true);
                createMutation.mutate();
              }}
            >
              Publish Now
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

