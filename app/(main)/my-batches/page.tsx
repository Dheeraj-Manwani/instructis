"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
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
import { Settings } from "lucide-react";
import { fetchMyBatches } from "@/lib/api/batches";
import { TableSkeleton } from "@/components/ui/table-skeleton";

export default function MyBatchesPage() {
    const router = useRouter();

    const { data: batches = [], isLoading } = useQuery({
        queryKey: ["my-batches"],
        queryFn: fetchMyBatches,
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Batches</h1>
                    <p className="text-muted-foreground text-sm">
                        View the batches you are assigned to.
                    </p>
                </div>
            </div>

            <Card>
                {!isLoading && <CardHeader className="pb-3">
                    <CardTitle className="text-base">Assigned Batches</CardTitle>
                    <CardDescription>
                        {batches.length === 0
                            ? "You are not assigned to any batches yet."
                            : `You are assigned to ${batches.length} batch${batches.length !== 1 ? "es" : ""}.`}
                    </CardDescription>
                </CardHeader>}
                <CardContent>
                    {isLoading ? (
                        <TableSkeleton rows={5} columns={4} />
                    ) : batches.length === 0 ? (
                        <p className="text-muted-foreground py-8 text-center text-sm">
                            No batches found. Contact an administrator to be assigned to a batch.
                        </p>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Exam</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batches.map((batch) => (
                                        <TableRow key={batch.id}>
                                            <TableCell className="font-medium">
                                                <Link
                                                    href={`/my-batches/${batch.id}`}
                                                    className="hover:text-primary transition-colors cursor-pointer"
                                                >
                                                    {batch.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{batch.examType}</Badge>
                                            </TableCell>
                                            <TableCell>{batch.year}</TableCell>
                                            <TableCell>
                                                {batch.isActive ? (
                                                    <Badge className="bg-primary/10 text-primary">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(batch.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2"
                                                    onClick={() => router.push(`/my-batches/${batch.id}`)}
                                                    title="Manage batch"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                    Manage
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
