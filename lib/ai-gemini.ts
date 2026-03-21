import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. AI rank predictions will not work.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// gemini-2.5-flash-lite has the highest free-tier RPM (30 RPM).
// gemini-2.5-flash is the smarter fallback (5-15 RPM).
// gemini-2.0-flash is the stable last-resort.
const GEMINI_MODEL_FALLBACKS = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
] as const;

const RETRY_CONFIG = {
    maxRetries: 3,
    baseDelayMs: 3000,
    maxDelayMs: 20000,
} as const;

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isModelNotFoundError(message: string) {
    return (
        message.includes("404") ||
        message.includes("is not found for API version") ||
        message.includes("not supported for generateContent")
    );
}

function isRateLimitError(message: string) {
    return (
        message.includes("429") ||
        message.includes("Too Many Requests") ||
        message.includes("Quota exceeded") ||
        message.includes("rate-limits") ||
        message.includes("RESOURCE_EXHAUSTED")
    );
}

function parseRetryDelayMs(message: string, attempt: number): number {
    // Honour the server's "retry after N seconds" hint if present
    const fromSeconds = message.match(/Please retry in\s+([\d.]+)s/i);
    if (fromSeconds?.[1]) {
        const seconds = Number(fromSeconds[1]);
        if (!Number.isNaN(seconds) && seconds > 0) {
            return Math.min(Math.ceil(seconds * 1000), RETRY_CONFIG.maxDelayMs);
        }
    }
    // Exponential backoff: 3s → 6s → 12s …
    const backoff = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
    return Math.min(backoff, RETRY_CONFIG.maxDelayMs);
}

async function callModelWithRetry(modelName: string, prompt: string): Promise<string> {
    if (!genAI) throw new Error("Gemini client is not configured");

    const model = genAI.getGenerativeModel({ model: modelName });

    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            // Model doesn't exist — tell caller to try next model immediately
            if (isModelNotFoundError(message)) {
                throw Object.assign(new Error(message), { isModelNotFound: true });
            }

            // Rate limited — backoff and retry (same model)
            if (isRateLimitError(message)) {
                if (attempt === RETRY_CONFIG.maxRetries) throw error;
                const delayMs = parseRetryDelayMs(message, attempt);
                console.warn(
                    `[Gemini] Rate limit on ${modelName} (attempt ${attempt + 1}). Retrying in ${delayMs}ms…`
                );
                await sleep(delayMs);
                continue;
            }

            // Any other error — surface immediately, don't waste retries
            throw error;
        }
    }

    throw new Error(`[Gemini] All ${RETRY_CONFIG.maxRetries} retries exhausted for ${modelName}`);
}

async function generateWithModelFallback(prompt: string): Promise<string> {
    let lastError: unknown = null;

    for (const modelName of GEMINI_MODEL_FALLBACKS) {
        try {
            return await callModelWithRetry(modelName, prompt);
        } catch (error) {
            lastError = error;
            const isNotFound = (error as { isModelNotFound?: boolean }).isModelNotFound === true;
            if (isNotFound) {
                console.warn(`[Gemini] Model ${modelName} not found, trying next…`);
                continue; // try next model in the list
            }
            // Rate limit exhausted across all retries on this model — try next
            const message = error instanceof Error ? error.message : String(error);
            if (isRateLimitError(message)) {
                console.warn(`[Gemini] Rate limit exhausted on ${modelName}, trying next model…`);
                continue;
            }
            // Unexpected error — rethrow
            throw error;
        }
    }

    throw lastError instanceof Error
        ? lastError
        : new Error("No supported Gemini model is available");
}

