"use client";

import { students, batchName } from "@/data/dummy";
import { cn } from "@/lib/utils";
import { Send, CheckCircle, Clock, ChevronLeft, Phone, Video, MoreVertical, Smile, Paperclip, Camera, Mic } from "lucide-react";
import { useState } from "react";

const notificationStatus = [
    { studentId: "1", sent: true, time: "2 min ago" },
    { studentId: "2", sent: true, time: "5 min ago" },
    { studentId: "3", sent: false, time: "" },
    { studentId: "4", sent: true, time: "10 min ago" },
    { studentId: "5", sent: false, time: "" },
    { studentId: "6", sent: false, time: "" },
];

export default function WhatsAppPreview() {
    const [selectedStudent, setSelectedStudent] = useState(students[0]);

    return (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
            {/* Left — Student list */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <select className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                        <option>{batchName}</option>
                    </select>
                    <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                        <Send size={14} /> Send All Pending
                    </button>
                </div>

                <div className="rounded-lg border border-border bg-card card-shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-2.5 text-left font-semibold text-foreground">Student</th>
                                <th className="px-4 py-2.5 text-left font-semibold text-foreground">Parent Phone</th>
                                <th className="px-4 py-2.5 text-center font-semibold text-foreground">Status</th>
                                <th className="px-4 py-2.5 text-center font-semibold text-foreground">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => {
                                const status = notificationStatus.find((n) => n.studentId === s.id)!;
                                return (
                                    <tr
                                        key={s.id}
                                        className={cn("border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer", selectedStudent.id === s.id && "bg-primary/5")}
                                        onClick={() => setSelectedStudent(s)}
                                    >
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{s.avatar}</div>
                                                <span className="font-medium text-foreground">{s.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{s.parentPhone}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            {status.sent ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-success font-semibold">
                                                    <CheckCircle size={12} /> Sent
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock size={12} /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-center">
                                            {!status.sent && (
                                                <button className="rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                                                    Send Now
                                                </button>
                                            )}
                                            {status.sent && <span className="text-[10px] text-muted-foreground">{status.time}</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right — Phone mockup */}
            <div className="flex justify-center">
                <div className="w-[360px] rounded-[2.5rem] border-[4px] border-foreground/20 bg-foreground/5 shadow-2xl overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground/20 rounded-b-2xl z-10" />

                    {/* Status bar */}
                    <div className="flex items-center justify-between px-6 pt-2 pb-1 bg-[#075E54] text-white text-[10px] font-medium">
                        <span>8:37</span>
                        <div className="flex items-center gap-1">
                            <span>▐▐▐▐</span>
                            <span>📶</span>
                            <span>🔋</span>
                        </div>
                    </div>

                    {/* WhatsApp header */}
                    <div className="flex items-center gap-3 bg-[#075E54] px-3 pb-3 text-white">
                        <ChevronLeft size={20} />
                        <div className="h-9 w-9 rounded-full bg-[#25D366] flex items-center justify-center text-white text-sm font-bold">
                            ✓
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold">Instructis</p>
                            <p className="text-[10px] opacity-70">+91 98765 43210</p>
                        </div>
                        <Video size={18} />
                        <Phone size={18} />
                        <MoreVertical size={18} />
                    </div>

                    {/* Unread badge */}
                    <div className="text-center py-2 bg-accent/30">
                        <span className="inline-block rounded-full bg-primary/20 px-3 py-0.5 text-[10px] font-semibold text-primary">
                            1 UNREAD MESSAGE
                        </span>
                    </div>

                    {/* Chat area */}
                    <div
                        className="min-h-[500px] bg-accent/20 p-3 space-y-3 overflow-y-auto"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0v60M0 30h60\' stroke=\'%2300000005\' fill=\'none\'/%3E%3C/svg%3E")' }}
                    >
                        {/* Letter message */}
                        <div className="max-w-[320px] rounded-lg rounded-tl-none bg-card p-4 shadow-sm space-y-3">
                            <p className="text-xs text-foreground">Dear Parent,</p>
                            <p className="text-xs text-foreground">Here is {selectedStudent.name.split(" ")[0]}&apos;s latest report card from his recent exams. He is showing significant <strong>improvement</strong>!</p>

                            {/* Student card */}
                            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                    {selectedStudent.avatar}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">{selectedStudent.name}</p>
                                    <p className="text-[10px] text-muted-foreground">Grade 12</p>
                                </div>
                            </div>

                            {/* JEE & NEET cards */}
                            <div className="grid grid-cols-2 gap-2">
                                {/* JEE */}
                                <div className="rounded-lg bg-[#075E54] p-3 text-white">
                                    <p className="text-[10px] font-bold text-[#25D366]">JEE Results</p>
                                    <p className="text-[9px] opacity-80 mt-1">Estimated JEE Rank</p>
                                    <p className="text-2xl font-extrabold">{selectedStudent.jeePercentile}%</p>
                                    <span className="inline-block rounded-full bg-[#25D366] px-2 py-0.5 text-[8px] font-bold mt-1">
                                        +{selectedStudent.improvement} Improvement
                                    </span>
                                    <p className="text-[9px] mt-1.5 opacity-80">Current Rank: <span className="font-bold text-[#25D366]">{selectedStudent.jeeRank}</span></p>
                                    {/* Mini chart placeholder */}
                                    <div className="mt-1 flex items-end gap-px h-6">
                                        {[30, 45, 40, 55, 60, 70].map((h, i) => (
                                            <div key={i} className="flex-1 rounded-t bg-[#25D366]/50" style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                    <div className="border-t border-white/20 mt-2 pt-1.5">
                                        <p className="text-[8px]">Rank Prediction: <span className="font-bold">97%</span></p>
                                        <p className="text-[8px] opacity-70">Top 1,000 Rank Possible</p>
                                    </div>
                                    <p className="text-[8px] opacity-70 mt-1">Recent Test Marks <span className="font-bold">233</span>/300</p>
                                </div>

                                {/* NEET */}
                                <div className="rounded-lg bg-gradient-to-b from-neet/90 to-neet p-3 text-white">
                                    <p className="text-[10px] font-bold text-white/90">NEET Results</p>
                                    <p className="text-[9px] opacity-80 mt-1">Estimated NEET Rank</p>
                                    <p className="text-2xl font-extrabold">{selectedStudent.neetPercentile}%</p>
                                    <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-bold mt-1">
                                        +19 Improvement
                                    </span>
                                    <p className="text-[9px] mt-1.5 opacity-80">Current Rank: <span className="font-bold">867</span></p>
                                    {/* Mini chart */}
                                    <div className="mt-1 flex items-end gap-px h-6">
                                        {[25, 35, 30, 50, 55, 65].map((h, i) => (
                                            <div key={i} className="flex-1 rounded-t bg-white/30" style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                    <div className="border-t border-white/20 mt-2 pt-1.5">
                                        <p className="text-[8px]">Rank Prediction: <span className="font-bold">95.5%</span></p>
                                        <p className="text-[8px] opacity-70">Top 3,000 Rank Possible</p>
                                    </div>
                                    <p className="text-[8px] opacity-70 mt-1">Recent Test Marks <span className="font-bold">635</span>/720</p>
                                </div>
                            </div>

                            {/* Focus Areas */}
                            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                                <p className="text-[10px] font-bold text-foreground flex items-center gap-1">💡 Focus Areas</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedStudent.weakTopics.slice(0, 2).map((t) => (
                                        <div key={t} className="rounded-md bg-card border border-border p-2">
                                            <p className="text-[10px] font-bold text-foreground flex items-center gap-1">
                                                ⚠️ {t}
                                            </p>
                                            <p className="text-[8px] text-muted-foreground mt-0.5">289 Points Below Top 1,000</p>
                                            <div className="mt-1.5 flex items-center gap-1">
                                                <span className="text-[7px] text-muted-foreground">Revise {t.substring(0, 8)}...</span>
                                                <button className="rounded bg-primary px-1.5 py-0.5 text-[7px] font-bold text-primary-foreground">
                                                    Practice Now
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-[10px] text-foreground">Keep up the good work! — Instructis Team</p>
                            <p className="text-[9px] text-muted-foreground text-right">9.37 am</p>
                        </div>

                        {/* Footer notifications */}
                        <div className="max-w-[320px] rounded-lg rounded-tl-none bg-card p-3 shadow-sm space-y-2">
                            <p className="text-[11px] text-foreground flex items-center gap-1.5">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-[8px] text-success-foreground font-bold">✓</span>
                                <strong>Notification sent via Instructis Alerts</strong>
                            </p>
                            <p className="text-[11px] text-foreground flex items-center gap-1.5">
                                💬 Have questions? Reply to <strong>chat with us</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Input bar */}
                    <div className="flex items-center gap-2 bg-card px-3 py-2 border-t border-border">
                        <Smile size={20} className="text-muted-foreground shrink-0" />
                        <div className="flex-1 rounded-full bg-muted px-3 py-1.5 text-[11px] text-muted-foreground">
                            Message
                        </div>
                        <Paperclip size={18} className="text-muted-foreground shrink-0" />
                        <Camera size={18} className="text-muted-foreground shrink-0" />
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white shrink-0">
                            <Mic size={14} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
