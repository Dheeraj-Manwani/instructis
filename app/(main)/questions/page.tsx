"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
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
import LoadingButton from "@/components/LoadingButton";
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
  fetchQuestions,
  fetchQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type QuestionListItem,
  type CreateQuestionPayload,
  type QuestionWithOptions,
} from "@/lib/api/questions";
import { fetchTopicsBySubject } from "@/lib/api/topics";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Animate, PageTransition } from "@/lib/utils/animations";
import { motion } from "motion/react";
import {
  questionFormSchema,
  type QuestionFormValues,
} from "@/lib/schemas/question.schema";

const SUBJECTS = [
  { value: "PHYSICS", label: "Physics" },
  { value: "CHEMISTRY", label: "Chemistry" },
  { value: "MATHEMATICS", label: "Mathematics" },
  { value: "ZOOLOGY", label: "Zoology" },
  { value: "BOTANY", label: "Botany" },
] as const;

const DIFFICULTIES = [
  { value: "EASY", label: "Easy" },
  { value: "MODERATE", label: "Moderate" },
  { value: "HARD", label: "Hard" },
] as const;

function truncate(str: string, len: number) {
  if (str.length <= len) return str;
  return str.slice(0, len) + "…";
}

export default function QuestionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [subject, setSubject] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [isPublishedFilter, setIsPublishedFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"createdAt" | "subject" | "difficulty">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search, subject, difficulty, isPublishedFilter]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithOptions | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const listParams = {
    page,
    limit,
    search: search || undefined,
    subject: subject || undefined,
    difficulty: difficulty || undefined,
    isPublished:
      isPublishedFilter === "true"
        ? true
        : isPublishedFilter === "false"
          ? false
          : undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.questions.list(listParams),
    queryFn: () => fetchQuestions(listParams),
  });

  const list = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 };

  const openCreate = () => {
    setEditingQuestion(null);
    setModalOpen(true);
  };

  const openEdit = (q: QuestionListItem) => {
    queryClient
      .fetchQuery({
        queryKey: queryKeys.questions.detail(q.id),
        queryFn: () => fetchQuestionById(q.id),
      })
      .then((full: QuestionWithOptions) => {
        setEditingQuestion(full);
        setModalOpen(true);
      })
      .catch(() => toast.error("Failed to load question"));
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingQuestion(null);
  };

  const invalidateList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.questions.lists() });
  }, [queryClient]);

  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      toast.success("Question deleted");
      setDeleteId(null);
      invalidateList();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <Animate variant="slideDown" delay={0.1}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Questions</h1>
              <p className="text-muted-foreground text-sm">
                Create, edit, and manage questions. Use filters and search to find them.
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Create question
              </Button>
            </motion.div>
          </div>
        </Animate>

        <Animate variant="slideUp" delay={0.2}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">All questions</CardTitle>
              <CardDescription>Search, filter, sort, and paginate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search by question text..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={subject || "all"} onValueChange={(v) => setSubject(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subjects</SelectItem>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={difficulty || "all"} onValueChange={(v) => setDifficulty(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={isPublishedFilter || "all"}
                  onValueChange={(v) => setIsPublishedFilter(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Published</SelectItem>
                    <SelectItem value="false">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v: typeof sortBy) => setSortBy(v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date</SelectItem>
                    <SelectItem value="subject">Subject</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
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
                <TableSkeleton rows={8} columns={7} />
              ) : list.length === 0 ? (
                <Animate variant="fadeIn">
                  <p className="text-muted-foreground py-8 text-center text-sm">No questions found.</p>
                </Animate>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Question</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Topic</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {list.map((q, index) => (
                          <motion.tr
                            key={q.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03, duration: 0.2 }}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="max-w-[280px] text-sm">
                              {truncate(q.text, 80)}
                            </TableCell>
                            <TableCell>{q.difficulty}</TableCell>
                            <TableCell>{q.subject}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {q.topicName ?? "—"}
                            </TableCell>
                            <TableCell>
                              {q.isPublished ? (
                                <Badge className="bg-primary/10 text-primary">Published</Badge>
                              ) : (
                                <Badge variant="outline">Draft</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(q.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => openEdit(q)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteId(q.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Animate variant="fadeIn" delay={0.3}>
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
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </motion.div>
                        <span className="text-muted-foreground text-sm">
                          Page {meta.page} of {meta.totalPages || 1}
                        </span>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={page >= meta.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </Animate>
                </>
              )}
            </CardContent>
          </Card>
        </Animate>

        <QuestionModal
          open={modalOpen}
          onClose={closeModal}
          editing={editingQuestion}
          onSuccess={() => {
            closeModal();
            invalidateList();
          }}
        />

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete question</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the question.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}

const defaultFormValues: QuestionFormValues = {
  text: "",
  difficulty: "MODERATE",
  subject: "PHYSICS",
  topicId: "",
  explanation: "",
  isPublished: false,
  options: [
    { text: "", isCorrect: false, orderIndex: 0 },
    { text: "", isCorrect: false, orderIndex: 1 },
    { text: "", isCorrect: false, orderIndex: 2 },
    { text: "", isCorrect: false, orderIndex: 3 },
  ],
};

function QuestionModal({
  open,
  onClose,
  editing,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  editing: QuestionWithOptions | null;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const opts = editing.options?.length
        ? editing.options.map((o, i) => ({
          text: o.text,
          isCorrect: false,
          orderIndex: i,
        }))
        : defaultFormValues.options;
      const firstCorrectIndex = editing.options?.findIndex((o) => o.isCorrect) ?? -1;
      if (firstCorrectIndex >= 0 && opts?.[firstCorrectIndex] !== undefined) {
        opts[firstCorrectIndex]!.isCorrect = true;
      }
      form.reset({
        text: editing.text,
        difficulty: editing.difficulty as QuestionFormValues["difficulty"],
        subject: editing.subject as QuestionFormValues["subject"],
        topicId: editing.topicId ?? "",
        explanation: editing.explanation ?? "",
        isPublished: editing.isPublished,
        options: opts,
      });
    } else {
      form.reset(defaultFormValues);
    }
  }, [open, editing, form]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateQuestionPayload) => createQuestion(payload),
    onSuccess: () => {
      toast.success("Question created");
      onSuccess();
      form.reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateQuestionPayload> }) =>
      updateQuestion(id, payload),
    onSuccess: () => {
      toast.success("Question updated");
      onSuccess();
      form.reset();
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.details() });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (values: QuestionFormValues) => {
    const payload: CreateQuestionPayload = {
      text: values.text,
      type: "MCQ",
      difficulty: values.difficulty,
      subject: values.subject,
      topicId: values.topicId || undefined,
      explanation: values.explanation || undefined,
      isPublished: values.isPublished,
      options: values.options?.length
        ? values.options.filter((o) => o.text.trim()).map((o, i) => ({ ...o, orderIndex: i }))
        : undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const selectedSubject = form.watch("subject");
  const { data: topics = [] } = useQuery({
    queryKey: queryKeys.topics.list(selectedSubject),
    queryFn: () => fetchTopicsBySubject(selectedSubject),
    enabled: !!selectedSubject,
  });

  const options = form.watch("options") ?? [];

  const setCorrectOption = (index: number) => {
    options.forEach((_, i) => {
      form.setValue(`options.${i}.isCorrect`, i === index);
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-t-4 border-t-primary p-0">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="border-b border-border/80 bg-primary/5 px-6 py-4"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground text-lg">
              {editing ? "Edit question" : "Create question"}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              {editing ? "Update the question details below." : "Add question text, options, and mark the correct answer."}
            </p>
          </DialogHeader>
        </motion.div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
            <div className="space-y-4 px-6 py-5">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Question text</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[88px] w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Enter the question..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive text-xs" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Subject</FormLabel>
                      <Select
                        onValueChange={(v) => {
                          field.onChange(v);
                          form.setValue("topicId", "");
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-border bg-muted/30 focus:ring-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUBJECTS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
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
                  name="topicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Topic (optional)</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                        value={field.value || "none"}
                        disabled={!selectedSubject || topics.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-border bg-muted/30 focus:ring-primary/20">
                            <SelectValue placeholder="Select topic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {topics.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
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
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-border bg-muted/30 focus:ring-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DIFFICULTIES.map((d) => (
                            <SelectItem key={d.value} value={d.value}>
                              {d.label}
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
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 pt-8 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </FormControl>
                      <FormLabel className="mt-0! cursor-pointer text-foreground font-medium">Published</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Explanation (optional)</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[64px] w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Add an explanation or solution..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-4">
                <p className="text-foreground text-sm font-medium">
                  Options <span className="text-muted-foreground font-normal">(select one correct answer)</span>
                </p>
                <div className="space-y-2">
                  {(form.watch("options") ?? []).map((opt, i) => (
                    <FormField
                      key={i}
                      control={form.control}
                      name={`options.${i}.text`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <div
                            className={cn(
                              "flex items-center gap-3 rounded-xl border-2 p-3 transition-colors",
                              opt?.isCorrect
                                ? "border-primary bg-primary/10"
                                : "border-border bg-background hover:border-primary/50"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => setCorrectOption(i)}
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                                opt?.isCorrect
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/40 bg-muted/50 text-muted-foreground"
                              )}
                            >
                              {String.fromCharCode(65 + i)}
                            </button>
                            <FormControl>
                              <Input
                                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormField
                            control={form.control}
                            name={`options.${i}.isCorrect`}
                            render={({ field: f }) => (
                              <FormItem className="hidden">
                                <FormControl>
                                  <Checkbox
                                    checked={f.value}
                                    onCheckedChange={(checked) => {
                                      if (checked) setCorrectOption(i);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormMessage className="text-destructive text-xs" />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border bg-muted/20 px-6 py-4">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LoadingButton
                  type="submit"
                  className="rounded-xl bg-primary font-medium hover:bg-primary/90"
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  {editing ? "Update" : "Create"}
                </LoadingButton>
              </motion.div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
