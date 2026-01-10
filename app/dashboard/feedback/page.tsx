import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import FeedbackFormClient from "@/components/feedback/FeedbackFormClient";

export const dynamic = 'force-dynamic';

export default async function FeedbackPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/dashboard/feedback");
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Send Feedback</h1>
          <p className="text-muted-foreground">
            Help us improve Startege by sharing your thoughts, reporting bugs, or suggesting features.
          </p>
        </div>

        {/* Feedback Form */}
        <FeedbackFormClient />
      </div>
    </div>
  );
}

