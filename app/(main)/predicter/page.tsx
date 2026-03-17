"use client";

import { useState } from "react";
import { TrendingUp, Trophy, Medal, FileDown, Share2, ChevronRight, Download, Users, Award, BellRing } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";
import { performanceTrend } from "@/data/dummy";
import { fetchMyBatches, fetchStudentsInBatch, type BatchListItem, type StudentInBatch } from "@/lib/api/batches";
import { api } from "@/lib/api/axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";

const weakAreas = [
    { topic: "Thermodynamics", drawback: 12, questions: 15 },
    { topic: "Electrostatics", drawback: 8, questions: 20 },
    { topic: "Organic Chemistry", drawback: 6, questions: 12 },
    { topic: "Mechanics", drawback: 5, questions: 10 },
    { topic: "Biology - Genetics", drawback: 4, questions: 8 },
];

const tips = [
    { priority: "High", tip: "Thermodynamics", color: "text-destructive" },
    { priority: "High", tip: "Electrostatics", color: "text-destructive" },
    { priority: "Medium", tip: "Organic Chemistry", color: "text-warning" },
];

type AIRankResult = {
    rankRecord: {
        percentile: number;
        predictedRank: number;
        improvementPts: number;
    };
    ai: {
        summary: string;
        reasoning: string;
        nextScoreEstimate: {
            expectedPercentile: number | null;
            expectedTotalScore: number | null;
            confidenceNote: string;
        };
    };
    student: {
        id: string;
        rollNo: string;
        name: string;
        email: string;
    };
    batch: BatchListItem;
    history: Array<{
        testName: string;
        date: string;
        totalScore: number | null;
        percentile: number | null;
    }>;
};

