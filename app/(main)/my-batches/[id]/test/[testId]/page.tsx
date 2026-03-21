"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBreadcrumb } from "@/store/BreadcrumbContext";
import { useRouter } from "nextjs-toploader/app";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Upload, FileSpreadsheet, Save, Users, TrendingUp, Award, BellRing, Plus, X, Download, MessageCircle, Trash2, GripVertical, BookOpenText, BarChart3, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchTestById, fetchTestAttempts, createTestAttempt, notifyTestAttempt, deleteTestAttempts, reorderTestQuestions, updateMockTest, type TestAttemptListItem, type CreateTestAttemptPayload } from "@/lib/api/tests";
import { fetchTestQuestions, addTestQuestion, updateTestQuestion, removeTestQuestion, type TestQuestionListItem } from "@/lib/api/tests";
import { fetchBatchById, fetchStudentsInBatch, type StudentInBatch } from "@/lib/api/batches";
import { ExamType } from "@prisma/client";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { fetchQuestions, type QuestionListItem } from "@/lib/api/questions";
import { fetchTopicsBySubject, type TopicListItem } from "@/lib/api/topics";
import TestClassOverview from "@/components/test-results/test-class-overview";
import TestAttemptQuestionAnalysis from "@/components/test-results/test-attempt-question-analysis";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";

function getPercentileBg(percentile: number | null): string {
    if (percentile === null) return "bg-muted text-muted-foreground";
    if (percentile >= 90) return "bg-success/20 text-success";
    if (percentile >= 75) return "bg-primary/20 text-primary";
    if (percentile >= 50) return "bg-warning/20 text-warning";
    return "bg-destructive/20 text-destructive";
}

type EditableAttempt = {
    id?: string;
    studentId: string;
    student?: TestAttemptListItem["student"];
    physicsMarks: number | null;
    chemistryMarks: number | null;
    mathematicsMarks: number | null;
    zoologyMarks: number | null;
    botanyMarks: number | null;
    totalScore: number | null;
    percentile: number | null;
    isNew?: boolean;
};

type TabKey = "questions" | "marks-entry" | "results-analysis";

const TAB_ITEMS: { key: TabKey; label: string }[] = [
    { key: "questions", label: "Questions" },
    { key: "marks-entry", label: "Marks Entry" },
    { key: "results-analysis", label: "Results & Analysis" },
];

const SUBJECT_OPTIONS = [
    { value: "PHYSICS", label: "Physics" },
    { value: "CHEMISTRY", label: "Chemistry" },
    { value: "MATHEMATICS", label: "Mathematics" },
    { value: "ZOOLOGY", label: "Zoology" },
    { value: "BOTANY", label: "Botany" },
] as const;

const DIFFICULTY_OPTIONS = [
    { value: "EASY", label: "Easy" },
    { value: "MODERATE", label: "Moderate" },
    { value: "HARD", label: "Hard" },
] as const;

function truncateText(value: string, length: number): string {
    if (value.length <= length) return value;
    return `${value.slice(0, length)}...`;
}

