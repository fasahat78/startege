/**
 * Terms of Service Page
 */

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Last Updated:</strong> January 2025
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Please read these Terms of Service ("Terms") carefully before using Startege ("the Platform", "we", "our", or "us"). By accessing or using our platform, you agree to be bound by these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By creating an account, accessing, or using Startege, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Startege is an educational platform that provides:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>AI Governance concept cards and learning materials</li>
              <li>Interactive challenges and exams</li>
              <li>AI-powered learning assistant (Startegizer)</li>
              <li>Progress tracking and gamification features</li>
              <li>AIGP exam preparation resources</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">User Accounts</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Account Creation</h3>
                <p className="leading-relaxed">
                  You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Account Responsibility</h3>
                <p className="leading-relaxed">
                  You are responsible for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Age Requirement</h3>
                <p className="leading-relaxed">
                  You must be at least 18 years old to use the Platform. By using Startege, you represent that you are at least 18 years of age.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Subscription and Payment</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Free Tier</h3>
                <p className="leading-relaxed">
                  Basic features are available free of charge. Free tier access may be limited compared to premium features.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Premium Subscriptions</h3>
                <p className="leading-relaxed">
                  Premium subscriptions are billed monthly or annually. Subscription fees are processed through Stripe and are non-refundable except as required by law.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Cancellation</h3>
                <p className="leading-relaxed">
                  You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. You will continue to have access to premium features until the end of the billing period.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">AI Credits</h3>
                <p className="leading-relaxed">
                  AI credits are purchased separately and are non-refundable. Credits expire according to the terms specified at the time of purchase.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">User Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Use the Platform for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to the Platform or its systems</li>
              <li>Interfere with or disrupt the Platform's operation</li>
              <li>Share your account credentials with others</li>
              <li>Use automated systems to access the Platform without permission</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Platform</li>
              <li>Copy, modify, or distribute Platform content without authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All content on Startege, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Concept cards and learning materials</li>
              <li>Exam questions and challenges</li>
              <li>Platform design and user interface</li>
              <li>Logos and branding</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              are the property of Startege or its licensors and are protected by copyright, trademark, and other intellectual property laws. You may not use, reproduce, or distribute any content without our express written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Educational Content Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              While Startege provides educational content to help you prepare for the AIGP certification exam:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>We do not guarantee that using the Platform will result in passing the exam</li>
              <li>Exam content and formats may change without notice</li>
              <li>We are not affiliated with the AIGP certification body</li>
              <li>Platform content is for educational purposes only</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, Startege shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to maintain Platform availability but do not guarantee uninterrupted access. The Platform may be unavailable due to maintenance, updates, or unforeseen circumstances. We are not liable for any downtime or service interruptions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We reserve the right to suspend or terminate your account at any time, with or without notice, for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Abuse of the Platform or other users</li>
              <li>Non-payment of subscription fees</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of significant changes by posting the updated Terms on this page and updating the "Last Updated" date. Your continued use of the Platform after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
            </p>
          </section>

          <section className="mb-8 bg-accent/5 border border-accent/20 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us through the platform.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

