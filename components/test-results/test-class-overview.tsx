"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTestClassOverview, type TestClassOverviewResponse } from "@/lib/api/tests";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, Award, TrendingUp } from "lucide-react";
import type React from "react";

function getPercentilePillClass(percentile: number) {
    if (percentile >= 90) return "bg-success/20 text-success border-success/30";
    if (percentile >= 70) return "bg-warning/20 text-warning border-warning/30";
    return "bg-destructive/20 text-destructive border-destructive/30";
}

function formatMark(value: number | null) {
    if (value === null || value === undefined) return "-";
    // keep at most 1 decimal; most marks in this app are integers
    const rounded = Math.round(value);
    if (Math.abs(value - rounded) < 1e-9) return String(rounded);
    return value.toFixed(1);
}

export default function TestClassOverview({
    testId,
    onViewAnalysis,
}: {
    testId: string;
    onViewAnalysis: (attemptId: string) => void;
}) {
    const { data, isLoading } = useQuery({
        queryKey: ["test-class-overview", testId],
        queryFn: () => fetchTestClassOverview(testId),
        enabled: !!testId,
    });

    const res = data as TestClassOverviewResponse | undefined;
    const students = res?.students ?? [];

    const examType = res?.batch.examType;
    const isJEE = examType === "JEE";

    const maxPhysics = res?.test.totalMarksPhysics ?? 0;
    const maxChemistry = res?.test.totalMarksChemistry ?? 0;
    const maxMathematics = res?.test.totalMarksMathematics ?? 0;
    const maxZoology = res?.test.totalMarksZoology ?? 0;
    const maxBotany = res?.test.totalMarksBotany ?? 0;

    const totalMarks = res?.test.totalMarks ?? 0;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <StatCard
                    icon={Users}
                    label="Total Students Attempted"
                    value={isLoading ? "-" : String(res?.stats.totalStudentsAttempted ?? 0)}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Class Average Percentile"
                    value={isLoading || res?.stats.classAveragePercentile == null ? "-" : `${res.stats.classAveragePercentile.toFixed(1)}%`}
                />
                <StatCard
                    icon={Award}
                    label="Highest Percentile"
                    value={isLoading || res?.stats.highestPercentile == null ? "-" : `${res.stats.highestPercentile.toFixed(1)}%`}
                />
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card card-shadow">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="w-[60px] px-3 py-3 text-left font-semibold">Rank</th>
                            <th className="px-4 py-3 text-left font-semibold">Student</th>
                            <th className="px-4 py-3 text-center font-semibold w-[110px]">Roll No</th>

                            <th className="px-4 py-3 text-center font-semibold">
                                Physics <span className="text-xs text-muted-foreground font-normal">({maxPhysics})</span>
                            </th>
                            <th className="px-4 py-3 text-center font-semibold">
                                Chemistry{" "}
                                <span className="text-xs text-muted-foreground font-normal">({maxChemistry})</span>
                            </th>
                            {isJEE ? (
                                <th className="px-4 py-3 text-center font-semibold">
                                    Mathematics{" "}
                                    <span className="text-xs text-muted-foreground font-normal">({maxMathematics})</span>
                                </th>
                            ) : (
                                <>
                                    <th className="px-4 py-3 text-center font-semibold">
                                        Zoology <span className="text-xs text-muted-foreground font-normal">({maxZoology})</span>
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold">
                                        Botany <span className="text-xs text-muted-foreground font-normal">({maxBotany})</span>
                                    </th>
                                </>
                            )}

                            <th className="px-4 py-3 text-center font-semibold">
                                Total <span className="text-xs text-muted-foreground font-normal">({totalMarks})</span>
                            </th>
                            <th className="px-4 py-3 text-center font-semibold">Percentile</th>
                            <th className="px-4 py-3 text-center font-semibold">Improvement</th>
                            <th className="px-4 py-3 text-center font-semibold w-[160px]">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={isJEE ? 10 : 11} className="px-4 py-10 text-center text-muted-foreground">
                                    Loading results...
                                </td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan={isJEE ? 10 : 11} className="px-4 py-10 text-center text-muted-foreground">
                                    No students found.
                                </td>
                            </tr>
                        ) : (
                            students.map((s) => {
                                const pending = s.pending || s.attemptId == null || s.totalScore == null || s.percentile == null;
                                const percentile = s.percentile ?? 0;
                                const improvement = s.improvementPoints;

                                return (
                                    <tr
                                        key={s.studentId}
                                        className={cn(
                                            "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                                            pending && "opacity-60"
                                        )}
                                    >
                                        <td className="px-3 py-3 text-center font-mono">
                                            {pending ? (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            ) : (
                                                <span className="text-xs font-semibold text-foreground">{s.rank}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                    {s.avatarInitial || "?"}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium text-foreground">{s.name}</div>
                                                    {pending ? (
                                                        <div className="text-xs text-muted-foreground mt-0.5">Pending</div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-sm">{s.rollNo}</td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="font-mono">{pending ? "-" : formatMark(s.physicsMarks)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="font-mono">{pending ? "-" : formatMark(s.chemistryMarks)}</span>
                                        </td>
                                        {isJEE ? (
                                            <td className="px-4 py-3 text-center">
                                                <span className="font-mono">{pending ? "-" : formatMark(s.mathematicsMarks)}</span>
                                            </td>
                                        ) : (
                                            <>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="font-mono">{pending ? "-" : formatMark(s.zoologyMarks)}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="font-mono">{pending ? "-" : formatMark(s.botanyMarks)}</span>
                                                </td>
                                            </>
                                        )}

                                        <td className="px-4 py-3 text-center font-mono">
                                            {pending ? (
                                                <span className="text-muted-foreground">-</span>
                                            ) : (
                                                <>
                                                    {formatMark(s.totalScore)} <span className="text-muted-foreground font-normal">/ {totalMarks}</span>
                                                </>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {pending ? (
                                                <span className="text-muted-foreground text-xs">Pending</span>
                                            ) : (
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono",
                                                        getPercentilePillClass(percentile)
                                                    )}
                                                >
                                                    {percentile.toFixed(1)}%
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-sm">
                                            {pending || improvement == null ? (
                                                <span className="text-muted-foreground">-</span>
                                            ) : (
                                                <span className={cn(improvement >= 0 ? "text-success" : "text-destructive", "font-semibold")}>
                                                    {improvement >= 0 ? "+" : ""}
                                                    {Math.round(improvement)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={pending || !s.attemptId}
                                                onClick={() => {
                                                    if (s.attemptId) onViewAnalysis(s.attemptId);
                                                }}
                                            >
                                                View Analysis
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-lg border border-border bg-card p-4 card-shadow">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <div className="text-xs font-medium text-muted-foreground">{label}</div>
            </div>
            <div className="mt-2 text-sm font-bold font-mono text-foreground">{value}</div>
        </div>
    );
}

