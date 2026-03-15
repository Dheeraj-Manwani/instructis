"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends React.ComponentProps<"div"> {
    delay?: number
    hover?: boolean
}

export function AnimatedCard({
    children,
    className,
    delay = 0,
    hover = true,
    ...props
}: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
        >
            <Card className={cn("transition-shadow duration-200", className)} {...props}>
                {children}
            </Card>
        </motion.div>
    )
}
