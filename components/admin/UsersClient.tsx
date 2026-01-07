"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import EarlyAdopterBadge from "./EarlyAdopterBadge";

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  subscriptionTier: string;
  role: string;
  isAdmin: boolean;
  isEarlyAdopter: boolean;
  earlyAdopterTier: string | null;
  earlyAdopterStartDate: string | null;
  referralCode: string | null;
  referralCount: number;
  createdAt: string;
  subscription: {
    status: string;
    planType: string | null;
  } | null;
  _count: {
    referralsGiven: number;
  };
}

export default function UsersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [tier, setTier] = useState(searchParams.get("tier") || "");
  const [earlyAdopter, setEarlyAdopter] = useState(searchParams.get("earlyAdopter") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadUsers();
  }, [page, search, tier, earlyAdopter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (tier) params.set("tier", tier);
      if (earlyAdopter) params.set("earlyAdopter", earlyAdopter);
      params.set("page", page.toString());
      params.set("limit", "50");

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    router.push(`/admin/users?search=${encodeURIComponent(search)}&tier=${tier}&earlyAdopter=${earlyAdopter}`);
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div>
      {/* Filters */}
      <form onSubmit={handleSearch} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name..."
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          />
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="">All Tiers</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
          <select
            value={earlyAdopter}
            onChange={(e) => setEarlyAdopter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="">All Users</option>
            <option value="true">Early Adopters Only</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Users Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 bg-muted border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Users</h2>
              <p className="text-sm text-muted-foreground">
                {pagination.total} total users
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Tier</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Early Adopter</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Referrals</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.image && (
                        <img
                          src={user.image}
                          alt={user.name || user.email}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-medium text-foreground">
                          {user.name || "No name"}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.subscriptionTier === "premium"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.subscriptionTier}
                    </span>
                    {user.subscription && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.subscription.planType || "N/A"} • {user.subscription.status}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.isAdmin || user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.isEarlyAdopter ? (
                      <EarlyAdopterBadge tier={user.earlyAdopterTier as any} />
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {user.referralCount || 0} referrals
                    {user.referralCode && (
                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        Code: {user.referralCode}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-sm text-accent hover:text-accent/80"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex justify-between items-center">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-border rounded-lg hover:bg-muted transition disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1 border border-border rounded-lg hover:bg-muted transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {users.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}

