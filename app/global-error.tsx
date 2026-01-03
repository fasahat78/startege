"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-muted px-4">
          <div className="max-w-md w-full bg-card shadow-card rounded-lg p-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">
              Application Error
            </h2>
            <p className="text-muted-foreground mb-4">
              {error.message || "A critical error occurred"}
            </p>
            <button
              onClick={reset}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

