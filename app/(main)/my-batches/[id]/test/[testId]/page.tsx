"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, FileSpreadsheet, Save, Users, TrendingUp, Award, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { fetchTestById, fetchTestAttempts, type TestAttemptListItem } from "@/lib/api/tests";
import { fetchBatchById } from "@/lib/api/batches";
import { ExamType } from "@prisma/client";
import { TableSkeleton } from "@/components/ui/table-skeleton";

function getPercentileBg(percentile: number | null): string {
    if (!percentile) return "bg-muted text-muted-foreground";
    if (percentile >= 90) return "bg-success/20 text-success";
    if (percentile >= 75) return "bg-primary/20 text-primary";
    if (percentile >= 50) return "bg-warning/20 text-warning";
    return "bg-destructive/20 text-destructive";
}

export default function TestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const batchId = params.id as string;
    const testId = params.testId as string;

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

    const { data: attempts = [], isLoading: attemptsLoading } = useQuery({
        queryKey: ["test-attempts", testId],
        queryFn: () => fetchTestAttempts(testId),
        enabled: !!testId,
    });

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

    // Calculate stats
    const totalStudents = attempts.length;
    const submittedAttempts = attempts.filter((a) => a.submittedAt !== null);
    const avgTotal = attempts.length > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + (a.totalScore || 0), 0) / attempts.length
        )
        : 0;
    const highestPercentile = attempts.length > 0
        ? Math.max(...attempts.map((a) => a.percentile || 0))
        : 0;

    // Get max marks for each subject
    const maxPhysics = test.totalMarksPhysics || 0;
    const maxChemistry = test.totalMarksChemistry || 0;
    const maxMathematics = test.totalMarksMathematics || 0;
    const maxZoology = test.totalMarksZoology || 0;
    const maxBotany = test.totalMarksBotany || 0;

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
                <h2 className="text-sm font-bold text-foreground mb-3">
                    Import & Bulk Upload Marks <span className="text-muted-foreground font-normal">(Excel / Google Sheets)</span>
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="group rounded-lg border-2 border-dashed border-primary/40 bg-card p-5 hover:border-primary transition-all">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <Upload size={22} className="text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-foreground">Upload Excel</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Upload marks from an Excel (.xls or .xlsx) file</p>
                                <button className="mt-3 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                                    <Upload size={14} /> Select Excel File
                                </button>
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
                                <button className="mt-3 flex items-center gap-2 rounded-md bg-jee px-4 py-2 text-xs font-semibold text-white hover:bg-jee/90 transition-colors">
                                    <FileSpreadsheet size={14} /> Connect Google Sheets
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card card-shadow">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="w-8 px-3 py-3">
                                <Checkbox className="rounded border-border" />
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
                        ) : attempts.length === 0 ? (
                            <tr>
                                <td colSpan={isJEE ? 9 : 10} className="px-4 py-8 text-center text-muted-foreground">
                                    No attempts found for this test
                                </td>
                            </tr>
                        ) : (
                            attempts.map((attempt, i) => {
                                const total = (attempt.totalScore || 0);
                                const percentile = attempt.percentile || 0;
                                const studentName = attempt.student.user.name;
                                const avatar = studentName.charAt(0).toUpperCase();

                                return (
                                    <tr
                                        key={attempt.id}
                                        className={cn(
                                            "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                                            i % 2 === 0 ? "bg-card" : "bg-muted/20"
                                        )}
                                    >
                                        <td className="px-3 py-3">
                                            <Checkbox className="rounded border-border" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                    {avatar}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-foreground">{studentName}</span>
                                                    <p className="text-xs text-muted-foreground">Roll No: {attempt.student.rollNo}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {isJEE ? (
                                            <>
                                                <td className="px-4 py-3 text-center font-mono text-foreground">
                                                    {attempt.physicsMarks?.toFixed(1) || "-"}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono text-foreground">
                                                    {attempt.chemistryMarks?.toFixed(1) || "-"}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono text-foreground">
                                                    {attempt.mathematicsMarks?.toFixed(1) || "-"}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-4 py-3 text-center font-mono text-foreground">
                                                    {attempt.physicsMarks?.toFixed(1) || "-"}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono text-foreground">
                                                    {attempt.chemistryMarks?.toFixed(1) || "-"}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono text-foreground">
                                                    {attempt.zoologyMarks?.toFixed(1) || "-"}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono text-foreground">
                                                    {attempt.botanyMarks?.toFixed(1) || "-"}
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
                                                <button className="rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1">
                                                    <Save size={12} /> Save
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
                <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Save size={16} />
                    Save Marks & Generate Report
                </button>
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
