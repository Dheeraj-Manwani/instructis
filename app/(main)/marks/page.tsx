"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, Save, Users, TrendingUp, Award, BellRing, Download, History, Zap, Plus, FileText, MessageCircle, MoreVertical } from "lucide-react";
import { students, batchName, getPercentileBg } from "@/data/dummy";
import { cn } from "@/lib/utils";

export default function MarksUpload() {
    const [marksData, setMarksData] = useState(
        students.map((s) => ({ ...s, marks: { ...s.marks } }))
    );

    const updateMark = (id: string, subject: "math" | "physics" | "chemistry", value: number) => {
        setMarksData((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, marks: { ...s.marks, [subject]: Math.min(300, Math.max(0, value)) } } : s
            )
        );
    };

    const avgMarks = Math.round(
        marksData.reduce((a, s) => a + s.marks.math + s.marks.physics + s.marks.chemistry, 0) /
        marksData.length
    );
    const highestPct = Math.max(...marksData.map((s) => s.jeePercentile));

    // // Dummy improvement per-subject data
    // const subjectImprovements: Record<string, Record<string, number>> = {
    //     "1": { physics: 5, chemistry: 8 },
    //     "3": { math: 3, physics: 6, chemistry: 4 },
    // };

    return (
        <div className="space-y-5">
            {/* Page subtitle */}
            <p className="text-sm text-muted-foreground">
                Upload marks for JEE and NEET exams. Easily import from Excel or Google Sheets or enter marks manually.
            </p>

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

            {/* Action links row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-4">
                    <a
                        href="/api/template"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium text-jee hover:underline"
                    >
                        <Download size={14} /> Download Template File (.xlsx)
                    </a>
                    <button className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline">
                        <History size={14} /> View Upload History
                    </button>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors">
                    <Zap size={14} /> Auto Calculate & Notify Parents
                </button>
            </div>

            {/* Enter Marks Manually */}
            <div>
                <h2 className="text-base font-bold text-foreground mb-1">Enter Marks Manually</h2>
                <h3 className="text-sm font-semibold text-foreground mb-3">Class Filters</h3>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {[
                    { label: "Exam:", options: ["JEE", "NEET"] },
                    { label: "Batch:", options: ["Select a batch", batchName] },
                    { label: "Subject:", options: ["Select a subject", "All Subjects", "Math", "Physics", "Chemistry"] },
                    { label: "Test Name:", options: ["Select a test", "Mock Test 4 - Dec 2024", "Mock Test 3 - Nov 2024"] },
                ].map((f) => (
                    <div key={f.label} className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground">{f.label}</span>
                        <select className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                            {f.options.map((o) => (
                                <option key={o}>{o}</option>
                            ))}
                        </select>
                    </div>
                ))}
                <button className="flex items-center gap-1.5 rounded-md border border-primary bg-card px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors ml-auto">
                    <Plus size={14} /> Add Student
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card card-shadow">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="w-8 px-3 py-3">
                                <input type="checkbox" className="rounded border-border" />
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">Student Name</th>
                            <th className="px-4 py-3 text-center font-semibold text-foreground">Math <span className="text-xs text-muted-foreground font-normal">(300)</span></th>
                            <th className="px-4 py-3 text-center font-semibold text-foreground">Physics <span className="text-xs text-muted-foreground font-normal">(300)</span></th>
                            <th className="px-4 py-3 text-center font-semibold text-foreground">Chemistry <span className="text-xs text-muted-foreground font-normal">(300)</span></th>
                            <th className="px-4 py-3 text-center font-semibold text-foreground">Total Marks <span className="text-xs text-muted-foreground font-normal">(900)</span></th>
                            <th className="px-4 py-3 text-center font-semibold text-foreground">Percentile</th>
                            <th className="px-4 py-3 text-center font-semibold text-foreground">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {marksData.map((s, i) => {
                            const total = s.marks.math + s.marks.physics + s.marks.chemistry;
                            // const improvements = subjectImprovements[s.id] || {};
                            return (
                                <tr key={s.id} className={cn("border-b border-border last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 0 ? "bg-card" : "bg-muted/20")}>
                                    <td className="px-3 py-3">
                                        <input type="checkbox" className="rounded border-border" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                {s.avatar}
                                            </div>
                                            <span className="font-medium text-foreground">{s.name}</span>
                                        </div>
                                    </td>
                                    {(["math", "physics", "chemistry"] as const).map((sub) => (
                                        <td key={sub} className="px-4 py-3 text-center">
                                            <div className="inline-flex items-center gap-1.5">
                                                <input
                                                    type="number"
                                                    value={s.marks[sub]}
                                                    onChange={(e) => updateMark(s.id, sub, parseInt(e.target.value) || 0)}
                                                    className="w-16 rounded border border-border bg-background px-2 py-1 text-center font-mono text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                                {/* {improvements[sub] && (
                                                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-success">
                                                        <TrendingUp size={10} /> +{improvements[sub]}
                                                    </span>
                                                )} */}
                                            </div>
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-center font-mono font-semibold text-foreground">
                                        {total} <span className="text-muted-foreground font-normal">/ 300</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono", getPercentileBg(s.jeePercentile))}>
                                            {s.jeePercentile}%
                                        </span>
                                        {/* <span className={cn("ml-1.5 text-[10px] font-bold", s.improvement > 0 ? "text-success" : s.improvement < 0 ? "text-destructive" : "text-muted-foreground")}>
                                            {s.improvement > 0 ? `+${s.improvement} Points` : `${s.improvement} Points`}
                                        </span> */}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button className="rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1">
                                                <Save size={12} /> Save
                                            </button>
                                            <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                                <FileText size={14} />
                                            </button>
                                            <button className="rounded p-1.5 text-success hover:bg-success/10 transition-colors">
                                                <MessageCircle size={14} />
                                            </button>
                                            <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                                <MoreVertical size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 card-shadow">
                <div className="flex flex-wrap gap-6">
                    <Stat icon={Users} label="Students:" value="120" />
                    <Stat icon={TrendingUp} label="Avg. Marks:" value="218 / 300" />
                    <Stat icon={Award} label="Highest Percentile:" value="98.7%" />
                    <Stat icon={BellRing} label="Parents Notified:" value="118" />
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Save size={16} />
                    Save Marks & Generate Report
                </button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
                Marks will be auto-saved and reflected in student dashboards, results & parent app. <span className="text-success font-medium">© WhatsApp</span>.
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
