"use client";

import loginImage from "@/assets/login-image.jpg";
import Image from "next/image";
import Link from "next/link";
import GoogleSignInButton from "./google/GoogleSignInButton";
import LoginForm from "./LoginForm";
import { motion } from "framer-motion";

export function LoginPage() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <motion.div
        className="flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Left: Form */}
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-2 text-center"
          >
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              Login to <span className="text-brand font-semibold">Pulse</span>{" "}
              and continue the conversation.
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Google Sign In */}
            <GoogleSignInButton />

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-muted" />
              <span className="text-xs font-medium text-muted-foreground">
                OR
              </span>
              <div className="h-px flex-1 bg-muted" />
            </div>

            {/* Login Form */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-5"
            >
              <LoginForm />
            </motion.div>

            {/* Link to signup */}
            {/* <p className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="hover:text-brand block text-center text-sm transition-colors hover:underline"
              >
                Sign up
              </Link>
            </p> */}

            <Link
              href="/signup"
              className="hover:text-brand block text-center text-sm text-muted-foreground transition-colors hover:underline"
            >
              Don&apos;t have an account?{" "}
              <span className="font-medium">Sign up</span>
            </Link>
          </div>
        </div>

        {/* Right: Hero Image */}
        {/* <div className="relative hidden w-1/2 md:block"> */}
        {/* Right: Image */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="hidden w-1/2 md:block"
        >
          <Image
            src={loginImage}
            alt="Login illustration"
            className="h-full w-full object-cover"
            priority
          />
          {/* Subtle overlay gradient for readability */}
          {/* <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/20 to-transparent" /> */}
        </motion.div>
      </motion.div>
    </main>
  );
}
