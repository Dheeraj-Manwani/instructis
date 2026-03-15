import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface CardSkeletonProps {
    showHeader?: boolean
    lines?: number
}

export function CardSkeleton({
    showHeader = true,
    lines = 3,
}: CardSkeletonProps) {
    return (
        <Card>
            {showHeader && (
                <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
            )}
            <CardContent className="space-y-3">
                {Array.from({ length: lines }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="h-4"
                        style={{
                            width: `${Math.random() * 30 + 70}%`,
                        }}
                    />
                ))}
            </CardContent>
        </Card>
    )
}
