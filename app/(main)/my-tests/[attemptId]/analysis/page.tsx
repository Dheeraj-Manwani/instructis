"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchTestAttemptAnalysis } from "@/lib/api/tests";
import { useBreadcrumb } from "@/store/BreadcrumbContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

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
    const correct = questions.filter((q) => q.isCorrect);
    const incorrect = questions.filter((q) => !q.isCorrect);

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                        <Link href="/my-tests">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Question-wise Analysis</h1>
                        <p className="text-sm text-muted-foreground">
                            Test: <span className="font-medium text-foreground">{data?.test.name ?? "-"}</span> ·
                            {" "}
                            Student: <span className="font-medium text-foreground">{data?.student.name ?? "-"}</span>
                            {data?.student.rollNo ? (
                                <>
                                    {" "}
                                    (Roll No: <span className="font-mono">{data.student.rollNo}</span>)
                                </>
                            ) : null}
                        </p>
                    </div>
                </div>

                {data?.attempt?.percentile !== null && typeof data?.attempt?.percentile === "number" && (
                    <div className="rounded-full bg-muted px-3 py-1.5 border border-border text-sm font-semibold font-mono">
                        Percentile: {data.attempt.percentile.toFixed(1)}%
                    </div>
                )}
            </div>

            {isLoading ? (
                <Card>
                    <CardContent className="py-10">
                        <p className="text-center text-sm text-muted-foreground">Loading analysis...</p>
                    </CardContent>
                </Card>
            ) : questions.length === 0 ? (
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
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card className="border border-success/30">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                Correct Questions <Badge variant="secondary">{correct.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {correct.map((q, idx) => (
                                <QuestionRow key={q.questionId} idx={idx + 1} q={q} variant="correct" />
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border border-destructive/30">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-destructive" />
                                Incorrect Questions <Badge variant="secondary">{incorrect.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
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
        correctAnswer: string;
        isCorrect: boolean;
        marksAwarded: number | null;
    };
    variant: "correct" | "incorrect";
}) {
    return (
        <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold",
                        variant === "correct"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive",
                    )}
                >
                    {idx}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant="secondary">{q.subject}</Badge>
                        {q.topicName ? <Badge variant="outline">{q.topicName}</Badge> : null}
                        {typeof q.marksAwarded === "number" ? (
                            <span className="text-xs text-muted-foreground font-mono">+{q.marksAwarded}</span>
                        ) : null}
                    </div>
                    <p className="text-sm font-medium text-foreground">{q.questionText}</p>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="rounded-md bg-muted/40 p-2 text-xs">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                                Your Answer
                            </p>
                            <p className="font-mono font-semibold text-foreground wrap-break-word">{q.yourAnswer}</p>
                        </div>
                        <div className="rounded-md bg-muted/40 p-2 text-xs">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                                Correct Answer
                            </p>
                            <p className="font-mono font-semibold text-foreground wrap-break-word">{q.correctAnswer}</p>
                        </div>
                    </div>

                    {q.explanation ? (
                        <div className="mt-2 rounded-md bg-muted/20 border border-border/50 p-2">
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

