"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldCheck, UserCog, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { fetchUsers, updateUserRole, type UserListItem } from "@/lib/api/users";
import { RoleEnum } from "@prisma/client";
import LoadingButton from "@/components/LoadingButton";

type Role = "STUDENT" | "FACULTY" | "ADMIN" | 'USER';

const roleBadgeMap: Record<Role, { label: string; className: string }> = {
    STUDENT: { label: "Student", className: "bg-secondary text-secondary-foreground" },
    FACULTY: { label: "Faculty", className: "bg-primary/10 text-primary" },
    ADMIN: { label: "Admin", className: "bg-destructive/10 text-destructive" },
    USER: { label: "User", className: "bg-muted text-muted-foreground" },
};

function getRoleBadge(role: Role) {
    return roleBadgeMap[role];
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function UserManagement() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState<string>("all");
    const [pendingChange, setPendingChange] = useState<{ userId: string; newRole: Role } | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["users", page, limit],
        queryFn: () => fetchUsers({ page, limit }),
    });

    const users = data?.data ?? [];
    const meta = data?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 };

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: RoleEnum }) =>
            updateUserRole(userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User role updated successfully");
            setPendingChange(null);
        },
        onError: (e: Error) => {
            toast.error(e.message || "Failed to update user role");
        },
    });

    const filtered = users.filter((u) => {
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = filterRole === "all" || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const handleRoleChange = (userId: string, newRole: Role) => {
        setPendingChange({ userId, newRole });
    };

    const confirmRoleChange = () => {
        if (!pendingChange) return;
        updateRoleMutation.mutate({
            userId: pendingChange.userId,
            role: pendingChange.newRole as RoleEnum,
        });
    };

    const counts = {
        student: users.filter((u) => u.role === RoleEnum.STUDENT).length,
        faculty: users.filter((u) => u.role === RoleEnum.FACULTY).length,
        admin: users.filter((u) => u.role === RoleEnum.ADMIN).length,
        user: users.filter((u) => u.role === RoleEnum.USER).length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                    <ShieldCheck className="h-5 w-5 text-destructive" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">User Role Management</h2>
                    <p className="text-sm text-muted-foreground">Admin access only — assign roles to platform users</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {([
                    ["Students", counts.student, "secondary"],
                    ["Faculty", counts.faculty, "primary"],
                    ["Admins", counts.admin, "destructive"],
                    ["Users", counts.user, "muted"],
                ] as const).map(
                    ([label, count, color]) => (
                        <Card key={label}>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">{label}</p>
                                    <p className="text-2xl font-bold text-foreground">{count}</p>
                                </div>
                                <UserCog className={`h-8 w-8 text-${color}`} />
                            </CardContent>
                        </Card>
                    )
                )}
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">All Users</CardTitle>
                    <CardDescription>Search and filter users, then change their role.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={filterRole} onValueChange={setFilterRole}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Filter role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="USER">User</SelectItem>
                                <SelectItem value="STUDENT">Student</SelectItem>
                                <SelectItem value="FACULTY">Faculty</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Current Role</TableHead>
                                <TableHead className="text-right">Change Role</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        Loading users...
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                                    {getInitials(user.name)}
                                                </div>
                                                <span className="font-medium text-foreground">{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getRoleBadge(user.role).className}>
                                                {getRoleBadge(user.role).label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog
                                                open={pendingChange?.userId === user.id}
                                                onOpenChange={(open) => {
                                                    if (!open) setPendingChange(null);
                                                }}
                                            >
                                                <Select
                                                    value={user.role}
                                                    onValueChange={(val) =>
                                                        handleRoleChange(
                                                            user.id,
                                                            val as RoleEnum
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-[140px] ml-auto">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="USER">User</SelectItem>
                                                        <SelectItem value="STUDENT">Student</SelectItem>
                                                        <SelectItem value="FACULTY">Faculty</SelectItem>
                                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Confirm role change</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Change <strong>{user.name}</strong>&apos;s role from{" "}
                                                            <Badge className={getRoleBadge(user.role).className}>
                                                                {getRoleBadge(user.role).label}
                                                            </Badge>{" "}
                                                            to{" "}
                                                            <Badge
                                                                className={
                                                                    getRoleBadge(pendingChange?.newRole ?? user.role)
                                                                        .className
                                                                }
                                                            >
                                                                {getRoleBadge(pendingChange?.newRole ?? user.role).label}
                                                            </Badge>
                                                            ? This action takes effect immediately.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <LoadingButton
                                                            onClick={confirmRoleChange}
                                                            loading={updateRoleMutation.isPending}
                                                        >
                                                            Confirm
                                                        </LoadingButton>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
