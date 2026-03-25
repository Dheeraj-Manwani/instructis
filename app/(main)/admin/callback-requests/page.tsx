"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/LoadingButton";
import { toast } from "react-hot-toast";
import type { CallbackStatus, CourseMode, ExamType } from "@prisma/client";
import { fetchCallbackRequests, updateCallbackRequestStatus } from "@/lib/api/callback-requests";
import type { CallbackRequestListItem } from "@/lib/api/callback-requests";
import { ShieldCheck } from "lucide-react";

type StatusFilter = "ALL" | CallbackStatus;

function formatCourseMode(mode: CourseMode | null) {
  if (!mode) return "—";
  if (mode === "ONLINE") return "Online";
  if (mode === "CLASSROOM") return "Classroom";
  if (mode === "HYBRID") return "Hybrid";
  return String(mode);
}

function formatExamType(exam: ExamType | null) {
  if (!exam) return "—";
  return exam === "JEE" ? "JEE" : "NEET";
}

function getStatusBadge(status: CallbackStatus) {
  const map: Record<CallbackStatus, { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "bg-secondary text-secondary-foreground" },
    CALLED: { label: "Called", className: "bg-blue-500/10 text-blue-500" },
    CONVERTED: { label: "Converted", className: "bg-emerald-500/10 text-emerald-500" },
    NOT_INTERESTED: { label: "Not Interested", className: "bg-destructive/10 text-destructive" },
  };
  return map[status];
}

export default function CallbackRequestsAdminPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const statusForApi = statusFilter === "ALL" ? undefined : statusFilter;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["callbackRequests", page, limit, statusForApi ?? "ALL"],
    queryFn: () => fetchCallbackRequests({ page, limit, status: statusForApi }),
  });

  const requests = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 };

  const [statusById, setStatusById] = useState<Record<string, CallbackStatus>>({});
  const [noteById, setNoteById] = useState<Record<string, string>>({});
  const [savingRowId, setSavingRowId] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      adminNote,
    }: {
      id: string;
      status: CallbackStatus;
      adminNote: string | null;
    }) => updateCallbackRequestStatus(id, { status, adminNote }),
    onSuccess: () => {
      toast.success("Request updated");
      queryClient.invalidateQueries({ queryKey: ["callbackRequests"] });
      setStatusById({});
      setNoteById({});
    },
    onError: (e: Error) => {
      toast.error(e.message || "Failed to update request");
    },
  });

  const statusOptions = useMemo(
    () =>
      [
        { value: "ALL" as const, label: "All" },
        { value: "PENDING" as const, label: "Pending" },
        { value: "CALLED" as const, label: "Called" },
        { value: "CONVERTED" as const, label: "Converted" },
        { value: "NOT_INTERESTED" as const, label: "Not Interested" },
      ] as const,
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
          <ShieldCheck className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Callback Requests</h2>
          <p className="text-sm text-muted-foreground">
            Review incoming callback requests and update their status.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Filter requests by current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Requests</CardTitle>
          <CardDescription>
            {isFetching ? "Refreshing..." : `${meta.total} request(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Called At</TableHead>
                <TableHead className="w-[280px]">Admin Note</TableHead>
                <TableHead className="text-right">Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                    Loading requests...
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                    No requests found.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((r: CallbackRequestListItem) => {
                  const draftStatus = statusById[r.id] ?? r.status;
                  const draftNote = noteById[r.id] ?? r.adminNote ?? "";
                  const badge = getStatusBadge(draftStatus);
                  const isCurrentRowSaving =
                    updateMutation.isPending && savingRowId === r.id;

                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{r.mobileNumber}</TableCell>
                      <TableCell>{formatCourseMode(r.courseMode as CourseMode | null)}</TableCell>
                      <TableCell>{formatExamType(r.examType as ExamType | null)}</TableCell>
                      <TableCell>
                        <Badge className={badge.className}>{badge.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.calledAt ? new Date(r.calledAt).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Select
                            value={draftStatus}
                            onValueChange={(v) => {
                              setStatusById((prev) => ({ ...prev, [r.id]: v as CallbackStatus }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="CALLED">Called</SelectItem>
                              <SelectItem value="CONVERTED">Converted</SelectItem>
                              <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            value={draftNote}
                            placeholder="Optional admin note"
                            onChange={(e) => {
                              setNoteById((prev) => ({ ...prev, [r.id]: e.target.value }));
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <LoadingButton
                          loading={isCurrentRowSaving}
                          onClick={() => {
                            const adminNote =
                              draftNote.trim().length > 0 ? draftNote.trim() : null;
                            setSavingRowId(r.id);
                            updateMutation.mutate(
                              {
                                id: r.id,
                                status: draftStatus,
                                adminNote,
                              },
                              {
                                onSettled: () => {
                                  setSavingRowId(null);
                                },
                              },
                            );
                          }}
                          className="ml-auto"
                        >
                          Save
                        </LoadingButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages || 1}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

