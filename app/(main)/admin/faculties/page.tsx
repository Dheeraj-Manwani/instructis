"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Plus, Search, Pencil, MoreVertical, Trash2, KeyRound, GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchFaculties, createFaculty, removeFacultyRole, updateFaculty, type FacultyListItem } from "@/lib/api/faculties";
import LoadingButton from "@/components/LoadingButton";

type FacultyFormState = {
  name: string;
  email: string;
  facultyCode: string;
  title: string;
  department: string;
  newPassword: string;
  confirmPassword: string;
};

const defaultForm: FacultyFormState = {
  name: "",
  email: "",
  facultyCode: "",
  title: "",
  department: "",
  newPassword: "",
  confirmPassword: "",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function FacultiesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyListItem | null>(null);
  const [addForm, setAddForm] = useState<FacultyFormState>(defaultForm);
  const [editForm, setEditForm] = useState<FacultyFormState>(defaultForm);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-faculties", page, limit, search, department],
    queryFn: () =>
      fetchFaculties({
        page,
        limit,
        search: search || undefined,
        department: department === "all" ? undefined : department,
      }),
  });

  const faculties = data?.data ?? [];
  const departments = data?.departments ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 };

  const createMutation = useMutation({
    mutationFn: createFaculty,
    onSuccess: () => {
      toast.success("Faculty created");
      setAddOpen(false);
      setAddForm(defaultForm);
      queryClient.invalidateQueries({ queryKey: ["admin-faculties"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create faculty"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ facultyId, payload }: { facultyId: string; payload: Parameters<typeof updateFaculty>[1] }) =>
      updateFaculty(facultyId, payload),
    onSuccess: () => {
      toast.success("Faculty updated");
      setEditOpen(false);
      setSelectedFaculty(null);
      setEditForm(defaultForm);
      setShowPasswordFields(false);
      queryClient.invalidateQueries({ queryKey: ["admin-faculties"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update faculty"),
  });

  const removeMutation = useMutation({
    mutationFn: (facultyId: string) => removeFacultyRole(facultyId),
    onSuccess: () => {
      toast.success("Faculty role removed");
      setRemoveDialogOpen(false);
      setSelectedFaculty(null);
      queryClient.invalidateQueries({ queryKey: ["admin-faculties"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to remove faculty role"),
  });

  const totalPages = useMemo(() => Math.max(meta.totalPages, 1), [meta.totalPages]);

  function openEditModal(faculty: FacultyListItem, passwordMode = false) {
    setSelectedFaculty(faculty);
    setEditForm({
      name: faculty.name,
      email: faculty.email,
      facultyCode: faculty.facultyCode ?? "",
      title: faculty.title ?? "",
      department: faculty.department ?? "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordFields(passwordMode);
    setEditOpen(true);
  }

  function submitCreate() {
    if (!addForm.name || !addForm.email || !addForm.newPassword) {
      toast.error("Name, email and password are required");
      return;
    }

    createMutation.mutate({
      name: addForm.name.trim(),
      email: addForm.email.trim(),
      password: addForm.newPassword,
      title: addForm.title.trim() || undefined,
      department: addForm.department.trim() || undefined,
    });
  }

  function submitUpdate() {
    if (!selectedFaculty) return;
    if (!editForm.name || !editForm.email) {
      toast.error("Name and email are required");
      return;
    }

    updateMutation.mutate({
      facultyId: selectedFaculty.id,
      payload: {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        facultyCode: editForm.facultyCode.trim() || undefined,
        title: editForm.title.trim() || null,
        department: editForm.department.trim() || null,
        ...(editForm.newPassword
          ? {
              newPassword: editForm.newPassword,
              confirmPassword: editForm.confirmPassword,
            }
          : {}),
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Faculties</h2>
            <p className="text-sm text-muted-foreground">Manage faculty accounts and access.</p>
          </div>
        </div>

        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Faculty
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Faculties</CardTitle>
          <CardDescription>{isFetching ? "Refreshing..." : `${meta.total} faculty account(s)`}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={department}
              onValueChange={(value) => {
                setDepartment(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Faculty</TableHead>
                <TableHead>Faculty ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Batches</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    Loading faculties...
                  </TableCell>
                </TableRow>
              ) : faculties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    No faculty records found.
                  </TableCell>
                </TableRow>
              ) : (
                faculties.map((faculty) => (
                  <TableRow key={faculty.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={faculty.image ?? undefined} />
                          <AvatarFallback>{getInitials(faculty.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{faculty.name}</p>
                          {faculty.title ? (
                            <p className="text-xs text-muted-foreground">{faculty.title}</p>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {faculty.facultyCode ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{faculty.email}</TableCell>
                    <TableCell>{faculty.department ?? "—"}</TableCell>
                    <TableCell>{faculty.batchesCount}</TableCell>
                    <TableCell>{faculty.questionsCount}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(faculty.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => openEditModal(faculty)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" size="icon-sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(faculty, true)}>
                              <KeyRound className="h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                setSelectedFaculty(faculty);
                                setRemoveDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove Faculty Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {meta.page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Faculty</DialogTitle>
            <DialogDescription>Create a new faculty account with credential login.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <Input
              placeholder="Full name"
              value={addForm.name}
              onChange={(event) => setAddForm((current) => ({ ...current, name: event.target.value }))}
            />
            <Input
              placeholder="Email"
              value={addForm.email}
              onChange={(event) => setAddForm((current) => ({ ...current, email: event.target.value }))}
            />
            <Input
              type="password"
              placeholder="Password"
              value={addForm.newPassword}
              onChange={(event) =>
                setAddForm((current) => ({ ...current, newPassword: event.target.value }))
              }
            />
            <Input
              placeholder="Title (optional)"
              value={addForm.title}
              onChange={(event) => setAddForm((current) => ({ ...current, title: event.target.value }))}
            />
            <Input
              placeholder="Department (optional)"
              value={addForm.department}
              onChange={(event) =>
                setAddForm((current) => ({ ...current, department: event.target.value }))
              }
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <LoadingButton loading={createMutation.isPending} onClick={submitCreate}>
              Create Faculty
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setShowPasswordFields(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Faculty</DialogTitle>
            <DialogDescription>Update profile information and optionally change password.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <Input
              placeholder="Full name"
              value={editForm.name}
              onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
            />
            <Input
              placeholder="Email"
              value={editForm.email}
              onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
            />
            <Input
              placeholder="Faculty ID (AB203)"
              value={editForm.facultyCode}
              onChange={(event) =>
                setEditForm((current) => ({
                  ...current,
                  facultyCode: event.target.value.toUpperCase(),
                }))
              }
            />
            <Input
              placeholder="Title"
              value={editForm.title}
              onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
            />
            <Input
              placeholder="Department"
              value={editForm.department}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, department: event.target.value }))
              }
            />

            {!showPasswordFields ? (
              <Button
                variant="outline"
                type="button"
                className="justify-start"
                onClick={() => setShowPasswordFields(true)}
              >
                <KeyRound className="h-4 w-4" />
                Set New Password
              </Button>
            ) : (
              <>
                <Input
                  type="password"
                  placeholder="New Password"
                  value={editForm.newPassword}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, newPassword: event.target.value }))
                  }
                />
                {editForm.newPassword ? (
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={editForm.confirmPassword}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, confirmPassword: event.target.value }))
                    }
                  />
                ) : null}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <LoadingButton loading={updateMutation.isPending} onClick={submitUpdate}>
              Save Changes
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Faculty Role</DialogTitle>
            <DialogDescription>
              {selectedFaculty
                ? `This will switch ${selectedFaculty.name}'s role back to USER.`
                : "This will switch this account back to USER."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              loading={removeMutation.isPending}
              onClick={() => {
                if (!selectedFaculty) return;
                removeMutation.mutate(selectedFaculty.id);
              }}
            >
              Confirm
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
