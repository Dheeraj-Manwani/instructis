"use client";

import { useSearchParams } from "next/navigation";

export default function PracticePage() {
    const params = useSearchParams();
    const topicId = params.get("topicId");

    return (
        <div className="rounded-lg border border-border bg-card p-6">
            <h1 className="text-lg font-bold text-foreground">Practice</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Practice route placeholder. Selected topic id:{" "}
                <span className="font-mono text-foreground">{topicId ?? "N/A"}</span>
            </p>
        </div>
    );
}