function sanitizeJson(raw: string): string {
    // Strip markdown code fences that models sometimes wrap JSON in
    return raw.replace(/^```(?:json)?\s*|```\s*$/gim, "").trim();
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type RankPredictionInput = {
    studentName: string;
    examType: "JEE" | "NEET";
    history: Array<{
        testName: string;
        date: string;
        totalScore: number | null;
        percentile: number | null;
    }>;
};

export type RankPredictionAIResult = {
    summary: string;
    nextScoreEstimate: {
        expectedPercentile: number | null;
        expectedTotalScore: number | null;
        confidenceNote: string;
    };
    reasoning: string;
};

export type StudentRankWeakAreaInput = {
    id: string;
    topicName: string;
    subject: string;
    drawbackPoints: number;
    priority: string;
};

export type StudentRankPredictionInput = {
    studentName: string;
    targetExam: "JEE" | "NEET";
    latestPercentiles: {
        JEE: number | null;
        NEET: number | null;
    };
    marksHistory: Array<{
        testName: string;
        examType: "JEE" | "NEET";
        subject: string;
        marksObtained: number;
        maxMarks: number;
        percentile: number | null;
        improvement: number | null;
        createdAt: string;
    }>;
    weakAreas: StudentRankWeakAreaInput[];
    previousPredictions: Array<{
        examType: "JEE" | "NEET";
        percentile: number;
        predictedRank: number;
        improvementPts: number;
        createdAt: string;
    }>;
};

export type StudentRankPredictionAIResult = {
    predictedRankRange: {
        JEE: string | null;
        NEET: string | null;
    };
    targetPercentileNeeded: {
        top1000: number;
        top3000: number;
    };
    percentileBandRankEstimate: {
        p95To99: string;
        p90To95: string;
    };
    improvementPointsForNextBand: string[];
    weakAreaRecommendations: Array<{
        topicId: string;
        topicName: string;
        subject: string;
        studyFocus: string;
        practiceQuestionCount: number;
        resourceTypeSuggestion:
        | "revise formula"
        | "watch video"
        | "solve previous year questions";
    }>;
    overallImprovementTip: string;
    recommendationCards: {
        practice: string;
        videoOrRevision: string;
        formulaRevision: string;
    };
    trendStatus: "improving" | "stagnant" | "declining";
};

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateRankPrediction(
    input: RankPredictionInput
): Promise<RankPredictionAIResult> {
    if (!genAI) {
        throw new Error("Gemini client is not configured");
    }

    const prompt = `You are an academic performance analyst for competitive exams in India (JEE / NEET).

Task:
- Analyze the student's previous mock test performance.
- Predict the next mock test total score and percentile.
- Explain your reasoning in a way that teachers and parents can understand.

Student: ${input.studentName}
Exam: ${input.examType}

History (oldest to newest):
${input.history
            .map(
                (h, idx) =>
                    `${idx + 1}. Test: ${h.testName} | Date: ${h.date} | Total Score: ${h.totalScore ?? "N/A"} | Percentile: ${h.percentile ?? "N/A"}`
            )
            .join("\n")}

Return ONLY valid JSON, no markdown, no explanation, in this exact shape:
{
  "summary": "high-level 2-4 sentence overview for teacher",
  "nextScoreEstimate": {
    "expectedPercentile": 95.5,
    "expectedTotalScore": 210,
    "confidenceNote": "short sentence about confidence and assumptions"
  },
  "reasoning": "detailed reasoning with bullet-like structure in plain text"
}`;

    try {
        const text = await generateWithModelFallback(prompt);
        const parsed = JSON.parse(sanitizeJson(text)) as RankPredictionAIResult;
        return parsed;
    } catch (parseError) {
        // If JSON parse fails but we got text back, wrap it gracefully
        const rawText = parseError instanceof SyntaxError ? "" : String(parseError);
        return {
            summary: rawText
                ? "AI analysis could not be parsed into structured JSON."
                : "Live AI prediction is temporarily unavailable. Showing fallback estimate.",
            nextScoreEstimate: {
                expectedPercentile: input.history.at(-1)?.percentile ?? null,
                expectedTotalScore: input.history.at(-1)?.totalScore ?? null,
                confidenceNote: "Fallback estimate — AI quota may be exhausted.",
            },
            reasoning: rawText || "Continue regular mock tests and detailed error analysis.",
        };
    }
}

export async function generateStudentRankPrediction(
    input: StudentRankPredictionInput
): Promise<StudentRankPredictionAIResult> {
    if (!genAI) {
        throw new Error("Gemini client is not configured");
    }

    const prompt = `You are an academic performance analyst for Indian competitive exams (JEE/NEET).
Return ONLY strict JSON — no markdown, no preamble, no trailing text.

Student profile:
- Name: ${input.studentName}
- Target exam: ${input.targetExam}
- Latest percentiles: JEE=${input.latestPercentiles.JEE ?? "N/A"}, NEET=${input.latestPercentiles.NEET ?? "N/A"}

Marks history:
${JSON.stringify(input.marksHistory, null, 2)}

Weak areas:
${JSON.stringify(input.weakAreas, null, 2)}

Previous predictions:
${JSON.stringify(input.previousPredictions, null, 2)}

Return JSON in EXACT shape:
{
  "predictedRankRange": {
    "JEE": "e.g. 2500-3400 or null if insufficient data",
    "NEET": "e.g. 1800-2600 or null if insufficient data"
  },
  "targetPercentileNeeded": {
    "top1000": 98.9,
    "top3000": 96.8
  },
  "percentileBandRankEstimate": {
    "p95To99": "expected rank range text",
    "p90To95": "expected rank range text"
  },
  "improvementPointsForNextBand": ["short point 1", "short point 2", "short point 3"],
  "weakAreaRecommendations": [
    {
      "topicId": "must match input topic id",
      "topicName": "topic name",
      "subject": "subject name",
      "studyFocus": "specific focus recommendation",
      "practiceQuestionCount": 25,
      "resourceTypeSuggestion": "revise formula"
    }
  ],
  "overallImprovementTip": "2-3 sentences personalized to trend",
  "recommendationCards": {
    "practice": "one concise recommendation",
    "videoOrRevision": "one concise recommendation",
    "formulaRevision": "one concise recommendation"
  },
  "trendStatus": "improving"
}

Rules:
- trendStatus must be exactly one of: improving, stagnant, declining
- resourceTypeSuggestion must be exactly one of: revise formula, watch video, solve previous year questions
- Include a recommendation for every weak area topic supplied
- Language must be concise, actionable, and student-friendly`;

    try {
        const text = await generateWithModelFallback(prompt);
        const parsed = JSON.parse(sanitizeJson(text)) as StudentRankPredictionAIResult;
        return parsed;
    } catch {
        // Safe quota-exhaustion fallback
        const latestTargetPercentile =
            input.targetExam === "JEE"
                ? input.latestPercentiles.JEE
                : input.latestPercentiles.NEET;
        const safePercentile = Math.max(0, Math.min(100, latestTargetPercentile ?? 0));
        const estimatedRank = Math.max(1, Math.round(((100 - safePercentile) / 100) * 100_000));

        return {
            predictedRankRange: {
                JEE: input.latestPercentiles.JEE != null
                    ? `${estimatedRank}-${estimatedRank + 1200}`
                    : null,
                NEET: input.latestPercentiles.NEET != null
                    ? `${estimatedRank}-${estimatedRank + 1200}`
                    : null,
            },
            targetPercentileNeeded: { top1000: 98.9, top3000: 96.8 },
            percentileBandRankEstimate: {
                p95To99: "Approx. top 1,000–5,000 (varies by difficulty)",
                p90To95: "Approx. top 5,000–20,000 (varies by difficulty)",
            },
            improvementPointsForNextBand: [
                "Increase weekly mock-test consistency and detailed error review.",
                "Prioritize high-frequency weak topics with timed practice.",
                "Track careless errors separately and reduce them test by test.",
            ],
            weakAreaRecommendations: input.weakAreas.map((wa) => ({
                topicId: wa.id,
                topicName: wa.topicName,
                subject: wa.subject,
                studyFocus: `Revise fundamentals and solve 20-30 focused questions for ${wa.topicName}.`,
                practiceQuestionCount: 25,
                resourceTypeSuggestion: "solve previous year questions" as const,
            })),
            overallImprovementTip:
                "Live AI prediction is temporarily rate-limited. Continue regular mock tests and focused weak-area practice for steady rank improvement.",
            recommendationCards: {
                practice: "Practice 20-30 targeted questions daily from weak areas.",
                videoOrRevision: "Use short revision videos for concepts missed repeatedly.",
                formulaRevision: "Create a one-page formula/reaction sheet and revise every day.",
            },
            trendStatus: "stagnant",
        };
    }
}