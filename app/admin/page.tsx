import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/signin-firebase?redirect=/admin");
  }

  const hasAdminAccess = await isAdmin();
  
  if (!hasAdminAccess) {
    redirect("/dashboard");
  }

  // Get quick stats
  const [
    totalUsers,
    premiumUsers,
    earlyAdopters,
    activeDiscountCodes,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionTier: "premium" } }),
    prisma.user.count({ where: { isEarlyAdopter: true } }),
    prisma.discountCode.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({
      where: { status: "succeeded" },
      _sum: { amount: true },
    }),
  ]);

  const stats = [
    {
      name: "Total Users",
      value: totalUsers.toLocaleString(),
      href: "/admin/users",
      color: "text-blue-600",
    },
    {
      name: "Premium Users",
      value: premiumUsers.toLocaleString(),
      href: "/admin/users?tier=premium",
      color: "text-green-600",
    },
    {
      name: "Early Adopters",
      value: earlyAdopters.toLocaleString(),
      href: "/admin/early-adopters",
      color: "text-purple-600",
    },
    {
      name: "Active Discount Codes",
      value: activeDiscountCodes.toLocaleString(),
      href: "/admin/discount-codes",
      color: "text-orange-600",
    },
    {
      name: "Total Revenue",
      value: `$${((totalRevenue._sum.amount || 0) / 100).toLocaleString()}`,
      href: "/admin/analytics",
      color: "text-emerald-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, discount codes, and track platform metrics
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-card rounded-lg border border-border p-6 hover:border-accent transition"
          >
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.name}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="bg-card rounded-lg border border-border p-6 hover:border-accent transition"
        >
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            User Management
          </h3>
          <p className="text-sm text-muted-foreground">
            View, search, and manage all users. Update roles, early adopter status, and more.
          </p>
        </Link>

        <Link
          href="/admin/discount-codes"
          className="bg-card rounded-lg border border-border p-6 hover:border-accent transition"
        >
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Discount Codes
          </h3>
          <p className="text-sm text-muted-foreground">
            Create and manage discount codes. Track usage and effectiveness.
          </p>
        </Link>

        <Link
          href="/admin/analytics"
          className="bg-card rounded-lg border border-border p-6 hover:border-accent transition"
        >
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Analytics
          </h3>
          <p className="text-sm text-muted-foreground">
            View detailed analytics, revenue metrics, and user growth trends.
          </p>
        </Link>

        <Link
          href="/admin/early-adopters"
          className="bg-card rounded-lg border border-border p-6 hover:border-accent transition"
        >
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Early Adopters
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage early adopter tiers, assign badges, and track program effectiveness.
          </p>
        </Link>

        <Link
          href="/admin/feedback"
          className="bg-card rounded-lg border border-border p-6 hover:border-accent transition"
        >
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Feedback
          </h3>
          <p className="text-sm text-muted-foreground">
            Review user feedback, prioritize issues, and track resolution status.
          </p>
        </Link>
      </div>
    </div>
  );
}

