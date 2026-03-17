import { students, batchName } from "@/data/dummy";
import { TrendingUp, MessageCircle, AlertTriangle, Search, Upload, Users, Award, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";

const student = students[0];

function PercentileBar({ percentile, segments, color }: { percentile: number; segments: { label: string; color: string }[]; color: string }) {
    const segmentWidth = 100 / segments.length;
    // Map percentile to position
    const position = percentile;

    return (
        <div className="relative mt-3 mb-6">
            <div className="flex h-4 w-full rounded-full overflow-hidden">
                {segments.map((seg, i) => (
                    <div key={i} className={cn("h-full", seg.color)} style={{ width: `${segmentWidth}%` }} />
                ))}
            </div>
            <div
                className="absolute -top-7 flex flex-col items-center transition-all duration-700"
                style={{ left: `${position}%`, transform: "translateX(-50%)" }}
            >
                <span className="rounded bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">You</span>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
            </div>
            <div
                className="absolute top-0 h-4 flex items-center justify-center"
                style={{ left: `${position}%`, transform: "translateX(-50%)" }}
            >
                <div className={cn("h-5 w-5 rounded-full border-3 border-card shadow-lg", color)} />
            </div>
            <div className="mt-2 flex text-[10px] font-medium text-muted-foreground">
                {segments.map((seg, i) => (
                    <span key={i} className="flex-1 text-center">{seg.label}</span>
                ))}
            </div>
        </div>
    );
}

export default function Results() {
    return (
        <div className="space-y-5">
            {/* Title */}
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    <span className="font-normal">Offline</span> Exam Results <span>Uploaded</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                    Congratulations, {student.name.split(" ")[0]}! Here are your performance details.
                </p>
            </div>

            {/* Result cards */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* JEE */}
                <div className="rounded-lg border border-jee/30 bg-card card-shadow overflow-hidden">
                    <div className="bg-jee px-5 py-3">
                        <h3 className="text-sm font-bold text-white text-center">JEE Exam Results</h3>
                    </div>
                    <div className="p-5">
                        <div className="flex items-end gap-8 mb-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Your Rank:</p>
                                <p className="text-3xl font-extrabold font-mono text-foreground">{student.jeeRank.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Percentile:</p>
                                <p className="text-3xl font-extrabold font-mono text-jee">{student.jeePercentile}%</p>
                            </div>
                        </div>

                        <PercentileBar
                            percentile={student.jeePercentile}
                            color="bg-jee"
                            segments={[
                                { label: "Below 70%", color: "bg-destructive" },
                                { label: "70-85%", color: "bg-warning" },
                                { label: "85-95%", color: "bg-success" },
                                { label: "95-100%", color: "bg-primary" },
                            ]}
                        />

                        <div className="rounded-md bg-success px-4 py-2.5 text-sm font-bold text-success-foreground mb-3">
                            Improvement Points: +{student.improvement} Points
                        </div>

                        <p className="text-sm text-foreground mb-3">
                            <strong>Great Progress!</strong> You&apos;ve improved by {student.improvement} points from the last test.
                        </p>

                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Search size={16} className="shrink-0 mt-0.5 text-primary" />
                            <p><strong className="text-foreground">Rank Prediction:</strong> With 95-99 percentile, you may achieve a top <strong className="text-foreground">1,000</strong> rank in JEE.</p>
                        </div>
                    </div>
                </div>

                {/* NEET */}
                <div className="rounded-lg border border-neet/30 bg-card card-shadow overflow-hidden">
                    <div className="bg-destructive px-5 py-3">
                        <h3 className="text-sm font-bold text-white text-center">NEET Exam Results</h3>
                    </div>
                    <div className="p-5">
                        <div className="flex items-end gap-8 mb-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Your Rank:</p>
                                <p className="text-3xl font-extrabold font-mono text-foreground">867</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Percentile:</p>
                                <p className="text-3xl font-extrabold font-mono text-neet">88.3%</p>
                            </div>
                        </div>

                        <PercentileBar
                            percentile={88.3}
                            color="bg-neet"
                            segments={[
                                { label: "Below 60%", color: "bg-destructive" },
                                { label: "60-80%", color: "bg-warning" },
                                { label: "80-90%", color: "bg-success" },
                                { label: "90-100%", color: "bg-primary" },
                            ]}
                        />

                        <div className="rounded-md bg-success px-4 py-2.5 text-sm font-bold text-success-foreground mb-3">
                            Improvement Points: +19 Points
                        </div>

                        <p className="text-sm text-foreground mb-3">
                            <strong>Well Done!</strong> You&apos;ve improved by 19 points from the last test.
                        </p>

                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Search size={16} className="shrink-0 mt-0.5 text-neet" />
                            <p><strong className="text-foreground">Rank Prediction:</strong> With 90-95 percentile, you may achieve a top <strong className="text-foreground">3,000</strong> rank in NEET.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* WhatsApp Notification */}
                <div className="rounded-lg border border-border bg-card p-5 card-shadow">
                    <div className="flex items-center gap-2 mb-3">
                        <MessageCircle size={16} className="text-success" />
                        <h3 className="text-sm font-semibold text-foreground">Notification to Parents</h3>
                    </div>
                    <div className="flex items-center gap-1.5 mb-3 text-xs text-success font-semibold">
                        <div className="h-4 w-4 rounded-full bg-success flex items-center justify-center">
                            <span className="text-success-foreground text-[8px]">✓</span>
                        </div>
                        Message sent automatically via WhatsApp.
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-foreground space-y-2">
                        <p>Dear Parent,</p>
                        <p>{student.name.split(" ")[0]} has shown great improvement in his recent exams.</p>
                        <p><span className="font-semibold text-jee">JEE Percentile: {student.jeePercentile}%</span> <span className="text-success font-semibold">(+{student.improvement} Points)</span></p>
                        <p><span className="font-semibold text-neet">NEET Percentile: 88.3%</span> <span className="text-success font-semibold">(+19 Points)</span></p>
                        <p className="text-muted-foreground pt-1">Keep up the good work! — Instructis Team</p>
                    </div>
                </div>

                {/* Student Analytics - Dark card */}
                <div className="rounded-lg bg-foreground p-5 card-shadow text-background">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={16} />
                        <h3 className="text-sm font-bold">Student Analytics</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            { icon: "🔍", label: "Weak Areas" },
                            { icon: "📐", label: "Physics – Electrostatics" },
                            { icon: "💡", label: "Weak Topic: Capacitors" },
                            { icon: "📝", label: "Practice Questions: Electrostatics (30 questions)" },
                            { icon: "🎬", label: "Improvement Video: Capacitance" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-3 text-sm">
                                <span>{item.icon}</span>
                                <span className="opacity-90">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 card-shadow">
                <div className="flex flex-wrap gap-6">
                    <FooterStat label="Students:" value="120" />
                    <FooterStat label="Avg. Marks:" value="218" />
                    <FooterStat label="Highest Percentile:" value="98.7%" />
                    <FooterStat label="Parents Notified:" value="118" />
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                        <Upload size={14} /> Upload Marks
                    </button>
                    <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                        <Users size={14} /> Manage Roster
                    </button>
                </div>
            </div>
        </div>
    );
}

function FooterStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-bold font-mono text-foreground">{value}</span>
        </div>
    );
}
