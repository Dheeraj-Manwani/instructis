"use client";

import { students, performanceTrend, getPercentileBg } from "@/data/dummy";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Target, Zap, BookOpen, Star, Trophy, Medal, FileDown, Share2, ChevronRight, Download, Users, Award, BellRing } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const student = students[0];
const total = student.marks.math + student.marks.physics + student.marks.chemistry;

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

export default function AIRankPredictor() {
    return (
        <div className="space-y-5">
            {/* Top controls */}
            <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-muted-foreground mr-auto">AI Based JEE / NEET Rank Estimate + <span className="underline font-medium text-foreground">Improvement Plan</span></p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-foreground">Select Student:</span>
                <select className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none">
                    {students.map((s) => <option key={s.id}>{s.name}</option>)}
                </select>
                <div className="flex rounded-md overflow-hidden border border-border ml-auto">
                    <button className="bg-jee px-5 py-2 text-xs font-bold text-white">JEE</button>
                    <button className="bg-card px-5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground border-l border-border">NEET</button>
                </div>
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
                        <p className="text-xs text-muted-foreground">Percentile</p>
                        <p className="text-2xl font-bold font-mono text-primary">{student.jeePercentile}%</p>
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-success"><TrendingUp size={10} /> -4.2%</span>
                    </div>
                    <div className="p-4">
                        <p className="text-xs text-muted-foreground">Current Rank</p>
                        <p className="text-2xl font-bold font-mono text-foreground">{student.jeeRank.toLocaleString()}</p>
                    </div>
                    <div className="p-4">
                        <p className="text-xs text-muted-foreground">Improvement</p>
                        <p className="text-2xl font-bold font-mono text-success">+{student.improvement} Points</p>
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
                                style={{ left: `${student.jeePercentile}%`, transform: "translateX(-50%)" }}
                            >
                                <span className="rounded-md bg-foreground px-2.5 py-1 text-[10px] font-bold text-background whitespace-nowrap">You are here</span>
                                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
                            </div>
                            <div
                                className="absolute top-0 h-5 flex items-center"
                                style={{ left: `${student.jeePercentile}%`, transform: "translateX(-50%)" }}
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
                                    <p className="text-xs text-muted-foreground">Target: <span className="font-bold text-foreground">95-99%ile</span></p>
                                    <p className="text-sm text-muted-foreground">Expected Rank: <span className="text-xl font-extrabold text-destructive">Top 1,000</span></p>
                                </div>
                                <ChevronRight size={16} className="text-muted-foreground" />
                            </div>
                            <div className="p-5 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                                    <Medal size={24} className="text-success" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">Target: <span className="font-bold text-foreground">90-95%ile</span></p>
                                    <p className="text-sm text-muted-foreground">Expected Rank: <span className="text-xl font-extrabold text-destructive">Top 3,000</span></p>
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
                            ⭐ AI Improvement Tips
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                            Focus on weak areas to gain <span className="font-bold text-success">+35 points</span>
                        </p>
                        <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
                            <div className="h-full rounded-full bg-gradient-to-r from-success to-primary" style={{ width: "65%" }} />
                        </div>
                        <div className="space-y-3">
                            {tips.map((t, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    <span className={cn("inline-block h-3 w-3 rounded-sm", t.priority === "High" ? "bg-success" : "bg-warning")} />
                                    <span className="text-foreground font-medium">{t.tip}</span>
                                    <span className="text-[10px] ml-auto">–</span>
                                    <span className={cn("text-[10px] font-semibold", t.color)}>{t.priority} Priority</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                            Generate Study Plan
                        </button>
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
                <span className="flex items-center gap-1.5"><Users size={14} className="text-muted-foreground" /> Students: <strong>120</strong></span>
                <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-muted-foreground" /> Avg. Marks: <strong>218 / 300</strong></span>
                <span className="flex items-center gap-1.5"><Award size={14} className="text-muted-foreground" /> Highest Percentile: <strong className="text-primary">98.7%</strong></span>
                <span className="flex items-center gap-1.5"><BellRing size={14} className="text-muted-foreground" /> Parents Notified</span>
            </div>
        </div>
    );
}
