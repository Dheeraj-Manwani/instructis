"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchTestAttemptAnalysis } from "@/lib/api/tests";
import { useBreadcrumb } from "@/store/BreadcrumbContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, Target, Trophy, Download } from "lucide-react";
import { toast } from "react-hot-toast";

export default function TestAttemptAnalysisPage() {
    const { setBreadcrumb } = useBreadcrumb();
    const params = useParams();
    const attemptId = (params?.attemptId as string | undefined) ?? "";

    useEffect(() => {
        setBreadcrumb([{ label: "My Tests", href: "/my-tests" }, { label: "Analysis" }]);
    }, [setBreadcrumb]);

    const { data, isLoading } = useQuery({
        queryKey: ["test-attempt-analysis", attemptId],
        queryFn: () => fetchTestAttemptAnalysis(attemptId),
        enabled: attemptId.length > 0,
    });

    const questions = data?.questions ?? [];
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const correct = questions.filter((q) => q.isCorrect);
    const incorrect = questions.filter((q) => !q.isCorrect);
    const score = data?.attempt.totalScore ?? 0;
    const totalMarks = data?.test.totalMarks ?? 0;
    const accuracy = questions.length > 0 ? (correct.length / questions.length) * 100 : 0;

    const downloadReport = async () => {
        if (!data) return;

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
            link.download = `${data.student.name}_${data.test.name}_report.pdf`;
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

    if (isLoading) {
        return <AnalysisPageSkeleton />;
    }

    return (
        <div className="space-y-5">
            <Card className="border-border/70 shadow-sm py-0">
                <CardContent className="space-y-4 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                                <Link href="/my-tests">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Student Question Analysis</h1>
                                <p className="text-sm text-muted-foreground">
                                    Test: <span className="font-medium text-foreground">{data?.test.name ?? "-"}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={() => void downloadReport()}
                                disabled={!data || isGeneratingReport}
                            >
                                <Download className="h-4 w-4" />
                                {isGeneratingReport ? "Generating PDF..." : "Generate Report"}
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/30 p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-base font-semibold text-foreground">{data?.student.name ?? "-"}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    {data?.student.rollNo ? (
                                        <p className="text-xs text-muted-foreground">
                                            Roll No: <span className="font-mono">{data.student.rollNo}</span>
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                            <div className="w-full overflow-x-auto sm:w-auto">
                                <div className="grid min-w-[560px] grid-cols-5 gap-0 rounded-lg border border-border/70 bg-background text-xs sm:text-sm">
                                    <MiniStat
                                        icon={<Trophy className="h-3.5 w-3.5" />}
                                        label="Total Score"
                                        value={`${score} / ${totalMarks}`}
                                        className="rounded-none border-0 border-r border-border/70"
                                    />
                                    <MiniStat
                                        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                                        label="Correct"
                                        value={String(correct.length)}
                                        valueClassName="text-emerald-700"
                                        className="rounded-none border-0 border-r border-border/70"
                                    />
                                    <MiniStat
                                        icon={<XCircle className="h-3.5 w-3.5" />}
                                        label="Incorrect"
                                        value={String(incorrect.length)}
                                        valueClassName="text-red-700"
                                        className="rounded-none border-0 border-r border-border/70"
                                    />
                                    <MiniStat
                                        icon={<Target className="h-3.5 w-3.5" />}
                                        label="Accuracy"
                                        value={`${accuracy.toFixed(1)}%`}
                                        className="rounded-none border-0 border-r border-border/70"
                                    />
                                    <MiniStat
                                        icon={<Target className="h-3.5 w-3.5" />}
                                        label="Percentile"
                                        value={
                                            typeof data?.attempt?.percentile === "number"
                                                ? `${data.attempt.percentile.toFixed(1)}%`
                                                : "-"
                                        }
                                        valueClassName="text-emerald-700"
                                        className="rounded-none border-0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {questions.length === 0 ? (
                <Card>
                    <CardContent className="py-10">
                        <div className="mx-auto max-w-xl text-center space-y-2">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                                <Lightbulb className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-base font-semibold">No question-wise data yet</p>
                            <p className="text-sm text-muted-foreground">
                                Your attempt has no saved per-question responses to analyze.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <Card className="overflow-hidden border border-emerald-200 py-0">
                        <CardHeader className="bg-emerald-50 py-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-800">
                                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                                Correct Questions
                                <Badge className="bg-emerald-600 hover:bg-emerald-600">{correct.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 mb-3.5">
                            {correct.map((q, idx) => (
                                <QuestionRow key={q.questionId} idx={idx + 1} q={q} variant="correct" />
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border border-red-200 pt-0 mt-0">
                        <CardHeader className="bg-red-50 py-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-800">
                                <XCircle className="h-4 w-4 text-red-700" />
                                Incorrect Questions
                                <Badge className="bg-red-600 hover:bg-red-600">{incorrect.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 mb-3.5">
                            {incorrect.map((q, idx) => (
                                <QuestionRow key={q.questionId} idx={idx + 1} q={q} variant="incorrect" />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

function QuestionRow({
    idx,
    q,
    variant,
}: {
    idx: number;
    q: {
        questionId: string;
        subject: string;
        topicName: string | null;
        questionText: string;
        explanation: string | null;
        yourAnswer: string;
        yourOptionLabel: string | null;
        correctAnswer: string;
        correctOptionLabel: string | null;
        isCorrect: boolean;
        marksAwarded: number | null;
    };
    variant: "correct" | "incorrect";
}) {
    return (
        <div
            className={cn(
                "rounded-lg border bg-card p-3",
                variant === "correct" ? "border-emerald-200" : "border-red-200"
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold",
                        variant === "correct"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700",
                    )}
                >
                    {idx}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant="secondary">{q.subject}</Badge>
                        {q.topicName ? <Badge variant="outline">{q.topicName}</Badge> : null}
                        {typeof q.marksAwarded === "number" ? (
                            <span className="text-xs text-muted-foreground font-mono">{q.marksAwarded > 0 ? "+" : ""}{q.marksAwarded}</span>
                        ) : null}
                    </div>
                    <p className="text-sm font-medium text-foreground">{q.questionText}</p>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="rounded-md border border-border/70 bg-muted/30 p-2 text-xs">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                                Your Answer
                            </p>
                            <p
                                className={cn(
                                    "font-mono font-semibold wrap-break-word",
                                    variant === "correct" ? "text-emerald-700" : "text-red-700"
                                )}
                            >
                                {q.yourOptionLabel ? `${q.yourOptionLabel}) ` : ""}
                                {q.yourAnswer}
                            </p>
                        </div>
                        <div className="rounded-md border border-border/70 bg-muted/30 p-2 text-xs">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                                Correct Answer
                            </p>
                            <p className="font-mono font-semibold text-emerald-700 wrap-break-word">
                                {q.correctOptionLabel ? `${q.correctOptionLabel}) ` : ""}
                                {q.correctAnswer}
                            </p>
                        </div>
                    </div>

                    {q.explanation ? (
                        <div className="mt-2 rounded-md bg-orange-50/70 border border-orange-200 p-2">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                                Explanation
                            </p>
                            <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                                {q.explanation}
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function MiniStat({
    icon,
    label,
    value,
    valueClassName,
    className,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    valueClassName?: string;
    className?: string;
}) {
    return (
        <div className={cn("rounded-md border border-border/70 bg-background px-2.5 py-2", className)}>
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {icon}
                {label}
            </p>
            <p className={cn("mt-1 font-semibold text-foreground", valueClassName)}>{value}</p>
        </div>
    );
}

function AnalysisPageSkeleton() {
    return (
        <div className="space-y-5">
            <Card className="border-border/70 shadow-sm py-0">
                <CardContent className="space-y-4 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-muted/30">
                                <ArrowLeft className="h-4 w-4 text-muted-foreground/70" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-64" />
                                <Skeleton className="h-4 w-56" />
                            </div>
                        </div>
                        <Skeleton className="h-7 w-36 rounded-full" />
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/30 p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-44" />
                                <Skeleton className="h-3.5 w-28" />
                            </div>
                            <div className="w-full overflow-x-auto sm:w-auto">
                                <div className="grid min-w-[430px] grid-cols-4 gap-0 rounded-lg border border-border/70 bg-background p-2">
                                    {Array.from({ length: 4 }).map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "px-2.5 py-2",
                                                idx < 3 ? "border-r border-border/70" : ""
                                            )}
                                        >
                                            <Skeleton className="h-3 w-16" />
                                            <Skeleton className="mt-2 h-4 w-20" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {Array.from({ length: 2 }).map((_, cardIdx) => (
                    <Card key={cardIdx} className="overflow-hidden py-0">
                        <CardHeader className="py-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-5 w-8 rounded-full" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 mb-3.5">
                            {Array.from({ length: 4 }).map((_, rowIdx) => (
                                <div key={rowIdx} className="rounded-lg border bg-card p-3">
                                    <div className="flex items-start gap-3">
                                        <Skeleton className="h-7 w-7 rounded-full" />
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-5 w-16 rounded-full" />
                                                <Skeleton className="h-5 w-20 rounded-full" />
                                            </div>
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-11/12" />
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                <Skeleton className="h-14 w-full rounded-md" />
                                                <Skeleton className="h-14 w-full rounded-md" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

