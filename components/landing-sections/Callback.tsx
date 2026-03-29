"use client";

import { useState } from "react";
import { PhoneCall, ShieldCheck, Clock, CheckCircle2, Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createCallbackRequest } from "@/lib/api/callback-requests";
import { toast } from "react-hot-toast";

export function Callback() {
  const PHONE_NUMBER = "+9195153736499";
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [courseMode, setCourseMode] = useState<"ONLINE" | "CLASSROOM" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    fullName.trim().length >= 2 &&
    /^[0-9]{10,15}$/.test(mobileNumber.trim()) &&
    courseMode != null;

  async function handleSubmit() {
    if (!canSubmit) {
      toast.error("Please fill all fields to request counselling.");
      return;
    }
    if (courseMode == null) return;

    setIsSubmitting(true);
    try {
      await createCallbackRequest({
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        courseMode,
      });
      toast.success("Request submitted! Our admission counsellor will call you shortly.");
      setIsSubmitted(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to submit request.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="callback" className="w-full bg-background py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 shadow-xl ring-1 ring-slate-200/70 dark:border-slate-700/80 dark:ring-slate-700/60 dark:shadow-black/35 lg:grid-cols-2 lg:divide-x lg:divide-emerald-200/60 dark:lg:divide-slate-700/80">

        {/* Left Side */}
        <div className="relative flex flex-col justify-center overflow-hidden bg-linear-to-br from-emerald-700 via-emerald-800 to-emerald-900 p-8 text-white md:p-14 lg:p-16">
          {/* Abstract bg elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/20">
              <PhoneCall className="w-8 h-8 text-green-300" />
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              Talk to Our Expert Counsellors for <span className="text-amber-400">Free!</span>
            </h2>

            <p className="text-green-100 text-lg md:text-xl mb-12 max-w-lg leading-relaxed">
              Get personalised course guidance, fee details, and scholarship info in one call. No spam, we promise.
            </p>

            <div className="space-y-6 mb-16">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-full"><Clock className="w-5 h-5 text-amber-400" /></div>
                <span className="text-lg font-semibold tracking-wide">Response within 24 hours</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-full"><ShieldCheck className="w-5 h-5 text-amber-400" /></div>
                <span className="text-lg font-semibold tracking-wide">100% Free Consultation</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-full"><CheckCircle2 className="w-5 h-5 text-amber-400" /></div>
                <span className="text-lg font-semibold tracking-wide">Trusted by 5 Lakh Families</span>
              </div>
            </div>
            <p className="text-sm text-emerald-100/90">
              Prefer to talk now?{" "}
              <a href={`tel:${PHONE_NUMBER}`} className="font-semibold text-white underline-offset-4 hover:underline">
                Call {PHONE_NUMBER}
              </a>
            </p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="flex items-center justify-center bg-slate-50 p-8 dark:bg-slate-900/60 md:p-12 lg:p-16">
          <div className="w-full max-w-xl rounded-3xl border border-emerald-200/80 bg-white p-8 text-card-foreground shadow-lg shadow-emerald-100/60 ring-1 ring-emerald-100/70 dark:border-slate-700 dark:bg-slate-900 dark:ring-slate-700/60 dark:shadow-black/40">
            {!isSubmitted ? (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Request a Callback</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Quick form - takes less than 30 seconds.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Student Name
                  </label>
                  <Input
                    value={fullName}
                    placeholder="Enter student name"
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 rounded-xl border-slate-300 bg-white/90 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-800/70 dark:placeholder:text-slate-400 dark:focus-visible:border-emerald-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Mobile Number
                  </label>
                  <Input
                    value={mobileNumber}
                    placeholder="Enter parent/student mobile number"
                    inputMode="numeric"
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="h-12 rounded-xl border-slate-300 bg-white/90 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-800/70 dark:placeholder:text-slate-400 dark:focus-visible:border-emerald-400"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    We respect your privacy. Your number is used only for counselling support.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Course Mode
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCourseMode("ONLINE")}
                      className={cn(
                        "px-6 py-3 rounded-xl border text-sm font-semibold transition-colors",
                        courseMode === "ONLINE"
                          ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800/70"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      Online
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseMode("CLASSROOM")}
                      className={cn(
                        "px-6 py-3 rounded-xl border text-sm font-semibold transition-colors",
                        courseMode === "CLASSROOM"
                          ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800/70"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      Classroom
                    </button>
                  </div>
                </div>

                <LoadingButton
                  loading={isSubmitting}
                  disabled={!canSubmit || isSubmitting}
                  onClick={handleSubmit}
                  className="w-full h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Get Free Counselling
                </LoadingButton>
              </div>
            ) : (
              <div className="space-y-4 py-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-900/30">
                  <Rocket className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  Thank you! Our team will call you shortly.
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your counselling request is confirmed. We will guide you with the best next steps for JEE/NEET preparation and admissions.
                </p>
                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFullName("");
                      setMobileNumber("");
                      setCourseMode(null);
                    }}
                    className="rounded-full bg-emerald-600 px-8 text-white hover:bg-emerald-700"
                  >
                    Submit Another Request
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
