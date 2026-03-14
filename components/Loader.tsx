import { cn } from "@/lib/utils";

type LoaderSize = "sm" | "md" | "lg";

const sizeClasses: Record<LoaderSize, string> = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-4",
  lg: "h-12 w-12 border-4",
};

interface LoaderProps {
  /** Size of the spinner */
  size?: LoaderSize;
  /** Optional label for screen readers */
  label?: string;
  /** Extra class for the spinner element */
  className?: string;
}

export function Loader({ size = "md", label = "Loading", className }: LoaderProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "animate-spin rounded-full border-primary border-t-transparent",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface PageLoaderProps {
  /** Size of the spinner */
  size?: LoaderSize;
  /** Optional label for screen readers */
  label?: string;
  /** Extra class for the wrapper (e.g. min-h-screen) */
  className?: string;
}

/** Full-page centered loader for auth, dashboard, etc. */
export function PageLoader({ size = "md", label = "Loading", className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-svh items-center justify-center bg-background",
        className
      )}
      aria-busy
      aria-label={label}
    >
      <Loader size={size} label={label} />
    </div>
  );
}
