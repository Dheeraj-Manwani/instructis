import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn("GEMINI_API_KEY is not set. AI rank predictions will not work.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

export async function generateRankPrediction(
    input: RankPredictionInput
): Promise<RankPredictionAIResult> {
    if (!genAI) {
        throw new Error("Gemini client is not configured");
    }

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    });

    const prompt = `
You are an academic performance analyst for competitive exams in India (JEE / NEET).

Task:
- Analyze the student's previous mock test performance.
- Predict the *next* mock test total score and percentile.
- Explain your reasoning in a way that teachers and parents can understand.

Student: ${input.studentName}
Exam: ${input.examType}

History (oldest to newest):
${input.history
            .map(
                (h, idx) =>
                    `${idx + 1}. Test: ${h.testName} | Date: ${h.date} | Total Score: ${h.totalScore ?? "N/A"
                    } | Percentile: ${h.percentile ?? "N/A"}`
            )
            .join("\n")}

Return JSON only in this exact shape:
{
  "summary": "high-level 2-4 sentence overview for teacher",
  "nextScoreEstimate": {
    "expectedPercentile": 95.5,
    "expectedTotalScore": 210,
    "confidenceNote": "short sentence about confidence and assumptions"
  },
  "reasoning": "detailed reasoning with bullet-like structure in plain text"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    try {
        const parsed = JSON.parse(text) as RankPredictionAIResult;
        return parsed;
    } catch {
        // Fallback: wrap raw text
        return {
            summary: "AI analysis could not be parsed into structured JSON.",
            nextScoreEstimate: {
                expectedPercentile: null,
                expectedTotalScore: null,
                confidenceNote: "The model returned an unstructured response.",
            },
            reasoning: text,
        };
    }
}

