"use client";

import Lottie from "lottie-react";
import { ReactNode } from "react";
import studentLottie from "@/assets/student.json";

interface AuthFormShellProps {
  children: ReactNode;
}

export function AuthFormShell({ children }: AuthFormShellProps) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/40 px-4 py-8">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-card shadow-xl">
        {/* Left: Form content */}
        <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-8 md:px-10 lg:min-w-[320px]">
          {children}
        </div>

        {/* Right: Lottie — hidden on small screens */}
        <aside className="relative hidden w-[45%] min-w-[280px] shrink-0 items-center justify-center bg-muted/30 md:flex">
          <div className="flex h-full min-h-[320px] w-full items-center justify-center p-6">
            <div className="h-[min(100%,360px)] w-[min(100%,280px)]">
              <Lottie
                animationData={studentLottie}
                loop
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
