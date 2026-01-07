"use client";

import { useState, useEffect } from "react";
import { EarlyAdopterTier } from "@prisma/client";
import EarlyAdopterBadge from "./EarlyAdopterBadge";

interface EarlyAdopterUser {
  id: string;
  email: string;
  name: string | null;
  earlyAdopterTier: EarlyAdopterTier | null;
  earlyAdopterStartDate: string | null;
  earlyAdopterEndDate: string | null;
  createdAt: string;
  subscriptionTier: string;
  referralCount: number;
}

export default function EarlyAdoptersClient() {
  const [users, setUsers] = useState<EarlyAdopterUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState<string>("all");

  useEffect(() => {
    loadEarlyAdopters();
  }, [tierFilter]);

  const loadEarlyAdopters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("earlyAdopter", "true");
      if (tierFilter !== "all") {
        // Note: This would need to be implemented in the API
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users.filter((u: any) => u.isEarlyAdopter));
      }
    } catch (error) {
      console.error("Error loading early adopters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTier = async (userId: string, tier: EarlyAdopterTier) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEarlyAdopter: true,
          earlyAdopterTier: tier,
          earlyAdopterStartDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        loadEarlyAdopters();
      } else {
        alert("Failed to assign tier");
      }
    } catch (error) {
      console.error("Error assigning tier:", error);
      alert("Failed to assign tier");
    }
  };

  const tierCounts = {
    FOUNDING_MEMBER: users.filter((u) => u.earlyAdopterTier === "FOUNDING_MEMBER").length,
    EARLY_ADOPTER: users.filter((u) => u.earlyAdopterTier === "EARLY_ADOPTER").length,
    LAUNCH_USER: users.filter((u) => u.earlyAdopterTier === "LAUNCH_USER").length,
    none: users.filter((u) => !u.earlyAdopterTier).length,
  };

  if (loading) {
    return <div className="text-center py-8">Loading early adopters...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tier Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Founding Members</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {tierCounts.FOUNDING_MEMBER}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Target: 100</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Early Adopters</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {tierCounts.EARLY_ADOPTER}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Target: 400</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Launch Users</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {tierCounts.LAUNCH_USER}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Target: 500+</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Total Early Adopters</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {users.length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
        >
          <option value="all">All Tiers</option>
          <option value="FOUNDING_MEMBER">Founding Members</option>
          <option value="EARLY_ADOPTER">Early Adopters</option>
          <option value="LAUNCH_USER">Launch Users</option>
          <option value="none">Unassigned</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Tier</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Referrals</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users
                .filter((u) => tierFilter === "all" || u.earlyAdopterTier === tierFilter || (tierFilter === "none" && !u.earlyAdopterTier))
                .map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{user.name || "No name"}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {user.earlyAdopterTier ? (
                        <EarlyAdopterBadge tier={user.earlyAdopterTier} />
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {user.referralCount || 0}
                    </td>
                    <td className="px-4 py-3">
                      {!user.earlyAdopterTier && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAssignTier(user.id, "FOUNDING_MEMBER")}
                            className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition"
                          >
                            Assign Founding
                          </button>
                          <button
                            onClick={() => handleAssignTier(user.id, "EARLY_ADOPTER")}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                          >
                            Assign Early
                          </button>
                          <button
                            onClick={() => handleAssignTier(user.id, "LAUNCH_USER")}
                            className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                          >
                            Assign Launch
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No early adopters found
          </div>
        )}
      </div>
    </div>
  );
}

