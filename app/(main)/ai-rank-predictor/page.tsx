"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api/axios";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type PredictorData = {
    examType: "JEE" | "NEET";
    availableExamTypes: Array<"JEE" | "NEET">;
    latestTotalMarks: number | null;
    latestImprovement: number | null;
    currentPercentile: number | null;
    currentPredictedRank: number | null;
    performanceTrend: Array<{ testDate: string; marks: number; percentile: number | null }>;
    weakAreas: Array<{
        id: string;
        topicId: string;
        topicName: string;
        subject: string;
        drawbackPoints: number;
        priority: string;
        questionsToPractice: number;
        recommendation: {
            studyFocus: string;
            practiceQuestionCount: number;
            resourceTypeSuggestion: string;
        } | null;
    }>;
    ai: {
        predictedRankRange: { JEE: string | null; NEET: string | null };
        targetPercentileNeeded: { top1000: number; top3000: number };
        percentileBandRankEstimate: { p95To99: string; p90To95: string };
        improvementPointsForNextBand: string[];
        overallImprovementTip: string;
        recommendationCards: {
            practice: string;
            videoOrRevision: string;
            formulaRevision: string;
        };
        trendStatus: "improving" | "stagnant" | "declining";
    } | null;
    examPredictions: {
        JEE: { latestPercentile: number | null; predictedRank: number | null };
        NEET: { latestPercentile: number | null; predictedRank: number | null };
    };
    lastUpdatedAt: string | null;
};

function percentileColor(percentile: number | null) {
    if (percentile == null) return "text-muted-foreground";
    if (percentile < 70) return "text-destructive";
    if (percentile < 85) return "text-warning";
    if (percentile < 95) return "text-amber-600";
    return "text-green-700";
}

