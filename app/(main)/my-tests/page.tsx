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
    if (percentile >= 90) return "bg-success/15 text-success border-success/30";
    if (percentile >= 70) return "bg-warning/15 text-warning border-warning/30";
    return "bg-destructive/15 text-destructive border-destructive/30";
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
        <div className="space-y-5 rounded-xl bg-muted/20 p-2 sm:p-3">
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
            <div className="overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm">
                <div className="grid grid-cols-1 divide-y divide-border/70 md:grid-cols-3 md:divide-x md:divide-y-0">
                    <StatBlock
                        icon={Trophy}
                        label="Total tests taken"
                        value={totalTestsTaken.toString()}
                        iconClassName="bg-emerald-50 text-emerald-600"
                    />
                    <StatBlock
                        icon={Clock3}
                        label="Average percentile"
                        value={averagePercentile === null ? "-" : `${averagePercentile.toFixed(1)}%`}
                        iconClassName="bg-blue-50 text-blue-600"
                    />
                    <StatBlock
                        icon={FileText}
                        label="Best percentile"
                        value={bestPercentile === null ? "-" : `${bestPercentile.toFixed(1)}%`}
                        iconClassName="bg-amber-50 text-amber-600"
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
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <Card key={idx} className="overflow-hidden rounded-lg border border-border/60 bg-white shadow-sm p-1 h-fit">
                            <CardHeader className="pb-2">
                                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                            </CardHeader>
                            <CardContent className="space-y-2.5">
                                <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
                                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                                <div className="h-7 w-full animate-pulse rounded-md bg-muted" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {tests.map(({ test, attempt }) => {
                        const hasAttempt = attempt && attempt.totalScore !== null;
                        const percentile = hasAttempt ? getAttemptPercentile(attempt, test.totalMarks) : null;
                        const disabled = !hasAttempt;
                        const subjectCount = isJee ? 3 : 4;
                        const halfSubjectMarks = test.totalMarks > 0 ? (test.totalMarks / subjectCount) / 2 : 0;

                        const examPillClass =
                            batch?.examType === "JEE"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-orange-50 text-orange-700 border-orange-200";

                        return (
                            <Card
                                key={test.id}
                                className={cn(
                                    "overflow-hidden rounded-lg border border-border/60 border-l-[3px] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md p-2.5 min-h-full",
                                    hasAttempt ? "border-l-success" : "border-l-muted-foreground/40",
                                )}
                            >
                                <CardHeader className="space-y-2 p-3 pb-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            {hasAttempt ? (
                                                <Link
                                                    href={`/my-tests/${attempt!.id}/analysis`}
                                                    className="block min-w-0 truncate text-sm leading-tight font-semibold text-foreground transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                                                >
                                                    {test.name}
                                                </Link>
                                            ) : (
                                                <CardTitle className="truncate text-sm leading-tight">{test.name}</CardTitle>
                                            )}
                                        </div>
                                        {batch && (
                                            <Badge className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", examPillClass)}>
                                                {batch.examType}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 overflow-hidden text-[11px] text-muted-foreground">
                                        {batch && <span className="truncate">{batch.name}</span>}
                                        <MetaPill icon={Clock3} label={`${test.duration} min`} />
                                        <MetaPill icon={FileText} label={`${test.totalMarks} marks`} />
                                    </div>
                                </CardHeader>

                                <CardContent className="flex min-h-0 flex-col gap-2.5 px-3 pb-3 pt-0">
                                    {!disabled ? (
                                        <>
                                            <div className="border-t border-border/70 pt-2">
                                                <div className="flex items-center gap-1 overflow-x-auto">
                                                    <MarkPill label="Phy" value={attempt?.physicsMarks ?? 0} halfSubjectMarks={halfSubjectMarks} />
                                                    <MarkPill label="Chem" value={attempt?.chemistryMarks ?? 0} halfSubjectMarks={halfSubjectMarks} />
                                                    {isJee ? (
                                                        <MarkPill
                                                            label="Math"
                                                            value={attempt?.mathematicsMarks ?? 0}
                                                            halfSubjectMarks={halfSubjectMarks}
                                                        />
                                                    ) : (
                                                        <>
                                                            <MarkPill label="Zoo" value={attempt?.zoologyMarks ?? 0} halfSubjectMarks={halfSubjectMarks} />
                                                            <MarkPill label="Bot" value={attempt?.botanyMarks ?? 0} halfSubjectMarks={halfSubjectMarks} />
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-mono text-lg leading-none font-bold text-foreground">
                                                    {formatMaybeScore(attempt?.totalScore)}{" "}
                                                    <span className="text-sm text-muted-foreground">/ {test.totalMarks}</span>
                                                </span>
                                                {typeof percentile === "number" && (
                                                    <span
                                                        className={cn(
                                                            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold font-mono",
                                                            getPercentilePillClass(percentile),
                                                        )}
                                                    >
                                                        {percentile.toFixed(1)}%
                                                    </span>
                                                )}
                                            </div>

                                            <Button asChild className="mt-0.5 h-8 w-full rounded-md bg-success text-xs text-success-foreground hover:bg-success/90">
                                                <Link href={`/my-tests/${attempt.id}/analysis`}>
                                                    View Analysis →
                                                </Link>
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="my-auto rounded-md border border-dashed border-border/70 bg-muted/20 px-2.5 py-3 text-center">
                                            <p className="text-xs text-muted-foreground italic">Not Attempted</p>
                                        </div>
                                    )}
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
    iconClassName,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    iconClassName?: string;
}) {
    return (
        <div className="flex items-center gap-2.5 px-3 py-2">
            <div className={cn("flex h-6 w-6 items-center justify-center rounded-md", iconClassName)}>
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="text-base leading-none font-bold font-mono text-foreground">{value}</p>
            </div>
        </div>
    );
}

function MetaPill({
    icon: Icon,
    label,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}) {
    return (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-muted/25 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            <Icon className="h-2.5 w-2.5" />
            <span>{label}</span>
        </span>
    );
}

function MarkPill({
    label,
    value,
    halfSubjectMarks,
}: {
    label: string;
    value: number;
    halfSubjectMarks: number;
}) {
    const valueClass = value > halfSubjectMarks ? "text-success" : "text-destructive";

    return (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-muted/20 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <span>{label}</span>
            <span className={cn("font-mono font-semibold", valueClass)}>{value.toFixed(1)}</span>
        </span>
    );
}

