"use client";

import { useState, useEffect } from "react";
import { PersistentLogger } from "@/lib/persistent-logger";

export default function AuthDebugPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [persistentLogs, setPersistentLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDiagnostics() {
      try {
        const response = await fetch("/api/auth/firebase/diagnose", {
          credentials: "include",
        });
        const data = await response.json();
        setDiagnostics(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    // Load persistent logs
    const logs = PersistentLogger.getLogs();
    setPersistentLogs(logs);

    fetchDiagnostics();
  }, []);

  if (loading) {
    return <div className="p-8">Loading diagnostics...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Firebase Auth Diagnostics</h1>
        
        <div className="space-y-6">
          {/* Cookie Status */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Cookie Status</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>Present:</strong> {diagnostics.cookie.present ? "✅ Yes" : "❌ No"}</p>
              <p><strong>Length:</strong> {diagnostics.cookie.length}</p>
              <p><strong>Preview:</strong> {diagnostics.cookie.preview || "N/A"}</p>
              <p className="mt-2"><strong>Client-side cookies:</strong></p>
              <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto">
                {typeof document !== "undefined" ? document.cookie : "N/A"}
              </pre>
              <p className="mt-2 text-sm text-gray-600">
                <strong>Note:</strong> Looking for <code>firebase-session</code> cookie (httpOnly cookies won't appear in document.cookie)
              </p>
            </div>
          </div>

          {/* Token Status */}
          {diagnostics.token && (
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-2">Token Status</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>Valid:</strong> {diagnostics.token.valid ? "✅ Yes" : "❌ No"}</p>
                {diagnostics.token.valid && (
                  <>
                    <p><strong>UID:</strong> {diagnostics.token.uid}</p>
                    <p><strong>Email:</strong> {diagnostics.token.email}</p>
                    <p><strong>Email Verified:</strong> {diagnostics.token.email_verified ? "✅ Yes" : "❌ No"}</p>
                  </>
                )}
                {diagnostics.token.error && (
                  <p className="text-red-500"><strong>Error:</strong> {diagnostics.token.error}</p>
                )}
              </div>
            </div>
          )}

          {/* Headers */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Request Headers</h2>
            <div className="bg-gray-50 p-4 rounded">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(diagnostics.headers, null, 2)}
              </pre>
            </div>
          </div>

          {/* Environment */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Environment</h2>
            <div className="bg-gray-50 p-4 rounded">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(diagnostics.environment, null, 2)}
              </pre>
            </div>
          </div>

          {/* Persistent Logs */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Persistent Logs ({persistentLogs.length})</h2>
              <button
                onClick={() => {
                  PersistentLogger.clearLogs();
                  setPersistentLogs([]);
                }}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Clear Logs
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded max-h-96 overflow-auto">
              {persistentLogs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Sign in to generate logs.</p>
              ) : (
                <div className="space-y-2">
                  {persistentLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-2 rounded ${
                        log.level === "error"
                          ? "bg-red-100 text-red-800"
                          : log.level === "warn"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-50 text-blue-800"
                      }`}
                    >
                      <div className="font-mono">
                        <span className="text-gray-500">{log.timestamp.split("T")[1]?.split(".")[0] || log.timestamp}</span>{" "}
                        <span className="font-bold">[{log.level.toUpperCase()}]</span> {log.message}
                      </div>
                      {log.data && (
                        <pre className="mt-1 text-xs overflow-auto bg-white p-2 rounded">
                          {typeof log.data === "string" ? log.data : JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Full Diagnostics */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Full Diagnostics JSON</h2>
            <div className="bg-gray-50 p-4 rounded">
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(diagnostics, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

