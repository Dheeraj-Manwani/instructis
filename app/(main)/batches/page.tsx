"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { queryKeys } from "@/lib/api/query-keys";
import {
  fetchBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  fetchStudentsNotInBatch,
  fetchStudentsInBatch,
  fetchFacultiesNotInBatch,
  fetchFacultiesInBatch,
  addStudentsToBatch,
  addFacultiesToBatch,
  type BatchListItem,
  type CreateBatchPayload,
  type UserListItem,
  type StudentInBatch,
  type FacultyInBatch,
  bulkImportStudentsAndFaculty,
  downloadStudentFacultyTemplate,
  type BulkImportErrorDetail,
} from "@/lib/api/batches";
import { Plus, Pencil, ChevronLeft, ChevronRight, Users, UserCog, Trash2 } from "lucide-react";
import { RoleEnum } from "@prisma/client";
import { toast } from "react-hot-toast";
import { getProfile } from "@/lib/api/profile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingButton from "@/components/LoadingButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import {
  batchFormSchema,
  type BatchFormValues,
} from "@/lib/schemas/batch.schema";

const EXAM_TYPES = [
  { value: "JEE", label: "JEE" },
  { value: "NEET", label: "NEET" },
] as const;

const defaultFormValues: BatchFormValues = {
  name: "",
  examType: "JEE",
  year: new Date().getFullYear(),
  isActive: true,
};