export default function TestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const batchId = params.id as string;
    const testId = params.testId as string;
    const queryClient = useQueryClient();

    const [editingAttempts, setEditingAttempts] = useState<Map<string, EditableAttempt>>(new Map());
    const [newStudentId, setNewStudentId] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [downloadTemplateType, setDownloadTemplateType] = useState<"subject-marks" | "question-answers">("question-answers");
    // const [uploadTemplateKind, setUploadTemplateKind] = useState<"auto" | "subject-marks" | "question-answers">("auto");
    const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
    const [isSheetDialogOpen, setIsSheetDialogOpen] = useState(false);
    const [sheetUrl, setSheetUrl] = useState("");
    const [isImportingSheet, setIsImportingSheet] = useState(false);
    const [notifyingAttemptId, setNotifyingAttemptId] = useState<string | null>(null);
    const [selectedAttemptIds, setSelectedAttemptIds] = useState<Set<string>>(new Set());
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [addingQuestionIds, setAddingQuestionIds] = useState<Set<string>>(new Set());
    const [removingQuestionIds, setRemovingQuestionIds] = useState<Set<string>>(new Set());
    const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
    const [reorderDraftQuestions, setReorderDraftQuestions] = useState<TestQuestionListItem[]>([]);
    const [draggingQuestionId, setDraggingQuestionId] = useState<string | null>(null);
    const [isUpdatingQuestionOrder, setIsUpdatingQuestionOrder] = useState(false);
    const [questionSearch, setQuestionSearch] = useState("");
    const [questionSubject, setQuestionSubject] = useState<string>("");
    const [questionTopicId, setQuestionTopicId] = useState<string>("");
    const [questionDifficulty, setQuestionDifficulty] = useState<string>("");

    const tabFromUrl = searchParams.get("tab");
    const activeTab: TabKey = TAB_ITEMS.some((item) => item.key === tabFromUrl)
        ? (tabFromUrl as TabKey)
        : "questions";

    const resultsAnalysisAttemptId = searchParams.get("analysisAttemptId");

    const { setBreadcrumb } = useBreadcrumb();

    const { data: batch, isLoading: batchLoading } = useQuery({
        queryKey: ["batch", batchId],
        queryFn: () => fetchBatchById(batchId),
        enabled: !!batchId,
    });

    const { data: test, isLoading: testLoading } = useQuery({
        queryKey: ["test", testId],
        queryFn: () => fetchTestById(testId),
        enabled: !!testId,
    });

    useEffect(() => {
        if (batch && test) {
            setBreadcrumb([
                { label: "My Batches", href: "/my-batches" },
                { label: batch.name, href: `/my-batches/${batchId}` },
                { label: test.name },
            ]);
        }
    }, [batch, test, batchId, setBreadcrumb]);

    useEffect(() => {
        const tab = searchParams.get("tab");
        const isValid = TAB_ITEMS.some((item) => item.key === tab);
        if (!isValid) {
            router.replace(`/my-batches/${batchId}/test/${testId}?tab=questions`);
        }
    }, [searchParams, router, batchId, testId]);

    const { data: attempts = [], isLoading: attemptsLoading } = useQuery({
        queryKey: ["test-attempts", testId],
        queryFn: () => fetchTestAttempts(testId),
        enabled: !!testId,
    });

    const { data: students = [], isLoading: studentsLoading } = useQuery({
        queryKey: ["batch-students", batchId],
        queryFn: () => fetchStudentsInBatch(batchId),
        enabled: !!batchId,
    });

    const listQuestionParams = {
        page: 1,
        limit: 100,
        search: questionSearch || undefined,
        subject: questionSubject || undefined,
        difficulty: questionDifficulty || undefined,
        isPractice: false,
        sortBy: "createdAt" as const,
        sortOrder: "desc" as const,
    };

    const { data: questionBankResponse, isLoading: questionBankLoading } = useQuery({
        queryKey: ["questions", "test-builder", listQuestionParams],
        queryFn: () => fetchQuestions(listQuestionParams),
        enabled: !!testId,
    });

    const questionBank = questionBankResponse?.data ?? [];

    const { data: topicOptions = [] } = useQuery({
        queryKey: ["topics", "test-builder", questionSubject],
        queryFn: () => fetchTopicsBySubject(questionSubject),
        enabled: !!questionSubject,
    });

    const { data: testQuestions = [], isLoading: testQuestionsLoading } = useQuery({
        queryKey: ["test-questions", testId],
        queryFn: () => fetchTestQuestions(testId),
        enabled: !!testId,
    });

    const saveMutation = useMutation({
        mutationFn: (payload: CreateTestAttemptPayload) => createTestAttempt(testId, payload),
        onSuccess: () => {
            toast.success("Test attempt saved successfully");
            queryClient.invalidateQueries({ queryKey: ["test-attempts", testId] });
        },
        onError: (e: Error) => {
            toast.error(e.message || "Failed to save test attempt");
        },
    });

    const notifyMutation = useMutation({
        mutationFn: (attemptId: string) => notifyTestAttempt(testId, attemptId),
        onSuccess: () => {
            toast.success("Result notification sent to parent");
            queryClient.invalidateQueries({ queryKey: ["test-attempts", testId] });
        },
        onError: (e: Error) => {
            toast.error(e.message || "Failed to send notification");
        },
    });

    const deleteAttemptsMutation = useMutation({
        mutationFn: (attemptIds: string[]) => deleteTestAttempts(testId, attemptIds),
        onMutate: () => {
            const loadingToastId = toast.loading("Deleting selected attempts...");
            return { loadingToastId };
        },
        onSuccess: (data, _variables, context) => {
            if (context?.loadingToastId) {
                toast.dismiss(context.loadingToastId);
            }
            if (data.deletedCount > 0) {
                toast.success("Selected attempts deleted successfully");
            } else {
                toast("No attempts were deleted");
            }
            setSelectedAttemptIds(new Set());
            queryClient.invalidateQueries({ queryKey: ["test-attempts", testId] });
        },
        onError: (e: Error, _variables, context) => {
            if (context?.loadingToastId) {
                toast.dismiss(context.loadingToastId);
            }
            toast.error(e.message || "Failed to delete attempts");
        },
    });

    const addQuestionMutation = useMutation({
        mutationFn: (questionId: string) => addTestQuestion(testId, { questionId, marks: 4, negMarks: 1 }),
        onSuccess: () => {
            toast.success("Question added to test");
            queryClient.invalidateQueries({ queryKey: ["test-questions", testId] });
        },
        // onError: (e: Error) => toast.error(e.message || "Failed to add question"),
    });

    const updateQuestionMutation = useMutation({
        mutationFn: ({
            testQuestionId,
            payload,
        }: {
            testQuestionId: string;
            payload: { marks?: number; negMarks?: number; orderIndex?: number };
        }) => updateTestQuestion(testId, testQuestionId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["test-questions", testId] });
        },
        onError: (e: Error) => toast.error(e.message || "Failed to update test question"),
    });

    const removeQuestionMutation = useMutation({
        mutationFn: (testQuestionId: string) => removeTestQuestion(testId, testQuestionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["test-questions", testId] });
        },
    });

    const addedQuestionIds = useMemo(
        () => new Set(testQuestions.map((q: TestQuestionListItem) => q.questionId)),
        [testQuestions]
    );

    const isQuestionOrderDirty = useMemo(() => {
        if (reorderDraftQuestions.length !== testQuestions.length) return false;
        return reorderDraftQuestions.some((item, index) => item.id !== testQuestions[index]?.id);
    }, [reorderDraftQuestions, testQuestions]);

    const allowedSubjectValues = batch?.examType === ExamType.JEE
        ? ["PHYSICS", "CHEMISTRY", "MATHEMATICS"]
        : batch?.examType === ExamType.NEET
            ? ["PHYSICS", "CHEMISTRY", "ZOOLOGY", "BOTANY"]
            : SUBJECT_OPTIONS.map((s) => s.value);

    const allowedSubjectSet = useMemo(
        () => new Set(allowedSubjectValues),
        [batch?.examType]
    );

    const filteredQuestionBank = useMemo(() => {
        return questionBank
            .filter((q: QuestionListItem) => allowedSubjectSet.has(q.subject))
            .filter((q: QuestionListItem) => (!questionTopicId ? true : q.topicId === questionTopicId));
    }, [questionBank, questionTopicId, allowedSubjectSet]);

    const testQuestionsTotal = useMemo(
        () => testQuestions.reduce((sum: number, q: TestQuestionListItem) => sum + (q.marks || 0), 0),
        [testQuestions]
    );

    const currentSubjectTotals = useMemo(() => {
        const totals: Record<string, number> = {
            PHYSICS: 0,
            CHEMISTRY: 0,
            MATHEMATICS: 0,
            ZOOLOGY: 0,
            BOTANY: 0,
        };

        for (const q of testQuestions) {
            const subject = q.question.subject;
            totals[subject] = (totals[subject] ?? 0) + (q.marks || 0);
        }

        return totals;
    }, [testQuestions]);

    const savedTotalMarks = test?.totalMarks ?? 0;
    const savedSubjectTotals = useMemo(() => {
        return {
            PHYSICS: test?.totalMarksPhysics ?? 0,
            CHEMISTRY: test?.totalMarksChemistry ?? 0,
            MATHEMATICS: test?.totalMarksMathematics ?? 0,
            ZOOLOGY: test?.totalMarksZoology ?? 0,
            BOTANY: test?.totalMarksBotany ?? 0,
        };
    }, [
        test?.totalMarksPhysics,
        test?.totalMarksChemistry,
        test?.totalMarksMathematics,
        test?.totalMarksZoology,
        test?.totalMarksBotany,
    ]);

    const syncMarksMutation = useMutation({
        mutationFn: async () => {
            if (!test) return null;

            if (isJEE) {
                const physics = Math.round(currentSubjectTotals.PHYSICS);
                const chemistry = Math.round(currentSubjectTotals.CHEMISTRY);
                const mathematics = Math.round(currentSubjectTotals.MATHEMATICS);
                const totalMarks = physics + chemistry + mathematics;

                return updateMockTest(testId, {
                    totalMarks,
                    totalMarksPhysics: physics,
                    totalMarksChemistry: chemistry,
                    totalMarksMathematics: mathematics,
                    totalMarksZoology: null,
                    totalMarksBotany: null,
                });
            }

            // NEET (physics + chemistry + zoology + botany)
            const physics = Math.round(currentSubjectTotals.PHYSICS);
            const chemistry = Math.round(currentSubjectTotals.CHEMISTRY);
            const zoology = Math.round(currentSubjectTotals.ZOOLOGY);
            const botany = Math.round(currentSubjectTotals.BOTANY);
            const totalMarks = physics + chemistry + zoology + botany;

            return updateMockTest(testId, {
                totalMarks,
                totalMarksPhysics: physics,
                totalMarksChemistry: chemistry,
                totalMarksZoology: zoology,
                totalMarksBotany: botany,
                totalMarksMathematics: null,
            });
        },
        onSuccess: () => {
            toast.success("Test marks synced successfully");
            queryClient.invalidateQueries({ queryKey: ["test", testId] });
        },
        onError: (e: Error) => {
            toast.error(e.message || "Failed to sync test marks");
        },
    });

    const syncDisabled = syncMarksMutation.isPending || testQuestionsLoading;

    const syncIsJEE = batch?.examType === ExamType.JEE;

    const syncCurrent = syncIsJEE
        ? {
            physics: Math.round(currentSubjectTotals.PHYSICS),
            chemistry: Math.round(currentSubjectTotals.CHEMISTRY),
            mathematics: Math.round(currentSubjectTotals.MATHEMATICS),
            zoology: 0,
            botany: 0,
        }
        : {
            physics: Math.round(currentSubjectTotals.PHYSICS),
            chemistry: Math.round(currentSubjectTotals.CHEMISTRY),
            zoology: Math.round(currentSubjectTotals.ZOOLOGY),
            botany: Math.round(currentSubjectTotals.BOTANY),
            mathematics: 0,
        };

    const syncCurrentTotalMarks = syncIsJEE
        ? syncCurrent.physics + syncCurrent.chemistry + syncCurrent.mathematics
        : syncCurrent.physics + syncCurrent.chemistry + syncCurrent.zoology + syncCurrent.botany;

    const syncHasChanges = syncIsJEE
        ? syncCurrentTotalMarks !== savedTotalMarks ||
        syncCurrent.physics !== savedSubjectTotals.PHYSICS ||
        syncCurrent.chemistry !== savedSubjectTotals.CHEMISTRY ||
        syncCurrent.mathematics !== savedSubjectTotals.MATHEMATICS
        : syncCurrentTotalMarks !== savedTotalMarks ||
        syncCurrent.physics !== savedSubjectTotals.PHYSICS ||
        syncCurrent.chemistry !== savedSubjectTotals.CHEMISTRY ||
        syncCurrent.zoology !== savedSubjectTotals.ZOOLOGY ||
        syncCurrent.botany !== savedSubjectTotals.BOTANY;

    const handleAddStudent = () => {
        if (!newStudentId) {
            toast.error("Please select a student");
            return;
        }

        const student: StudentInBatch | undefined = students.find((s: StudentInBatch) => s.id === newStudentId);
        if (!student) return;

        // Check if student already has an attempt
        const existingAttempt = attempts.find((a) => a.studentId === newStudentId);
        if (existingAttempt) {
            toast.error("This student already has an attempt");
            return;
        }

        const newAttempt: EditableAttempt = {
            studentId: newStudentId,
            student: {
                id: student.id,
                rollNo: student.rollNo,
                user: student.user,
            },
            physicsMarks: null,
            chemistryMarks: null,
            mathematicsMarks: null,
            zoologyMarks: null,
            botanyMarks: null,
            totalScore: null,
            percentile: null,
            isNew: true,
        };

        setEditingAttempts((prev) => {
            const newMap = new Map(prev);
            newMap.set(newStudentId, newAttempt);
            return newMap;
        });

        setNewStudentId("");
    };

    const handleUpdateMarks = (
        studentId: string,
        field: keyof EditableAttempt,
        value: number | null,
        maxValue: number,
        label: string
    ) => {
        if (value !== null) {
            if (Number.isNaN(value)) {
                toast.error(`${label} marks must be a valid number`);
                return;
            }
            if (value > maxValue) {
                toast.error(`${label} marks cannot exceed ${maxValue}`);
                return;
            }
        }

        setEditingAttempts((prev) => {
            const newMap = new Map(prev);
            const attempt = newMap.get(studentId) || attempts.find((a) => a.studentId === studentId);

            if (!attempt) return prev;

            const updated: EditableAttempt = {
                ...attempt,
                [field]: value,
            };

            // Calculate total score
            const total =
                (updated.physicsMarks || 0) +
                (updated.chemistryMarks || 0) +
                (updated.mathematicsMarks || 0) +
                (updated.zoologyMarks || 0) +
                (updated.botanyMarks || 0);
            updated.totalScore = total;

            // Calculate percentile on the fly using total marks of the test
            const maxTotal = test?.totalMarks || 0;
            updated.percentile = maxTotal > 0 ? (total / maxTotal) * 100 : null;

            newMap.set(studentId, updated);
            return newMap;
        });
    };

    const handleSave = async (studentId: string) => {
        const attempt = editingAttempts.get(studentId) || attempts.find((a) => a.studentId === studentId);
        if (!attempt) return;

        const maxTotal = test?.totalMarks || 0;
        const total = attempt.totalScore ?? 0;
        const percentile = maxTotal > 0 ? (total / maxTotal) * 100 : null;

        const payload: CreateTestAttemptPayload = {
            studentId: attempt.studentId,
            physicsMarks: attempt.physicsMarks,
            chemistryMarks: attempt.chemistryMarks,
            mathematicsMarks: attempt.mathematicsMarks,
            zoologyMarks: attempt.zoologyMarks,
            botanyMarks: attempt.botanyMarks,
            totalScore: attempt.totalScore,
            percentile,
        };

        try {
            setSavingStudentId(studentId);
            await saveMutation.mutateAsync(payload);

            // Remove from editing state
            setEditingAttempts((prev) => {
                const newMap = new Map(prev);
                newMap.delete(studentId);
                return newMap;
            });
        } finally {
            setSavingStudentId(null);
        }
    };

    const handleCancel = (studentId: string) => {
        setEditingAttempts((prev) => {
            const newMap = new Map(prev);
            newMap.delete(studentId);
            return newMap;
        });
        if (newStudentId === studentId) {
            setNewStudentId("");
        }
    };

    const handleDownloadTemplate = async (includeStudents: boolean, templateType: "subject-marks" | "question-answers") => {
        const loadingToastId = toast.loading("Downloading template...");
        try {
            setIsDownloadingTemplate(true);
            setIsTemplateDialogOpen(false);
            const response = await fetch(
                `/api/v1/tests/${testId}/download-template?includeStudents=${includeStudents ? "true" : "false"}&templateType=${templateType}`
            );
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: "Failed to download template" }));
                throw new Error(error.error || "Failed to download template");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${test?.name || "template"}_${templateType}_template.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Template downloaded successfully", { id: loadingToastId });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to download template", { id: loadingToastId });
        } finally {
            setIsDownloadingTemplate(false);
        }
    };

    const handleUploadExcel = async (file: File | null) => {
        if (!file) return;
        const loadingToastId = toast.loading("Uploading attempts from Excel...");
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            // if (uploadTemplateKind !== "auto") {
            //     formData.append("templateKind", uploadTemplateKind);
            // }

            const response = await fetch(`/api/v1/tests/${testId}/upload-attempts`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                const message =
                    (result && (result.message || result.error)) ||
                    "Failed to upload attempts from Excel";
                throw new Error(message);
            }

            toast.success(result?.message || "Attempts uploaded successfully", { id: loadingToastId });
            // Refresh attempts
            queryClient.invalidateQueries({ queryKey: ["test-attempts", testId] });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to upload attempts from Excel", { id: loadingToastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleImportFromGoogleSheet = async () => {
        if (!sheetUrl) {
            toast.error("Please enter a Google Sheets URL");
            return;
        }
        const loadingToastId = toast.loading("Importing attempts from Google Sheets...");
        try {
            setIsImportingSheet(true);
            const response = await fetch(`/api/v1/tests/${testId}/import-google-sheet`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: sheetUrl }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                const message =
                    (result && (result.message || result.error)) ||
                    "Failed to import attempts from Google Sheets";
                throw new Error(message);
            }

            toast.success(result?.message || "Attempts imported from Google Sheets successfully", { id: loadingToastId });
            queryClient.invalidateQueries({ queryKey: ["test-attempts", testId] });
            setIsSheetDialogOpen(false);
            setSheetUrl("");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to import attempts from Google Sheets", { id: loadingToastId });
        } finally {
            setIsImportingSheet(false);
        }
    };

    const handleNotifyParent = async (attempt: TestAttemptListItem) => {
        if (attempt.isNotified) return;
        const confirmed = window.confirm(
            `Send WhatsApp result notification to parent of ${attempt.student.user.name}?`
        );
        if (!confirmed) return;

        try {
            setNotifyingAttemptId(attempt.id);
            await notifyMutation.mutateAsync(attempt.id);
        } finally {
            setNotifyingAttemptId(null);
        }
    };

    const handleToggleSelectAttempt = (attemptId: string | undefined) => {
        if (!attemptId) return;
        setSelectedAttemptIds((prev) => {
            const next = new Set(prev);
            if (next.has(attemptId)) {
                next.delete(attemptId);
            } else {
                next.add(attemptId);
            }
            return next;
        });
    };

    const handleToggleSelectAll = () => {
        const selectableIds = allAttempts
            .filter((a) => a.id)
            .map((a) => a.id as string);

        setSelectedAttemptIds((prev) => {
            const allSelected = selectableIds.length > 0 && selectableIds.every((id) => prev.has(id));
            if (allSelected) {
                return new Set();
            }

            return new Set(selectableIds);
        });
    };

    const handleDeleteSelectedAttempts = () => {
        if (selectedAttemptIds.size === 0) return;
        setIsDeleteDialogOpen(true);
    };

    const handleTabChange = (tab: TabKey) => {
        router.push(`/my-batches/${batchId}/test/${testId}?tab=${tab}`);
    };

    const handleUpdateTestQuestionMarks = (
        testQuestionId: string,
        field: "marks" | "negMarks",
        rawValue: string
    ) => {
        const parsed = rawValue === "" ? 0 : Number(rawValue);
        if (Number.isNaN(parsed) || parsed < 0) {
            toast.error(`${field === "marks" ? "Marks" : "Negative marks"} must be a non-negative number`);
            return;
        }

        updateQuestionMutation.mutate({
            testQuestionId,
            payload: { [field]: parsed },
        });
    };

    const handleQuestionDragStart = (questionId: string) => {
        setDraggingQuestionId(questionId);
    };

    const handleQuestionDrop = (targetQuestionId: string) => {
        if (!draggingQuestionId || draggingQuestionId === targetQuestionId) return;

        setReorderDraftQuestions((prev) => {
            const from = prev.findIndex((q) => q.id === draggingQuestionId);
            const to = prev.findIndex((q) => q.id === targetQuestionId);
            if (from === -1 || to === -1) return prev;

            const next = [...prev];
            const [moved] = next.splice(from, 1);
            if (!moved) return prev;
            next.splice(to, 0, moved);
            return next;
        });
        setDraggingQuestionId(null);
    };

    const handleOpenReorderModal = () => {
        setReorderDraftQuestions(testQuestions);
        setDraggingQuestionId(null);
        setIsReorderModalOpen(true);
    };

    const handleUpdateQuestionOrder = async () => {
        if (!isQuestionOrderDirty) return;

        const changed = reorderDraftQuestions
            .map((item, index) => ({
                id: item.id,
                nextOrderIndex: index + 1,
                currentOrderIndex: item.orderIndex,
            }))
            .filter((row) => row.nextOrderIndex !== row.currentOrderIndex);

        if (changed.length === 0) return;

        setIsUpdatingQuestionOrder(true);
        const loadingToastId = toast.loading("Updating question order...");
        try {
            await reorderTestQuestions(testId, {
                items: changed.map((row) => ({
                    testQuestionId: row.id,
                    orderIndex: row.nextOrderIndex,
                })),
            });
            toast.dismiss(loadingToastId);
            toast.success("Question order updated");
            setIsReorderModalOpen(false);

            // Keep refresh non-blocking so a background refetch issue
            // does not show a false failure toast for a successful reorder.
            queryClient
                .invalidateQueries({ queryKey: ["test-questions", testId] })
                .catch(() => {
                    toast("Order updated. Refresh to see latest list.");
                });
        } catch (error) {
            toast.dismiss(loadingToastId);
            toast.error(error instanceof Error ? error.message : "Failed to update question order");
        } finally {
            setIsUpdatingQuestionOrder(false);
        }
    };

    if (batchLoading || testLoading) {
        return (
            <div className="space-y-6">
                <TableSkeleton rows={5} columns={4} />
            </div>
        );
    }

    if (!batch || !test) {
        return (
            <div className="space-y-6">
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Test not found</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push(`/my-batches/${batchId}`)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Batch
                    </Button>
                </div>
            </div>
        );
    }

    const isJEE = batch.examType === ExamType.JEE;
    const isNEET = batch.examType === ExamType.NEET;

    // Merge attempts with editing state
    const allAttempts = attempts.map((attempt) => {
        const editing = editingAttempts.get(attempt.studentId);
        return editing ? { ...attempt, ...editing } : attempt;
    });

    // Add new attempts
    editingAttempts.forEach((attempt, studentId) => {
        if (attempt.isNew && !allAttempts.find((a) => a.studentId === studentId)) {
            allAttempts.push(attempt as unknown as TestAttemptListItem);
        }
    });

    // Calculate stats
    const totalStudents = allAttempts.length;
    const submittedAttempts = allAttempts.filter((a) => a.submittedAt !== null);
    const avgTotal = allAttempts.length > 0
        ? Math.round(
            allAttempts.reduce((sum, a) => sum + (a.totalScore || 0), 0) / allAttempts.length
        )
        : 0;
    const allPercentiles = allAttempts
        .map((a) => a.percentile)
        .filter((p): p is number => typeof p === "number");
    const highestPercentile = allPercentiles.length > 0 ? Math.max(...allPercentiles) : null;

    // Get max marks for each subject
    const maxPhysics = test.totalMarksPhysics || 0;
    const maxChemistry = test.totalMarksChemistry || 0;
    const maxMathematics = test.totalMarksMathematics || 0;
    const maxZoology = test.totalMarksZoology || 0;
    const maxBotany = test.totalMarksBotany || 0;

    // Get students not yet added
    const addedStudentIds = new Set(allAttempts.map((a) => a.studentId));
    const availableStudents = students.filter((s: StudentInBatch) => !addedStudentIds.has(s.id));

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/my-batches/${batchId}`)}
                        className="h-9 w-9"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{test.name}</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage student attempts and marks for this test
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-1 w-full sm:w-fit">
                <div className="flex flex-wrap gap-1">
                    {TAB_ITEMS.map((tab) => (
                        <Button
                            key={tab.key}
                            type="button"
                            variant={activeTab === tab.key ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleTabChange(tab.key)}
                            className="rounded-md"
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>
            </div>

            {activeTab === "questions" && (
                <div className="space-y-4">
                    <div className="rounded-lg border border-border bg-card p-4 card-shadow">
                        <div className="flex flex-wrap items-center gap-3">
                            <BookOpenText className="h-4 w-4 text-primary" />
                            <p className="text-sm font-semibold text-foreground">
                                {testQuestions.length} question{testQuestions.length === 1 ? "" : "s"} added
                            </p>
                            <span className="text-muted-foreground">•</span>
                            <p className="text-sm text-muted-foreground">
                                Total marks: <span className="font-semibold text-foreground">{testQuestionsTotal}</span>
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4 card-shadow">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-primary" />
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">Test-level Marks</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Current is computed from the questions added to this test.
                                    </p>
                                </div>
                            </div>

                            <LoadingButton
                                loading={syncMarksMutation.isPending}
                                disabled={syncDisabled || !syncHasChanges}
                                className="gap-2 h-9 px-3 rounded-md"
                                onClick={() => syncMarksMutation.mutate()}
                            >
                                {syncHasChanges ? (
                                    <>
                                        <Save size={14} />
                                        Sync marks to test
                                    </>
                                ) : (
                                    <>
                                        <Check size={14} className="text-success" />
                                        In sync
                                    </>
                                )}
                            </LoadingButton>
                        </div>

                        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
                            {testQuestionsLoading ? (
                                Array.from({ length: isJEE ? 4 : 5 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="rounded-lg border border-border bg-card p-3 animate-pulse space-y-2"
                                    >
                                        <div className="h-3 w-24 rounded bg-muted" />
                                        <div className="h-4 w-20 rounded bg-muted" />
                                        <div className="h-3 w-16 rounded bg-muted" />
                                    </div>
                                ))
                            ) : isJEE ? (
                                <>
                                    <StatRow label="Physics" current={syncCurrent.physics} saved={savedSubjectTotals.PHYSICS} />
                                    <StatRow
                                        label="Chemistry"
                                        current={syncCurrent.chemistry}
                                        saved={savedSubjectTotals.CHEMISTRY}
                                    />
                                    <StatRow
                                        label="Mathematics"
                                        current={syncCurrent.mathematics}
                                        saved={savedSubjectTotals.MATHEMATICS}
                                    />
                                    <StatRow label="Total" current={syncCurrentTotalMarks} saved={savedTotalMarks} isTotal />
                                </>
                            ) : (
                                <>
                                    <StatRow label="Physics" current={syncCurrent.physics} saved={savedSubjectTotals.PHYSICS} />
                                    <StatRow
                                        label="Chemistry"
                                        current={syncCurrent.chemistry}
                                        saved={savedSubjectTotals.CHEMISTRY}
                                    />
                                    <StatRow label="Zoology" current={syncCurrent.zoology} saved={savedSubjectTotals.ZOOLOGY} />
                                    <StatRow label="Botany" current={syncCurrent.botany} saved={savedSubjectTotals.BOTANY} />
                                    <StatRow
                                        label="Total"
                                        current={syncCurrentTotalMarks}
                                        saved={savedTotalMarks}
                                        isTotal
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <div className="rounded-lg border border-border bg-card p-4 card-shadow space-y-4">
                            <h2 className="text-sm font-bold text-foreground">Question Bank Browser</h2>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <Input
                                    placeholder="Search questions..."
                                    value={questionSearch}
                                    onChange={(e) => setQuestionSearch(e.target.value)}
                                    className="md:col-span-2"
                                />
                                <Select value={questionSubject || "all"} onValueChange={(v) => {
                                    setQuestionSubject(v === "all" ? "" : v);
                                    setQuestionTopicId("");
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All allowed subjects</SelectItem>
                                        {SUBJECT_OPTIONS.filter((s) => allowedSubjectSet.has(s.value)).map((s) => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={questionTopicId || "all"}
                                    onValueChange={(v) => setQuestionTopicId(v === "all" ? "" : v)}
                                    disabled={!questionSubject}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Topic" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All topics</SelectItem>
                                        {topicOptions.map((t: TopicListItem) => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={questionDifficulty || "all"} onValueChange={(v) => setQuestionDifficulty(v === "all" ? "" : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All difficulties</SelectItem>
                                        {DIFFICULTY_OPTIONS.map((d) => (
                                            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
                                {questionBankLoading ? (
                                    <p className="text-sm text-muted-foreground py-4">Loading question bank...</p>
                                ) : filteredQuestionBank.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4">No questions found for current filters.</p>
                                ) : (
                                    filteredQuestionBank.map((question: QuestionListItem) => {
                                        const isAdded = addedQuestionIds.has(question.id);
                                        return (
                                            <div
                                                key={question.id}
                                                className="rounded-lg border border-border bg-card p-3.5 space-y-3 transition-all hover:border-primary/40 hover:shadow-sm"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <p className="text-sm font-medium text-foreground leading-5">
                                                        {truncateText(question.text, 130)}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="rounded-full bg-primary/10 text-primary px-2.5 py-1 font-medium">
                                                        {question.subject}
                                                    </span>
                                                    <span className="rounded-full bg-muted px-2.5 py-1 text-foreground">
                                                        {question.topicName ?? "No topic"}
                                                    </span>
                                                    <span className="rounded-full bg-muted px-2.5 py-1 text-foreground">
                                                        {question.difficulty}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-end">
                                                    <LoadingButton
                                                        size="sm"
                                                        className="min-w-[120px]"
                                                        variant={isAdded ? "outline" : "default"}
                                                        loading={addingQuestionIds.has(question.id) && addQuestionMutation.isPending}
                                                        disabled={isAdded}
                                                        onClick={() => {
                                                            setAddingQuestionIds((prev) => {
                                                                const next = new Set(prev);
                                                                next.add(question.id);
                                                                return next;
                                                            });
                                                            addQuestionMutation.mutate(question.id, {
                                                                onSettled: () => {
                                                                    setAddingQuestionIds((prev) => {
                                                                        const next = new Set(prev);
                                                                        next.delete(question.id);
                                                                        return next;
                                                                    });
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        {isAdded
                                                            ? "Added"
                                                            : addingQuestionIds.has(question.id) &&
                                                                addQuestionMutation.isPending
                                                                ? "Adding..."
                                                                : "Add to Test"}
                                                    </LoadingButton>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-4 card-shadow space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-sm font-bold text-foreground">Questions in This Test</h2>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={testQuestionsLoading || testQuestions.length < 2}
                                    onClick={handleOpenReorderModal}
                                >
                                    Reorder Questions
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
                                {testQuestionsLoading ? (
                                    <p className="text-sm text-muted-foreground py-4">Loading test questions...</p>
                                ) : testQuestions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4">No questions added yet.</p>
                                ) : (
                                    testQuestions.map((item: TestQuestionListItem, index: number) => (
                                        <div key={item.id} className="rounded-md border border-border p-3">
                                            <div className="flex items-start gap-3">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <GripVertical className="h-4 w-4" />
                                                    <span className="text-xs font-mono">{index + 1}</span>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm text-foreground">{truncateText(item.question.text, 140)}</p>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive h-8 w-8 p-0.5"
                                                            onClick={() => {
                                                                setRemovingQuestionIds((prev) => {
                                                                    const next = new Set(prev);
                                                                    next.add(item.id);
                                                                    return next;
                                                                });

                                                                void toast.promise(
                                                                    removeQuestionMutation
                                                                        .mutateAsync(item.id)
                                                                        .finally(() => {
                                                                            setRemovingQuestionIds((prev) => {
                                                                                const next = new Set(prev);
                                                                                next.delete(item.id);
                                                                                return next;
                                                                            });
                                                                        }),
                                                                    {
                                                                        loading: "Removing...",
                                                                        success: "Question removed",
                                                                        error: (err) =>
                                                                            err instanceof Error
                                                                                ? err.message || "Failed to remove question"
                                                                                : "Failed to remove question",
                                                                    }
                                                                );
                                                            }}
                                                            disabled={removingQuestionIds.has(item.id)}
                                                            title="Remove question"
                                                            aria-label="Remove question"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3 items-center">
                                                        <span className="text-xs text-muted-foreground">{item.question.subject}</span>

                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] font-medium text-muted-foreground">
                                                                Marks
                                                            </span>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                step={1}
                                                                defaultValue={item.marks}
                                                                className="w-20 h-8 text-xs"
                                                                aria-label="Marks for correct answer"
                                                                onBlur={(e) =>
                                                                    handleUpdateTestQuestionMarks(item.id, "marks", e.target.value)
                                                                }
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] font-medium text-muted-foreground">
                                                                Negative
                                                            </span>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                step={0.25}
                                                                defaultValue={item.negMarks}
                                                                className="w-20 h-8 text-xs"
                                                                aria-label="Negative marks"
                                                                onBlur={(e) =>
                                                                    handleUpdateTestQuestionMarks(item.id, "negMarks", e.target.value)
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="border-t border-border pt-3 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Running total marks</span>
                                <span className="font-semibold text-foreground">{testQuestionsTotal}</span>
                            </div>
                        </div>
                    </div>

                    <Dialog open={isReorderModalOpen} onOpenChange={setIsReorderModalOpen}>
                        <DialogContent className="max-w-5xl">
                            <DialogHeader>
                                <DialogTitle>Reorder Questions</DialogTitle>
                            </DialogHeader>
                            <p className="text-sm text-muted-foreground">
                                Drag and drop questions in any order, then click Update Order to save.
                            </p>
                            <div className="max-h-[65vh] overflow-y-auto space-y-2 pr-1">
                                {reorderDraftQuestions.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "rounded-md border border-border p-3 bg-card",
                                            draggingQuestionId === item.id ? "opacity-60" : ""
                                        )}
                                        draggable
                                        onDragStart={() => handleQuestionDragStart(item.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => handleQuestionDrop(item.id)}
                                        onDragEnd={() => setDraggingQuestionId(null)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center gap-1 text-muted-foreground cursor-grab">
                                                <GripVertical className="h-4 w-4" />
                                                <span className="text-xs font-mono">{index + 1}</span>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <p className="text-sm text-foreground">{truncateText(item.question.text, 200)}</p>
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    <span className="rounded-full bg-primary/10 text-primary px-2.5 py-1 font-medium">
                                                        {item.question.subject}
                                                    </span>
                                                    <span className="rounded-full bg-muted px-2.5 py-1 text-foreground">
                                                        {item.question.topicName ?? "No topic"}
                                                    </span>
                                                    <span className="rounded-full bg-muted px-2.5 py-1 text-foreground">
                                                        Marks: {item.marks}, Negative: {item.negMarks}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsReorderModalOpen(false);
                                        setDraggingQuestionId(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <LoadingButton
                                    loading={isUpdatingQuestionOrder}
                                    disabled={!isQuestionOrderDirty || isUpdatingQuestionOrder}
                                    onClick={() => void handleUpdateQuestionOrder()}
                                >
                                    Update Order
                                </LoadingButton>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {activeTab === "results-analysis" && (
                <div className="space-y-5">
                    {resultsAnalysisAttemptId ? (
                        <TestAttemptQuestionAnalysis
                            testId={testId}
                            attemptId={resultsAnalysisAttemptId}
                            onBack={() => router.replace(`/my-batches/${batchId}/test/${testId}?tab=results-analysis`)}
                        />
                    ) : (
                        <TestClassOverview
                            testId={testId}
                            onViewAnalysis={(attemptId) =>
                                router.push(
                                    `/my-batches/${batchId}/test/${testId}?tab=results-analysis&analysisAttemptId=${attemptId}`,
                                )
                            }
                        />
                    )}
                </div>
            )}

            {activeTab === "marks-entry" && (
                <>

                    {/* Import & Bulk Upload section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold text-foreground">
                                Import & Bulk Upload Marks <span className="text-muted-foreground font-normal">(Excel / Google Sheets)</span>
                            </h2>
                            <Button
                                onClick={() => setIsTemplateDialogOpen(true)}
                                variant="outline"
                                className="gap-2"
                                disabled={!test || !batch || isDownloadingTemplate}
                            >
                                <Download className="h-4 w-4" />
                                {isDownloadingTemplate ? "Downloading..." : "Download Template"}
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="group rounded-lg border-2 border-dashed border-primary/40 bg-card p-5 hover:border-primary transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                        <Upload size={22} className="text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-foreground">Upload Excel</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Upload either marks template or question-answer attempt template (.xls/.xlsx)
                                        </p>
                                        {/* <div className="mt-2 w-[220px]">
                                    <Select
                                        value={uploadTemplateKind}
                                        onValueChange={(value: "auto" | "subject-marks" | "question-answers") =>
                                            setUploadTemplateKind(value)
                                        }
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Template type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auto">Auto detect</SelectItem>
                                            <SelectItem value="subject-marks">Marks template</SelectItem>
                                            <SelectItem value="question-answers">Question-answer template</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div> */}
                                        <div className="mt-3 flex items-center gap-2">
                                            <label className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                                                <Upload size={14} />
                                                {isUploading ? "Uploading..." : "Select Excel File"}
                                                <input
                                                    type="file"
                                                    accept=".xls,.xlsx"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        void handleUploadExcel(file);
                                                        // reset input so same file can be re-selected
                                                        e.target.value = "";
                                                    }}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="group rounded-lg border-2 border-dashed border-primary/40 bg-card p-5 hover:border-primary transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                                        <FileSpreadsheet size={22} className="text-success" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-foreground">Import from Google Sheets</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Import marks directly from Google Sheets</p>
                                        <button
                                            className="mt-3 flex items-center gap-2 rounded-md bg-jee px-4 py-2 text-xs font-semibold text-white hover:bg-jee/90 transition-colors"
                                            onClick={() => setIsSheetDialogOpen(true)}
                                        >
                                            <FileSpreadsheet size={14} /> Connect Google Sheets
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isSheetDialogOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                            <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg border border-border">
                                <h3 className="text-base font-semibold text-foreground mb-2">Import from Google Sheets</h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Paste the Google Sheets export URL (xlsx). Make sure the sheet is shared so it can be accessed without login.
                                </p>
                                <Input
                                    placeholder="https://docs.google.com/spreadsheets/d/.../export?format=xlsx"
                                    value={sheetUrl}
                                    onChange={(e) => setSheetUrl(e.target.value)}
                                    className="mb-4"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setIsSheetDialogOpen(false);
                                            setSheetUrl("");
                                        }}
                                        disabled={isImportingSheet}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => void handleImportFromGoogleSheet()}
                                        disabled={isImportingSheet}
                                        className="gap-1"
                                    >
                                        {isImportingSheet ? (
                                            <span>Importing...</span>
                                        ) : (
                                            <>
                                                <FileSpreadsheet size={14} />
                                                <span>Import</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isTemplateDialogOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                            <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg border border-border">
                                <h3 className="text-base font-semibold text-foreground mb-2">Download Excel Template</h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Choose a template type, then decide whether to pre-fill students.
                                </p>
                                <div className="mb-4">
                                    <Select
                                        value={downloadTemplateType}
                                        onValueChange={(value: "subject-marks" | "question-answers") =>
                                            setDownloadTemplateType(value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select template type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="subject-marks">Subject Wise Marks Template</SelectItem>
                                            <SelectItem value="question-answers">Question Wise Answer Template</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsTemplateDialogOpen(false)}
                                        disabled={isDownloadingTemplate}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => void handleDownloadTemplate(false, downloadTemplateType)}
                                        disabled={isDownloadingTemplate}
                                    >
                                        Without Students
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="gap-1"
                                        onClick={() => void handleDownloadTemplate(true, downloadTemplateType)}
                                        disabled={isDownloadingTemplate}
                                    >
                                        {isDownloadingTemplate ? (
                                            <span>Preparing...</span>
                                        ) : (
                                            <>
                                                <Users size={14} />
                                                <span>With Students + Roll No</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Student & Bulk Actions Section */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Select value={newStudentId} onValueChange={setNewStudentId}>
                                <SelectTrigger className="w-[300px]">
                                    <SelectValue placeholder="Select a student to add" />
                                </SelectTrigger>
                                <SelectContent>
                                    {studentsLoading ? (
                                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                                    ) : availableStudents.length === 0 ? (
                                        <SelectItem value="none" disabled>No students available</SelectItem>
                                    ) : (
                                        availableStudents.map((student: StudentInBatch) => (
                                            <SelectItem key={student.id} value={student.id}>
                                                {student.user.name} ({student.rollNo})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAddStudent} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Student
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="gap-1"
                                        disabled={selectedAttemptIds.size === 0 || deleteAttemptsMutation.isPending}
                                        onClick={handleDeleteSelectedAttempts}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="hidden sm:inline">Delete Selected</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete selected attempts?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the selected attempts and
                                            remove their marks from this test.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel
                                            onClick={() => {
                                                setIsDeleteDialogOpen(false);
                                            }}
                                        >
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            variant="destructive"
                                            onClick={() => {
                                                deleteAttemptsMutation.mutate(Array.from(selectedAttemptIds));
                                                setIsDeleteDialogOpen(false);
                                            }}
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-lg border border-border bg-card card-shadow">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="w-8 px-3 py-3">
                                        <Checkbox
                                            className="rounded border-border"
                                            checked={
                                                allAttempts.length > 0 &&
                                                allAttempts
                                                    .filter((a) => a.id)
                                                    .every((a) => selectedAttemptIds.has(a.id as string))
                                            }
                                            onCheckedChange={handleToggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-foreground">Student Name</th>
                                    {isJEE ? (
                                        <>
                                            <th className="px-4 py-3 text-center font-semibold text-foreground">
                                                Physics <span className="text-xs text-muted-foreground font-normal">({maxPhysics})</span>
                                            </th>
                                            <th className="px-4 py-3 text-center font-semibold text-foreground">
                                                Chemistry <span className="text-xs text-muted-foreground font-normal">({maxChemistry})</span>
                                            </th>
                                            <th className="px-4 py-3 text-center font-semibold text-foreground">
                                                Mathematics <span className="text-xs text-muted-foreground font-normal">({maxMathematics})</span>
                                            </th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-4 py-3 text-center font-semibold text-foreground">
                                                Physics <span className="text-xs text-muted-foreground font-normal">({maxPhysics})</span>
                                            </th>
                                            <th className="px-4 py-3 text-center font-semibold text-foreground">
                                                Chemistry <span className="text-xs text-muted-foreground font-normal">({maxChemistry})</span>
                                            </th>
                                            <th className="px-4 py-3 text-center font-semibold text-foreground">
                                                Zoology <span className="text-xs text-muted-foreground font-normal">({maxZoology})</span>
                                            </th>
                                            <th className="px-4 py-3 text-center font-semibold text-foreground">
                                                Botany <span className="text-xs text-muted-foreground font-normal">({maxBotany})</span>
                                            </th>
                                        </>
                                    )}
                                    <th className="px-4 py-3 text-center font-semibold text-foreground">
                                        Total Marks <span className="text-xs text-muted-foreground font-normal">({test.totalMarks})</span>
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-foreground">Percentile</th>
                                    <th className="px-4 py-3 text-center font-semibold text-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attemptsLoading ? (
                                    <tr>
                                        <td colSpan={isJEE ? 9 : 10} className="px-4 py-8 text-center text-muted-foreground">
                                            Loading attempts...
                                        </td>
                                    </tr>
                                ) : allAttempts.length === 0 ? (
                                    <tr>
                                        <td colSpan={isJEE ? 9 : 10} className="px-4 py-8 text-center text-muted-foreground">
                                            No attempts found for this test. Add a student to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    allAttempts.map((attempt, i) => {
                                        const total = attempt.totalScore || 0;
                                        const percentile = test.totalMarks > 0 ? (total / test.totalMarks) * 100 : null;
                                        const studentName = attempt.student?.user.name || "Unknown";
                                        const avatar = studentName.charAt(0).toUpperCase();
                                        const rollNo = attempt.student?.rollNo || "";
                                        const isEditing = editingAttempts.has(attempt.studentId);
                                        const hasUnsavedChanges = !!editingAttempts.get(attempt.studentId);

                                        return (
                                            <tr
                                                key={attempt.id || attempt.studentId}
                                                className={cn(
                                                    "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                                                    i % 2 === 0 ? "bg-card" : "bg-muted/20",
                                                    isEditing && "bg-primary/5"
                                                )}
                                            >
                                                <td className="px-3 py-3">
                                                    <Checkbox
                                                        className="rounded border-border"
                                                        disabled={!attempt.id}
                                                        checked={attempt.id ? selectedAttemptIds.has(attempt.id) : false}
                                                        onCheckedChange={() => handleToggleSelectAttempt(attempt.id)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                            {avatar}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-foreground">{studentName}</span>
                                                            <p className="text-xs text-muted-foreground">Roll No: {rollNo}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {isJEE ? (
                                                    <>
                                                        <td className="px-4 py-3 text-center">
                                                            <Input
                                                                type="number"
                                                                value={attempt.physicsMarks?.toString() || ""}
                                                                onChange={(e) =>
                                                                    handleUpdateMarks(
                                                                        attempt.studentId,
                                                                        "physicsMarks",
                                                                        e.target.value ? parseFloat(e.target.value) : null,
                                                                        maxPhysics,
                                                                        "Physics"
                                                                    )
                                                                }
                                                                className="w-20 text-center font-mono"
                                                                placeholder="0"
                                                                max={maxPhysics}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <Input
                                                                type="number"
                                                                value={attempt.chemistryMarks?.toString() || ""}
                                                                onChange={(e) =>
                                                                    handleUpdateMarks(
                                                                        attempt.studentId,
                                                                        "chemistryMarks",
                                                                        e.target.value ? parseFloat(e.target.value) : null,
                                                                        maxChemistry,
                                                                        "Chemistry"
                                                                    )
                                                                }
                                                                className="w-20 text-center font-mono"
                                                                placeholder="0"
                                                                max={maxChemistry}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <Input
                                                                type="number"
                                                                value={attempt.mathematicsMarks?.toString() || ""}
                                                                onChange={(e) =>
                                                                    handleUpdateMarks(
                                                                        attempt.studentId,
                                                                        "mathematicsMarks",
                                                                        e.target.value ? parseFloat(e.target.value) : null,
                                                                        maxMathematics,
                                                                        "Mathematics"
                                                                    )
                                                                }
                                                                className="w-20 text-center font-mono"
                                                                placeholder="0"
                                                                max={maxMathematics}
                                                            />
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-4 py-3 text-center">
                                                            <Input
                                                                type="number"
                                                                value={attempt.physicsMarks?.toString() || ""}
                                                                onChange={(e) =>
                                                                    handleUpdateMarks(
                                                                        attempt.studentId,
                                                                        "physicsMarks",
                                                                        e.target.value ? parseFloat(e.target.value) : null,
                                                                        maxPhysics,
                                                                        "Physics"
                                                                    )
                                                                }
                                                                className="w-20 text-center font-mono"
                                                                placeholder="0"
                                                                max={maxPhysics}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <Input
                                                                type="number"
                                                                value={attempt.chemistryMarks?.toString() || ""}
                                                                onChange={(e) =>
                                                                    handleUpdateMarks(
                                                                        attempt.studentId,
                                                                        "chemistryMarks",
                                                                        e.target.value ? parseFloat(e.target.value) : null,
                                                                        maxChemistry,
                                                                        "Chemistry"
                                                                    )
                                                                }
                                                                className="w-20 text-center font-mono"
                                                                placeholder="0"
                                                                max={maxChemistry}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <Input
                                                                type="number"
                                                                value={attempt.zoologyMarks?.toString() || ""}
                                                                onChange={(e) =>
                                                                    handleUpdateMarks(
                                                                        attempt.studentId,
                                                                        "zoologyMarks",
                                                                        e.target.value ? parseFloat(e.target.value) : null,
                                                                        maxZoology,
                                                                        "Zoology"
                                                                    )
                                                                }
                                                                className="w-20 text-center font-mono"
                                                                placeholder="0"
                                                                max={maxZoology}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <Input
                                                                type="number"
                                                                value={attempt.botanyMarks?.toString() || ""}
                                                                onChange={(e) =>
                                                                    handleUpdateMarks(
                                                                        attempt.studentId,
                                                                        "botanyMarks",
                                                                        e.target.value ? parseFloat(e.target.value) : null,
                                                                        maxBotany,
                                                                        "Botany"
                                                                    )
                                                                }
                                                                className="w-20 text-center font-mono"
                                                                placeholder="0"
                                                                max={maxBotany}
                                                            />
                                                        </td>
                                                    </>
                                                )}
                                                <td className="px-4 py-3 text-center font-mono font-semibold text-foreground">
                                                    {total.toFixed(1)} <span className="text-muted-foreground font-normal">/ {test.totalMarks}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {percentile !== null ? (
                                                        <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono", getPercentileBg(percentile))}>
                                                            {percentile.toFixed(1)}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <LoadingButton
                                                            size="sm"
                                                            onClick={() => handleSave(attempt.studentId)}
                                                            loading={savingStudentId === attempt.studentId && saveMutation.isPending}
                                                            disabled={!hasUnsavedChanges}
                                                            className="h-8 text-xs"
                                                        >
                                                            <Save size={12} className="mr-1" />
                                                            Save
                                                        </LoadingButton>
                                                        {isEditing && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCancel(attempt.studentId)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <X size={12} />
                                                            </Button>
                                                        )}
                                                        <button
                                                            className={cn(
                                                                "inline-flex items-center justify-center rounded-full p-1.5",
                                                                attempt.isNotified
                                                                    ? "bg-muted text-muted-foreground cursor-default"
                                                                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                                                            )}
                                                            title={
                                                                attempt.isNotified
                                                                    ? "Result already notified"
                                                                    : "Notify parent via WhatsApp"
                                                            }
                                                            disabled={attempt.isNotified || notifyMutation.isPending}
                                                            onClick={() => void handleNotifyParent(attempt as TestAttemptListItem)}
                                                        >
                                                            {notifyingAttemptId === attempt.id && notifyMutation.isPending ? (
                                                                <span className="text-[10px] font-semibold px-1">...</span>
                                                            ) : (
                                                                <MessageCircle size={14} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 card-shadow">
                        <div className="flex flex-wrap gap-6">
                            <Stat icon={Users} label="Students:" value={totalStudents.toString()} />
                            <Stat icon={TrendingUp} label="Avg. Marks:" value={`${avgTotal} / ${test.totalMarks}`} />
                            <Stat
                                icon={Award}
                                label="Highest Percentile:"
                                value={highestPercentile === null ? "-" : `${highestPercentile.toFixed(1)}%`}
                            />
                            <Stat icon={BellRing} label="Submitted:" value={`${submittedAttempts.length} / ${totalStudents}`} />
                        </div>
                        {/* <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Save size={16} />
                    Save Marks & Generate Report
                </button> */}
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        Marks will be auto-saved and reflected in student dashboards, results & parent app.
                    </p>
                </>
            )}
        </div>
    );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
    return (
        <div className="flex items-center gap-2">
            <Icon size={16} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-bold font-mono text-foreground">{value}</span>
        </div>
    );
}

function StatRow({
    label,
    current,
    saved,
    isTotal,
}: {
    label: string;
    current: number;
    saved: number;
    isTotal?: boolean;
}) {
    const mismatch = current !== saved;

    return (
        <div
            className={cn(
                "rounded-md border border-border bg-muted/20 px-3 py-2.5 flex items-start justify-between gap-3",
                mismatch ? "border-destructive/30 bg-destructive/5" : "bg-muted/20"
            )}
        >
            <div>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className={cn("mt-0.5 flex items-baseline gap-2", isTotal ? "font-semibold" : "")}>
                    <span className={cn("text-sm font-mono", mismatch ? "text-destructive" : "text-foreground")}>
                        {current}
                    </span>
                    <span className="text-[12px] text-muted-foreground">/ {saved}</span>
                </div>
            </div>

            <div className="shrink-0">
                <span
                    className={cn(
                        "text-[10px] font-semibold uppercase tracking-wide",
                        mismatch ? "text-destructive" : "text-emerald-600"
                    )}
                >
                    {mismatch ? "Not synced" : "Synced"}
                </span>
            </div>
        </div>
    );
}
