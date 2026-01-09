import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { isAdmin } from "@/lib/admin-auth";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      redirect("/auth/signin-firebase?redirect=/admin");
    }

    const hasAdminAccess = await isAdmin();
    
    if (!hasAdminAccess) {
      redirect("/dashboard");
    }
  } catch (error: any) {
    console.error("[ADMIN LAYOUT] Error:", error.message);
    console.error("[ADMIN LAYOUT] Stack:", error.stack);
    console.error("[ADMIN LAYOUT] DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 50));
    // Don't redirect on error - let it show the error page
    throw error;
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Admin Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-xl font-bold text-card-foreground">
                Admin Dashboard
              </Link>
              <nav className="flex items-center gap-4">
                <Link
                  href="/admin"
                  className="text-sm text-muted-foreground hover:text-card-foreground transition"
                >
                  Overview
                </Link>
                <Link
                  href="/admin/users"
                  className="text-sm text-muted-foreground hover:text-card-foreground transition"
                >
                  Users
                </Link>
                <Link
                  href="/admin/discount-codes"
                  className="text-sm text-muted-foreground hover:text-card-foreground transition"
                >
                  Discount Codes
                </Link>
                <Link
                  href="/admin/analytics"
                  className="text-sm text-muted-foreground hover:text-card-foreground transition"
                >
                  Analytics
                </Link>
                <Link
                  href="/admin/early-adopters"
                  className="text-sm text-muted-foreground hover:text-card-foreground transition"
                >
                  Early Adopters
                </Link>
                <Link
                  href="/admin/feedback"
                  className="text-sm text-muted-foreground hover:text-card-foreground transition"
                >
                  Feedback
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-card-foreground transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

