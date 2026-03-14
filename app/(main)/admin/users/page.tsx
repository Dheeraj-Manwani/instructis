"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ShieldCheck, UserCog, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

type Role = "student" | "faculty" | "superadmin";

interface ManagedUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: Role;
    joinedAt: string;
}

const initialUsers: ManagedUser[] = [
    { id: "1", name: "Rahul Sharma", email: "rahul.sharma@inst.edu", avatar: "RS", role: "student", joinedAt: "2024-08-15" },
    { id: "2", name: "Priya Joshi", email: "priya.joshi@inst.edu", avatar: "PJ", role: "student", joinedAt: "2024-09-01" },
    { id: "3", name: "Tanvi Mehta", email: "tanvi.mehta@inst.edu", avatar: "TM", role: "student", joinedAt: "2024-07-20" },
    { id: "4", name: "Aditya Verma", email: "aditya.verma@inst.edu", avatar: "AV", role: "student", joinedAt: "2024-10-10" },
    { id: "5", name: "Sameer Gupta", email: "sameer.gupta@inst.edu", avatar: "SG", role: "faculty", joinedAt: "2023-06-01" },
    { id: "6", name: "Rohan Kumar", email: "rohan.kumar@inst.edu", avatar: "RK", role: "student", joinedAt: "2024-08-25" },
    { id: "7", name: "Dr. Farhan Khan", email: "farhan.khan@inst.edu", avatar: "FK", role: "faculty", joinedAt: "2022-01-10" },
    { id: "8", name: "Admin User", email: "admin@inst.edu", avatar: "AU", role: "superadmin", joinedAt: "2021-01-01" },
];

const roleBadge: Record<Role, { label: string; className: string }> = {
    student: { label: "Student", className: "bg-secondary text-secondary-foreground" },
    faculty: { label: "Faculty", className: "bg-primary/10 text-primary" },
    superadmin: { label: "Super Admin", className: "bg-destructive/10 text-destructive" },
};

export default function UserManagement() {
    const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState<string>("all");
    const [pendingChange, setPendingChange] = useState<{ userId: string; newRole: Role } | null>(null);

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
        setUsers((prev) =>
            prev.map((u) => (u.id === pendingChange.userId ? { ...u, role: pendingChange.newRole } : u))
        );
        const user = users.find((u) => u.id === pendingChange.userId);
        toast.success(`${user?.name} is now a ${pendingChange.newRole}.`);
        setPendingChange(null);
    };

    const counts = {
        student: users.filter((u) => u.role === "student").length,
        faculty: users.filter((u) => u.role === "faculty").length,
        superadmin: users.filter((u) => u.role === "superadmin").length,
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
                    <p className="text-sm text-muted-foreground">Super Admin access only — assign roles to platform users</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {([["Students", counts.student, "secondary"], ["Faculty", counts.faculty, "primary"], ["Super Admins", counts.superadmin, "destructive"]] as const).map(
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
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="faculty">Faculty</SelectItem>
                                <SelectItem value="superadmin">Super Admin</SelectItem>
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
                            {filtered.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                                {user.avatar}
                                            </div>
                                            <span className="font-medium text-foreground">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                    <TableCell className="text-muted-foreground">{user.joinedAt}</TableCell>
                                    <TableCell>
                                        <Badge className={roleBadge[user.role].className}>{roleBadge[user.role].label}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog
                                            open={pendingChange?.userId === user.id}
                                            onOpenChange={(open) => { if (!open) setPendingChange(null); }}
                                        >
                                            <Select
                                                value={user.role}
                                                onValueChange={(val) => handleRoleChange(user.id, val as Role)}
                                            >
                                                <SelectTrigger className="w-[140px] ml-auto">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="student">Student</SelectItem>
                                                    <SelectItem value="faculty">Faculty</SelectItem>
                                                    <SelectItem value="superadmin">Super Admin</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Confirm role change</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Change <strong>{user.name}</strong>'s role from{" "}
                                                        <Badge className={roleBadge[user.role].className}>{roleBadge[user.role].label}</Badge> to{" "}
                                                        <Badge className={roleBadge[pendingChange?.newRole ?? user.role].className}>
                                                            {roleBadge[pendingChange?.newRole ?? user.role].label}
                                                        </Badge>
                                                        ? This action takes effect immediately.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={confirmRoleChange}>Confirm</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