export default function StudentAIRankPredictorPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeExamType, setActiveExamType] = useState<"JEE" | "NEET" | null>(null);
    const [showLastSavedNote, setShowLastSavedNote] = useState(false);

    const predictorQuery = useQuery({
        queryKey: ["student-rank-predictor"],
        queryFn: async () => {
            const res = (await api.get("/student-rank-predictor")) as { data: PredictorData };
            return res.data;
        },
    });

    const refreshMutation = useMutation({
        mutationFn: async () => {
            const res = (await api.post("/student-rank-predictor")) as { data: PredictorData };
            return res.data;
        },
        onSuccess: (data) => {
            setShowLastSavedNote(false);
            queryClient.setQueryData(["student-rank-predictor"], data);
            toast.success("Prediction refreshed");
        },
        onError: () => {
            setShowLastSavedNote(true);
            toast.error("Gemini refresh failed. Showing last saved prediction.");
        },
    });

    const data = predictorQuery.data;
    const resolvedExamType = activeExamType ?? data?.examType ?? null;
    const examPrediction = resolvedExamType ? data?.examPredictions[resolvedExamType] : null;
    const currentPercentile = examPrediction?.latestPercentile ?? data?.currentPercentile ?? null;
    const currentRank = examPrediction?.predictedRank ?? data?.currentPredictedRank ?? null;
    const markerLeft = Math.max(0, Math.min(currentPercentile ?? 0, 100));

    const hasSavedPrediction = !!data?.ai;
    const hasHistory = (data?.performanceTrend?.length ?? 0) > 0;
    const showEmptyState =
        !predictorQuery.isLoading &&
        !hasSavedPrediction &&
        !refreshMutation.isPending &&
        !hasHistory;

    const trendIcon = useMemo(() => {
        if (!data?.ai) return null;
        if (data.ai.trendStatus === "declining") return <TrendingDown className="h-4 w-4 text-destructive" />;
        return <TrendingUp className="h-4 w-4 text-success" />;
    }, [data?.ai]);

    if (predictorQuery.isLoading || refreshMutation.isPending) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Gemini is analyzing your performance...</p>
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-56 w-full" />
                <Skeleton className="h-52 w-full" />
            </div>
        );
    }

    if (showEmptyState) {
        return (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
                <h2 className="text-xl font-bold text-foreground">AI Rank Predictor</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Complete at least one test first, then refresh prediction to see your AI-powered rank analysis.
                </p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Unable to load predictor data.
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
                <div>
                    <h1 className="text-xl font-bold text-foreground">AI Rank Predictor</h1>
                    <p className="text-sm text-muted-foreground">Powered by Gemini AI.</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {data.availableExamTypes.length > 1 && (
                        <div className="inline-flex rounded-md border border-border bg-card p-1">
                            {data.availableExamTypes.map((exam) => (
                                <button
                                    key={exam}
                                    onClick={() => setActiveExamType(exam)}
                                    className={cn(
                                        "rounded px-3 py-1 text-xs font-semibold transition-colors",
                                        (resolvedExamType ?? data.examType) === exam
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {exam}
                                </button>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={() => refreshMutation.mutate()}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <RefreshCw className={cn("h-4 w-4", refreshMutation.isPending && "animate-spin")} />
                        Refresh Prediction
                    </button>
                </div>
            </div>

            {showLastSavedNote && (
                <p className="text-xs text-warning">Showing last saved prediction.</p>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <StatCard title="Total Marks (Latest)" value={data.latestTotalMarks != null ? data.latestTotalMarks.toFixed(1) : "--"} />
                <StatCard
                    title="Current Percentile"
                    value={currentPercentile != null ? `${currentPercentile.toFixed(2)}%` : "--"}
                    valueClassName={percentileColor(currentPercentile)}
                />
                <StatCard
                    title="Current Predicted Rank"
                    value={currentRank != null ? `#${currentRank.toLocaleString()}` : "--"}
                />
                <StatCard
                    title="Improvement vs Last Test"
                    value={
                        data.latestImprovement != null
                            ? `${data.latestImprovement >= 0 ? "↑" : "↓"} ${Math.abs(data.latestImprovement).toFixed(1)}`
                            : "--"
                    }
                    valueClassName={data.latestImprovement != null && data.latestImprovement >= 0 ? "text-success" : "text-destructive"}
                />
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground">Percentile Band Visualization</h3>
                <div className="relative mt-4">
                    <div className="flex h-5 w-full overflow-hidden rounded-full">
                        <div className="w-[25%] bg-destructive" />
                        <div className="w-[25%] bg-warning" />
                        <div className="w-[25%] bg-amber-500" />
                        <div className="w-[25%] bg-green-700" />
                    </div>
                    <div className="absolute -top-8" style={{ left: `${markerLeft}%`, transform: "translateX(-50%)" }}>
                        <span className="rounded bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">You are here</span>
                    </div>
                    <div className="mt-2 grid grid-cols-4 text-center text-[10px] text-muted-foreground">
                        <span>Below 70%</span>
                        <span>70-85%</span>
                        <span>85-95%</span>
                        <span>95-100%</span>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-md border border-border p-3">
                        <p className="text-xs text-muted-foreground">Target 95-99 percentile</p>
                        <p className="text-sm font-bold text-foreground">{data.ai?.percentileBandRankEstimate.p95To99 ?? "N/A"}</p>
                    </div>
                    <div className="rounded-md border border-border p-3">
                        <p className="text-xs text-muted-foreground">Target 90-95 percentile</p>
                        <p className="text-sm font-bold text-foreground">{data.ai?.percentileBandRankEstimate.p90To95 ?? "N/A"}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <div className="border-b border-border px-4 py-3">
                        <h3 className="text-sm font-bold text-foreground">Drawback Points & Recommended Practice</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/40">
                                <tr>
                                    <th className="px-4 py-2 text-left">Weak Area</th>
                                    <th className="px-4 py-2 text-left">Subject</th>
                                    <th className="px-4 py-2 text-left">Drawback Points</th>
                                    <th className="px-4 py-2 text-left">Questions to Practice</th>
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.weakAreas.map((item) => (
                                    <tr key={item.id} className="border-t border-border">
                                        <td className="px-4 py-3 font-medium">{item.topicName}</td>
                                        <td className="px-4 py-3">
                                            <span className="rounded bg-muted px-2 py-0.5 text-xs">{item.subject}</span>
                                        </td>
                                        <td className="px-4 py-3 text-destructive">-{item.drawbackPoints.toFixed(1)}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                className="inline-flex items-center gap-1 text-primary hover:underline"
                                                onClick={() => router.push(`/practice?topicId=${item.topicId}`)}
                                            >
                                                {item.questionsToPractice} <ArrowRight className="h-3 w-3" />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => router.push(`/practice?topicId=${item.topicId}`)}
                                                className="rounded bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                                            >
                                                Practice Now
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                        <div className="mb-2 inline-flex items-center gap-2 text-primary">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-semibold">AI Improvement Tip</span>
                            {trendIcon}
                        </div>
                        <p className="text-sm text-foreground">
                            {data.ai?.overallImprovementTip ?? "Refresh prediction to get personalized suggestions."}
                        </p>
                    </div>
                    <RecommendationCard title="Practice Recommendation" text={data.ai?.recommendationCards.practice ?? "N/A"} />
                    <RecommendationCard title="Video / Revision Recommendation" text={data.ai?.recommendationCards.videoOrRevision ?? "N/A"} />
                    <RecommendationCard title="Formula Revision Recommendation" text={data.ai?.recommendationCards.formulaRevision ?? "N/A"} />
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-bold text-foreground">Performance Trend Chart</h3>
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={data.performanceTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="testDate" tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line yAxisId="left" type="monotone" dataKey="marks" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                        <Line yAxisId="right" type="monotone" dataKey="percentile" stroke="hsl(25 95% 53%)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function StatCard({ title, value, valueClassName }: { title: string; value: string; valueClassName?: string }) {
    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className={cn("mt-1 text-2xl font-bold font-mono text-foreground", valueClassName)}>{value}</p>
        </div>
    );
}

function RecommendationCard({ title, text }: { title: string; text: string }) {
    return (
        <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
        </div>
    );
}
