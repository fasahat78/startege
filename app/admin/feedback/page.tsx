import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import FeedbackAdminClient from "@/components/admin/FeedbackAdminClient";
import { FeedbackStatus, FeedbackType } from "@prisma/client";

export const dynamic = 'force-dynamic';

async function FeedbackAdminContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status as FeedbackStatus | undefined;
  const type = params.type as FeedbackType | undefined;
  const page = parseInt(params.page || "1");
  const pageSize = 20;

  // Build where clause
  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (type) {
    where.type = type;
  }

  // Get feedback with pagination
  const [feedback, totalCount] = await Promise.all([
    prisma.feedback.findMany({
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
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.feedback.count({ where }),
  ]);

  // Get counts by status
  const statusCounts = await prisma.feedback.groupBy({
    by: ["status"],
    _count: true,
  });

  // Get counts by type
  const typeCounts = await prisma.feedback.groupBy({
    by: ["type"],
    _count: true,
  });

  const statusCountMap = statusCounts.reduce((acc, item) => {
    acc[item.status] = item._count;
    return acc;
  }, {} as Record<string, number>);

  const typeCountMap = typeCounts.reduce((acc, item) => {
    acc[item.type] = item._count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <FeedbackAdminClient
      initialFeedback={feedback}
      totalCount={totalCount}
      currentPage={page}
      pageSize={pageSize}
      statusCounts={statusCountMap}
      typeCounts={typeCountMap}
      currentStatus={status}
      currentType={type}
    />
  );
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; page?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/admin/feedback");
  }

  await requireAdmin();

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading feedback...</div>
      </div>
    }>
      <FeedbackAdminContent searchParams={searchParams} />
    </Suspense>
  );
}

