import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import Link from "next/link";
import SettingsClient from "@/components/dashboard/SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/dashboard/settings");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!dbUser) {
    redirect("/auth/signin-firebase?redirect=/dashboard/settings");
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* Account Settings */}
        <div className="bg-card rounded-lg shadow-card p-6 border border-border mb-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Account Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">
                Email Address
              </label>
              <p className="text-card-foreground">{dbUser.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed here. Contact support if needed.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">
                Display Name
              </label>
              <p className="text-card-foreground">{dbUser.name || "Not set"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Display name is managed through your authentication provider.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">
                Account Created
              </label>
              <p className="text-card-foreground">
                {new Date(dbUser.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Client Component */}
        <SettingsClient />

        {/* Quick Links */}
        <div className="bg-card rounded-lg shadow-card p-6 border border-border mt-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition"
            >
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <p className="font-medium text-card-foreground">Profile</p>
                <p className="text-sm text-muted-foreground">View your profile</p>
              </div>
            </Link>

            <Link
              href="/dashboard/billing"
              className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition"
            >
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <div>
                <p className="font-medium text-card-foreground">Subscription & Billing</p>
                <p className="text-sm text-muted-foreground">Manage subscription</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

