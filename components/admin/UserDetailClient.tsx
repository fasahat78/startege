"use client";

import { useState } from "react";
import { EarlyAdopterTier, UserRole } from "@prisma/client";
import EarlyAdopterBadge from "./EarlyAdopterBadge";

interface UserDetailProps {
  user: any; // Full user object from Prisma
}

export default function UserDetailClient({ user }: UserDetailProps) {
  const [formData, setFormData] = useState({
    role: user.role || "USER",
    isAdmin: user.isAdmin || false,
    isEarlyAdopter: user.isEarlyAdopter || false,
    earlyAdopterTier: user.earlyAdopterTier || "",
    subscriptionTier: user.subscriptionTier || "free",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: formData.role,
          isAdmin: formData.isAdmin,
          isEarlyAdopter: formData.isEarlyAdopter,
          earlyAdopterTier: formData.earlyAdopterTier || null,
          subscriptionTier: formData.subscriptionTier,
        }),
      });

      if (response.ok) {
        alert("User updated successfully!");
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">User Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <div className="text-muted-foreground">{user.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <div className="text-muted-foreground">{user.name || "N/A"}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Joined</label>
            <div className="text-muted-foreground">
              {new Date(user.createdAt).toLocaleString()}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Referral Code</label>
            <div className="font-mono text-muted-foreground">
              {user.referralCode || "Not generated"}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Edit User</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAdmin"
              checked={formData.isAdmin}
              onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isAdmin" className="text-sm font-medium text-foreground">
              Is Admin
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Subscription Tier
            </label>
            <select
              value={formData.subscriptionTier}
              onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isEarlyAdopter"
              checked={formData.isEarlyAdopter}
              onChange={(e) => setFormData({ ...formData, isEarlyAdopter: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isEarlyAdopter" className="text-sm font-medium text-foreground">
              Is Early Adopter
            </label>
          </div>

          {formData.isEarlyAdopter && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Early Adopter Tier
              </label>
              <select
                value={formData.earlyAdopterTier}
                onChange={(e) => setFormData({ ...formData, earlyAdopterTier: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">None</option>
                <option value="FOUNDING_MEMBER">Founding Member</option>
                <option value="EARLY_ADOPTER">Early Adopter</option>
                <option value="LAUNCH_USER">Launch User</option>
              </select>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Subscription Info */}
      {user.subscription && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Subscription</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <div className="text-muted-foreground">{user.subscription.status}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Plan Type</label>
              <div className="text-muted-foreground">{user.subscription.planType || "N/A"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Early Adopter Badge Preview */}
      {user.isEarlyAdopter && user.earlyAdopterTier && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Badge Preview</h2>
          <EarlyAdopterBadge tier={user.earlyAdopterTier} />
        </div>
      )}

      {/* Referrals */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Referrals ({user.referralsGiven?.length || 0})
        </h2>
        {user.referralsGiven && user.referralsGiven.length > 0 ? (
          <div className="space-y-2">
            {user.referralsGiven.map((ref: any) => (
              <div key={ref.id} className="p-3 bg-muted rounded-lg">
                <div className="font-medium text-foreground">
                  {ref.referee.name || ref.referee.email}
                </div>
                <div className="text-sm text-muted-foreground">
                  Joined: {new Date(ref.referee.createdAt).toLocaleDateString()} • Status: {ref.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No referrals yet</p>
        )}
      </div>

      {/* Discount Code Usage */}
      {user.discountCodeUsages && user.discountCodeUsages.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Discount Codes Used ({user.discountCodeUsages.length})
          </h2>
          <div className="space-y-2">
            {user.discountCodeUsages.map((usage: any) => (
              <div key={usage.id} className="p-3 bg-muted rounded-lg">
                <div className="font-mono font-semibold text-foreground">
                  {usage.discountCode.code}
                </div>
                <div className="text-sm text-muted-foreground">
                  Saved: ${(usage.amountSaved / 100).toFixed(2)} • Used: {new Date(usage.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Stats */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Activity Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {user._count.challengeAttempts || 0}
            </div>
            <div className="text-sm text-muted-foreground">Challenge Attempts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {user._count.examAttempts || 0}
            </div>
            <div className="text-sm text-muted-foreground">Exam Attempts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {user._count.aigpExamAttempts || 0}
            </div>
            <div className="text-sm text-muted-foreground">AIGP Exam Attempts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {user._count.agentConversations || 0}
            </div>
            <div className="text-sm text-muted-foreground">Startegizer Conversations</div>
          </div>
        </div>
      </div>
    </div>
  );
}

