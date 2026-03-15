"use client";

import { AuthFormShell } from "../auth-form-shell";
import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
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
import { signUpSchema, SignUpValues } from "@/lib/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

const inputClass =
  "h-10 rounded-lg border border-border/60 bg-muted/50 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20";

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit({ email, password, name }: SignUpValues) {
    setError(null);

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: "/email-verified",
    });

    if (error) {
      setError(error.message || "Something went wrong");
    } else {
      toast.success("Signed up successfully");
      router.push("/verify-email");
    }
  }

  const loading = form.formState.isSubmitting;

  return (
    <AuthFormShell>
      <div className="mx-auto w-full max-w-[360px]">
        <h2 className="font-semibold text-foreground text-xl sm:text-2xl">
          Join{" "}
          <span className="bg-linear-to-r from-primary to-[hsl(142,72%,22%)] bg-clip-text font-semibold text-transparent">
            Instructis
          </span>
        </h2>
        <p className="mt-1.5 text-muted-foreground text-sm">
          Where learning is tracked and <em>you</em> succeed.
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm font-medium">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Choose your name"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
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
                  <FormLabel className="text-foreground text-sm font-medium">
                    Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Enter a secure password"
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
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm font-medium">
                    Confirm password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive text-xs" />
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
              Create account
            </LoadingButton>
          </form>
        </Form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthFormShell>
  );
}
