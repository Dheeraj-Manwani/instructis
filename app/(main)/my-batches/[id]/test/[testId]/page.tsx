"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBreadcrumb } from "@/store/BreadcrumbContext";
import { useRouter } from "nextjs-toploader/app";
import { useParams } from "next/navigation";
import { ArrowLeft, Upload, FileSpreadsheet, Save, Users, TrendingUp, Award, BellRing, Plus, X, Download, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchTestById, fetchTestAttempts, createTestAttempt, notifyTestAttempt, deleteTestAttempts, type TestAttemptListItem, type CreateTestAttemptPayload } from "@/lib/api/tests";
import { fetchBatchById, fetchStudentsInBatch, type StudentInBatch } from "@/lib/api/batches";
import { ExamType } from "@prisma/client";
import { TableSkeleton } from "@/components/ui/table-skeleton";
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
import { toast } from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";

function getPercentileBg(percentile: number | null): string {
    if (!percentile) return "bg-muted text-muted-foreground";
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

export default function TestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const batchId = params.id as string;
    const testId = params.testId as string;
    const queryClient = useQueryClient();

    const [editingAttempts, setEditingAttempts] = useState<Map<string, EditableAttempt>>(new Map());
    const [newStudentId, setNewStudentId] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
    const [isSheetDialogOpen, setIsSheetDialogOpen] = useState(false);
    const [sheetUrl, setSheetUrl] = useState("");
    const [isImportingSheet, setIsImportingSheet] = useState(false);
    const [notifyingAttemptId, setNotifyingAttemptId] = useState<string | null>(null);
    const [selectedAttemptIds, setSelectedAttemptIds] = useState<Set<string>>(new Set());
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
        onSuccess: (data) => {
            if (data.deletedCount > 0) {
                toast.success("Selected attempts deleted successfully");
            } else {
                toast("No attempts were deleted");
            }
            setSelectedAttemptIds(new Set());
            queryClient.invalidateQueries({ queryKey: ["test-attempts", testId] });
        },
        onError: (e: Error) => {
            toast.error(e.message || "Failed to delete attempts");
        },
    });

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
            if (value < 0) {
                toast.error(`${label} marks cannot be negative`);
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

    const handleDownloadTemplate = async (includeStudents: boolean) => {
        try {
            setIsDownloadingTemplate(true);
            setIsTemplateDialogOpen(false);
            const response = await fetch(
                `/api/v1/tests/${testId}/download-template?includeStudents=${includeStudents ? "true" : "false"}`
            );
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: "Failed to download template" }));
                throw new Error(error.error || "Failed to download template");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${test?.name || "template"}_template.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Template downloaded successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to download template");
        } finally {
            setIsDownloadingTemplate(false);
        }
    };

    const handleUploadExcel = async (file: File | null) => {
        if (!file) return;
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);

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

            toast.success(result?.message || "Attempts uploaded successfully");
            // Refresh attempts
            queryClient.invalidateQueries({ queryKey: ["test-attempts", testId] });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to upload attempts from Excel");
        } finally {
            setIsUploading(false);
        }
    };

    const handleImportFromGoogleSheet = async () => {
        if (!sheetUrl) {
            toast.error("Please enter a Google Sheets URL");
            return;
        }
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

            toast.success(result?.message || "Attempts imported from Google Sheets successfully");
            queryClient.invalidateQueries({ queryKey: ["test-attempts", testId] });
            setIsSheetDialogOpen(false);
            setSheetUrl("");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to import attempts from Google Sheets");
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
    const highestPercentile = allAttempts.length > 0
        ? Math.max(...allAttempts.map((a) => a.percentile || 0))
        : 0;

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
                                <p className="text-xs text-muted-foreground mt-0.5">Upload marks from an Excel (.xls or .xlsx) file</p>
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
                            Do you want the template pre-filled with students and roll numbers from this batch, or an empty template?
                        </p>
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
                                onClick={() => void handleDownloadTemplate(false)}
                                disabled={isDownloadingTemplate}
                            >
                                Without Students
                            </Button>
                            <Button
                                size="sm"
                                className="gap-1"
                                onClick={() => void handleDownloadTemplate(true)}
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
                        <AlertDialogAction asChild>
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
                        </AlertDialogAction>
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
                                const percentile =
                                    test.totalMarks && total > 0 ? (total / test.totalMarks) * 100 : 0;
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
                                                        min={0}
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
                                                        min={0}
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
                                                        min={0}
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
                                                        min={0}
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
                                                        min={0}
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
                                                        min={0}
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
                                                        min={0}
                                                        max={maxBotany}
                                                    />
                                                </td>
                                            </>
                                        )}
                                        <td className="px-4 py-3 text-center font-mono font-semibold text-foreground">
                                            {total.toFixed(1)} <span className="text-muted-foreground font-normal">/ {test.totalMarks}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {percentile > 0 ? (
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
                    <Stat icon={Award} label="Highest Percentile:" value={highestPercentile > 0 ? `${highestPercentile.toFixed(1)}%` : "-"} />
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
