import prisma from "@/lib/prisma";
import { NotFoundError } from "@/lib/utils/errors";
import { InstallmentStatus } from "@prisma/client";

export type PaymentInstallmentRecord = {
  id: string;
  dueDate: Date;
  dueAmount: number;
  paidAmount: number;
  status: InstallmentStatus;
  paidAt: Date | null;
  recordedById: string | null;
  recordedByName: string | null;
  remark: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentStudentFeeRecord = {
  id: string;
  batchId: string;
  totalAmount: number;
  discount: number;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  installments: PaymentInstallmentRecord[];
};

export type PaymentStudentRecord = {
  studentId: string;
  studentName: string;
  studentImage: string | null;
  parentPhone: string | null;
  batchId: string | null;
  batchName: string | null;
  studentFees: PaymentStudentFeeRecord[];
};

export async function findPaymentStudents(params: {
  batchId?: string;
  search?: string;
}): Promise<PaymentStudentRecord[]> {
  const records = await prisma.student.findMany({
    where: {
      ...(params.batchId ? { batchId: params.batchId } : {}),
      ...(params.search
        ? {
            user: {
              name: {
                contains: params.search,
                mode: "insensitive",
              },
            },
          }
        : {}),
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
    select: {
      id: true,
      parentPhone: true,
      batchId: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      batch: {
        select: {
          id: true,
          name: true,
        },
      },
      studentFees: {
        select: {
          id: true,
          batchId: true,
          totalAmount: true,
          discount: true,
          note: true,
          createdAt: true,
          updatedAt: true,
          installments: {
            orderBy: {
              dueDate: "asc",
            },
            select: {
              id: true,
              dueDate: true,
              dueAmount: true,
              paidAmount: true,
              status: true,
              paidAt: true,
              recordedById: true,
              remark: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  const recordedByIds = new Set<string>();
  for (const student of records) {
    for (const fee of student.studentFees) {
      for (const installment of fee.installments) {
        if (installment.recordedById) {
          recordedByIds.add(installment.recordedById);
        }
      }
    }
  }

  const recordedByUsers =
    recordedByIds.size > 0
      ? await prisma.user.findMany({
          where: {
            id: {
              in: Array.from(recordedByIds),
            },
          },
          select: {
            id: true,
            name: true,
          },
        })
      : [];

  const userNameMap = new Map(recordedByUsers.map((user) => [user.id, user.name]));

  return records.map((record) => ({
    studentId: record.id,
    studentName: record.user.name,
    studentImage: record.user.image,
    parentPhone: record.parentPhone,
    batchId: record.batchId,
    batchName: record.batch?.name ?? null,
    studentFees: record.studentFees.map((fee) => ({
      id: fee.id,
      batchId: fee.batchId,
      totalAmount: fee.totalAmount,
      discount: fee.discount,
      note: fee.note,
      createdAt: fee.createdAt,
      updatedAt: fee.updatedAt,
      installments: fee.installments.map((installment) => ({
        id: installment.id,
        dueDate: installment.dueDate,
        dueAmount: installment.dueAmount,
        paidAmount: installment.paidAmount,
        status: installment.status,
        paidAt: installment.paidAt,
        recordedById: installment.recordedById,
        recordedByName: installment.recordedById
          ? userNameMap.get(installment.recordedById) ?? null
          : null,
        remark: installment.remark,
        createdAt: installment.createdAt,
        updatedAt: installment.updatedAt,
      })),
    })),
  }));
}

export async function findAllBatches() {
  return prisma.batch.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function createStudentFee(data: {
  studentId: string;
  batchId: string;
  totalAmount: number;
  discount?: number;
  note?: string | null;
}) {
  return prisma.studentFee.create({
    data: {
      studentId: data.studentId,
      batchId: data.batchId,
      totalAmount: data.totalAmount,
      discount: data.discount ?? 0,
      note: data.note ?? null,
    },
  });
}

export async function findStudentFeeByStudentAndBatch(studentId: string, batchId: string) {
  return prisma.studentFee.findUnique({
    where: {
      studentId_batchId: {
        studentId,
        batchId,
      },
    },
  });
}

export async function updateStudentFee(studentFeeId: string, data: { totalAmount?: number; discount?: number }) {
  return prisma.studentFee.update({
    where: { id: studentFeeId },
    data,
  });
}

export async function getStudentFeeOrThrow(studentFeeId: string) {
  const studentFee = await prisma.studentFee.findUnique({
    where: { id: studentFeeId },
  });

  if (!studentFee) {
    throw new NotFoundError("Student fee record not found");
  }

  return studentFee;
}

export async function createInstallment(data: {
  studentFeeId: string;
  dueDate: Date;
  dueAmount: number;
  paidAmount?: number;
  status: InstallmentStatus;
  paidAt?: Date | null;
  remark?: string | null;
  recordedById?: string;
}) {
  return prisma.feeInstallment.create({
    data: {
      studentFeeId: data.studentFeeId,
      dueDate: data.dueDate,
      dueAmount: data.dueAmount,
      paidAmount: data.paidAmount ?? 0,
      status: data.status,
      paidAt: data.paidAt ?? null,
      remark: data.remark ?? null,
      recordedById: data.recordedById ?? null,
    },
  });
}

export async function getInstallmentOrThrow(installmentId: string) {
  const installment = await prisma.feeInstallment.findUnique({
    where: {
      id: installmentId,
    },
  });

  if (!installment) {
    throw new NotFoundError("Installment not found");
  }

  return installment;
}

export async function updateInstallment(
  installmentId: string,
  data: {
    dueDate?: Date;
    dueAmount?: number;
    paidAmount?: number;
    status?: InstallmentStatus;
    paidAt?: Date | null;
    remark?: string | null;
    recordedById?: string | null;
  }
) {
  return prisma.feeInstallment.update({
    where: { id: installmentId },
    data,
  });
}

export async function deleteInstallment(installmentId: string) {
  await prisma.feeInstallment.delete({
    where: {
      id: installmentId,
    },
  });
}

export async function getPaymentSummaryAggregates() {
  const [totalFeesAggregate, paidFeesAggregate, batches] = await Promise.all([
    prisma.studentFee.aggregate({
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.feeInstallment.aggregate({
      _sum: {
        paidAmount: true,
      },
    }),
    prisma.batch.findMany({
      select: {
        id: true,
        name: true,
        studentFees: {
          select: {
            installments: {
              select: {
                paidAmount: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const topBatches = batches
    .map((batch) => {
      const paid = batch.studentFees.reduce((feeTotal, fee) => {
        const installmentPaid = fee.installments.reduce(
          (installmentTotal, installment) => installmentTotal + installment.paidAmount,
          0
        );
        return feeTotal + installmentPaid;
      }, 0);

      return {
        batchId: batch.id,
        batchName: batch.name,
        paidAmount: paid,
      };
    })
    .sort((a, b) => b.paidAmount - a.paidAmount)
    .slice(0, 4);

  return {
    totalFees: totalFeesAggregate._sum.totalAmount ?? 0,
    paidFees: paidFeesAggregate._sum.paidAmount ?? 0,
    topBatches,
  };
}
