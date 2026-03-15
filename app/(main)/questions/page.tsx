"use client";

import { useState } from "react";
import {
    Bold, Italic, Underline, Superscript, Plus, Save, Send, ChevronLeft,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Copy, ClipboardPaste, Link2,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuestionBuilder() {
    const [options, setOptions] = useState([
        { label: "A", text: "25%", correct: false },
        { label: "B", text: "40%", correct: true },
        { label: "C", text: "50%", correct: false },
        { label: "D", text: "60%", correct: false },
    ]);
    const [level, setLevel] = useState<"Easy" | "Moderate" | "Hard">("Moderate");
    const [randomize, setRandomize] = useState(false);
    const [showSolution, setShowSolution] = useState(true);
    const [showExplanation, setShowExplanation] = useState(true);

    const setCorrect = (idx: number) => {
        setOptions((prev) => prev.map((o, i) => ({ ...o, correct: i === idx })));
    };

    return (
        <div className="space-y-5">
            {/* Subtitle */}
            <p className="text-sm text-muted-foreground">Faculty Question Builder for JEE Exam</p>

            {/* Back button */}
            <button className="flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <ChevronLeft size={16} /> Back
            </button>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground">Subject:</span>
                    <select className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                        <option>Physics</option><option>Math</option><option>Chemistry</option>
                    </select>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground">Topic:</span>
                    <select className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                        <option>Thermodynamics</option><option>Electrostatics</option><option>Optics</option>
                    </select>
                </div>
            </div>

            {/* Student selector */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    RS
                </div>
                <select className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none">
                    <option>Rahul Sharma</option>
                    <option>Priya Joshi</option>
                    <option>Tanvi Mehta</option>
                </select>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
                {/* Main */}
                <div className="space-y-5">
                    {/* Question editor */}
                    <div className="rounded-lg border border-border bg-card card-shadow">
                        <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
                            {[Bold, Italic, Underline].map((Icon, i) => (
                                <button key={i} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                    <Icon size={16} />
                                </button>
                            ))}
                            <div className="w-px h-5 bg-border mx-1" />
                            {[AlignLeft, AlignCenter, AlignRight, AlignJustify].map((Icon, i) => (
                                <button key={i} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                    <Icon size={16} />
                                </button>
                            ))}
                            <div className="w-px h-5 bg-border mx-1" />
                            <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-xs font-bold">
                                M
                            </button>
                            <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                <Superscript size={16} />
                            </button>
                            <div className="w-px h-5 bg-border mx-1" />
                            {[Copy, ClipboardPaste].map((Icon, i) => (
                                <button key={i} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                    <Icon size={16} />
                                </button>
                            ))}
                            <div className="w-px h-5 bg-border mx-1" />
                            <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                <Type size={16} />
                            </button>
                            <span className="text-xs text-muted-foreground ml-1">82</span>
                            <div className="w-px h-5 bg-border mx-1" />
                            <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                <Link2 size={16} />
                            </button>
                        </div>

                        {/* Label + Correct badge */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                            <span className="text-xs text-muted-foreground">Math</span>
                            <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                                <Check size={12} /> Correct Answer
                            </span>
                        </div>

                        <textarea
                            className="w-full resize-none bg-transparent p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                            rows={4}
                            defaultValue="A heat engine absorbs 600 J of heat energy at high temperature and performs 120 J of work against its environment. Calculate the efficiency of the engine."
                        />
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {options.map((opt, i) => (
                            <div
                                key={opt.label}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg border p-3 transition-all cursor-pointer",
                                    opt.correct ? "border-primary/50 bg-primary/5" : "border-border bg-card hover:border-border"
                                )}
                                onClick={() => setCorrect(i)}
                            >
                                <div className={cn(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-bold",
                                    opt.correct ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {opt.correct ? <Check size={14} /> : opt.label}
                                </div>
                                <input
                                    className="flex-1 bg-transparent text-sm text-foreground focus:outline-none"
                                    value={opt.text}
                                    onChange={(e) => {
                                        const updated = [...options];
                                        updated[i].text = e.target.value;
                                        setOptions(updated);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Explanation */}
                    <div className="rounded-lg border border-border bg-card card-shadow">
                        <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="w-full px-4 py-3 text-left text-sm font-semibold text-foreground flex items-center justify-between"
                        >
                            <span>Explanation <span className="text-muted-foreground font-normal">(Optional)</span></span>
                            <div className="flex items-center gap-2">
                                {/* Number badges from design */}
                                {[1, 11, "≡", 8].map((n, i) => (
                                    <span key={i} className={cn(
                                        "flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold",
                                        i === 1 ? "bg-jee text-white" : "bg-muted text-muted-foreground"
                                    )}>
                                        {n}
                                    </span>
                                ))}
                                <span className="text-xs text-muted-foreground">{showExplanation ? "▲" : "▼"}</span>
                            </div>
                        </button>
                        {showExplanation && (
                            <div className="border-t border-border p-4 space-y-1 text-sm text-foreground">
                                <p>Efficiency = Work done / Heat absorbed</p>
                                <p className="font-mono">= <sup>120</sup>/<sub>600</sub> = 20%</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button className="flex items-center gap-2 rounded-lg border border-primary bg-card px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
                            <Plus size={16} /> Add Another Question
                        </button>
                        <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                            <Save size={16} /> Save Question
                        </button>
                        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                            <Plus size={16} /> Finish & Publish
                        </button>
                        <button className="flex items-center gap-2 rounded-lg bg-jee px-4 py-2.5 text-sm font-semibold text-white hover:bg-jee/90 transition-colors">
                            <Send size={16} /> Finish & Publish
                        </button>
                        <span className="ml-auto text-xs text-muted-foreground">Saved Draft ✓</span>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-4">
                    <div className="rounded-lg border border-border bg-card p-4 card-shadow space-y-4">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Question Level :</p>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value as any)}
                                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            >
                                <option>Easy</option>
                                <option>Moderate</option>
                                <option>Hard</option>
                            </select>
                        </div>

                        <Toggle label="Randomize Options" checked={randomize} onChange={setRandomize} icon="🔀" />
                        <Toggle label="Show Solution" checked={showSolution} onChange={setShowSolution} icon="💡" />
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4 card-shadow">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Question Stats</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Questions Added</span><span className="font-mono font-bold text-foreground">12</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Easy</span><span className="font-mono text-success">4</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Moderate</span><span className="font-mono text-warning">5</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Hard</span><span className="font-mono text-destructive">3</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Toggle({ label, checked, onChange, icon }: { label: string; checked: boolean; onChange: (v: boolean) => void; icon?: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-foreground flex items-center gap-1.5">
                {icon && <span>{icon}</span>} {label}
            </span>
            <button
                onClick={() => onChange(!checked)}
                className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-primary" : "bg-muted")}
            >
                <span className={cn("absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-card transition-transform shadow-sm", checked && "translate-x-4")} />
            </button>
        </div>
    );
}
