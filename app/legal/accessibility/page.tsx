/**
 * Accessibility Statement Page
 */

export default function AccessibilityStatementPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Accessibility Statement</h1>
        
        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Last Updated:</strong> January 2025
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Innovationera Pty Ltd ("we", "our", or "us") is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to achieve these goals.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Our Commitment</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We aim to make Startege accessible and usable for all users, including those with disabilities. We are committed to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Ensuring our platform is accessible to the widest possible audience</li>
              <li>Following web accessibility best practices and standards</li>
              <li>Regularly reviewing and improving accessibility</li>
              <li>Providing alternative ways to access information when needed</li>
              <li>Responding to accessibility feedback and concerns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Accessibility Standards</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These guidelines explain how to make web content more accessible for people with disabilities and user-friendly for everyone.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              WCAG 2.1 Level AA compliance means our platform aims to meet standards for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>Perceivable content (text alternatives, captions, sufficient contrast)</li>
              <li>Operable interface (keyboard accessible, no seizure-inducing content)</li>
              <li>Understandable information (readable, predictable, input assistance)</li>
              <li>Robust content (compatible with assistive technologies)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Current Accessibility Features</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our platform includes the following accessibility features:
            </p>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Keyboard Navigation</h3>
                <p className="leading-relaxed">
                  Our platform can be navigated using a keyboard. All interactive elements are accessible via keyboard shortcuts.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Screen Reader Support</h3>
                <p className="leading-relaxed">
                  We use semantic HTML and ARIA labels to support screen readers and other assistive technologies.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Color Contrast</h3>
                <p className="leading-relaxed">
                  We maintain sufficient color contrast ratios to ensure text is readable for users with visual impairments.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Responsive Design</h3>
                <p className="leading-relaxed">
                  Our platform is responsive and works across different devices and screen sizes, making it accessible on mobile, tablet, and desktop devices.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Alternative Text</h3>
                <p className="leading-relaxed">
                  We provide alternative text for images where appropriate to support screen readers.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Focus Indicators</h3>
                <p className="leading-relaxed">
                  Interactive elements have visible focus indicators to help users navigate using keyboards.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Known Limitations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Despite our best efforts to ensure accessibility, there may be some limitations. We are aware of the following areas that may need improvement:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Some third-party content or integrations may not be fully accessible</li>
              <li>Some older content may not meet current accessibility standards</li>
              <li>Certain interactive features may require mouse interaction (we are working on keyboard alternatives)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We are actively working to address these limitations and improve accessibility across our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Ongoing Improvements</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We are committed to continuously improving accessibility. Our ongoing efforts include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Regular accessibility audits and testing</li>
              <li>User feedback integration</li>
              <li>Staff training on accessibility best practices</li>
              <li>Implementation of accessibility improvements in new features</li>
              <li>Remediation of identified accessibility barriers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Feedback and Reporting Issues</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We welcome your feedback on the accessibility of Startege. If you encounter accessibility barriers or have suggestions for improvement, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-muted-foreground mb-2">
                <strong>Innovationera Pty Ltd</strong>
              </p>
              <p className="text-muted-foreground mb-2">
                Email: startege.info@gmail.com
              </p>
              <p className="text-muted-foreground mb-2">
                Subject: Accessibility Feedback
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              When reporting accessibility issues, please include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>The page or feature where you encountered the issue</li>
              <li>A description of the accessibility barrier</li>
              <li>Your device, browser, and assistive technology (if applicable)</li>
              <li>Any suggestions for improvement</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Alternative Access</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are unable to access any part of our platform due to accessibility barriers, please contact us using the information above. We will work with you to provide the information or service you need through an alternative method.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our platform may include content from third-party services (such as Firebase, Stripe, or Google Cloud Platform). We do not control the accessibility of these third-party services, but we encourage them to provide accessible content. If you encounter accessibility issues with third-party content, please let us know and we will work with the third party to address the issue.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Updates to This Statement</h2>
            <p className="text-muted-foreground leading-relaxed">
              We will review and update this Accessibility Statement regularly to reflect our ongoing commitment to accessibility and any improvements we make. The "Last Updated" date at the top of this page indicates when this statement was last revised.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For questions or concerns about accessibility, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-muted-foreground mb-2">
                <strong>Innovationera Pty Ltd</strong>
              </p>
              <p className="text-muted-foreground mb-2">
                ACN: 643 136 752
              </p>
              <p className="text-muted-foreground">
                Email: startege.info@gmail.com
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

