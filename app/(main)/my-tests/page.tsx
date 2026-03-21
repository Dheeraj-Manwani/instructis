"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useBreadcrumb } from "@/store/BreadcrumbContext";
import { fetchMyTests, type MyTestsResponse } from "@/lib/api/tests";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock3, FileText, Trophy } from "lucide-react";

function getPercentilePillClass(percentile: number) {
    if (percentile >= 90) return "bg-success/20 text-success border-success/30";
    if (percentile >= 70) return "bg-warning/20 text-warning border-warning/30";
    return "bg-destructive/20 text-destructive border-destructive/30";
}

function formatMaybeScore(score: number | null | undefined) {
    if (score === null || score === undefined) return "-";
    const rounded = Math.round(score);
    if (Math.abs(score - rounded) < 1e-9) return `${rounded}`;
    return `${score.toFixed(1)}`;
}

export default function MyTestsPage() {
    const { setBreadcrumb } = useBreadcrumb();

    useEffect(() => {
        setBreadcrumb([{ label: "My Tests" }]);
    }, [setBreadcrumb]);

    const { data, isLoading } = useQuery({
        queryKey: ["my-tests"],
        queryFn: fetchMyTests,
    });

    const batch = (data as MyTestsResponse | undefined)?.batch ?? null;
    const tests = (data as MyTestsResponse | undefined)?.tests ?? [];

    const getAttemptPercentile = (attempt: MyTestsResponse["tests"][number]["attempt"], totalMarks: number) => {
        if (!attempt || attempt.totalScore === null || attempt.totalScore === undefined) return null;
        if (typeof attempt.percentile === "number") return attempt.percentile;
        if (totalMarks <= 0) return null;
        return (attempt.totalScore / totalMarks) * 100;
    };

    const testAttemptsTaken = tests.filter((t) => t.attempt?.totalScore !== null);

    const totalTestsTaken = testAttemptsTaken.length;
    const averagePercentile =
        totalTestsTaken > 0
            ? testAttemptsTaken.reduce(
                (sum, t) => sum + (getAttemptPercentile(t.attempt, t.test.totalMarks) ?? 0),
                0,
            ) / totalTestsTaken
            : null;
    const percentileValues = testAttemptsTaken
        .map((t) => getAttemptPercentile(t.attempt, t.test.totalMarks))
        .filter((p): p is number => typeof p === "number");
    const bestPercentile =
        percentileValues.length > 0
            ? Math.max(...percentileValues)
            : null;

    const isJee = batch?.examType === "JEE";

    return (
        <div className="space-y-6">
            {/* Title */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Tests</h1>
                    <p className="text-muted-foreground text-sm">
                        View your test results and question-wise analysis.
                    </p>
                </div>
            </div>

            {/* Summary stats */}
            <div className="rounded-lg border border-border bg-card p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StatBlock icon={Trophy} label="Total tests taken" value={totalTestsTaken.toString()} />
                    <StatBlock
                        icon={Clock3}
                        label="Average percentile"
                        value={averagePercentile === null ? "-" : `${averagePercentile.toFixed(1)}%`}
                    />
                    <StatBlock
                        icon={FileText}
                        label="Best percentile"
                        value={bestPercentile === null ? "-" : `${bestPercentile.toFixed(1)}%`}
                    />
                </div>
            </div>

            {/* Empty state */}
            {!isLoading && tests.length === 0 && (
                <div className="py-14">
                    <div className="mx-auto flex max-w-md flex-col items-center text-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-base font-semibold">No tests yet.</p>
                        <p className="text-sm text-muted-foreground">
                            Your faculty will assign tests to your batch.
                        </p>
                    </div>
                </div>
            )}

            {/* List */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <Card key={idx} className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                                <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                    {tests.map(({ test, attempt }) => {
                        const hasAttempt = attempt && attempt.totalScore !== null;
                        const percentile = hasAttempt ? getAttemptPercentile(attempt, test.totalMarks) : null;
                        const disabled = !hasAttempt;

                        const examPillClass = batch?.examType === "JEE" ? "bg-jee text-white" : "bg-neet text-white";

                        return (
                            <Card
                                key={test.id}
                                className={cn(
                                    "overflow-hidden border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md",
                                    disabled && "opacity-70",
                                )}
                            >
                                <CardHeader className="space-y-1.5 p-4 pb-2">
                                    <div className="min-w-0 space-y-1.5">
                                        {hasAttempt ? (
                                            <Link
                                                href={`/my-tests/${attempt!.id}/analysis`}
                                                className="block min-w-0 truncate text-base leading-snug font-semibold hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-sm"
                                            >
                                                {test.name}
                                            </Link>
                                        ) : (
                                            <CardTitle className="truncate text-base">{test.name}</CardTitle>
                                        )}

                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {batch && (
                                                <Badge variant="outline" className="max-w-full truncate text-[11px] font-medium">
                                                    {batch.name}
                                                </Badge>
                                            )}
                                            {batch && (
                                                <Badge className={cn("rounded-full text-[11px] font-semibold", examPillClass)}>
                                                    {batch.examType}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <Clock3 className="h-3 w-3" />
                                                {test.duration} min
                                            </span>
                                            <span className="mx-2">·</span>
                                            <span>{test.totalMarks} marks</span>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex min-h-0 flex-col gap-3 p-4 pt-2">
                                    {!disabled && (
                                        <>
                                            <div className="flex flex-wrap gap-1.5">
                                                <MarkPill label="Physics" value={attempt?.physicsMarks ?? 0} />
                                                <MarkPill label="Chemistry" value={attempt?.chemistryMarks ?? 0} />
                                                {isJee ? (
                                                    <MarkPill label="Mathematics" value={attempt?.mathematicsMarks ?? 0} />
                                                ) : (
                                                    <>
                                                        <MarkPill label="Zoology" value={attempt?.zoologyMarks ?? 0} />
                                                        <MarkPill label="Botany" value={attempt?.botanyMarks ?? 0} />
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-mono text-xl leading-none font-bold text-foreground">
                                                    {formatMaybeScore(attempt?.totalScore)} / {test.totalMarks}
                                                </span>
                                                {typeof percentile === "number" && (
                                                    <span
                                                        className={cn(
                                                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono",
                                                            getPercentilePillClass(percentile),
                                                        )}
                                                    >
                                                        {percentile.toFixed(1)}%
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {disabled && (
                                        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-1.5">
                                            <p className="text-xs font-medium text-muted-foreground">Not Attempted</p>
                                        </div>
                                    )}

                                    <div className="mt-auto flex items-center gap-2">
                                        {disabled ? (
                                            <Button variant="outline" size="sm" disabled className="w-full sm:w-fit">
                                                View Analysis
                                            </Button>
                                        ) : (
                                            <Button asChild size="sm" className="w-full sm:w-fit">
                                                <Link href={`/my-tests/${attempt.id}/analysis`}>
                                                    View Analysis
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function StatBlock({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/20 px-3 py-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-bold font-mono text-foreground">{value}</p>
            </div>
        </div>
    );
}

function MarkPill({ label, value }: { label: string; value: number }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <span className="text-foreground">{label}:</span>
            <span className="font-mono">{value.toFixed(1)}</span>
        </span>
    );
}

