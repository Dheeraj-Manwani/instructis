"use client";

import { AuthFormShell } from "../auth-form-shell";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { signInSchema, SignInValues } from "@/lib/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

const inputClass =
  "h-10 rounded-lg border border-border/60 bg-muted/50 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800/70 dark:placeholder:text-zinc-400 dark:focus-visible:bg-zinc-900";

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect");

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit({ email, password, rememberMe }: SignInValues) {
    setError(null);
    setLoading(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Something went wrong");
    } else {
      toast.success("Signed in successfully");
      router.push(redirect ?? "/");
    }
  }

  async function handleSocialSignIn(provider: "google") {
    setError(null);
    setLoading(true);

    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: redirect ?? "/",
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Something went wrong");
    }
  }

  return (
    <AuthFormShell>
      <div className="mx-auto w-full max-w-[360px]">
        <h2 className="font-semibold text-foreground text-xl sm:text-2xl">
          Welcome back 👋
        </h2>
        <p className="mt-1.5 text-muted-foreground text-sm">
          Login to{" "}
          <span className="font-semibold text-primary">Instructis</span> and
          continue your learning journey.
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-6 h-10 w-full gap-2 rounded-lg border-border bg-background font-medium text-foreground hover:bg-muted/50 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 dark:hover:bg-zinc-800"
          disabled={loading}
          onClick={() => handleSocialSignIn("google")}
        >
          <GoogleIcon width="0.98em" height="1em" />
          Sign in with Google
        </Button>

        <div className="relative my-6">
          <span className="bg-card text-muted-foreground absolute inset-0 flex items-center justify-center text-xs dark:bg-zinc-900 dark:text-zinc-400">
            <span className="bg-card px-2 dark:bg-zinc-900">OR</span>
          </span>
          <div className="h-px bg-border dark:bg-zinc-700" />
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-foreground text-sm font-medium">
                      Password
                    </FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-muted-foreground hover:text-primary text-xs underline-offset-4 hover:underline dark:text-zinc-400"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="rounded border-border dark:border-zinc-600 data-[state=checked]:dark:border-primary"
                    />
                  </FormControl>
                  <FormLabel className="mt-0! cursor-pointer text-muted-foreground text-sm font-normal dark:text-zinc-300">
                    Remember me
                  </FormLabel>
                </FormItem>
              )}
            />

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive text-sm"
              >
                {error}
              </div>
            )}

            <LoadingButton
              type="submit"
              className="h-10 w-full rounded-lg font-medium"
              loading={loading}
            >
              Log in
            </LoadingButton>
          </form>
        </Form>

        <p className="text-muted-foreground mt-6 text-center text-sm dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthFormShell>
  );
}
