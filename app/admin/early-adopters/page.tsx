import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { isAdmin } from "@/lib/admin-auth";
import EarlyAdoptersClient from "@/components/admin/EarlyAdoptersClient";

export const dynamic = 'force-dynamic';

export default async function AdminEarlyAdoptersPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/signin-firebase?redirect=/admin/early-adopters");
  }

  const hasAdminAccess = await isAdmin();
  
  if (!hasAdminAccess) {
    redirect("/dashboard");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Early Adopter Management</h1>
        <p className="text-muted-foreground">
          Manage early adopter tiers, assign badges, and track program effectiveness
        </p>
      </div>

      <EarlyAdoptersClient />
    </div>
  );
}

