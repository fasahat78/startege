"use client";

/**
 * Test page to verify redirect + cookie works
 */
export default function TestRedirectPage() {
  const handleTest = () => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/firebase/test-redirect";
    form.style.display = "none";
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-8">
      <div className="max-w-md w-full bg-card rounded-lg shadow-card p-8 border-2 border-border">
        <h1 className="text-2xl font-bold mb-4">Redirect Test</h1>
        <p className="text-muted-foreground mb-6">
          Click the button below to test if redirect + cookie setting works.
          You should be redirected to /debug/auth and see a test-session cookie.
          Check Network tab for POST request → should show 303 status + Set-Cookie header.
        </p>
        <button
          onClick={handleTest}
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
        >
          Test Redirect + Cookie
        </button>
      </div>
    </div>
  );
}

