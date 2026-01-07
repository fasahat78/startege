import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { isAdmin } from "@/lib/admin-auth";
import UsersClient from "@/components/admin/UsersClient";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/signin-firebase?redirect=/admin/users");
  }

  const hasAdminAccess = await isAdmin();
  
  if (!hasAdminAccess) {
    redirect("/dashboard");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
        <p className="text-muted-foreground">
          View, search, and manage all users. Update roles, early adopter status, and subscription tiers.
        </p>
      </div>

      <UsersClient />
    </div>
  );
}

