'use client';

import { useState } from 'react';
import { Loader2, Play, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ScanJob {
  id: string;
  scanType: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  articlesFound: number | null;
  articlesProcessed: number | null;
  articlesAdded: number | null;
  errors: any;
}

interface MarketScanAdminClientProps {
  initialScans: ScanJob[];
  articleCount: number;
}

export default function MarketScanAdminClient({ initialScans, articleCount }: MarketScanAdminClientProps) {
  const [scans, setScans] = useState<ScanJob[]>(initialScans);
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const triggerScan = async () => {
    setIsRunning(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/market-scan/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to trigger scan');
      }

      setLastResult({
        success: true,
        ...data,
      });

      // Refresh scan history
      const historyResponse = await fetch('/api/market-scan/run');
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setScans(historyData.scanJobs || []);
      }

      // Refresh page after a delay to show new scan
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setLastResult({
        success: false,
        error: error.message,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</span>;
      case 'RUNNING':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><Clock className="w-3 h-3 mr-1" />Running</span>;
      case 'FAILED':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="w-3 h-3 mr-1" />Failed</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startedAt: string, completedAt: string | null) => {
    if (!completedAt) return 'In progress...';
    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const seconds = Math.floor((end - start) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Stats and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Total Articles</h3>
          <p className="text-sm text-muted-foreground mb-4">Active articles in database</p>
          <div className="text-3xl font-bold">{articleCount.toLocaleString()}</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Recent Scans</h3>
          <p className="text-sm text-muted-foreground mb-4">Last 20 scan jobs</p>
          <div className="text-3xl font-bold">{scans.length}</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Manual Trigger</h3>
          <p className="text-sm text-muted-foreground mb-4">Run a market scan now</p>
          <button
            onClick={triggerScan}
            disabled={isRunning}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Scan...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Trigger Scan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Last Result */}
      {lastResult && (
        <div className={`bg-card rounded-lg border p-6 ${lastResult.success ? 'border-green-500' : 'border-red-500'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${lastResult.success ? 'text-green-600' : 'text-red-600'}`}>
            {lastResult.success ? '✅ Scan Completed' : '❌ Scan Failed'}
          </h3>
          <div>
            {lastResult.success ? (
              <div className="space-y-2">
                <p><strong>Scan Job ID:</strong> {lastResult.scanJobId}</p>
                <p><strong>Articles Found:</strong> {lastResult.articlesFound}</p>
                <p><strong>Articles Processed:</strong> {lastResult.articlesProcessed}</p>
                <p><strong>Articles Added:</strong> {lastResult.articlesAdded}</p>
                {lastResult.errors > 0 && (
                  <p className="text-yellow-600"><strong>Errors:</strong> {lastResult.errors}</p>
                )}
              </div>
            ) : (
              <p className="text-red-600">{lastResult.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Scan History */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-2">Scan History</h3>
        <p className="text-sm text-muted-foreground mb-4">Recent market scan jobs</p>
        <div>
          {scans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No scan history yet. Trigger a scan to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(scan.status)}
                      <span className="text-sm text-muted-foreground">
                        {scan.scanType}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(scan.startedAt)}
                    </span>
                  </div>
                  
                  {scan.status === 'COMPLETED' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Found</div>
                        <div className="font-semibold">{scan.articlesFound ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Processed</div>
                        <div className="font-semibold">{scan.articlesProcessed ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Added</div>
                        <div className="font-semibold text-green-600">{scan.articlesAdded ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                        <div className="font-semibold">{formatDuration(scan.startedAt, scan.completedAt)}</div>
                      </div>
                    </div>
                  )}

                  {scan.errors && typeof scan.errors === 'object' && Object.keys(scan.errors).length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                      <strong className="text-yellow-800 dark:text-yellow-200">Errors:</strong>
                      <pre className="mt-1 text-xs overflow-x-auto">
                        {JSON.stringify(scan.errors, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">About Market Scan</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Market Scan automatically fetches articles from RSS feeds and news sources related to AI governance,
            compliance, and regulation. Articles are verified using AI and stored in the database.
          </p>
          <p>
            <strong>Automated Scans:</strong> Cloud Scheduler runs scans monthly (configured separately).
          </p>
          <p>
            <strong>Manual Scans:</strong> Use the "Trigger Scan" button above to run a scan immediately.
          </p>
          <p>
            <strong>Note:</strong> Scans may take several minutes to complete. The scan runs asynchronously
            and will continue even if you navigate away from this page.
          </p>
        </div>
      </div>
    </div>
  );
}

