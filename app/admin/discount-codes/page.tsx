import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { isAdmin } from "@/lib/admin-auth";
import DiscountCodesClient from "@/components/admin/DiscountCodesClient";

export const dynamic = 'force-dynamic';

export default async function AdminDiscountCodesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/signin-firebase?redirect=/admin/discount-codes");
  }

  const hasAdminAccess = await isAdmin();
  
  if (!hasAdminAccess) {
    redirect("/dashboard");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Discount Codes</h1>
        <p className="text-muted-foreground">
          Create and manage discount codes for promotions and early adopter programs
        </p>
      </div>

      <DiscountCodesClient />
    </div>
  );
}

