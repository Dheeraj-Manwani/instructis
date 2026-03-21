import React from "react";
import {
    Document,
    Image,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";

type SubjectBreakdown = {
    subject: string;
    total: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    marks: number;
    maxPossibleMarks: number;
};

type WeakTopic = {
    topic: string;
    count: number;
};

type QuestionItem = {
    orderIndex: number;
    subject: string;
    topic: string | null;
    questionText: string;
    yourAnswer: string;
    correctAnswer: string;
    status: "Correct" | "Incorrect";
    marksAwarded: number;
    explanation: string | null;
};

export type StudentReportPdfData = {
    examType: string;
    studentName: string;
    rollNo: string;
    batchName: string;
    testName: string;
    score: number | null;
    maxMarks: number;
    rank: number | null;
    accuracy: string | null;
    questionsAttempted: number;
    durationText: string;
    percentile: number | null;
    classAveragePercentile: number | null;
    highestPercentile: number | null;
    correctCount: number;
    incorrectCount: number;
    unattemptedCount: number;
    weakTopics: WeakTopic[];
    subjectBreakdown: SubjectBreakdown[];
    questions: QuestionItem[];
    generatedOn: string;
};

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#f4f6f5",
        padding: 0,
        fontFamily: "Helvetica",
        color: "#1e3b2c",
    },
    header: {
        backgroundColor: "#0a2e22",
        paddingTop: 28,
        paddingHorizontal: 32,
        paddingBottom: 24,
    },
    headerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    brandDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        backgroundColor: "#1D9E75",
    },
    logo: {
        height: 24,
        width: "auto",
    },
    brandText: {
        fontSize: 11,
        fontWeight: 600,
        color: "#527060",
    },
    examBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: "#3d2200",
        borderWidth: 1,
        borderColor: "#7a4400",
    },
    examBadgeText: {
        color: "#ff9747",
        fontSize: 11,
        fontWeight: 600,
    },
    headerBottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginTop: 20,
    },
    studentName: {
        fontSize: 26,
        fontWeight: 700,
        color: "#ffffff",
    },
    metaRow: {
        marginTop: 8,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
    },
    metaItem: {
        fontSize: 12,
        color: "#5a7a69",
    },
    metaValue: {
        color: "#b8d4c8",
        fontWeight: 500,
    },
    scoreRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "flex-end",
    },
    scoreMain: {
        fontFamily: "Courier",
        fontSize: 42,
        fontWeight: 500,
        color: "#1D9E75",
    },
    scoreMax: {
        marginLeft: 4,
        marginBottom: 6,
        fontSize: 18,
        color: "#4a6b5a",
    },
    scoreLabel: {
        marginTop: 2,
        textAlign: "right",
        fontSize: 11,
        color: "#6b8c7a",
    },
    infoBar: {
        backgroundColor: "#11392a",
        borderTopWidth: 1,
        borderTopColor: "#1a3d2e",
        paddingVertical: 12,
        paddingHorizontal: 32,
        flexDirection: "row",
        gap: 24,
    },
    infoItem: {
        flexDirection: "row",
        gap: 5,
    },
    infoLabel: {
        fontSize: 11,
        color: "#6b8c7a",
    },
    infoValue: {
        fontSize: 11,
        color: "#9bbdae",
        fontWeight: 500,
    },
    body: {
        paddingVertical: 24,
        paddingHorizontal: 32,
        gap: 20,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e4ebe8",
    },
    cardTitle: {
        fontSize: 11,
        fontWeight: 600,
        color: "#6b8f7c",
        textTransform: "uppercase",
        paddingTop: 14,
        paddingHorizontal: 18,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f4f2",
    },
    snapshotGrid: {
        flexDirection: "row",
    },
    snapshotCell: {
        width: "25%",
        paddingVertical: 16,
        paddingHorizontal: 14,
        borderRightWidth: 1,
        borderRightColor: "#f0f4f2",
    },
    snapshotCellLast: {
        borderRightWidth: 0,
    },
    snapshotLabel: {
        fontSize: 11,
        color: "#8aab98",
        marginBottom: 6,
    },
    snapshotValueMono: {
        fontFamily: "Courier",
        fontSize: 22,
        fontWeight: 500,
        color: "#0F6E56",
    },
    snapshotValueGreen: {
        fontSize: 22,
        fontWeight: 700,
        color: "#0F6E56",
    },
    snapshotValueRed: {
        fontSize: 22,
        fontWeight: 700,
        color: "#A32D2D",
    },
    snapshotValueMuted: {
        fontSize: 22,
        fontWeight: 700,
        color: "#8aab98",
    },
    twoCol: {
        flexDirection: "row",
        gap: 16,
    },
    halfCard: {
        width: "50%",
    },
    innerPadPercentile: {
        paddingVertical: 16,
        paddingHorizontal: 18,
        gap: 12,
    },
    pvRow: {
        gap: 6,
    },
    pvHead: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    pvLabel: {
        fontSize: 13,
        color: "#3a5c4d",
        fontWeight: 500,
    },
    pvValueGood: {
        fontFamily: "Courier",
        fontSize: 13,
        color: "#0F6E56",
        fontWeight: 500,
    },
    pvValueAvg: {
        fontFamily: "Courier",
        fontSize: 13,
        color: "#BA7517",
        fontWeight: 500,
    },
    progressTrack: {
        height: 6,
        borderRadius: 3,
        backgroundColor: "#eef3f1",
    },
    progressFillYou: {
        height: 6,
        backgroundColor: "#0F6E56",
    },
    progressFillAvg: {
        height: 6,
        backgroundColor: "#BA7517",
    },
    innerPadWeak: {
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 18,
        gap: 6,
    },
    weakRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#fff8f0",
        borderLeftWidth: 3,
        borderLeftColor: "#BA7517",
    },
    weakTopicText: {
        fontSize: 12,
        fontWeight: 500,
        color: "#3a5c4d",
    },
    weakCountText: {
        fontSize: 11,
        fontWeight: 500,
        color: "#BA7517",
    },
    weakEmpty: {
        fontSize: 12,
        color: "#8aab98",
    },
    subjectContainer: {
        paddingVertical: 12,
        paddingHorizontal: 18,
        gap: 12,
    },
    subjectRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    subjectName: {
        width: 80,
        flexShrink: 0,
        fontSize: 12,
        fontWeight: 500,
        color: "#3a5c4d",
    },
    subjectTrack: {
        flexGrow: 1,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#eef3f1",
    },
    subjectFillGood: {
        height: 8,
        backgroundColor: "#0F6E56",
    },
    subjectFillBad: {
        height: 8,
        backgroundColor: "#A32D2D",
    },
    pillBase: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    pillGood: {
        backgroundColor: "#d4f0e4",
    },
    pillGoodText: {
        fontSize: 10,
        fontWeight: 500,
        color: "#0F6E56",
    },
    pillWrong: {
        backgroundColor: "#fde8e8",
    },
    pillWrongText: {
        fontSize: 10,
        fontWeight: 500,
        color: "#A32D2D",
    },
    marksTextGood: {
        fontFamily: "Courier",
        fontSize: 12,
        color: "#0F6E56",
    },
    marksTextBad: {
        fontFamily: "Courier",
        fontSize: 12,
        color: "#A32D2D",
    },
    qBody: {
        paddingVertical: 12,
        paddingHorizontal: 18,
        gap: 8,
    },
    qItem: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#eef3f1",
    },
    qHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 8,
        paddingHorizontal: 12,
    },
    qNo: {
        fontSize: 10,
        fontWeight: 600,
        color: "#8aab98",
        textTransform: "uppercase",
    },
    qSubjTopic: {
        marginLeft: 8,
        fontSize: 10,
        color: "#8aab98",
        flexGrow: 1,
    },
    qStatusGood: {
        fontSize: 10,
        fontWeight: 600,
        color: "#0F6E56",
        backgroundColor: "#d4f0e4",
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    qStatusBad: {
        fontSize: 10,
        fontWeight: 600,
        color: "#A32D2D",
        backgroundColor: "#fde8e8",
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    qMarksGood: {
        marginLeft: 8,
        fontFamily: "Courier",
        fontSize: 11,
        color: "#0F6E56",
    },
    qMarksBad: {
        marginLeft: 8,
        fontFamily: "Courier",
        fontSize: 11,
        color: "#A32D2D",
    },
    qText: {
        paddingHorizontal: 12,
        paddingBottom: 8,
        fontSize: 12,
        color: "#1e3b2c",
        lineHeight: 1.5,
    },
    qAnswerWrap: {
        paddingTop: 6,
        paddingBottom: 10,
        paddingHorizontal: 12,
        backgroundColor: "#f9fbfa",
        borderTopWidth: 1,
        borderTopColor: "#eef3f1",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    qAnswerCol: {
        width: "48%",
    },
    qAnsLabel: {
        fontSize: 10,
        color: "#8aab98",
    },
    qAnsValGood: {
        marginTop: 2,
        fontSize: 11,
        fontWeight: 500,
        color: "#0F6E56",
    },
    qAnsValBad: {
        marginTop: 2,
        fontSize: 11,
        fontWeight: 500,
        color: "#A32D2D",
    },
    qDivider: {
        width: 1,
        alignSelf: "stretch",
        backgroundColor: "#eef3f1",
    },
    explanation: {
        backgroundColor: "#f0f9f6",
        paddingTop: 6,
        paddingBottom: 8,
        paddingHorizontal: 12,
    },
    explanationText: {
        fontSize: 11,
        color: "#2d6b56",
        lineHeight: 1.5,
    },
    explanationPrefix: {
        fontSize: 10,
        fontWeight: 600,
        color: "#0F6E56",
    },
    footer: {
        marginTop: 20,
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#e4ebe8",
        paddingVertical: 14,
        paddingHorizontal: 32,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerLeft: {
        fontSize: 11,
        fontWeight: 500,
        color: "#8aab98",
    },
    footerRight: {
        fontSize: 11,
        color: "#b8ccc4",
        fontFamily: "Courier",
    },
});

function clampToPercent(value: number | null | undefined) {
    if (value == null || Number.isNaN(value)) return 0;
    if (value < 0) return 0;
    if (value > 100) return 100;
    return value;
}

function sanitizeAnswer(value: string) {
    return value.trim().length > 0 ? value : "N/A";
}

function formatMarks(marks: number): string {
    const abs = Math.abs(marks);
    const val = abs % 1 === 0 ? String(abs) : abs.toFixed(1);
    if (marks > 0) return `+${val}`;
    if (marks < 0) return `-${val}`;
    return "0";
}

function formatMarksParts(marks: number): { sign: "" | "+" | "-"; value: string } {
    const text = formatMarks(marks);
    if (text.startsWith("+")) return { sign: "+", value: text.slice(1) };
    if (text.startsWith("-")) return { sign: "-", value: text.slice(1) };
    return { sign: "", value: text };
}

function formatPct(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return "N/A";
    return `${value.toFixed(1)}%`;
}

export default function StudentReportPdf({
    data,
    logoBase64,
}: {
    data: StudentReportPdfData;
    logoBase64: string | null;
}) {
    const percentileWidth = `${clampToPercent(data.percentile)}%`;
    const classAvgWidth = `${clampToPercent(data.classAveragePercentile)}%`;
    const highestWidth = `${clampToPercent(data.highestPercentile)}%`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <View style={styles.brandRow}>
                            {/* <View style={styles.brandDot} /> */}
                            {logoBase64 ? <Image src={logoBase64} style={styles.logo} /> : null}
                            <Text style={styles.brandText}>INSTRUCTIS</Text>
                        </View>
                        <View style={styles.examBadge}>
                            <Text style={styles.examBadgeText}>{data.examType}</Text>
                        </View>
                    </View>

                    <View style={styles.headerBottomRow}>
                        <View>
                            <Text style={styles.studentName}>{data.studentName}</Text>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaItem}>Roll No: <Text style={styles.metaValue}>{data.rollNo}</Text></Text>
                                <Text style={styles.metaItem}>Batch: <Text style={styles.metaValue}>{data.batchName}</Text></Text>
                                <Text style={styles.metaItem}>Test: <Text style={styles.metaValue}>{data.testName}</Text></Text>
                            </View>
                        </View>

                        <View>
                            <View style={styles.scoreRow}>
                                <Text style={styles.scoreMain}>{data.score ?? "N/A"}</Text>
                                <Text style={styles.scoreMax}> / {data.maxMarks}</Text>
                            </View>
                            <Text style={styles.scoreLabel}>TOTAL SCORE</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoBar}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Rank</Text>
                        <Text style={styles.infoValue}>{data.rank == null ? "N/A" : `#${data.rank}`}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Accuracy</Text>
                        <Text style={styles.infoValue}>{data.accuracy ?? "N/A"}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Questions attempted</Text>
                        <Text style={styles.infoValue}>{String(data.questionsAttempted)}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Duration</Text>
                        <Text style={styles.infoValue}>{data.durationText || "N/A"}</Text>
                    </View>
                </View>

                <View style={styles.body}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Performance Snapshot</Text>
                        <View style={styles.snapshotGrid}>
                            <View style={styles.snapshotCell}>
                                <Text style={styles.snapshotLabel}>Percentile</Text>
                                <Text style={styles.snapshotValueMono}>{formatPct(data.percentile)}</Text>
                            </View>
                            <View style={styles.snapshotCell}>
                                <Text style={styles.snapshotLabel}>Correct</Text>
                                <Text style={styles.snapshotValueGreen}>{data.correctCount}</Text>
                            </View>
                            <View style={styles.snapshotCell}>
                                <Text style={styles.snapshotLabel}>Incorrect</Text>
                                <Text style={styles.snapshotValueRed}>{data.incorrectCount}</Text>
                            </View>
                            <View style={[styles.snapshotCell, styles.snapshotCellLast]}>
                                <Text style={styles.snapshotLabel}>Unattempted</Text>
                                <Text style={styles.snapshotValueMuted}>{data.unattemptedCount}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.twoCol}>
                        <View style={[styles.card, styles.halfCard]}>
                            <Text style={styles.cardTitle}>Percentile vs class</Text>
                            <View style={styles.innerPadPercentile}>
                                <View style={styles.pvRow}>
                                    <View style={styles.pvHead}>
                                        <Text style={styles.pvLabel}>You</Text>
                                        <Text style={styles.pvValueGood}>{formatPct(data.percentile)}</Text>
                                    </View>
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFillYou, { width: percentileWidth }]} />
                                    </View>
                                </View>
                                <View style={styles.pvRow}>
                                    <View style={styles.pvHead}>
                                        <Text style={styles.pvLabel}>Class avg</Text>
                                        <Text style={styles.pvValueAvg}>
                                            {formatPct(data.classAveragePercentile)}
                                        </Text>
                                    </View>
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFillAvg, { width: classAvgWidth }]} />
                                    </View>
                                </View>
                                <View style={styles.pvRow}>
                                    <View style={styles.pvHead}>
                                        <Text style={styles.pvLabel}>Highest</Text>
                                        <Text style={styles.pvValueGood}>{formatPct(data.highestPercentile)}</Text>
                                    </View>
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFillYou, { width: highestWidth }]} />
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.card, styles.halfCard]}>
                            <Text style={styles.cardTitle}>Weak Topics</Text>
                            <View style={styles.innerPadWeak}>
                                {data.weakTopics.length > 0 ? (
                                    data.weakTopics.map((item) => (
                                        <View style={styles.weakRow} key={item.topic}>
                                            <Text style={styles.weakTopicText}>{item.topic}</Text>
                                            <Text style={styles.weakCountText}>{item.count} incorrect</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.weakEmpty}>No weak topics identified.</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Subject-wise Breakdown</Text>
                        <View style={styles.subjectContainer}>
                            {data.subjectBreakdown.map((subject) => {
                                const hasPositive = subject.marks > 0;
                                const denominator = subject.maxPossibleMarks > 0 ? subject.maxPossibleMarks : 1;
                                const rawPercent = (Math.abs(subject.marks) / denominator) * 100;
                                const width = `${Math.max(3, Math.min(100, rawPercent))}%`;
                                const subjectMarks = formatMarksParts(subject.marks);
                                return (
                                    <View style={styles.subjectRow} key={subject.subject}>
                                        <Text style={styles.subjectName}>{subject.subject}</Text>
                                        <View style={styles.subjectTrack}>
                                            <View style={hasPositive ? [styles.subjectFillGood, { width }] : [styles.subjectFillBad, { width }]} />
                                        </View>
                                        <View style={[styles.pillBase, styles.pillGood]}>
                                            <Text style={styles.pillGoodText}>{subject.correct}/{subject.total}</Text>
                                        </View>
                                        {subject.incorrect > 0 ? (
                                            <View style={[styles.pillBase, styles.pillWrong]}>
                                                <Text style={styles.pillWrongText}>{subject.incorrect}</Text>
                                            </View>
                                        ) : null}
                                        <Text style={hasPositive ? styles.marksTextGood : styles.marksTextBad}>
                                            {subjectMarks.sign ? <Text>{subjectMarks.sign}</Text> : null}
                                            <Text>{subjectMarks.value}</Text>
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Question-wise Review</Text>
                        <View style={styles.qBody}>
                            {data.questions.map((q) => {
                                const qMarks = formatMarksParts(q.marksAwarded);
                                return (
                                    <View style={styles.qItem} key={`${q.orderIndex}-${q.subject}-${q.questionText.slice(0, 10)}`}>
                                        <View style={styles.qHeader}>
                                            <Text style={styles.qNo}>Q{q.orderIndex}</Text>
                                            <Text style={styles.qSubjTopic}>
                                                {q.subject} · {q.topic ?? "Unknown"}
                                            </Text>
                                            <Text style={q.status === "Correct" ? styles.qStatusGood : styles.qStatusBad}>{q.status}</Text>
                                            <Text style={q.marksAwarded >= 0 ? styles.qMarksGood : styles.qMarksBad}>
                                                {qMarks.sign ? <Text>{qMarks.sign}</Text> : null}
                                                <Text>{qMarks.value}</Text>
                                            </Text>
                                        </View>
                                        <Text style={styles.qText}>{q.questionText}</Text>
                                        <View style={styles.qAnswerWrap}>
                                            <View style={styles.qAnswerCol}>
                                                <Text style={styles.qAnsLabel}>Your answer</Text>
                                                <Text style={q.status === "Correct" ? styles.qAnsValGood : styles.qAnsValBad}>
                                                    {sanitizeAnswer(q.yourAnswer)}
                                                </Text>
                                            </View>
                                            <View style={styles.qDivider} />
                                            <View style={styles.qAnswerCol}>
                                                <Text style={styles.qAnsLabel}>Correct</Text>
                                                <Text style={styles.qAnsValGood}>{sanitizeAnswer(q.correctAnswer)}</Text>
                                            </View>
                                        </View>
                                        {q.explanation ? (
                                            <View style={styles.explanation}>
                                                <Text style={styles.explanationText}>
                                                    <Text style={styles.explanationPrefix}>Explanation · </Text>
                                                    {q.explanation}
                                                </Text>
                                            </View>
                                        ) : null}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>

                <View style={styles.footer} fixed>
                    <Text style={styles.footerLeft}>INSTRUCTIS · STUDENT REPORT</Text>
                    <Text style={styles.footerRight}>Generated {data.generatedOn}</Text>
                </View>
            </Page>
        </Document>
    );
}
