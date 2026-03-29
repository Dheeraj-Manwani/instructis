"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { motion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  Atom,
  Beaker,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Leaf,
  Repeat2,
  Sigma,
  Sprout,
  Trash2,
} from "lucide-react";
import { useBreadcrumb } from "@/store/BreadcrumbContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassStatusBadge } from "@/components/class-status-badge";
import { SUBJECTS, SUBJECT_THEME } from "@/lib/constants/class-schedule";
import { cn } from "@/lib/utils";
import {
  createFacultyRecurringClasses,
  createFacultyClass,
  fetchFacultyDeleteImpact,
  deleteFacultyClass,
  fetchFacultyClasses,
  type ClassSessionItem,
  updateFacultyClass,
} from "@/lib/api/classes";
import type {
  ClassEditDeleteScope,
  CreateClassBody,
  CreateRecurringClassBody,
  UpdateClassBody,
} from "@/lib/schemas/class.schema";
import type { SubjectEnum } from "@prisma/client";

const HOUR_START = 9;
const HOUR_END = 20;
const SLOT_MINUTES = 30;
const TOTAL_SLOTS = ((HOUR_END - HOUR_START) * 60) / SLOT_MINUTES;
const MAX_RECURRING_DAYS = 31;

const RECURRING_WEEKDAY_OPTIONS = [
  { key: "SUNDAY", label: "Sun", index: 0 },
  { key: "MONDAY", label: "Mon", index: 1 },
  { key: "TUESDAY", label: "Tue", index: 2 },
  { key: "WEDNESDAY", label: "Wed", index: 3 },
  { key: "THURSDAY", label: "Thu", index: 4 },
  { key: "FRIDAY", label: "Fri", index: 5 },
  { key: "SATURDAY", label: "Sat", index: 6 },
] as const;

function subjectIcon(subject: SubjectEnum) {
  switch (subject) {
    case "PHYSICS":
      return Atom;
    case "CHEMISTRY":
      return Beaker;
    case "MATHEMATICS":
      return Sigma;
    case "ZOOLOGY":
      return Sprout;
    case "BOTANY":
      return Leaf;
    default:
      return CalendarDays;
  }
}

