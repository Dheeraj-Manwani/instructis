"use client";

import { students, getPercentileBg } from "@/data/dummy";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, MinusCircle, BookOpen, Video, Target, Download, Printer, ChevronLeft, ChevronRight, MessageCircle, FileText, CalendarClock } from "lucide-react";
import { useState } from "react";

const student = students[0]; // Rahul Sharma

const incorrectQuestions = [
    {
        id: 1, subject: "Physics", topic: "Electrostatics",
        question: "A particle has a charge of +2 μC in 500 N/C field. Force on particle?",
        studentAnswer: "5 N", correctAnswer: "0.001 N",
        explanation: "F = qE = 2 × 10⁻⁶ × 500 = 0.001 N  (1.0 mN)",
        hint: "You missed solving with proper units (μC → 10⁻⁶ C).",
    },
    {
        id: 3, subject: "Physics", topic: "Oscillation",
        question: "Spring: T = 1.5 s, m = 2 kg, Find k?",
        studentAnswer: "80 N/m", correctAnswer: "35 N/m",
        explanation: "k = 4π²m / T² = (4 × 9.87 × 2) / (1.5)² = 35 N/m",
        hint: "You overestimated due to wrong formula application.",
    },
    {
        id: 5, subject: "Physics", topic: "Power",
        question: "If current I = 2 A, R = 5 Ω, Find Power?",
        studentAnswer: "10 W", correctAnswer: "20 W",
        explanation: "Power, P = I² × R = (2)² × 5 = 20 W",
        hint: "You used P = I × R instead of I² × R.",
    },
];

const correctQuestions = {
    Math: [
        { id: 2, q: "Capacitor: V = 12V, U = 72 μJ. Find C?", answer: "C = 3 μF", marks: 4 },
        { id: 9, q: "Derivative of sin x?", answer: "cos x", marks: 4 },
    ],
    Physics: [
        { id: 4, q: "Projectile: U = 20 m/s, Find max height?", answer: "h = 20.4 m", marks: 4 },
        { id: 6, q: "Resistance in series: R1=3Ω, R2=5Ω?", answer: "R = 8 Ω", marks: 4 },
        { id: 7, q: "pH of 0.01 M HCl?", answer: "[H⁺] = 10⁻²", marks: 4 },
        { id: 8, q: "Newton's 2nd Law: F = ma, m=2, a=3?", answer: "F = 6 N", marks: 4 },
        { id: 10, q: "Energy Stored: ½CV², C=2μF, V=10?", answer: "100 μJ", marks: 4 },
    ],
    Chemistry: [
        { id: 11, q: "Hybridization of BF₃?", answer: "sp²", marks: 4 },
        { id: 12, q: "IUPAC name of CH₃COOH?", answer: "Ethanoic acid", marks: 4 },
    ],
};

