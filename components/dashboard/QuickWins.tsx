"use client";

import Link from "next/link";

interface QuickWin {
  type: string;
  title: string;
  description: string;
  action: string;
  actionUrl: string;
  priority: "high" | "medium" | "low";
}

interface QuickWinsProps {
  quickWins: QuickWin[];
}

const priorityColors: Record<string, string> = {
  high: "bg-status-success/10 border-status-success/20",
  medium: "bg-primary/10 border-primary/20",
  low: "bg-muted border-border",
};

const priorityIcons: Record<string, string> = {
  high: "⚡",
  medium: "🎯",
  low: "💡",
};

export default function QuickWins({ quickWins }: QuickWinsProps) {
  if (quickWins.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          Quick Wins
        </h3>
        <p className="text-muted-foreground">
          Great job! You're on track. Keep up the momentum!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">
        Quick Wins & Daily Goals
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickWins.map((win, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${priorityColors[win.priority] || priorityColors.medium}`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="text-2xl">
                {priorityIcons[win.priority] || priorityIcons.medium}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-card-foreground mb-1">
                  {win.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {win.description}
                </p>
                <Link
                  href={win.actionUrl}
                  className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition"
                >
                  {win.action} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

