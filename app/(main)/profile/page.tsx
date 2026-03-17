"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingButton from "@/components/LoadingButton";
import { getProfile, updateProfile, type Profile, type UpdateProfilePayload } from "@/lib/api/profile";
import { RoleEnum } from "@prisma/client";
import { toast } from "react-hot-toast";
import { User, GraduationCap, Briefcase, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { profileFormSchema, type ProfileFormValues } from "@/lib/schemas/profile.schema";
import { useEffect } from "react";
import { PageTransition } from "@/lib/utils/animations";

function formatDateForInput(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function profileToFormValues(profile: Profile): ProfileFormValues {
  const { user, student, faculty } = profile;
  return {
    name: user.name,
    image: user.image ?? "",
    rollNo: student?.rollNo ?? "",
    targetExam: (student?.targetExam as "JEE" | "NEET") ?? undefined,
    parentName: student?.parentName ?? "",
    parentPhone: student?.parentPhone ?? "",
    parentEmail: student?.parentEmail ?? "",
    address: student?.address ?? "",
    dob: formatDateForInput(student?.dob ?? null),
    title: faculty?.title ?? "",
    department: faculty?.department ?? "",
  };
}

function formValuesToPayload(
  values: ProfileFormValues,
  role: RoleEnum
): UpdateProfilePayload {
  const payload: UpdateProfilePayload = {
    name: values.name,
    image: values.image === "" ? null : values.image ?? undefined,
  };
  if (role === RoleEnum.STUDENT) {
    payload.student = {
      rollNo: values.rollNo || undefined,
      targetExam: values.targetExam,
      parentName: values.parentName || null,
      parentPhone: values.parentPhone || null,
      parentEmail: values.parentEmail || null,
      address: values.address || null,
      dob: values.dob || null,
    };
  }
  if (role === RoleEnum.FACULTY) {
    payload.faculty = {
      title: values.title || null,
      department: values.department || null,
    };
  }
  return payload;
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      image: "",
      rollNo: "",
      targetExam: undefined,
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      address: "",
      dob: "",
      title: "",
      department: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset(profileToFormValues(profile));
    }
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update profile"),
  });

  const onSubmit = (values: ProfileFormValues) => {
    if (!profile) return;
    const payload = formValuesToPayload(values, profile.user.role as RoleEnum);
    updateMutation.mutate(payload);
  };

  const role = profile?.user?.role as RoleEnum | undefined;
  const isStudent = role === RoleEnum.STUDENT;
  const isFaculty = role === RoleEnum.FACULTY;
  const isAdmin = role === RoleEnum.ADMIN;

  if (isLoading || !profile) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and role-specific information.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal information (User) */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Personal information</CardTitle>
                    <CardDescription>
                      Your name and profile image. Email is managed by your account.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <Input
                    value={profile.user.email}
                    disabled
                    className="bg-muted/50"
                  />
                  <FormDescription>
                    Email cannot be changed here. Use account settings to update it.
                  </FormDescription>
                </div>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional. Link to your profile picture.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isAdmin && (
                  <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-800 dark:bg-amber-950/30">
                    <Shield className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                    <span className="text-amber-800 dark:text-amber-200">
                      Admin account — only personal fields are editable here.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Student details */}
            {isStudent && profile.student && (
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                      <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Student details</CardTitle>
                      <CardDescription>
                        Your roll number, target exam, and parent/guardian contact.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="rollNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roll number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 2025001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetExam"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target exam</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select exam" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="JEE">JEE</SelectItem>
                              <SelectItem value="NEET">NEET</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="rounded-md border border-muted/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                    Batch: {profile.student.batchName ?? "Not assigned"}
                  </div>
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Your address" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="border-t border-border/60 pt-4">
                    <p className="mb-3 text-sm font-medium text-foreground">
                      Parent / guardian contact
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="parentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Parent name" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parentPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone number" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parentEmail"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="parent@example.com"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Faculty details */}
            {isFaculty && profile.faculty && (
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                      <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Faculty details</CardTitle>
                      <CardDescription>
                        Your professional title and department.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Senior Teacher, HOD"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Mathematics, Physics"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <LoadingButton
                type="submit"
                loading={updateMutation.isPending}
              >
                Save changes
              </LoadingButton>
            </div>
          </form>
        </Form>
      </div>
    </PageTransition>
  );
}
