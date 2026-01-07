import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { isAdmin } from "@/lib/admin-auth";
import AnalyticsClient from "@/components/admin/AnalyticsClient";

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/signin-firebase?redirect=/admin/analytics");
  }

  const hasAdminAccess = await isAdmin();
  
  if (!hasAdminAccess) {
    redirect("/dashboard");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track user growth, revenue, and platform metrics
        </p>
      </div>

      <AnalyticsClient />
    </div>
  );
}

