"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    fetchPracticeScreen,
    startPracticeSession,
    submitPracticeAnswer,
    type PracticeWeakAreaItem,
} from "@/lib/api/practice";

type AnswerFeedback = {
    isCorrect: boolean;
    correctOptionId: string | null;
    explanation: string | null;
    marksAwarded: number;
};

function priorityClass(priority: PracticeWeakAreaItem["priority"]): string {
    if (priority === "HIGH") return "bg-destructive/10 text-destructive border-destructive/30";
    if (priority === "MEDIUM") return "bg-amber-500/10 text-amber-700 border-amber-600/30";
    return "bg-green-700/10 text-green-700 border-green-700/30";
}

function getMotivation(accuracy: number): string {
    if (accuracy > 80) return "Excellent!";
    if (accuracy >= 50) return "Good effort, keep practicing";
    return "This topic needs more attention";
}

export default function PracticePage() {
    const params = useSearchParams();
    const queryTopicId = params.get("topicId") ?? undefined;
    const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>(queryTopicId);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string>("");
    const [numericalAnswer, setNumericalAnswer] = useState<string>("");
    const [feedbackByQuestionId, setFeedbackByQuestionId] = useState<Record<string, AnswerFeedback>>({});
    const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());
    const [attemptId, setAttemptId] = useState<string | null>(null);

    const practiceQuery = useQuery({
        queryKey: ["practice-screen", selectedTopicId ?? "default"],
        queryFn: () => fetchPracticeScreen(selectedTopicId),
        placeholderData: (previousData) => previousData,
    });

    const startSessionMutation = useMutation({
        mutationFn: (topicId?: string) => startPracticeSession(topicId === "all" ? undefined : topicId),
        onSuccess: (data) => setAttemptId(data.attemptId),
    });

    const submitAnswerMutation = useMutation({
        mutationFn: (payload: {
            attemptId: string;
            questionId: string;
            selectedOptionId?: string;
            numericalAnswer?: number;
        }) => submitPracticeAnswer(payload),
        onSuccess: (response) => {
            const current = currentQuestion;
            if (!current) return;

            setFeedbackByQuestionId((prev) => ({
                ...prev,
                [current.id]: response,
            }));
            setAnsweredQuestionIds((prev) => new Set(prev).add(current.id));

            if (response.isCorrect) {
                toast.success("Correct! +4 marks");
            } else {
                toast.error("Incorrect");
            }
        },
        onError: (error: Error) => toast.error(error.message),
    });

    useEffect(() => {
        if (!practiceQuery.data) return;
        if (!selectedTopicId && practiceQuery.data.selectedTopicId) {
            setSelectedTopicId(practiceQuery.data.selectedTopicId);
            return;
        }
        setCurrentIndex(0);
        setSelectedOptionId("");
        setNumericalAnswer("");
        setFeedbackByQuestionId({});
        setAnsweredQuestionIds(new Set());
        setAttemptId(null);
        startSessionMutation.mutate(selectedTopicId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [practiceQuery.data?.selectedTopicId, selectedTopicId]);

    const weakAreas = practiceQuery.data?.weakAreas ?? [];
    const questions = practiceQuery.data?.questions ?? [];
    const currentQuestion = questions[currentIndex] ?? null;
    const currentFeedback = currentQuestion ? feedbackByQuestionId[currentQuestion.id] : null;
    const totalQuestions = questions.length;
    const answeredCount = answeredQuestionIds.size;
    const progressValue = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    const isCurrentAnswered = !!(currentQuestion && feedbackByQuestionId[currentQuestion.id]);
    const correctCount = useMemo(
        () => Object.values(feedbackByQuestionId).filter((f) => f.isCorrect).length,
        [feedbackByQuestionId]
    );
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const isSessionComplete = totalQuestions > 0 && answeredCount >= totalQuestions;
    const isRightPanelLoading = practiceQuery.isFetching;

    const canSubmit =
        !!attemptId &&
        !!currentQuestion &&
        (currentQuestion.type === "NUMERICAL"
            ? numericalAnswer.trim().length > 0
            : selectedOptionId.length > 0) &&
        !isCurrentAnswered;

    function resetSession() {
        setCurrentIndex(0);
        setSelectedOptionId("");
        setNumericalAnswer("");
        setFeedbackByQuestionId({});
        setAnsweredQuestionIds(new Set());
        setAttemptId(null);
        startSessionMutation.mutate(selectedTopicId);
    }

    function loadTopic(topicId: string | undefined) {
        setSelectedTopicId(topicId);
    }

    function loadNextWeakTopic() {
        const currentIdx = weakAreas.findIndex((wa) => wa.topicId === selectedTopicId);
        const next = weakAreas.slice(currentIdx + 1).find((wa) => wa.availablePracticeQuestions > 0);
        if (next) {
            loadTopic(next.topicId);
        } else {
            toast("No more weak topics with available practice questions");
        }
    }

    function onSubmitAnswer() {
        if (!currentQuestion || !attemptId) return;
        submitAnswerMutation.mutate({
            attemptId,
            questionId: currentQuestion.id,
            selectedOptionId:
                currentQuestion.type === "NUMERICAL" ? undefined : selectedOptionId,
            numericalAnswer:
                currentQuestion.type === "NUMERICAL" ? Number(numericalAnswer) : undefined,
        });
    }

    return (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-semibold text-foreground">Weak Areas</h2>
                <div className="mt-3 space-y-2">
                    {weakAreas.map((wa) => {
                        const active = selectedTopicId === wa.topicId;
                        const disabled = wa.availablePracticeQuestions === 0;
                        return (
                            <button
                                key={wa.id}
                                type="button"
                                disabled={disabled}
                                onClick={() => loadTopic(wa.topicId)}
                                className={cn(
                                    "w-full rounded-md border p-3 text-left transition",
                                    active
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/40",
                                    disabled && "cursor-not-allowed opacity-50"
                                )}
                            >
                                <p className="text-sm font-medium text-foreground">{wa.topicName}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <Badge variant="outline">{wa.subject}</Badge>
                                    <Badge variant="outline" className={priorityClass(wa.priority)}>
                                        {wa.priority}
                                    </Badge>
                                    <Badge variant="outline" className="text-destructive border-destructive/30">
                                        -{wa.drawbackPoints.toFixed(1)}
                                    </Badge>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {wa.availablePracticeQuestions} practice questions
                                </p>
                            </button>
                        );
                    })}
                </div>

                {weakAreas.length > 0 && (
                    <div className="mt-4 border-t border-border pt-3">
                        <button
                            type="button"
                            onClick={() => loadTopic("all")}
                            className={cn(
                                "w-full rounded-md border p-3 text-left text-sm transition",
                                selectedTopicId === "all"
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/40"
                            )}
                        >
                            All Topics
                        </button>
                    </div>
                )}
            </aside>

            <section className="rounded-lg border border-border bg-card p-5">
                {isRightPanelLoading ? (
                    <p className="text-sm text-muted-foreground">Loading practice session...</p>
                ) : weakAreas.length === 0 ? (
                    <div className="flex min-h-[320px] items-center justify-center text-center">
                        <p className="max-w-xl text-sm text-muted-foreground">
                            No weak areas identified yet. Complete a test with question-wise data to get personalized practice recommendations.
                        </p>
                    </div>
                ) : totalQuestions === 0 ? (
                    <div className="flex min-h-[320px] items-center justify-center text-center">
                        <p className="max-w-xl text-sm text-muted-foreground">
                            Practice questions for this topic are being added. Check back soon.
                        </p>
                    </div>
                ) : isSessionComplete ? (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-foreground">Session Complete</h3>
                        <div className="rounded-md border border-border p-4">
                            <p className="text-sm text-muted-foreground">
                                Topic:{" "}
                                <span className="font-medium text-foreground">
                                    {selectedTopicId === "all"
                                        ? "All Topics"
                                        : weakAreas.find((wa) => wa.topicId === selectedTopicId)?.topicName ?? "Topic"}
                                </span>
                            </p>
                            <p className="mt-2 text-sm text-foreground">
                                Score: <span className="font-semibold">{correctCount}</span> / {totalQuestions}
                            </p>
                            <p className="text-sm text-foreground">
                                Accuracy: <span className="font-semibold">{accuracy.toFixed(1)}%</span>
                            </p>
                            <p className="mt-2 text-sm font-medium text-primary">{getMotivation(accuracy)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={resetSession}>Practice Again</Button>
                            <Button variant="outline" onClick={loadNextWeakTopic}>
                                Next Weak Topic
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">
                                    {selectedTopicId === "all"
                                        ? "All Topics"
                                        : currentQuestion?.topicName ?? "Topic Practice"}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {currentQuestion?.subject} • {totalQuestions} questions available
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={resetSession}>
                                Start Fresh
                            </Button>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Question {currentIndex + 1} of {totalQuestions}
                            </p>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${progressValue}%` }}
                                />
                            </div>
                        </div>

                        <div className="rounded-md border border-border p-4">
                            <p className="whitespace-pre-wrap text-sm text-foreground">{currentQuestion?.text}</p>
                        </div>

                        {currentQuestion?.type === "NUMERICAL" ? (
                            <Input
                                placeholder="Enter numerical answer"
                                value={numericalAnswer}
                                onChange={(e) => setNumericalAnswer(e.target.value)}
                                disabled={isCurrentAnswered}
                            />
                        ) : (
                            <div className="space-y-2">
                                {(currentQuestion?.options ?? []).map((opt, index) => {
                                    const optionLabel = String.fromCharCode(65 + index);
                                    const isSelected = selectedOptionId === opt.id;
                                    const submitted = !!currentFeedback;
                                    const isCorrectOption = currentFeedback?.correctOptionId === opt.id;
                                    const isWrongSelected =
                                        submitted && isSelected && !currentFeedback?.isCorrect;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            disabled={submitted}
                                            onClick={() => setSelectedOptionId(opt.id)}
                                            className={cn(
                                                "w-full rounded-md border px-3 py-2 text-left text-sm transition",
                                                isSelected
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border hover:border-primary/50",
                                                submitted && isCorrectOption && "border-green-700 bg-green-700/10",
                                                submitted && isWrongSelected && "border-destructive bg-destructive/10"
                                            )}
                                        >
                                            <span className="mr-2 font-semibold">{optionLabel}.</span>
                                            {opt.text}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {!currentFeedback && (
                            <Button
                                onClick={onSubmitAnswer}
                                disabled={!canSubmit || submitAnswerMutation.isPending}
                            >
                                Submit Answer
                            </Button>
                        )}

                        {currentFeedback && (
                            <div className="space-y-3">
                                <div
                                    className={cn(
                                        "rounded-md border px-3 py-2 text-sm font-medium",
                                        currentFeedback.isCorrect
                                            ? "border-green-700/30 bg-green-700/10 text-green-700"
                                            : "border-destructive/30 bg-destructive/10 text-destructive"
                                    )}
                                >
                                    {currentFeedback.isCorrect ? "Correct! +4 marks" : "Incorrect"}
                                </div>

                                <div className="rounded-md border border-border bg-muted/30 p-3">
                                    <p className="text-xs font-semibold text-foreground">Explanation</p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                                        {currentFeedback.explanation ?? "Explanation will be added soon."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        onClick={() => {
                                            setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions));
                                            setSelectedOptionId("");
                                            setNumericalAnswer("");
                                        }}
                                    >
                                        Next Question
                                    </Button>
                                    <Button variant="outline" onClick={loadNextWeakTopic}>
                                        Skip Topic
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