function toLocalDateInputValue(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function toLocalTimeInputValue(date: Date) {
  return format(date, "HH:mm");
}

function toDateTimeIsoFromLocal(dateInput: string, timeInput: string) {
  const local = new Date(`${dateInput}T${timeInput}:00`);
  return local.toISOString();
}

function isJoinEnabled(item: ClassSessionItem) {
  if (item.status === "LIVE") return true;
  if (!item.meetLink) return false;
  return isSameDay(parseISO(item.date), new Date());
}

function formatTimeRange(start: string, end: string) {
  return `${format(parseISO(start), "hh:mm a")} - ${format(parseISO(end), "hh:mm a")}`;
}

function countRecurringMatches(startDate: string, endDate: string, selectedDays: number[]) {
  if (!startDate || !endDate || selectedDays.length === 0) return 0;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;

  const selectedDaySet = new Set(selectedDays);
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    if (selectedDaySet.has(cursor.getDay())) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

type ClassFormState = {
  batchId: string;
  subject: SubjectEnum;
  title: string;
  topic: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  meetLink: string;
  notes: string;
};

const INITIAL_FORM: ClassFormState = {
  batchId: "",
  subject: "PHYSICS",
  title: "",
  topic: "",
  description: "",
  date: toLocalDateInputValue(new Date()),
  startTime: "10:00",
  endTime: "11:00",
  meetLink: "",
  notes: "",
};

export function FacultyClassesPageClient() {
  const queryClient = useQueryClient();
  const { setBreadcrumb } = useBreadcrumb();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [batchDraft, setBatchDraft] = useState("ALL");
  const [subjectDraft, setSubjectDraft] = useState<"ALL" | SubjectEnum>("ALL");
  const [appliedFilters, setAppliedFilters] = useState<{ batchId?: string; subject?: SubjectEnum }>({});
  const [listView, setListView] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editScope, setEditScope] = useState<ClassEditDeleteScope>("THIS_SESSION");
  const [form, setForm] = useState<ClassFormState>(INITIAL_FORM);
  const [createMode, setCreateMode] = useState<"ONE_TIME" | "REPEATING">("ONE_TIME");
  const [repeatDaysOfWeek, setRepeatDaysOfWeek] = useState<CreateRecurringClassBody["daysOfWeek"]>([]);
  const [repeatStartDate, setRepeatStartDate] = useState(toLocalDateInputValue(new Date()));
  const [repeatEndDate, setRepeatEndDate] = useState(toLocalDateInputValue(new Date()));

  const [selectedClass, setSelectedClass] = useState<ClassSessionItem | null>(null);
  const [scopePromptClass, setScopePromptClass] = useState<ClassSessionItem | null>(null);
  const [scopePromptMode, setScopePromptMode] = useState<"EDIT" | "DELETE" | null>(null);
  const [deleteScope, setDeleteScope] = useState<ClassEditDeleteScope>("THIS_SESSION");

  useEffect(() => {
    setBreadcrumb([{ label: "Classes", href: "/faculty/classes" }]);
  }, [setBreadcrumb]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = () => setListView(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const classesQuery = useQuery({
    queryKey: ["classes", "faculty", weekStart.toISOString(), appliedFilters.batchId, appliedFilters.subject],
    queryFn: () =>
      fetchFacultyClasses({
        weekStart: weekStart.toISOString(),
        batchId: appliedFilters.batchId,
        subject: appliedFilters.subject,
      }),
  });

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      const startIso = toDateTimeIsoFromLocal(form.date, form.startTime);
      const endIso = toDateTimeIsoFromLocal(form.date, form.endTime);
      if (new Date(endIso) <= new Date(startIso)) {
        throw new Error("End time must be after start time");
      }

      const payload: CreateClassBody = {
        batchId: form.batchId,
        subject: form.subject,
        title: form.title.trim(),
        topic: form.topic.trim() || undefined,
        description: form.description.trim() || undefined,
        date: new Date(`${form.date}T00:00:00`).toISOString(),
        startTime: startIso,
        endTime: endIso,
        meetLink: form.meetLink.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };
      return createFacultyClass(payload);
    },
    onSuccess: async (res) => {
      toast.success("Class scheduled successfully");
      res.warnings.forEach((warning) => toast(warning));
      setIsFormOpen(false);
      setForm(INITIAL_FORM);
      await queryClient.invalidateQueries({ queryKey: ["classes", "faculty"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to schedule class"),
  });

  const bulkScheduleMutation = useMutation({
    mutationFn: async () => {
      const startIso = toDateTimeIsoFromLocal(repeatStartDate, form.startTime);
      const endIso = toDateTimeIsoFromLocal(repeatStartDate, form.endTime);
      if (new Date(endIso) <= new Date(startIso)) {
        throw new Error("End time must be after start time");
      }
      if (!repeatDaysOfWeek.length) {
        throw new Error("Pick at least one day of the week");
      }

      const payload: CreateRecurringClassBody = {
        batchId: form.batchId,
        subject: form.subject,
        title: form.title.trim(),
        topic: form.topic.trim() || undefined,
        description: form.description.trim() || undefined,
        startDate: new Date(`${repeatStartDate}T00:00:00`).toISOString(),
        endDate: new Date(`${repeatEndDate}T00:00:00`).toISOString(),
        daysOfWeek: repeatDaysOfWeek,
        startTime: startIso,
        endTime: endIso,
        meetLink: form.meetLink.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };
      return createFacultyRecurringClasses(payload);
    },
    onSuccess: async (res) => {
      toast.success(`Scheduled ${res.count} recurring sessions`);
      res.warnings.forEach((warning) => toast(warning));
      setIsFormOpen(false);
      setForm(INITIAL_FORM);
      setCreateMode("ONE_TIME");
      setRepeatDaysOfWeek([]);
      await queryClient.invalidateQueries({ queryKey: ["classes", "faculty"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to schedule recurring classes"),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingClassId) throw new Error("No class selected");
      const startIso = toDateTimeIsoFromLocal(form.date, form.startTime);
      const endIso = toDateTimeIsoFromLocal(form.date, form.endTime);
      if (new Date(endIso) <= new Date(startIso)) {
        throw new Error("End time must be after start time");
      }

      const payload: UpdateClassBody = {
        batchId: form.batchId,
        subject: form.subject,
        title: form.title.trim(),
        topic: form.topic.trim() || null,
        description: form.description.trim() || null,
        startTime: startIso,
        endTime: endIso,
        meetLink: form.meetLink.trim() || null,
        notes: form.notes.trim() || null,
        scope: editScope,
      };
      if (editScope === "THIS_SESSION") {
        payload.date = new Date(`${form.date}T00:00:00`).toISOString();
      }
      return updateFacultyClass(editingClassId, payload);
    },
    onSuccess: async (res) => {
      toast.success(
        res.updatedCount > 1
          ? `Updated ${res.updatedCount} upcoming classes`
          : "Class updated successfully"
      );
      res.warnings.forEach((warning) => toast(warning));
      setIsFormOpen(false);
      setEditingClassId(null);
      setEditScope("THIS_SESSION");
      setForm(INITIAL_FORM);
      await queryClient.invalidateQueries({ queryKey: ["classes", "faculty"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update class"),
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      classId,
      payload,
    }: {
      classId: string;
      payload: UpdateClassBody;
    }) => updateFacultyClass(classId, payload),
    onSuccess: async () => {
      toast.success("Class updated");
      await queryClient.invalidateQueries({ queryKey: ["classes", "faculty"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update class status"),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ classId, scope }: { classId: string; scope: ClassEditDeleteScope }) =>
      deleteFacultyClass(classId, scope),
    onSuccess: async () => {
      toast.success("Class deleted");
      setSelectedClass(null);
      setScopePromptClass(null);
      setScopePromptMode(null);
      await queryClient.invalidateQueries({ queryKey: ["classes", "faculty"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete class"),
  });

  const deleteImpactQuery = useQuery({
    queryKey: ["classes", "faculty", "delete-impact", scopePromptClass?.id, deleteScope],
    queryFn: () => {
      if (!scopePromptClass) throw new Error("No class selected");
      return fetchFacultyDeleteImpact(scopePromptClass.id, deleteScope);
    },
    enabled:
      !!scopePromptClass &&
      scopePromptMode === "DELETE" &&
      deleteScope === "FUTURE_IN_GROUP" &&
      !!scopePromptClass.groupId,
  });

  const data = classesQuery.data;
  const classRows = useMemo(() => data?.classes ?? [], [data?.classes]);
  const upcomingRows = useMemo(() => data?.upcoming ?? [], [data?.upcoming]);

  const days = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, idx) => ({
        label: format(addDays(weekStart, idx), "EEEE"),
        date: addDays(weekStart, idx),
      })),
    [weekStart]
  );

  const groupedByDay = useMemo(() => {
    return days.map((day) => ({
      ...day,
      items: classRows.filter((item) => isSameDay(parseISO(item.date), day.date)),
    }));
  }, [days, classRows]);

  const openCreate = () => {
    setEditingClassId(null);
    setEditScope("THIS_SESSION");
    setCreateMode("ONE_TIME");
    setForm((prev) => ({
      ...INITIAL_FORM,
      batchId: prev.batchId || data?.batches?.[0]?.id || "",
      date: toLocalDateInputValue(weekStart),
    }));
    const defaultStart = toLocalDateInputValue(weekStart);
    setRepeatStartDate(defaultStart);
    setRepeatEndDate(defaultStart);
    setRepeatDaysOfWeek([]);
    setIsFormOpen(true);
  };

  const openEdit = (item: ClassSessionItem, scope: ClassEditDeleteScope = "THIS_SESSION") => {
    setEditingClassId(item.id);
    setEditScope(scope);
    setCreateMode("ONE_TIME");
    setForm({
      batchId: item.batchId,
      subject: item.subject,
      title: item.title,
      topic: item.topic ?? "",
      description: item.description ?? "",
      date: toLocalDateInputValue(parseISO(item.date)),
      startTime: toLocalTimeInputValue(parseISO(item.startTime)),
      endTime: toLocalTimeInputValue(parseISO(item.endTime)),
      meetLink: item.meetLink ?? "",
      notes: item.notes ?? "",
    });
    setScopePromptClass(null);
    setScopePromptMode(null);
    setIsFormOpen(true);
  };

  const recurringMaxEndDate = useMemo(() => {
    const start = new Date(`${repeatStartDate}T00:00:00`);
    if (Number.isNaN(start.getTime())) return repeatStartDate;
    return toLocalDateInputValue(addDays(start, MAX_RECURRING_DAYS - 1));
  }, [repeatStartDate]);

  const recurringPreviewCount = useMemo(() => {
    const selectedIndexes = RECURRING_WEEKDAY_OPTIONS
      .filter((option) => repeatDaysOfWeek.includes(option.key))
      .map((option) => option.index);
    return countRecurringMatches(repeatStartDate, repeatEndDate, selectedIndexes);
  }, [repeatStartDate, repeatEndDate, repeatDaysOfWeek]);

  const handleRepeatStartDateChange = (nextStartDate: string) => {
    setRepeatStartDate(nextStartDate);
    const start = new Date(`${nextStartDate}T00:00:00`);
    const currentEnd = new Date(`${repeatEndDate}T00:00:00`);
    if (Number.isNaN(start.getTime())) return;

    const maxEnd = addDays(start, MAX_RECURRING_DAYS - 1);
    if (Number.isNaN(currentEnd.getTime()) || currentEnd < start) {
      setRepeatEndDate(nextStartDate);
      return;
    }
    if (currentEnd > maxEnd) {
      setRepeatEndDate(toLocalDateInputValue(maxEnd));
    }
  };

  const handleRepeatEndDateChange = (nextEndDate: string) => {
    const start = new Date(`${repeatStartDate}T00:00:00`);
    const end = new Date(`${nextEndDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setRepeatEndDate(nextEndDate);
      return;
    }

    const maxEnd = addDays(start, MAX_RECURRING_DAYS - 1);
    if (end < start) {
      setRepeatEndDate(repeatStartDate);
      return;
    }
    if (end > maxEnd) {
      setRepeatEndDate(toLocalDateInputValue(maxEnd));
      return;
    }
    setRepeatEndDate(nextEndDate);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Online Classes Schedule</h1>
            <p className="text-sm text-muted-foreground">Schedule and manage classes for your batches.</p>
          </div>
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={openCreate}>
            + Schedule Class
          </Button>
        </div>

        <Card>
          <CardContent className="pt-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <Select value={batchDraft} onValueChange={setBatchDraft}>
                <SelectTrigger>
                  <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All batches</SelectItem>
                  {(data?.batches ?? []).map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={subjectDraft}
                onValueChange={(value) => setSubjectDraft(value as "ALL" | SubjectEnum)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All subjects</SelectItem>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 xl:col-span-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeekStart((prev) => addDays(prev, -7))}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Prev Week
                </Button>
                <div className="min-w-[180px] text-center text-sm font-medium">
                  {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeekStart((prev) => addDays(prev, 7))}
                >
                  Next Week
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={() =>
                  setAppliedFilters({
                    batchId: batchDraft === "ALL" ? undefined : batchDraft,
                    subject: subjectDraft === "ALL" ? undefined : subjectDraft,
                  })
                }
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Weekly Calendar</h2>
              <div className="flex gap-2">
                <Button
                  variant={listView ? "outline" : "default"}
                  size="sm"
                  onClick={() => setListView(false)}
                >
                  Calendar
                </Button>
                <Button
                  variant={listView ? "default" : "outline"}
                  size="sm"
                  onClick={() => setListView(true)}
                >
                  List View
                </Button>
              </div>
            </div>

            {classesQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-[420px] w-full" />
              </div>
            ) : listView || !classRows.length ? (
              <>
                {!listView && classRows.length === 0 ? (
                  <Card>
                    <CardContent className="py-14 text-center">
                      <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No classes scheduled this week</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                          <thead>
                            <tr className="border-b text-left text-muted-foreground">
                              <th className="p-2">Date</th>
                              <th className="p-2">Time</th>
                              <th className="p-2">Subject</th>
                              <th className="p-2">Title</th>
                              <th className="p-2">Batch</th>
                              <th className="p-2">Meet Link</th>
                              <th className="p-2">Status</th>
                              <th className="p-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classRows.map((item) => (
                              <tr key={item.id} className="border-b">
                                <td className="p-2">{format(parseISO(item.date), "EEE, MMM d")}</td>
                                <td className="p-2">{formatTimeRange(item.startTime, item.endTime)}</td>
                                <td className="p-2">{item.subject}</td>
                                <td className="p-2">
                                  <div className="flex items-center gap-1">
                                    {item.groupId && (
                                      <Repeat2 className="h-3.5 w-3.5 text-muted-foreground" aria-label="Recurring class" />
                                    )}
                                    <span>{item.title}</span>
                                  </div>
                                </td>
                                <td className="p-2">{item.batchName}</td>
                                <td className="p-2">
                                  {item.meetLink ? (
                                    <a className="text-primary underline" href={item.meetLink} target="_blank" rel="noreferrer">
                                      Open
                                    </a>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                                <td className="p-2">
                                  <ClassStatusBadge status={item.status} />
                                </td>
                                <td className="p-2">
                                  <Button size="sm" variant="outline" onClick={() => setSelectedClass(item)}>
                                    View
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : null}

            {!listView && classRows.length > 0 && (
              <Card className="hidden md:block">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-[110px_repeat(6,minmax(0,1fr))] border">
                    <div className="border-r p-2 text-xs font-medium text-muted-foreground">Time</div>
                    {days.map((day) => (
                      <div key={day.label} className="border-r p-2 text-xs font-medium text-muted-foreground last:border-r-0">
                        {day.label}
                      </div>
                    ))}

                    <div className="border-r">
                      {Array.from({ length: HOUR_END - HOUR_START }).map((_, idx) => (
                        <div key={idx} className="h-16 border-t px-2 py-1 text-xs text-muted-foreground">
                          {format(new Date().setHours(HOUR_START + idx, 0, 0, 0), "hh:mm a")}
                        </div>
                      ))}
                    </div>

                    {groupedByDay.map((day) => (
                      <div key={day.label} className="relative border-r last:border-r-0">
                        <div
                          className="grid"
                          style={{
                            gridTemplateRows: `repeat(${TOTAL_SLOTS}, minmax(0, 2rem))`,
                          }}
                        >
                          {Array.from({ length: TOTAL_SLOTS }).map((_, slot) => (
                            <div key={slot} className="border-t border-dashed border-border/80" />
                          ))}
                        </div>

                        <div
                          className="pointer-events-none absolute inset-0 grid px-1 py-1"
                          style={{
                            gridTemplateRows: `repeat(${TOTAL_SLOTS}, minmax(0, 2rem))`,
                          }}
                        >
                          {day.items.map((item) => {
                            const start = parseISO(item.startTime);
                            const end = parseISO(item.endTime);
                            const startMinutes = start.getHours() * 60 + start.getMinutes() - HOUR_START * 60;
                            const endMinutes = end.getHours() * 60 + end.getMinutes() - HOUR_START * 60;
                            const rowStart = Math.max(1, Math.floor(startMinutes / SLOT_MINUTES) + 1);
                            const rowEnd = Math.max(rowStart + 1, Math.ceil(endMinutes / SLOT_MINUTES) + 1);
                            const Icon = subjectIcon(item.subject);
                            const theme = SUBJECT_THEME[item.subject];

                            return (
                              <Tooltip key={item.id}>
                                <TooltipTrigger asChild>
                                  <motion.button
                                    type="button"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                      "pointer-events-auto overflow-hidden rounded-md border p-2 text-left text-[11px]",
                                      theme.card,
                                      theme.border,
                                      item.status === "COMPLETED" && "opacity-70",
                                      item.status === "CANCELLED" && "line-through decoration-red-600"
                                    )}
                                    style={{ gridRow: `${rowStart} / ${rowEnd}` }}
                                    onClick={() => setSelectedClass(item)}
                                  >
                                    <div className={cn("mb-1 flex items-center gap-1 font-medium", theme.text)}>
                                      {item.status === "LIVE" && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                                      <Icon className="h-3 w-3" />
                                      {item.groupId && <Repeat2 className="h-3 w-3" />}
                                      <span className="truncate">{item.title}</span>
                                    </div>
                                    <p className="truncate">{item.topic || "No topic"}</p>
                                    <p className="truncate text-muted-foreground">{item.batchName}</p>
                                    <p className="truncate">{formatTimeRange(item.startTime, item.endTime)}</p>
                                  </motion.button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-sm">
                                  <p className="font-medium">{item.title}</p>
                                  <p>{item.topic || "No topic"}</p>
                                  <p>{item.batchName}</p>
                                  <p>{format(parseISO(item.date), "EEEE, MMM d, yyyy")}</p>
                                  <p>{formatTimeRange(item.startTime, item.endTime)}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingRows.slice(0, 5).map((item) => {
                  const Icon = subjectIcon(item.subject);
                  return (
                    <div key={item.id} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="h-4 w-4" />
                        {item.groupId && <Repeat2 className="h-3.5 w-3.5 text-muted-foreground" />}
                        <span className="truncate">{item.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(parseISO(item.date), "EEE, MMM d")} · {formatTimeRange(item.startTime, item.endTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.batchName}</p>
                      {isJoinEnabled(item) && item.meetLink && (
                        <a href={item.meetLink} target="_blank" rel="noreferrer">
                          <Button className="mt-2 h-7 w-full bg-emerald-600 text-white hover:bg-emerald-700">
                            Join Now
                          </Button>
                        </a>
                      )}
                    </div>
                  );
                })}
                {upcomingRows.length === 0 && (
                  <p className="text-sm text-muted-foreground">No upcoming classes.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Current selected week overview</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md border p-2">
                  <p className="text-xs text-muted-foreground">This Week</p>
                  <p className="text-lg font-semibold">{data?.stats.weekTotal ?? 0}</p>
                </div>
                <div className="rounded-md border p-2">
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-lg font-semibold">{data?.stats.completed ?? 0}</p>
                </div>
                <div className="rounded-md border p-2">
                  <p className="text-xs text-muted-foreground">Cancelled</p>
                  <p className="text-lg font-semibold">{data?.stats.cancelled ?? 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingClassId ? "Edit Class" : "Schedule Class"}</DialogTitle>
            </DialogHeader>
            {!editingClassId && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={createMode === "ONE_TIME" ? "default" : "outline"}
                  onClick={() => setCreateMode("ONE_TIME")}
                >
                  One-time class
                </Button>
                <Button
                  type="button"
                  variant={createMode === "REPEATING" ? "default" : "outline"}
                  onClick={() => setCreateMode("REPEATING")}
                >
                  Repeating classes
                </Button>
              </div>
            )}
            {editingClassId && editScope === "FUTURE_IN_GROUP" && (
              <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
                You are editing all upcoming sessions in this repeating group. Date is locked to protect the series pattern.
              </p>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Batch</p>
                <Select
                  value={form.batchId}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, batchId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {(data?.batches ?? []).map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Subject</p>
                <Select
                  value={form.subject}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, subject: value as SubjectEnum }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <p className="mb-1 text-xs text-muted-foreground">Title</p>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Thermodynamics - Laws of Motion"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Topic</p>
                <input
                  value={form.topic}
                  onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              {editingClassId || createMode === "ONE_TIME" ? (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Date</p>
                  <input
                    type="date"
                    value={form.date}
                    disabled={editingClassId !== null && editScope === "FUTURE_IN_GROUP"}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              ) : (
                <div className="md:col-span-2">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">Start Date</p>
                      <input
                        type="date"
                        value={repeatStartDate}
                        onChange={(e) => handleRepeatStartDateChange(e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">End Date</p>
                      <input
                        type="date"
                        value={repeatEndDate}
                        min={repeatStartDate}
                        max={recurringMaxEndDate}
                        onChange={(e) => handleRepeatEndDateChange(e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Maximum range is {MAX_RECURRING_DAYS} days from the start date.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="mb-2 text-xs text-muted-foreground">Repeat On</p>
                    <div className="flex flex-wrap gap-2">
                      {RECURRING_WEEKDAY_OPTIONS.map((day) => {
                        const checked = repeatDaysOfWeek.includes(day.key);
                        return (
                          <Button
                            key={day.key}
                            type="button"
                            variant={checked ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              setRepeatDaysOfWeek((prev) =>
                                checked ? prev.filter((item) => item !== day.key) : [...prev, day.key]
                              )
                            }
                          >
                            {day.label}
                          </Button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Preview: this setup will create <span className="font-semibold text-foreground">{recurringPreviewCount}</span>{" "}
                      sessions.
                    </p>
                  </div>
                </div>
              )}
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Start Time</p>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">End Time</p>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <p className="mb-1 text-xs text-muted-foreground">Google Meet Link</p>
                <input
                  type="url"
                  value={form.meetLink}
                  onChange={(e) => setForm((prev) => ({ ...prev, meetLink: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <p className="mb-1 text-xs text-muted-foreground">Description</p>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <p className="mb-1 text-xs text-muted-foreground">Notes (visible to students)</p>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={
                  scheduleMutation.isPending ||
                  bulkScheduleMutation.isPending ||
                  updateMutation.isPending ||
                  !form.title.trim() ||
                  (!editingClassId && createMode === "REPEATING" && recurringPreviewCount === 0)
                }
                onClick={() => {
                  if (editingClassId) {
                    updateMutation.mutate();
                    return;
                  }
                  if (createMode === "REPEATING") {
                    bulkScheduleMutation.mutate();
                    return;
                  }
                  scheduleMutation.mutate();
                }}
              >
                {editingClassId
                  ? "Save Changes"
                  : createMode === "REPEATING"
                    ? "Schedule Recurring Classes"
                    : "Schedule Class"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Sheet open={!!selectedClass} onOpenChange={(open) => !open && setSelectedClass(null)}>
          <SheetContent side="right" className="overflow-y-auto">
            {selectedClass && (
              <motion.div initial={{ x: 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex h-full flex-col">
                <SheetHeader>
                  <div className="flex items-center gap-2">
                    <ClassStatusBadge status={selectedClass.status} />
                    <span className={cn("rounded-md px-2 py-1 text-xs font-medium", SUBJECT_THEME[selectedClass.subject].card)}>
                      {selectedClass.subject}
                    </span>
                    {selectedClass.groupId && (
                      <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground">
                        <Repeat2 className="h-3 w-3" />
                        Repeating
                      </span>
                    )}
                  </div>
                  <SheetTitle className="text-xl">{selectedClass.title}</SheetTitle>
                  <SheetDescription>{selectedClass.batchName}</SheetDescription>
                </SheetHeader>

                <div className="mt-4 space-y-3 text-sm">
                  <p><span className="text-muted-foreground">Date:</span> {format(parseISO(selectedClass.date), "EEEE, MMMM d, yyyy")}</p>
                  <p><span className="text-muted-foreground">Time:</span> {formatTimeRange(selectedClass.startTime, selectedClass.endTime)}</p>
                  <p><span className="text-muted-foreground">Topic:</span> {selectedClass.topic || "—"}</p>
                  <p><span className="text-muted-foreground">Description:</span> {selectedClass.description || "—"}</p>
                  <p><span className="text-muted-foreground">Notes:</span> {selectedClass.notes || "—"}</p>
                  <p><span className="text-muted-foreground">Faculty:</span> {selectedClass.facultyName}</p>
                  {selectedClass.cancelNote && (
                    <p className="rounded-md border border-red-600/30 bg-red-500/10 p-2 text-red-700">
                      Cancel note: {selectedClass.cancelNote}
                    </p>
                  )}
                </div>

                {selectedClass.meetLink && (
                  <div className="mt-4 flex items-center gap-2">
                    <a href={selectedClass.meetLink} target="_blank" rel="noreferrer" className="flex-1">
                      <Button className="w-full">Join Google Meet</Button>
                    </a>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={async () => {
                        await navigator.clipboard.writeText(selectedClass.meetLink ?? "");
                        toast.success("Meet link copied");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <SheetFooter className="mt-6 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedClass.groupId) {
                        setScopePromptClass(selectedClass);
                        setScopePromptMode("EDIT");
                        return;
                      }
                      openEdit(selectedClass, "THIS_SESSION");
                    }}
                  >
                    Edit Class
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const note = window.prompt("Cancel note (optional)") ?? "";
                      statusMutation.mutate({
                        classId: selectedClass.id,
                        payload: { status: "CANCELLED", cancelNote: note || null },
                      });
                    }}
                  >
                    Cancel Class
                  </Button>
                  {isSameDay(parseISO(selectedClass.date), new Date()) && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        statusMutation.mutate({
                          classId: selectedClass.id,
                          payload: { status: "LIVE" },
                        })
                      }
                    >
                      Mark as Live
                    </Button>
                  )}
                  {parseISO(selectedClass.endTime) < new Date() && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        statusMutation.mutate({
                          classId: selectedClass.id,
                          payload: { status: "COMPLETED" },
                        })
                      }
                    >
                      Mark Complete
                    </Button>
                  )}
                  {selectedClass.status === "SCHEDULED" &&
                    parseISO(selectedClass.startTime) > new Date() && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (selectedClass.groupId) {
                            setScopePromptClass(selectedClass);
                            setScopePromptMode("DELETE");
                            setDeleteScope("THIS_SESSION");
                            return;
                          }
                          if (!window.confirm("Delete this class session?")) return;
                          deleteMutation.mutate({ classId: selectedClass.id, scope: "THIS_SESSION" });
                        }}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                    )}
                </SheetFooter>
              </motion.div>
            )}
          </SheetContent>
        </Sheet>

        <Dialog
          open={scopePromptMode === "EDIT" && !!scopePromptClass}
          onOpenChange={(open) => {
            if (!open) {
              setScopePromptClass(null);
              setScopePromptMode(null);
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit repeating class</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This class belongs to a repeating group. Choose what you want to edit.
            </p>
            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (!scopePromptClass) return;
                  openEdit(scopePromptClass, "THIS_SESSION");
                }}
              >
                Edit this session only
              </Button>
              <Button
                onClick={() => {
                  if (!scopePromptClass) return;
                  openEdit(scopePromptClass, "FUTURE_IN_GROUP");
                }}
              >
                Edit all upcoming sessions in this group
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={scopePromptMode === "DELETE" && !!scopePromptClass}
          onOpenChange={(open) => {
            if (!open) {
              setScopePromptClass(null);
              setScopePromptMode(null);
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Delete repeating class</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This class is part of a repeating group. Deleting cannot be undone.
            </p>
            <div className="grid gap-2">
              <Button
                type="button"
                variant={deleteScope === "THIS_SESSION" ? "default" : "outline"}
                onClick={() => setDeleteScope("THIS_SESSION")}
              >
                Delete this class session only
              </Button>
              <Button
                type="button"
                variant={deleteScope === "FUTURE_IN_GROUP" ? "default" : "outline"}
                onClick={() => setDeleteScope("FUTURE_IN_GROUP")}
              >
                Delete all upcoming classes in this repeating group
              </Button>
            </div>
            <p className="rounded-md border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm text-red-700">
              {deleteScope === "FUTURE_IN_GROUP"
                ? deleteImpactQuery.isLoading
                  ? "Calculating how many upcoming class sessions will be deleted..."
                  : `This will delete ${deleteImpactQuery.data?.affectedCount ?? 0} upcoming class sessions in this group.`
                : "This will delete 1 class session."}
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setScopePromptClass(null);
                  setScopePromptMode(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={
                  deleteMutation.isPending ||
                  (deleteScope === "FUTURE_IN_GROUP" && deleteImpactQuery.isLoading) ||
                  (deleteScope === "FUTURE_IN_GROUP" && (deleteImpactQuery.data?.affectedCount ?? 0) === 0)
                }
                onClick={() => {
                  if (!scopePromptClass) return;
                  deleteMutation.mutate({
                    classId: scopePromptClass.id,
                    scope: deleteScope,
                  });
                }}
              >
                {deleteScope === "FUTURE_IN_GROUP" ? "Delete upcoming group classes" : "Delete this class"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