export default function BatchesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [examType, setExamType] = useState<string>("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"createdAt" | "name" | "year">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchListItem | null>(null);
  const [studentsModalOpen, setStudentsModalOpen] = useState(false);
  const [facultiesModalOpen, setFacultiesModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchListItem | null>(null);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);
  const [deleteBatchId, setDeleteBatchId] = useState<string | null>(null);
  const deleteToastIdRef = useRef<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
  const isAdmin = profile?.user.role === RoleEnum.ADMIN;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [examType, isActiveFilter]);

  const listParams = {
    page,
    limit,
    examType: examType || undefined,
    isActive:
      isActiveFilter === "true"
        ? true
        : isActiveFilter === "false"
          ? false
          : undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.batches.list(listParams),
    queryFn: () => fetchBatches(listParams),
  });

  const list = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 };

  const openCreate = () => {
    setEditingBatch(null);
    setModalOpen(true);
  };

  const openEdit = (batch: BatchListItem) => {
    setEditingBatch(batch);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBatch(null);
  };

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.batches.lists() });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBatch(id),
    onMutate: () => {
      deleteToastIdRef.current = toast.loading("Deleting batch...");
    },
    onSuccess: () => {
      if (deleteToastIdRef.current) toast.dismiss(deleteToastIdRef.current);
      toast.success("Batch deleted");
      setDeleteBatchId(null);
      invalidateList();
    },
    onError: (e: Error) => {
      if (deleteToastIdRef.current) toast.dismiss(deleteToastIdRef.current);
      toast.error(e.message || "Failed to delete batch");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Batches</h1>
          <p className="text-muted-foreground text-sm">
            View and manage batches. Admins can delete a batch; otherwise set it inactive.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* <Button
            variant="outline"
            onClick={() => setBulkImportModalOpen(true)}
          >
            Bulk Import (Excel)
          </Button> */}
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create batch
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All batches</CardTitle>
          <CardDescription>Filter, sort, and paginate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={examType || "all"}
              onValueChange={(v) => setExamType(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All exams</SelectItem>
                {EXAM_TYPES.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={isActiveFilter || "all"}
              onValueChange={(v) => setIsActiveFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: typeof sortBy) => setSortBy(v)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
            >
              {sortOrder === "asc" ? "Asc" : "Desc"}
            </Button>
          </div>

          {isLoading ? (
            <TableSkeleton rows={8} columns={4} />
          ) : list.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No batches found.
            </p>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{b.examType}</Badge>
                        </TableCell>
                        <TableCell>{b.year}</TableCell>
                        <TableCell>
                          {b.isActive ? (
                            <Badge className="bg-primary/10 text-primary">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(b)}
                              title="Edit batch"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedBatch(b);
                                setStudentsModalOpen(true);
                              }}
                              title="Add students"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedBatch(b);
                                setFacultiesModalOpen(true);
                              }}
                              title="Add faculties"
                            >
                              <UserCog className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setDeleteBatchId(b.id)}
                                title="Delete batch"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                  Showing {(meta.page - 1) * meta.limit + 1}–
                  {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                </p>
                <div className="flex items-center gap-2">
                  <Select
                    value={String(limit)}
                    onValueChange={(v) => {
                      setLimit(Number(v));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 50].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-muted-foreground text-sm">
                    Page {meta.page} of {meta.totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <BatchModal
        open={modalOpen}
        onClose={closeModal}
        editing={editingBatch}
        onSuccess={() => {
          closeModal();
          invalidateList();
        }}
      />
      <AddStudentsModal
        open={studentsModalOpen}
        onClose={() => {
          setStudentsModalOpen(false);
          setSelectedBatch(null);
        }}
        batch={selectedBatch}
        onSuccess={() => {
          setStudentsModalOpen(false);
          setSelectedBatch(null);
          invalidateList();
        }}
      />
      <AddFacultiesModal
        open={facultiesModalOpen}
        onClose={() => {
          setFacultiesModalOpen(false);
          setSelectedBatch(null);
        }}
        batch={selectedBatch}
        onSuccess={() => {
          setFacultiesModalOpen(false);
          setSelectedBatch(null);
          invalidateList();
        }}
      />
      <BulkImportModal
        open={bulkImportModalOpen}
        onClose={() => setBulkImportModalOpen(false)}
        batches={list}
      />

      <AlertDialog
        open={!!deleteBatchId}
        onOpenChange={(open) => !open && setDeleteBatchId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete batch</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the batch&apos;s tests and attempts, detaches students and faculties from the
              batch, and clears batch references. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteBatchId && deleteMutation.mutate(deleteBatchId)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BatchModal({
  open,
  onClose,
  editing,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  editing: BatchListItem | null;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: defaultFormValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.reset({
        name: editing.name,
        examType: editing.examType as BatchFormValues["examType"],
        year: editing.year,
        isActive: editing.isActive,
      });
    } else {
      form.reset(defaultFormValues);
    }
  }, [open, editing, form]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateBatchPayload) => createBatch(payload),
    onSuccess: () => {
      toast.success("Batch created");
      onSuccess();
      form.reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateBatchPayload>;
    }) => updateBatch(id, payload),
    onSuccess: () => {
      toast.success("Batch updated");
      onSuccess();
      form.reset();
      queryClient.invalidateQueries({ queryKey: queryKeys.batches.details() });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (values: BatchFormValues) => {
    const payload: CreateBatchPayload = {
      name: values.name,
      examType: values.examType,
      year: values.year,
      isActive: values.isActive,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit batch" : "Create batch"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. JEE 2025 Batch A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="examType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXAM_TYPES.map((e) => (
                          <SelectItem key={e.value} value={e.value}>
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={2000}
                        max={2100}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="mt-0! cursor-pointer">Active</FormLabel>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editing ? "Update" : "Create"}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function AddStudentsModal({
  open,
  onClose,
  batch,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  batch: BatchListItem | null;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students-not-in-batch", batch?.id],
    queryFn: () => fetchStudentsNotInBatch(batch?.id || ""),
    enabled: open && !!batch?.id,
  });
  const { data: existingStudents = [], isLoading: existingLoading } = useQuery({
    queryKey: ["students-in-batch", batch?.id],
    queryFn: () => fetchStudentsInBatch(batch?.id || ""),
    enabled: open && !!batch?.id,
  });

  const mutation = useMutation({
    mutationFn: (studentIds: string[]) =>
      addStudentsToBatch(batch?.id || "", studentIds),
    onSuccess: () => {
      toast.success("Students added to batch");
      setSelectedIds([]);
      if (batch?.id) {
        queryClient.invalidateQueries({ queryKey: ["students-not-in-batch", batch.id] });
        queryClient.invalidateQueries({ queryKey: ["students-in-batch", batch.id] });
      }
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one student");
      return;
    }
    mutation.mutate(selectedIds);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIds([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Students to {batch?.name}</DialogTitle>
        </DialogHeader>
        {(isLoading || existingLoading) ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading students...
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Available students to add</h3>
              {students.length === 0 ? (
                <div className="py-4 text-sm text-muted-foreground">
                  No available students found.
                </div>
              ) : (
                <div className="max-h-[320px] overflow-y-auto space-y-2 border rounded-md p-2">
                  {students.map((student: UserListItem) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => toggleSelection(student.id)}
                    >
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(student.id)}
                          onCheckedChange={() => toggleSelection(student.id)}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 text-sm text-muted-foreground">
                {selectedIds.length} student{selectedIds.length !== 1 ? "s" : ""} selected
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Existing students in this batch</h3>
              {existingStudents.length === 0 ? (
                <div className="py-4 text-sm text-muted-foreground">
                  No students currently in this batch.
                </div>
              ) : (
                <div className="max-h-[240px] overflow-y-auto space-y-2 border rounded-md p-2 bg-muted/40">
                  {existingStudents.map((student: StudentInBatch) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-background"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{student.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                These students are already part of this batch.
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <LoadingButton
                onClick={handleSubmit}
                loading={mutation.isPending}
                disabled={selectedIds.length === 0}
              >
                Add Students
              </LoadingButton>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AddFacultiesModal({
  open,
  onClose,
  batch,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  batch: BatchListItem | null;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: faculties = [], isLoading } = useQuery({
    queryKey: ["faculties-not-in-batch", batch?.id],
    queryFn: () => fetchFacultiesNotInBatch(batch?.id || ""),
    enabled: open && !!batch?.id,
  });

  const mutation = useMutation({
    mutationFn: (facultyIds: string[]) =>
      addFacultiesToBatch(batch?.id || "", facultyIds),
    onSuccess: () => {
      toast.success("Faculties added to batch");
      setSelectedIds([]);
      if (batch?.id) {
        queryClient.invalidateQueries({ queryKey: ["faculties-not-in-batch", batch.id] });
        queryClient.invalidateQueries({ queryKey: ["faculties-in-batch", batch.id] });
      }
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one faculty");
      return;
    }
    mutation.mutate(selectedIds);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIds([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Faculties to {batch?.name}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading faculties...
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Available faculties to add</h3>
              {faculties.length === 0 ? (
                <div className="py-4 text-sm text-muted-foreground">
                  No available faculties found.
                </div>
              ) : (
                <div className="max-h-[320px] overflow-y-auto space-y-2 border rounded-md p-2">
                  {faculties.map((faculty: UserListItem) => (
                    <div
                      key={faculty.id}
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => toggleSelection(faculty.id)}
                    >
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(faculty.id)}
                          onCheckedChange={() => toggleSelection(faculty.id)}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{faculty.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {faculty.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 text-sm text-muted-foreground">
                {selectedIds.length} facult{selectedIds.length !== 1 ? "ies" : "y"} selected
              </div>
            </div>

            <FacultiesInBatchSection batchId={batch?.id} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <LoadingButton
                onClick={handleSubmit}
                loading={mutation.isPending}
                disabled={selectedIds.length === 0}
              >
                Add Faculties
              </LoadingButton>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BulkImportModal({
  open,
  onClose,
  batches,
}: {
  open: boolean;
  onClose: () => void;
  batches: BatchListItem[];
}) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState<BulkImportErrorDetail[] | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleDownloadTemplate = async () => {
    try {
      const url = await downloadStudentFacultyTemplate();
      window.open(url, "_blank");
    } catch (e) {
      const err = e as Error;
      toast.error(err.message || "Failed to download template");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select an Excel file to import");
      return;
    }
    setIsImporting(true);
    setErrors(null);
    try {
      const result = await bulkImportStudentsAndFaculty(file, selectedBatchId || undefined);
      toast.success(
        `Imported ${result.studentsImported} student(s) and ${result.facultyImported} faculty member(s) successfully`
      );
      setFile(null);
      setSelectedBatchId("");
      onClose();
    } catch (e: unknown) {
      const details = (e as { response?: { data?: { error?: { details?: BulkImportErrorDetail[] } } } })?.response?.data?.error?.details as
        | BulkImportErrorDetail[]
        | undefined;
      if (details && Array.isArray(details) && details.length > 0) {
        setErrors(details);
        toast.error("Import failed due to validation errors");
      } else {
        const err = e as Error;
        toast.error(err.message || "Bulk import failed");
      }
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSelectedBatchId("");
      setFile(null);
      setErrors(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1">
            <span>Bulk Import Students & Faculties</span>
            <span className="text-xs font-normal text-muted-foreground">
              Use the standard Excel template to add multiple students and faculties at once.
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-2">
          {/* Top: Batch selection + quick summary */}
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-start">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Target batch (optional)
              </Label>
              <Select
                value={selectedBatchId || "none"}
                onValueChange={(value) => {
                  setSelectedBatchId(value === "none" ? "" : value);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="No batch selected" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No batch (do not link)</SelectItem>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} ({b.examType} – {b.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Pick a batch to auto-link new faculties and students (when no{" "}
                <span className="font-semibold">Batch Name</span> is set in Excel).
              </p>
            </div>

            <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/70 px-3 py-3 text-[11px] text-emerald-900 space-y-1.5 shadow-[0_0_0_1px_rgba(16,185,129,0.05)]">
              <p className="font-semibold text-emerald-900 text-xs flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Smart validation
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Creates users, students and faculties from both sheets.</li>
                <li>All-or-nothing save if every row passes validation.</li>
              </ul>
            </div>
          </div>

          {/* Middle: Template download + file upload */}
          <div className="grid gap-4 md:grid-cols-2 items-start">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Download template
              </Label>
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="gap-1.5"
                >
                  Download Excel template
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Includes separate <span className="font-semibold">Students</span> and{" "}
                <span className="font-semibold">Faculty</span> sheets.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Upload filled template
              </Label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                disabled={isImporting}
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-[11px] text-muted-foreground">
                All rows must pass validation; otherwise nothing is imported.
              </p>
              {file && (
                <p className="text-[11px] text-foreground/80 truncate">
                  Selected file: <span className="font-medium">{file.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Error panel */}
          {errors && errors.length > 0 && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 max-h-44 overflow-auto space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-destructive">
                  Validation errors ({errors.length})
                </p>
                <span className="text-[11px] text-destructive/80">
                  Fix these in Excel and re-upload. No rows have been imported yet.
                </span>
              </div>
              <ul className="space-y-0.5 text-xs text-destructive">
                {errors.slice(0, 10).map((err, idx) => (
                  <li key={idx}>
                    Row {err.row} – <span className="font-semibold">{err.field}</span>: {err.reason}
                  </li>
                ))}
                {errors.length > 10 && (
                  <li>...and {errors.length - 10} more</li>
                )}
              </ul>
            </div>
          )}

          {/* Footer actions */}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <LoadingButton
              type="button"
              loading={isImporting}
              onClick={handleImport}
              disabled={!file}
            >
              Start Import
            </LoadingButton>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FacultiesInBatchSection({ batchId }: { batchId: string | null | undefined }) {
  const { data: existingFaculties = [], isLoading } = useQuery({
    queryKey: ["faculties-in-batch", batchId],
    queryFn: () => fetchFacultiesInBatch(batchId || ""),
    enabled: !!batchId,
  });

  if (isLoading) {
    return (
      <div>
        <h3 className="text-sm font-semibold mb-2">Existing faculties in this batch</h3>
        <div className="py-4 text-sm text-muted-foreground">Loading existing faculties...</div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">Existing faculties in this batch</h3>
      {existingFaculties.length === 0 ? (
        <div className="py-4 text-sm text-muted-foreground">
          No faculties currently assigned to this batch.
        </div>
      ) : (
        <div className="max-h-[240px] overflow-y-auto space-y-2 border rounded-md p-2 bg-muted/40">
          {existingFaculties.map((faculty: FacultyInBatch) => (
            <div
              key={faculty.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-background"
            >
              <div className="flex-1">
                <p className="font-medium">{faculty.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {faculty.user.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-2 text-xs text-muted-foreground">
        These faculties are already assigned to this batch.
      </div>
    </div>
  );
}

