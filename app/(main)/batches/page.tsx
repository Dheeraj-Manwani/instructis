"use client";

import { useState, useEffect } from "react";
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
import { queryKeys } from "@/lib/api/query-keys";
import {
  fetchBatches,
  createBatch,
  updateBatch,
  fetchStudentsNotInBatch,
  fetchFacultiesNotInBatch,
  addStudentsToBatch,
  addFacultiesToBatch,
  type BatchListItem,
  type CreateBatchPayload,
  type UserListItem,
} from "@/lib/api/batches";
import { Plus, Pencil, ChevronLeft, ChevronRight, Users, UserCog } from "lucide-react";
import { toast } from "react-hot-toast";
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

  useEffect(() => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Batches</h1>
          <p className="text-muted-foreground text-sm">
            View and manage batches. Set a batch to inactive instead of deleting it.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Create batch
        </Button>
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students-not-in-batch", batch?.id],
    queryFn: () => fetchStudentsNotInBatch(batch?.id || ""),
    enabled: open && !!batch?.id,
  });

  const mutation = useMutation({
    mutationFn: (studentIds: string[]) =>
      addStudentsToBatch(batch?.id || "", studentIds),
    onSuccess: () => {
      toast.success("Students added to batch");
      setSelectedIds([]);
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
      setSelectedIds([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Students to {batch?.name}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading students...
          </div>
        ) : students.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No available students found.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {students.map((student) => (
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
            <div className="text-sm text-muted-foreground">
              {selectedIds.length} student{selectedIds.length !== 1 ? "s" : ""}{" "}
              selected
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
      setSelectedIds([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Faculties to {batch?.name}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading faculties...
          </div>
        ) : faculties.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No available faculties found.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {faculties.map((faculty) => (
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
            <div className="text-sm text-muted-foreground">
              {selectedIds.length} facult{selectedIds.length !== 1 ? "ies" : "y"}{" "}
              selected
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
                Add Faculties
              </LoadingButton>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

