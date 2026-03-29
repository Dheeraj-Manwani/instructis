"use client";

import { useEffect, useState } from "react";
import { addDays, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { Atom, Beaker, CalendarDays, Leaf, Sigma, Sprout } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassStatusBadge } from "@/components/class-status-badge";
import { SUBJECT_THEME } from "@/lib/constants/class-schedule";
import { fetchStudentClasses, type ClassSessionItem } from "@/lib/api/classes";
import { cn } from "@/lib/utils";
import { useBreadcrumb } from "@/store/BreadcrumbContext";
import type { SubjectEnum } from "@prisma/client";

function subjectIcon(subject: SubjectEnum) {
  switch (subject) {
    case "PHYSICS":
      return Atom;
    case "CHEMISTRY":
      return Beaker;
    case "MATHEMATICS":
      return Sigma;
    case "ZOOLOGY":
      return Sprout;
    case "BOTANY":
      return Leaf;
    default:
      return CalendarDays;
  }
}

function formatTimeRange(start: string, end: string) {
  return `${format(parseISO(start), "hh:mm a")} - ${format(parseISO(end), "hh:mm a")}`;
}

function getCountdown(targetIso?: string, now = Date.now()) {
  if (!targetIso) return "00:00:00";
  const distance = new Date(targetIso).getTime() - now;
  if (distance <= 0 || distance > 24 * 60 * 60 * 1000) return "00:00:00";

  const hours = Math.floor(distance / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderClassCard(item: ClassSessionItem, showJoin = true) {
  const Icon = subjectIcon(item.subject);
  const theme = SUBJECT_THEME[item.subject];
  const isToday = isSameDay(parseISO(item.date), new Date());

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border-l-4 border p-4",
        theme.card,
        theme.border,
        item.status === "COMPLETED" && "opacity-75",
        item.status === "CANCELLED" && "border-l-red-600"
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4" />
          <span>{item.subject}</span>
        </div>
        <ClassStatusBadge status={item.status} />
      </div>
      <p className="font-semibold">{item.title}</p>
      <p className="text-sm text-muted-foreground">
        {formatTimeRange(item.startTime, item.endTime)} · {item.batchName}
      </p>
      <p className="text-sm text-muted-foreground">Faculty: {item.facultyName}</p>
      {item.notes && <p className="text-sm text-muted-foreground">Notes: {item.notes}</p>}
      {item.cancelNote && <p className="text-sm text-red-700">Cancel note: {item.cancelNote}</p>}
      {showJoin && (
        <div className="mt-3">
          {item.meetLink ? (
            <a href={item.meetLink} target="_blank" rel="noreferrer">
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700">Join Google Meet</Button>
            </a>
          ) : isToday ? (
            <p className="text-sm text-muted-foreground">Meet link not added yet</p>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}

export function StudentClassesPageClient() {
  const { setBreadcrumb } = useBreadcrumb();
  const [tab, setTab] = useState<"upcoming" | "today" | "past">("upcoming");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setBreadcrumb([{ label: "Classes", href: "/student/classes" }]);
  }, [setBreadcrumb]);

  const activeTabQuery = useQuery({
    queryKey: ["classes", "student", tab],
    queryFn: () => fetchStudentClasses(tab),
  });

  const upcomingQuery = useQuery({
    queryKey: ["classes", "student", "upcoming"],
    queryFn: () => fetchStudentClasses("upcoming"),
  });

  const tabClasses = activeTabQuery.data?.classes ?? [];
  const upcomingClasses = upcomingQuery.data?.classes ?? [];
  const nextClass = upcomingClasses[0];
  const countdown = getCountdown(nextClass?.startTime, now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const groupedUpcoming = (() => {
    const groups = new Map<string, ClassSessionItem[]>();
    tabClasses.forEach((item) => {
      const key = format(parseISO(item.date), "yyyy-MM-dd");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    });
    return Array.from(groups.entries());
  })();

  const weekDots = (() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, idx) => {
      const date = addDays(start, idx);
      const hasClass = upcomingClasses.some((item) => isSameDay(parseISO(item.date), date));
      return { date, hasClass };
    });
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
        <p className="text-sm text-muted-foreground">View your upcoming, today, and past classes.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <Tabs value={tab} onValueChange={(value) => setTab(value as "upcoming" | "today" | "past")}>
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            {activeTabQuery.isLoading ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <>
                <TabsContent value="today" className="mt-4 space-y-3">
                  {tabClasses.length === 0 ? (
                    <Card>
                      <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        No classes for today.
                      </CardContent>
                    </Card>
                  ) : (
                    tabClasses.map((item) => renderClassCard(item, true))
                  )}
                </TabsContent>

                <TabsContent value="upcoming" className="mt-4 space-y-4">
                  {groupedUpcoming.length === 0 ? (
                    <Card>
                      <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        No upcoming classes.
                      </CardContent>
                    </Card>
                  ) : (
                    groupedUpcoming.map(([dateKey, items]) => (
                      <div key={dateKey} className="space-y-2">
                        <h3 className="text-sm font-semibold">
                          {format(parseISO(`${dateKey}T00:00:00`), "EEEE, MMM d")}
                        </h3>
                        <div className="space-y-3">{items.map((item) => renderClassCard(item, true))}</div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="past" className="mt-4 space-y-3">
                  {tabClasses.length === 0 ? (
                    <Card>
                      <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        No past classes.
                      </CardContent>
                    </Card>
                  ) : (
                    tabClasses.map((item) => renderClassCard(item, false))
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>

        <div className="hidden space-y-4 lg:block">
          <Card>
            <CardHeader>
              <CardTitle>Next Class</CardTitle>
              <CardDescription>Immediate upcoming class</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {nextClass ? (
                <>
                  <p className="font-medium">{nextClass.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(nextClass.date), "EEE, MMM d")} ·{" "}
                    {formatTimeRange(nextClass.startTime, nextClass.endTime)}
                  </p>
                  <p className="text-sm text-muted-foreground">Faculty: {nextClass.facultyName}</p>
                  {countdown !== "00:00:00" && (
                    <p className="rounded-md bg-emerald-500/10 px-2 py-1 text-sm font-semibold text-emerald-700">
                      Starts in {countdown}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming classes.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
              <CardDescription>Days with classes</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-7 gap-1">
              {weekDots.map((item) => (
                <div key={item.date.toISOString()} className="text-center">
                  <p className="text-[10px] text-muted-foreground">{format(item.date, "EEE")}</p>
                  <div
                    className={cn(
                      "mx-auto mt-1 h-2.5 w-2.5 rounded-full",
                      item.hasClass ? "bg-emerald-500" : "bg-muted"
                    )}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
