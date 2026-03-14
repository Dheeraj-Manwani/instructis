"use client";

import signupImage from "@/assets/signup-image.jpg";
import Image from "next/image";
import Link from "next/link";
import SignUpForm from "./SignUpForm";
import { motion } from "framer-motion";

export const SignUpPage = () => {
  return (
    <main className="flex h-screen items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex h-full max-h-[42rem] w-full max-w-[68rem] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        {/* Left: Form Section */}
        <div className="w-full space-y-10 overflow-y-auto p-8 md:w-1/2 md:p-12">
          {/* Header */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-2 text-center"
          >
            <h1 className="text-3xl font-bold tracking-tight">
              Join <span className="text-brand">Pulse</span>
            </h1>
            <p className="text-muted-foreground">
              Where conversations move fast and{" "}
              <span className="italic text-foreground">you</span> matter.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-5"
          >
            <SignUpForm />
            <Link
              href="/login"
              className="hover:text-brand block text-center text-sm text-muted-foreground transition-colors hover:underline"
            >
              Already have an account?{" "}
              <span className="font-medium">Log in</span>
            </Link>
          </motion.div>
        </div>

        {/* Right: Image */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="hidden w-1/2 md:block"
        >
          <Image
            src={signupImage}
            alt="Join Pulse"
            className="h-full w-full object-cover grayscale-[15%] transition duration-500 hover:grayscale-0"
            priority
          />
        </motion.div>
      </motion.div>
    </main>
  );
};
