/**
 * Privacy Policy Page
 */

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Last Updated:</strong> January 2025
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Startege ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Account Information</h3>
                <p className="leading-relaxed">
                  When you create an account, we collect your email address, name (if provided), and authentication credentials through Firebase Authentication.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Usage Data</h3>
                <p className="leading-relaxed">
                  We collect information about how you interact with our platform, including:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Learning progress and achievements</li>
                  <li>Exam attempts and scores</li>
                  <li>Concept card interactions</li>
                  <li>Feature usage patterns</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Payment Information</h3>
                <p className="leading-relaxed">
                  Payment processing is handled by Stripe. We do not store your credit card information. We only receive confirmation of successful transactions and subscription status.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>To provide and maintain our educational platform</li>
              <li>To track your learning progress and achievements</li>
              <li>To personalize your learning experience</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send you important updates about the platform</li>
              <li>To improve our services and develop new features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your data is stored securely using:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Google Cloud Platform:</strong> All data is stored on Google Cloud SQL (PostgreSQL) with encryption at rest</li>
              <li><strong>Firebase Authentication:</strong> Authentication credentials are managed by Google Firebase</li>
              <li><strong>Stripe:</strong> Payment information is processed securely by Stripe</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We implement industry-standard security measures to protect your data, including encryption, access controls, and regular security audits.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Firebase:</strong> Authentication and user management</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Google Cloud Platform:</strong> Hosting and data storage</li>
              <li><strong>Google Vertex AI / Gemini:</strong> AI-powered features (Startegizer)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These services have their own privacy policies. We recommend reviewing them to understand how they handle your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of certain data processing activities</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us through the platform or email us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use session cookies to maintain your authentication state. These cookies are essential for the platform to function and are not used for tracking or advertising purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our platform is not intended for users under the age of 18. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section className="mb-8 bg-accent/5 border border-accent/20 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through the platform.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

