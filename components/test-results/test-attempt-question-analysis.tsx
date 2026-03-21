"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    fetchTestAttemptAnalysis,
    fetchTestClassOverview,
    notifyTestAttempt,
    type TestAttemptAnalysisResponse,
    type TestClassOverviewResponse,
} from "@/lib/api/tests";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Lightbulb,
    BookOpen,
    Video,
    Target,
    Download,
    MessageCircle,
    AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";
import type React from "react";

function truncateText(value: string, len: number) {
    if (value.length <= len) return value;
    return `${value.slice(0, len)}...`;
}

function getPercentilePillClass(percentile: number) {
    if (percentile >= 90) return "bg-success/20 text-success border-success/30";
    if (percentile >= 70) return "bg-warning/20 text-warning border-warning/30";
    return "bg-destructive/20 text-destructive border-destructive/30";
}

function getAccuracyPercent(correct: number, incorrect: number) {
    const total = correct + incorrect;
    if (total <= 0) return null;
    return (correct / total) * 100;
}

function getSubjectTabs(examType: string | undefined) {
    const jee = examType === "JEE";
    if (jee) {
        return [
            { key: "PHYSICS", label: "Physics" },
            { key: "CHEMISTRY", label: "Chemistry" },
            { key: "MATHEMATICS", label: "Math" },
        ];
    }
    return [
        { key: "PHYSICS", label: "Physics" },
        { key: "CHEMISTRY", label: "Chemistry" },
        { key: "ZOOLOGY", label: "Zoology" },
        { key: "BOTANY", label: "Botany" },
    ];
}

