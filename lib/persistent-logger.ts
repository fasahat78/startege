/**
 * Persistent logger that survives page reloads
 * Stores logs in localStorage for debugging
 */

const LOG_STORAGE_KEY = "startege-auth-logs";
const MAX_LOGS = 100;

interface LogEntry {
  timestamp: string;
  level: "log" | "warn" | "error" | "info";
  message: string;
  data?: any;
}

export class PersistentLogger {
  private static logs: LogEntry[] = [];

  static init() {
    // Load existing logs from localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOG_STORAGE_KEY);
        if (stored) {
          this.logs = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Failed to load persistent logs:", e);
      }
    }
  }

  static log(message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "log",
      message,
      data,
    };
    this.addLog(entry);
    console.log(`[PERSISTENT] ${message}`, data || "");
  }

  static warn(message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "warn",
      message,
      data,
    };
    this.addLog(entry);
    console.warn(`[PERSISTENT] ${message}`, data || "");
  }

  static error(message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      data,
    };
    this.addLog(entry);
    console.error(`[PERSISTENT] ${message}`, data || "");
  }

  static info(message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "info",
      message,
      data,
    };
    this.addLog(entry);
    console.info(`[PERSISTENT] ${message}`, data || "");
  }

  private static addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Keep only last MAX_LOGS entries
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(-MAX_LOGS);
    }

    // Save to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.logs));
      } catch (e) {
        console.error("Failed to save persistent logs:", e);
      }
    }
  }

  static getLogs(): LogEntry[] {
    return [...this.logs];
  }

  static clearLogs() {
    this.logs = [];
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOG_STORAGE_KEY);
    }
  }

  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Initialize on load
if (typeof window !== "undefined") {
  PersistentLogger.init();
}

