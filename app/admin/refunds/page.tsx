import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import RefundsAdminClient from "@/components/admin/RefundsAdminClient";

export const dynamic = 'force-dynamic';

async function RefundsAdminContent({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const userId = params.userId;
  const page = parseInt(params.page || "1");
  const status = params.status; // "refunded" | "partially_refunded" | "all"
  const pageSize = 20;

  // Build where clause
  const where: any = {
    refundedAmount: { gt: 0 },
  };

  if (userId) {
    where.userId = userId;
  }

  if (status === "refunded") {
    where.status = "refunded";
  } else if (status === "partially_refunded") {
    where.status = "partially_refunded";
  }

  // Get refunded payments with pagination
  const [payments, totalCount] = await Promise.all([
    (prisma as any).payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { refundedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    (prisma as any).payment.count({ where }),
  ]);

  // Get refund statistics
  const [
    totalRefunded,
    fullyRefundedCount,
    partiallyRefundedCount,
    refundStats,
  ] = await Promise.all([
    (prisma as any).payment.aggregate({
      where: { refundedAmount: { gt: 0 } },
      _sum: { refundedAmount: true },
    }),
    (prisma as any).payment.count({
      where: { status: "refunded" },
    }),
    (prisma as any).payment.count({
      where: { status: "partially_refunded" },
    }),
    (prisma as any).payment.groupBy({
      by: ["status"],
      where: { refundedAmount: { gt: 0 } },
      _count: true,
      _sum: {
        refundedAmount: true,
        amount: true,
      },
    }),
  ]);

  return (
    <RefundsAdminClient
      initialPayments={payments}
      totalCount={totalCount}
      currentPage={page}
      pageSize={pageSize}
      totalRefunded={totalRefunded._sum.refundedAmount || 0}
      fullyRefundedCount={fullyRefundedCount}
      partiallyRefundedCount={partiallyRefundedCount}
      refundStats={refundStats}
      currentUserId={userId}
      currentStatus={status}
    />
  );
}

export default async function AdminRefundsPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; page?: string; status?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/admin/refunds");
  }

  await requireAdmin();

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading refunds...</div>
      </div>
    }>
      <RefundsAdminContent searchParams={searchParams} />
    </Suspense>
  );
}

