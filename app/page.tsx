import Link from "next/link";
import { ArrowRight, BarChart3, Brain, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4">
      <div className="flex max-w-2xl flex-col items-center text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          <span className="text-primary">Instructis</span>
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">
          The all-in-one analytics dashboard for coaching institutes. Upload
          marks, analyse performance, predict ranks, and keep parents in the
          loop — effortlessly.
        </p>

        <div className="mt-10 grid w-full max-w-lg grid-cols-3 gap-4 text-sm">
          <Feature icon={Upload} label="Marks Upload" />
          <Feature icon={BarChart3} label="Analytics" />
          <Feature icon={Brain} label="AI Predictor" />
        </div>

        <div className="mt-10 flex gap-3">
          <Button size="lg" asChild>
            <Link href="/marks" className="gap-2">
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof Upload; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4">
      <Icon className="h-6 w-6 text-primary" />
      <span className="font-medium text-foreground">{label}</span>
    </div>
  );
}