export default function QuestionAnalysis() {
    const [activeTab, setActiveTab] = useState<"Math" | "Physics" | "Chemistry">("Physics");
    const total = student.marks.math + student.marks.physics + student.marks.chemistry;
    const correctCount = 19;
    const incorrectCount = 7;
    const unattemptedCount = 4;
    const accuracy = 76;
    const timeTaken = "1h 32m";

    return (
        <div className="space-y-5">
            {/* Subtitle */}
            <p className="text-sm text-muted-foreground">
                🎓 <span className="font-semibold text-foreground">Physics</span> - JEE Mock Test 3 (Full Syllabus)
            </p>

            {/* Student header */}
            <div className="rounded-lg border border-border bg-card p-5 card-shadow">
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                        {student.avatar}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-foreground">{student.name}</h2>
                        <p className="text-sm text-muted-foreground">Roll No: JEE24-1025</p>
                    </div>
                    <div className="flex flex-wrap gap-5">
                        <MetricCard label="Total Score" value={`${181}/300`} />
                        <MetricCard label="Percentile" value={`${student.jeePercentile}%`} color="text-primary" />
                        <MetricCard label="Correct" value={`${correctCount}`} icon={<CheckCircle size={14} className="text-success" />} color="text-success" />
                        <MetricCard label="Incorrect" value={`${incorrectCount}`} icon={<XCircle size={14} className="text-destructive" />} color="text-destructive" />
                        <MetricCard label="Unattempted" value={`${unattemptedCount}`} icon={<MinusCircle size={14} className="text-muted-foreground" />} />
                    </div>
                    <div className="flex gap-2">
                        <button className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <Download size={16} />
                        </button>
                        <button className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <Printer size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Incorrect */}
                <div className="rounded-lg border border-destructive/30 bg-card card-shadow overflow-hidden">
                    <div className="bg-destructive px-4 py-3 flex items-center gap-2">
                        <XCircle size={16} className="text-destructive-foreground" />
                        <h3 className="text-sm font-bold text-destructive-foreground">
                            Incorrect Questions & Explanations
                        </h3>
                        <span className="ml-auto rounded-full bg-destructive-foreground/20 px-2 py-0.5 text-xs font-bold text-destructive-foreground">
                            {incorrectCount}
                        </span>
                    </div>

                    {/* Column headers */}
                    <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 border-b border-border bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground">
                        <span></span>
                        <span>Question</span>
                        <span>Your Answer</span>
                        <span>Correct Answer</span>
                    </div>

                    <div className="divide-y divide-border">
                        {incorrectQuestions.map((q) => (
                            <div key={q.id} className="p-4 space-y-2.5">
                                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 items-start">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold text-destructive">
                                        {q.id}
                                    </div>
                                    <p className="text-sm text-foreground">{q.question}</p>
                                    <span className="rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive whitespace-nowrap">
                                        {q.studentAnswer} ✕
                                    </span>
                                    <span className="rounded-md bg-success/10 px-2.5 py-1 text-xs font-bold text-success whitespace-nowrap">
                                        {q.correctAnswer}
                                    </span>
                                </div>
                                <div className="ml-10 rounded bg-muted/50 p-3 text-xs space-y-1">
                                    <p className="font-semibold text-destructive">• Explanation:</p>
                                    <p className="font-mono text-foreground">{q.explanation}</p>
                                    <p className="text-muted-foreground italic">{q.hint}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-border p-3 flex items-center justify-center gap-2">
                        <button className="rounded p-1 text-muted-foreground hover:bg-muted transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs font-medium text-primary">View All Incorrect ({incorrectCount})</span>
                        <button className="rounded p-1 text-muted-foreground hover:bg-muted transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Correct */}
                <div className="rounded-lg border border-success/30 bg-card card-shadow overflow-hidden">
                    <div className="bg-primary px-4 py-3 flex items-center gap-2">
                        <CheckCircle size={16} className="text-primary-foreground" />
                        <h3 className="text-sm font-bold text-primary-foreground">Correct Questions</h3>
                        <span className="ml-auto rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs font-bold text-primary-foreground">
                            {correctCount}
                        </span>
                    </div>
                    <div className="flex gap-0 border-b border-border">
                        {(["Math", "Physics", "Chemistry"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "flex-1 px-4 py-2.5 text-xs font-semibold transition-colors",
                                    activeTab === tab
                                        ? "border-b-2 border-primary bg-primary/5 text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Column headers */}
                    <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 border-b border-border bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground">
                        <span></span>
                        <span>Question</span>
                        <span>Your Answer</span>
                        <span>Status</span>
                        <span>Marks</span>
                    </div>

                    <div className="divide-y divide-border">
                        {correctQuestions[activeTab].map((q) => (
                            <div key={q.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center px-4 py-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                    {q.id}
                                </div>
                                <p className="text-sm text-foreground">{q.q}</p>
                                <span className="text-xs font-mono font-semibold text-primary">{q.answer}</span>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                                    <CheckCircle size={12} /> Correct
                                </span>
                                <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold font-mono text-success">+{q.marks}</span>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-border p-3 flex items-center justify-center gap-2">
                        <button className="rounded-full border border-border p-1 text-muted-foreground hover:bg-muted transition-colors">
                            <ChevronLeft size={14} />
                        </button>
                        <span className="text-xs font-medium text-primary">View All Correct ({correctCount})</span>
                        <button className="rounded-full border border-border p-1 text-muted-foreground hover:bg-muted transition-colors">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Performance Insights */}
            <div className="rounded-lg border border-border bg-card p-5 card-shadow">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="h-4 w-1 rounded bg-destructive" /> Performance Insights
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Weak Topics */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                            ⚠️ Weak Topics:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {["Electrostats", "Oscillation", "Power"].map((t) => (
                                <span key={t} className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">{t}</span>
                            ))}
                        </div>
                    </div>
                    {/* Accuracy */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Accuracy:</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold font-mono text-primary">{accuracy}%</span>
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${accuracy}%` }} />
                            </div>
                        </div>
                    </div>
                    {/* Time */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-1.5">⏱ Time Taken:</p>
                        <span className="text-2xl font-bold font-mono text-foreground">{timeTaken}</span>
                    </div>
                    {/* Improvement */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-1.5">✦ Improvement:</p>
                        <span className="text-2xl font-bold font-mono text-success">↑ +23 Points</span>
                    </div>
                </div>
            </div>

            {/* AI Recommendations */}
            <div className="rounded-lg border border-border bg-card p-4 card-shadow">
                <h3 className="text-sm font-bold text-foreground mb-3">🤖 AI Recommendations</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                        { icon: BookOpen, title: "Practice: Electrostatics (15 Qs)", color: "text-warning bg-warning/10" },
                        { icon: Video, title: "Watch Video: Oscillation Formula", color: "text-jee bg-jee/10" },
                        { icon: Target, title: "Revise: Units & Dimensions", color: "text-destructive bg-destructive/10" },
                    ].map((rec) => (
                        <div key={rec.title} className={cn("flex items-center gap-3 rounded-lg p-3", rec.color)}>
                            <rec.icon size={18} />
                            <span className="text-xs font-semibold">{rec.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom actions */}
            <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Target size={16} /> Practice Weak Areas
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <FileText size={16} /> Download Report (9DF)
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-success px-5 py-2.5 text-sm font-semibold text-success-foreground hover:bg-success/90 transition-colors">
                    <MessageCircle size={16} /> Send to Parent (WhatsApp)
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <CalendarClock size={16} /> Schedule →
                </button>
            </div>
        </div>
    );
}

function MetricCard({ label, value, color, icon }: { label: string; value: string; color?: string; icon?: React.ReactNode }) {
    return (
        <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
            <div className="flex items-center justify-center gap-1 mt-0.5">
                {icon}
                <span className={cn("text-lg font-bold font-mono", color || "text-foreground")}>{value}</span>
            </div>
        </div>
    );
}
