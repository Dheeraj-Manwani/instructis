"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBreadcrumb } from "@/store/BreadcrumbContext";
import { useRouter } from "nextjs-toploader/app";
import { useParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Clock, Calendar, Edit, Settings } from "lucide-react";
import Link from "next/link";
import { ExamType } from "@prisma/client";
import { fetchMyBatches, fetchBatchById, type BatchListItem } from "@/lib/api/batches";
import { fetchTestsByBatchId, createMockTest, type CreateMockTestPayload } from "@/lib/api/tests";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";
import { createTestFormSchema, type TestFormValues } from "@/lib/schemas/mock-test.schema";

export default function BatchDetailPage() {
    const router = useRouter();
    const params = useParams();
    const batchId = params.id as string;
    const queryClient = useQueryClient();
    const [createTestModalOpen, setCreateTestModalOpen] = useState(false);

    const { setBreadcrumb } = useBreadcrumb();

    const { data: batch, isLoading: batchLoading } = useQuery({
        queryKey: ["batch", batchId],
        queryFn: () => fetchBatchById(batchId),
        enabled: !!batchId,
    });

    useEffect(() => {
        if (batch) {
            setBreadcrumb([
                { label: "My Batches", href: "/my-batches" },
                { label: batch.name },
            ]);
        }
    }, [batch, setBreadcrumb]);

    const { data: tests = [], isLoading: testsLoading } = useQuery({
        queryKey: ["batch-tests", batchId],
        queryFn: () => fetchTestsByBatchId(batchId),
        enabled: !!batchId,
    });

    const testFormSchema = createTestFormSchema(batch?.examType as ExamType | undefined);

    const form = useForm<TestFormValues>({
        resolver: zodResolver(testFormSchema),
        defaultValues: {
            name: "",
            duration: 180,
            totalMarks: 100,
            totalMarksPhysics: null,
            totalMarksChemistry: null,
            totalMarksMathematics: null,
            totalMarksZoology: null,
            totalMarksBotany: null,
            isPublished: false,
            scheduledAt: null,
        },
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateMockTestPayload) => createMockTest(payload),
        onSuccess: () => {
            toast.success("Test created successfully");
            queryClient.invalidateQueries({ queryKey: ["batch-tests", batchId] });
            setCreateTestModalOpen(false);
            form.reset({
                name: "",
                duration: 180,
                totalMarks: 100,
                totalMarksPhysics: null,
                totalMarksChemistry: null,
                totalMarksMathematics: null,
                totalMarksZoology: null,
                totalMarksBotany: null,
                isPublished: false,
                scheduledAt: null,
            });
        },
        onError: (e: Error) => toast.error(e.message || "Failed to create test"),
    });

    const onSubmit = (values: TestFormValues) => {
        // Convert datetime-local string to ISO string if provided
        let scheduledAtISO: string | null = null;
        if (values.scheduledAt) {
            // datetime-local format is "YYYY-MM-DDTHH:mm", convert to ISO
            const date = new Date(values.scheduledAt);
            scheduledAtISO = date.toISOString();
        }

        createMutation.mutate({
            name: values.name,
            batchId: batchId,
            duration: values.duration,
            totalMarks: values.totalMarks,
            totalMarksPhysics: values.totalMarksPhysics ?? null,
            totalMarksChemistry: values.totalMarksChemistry ?? null,
            totalMarksMathematics: values.totalMarksMathematics ?? null,
            totalMarksZoology: values.totalMarksZoology ?? null,
            totalMarksBotany: values.totalMarksBotany ?? null,
            isPublished: values.isPublished,
            scheduledAt: scheduledAtISO,
        });
    };

    const isJEE = batch?.examType === ExamType.JEE;
    const isNEET = batch?.examType === ExamType.NEET;

    // Auto-calculate total marks from subject-wise marks
    const physicsMarks = form.watch("totalMarksPhysics");
    const chemistryMarks = form.watch("totalMarksChemistry");
    const mathematicsMarks = form.watch("totalMarksMathematics");
    const zoologyMarks = form.watch("totalMarksZoology");
    const botanyMarks = form.watch("totalMarksBotany");

    useEffect(() => {
        const physics = physicsMarks ?? 0;
        const chemistry = chemistryMarks ?? 0;
        const maths = isJEE ? mathematicsMarks ?? 0 : 0;
        const zoology = isNEET ? zoologyMarks ?? 0 : 0;
        const botany = isNEET ? botanyMarks ?? 0 : 0;

        const total = physics + chemistry + maths + zoology + botany;

        form.setValue("totalMarks", total, { shouldValidate: true, shouldDirty: true });
    }, [physicsMarks, chemistryMarks, mathematicsMarks, zoologyMarks, botanyMarks, isJEE, isNEET, form]);

    // Reset form when dialog opens
    useEffect(() => {
        if (createTestModalOpen) {
            form.reset({
                name: "",
                duration: 180,
                totalMarks: 100,
                totalMarksPhysics: null,
                totalMarksChemistry: null,
                totalMarksMathematics: null,
                totalMarksZoology: null,
                totalMarksBotany: null,
                isPublished: false,
                scheduledAt: null,
            });
        }
    }, [createTestModalOpen, form]);

    if (batchLoading) {
        return (
            <div className="space-y-6">
                <TableSkeleton rows={5} columns={4} />
            </div>
        );
    }

    if (!batch) {
        return (
            <div className="space-y-6">
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Batch not found</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push("/my-batches")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to My Batches
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/my-batches")}
                        className="h-9 w-9"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{batch.name}</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage tests for this batch
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setCreateTestModalOpen(true)}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Create Test
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="">
                        <CardTitle className="text-sm font-medium">Exam Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-bold">{batch.examType}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="">
                        <CardTitle className="text-sm font-medium">Year</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-bold">{batch.year}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-bold">{batch.isActive ? "Active" : "Inactive"}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Tests</CardTitle>
                    <CardDescription>
                        {tests.length === 0
                            ? "No tests created yet. Create your first test to get started."
                            : `${tests.length} test${tests.length !== 1 ? "s" : ""} in this batch.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {testsLoading ? (
                        <TableSkeleton rows={5} columns={4} />
                    ) : tests.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground text-sm mb-4">
                                No tests found. Create your first test to get started.
                            </p>
                            <Button onClick={() => setCreateTestModalOpen(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Test
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Test Name</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Total Marks</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tests.map((test) => (
                                        <TableRow key={test.id}>
                                            <TableCell className="font-medium">
                                                {test.name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    {test.duration} min
                                                </div>
                                            </TableCell>
                                            <TableCell>{test.totalMarks} marks</TableCell>
                                            <TableCell>
                                                {test.isPublished ? (
                                                    <Badge className="bg-primary/10 text-primary">
                                                        Published
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Draft</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(test.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {/* <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            toast("Edit functionality coming soon");
                                                        }}
                                                        className="h-8"
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button> */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                        className="h-8"
                                                    >
                                                        <Link href={`/my-batches/${batchId}/test/${test.id}`}>
                                                            <Settings className="h-4 w-4 mr-1" />
                                                            Manage
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={createTestModalOpen} onOpenChange={(o) => !o && setCreateTestModalOpen(false)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Test</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Test Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. JEE Mock Test 1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration (minutes)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="totalMarks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Marks</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    readOnly
                                                    min={0}
                                                    {...field}
                                                    value={field.value ?? 0}
                                                    tabIndex={-1}
                                                    className="pointer-events-none bg-muted text-muted-foreground border-border/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <FormLabel className="text-sm font-medium">Subject-wise Marks</FormLabel>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="totalMarksPhysics"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Physics Marks *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="totalMarksChemistry"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Chemistry Marks *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {isJEE && (
                                        <FormField
                                            control={form.control}
                                            name="totalMarksMathematics"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mathematics Marks *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            {...field}
                                                            value={field.value ?? ""}
                                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    {isNEET && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="totalMarksZoology"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Zoology Marks *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="totalMarksBotany"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Botany Marks *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    * Total marks are auto-calculated from the subject-wise marks above
                                </p>
                            </div>

                            <FormField
                                control={form.control}
                                name="scheduledAt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Scheduled Date & Time (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="datetime-local"
                                                value={field.value || ""}
                                                onChange={(e) => field.onChange(e.target.value || null)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isPublished"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="mt-0! cursor-pointer">Published</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCreateTestModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <LoadingButton
                                    type="submit"
                                    loading={createMutation.isPending}
                                >
                                    Create Test
                                </LoadingButton>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
