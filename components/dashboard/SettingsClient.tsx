"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toast";
import { Skeleton, SkeletonList } from "@/components/ui/Skeleton";

interface UserSettings {
  id: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  learningReminders: boolean;
  reminderTime: string | null;
  profileVisibility: string;
  dataSharing: boolean;
}

export default function SettingsClient() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      console.log("[SETTINGS_CLIENT] Fetching settings...");
      const response = await fetch("/api/dashboard/settings", {
        credentials: "include", // Include cookies for authentication
      });
      
      console.log("[SETTINGS_CLIENT] Response status:", response.status);
      console.log("[SETTINGS_CLIENT] Response ok:", response.ok);
      console.log("[SETTINGS_CLIENT] Response headers:", Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Failed to fetch settings (${response.status})`;
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            console.error("[SETTINGS_CLIENT] Error data:", errorData);
            errorMessage = errorData.error || errorData.details || errorMessage;
          } catch (e) {
            console.error("[SETTINGS_CLIENT] Failed to parse error JSON:", e);
          }
        } else {
          // Try to get text response
          try {
            const text = await response.text();
            console.error("[SETTINGS_CLIENT] Error response text:", text.substring(0, 200));
            if (text.includes("Unauthorized") || response.status === 401) {
              errorMessage = "Please sign in to access settings";
            }
          } catch (e) {
            console.error("[SETTINGS_CLIENT] Failed to read error text:", e);
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("[SETTINGS_CLIENT] Settings data:", data);
      setSettings(data);
    } catch (err: any) {
      console.error("[SETTINGS_CLIENT] Error fetching settings:", err);
      toast(err.message || "Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (field: keyof UserSettings, value: any) => {
    if (!settings) return;

    const updatedSettings = { ...settings, [field]: value };
    setSettings(updatedSettings);

    try {
      setSaving(true);
      const response = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update settings");
      }

      toast("Settings saved successfully!", "success");
    } catch (err: any) {
      console.error("Error updating settings:", err);
      toast(err.message || "Failed to update settings", "error");
      // Revert on error
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/dashboard/settings/export");
      if (!response.ok) throw new Error("Failed to export data");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `startege-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast("Data exported successfully!", "success");
    } catch (err) {
      console.error("Error exporting data:", err);
      toast("Failed to export data. Please try again.", "error");
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
    );
    if (confirmed) {
      // TODO: Implement account deletion
      toast("Account deletion is not yet implemented. Please contact support.", "info");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-6 text-center">
        <p className="text-status-error">Failed to load settings</p>
        <button
          onClick={fetchSettings}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Notification Preferences */}
      <div className="bg-card rounded-lg shadow-card p-6 border border-border">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">
          Notification Preferences
        </h2>

        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-card-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your learning progress
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  handleToggle("emailNotifications", e.target.checked)
                }
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* In-App Notifications */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-card-foreground">In-App Notifications</p>
              <p className="text-sm text-muted-foreground">
                Get notified about achievements and milestones
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.inAppNotifications}
                onChange={(e) =>
                  handleToggle("inAppNotifications", e.target.checked)
                }
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Learning Reminders */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="font-medium text-card-foreground">Learning Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Daily reminders to continue your learning journey
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.learningReminders}
                  onChange={(e) =>
                    handleToggle("learningReminders", e.target.checked)
                  }
                  disabled={saving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            {settings.learningReminders && (
              <div className="mt-3">
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                  Reminder Time
                </label>
                <input
                  type="time"
                  value={settings.reminderTime || "09:00"}
                  onChange={(e) => handleToggle("reminderTime", e.target.value)}
                  disabled={saving}
                  className="px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-card rounded-lg shadow-card p-6 border border-border">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">
          Privacy Settings
        </h2>

        <div className="space-y-4">
          {/* Profile Visibility */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Profile Visibility
            </label>
            <p className="text-sm text-muted-foreground mb-3">
              Control who can see your profile information
            </p>
            <select
              value={settings.profileVisibility}
              onChange={(e) => handleToggle("profileVisibility", e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>

          {/* Data Sharing */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-card-foreground">Data Sharing</p>
              <p className="text-sm text-muted-foreground">
                Allow your data to be used for analytics and improvements
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dataSharing}
                onChange={(e) => handleToggle("dataSharing", e.target.checked)}
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-card rounded-lg shadow-card p-6 border border-border">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">
          Data Management
        </h2>

        <div className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-card-foreground">Export Data</p>
              <p className="text-sm text-muted-foreground">
                Download all your data in a portable JSON format
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition text-sm"
            >
              Export Data
            </button>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between p-4 bg-status-error/10 rounded-lg border border-status-error/20">
            <div className="flex-1">
              <p className="font-medium text-status-error">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-status-error text-white rounded-lg font-semibold hover:bg-status-error/90 transition text-sm"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

