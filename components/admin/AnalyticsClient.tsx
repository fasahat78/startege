"use client";

import { useState, useEffect } from "react";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    newUsers: number;
    premiumUsers: number;
    earlyAdopters: number;
    activeUsers: number;
    totalRevenue: number;
    monthlyRecurringRevenue: number;
  };
  earlyAdopterBreakdown: Array<{
    earlyAdopterTier: string | null;
    _count: number;
  }>;
  discountCodeStats: Array<{
    code: string;
    uses: number;
    maxUses: number | null;
    totalSavings: number;
  }>;
  referralStats: Array<{
    status: string;
    _count: number;
  }>;
  subscriptionStats: Array<{
    status: string;
    planType: string | null;
    _count: number;
  }>;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?days=${days}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      {/* Time Period Selector */}
      <div className="flex gap-2">
        {[7, 30, 90, 365].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded-lg border transition ${
              days === d
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            {d} days
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-2xl font-bold text-foreground mb-1">
            {data.overview.totalUsers.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Users</div>
          <div className="text-xs text-muted-foreground mt-1">
            +{data.overview.newUsers} new ({days} days)
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {data.overview.premiumUsers.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Premium Users</div>
          <div className="text-xs text-muted-foreground mt-1">
            {((data.overview.premiumUsers / data.overview.totalUsers) * 100).toFixed(1)}% conversion
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {data.overview.earlyAdopters.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Early Adopters</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-2xl font-bold text-emerald-600 mb-1">
            {formatCurrency(data.overview.totalRevenue)}
          </div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
          <div className="text-xs text-muted-foreground mt-1">
            MRR: {formatCurrency(data.overview.monthlyRecurringRevenue)}
          </div>
        </div>
      </div>

      {/* Early Adopter Breakdown */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Early Adopter Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.earlyAdopterBreakdown.map((item) => (
            <div key={item.earlyAdopterTier || "none"} className="p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold text-foreground">
                {item.earlyAdopterTier?.replace("_", " ") || "None"}
              </div>
              <div className="text-2xl font-bold text-purple-600 mt-1">
                {item._count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discount Code Stats */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Discount Code Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-sm font-semibold text-foreground">Code</th>
                <th className="text-left py-2 text-sm font-semibold text-foreground">Uses</th>
                <th className="text-left py-2 text-sm font-semibold text-foreground">Total Savings</th>
              </tr>
            </thead>
            <tbody>
              {data.discountCodeStats.map((stat) => (
                <tr key={stat.code} className="border-b border-border">
                  <td className="py-2 font-mono font-semibold text-foreground">{stat.code}</td>
                  <td className="py-2 text-foreground">
                    {stat.uses} / {stat.maxUses || "∞"}
                  </td>
                  <td className="py-2 text-green-600 font-semibold">
                    {formatCurrency(stat.totalSavings)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Stats */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Subscription Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.subscriptionStats.map((stat) => (
            <div key={`${stat.status}-${stat.planType}`} className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">
                {stat.status} • {stat.planType || "N/A"}
              </div>
              <div className="text-xl font-bold text-foreground mt-1">
                {stat._count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

