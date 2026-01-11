/**
 * Cookie Policy Page
 */

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Cookie Policy</h1>
        
        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Last Updated:</strong> January 2025
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This Cookie Policy explains how Innovationera Pty Ltd ("we", "our", or "us") uses cookies and similar tracking technologies on Startege ("the Platform", "our platform", or "our service"). This policy should be read together with our Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Cookies allow a website to recognize your device and store some information about your preferences or past actions. This helps us provide you with a better experience when you browse our platform and allows us to improve our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use cookies for the following purposes:
            </p>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Essential Cookies</h3>
                <p className="leading-relaxed">
                  These cookies are necessary for the platform to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies as they are essential for the service to work.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Authentication cookies (Firebase Authentication)</li>
                  <li>Session management cookies</li>
                  <li>Security cookies</li>
                  <li>Load balancing cookies</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Functional Cookies</h3>
                <p className="leading-relaxed">
                  These cookies allow the platform to remember choices you make (such as your username, language, or region) and provide enhanced, personalized features.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>User preference cookies</li>
                  <li>Language selection cookies</li>
                  <li>Theme/display preference cookies</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Analytics Cookies</h3>
                <p className="leading-relaxed">
                  These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously. This helps us improve the way our platform works.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Page view tracking</li>
                  <li>User interaction tracking</li>
                  <li>Performance monitoring</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use third-party services that may set cookies on your device:
            </p>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Firebase (Google)</h3>
                <p className="leading-relaxed">
                  We use Firebase Authentication for user authentication. Firebase may set cookies to manage authentication sessions and provide security features. For more information, please see Google's Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Stripe</h3>
                <p className="leading-relaxed">
                  We use Stripe for payment processing. Stripe may set cookies to ensure secure payment processing and prevent fraud. For more information, please see Stripe's Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Google Cloud Platform</h3>
                <p className="leading-relaxed">
                  Our platform is hosted on Google Cloud Platform. Google may set cookies for load balancing, security, and performance monitoring. For more information, please see Google Cloud's Privacy Policy.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer.
            </p>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Browser Settings</h3>
                <p className="leading-relaxed mb-2">
                  You can control cookies through your browser settings. Here are links to instructions for common browsers:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/en-au/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                  <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Impact of Disabling Cookies</h3>
                <p className="leading-relaxed">
                  Please note that disabling cookies may affect the functionality of our platform. Some features may not work properly if cookies are disabled, including:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>User authentication and login</li>
                  <li>Remembering your preferences</li>
                  <li>Payment processing</li>
                  <li>Personalized content</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Cookie Consent</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you first visit our platform, we may ask for your consent to use certain types of cookies. You can withdraw your consent at any time by adjusting your browser settings or contacting us using the contact information provided below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Cookie Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Cookie Policy on this page and updating the "Last Updated" date.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-muted-foreground mb-2">
                <strong>Innovationera Pty Ltd</strong>
              </p>
              <p className="text-muted-foreground mb-2">
                ACN: [To be provided]
              </p>
              <p className="text-muted-foreground mb-2">
                Email: [Privacy email to be provided]
              </p>
              <p className="text-muted-foreground">
                Address: [Registered address to be provided]
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

