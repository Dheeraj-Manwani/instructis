"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { InstallmentStatus } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import LoadingButton from "@/components/LoadingButton";
import {
  addInstallment,
  deleteInstallment,
  fetchPaymentSummary,
  fetchPayments,
  setupStudentFee,
  updateInstallment,
  updateStudentFee,
  type PaymentRow,
} from "@/lib/api/payments";
import { MoreHorizontal, Search, IndianRupee, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type StatusFilter = "ALL" | "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";

type InstallmentDraft = {
  dueDate: string;
  dueAmount: string;
  paidAmount: string;
  status: InstallmentStatus;
  paidAt: string;
  remark: string;
};

type PaymentsListResponse = Awaited<ReturnType<typeof fetchPayments>>;

const statusBadgeMap: Record<InstallmentStatus, string> = {
  PAID_FULLY: "bg-emerald-500/10 text-emerald-600",
  PAID_PARTIALLY: "bg-amber-500/10 text-amber-600",
  UNPAID: "bg-red-500/10 text-red-600",
  PENDING: "bg-muted text-muted-foreground",
  OVERDUE: "bg-red-700/10 text-red-700",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function toDateInput(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function buildDraft(row: PaymentRow, installmentId?: string): InstallmentDraft {
  if (!installmentId) {
    return {
      dueDate: "",
      dueAmount: "",
      paidAmount: "0",
      status: InstallmentStatus.UNPAID,
      paidAt: "",
      remark: "",
    };
  }

  const installment = row.installments.find((item) => item.id === installmentId);
  if (!installment) {
    return {
      dueDate: "",
      dueAmount: "",
      paidAmount: "0",
      status: InstallmentStatus.UNPAID,
      paidAt: "",
      remark: "",
    };
  }

  return {
    dueDate: toDateInput(installment.dueDate),
    dueAmount: String(installment.dueAmount ?? 0),
    paidAmount: String(installment.paidAmount ?? 0),
    status: installment.status,
    paidAt: toDateInput(installment.paidAt),
    remark: installment.remark ?? "",
  };
}

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [batchId, setBatchId] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<PaymentRow | null>(null);
  const [editingInstallmentId, setEditingInstallmentId] = useState<string | "new" | null>(null);
  const [installmentDraft, setInstallmentDraft] = useState<InstallmentDraft>(buildDraft({} as PaymentRow));
  const [editTotalFee, setEditTotalFee] = useState(false);
  const [totalAmountInput, setTotalAmountInput] = useState("");
  const [discountInput, setDiscountInput] = useState("");

  const [setupOpen, setSetupOpen] = useState(false);
  const [setupTarget, setSetupTarget] = useState<PaymentRow | null>(null);
  const [setupForm, setSetupForm] = useState({
    totalAmount: "",
    discount: "0",
    note: "",
  });
  const activePaymentsKey = ["admin-payments", page, limit, batchId, status, search] as const;

  const paymentsQuery = useQuery({
    queryKey: activePaymentsKey,
    queryFn: () =>
      fetchPayments({
        page,
        limit,
        batchId: batchId === "all" ? undefined : batchId,
        status,
        search: search || undefined,
      }),
  });

  async function refreshPaymentsAndSyncSelectedRow() {
    await queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    await queryClient.refetchQueries({ queryKey: activePaymentsKey, exact: true });

    if (!selectedRow?.studentFeeId) return;

    const cached = queryClient.getQueryData<PaymentsListResponse>(activePaymentsKey);
    const updatedRow = cached?.data.find((row) => row.studentFeeId === selectedRow.studentFeeId);
    if (updatedRow) {
      setSelectedRow(updatedRow);
    }
  }

  const summaryQuery = useQuery({
    queryKey: ["admin-payments-summary"],
    queryFn: fetchPaymentSummary,
  });

  const list = paymentsQuery.data?.data ?? [];
  const batches = paymentsQuery.data?.batches ?? [];
  const meta = paymentsQuery.data?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 };
  const listSummary = paymentsQuery.data?.summary ?? {
    totalStudents: 0,
    totalCollected: 0,
    totalDue: 0,
  };

  const saveFeeMutation = useMutation({
    mutationFn: ({ studentFeeId, totalAmount, discount }: { studentFeeId: string; totalAmount?: number; discount?: number }) =>
      updateStudentFee(studentFeeId, { totalAmount, discount }),
    onSuccess: () => {
      toast.success("Fee summary updated");
      setEditTotalFee(false);
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payments-summary"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update fee summary"),
  });

  const setupMutation = useMutation({
    mutationFn: setupStudentFee,
    onSuccess: () => {
      toast.success("Fee structure created");
      setSetupOpen(false);
      setSetupTarget(null);
      setSetupForm({ totalAmount: "", discount: "0", note: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payments-summary"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to setup fee structure"),
  });

  const addInstallmentMutation = useMutation({
    mutationFn: ({
      studentFeeId,
      payload,
    }: {
      studentFeeId: string;
      payload: Parameters<typeof addInstallment>[1];
    }) => addInstallment(studentFeeId, payload),
    onSuccess: async () => {
      toast.success("Installment added");
      setEditingInstallmentId(null);
      await refreshPaymentsAndSyncSelectedRow();
      queryClient.invalidateQueries({ queryKey: ["admin-payments-summary"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to add installment"),
  });

  const updateInstallmentMutation = useMutation({
    mutationFn: ({
      installmentId,
      payload,
    }: {
      installmentId: string;
      payload: Parameters<typeof updateInstallment>[1];
    }) => updateInstallment(installmentId, payload),
    onSuccess: async () => {
      toast.success("Installment updated");
      setEditingInstallmentId(null);
      await refreshPaymentsAndSyncSelectedRow();
      queryClient.invalidateQueries({ queryKey: ["admin-payments-summary"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update installment"),
  });

  const deleteInstallmentMutation = useMutation({
    mutationFn: deleteInstallment,
    onSuccess: async () => {
      toast.success("Installment deleted");
      await refreshPaymentsAndSyncSelectedRow();
      queryClient.invalidateQueries({ queryKey: ["admin-payments-summary"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete installment"),
  });

  const summary = summaryQuery.data ?? {
    totalFees: 0,
    paidFees: 0,
    pendingFees: 0,
    topBatches: [],
  };

  const pieData = useMemo(
    () => [
      { name: "Paid", value: summary.paidFees, color: "#16a34a" },
      { name: "Pending", value: summary.pendingFees, color: "#dc2626" },
    ],
    [summary.paidFees, summary.pendingFees]
  );

  function openDetailModal(row: PaymentRow) {
    setSelectedRow(row);
    setDetailOpen(true);
    setEditingInstallmentId(null);
    setEditTotalFee(false);
    setTotalAmountInput(String(row.totalFees));
    setDiscountInput(String(row.discount));
  }

  function saveInstallmentRow() {
    if (!selectedRow?.studentFeeId) return;

    if (!installmentDraft.dueDate || !installmentDraft.dueAmount) {
      toast.error("Due date and due amount are required");
      return;
    }

    const payload = {
      dueDate: installmentDraft.dueDate,
      dueAmount: Number(installmentDraft.dueAmount),
      paidAmount: Number(installmentDraft.paidAmount || "0"),
      status: installmentDraft.status,
      paidAt: installmentDraft.paidAt || null,
      remark: installmentDraft.remark || null,
    };

    if (editingInstallmentId === "new") {
      addInstallmentMutation.mutate({
        studentFeeId: selectedRow.studentFeeId,
        payload,
      });
      return;
    }

    if (!editingInstallmentId) return;
    updateInstallmentMutation.mutate({
      installmentId: editingInstallmentId,
      payload,
    });
  }

  function loadSearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Payments</CardTitle>
            <CardDescription>Track student fees, installments, and outstanding dues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={batchId}
                onValueChange={(value) => {
                  setBatchId(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value as StatusFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative min-w-[240px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by student name"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      loadSearch();
                    }
                  }}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={loadSearch}>
                Apply
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Installments Paid</TableHead>
                  <TableHead>Fees Paid</TableHead>
                  <TableHead>Total Fees</TableHead>
                  <TableHead>Due Amount</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading payments...
                    </TableCell>
                  </TableRow>
                ) : list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((row) => (
                    <TableRow key={row.studentId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage src={row.studentImage ?? undefined} />
                            <AvatarFallback>{getInitials(row.studentName)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{row.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{row.batchName ?? "—"}</TableCell>
                      <TableCell>
                        {row.installmentsPaid} / {row.installmentsTotal}
                      </TableCell>
                      <TableCell>{formatCurrency(row.feesPaid)}</TableCell>
                      <TableCell>{formatCurrency(row.totalFees)}</TableCell>
                      <TableCell>{formatCurrency(row.dueAmount)}</TableCell>
                      <TableCell>
                        {row.studentFeeId ? (
                          <Button variant="outline" size="sm" onClick={() => openDetailModal(row)}>
                            View / Edit
                          </Button>
                        ) : row.batchName ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSetupTarget(row);
                              setSetupOpen(true);
                            }}
                          >
                            Set Up Fee Structure
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="bg-muted/40">
                  <TableCell className="font-semibold">Total Students: {listSummary.totalStudents}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold">{formatCurrency(listSummary.totalCollected)}</TableCell>
                  <TableCell />
                  <TableCell className="font-semibold">{formatCurrency(listSummary.totalDue)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {Math.max(meta.totalPages, 1)}
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
                  disabled={page >= Math.max(meta.totalPages, 1)}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Fees</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{formatCurrency(summary.totalFees)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paid Fees</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">
            {formatCurrency(summary.paidFees)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Fees</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">
            {formatCurrency(summary.pendingFees)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paid vs Pending</CardTitle>
          </CardHeader>
          <CardContent className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Batches by Fees Paid</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.topBatches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No fee payments recorded yet.</p>
            ) : (
              summary.topBatches.map((batch) => {
                const maxPaid = summary.topBatches[0]?.paidAmount || 1;
                const percent = Math.min((batch.paidAmount / maxPaid) * 100, 100);
                return (
                  <div key={batch.batchId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-medium">{batch.batchName}</p>
                      <p className="text-muted-foreground">{formatCurrency(batch.paidAmount)}</p>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedRow(null);
            setEditingInstallmentId(null);
            setEditTotalFee(false);
          }
        }}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Installment Details</DialogTitle>
            <DialogDescription>
              Manage installments and update fee details for the selected student.
            </DialogDescription>
          </DialogHeader>

          {selectedRow ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarImage src={selectedRow.studentImage ?? undefined} />
                    <AvatarFallback>{getInitials(selectedRow.studentName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedRow.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRow.batchName ?? "No Batch"} • {selectedRow.parentPhone ?? "No phone"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Fees</p>
                  <p className="text-lg font-bold">{formatCurrency(selectedRow.totalFees)}</p>
                </div>
              </div>

              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Current Installment Due</p>
                  <p className="text-lg font-semibold">
                    {(() => {
                      const nextUnpaid = selectedRow.installments.find(
                        (item) => item.status !== InstallmentStatus.PAID_FULLY
                      );
                      return nextUnpaid ? formatCurrency(nextUnpaid.dueAmount) : "No pending installment";
                    })()}
                  </p>
                </CardContent>
              </Card>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRow.installments.map((installment) => (
                    <TableRow key={installment.id}>
                      <TableCell>{new Date(installment.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(installment.paidAmount)}</TableCell>
                      <TableCell>{formatCurrency(installment.dueAmount)}</TableCell>
                      <TableCell>
                        <Badge className={statusBadgeMap[installment.status]}>{installment.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingInstallmentId(installment.id);
                                setInstallmentDraft(buildDraft(selectedRow, installment.id));
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => deleteInstallmentMutation.mutate(installment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {editingInstallmentId ? (
                <div className="space-y-3 rounded-lg border p-4">
                  <p className="text-sm font-medium">
                    {editingInstallmentId === "new" ? "Add Installment" : "Edit Installment"}
                  </p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="installment-due-date">Due Date *</Label>
                      <Input
                        id="installment-due-date"
                        type="date"
                        value={installmentDraft.dueDate}
                        onChange={(event) =>
                          setInstallmentDraft((current) => ({ ...current, dueDate: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="installment-due-amount">Due Amount (INR) *</Label>
                      <Input
                        id="installment-due-amount"
                        type="number"
                        placeholder="Due Amount"
                        value={installmentDraft.dueAmount}
                        onChange={(event) =>
                          setInstallmentDraft((current) => ({ ...current, dueAmount: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="installment-paid-amount">Paid Amount (INR)</Label>
                      <Input
                        id="installment-paid-amount"
                        type="number"
                        placeholder="Paid Amount"
                        value={installmentDraft.paidAmount}
                        onChange={(event) =>
                          setInstallmentDraft((current) => ({ ...current, paidAmount: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="installment-status">Status</Label>
                      <Select
                        value={installmentDraft.status}
                        onValueChange={(value) =>
                          setInstallmentDraft((current) => ({
                            ...current,
                            status: value as InstallmentStatus,
                          }))
                        }
                      >
                        <SelectTrigger id="installment-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={InstallmentStatus.PAID_FULLY}>Paid Fully</SelectItem>
                          <SelectItem value={InstallmentStatus.PAID_PARTIALLY}>Paid Partially</SelectItem>
                          <SelectItem value={InstallmentStatus.UNPAID}>Unpaid</SelectItem>
                          <SelectItem value={InstallmentStatus.PENDING}>Pending</SelectItem>
                          <SelectItem value={InstallmentStatus.OVERDUE}>Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(installmentDraft.status === InstallmentStatus.PAID_FULLY ||
                      installmentDraft.status === InstallmentStatus.PAID_PARTIALLY) && (
                        <div className="space-y-1.5">
                          <Label htmlFor="installment-paid-at">Paid At</Label>
                          <Input
                            id="installment-paid-at"
                            type="date"
                            value={installmentDraft.paidAt}
                            onChange={(event) =>
                              setInstallmentDraft((current) => ({ ...current, paidAt: event.target.value }))
                            }
                          />
                        </div>
                      )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="installment-remark">Remark</Label>
                    <textarea
                      id="installment-remark"
                      className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
                      placeholder="Remark (optional)"
                      value={installmentDraft.remark}
                      onChange={(event) =>
                        setInstallmentDraft((current) => ({ ...current, remark: event.target.value }))
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingInstallmentId(null)}>
                      Cancel
                    </Button>
                    <LoadingButton
                      loading={addInstallmentMutation.isPending || updateInstallmentMutation.isPending}
                      onClick={saveInstallmentRow}
                    >
                      Save Installment
                    </LoadingButton>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingInstallmentId("new");
                    setInstallmentDraft(buildDraft(selectedRow));
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Installment
                </Button>
                <Button variant="outline" onClick={() => setEditTotalFee((value) => !value)}>
                  <IndianRupee className="h-4 w-4" />
                  Edit Total Fee Amount
                </Button>
              </div>

              {editTotalFee ? (
                <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-total-amount">Total Fee Amount (INR)</Label>
                    <Input
                      id="edit-total-amount"
                      type="number"
                      placeholder="e.g. 135000"
                      value={totalAmountInput}
                      onChange={(event) => setTotalAmountInput(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-discount">Discount Amount (INR)</Label>
                    <Input
                      id="edit-discount"
                      type="number"
                      placeholder="e.g. 2000"
                      value={discountInput}
                      onChange={(event) => setDiscountInput(event.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <LoadingButton
                      loading={saveFeeMutation.isPending}
                      onClick={() => {
                        if (!selectedRow.studentFeeId) return;
                        saveFeeMutation.mutate({
                          studentFeeId: selectedRow.studentFeeId,
                          totalAmount: Number(totalAmountInput),
                          discount: Number(discountInput),
                        });
                      }}
                    >
                      Save Fee Amount
                    </LoadingButton>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDetailOpen(false)}>Update Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={setupOpen}
        onOpenChange={(open) => {
          setSetupOpen(open);
          if (!open) {
            setSetupTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Up Fee Structure</DialogTitle>
            <DialogDescription>
              {setupTarget ? `Create fee setup for ${setupTarget.studentName}.` : "Create student fee setup."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="setup-total-amount">Total Fee Amount (INR) *</Label>
              <Input
                id="setup-total-amount"
                type="number"
                placeholder="e.g. 135000"
                value={setupForm.totalAmount}
                onChange={(event) =>
                  setSetupForm((current) => ({ ...current, totalAmount: event.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">This is the full course fee before discount.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="setup-discount">Discount Amount (INR)</Label>
              <Input
                id="setup-discount"
                type="number"
                placeholder="e.g. 5000"
                value={setupForm.discount}
                onChange={(event) => setSetupForm((current) => ({ ...current, discount: event.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Optional. Keep 0 if no discount is given.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="setup-note">Note</Label>
              <textarea
                id="setup-note"
                className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Optional note (scholarship reason, payment plan, etc.)"
                value={setupForm.note}
                onChange={(event) => setSetupForm((current) => ({ ...current, note: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              loading={setupMutation.isPending}
              onClick={() => {
                if (!setupTarget?.batchId) {
                  toast.error("Student is not assigned to a batch");
                  return;
                }
                if (!setupForm.totalAmount || Number(setupForm.totalAmount) <= 0) {
                  toast.error("Please enter a valid total fee amount");
                  return;
                }
                setupMutation.mutate({
                  studentId: setupTarget.studentId,
                  batchId: setupTarget.batchId,
                  totalAmount: Number(setupForm.totalAmount),
                  discount: Number(setupForm.discount || "0"),
                  note: setupForm.note || undefined,
                });
              }}
            >
              Save
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