export default function AIRankPredictor() {
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");
    const [aiResult, setAiResult] = useState<AIRankResult | null>(null);

    const { data: batchesData } = useQuery({
        queryKey: ["my-batches"],
        queryFn: () => fetchMyBatches(),
    });

    const { data: studentsData, isLoading: isStudentsLoading } = useQuery({
        queryKey: ["students-in-batch", selectedBatchId],
        queryFn: () => fetchStudentsInBatch(selectedBatchId),
        enabled: !!selectedBatchId,
    });

    const analyzeMutation = useMutation({
        mutationFn: async () => {
            if (!selectedBatchId || !selectedStudentId) {
                throw new Error("Please select both batch and student");
            }
            const res = (await api.post("/ai-rank", {
                batchId: selectedBatchId,
                studentId: selectedStudentId,
            })) as { data: AIRankResult };
            return res.data;
        },
        onSuccess: (data) => {
            setAiResult(data);
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to analyze with AI");
        },
    });

    const notifyMutation = useMutation({
        mutationFn: async () => {
            if (!aiResult) throw new Error("No AI result to share");
            const res = (await api.post("/ai-rank/notify", {
                batchId: aiResult.batch.id,
                studentId: aiResult.student.id,
                aiSummary: aiResult.ai.summary,
            })) as { message?: string };
            return res;
        },
        onSuccess: (res) => {
            toast.success(res?.message || "Shared with parent on WhatsApp");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to share with parent");
        },
    });

    const studentName =
        aiResult?.student.name ||
        studentsData?.find((s) => s.id === selectedStudentId)?.user.name ||
        "Student";

    const currentPercentile = aiResult?.rankRecord.percentile ?? 0;
    const currentRank = aiResult?.rankRecord.predictedRank ?? 0;
    const improvement = aiResult?.rankRecord.improvementPts ?? 0;

    return (
        <div className="space-y-5">
            {/* Top controls */}
            <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-muted-foreground mr-auto">
                    AI Based JEE / NEET Rank Estimate +{" "}
                    <span className="underline font-medium text-foreground">Improvement Plan</span>
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-foreground">Batch</span>
                    <select
                        className="min-w-[200px] rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none"
                        value={selectedBatchId}
                        onChange={(e) => {
                            setSelectedBatchId(e.target.value);
                            setSelectedStudentId("");
                            setAiResult(null);
                        }}
                    >
                        <option value="">Select batch</option>
                        {batchesData?.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name} ({b.examType})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-foreground">Student</span>
                    <select
                        className="min-w-[220px] rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                        value={selectedStudentId}
                        onChange={(e) => {
                            setSelectedStudentId(e.target.value);
                            setAiResult(null);
                        }}
                        disabled={!selectedBatchId || isStudentsLoading}
                    >
                        <option value="">
                            {selectedBatchId
                                ? isStudentsLoading
                                    ? "Loading students..."
                                    : "Select student"
                                : "Select batch first"}
                        </option>
                        {studentsData?.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.user.name} (Roll: {s.rollNo})
                            </option>
                        ))}
                    </select>
                </div>

                <LoadingButton
                    className="ml-auto"
                    size="sm"
                    onClick={() => analyzeMutation.mutate()}
                    loading={analyzeMutation.isPending}
                    disabled={!selectedBatchId || !selectedStudentId}
                >
                    Analyze with AI
                </LoadingButton>
            </div>

            {/* Metrics */}
            <div className="rounded-lg border border-border bg-card card-shadow overflow-hidden">
                <div className="border-b border-border px-5 py-3">
                    <h3 className="text-sm font-bold text-foreground">Current Performance</h3>
                </div>
                <div className="grid grid-cols-2 gap-0 lg:grid-cols-4 divide-x divide-border">
                    <div className="p-4">
                        <p className="text-xs text-muted-foreground">Total Marks</p>
                        <p className="text-2xl font-bold font-mono text-foreground">245 <span className="text-sm font-normal text-muted-foreground">/ 300</span></p>
                    </div>
                    <div className="p-4">
                        <p className="text-xs text-muted-foreground">Predicted Percentile</p>
                        <p className="text-2xl font-bold font-mono text-primary">
                            {currentPercentile ? currentPercentile.toFixed(2) : "--"}%
                        </p>
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-success">
                            <TrendingUp size={10} /> {improvement >= 0 ? "+" : ""}
                            {improvement.toFixed(1)} pts vs last
                        </span>
                    </div>
                    <div className="p-4">
                        <p className="text-xs text-muted-foreground">Predicted Rank</p>
                        <p className="text-2xl font-bold font-mono text-foreground">
                            {currentRank ? currentRank.toLocaleString() : "--"}
                        </p>
                    </div>
                    <div className="p-4">
                        <p className="text-xs text-muted-foreground">Expected Improvement</p>
                        <p className="text-2xl font-bold font-mono text-success">
                            {improvement >= 0 ? "+" : ""}
                            {improvement.toFixed(1)} pts
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
                <div className="space-y-5">
                    {/* Percentile band */}
                    <div className="rounded-lg border border-border bg-card p-5 card-shadow">
                        <h3 className="text-sm font-bold text-foreground mb-4">Percentile Band</h3>
                        <div className="relative mb-8">
                            <div className="flex h-5 w-full rounded-full overflow-hidden">
                                <div className="bg-destructive" style={{ width: "25%" }} />
                                <div className="bg-warning" style={{ width: "25%" }} />
                                <div className="bg-success" style={{ width: "25%" }} />
                                <div className="bg-primary" style={{ width: "25%" }} />
                            </div>
                            <div
                                className="absolute -top-8 flex flex-col items-center transition-all duration-700"
                                style={{ left: `${currentPercentile || 0}%`, transform: "translateX(-50%)" }}
                            >
                                <span className="rounded-md bg-foreground px-2.5 py-1 text-[10px] font-bold text-background whitespace-nowrap">You are here</span>
                                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
                            </div>
                            <div
                                className="absolute top-0 h-5 flex items-center"
                                style={{ left: `${currentPercentile || 0}%`, transform: "translateX(-50%)" }}
                            >
                                <div className="h-7 w-7 rounded-full border-3 border-card bg-primary shadow-lg animate-pulse" />
                            </div>
                            <div className="mt-3 flex text-[10px] font-medium text-muted-foreground">
                                <span className="flex-1 text-center">Below 70%</span>
                                <span className="flex-1 text-center">70-85%</span>
                                <span className="flex-1 text-center">85-95%</span>
                                <span className="flex-1 text-center">95-100%</span>
                            </div>
                        </div>
                    </div>

                    {/* Prediction cards */}
                    <div className="rounded-lg border border-border bg-card card-shadow overflow-hidden">
                        <div className="border-b border-border px-5 py-3">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                🎯 Rank Prediction (AI)
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 divide-x divide-border">
                            <div className="p-5 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                                    <Trophy size={24} className="text-warning" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">
                                        Target: <span className="font-bold text-foreground">High Performance</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Expected Rank:{" "}
                                        <span className="text-xl font-extrabold text-destructive">
                                            {currentRank ? `Top ${currentRank.toLocaleString()}` : "--"}
                                        </span>
                                    </p>
                                </div>
                                <ChevronRight size={16} className="text-muted-foreground" />
                            </div>
                            <div className="p-5 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                                    <Medal size={24} className="text-success" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">
                                        AI Confidence
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <span className="text-xs text-muted-foreground">
                                            {aiResult?.ai.nextScoreEstimate.confidenceNote || "Run AI analysis to view confidence"}
                                        </span>
                                    </p>
                                </div>
                                <ChevronRight size={16} className="text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    {/* Weak areas table */}
                    <div className="rounded-lg border border-border bg-card card-shadow overflow-hidden">
                        <div className="border-b border-border px-4 py-3">
                            <h3 className="text-sm font-bold text-foreground">Drawback Points & Recommended Practice Questions</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-2.5 text-left font-semibold text-foreground">Weak Area</th>
                                    <th className="px-4 py-2.5 text-center font-semibold text-foreground">Drawback Points</th>
                                    <th className="px-4 py-2.5 text-center font-semibold text-foreground">Questions to Practice</th>
                                    <th className="px-4 py-2.5 text-center font-semibold text-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {weakAreas.map((a, i) => (
                                    <tr key={a.topic} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-2.5 font-medium text-foreground">{i + 1}. {a.topic}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className="rounded-md bg-destructive/10 px-2 py-0.5 font-mono font-semibold text-destructive">-{a.drawback} Points</span>
                                        </td>
                                        <td className="px-4 py-2.5 text-center font-mono text-muted-foreground">{a.questions} Questions ›</td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                                                    Practice Now
                                                </button>
                                                <button className="rounded bg-jee px-2 py-1 text-[10px] font-bold text-white hover:bg-jee/90 transition-colors flex items-center gap-0.5">
                                                    <Download size={10} /> PDF
                                                </button>
                                                <button className="rounded bg-destructive px-2 py-1 text-[10px] font-bold text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-0.5">
                                                    <Download size={10} /> PDF
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-4">
                    {/* AI Tips */}
                    <div className="rounded-lg border border-border bg-card p-4 card-shadow">
                        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                            ⭐ AI Thoughts
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2 whitespace-pre-line">
                            {aiResult
                                ? aiResult.ai.summary
                                : "Select a batch and student, then click \"Analyze with AI\" to view personalized insights here."}
                        </p>
                        <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
                            <div className="h-full rounded-full bg-gradient-to-r from-success to-primary" style={{ width: "65%" }} />
                        </div>
                        <div className="space-y-3 text-xs text-muted-foreground whitespace-pre-line">
                            {aiResult ? aiResult.ai.reasoning : "Once AI runs, detailed reasoning and guidance will appear here."}
                        </div>
                        <LoadingButton
                            className="w-full mt-4 flex items-center justify-center gap-2"
                            size="sm"
                            onClick={() => notifyMutation.mutate()}
                            loading={notifyMutation.isPending}
                            disabled={!aiResult}
                        >
                            Share with Parent (WhatsApp)
                        </LoadingButton>
                    </div>

                    {/* Performance Trend chart */}
                    <div className="rounded-lg border border-border bg-card p-4 card-shadow">
                        <h3 className="text-sm font-bold text-foreground mb-1">Performance Trend</h3>
                        <div className="flex items-center gap-3 mb-3 text-[10px]">
                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Marks</span>
                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-neet" /> Percentile</span>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={performanceTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                                <Line type="monotone" dataKey="marks" stroke="hsl(142 72% 29%)" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="percentile" stroke="hsl(25 95% 53%)" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Report */}
                    <div className="rounded-lg border border-border bg-card p-4 card-shadow">
                        <h3 className="text-sm font-bold text-foreground mb-3">📋 Report</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                                <Share2 size={14} className="text-muted-foreground" /> Share Report
                            </button>
                            <button className="w-full flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                                <FileDown size={14} className="text-muted-foreground" /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border bg-card p-4 card-shadow text-sm">
                <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-muted-foreground" /> Students in batch:{" "}
                    <strong>{studentsData?.length ?? 0}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-muted-foreground" /> Selected Student:{" "}
                    <strong>{studentName}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                    <Award size={14} className="text-muted-foreground" /> Predicted Percentile:{" "}
                    <strong className="text-primary">
                        {currentPercentile ? currentPercentile.toFixed(2) : "--"}%
                    </strong>
                </span>
                <span className="flex items-center gap-1.5">
                    <BellRing size={14} className="text-muted-foreground" /> WhatsApp Share:{" "}
                    <strong>{notifyMutation.isSuccess ? "Sent / Attempted" : "Not sent"}</strong>
                </span>
            </div>
        </div>
    );
}
