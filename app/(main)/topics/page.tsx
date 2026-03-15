"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/LoadingButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchTopicsBySubject, createTopic } from "@/lib/api/topics";
import { Plus, BookOpen, Hash } from "lucide-react";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Animate, PageTransition } from "@/lib/utils/animations";
import { motion } from "motion/react";
import {
  topicFormSchema,
  type TopicFormValues,
} from "@/lib/schemas/topic.schema";

const SUBJECTS = [
  { value: "PHYSICS", label: "Physics" },
  { value: "CHEMISTRY", label: "Chemistry" },
  { value: "MATHEMATICS", label: "Mathematics" },
  { value: "ZOOLOGY", label: "Zoology" },
  { value: "BOTANY", label: "Botany" },
] as const;

export default function TopicsPage() {
  const queryClient = useQueryClient();
  const [subjectFilter, setSubjectFilter] = useState<string>("PHYSICS");

  const { data: topics = [], isLoading } = useQuery({
    queryKey: queryKeys.topics.list(subjectFilter),
    queryFn: () => fetchTopicsBySubject(subjectFilter),
  });

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: { name: "", subject: "PHYSICS" },
  });

  const createMutation = useMutation({
    mutationFn: createTopic,
    onSuccess: (_, variables) => {
      toast.success("Topic added");
      form.reset({ name: "", subject: form.getValues("subject") });
      queryClient.invalidateQueries({
        queryKey: queryKeys.topics.list(variables.subject),
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (values: TopicFormValues) => {
    createMutation.mutate(values);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <Animate variant="slideDown" delay={0.1}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Topics</h1>
              <p className="text-muted-foreground text-sm">
                Add topics for each subject. They can be used when creating questions.
              </p>
            </div>
          </div>
        </Animate>

        <Animate variant="slideUp" delay={0.2}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add topic</CardTitle>
              <CardDescription>Choose a subject and enter the topic name.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-wrap items-end gap-4"
                >
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem className="w-[180px]">
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SUBJECTS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="min-w-[200px] flex-1">
                        <FormLabel>Topic name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Thermodynamics" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LoadingButton
                      type="submit"
                      className="gap-2"
                      loading={createMutation.isPending}
                    >
                      <Plus className="h-4 w-4" />
                      Add topic
                    </LoadingButton>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </Animate>

        <Animate variant="slideUp" delay={0.3}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Topics by subject</CardTitle>
              <CardDescription>Filter by subject to see topics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-foreground text-sm font-medium">Subject:</span>
                <Select
                  value={subjectFilter}
                  onValueChange={setSubjectFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isLoading ? (
                <TableSkeleton rows={5} columns={1} />
              ) : topics.length === 0 ? (
                <Animate variant="fadeIn">
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    No topics for this subject yet. Add one above.
                  </p>
                </Animate>
              ) : (
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="w-12">
                          <div className="flex items-center justify-center">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Topic Name
                          </div>
                        </TableHead>
                        <TableHead className="text-right font-semibold">Subject</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topics.map((t, index) => (
                        <motion.tr
                          key={t.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.2 }}
                          className="hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0 group"
                        >
                          <TableCell className="text-center">
                            <span className="text-muted-foreground text-sm font-mono">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <BookOpen className="h-4 w-4" />
                              </div>
                              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                {t.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className="bg-muted/50 border-border text-foreground"
                            >
                              {SUBJECTS.find((s) => s.value === subjectFilter)?.label ?? subjectFilter}
                            </Badge>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                  {topics.length > 0 && (
                    <div className="border-t border-border bg-muted/20 px-4 py-3">
                      <p className="text-muted-foreground text-sm text-center">
                        Showing <span className="font-semibold text-foreground">{topics.length}</span>{" "}
                        {topics.length === 1 ? "topic" : "topics"} for{" "}
                        <span className="font-semibold text-foreground">
                          {SUBJECTS.find((s) => s.value === subjectFilter)?.label ?? subjectFilter}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </Animate>
      </div>
    </PageTransition>
  );
}
