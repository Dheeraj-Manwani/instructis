"use client"

import { motion, type HTMLMotionProps, type Variants } from "motion/react"
import { type ReactNode } from "react"

// Common animation variants
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
}

export const slideUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
}

export const slideDown: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
}

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
}

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
}

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
}

// Animation wrapper components
interface AnimateProps extends HTMLMotionProps<"div"> {
    children: ReactNode
    variant?: "fadeIn" | "slideUp" | "slideDown" | "scaleIn"
    delay?: number
    duration?: number
}

export function Animate({
    children,
    variant = "fadeIn",
    delay = 0,
    duration = 0.3,
    className,
    ...props
}: AnimateProps) {
    const variants = {
        fadeIn,
        slideUp,
        slideDown,
        scaleIn,
    }[variant]

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{ duration, delay }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

interface StaggerProps extends HTMLMotionProps<"div"> {
    children: ReactNode
    className?: string
}

export function Stagger({ children, className, ...props }: StaggerProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({
    children,
    className,
    ...props
}: HTMLMotionProps<"div">) {
    return (
        <motion.div variants={staggerItem} className={className} {...props}>
            {children}
        </motion.div>
    )
}

// Page transition wrapper
export function PageTransition({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
