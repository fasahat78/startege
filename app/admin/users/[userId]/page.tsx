import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import UserDetailClient from "@/components/admin/UserDetailClient";

export const dynamic = 'force-dynamic';

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/signin-firebase?redirect=/admin/users");
  }

  const hasAdminAccess = await isAdmin();
  
  if (!hasAdminAccess) {
    redirect("/dashboard");
  }

  const { userId } = await params;

  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      aiCredit: true,
      profile: true,
      referralsGiven: {
        include: {
          referee: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
            },
          },
        },
      },
      referralReceived: {
        include: {
          referrer: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
      discountCodeUsages: {
        include: {
          discountCode: {
            select: {
              code: true,
              description: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          challengeAttempts: true,
          examAttempts: true,
          aigpExamAttempts: true,
          agentConversations: true,
        },
      },
    },
  });

  if (!userData) {
    redirect("/admin/users");
  }

  return (
    <div>
      <div className="mb-8">
        <a
          href="/admin/users"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
        >
          ← Back to Users
        </a>
        <h1 className="text-3xl font-bold text-foreground mb-2">User Details</h1>
        <p className="text-muted-foreground">
          {userData.email}
        </p>
      </div>

      <UserDetailClient user={userData} />
    </div>
  );
}