export default function TestAttemptQuestionAnalysis({
    testId,
    attemptId,
    onBack,
}: {
    testId: string;
    attemptId: string;
    onBack: () => void;
}) {
    const { data: analysis, isLoading } = useQuery({
        queryKey: ["test-attempt-question-analysis", attemptId],
        queryFn: () => fetchTestAttemptAnalysis(attemptId),
        enabled: !!attemptId,
    });

    const { data: classOverview } = useQuery({
        queryKey: ["test-class-overview", testId],
        queryFn: () => fetchTestClassOverview(testId),
        enabled: !!testId,
    });

    const classRes = classOverview as TestClassOverviewResponse | undefined;

    const questions = useMemo(() => analysis?.questions ?? [], [analysis?.questions]);
    const correctQuestions = useMemo(() => questions.filter((q) => q.isCorrect), [questions]);
    const incorrectQuestions = useMemo(() => questions.filter((q) => !q.isCorrect), [questions]);
    const unattemptedCount = useMemo(
        () => questions.filter((q) => q.yourAnswer === "Not Answered").length,
        [questions],
    );

    const examType = analysis?.batch?.examType;
    const subjectTabs = useMemo(() => getSubjectTabs(examType), [examType]);

    const [activeSubject, setActiveSubject] = useState(subjectTabs[0]?.key ?? "PHYSICS");
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const safeActiveSubject = useMemo(() => {
        if (subjectTabs.some((t) => t.key === activeSubject)) return activeSubject;
        return subjectTabs[0]?.key ?? "PHYSICS";
    }, [activeSubject, subjectTabs]);

    const correctFiltered = useMemo(() => {
        if (!activeSubject) return correctQuestions;
        return correctQuestions.filter((q) => q.subject === safeActiveSubject);
    }, [correctQuestions, safeActiveSubject, activeSubject]);

    const studentImprovement = useMemo(() => {
        const studentId = analysis?.student?.id;
        if (!studentId) return null;
        const row = classRes?.students.find((s) => s.studentId === studentId);
        return row?.improvementPoints ?? null;
    }, [analysis?.student?.id, classRes?.students]);

    const studentRow = useMemo(() => {
        const studentId = analysis?.student?.id;
        if (!studentId) return null;
        return classRes?.students.find((s) => s.studentId === studentId) ?? null;
    }, [analysis?.student?.id, classRes?.students]);

    const timeTaken = useMemo(() => {
        return studentRow?.timeTaken ?? null;
    }, [studentRow]);

    const accuracy = getAccuracyPercent(correctQuestions.length, incorrectQuestions.length);

    const weakTopics = useMemo(() => {
        // Derive from incorrect questions topic/subject.
        const counts = new Map<string, number>();
        for (const q of incorrectQuestions) {
            const key = q.topicName ?? q.subject;
            if (!key) continue;
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([topic, count]) => ({ topic, count }));
    }, [incorrectQuestions]);

    const topWeak = weakTopics[0]?.topic ?? "your weak area";

    const notifyMutation = useMutation({
        mutationFn: () => notifyTestAttempt(testId, attemptId),
        onMutate: () => {
            const toastId = toast.loading("Sending report to parent...");
            return { toastId };
        },
        onSuccess: () => toast.success("WhatsApp notification sent to parent"),
        onError: (e: Error) => toast.error(e.message || "Failed to send notification"),
        onSettled: (_data, _error, _variables, context) => {
            if (context?.toastId) {
                toast.dismiss(context.toastId);
            }
        },
    });

    const downloadReport = async () => {
        if (!analysis) return;
        setIsGeneratingReport(true);
        const loadingToastId = toast.loading("Generating report...");
        try {
            const response = await fetch(`/api/v1/test-attempts/${attemptId}/report`);
            if (!response.ok) {
                throw new Error("Failed to generate report");
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${analysis.student.name}_${analysis.test.name}_report.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            toast.success("PDF report downloaded");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to generate report";
            toast.error(message);
        } finally {
            toast.dismiss(loadingToastId);
            setIsGeneratingReport(false);
        }
    };

    const showQuestionWise = questions.length > 0;

    return (
        <div className="space-y-5">
            <div className="space-y-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Per-Student Question Analysis</h2>
                            <p className="text-sm text-muted-foreground">
                                Student: <span className="font-medium text-foreground">{analysis?.student.name ?? "-"}</span> · Roll No:{" "}
                                <span className="font-mono">{analysis?.student.rollNo ?? "-"}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => void downloadReport()}
                            disabled={!analysis || isGeneratingReport}
                        >
                            <Download size={16} />
                            {isGeneratingReport ? "Generating PDF..." : "Download Report"}
                        </Button>
                        <LoadingButton
                            variant="default"
                            className="gap-2"
                            loading={notifyMutation.isPending}
                            onClick={() => void notifyMutation.mutateAsync()}
                            disabled={!analysis}
                        >
                            <MessageCircle size={16} />
                            Send report to parent
                        </LoadingButton>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 ml-10">
                    <InfoPill label="Total" value={analysis?.attempt.totalScore ?? null} suffix={analysis?.test.totalMarks != null ? ` / ${analysis.test.totalMarks}` : ""} />
                    {typeof analysis?.attempt.percentile === "number" ? (
                        <span
                            className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono",
                                getPercentilePillClass(analysis.attempt.percentile),
                            )}
                        >
                            {analysis.attempt.percentile.toFixed(1)}%
                        </span>
                    ) : (
                        <Badge variant="secondary">Pending</Badge>
                    )}
                    <InfoPill label="Correct" value={correctQuestions.length} />
                    <InfoPill label="Incorrect" value={incorrectQuestions.length} />
                    <InfoPill label="Unattempted" value={unattemptedCount} />
                </div>
            </div>

            {isLoading ? (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground text-sm">Loading analysis...</CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Card className="border-destructive/30 pb-0">
                            <CardContent className="p-4 pt-0">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-destructive" />
                                        <h3 className="text-sm font-bold text-destructive">Incorrect Questions ({incorrectQuestions.length})</h3>
                                    </div>
                                </div>

                                {!showQuestionWise ? (
                                    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
                                        <p className="text-sm font-semibold text-foreground">
                                            Question-wise data not available for this test.
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Ask your faculty to upload question analysis.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {incorrectQuestions.map((q, idx) => (
                                            <QuestionAnalysisCard
                                                key={q.questionId}
                                                q={q}
                                                number={q.orderIndex ?? idx + 1}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-success/30 pb-0">
                            <CardContent className="p-4 pt-0">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                            <h3 className="text-sm font-bold text-success">Correct Questions ({correctQuestions.length})</h3>
                                        </div>
                                    </div>

                                    {showQuestionWise ? (
                                        <div className="flex flex-wrap items-center gap-2">
                                            {subjectTabs.map((t) => (
                                                <Button
                                                    key={t.key}
                                                    type="button"
                                                    size="sm"
                                                    variant={safeActiveSubject === t.key ? "default" : "outline"}
                                                    onClick={() => setActiveSubject(t.key)}
                                                >
                                                    {t.label}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                                {!showQuestionWise ? (
                                    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 mt-4">
                                        <p className="text-sm font-semibold text-foreground">
                                            Question-wise data not available for this test.
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Ask your faculty to upload question analysis.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 mt-3">
                                        {correctFiltered.map((q, idx) => (
                                            <CorrectQuestionCard
                                                key={q.questionId}
                                                q={q}
                                                number={q.orderIndex ?? idx + 1}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-5 card-shadow">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <MetricText label="Accuracy" value={accuracy == null ? "-" : `${accuracy.toFixed(1)}%`} />
                                    <MetricText label="Time taken" value={timeTaken == null ? "-" : `${timeTaken}`} />
                                    <MetricText
                                        label="Improvement"
                                        value={
                                            studentImprovement == null
                                                ? "-"
                                                : `${studentImprovement >= 0 ? "+" : ""}${Math.round(studentImprovement)} pts`
                                        }
                                        tone={
                                            studentImprovement == null ? "muted" : studentImprovement >= 0 ? "success" : "danger"
                                        }
                                    />
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                                        Weak topics
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {weakTopics.length === 0 ? (
                                            <span className="text-xs text-muted-foreground">No weak topics detected.</span>
                                        ) : (
                                            weakTopics.map((t) => (
                                                <div
                                                    key={t.topic}
                                                    className="rounded-full bg-orange-500/10 text-orange-500 px-3 py-1 text-xs font-semibold border border-orange-500/20 hover:bg-orange-500/15 transition-colors"
                                                >
                                                    {t.topic} <span className="text-muted-foreground font-mono">({t.count})</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-muted/20 p-4">
                                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-primary" />
                                    AI Recommendations
                                </h4>
                                <div className="space-y-3">
                                    <RecCard icon={<BookOpen className="h-4 w-4" />} text={`Practice: ${topWeak} (recommended questions)`} />
                                    <RecCard icon={<Video className="h-4 w-4" />} text={`Watch: ${topWeak} concept walkthrough`} />
                                    <RecCard icon={<Target className="h-4 w-4" />} text={`Revision: ${topWeak} quick notes`} />
                                </div>
                            </div>
                        </div>
                    </div>

                </>
            )}
        </div>
    );
}

function InfoPill({ label, value, suffix }: { label: string; value: number | null; suffix?: string }) {
    const display = value == null ? "-" : String(value);
    return (
        <Badge variant="secondary" className="px-3 py-1.5 text-xs font-semibold font-mono">
            {label}: {display}
            {suffix ? <span className="text-muted-foreground">{suffix}</span> : null}
        </Badge>
    );
}

function MetricText({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone?: "muted" | "success" | "danger";
}) {
    const toneClass =
        tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : "text-muted-foreground";
    return (
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className={cn("mt-0.5 text-sm font-bold font-mono", toneClass)}>{value}</div>
        </div>
    );
}

function RecCard({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
            <div className="text-xs font-semibold text-foreground">{text}</div>
        </div>
    );
}

function CorrectQuestionCard({
    q,
    number,
}: {
    q: TestAttemptAnalysisResponse["questions"][number];
    number: number;
}) {
    return (
        <div className="rounded-lg border border-success/20 bg-success/5 p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success text-[10px] font-bold">
                        {number}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{truncateText(q.questionText, 120)}</p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <Badge className="bg-success/10 text-success border-success/20 font-semibold">
                                {q.yourAnswer}
                            </Badge>
                            <Badge variant="outline" className="border-success/30 text-success">
                                Correct
                            </Badge>
                            {q.marksAwarded != null ? (
                                <span className="text-xs text-muted-foreground font-mono">+{q.marksAwarded}</span>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuestionAnalysisCard({
    q,
    number,
}: {
    q: TestAttemptAnalysisResponse["questions"][number];
    number: number;
}) {
    return (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 text-destructive text-[10px] font-bold">
                    {number}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{q.questionText}</p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2">
                            <div className="text-[10px] uppercase tracking-wide text-destructive font-semibold flex items-center gap-2">
                                Wrong Answer <XCircle className="h-4 w-4" />
                            </div>
                            <div className="mt-1 font-mono text-sm text-destructive font-semibold wrap-break-word">
                                {q.yourAnswer}
                            </div>
                        </div>
                        <div className="rounded-md bg-success/10 border border-success/20 p-2">
                            <div className="text-[10px] uppercase tracking-wide text-success font-semibold flex items-center gap-2">
                                Correct Answer <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div className="mt-1 font-mono text-sm text-success font-semibold wrap-break-word">
                                {q.correctAnswer}
                            </div>
                        </div>
                    </div>

                    {q.explanation ? (
                        <div className="mt-3 rounded-md bg-muted/20 border border-border/50 p-2">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                                Explanation
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                                {q.explanation}
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

