/**
 * Privacy Policy Page
 * Comprehensive privacy policy covering Australian Privacy Act, GDPR, and CCPA
 * 
 * IMPORTANT: This is a template. Review with qualified legal counsel before use.
 * Replace [placeholders] with actual company information.
 */

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none">
          {/* Company Information */}
          <section className="mb-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Last Updated:</strong> January 2025
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Company:</strong> Innovationera Pty Ltd<br />
              <strong>ACN:</strong> 643 136 752
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Innovationera Pty Ltd ("we", "our", "us", or "the Company") operates Startege ("the Platform", "our platform", or "our service"). We are committed to protecting your privacy and handling your personal information in accordance with applicable privacy laws, including the Australian Privacy Act 1988 (Cth), the General Data Protection Regulation (GDPR), and the California Consumer Privacy Act (CCPA).
            </p>
          </section>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This Privacy Policy explains how we collect, use, disclose, store, and protect your personal information when you use Startege. It also explains your rights regarding your personal information and how you can exercise those rights.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By using our Platform, you consent to the collection and use of your personal information as described in this Privacy Policy. If you do not agree with this Privacy Policy, please do not use our Platform.
            </p>
          </section>

          {/* Information We Collect - APP 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect personal information that you provide directly to us and information that is automatically collected when you use our Platform. The types of personal information we collect include:
            </p>
            
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">1.1 Account Information</h3>
                <p className="leading-relaxed mb-2">When you create an account, we collect:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Email address (required)</li>
                  <li>Name or display name (optional)</li>
                  <li>Authentication credentials (managed by Firebase Authentication)</li>
                  <li>Profile picture (if provided via OAuth providers)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">1.2 Profile Information</h3>
                <p className="leading-relaxed mb-2">During onboarding, we collect:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Persona type (e.g., Compliance Officer, AI Developer, Business Executive)</li>
                  <li>Custom persona description (if "Other" is selected)</li>
                  <li>Knowledge level (Beginner, Intermediate, Advanced)</li>
                  <li>Interests (selected from predefined list)</li>
                  <li>Learning goals (selected from predefined list)</li>
                  <li>Knowledge assessment answers</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">1.3 Usage and Activity Data</h3>
                <p className="leading-relaxed mb-2">We automatically collect information about how you use our Platform:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Concept cards viewed and completed</li>
                  <li>Exam attempts, scores, and results</li>
                  <li>Learning progress and achievements</li>
                  <li>Points earned and badges received</li>
                  <li>Streak information</li>
                  <li>Feature usage patterns</li>
                  <li>Time spent on different sections</li>
                  <li>Startegizer conversation history</li>
                  <li>Market scan article interactions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">1.4 Payment and Subscription Information</h3>
                <p className="leading-relaxed mb-2">When you purchase a subscription or AI credits:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Payment method information (processed by Stripe - we do not store full card details)</li>
                  <li>Billing address</li>
                  <li>Subscription tier and status</li>
                  <li>Purchase history</li>
                  <li>AI credit balance and usage</li>
                  <li>Refund information (if applicable)</li>
                </ul>
                <p className="leading-relaxed mt-2 text-sm">
                  <strong>Note:</strong> Payment card information is processed securely by Stripe and is not stored on our servers. We only receive confirmation of successful transactions and subscription status.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">1.5 Technical Information</h3>
                <p className="leading-relaxed mb-2">We automatically collect technical information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Device information (type, operating system)</li>
                  <li>Screen resolution and display settings</li>
                  <li>Referrer URL</li>
                  <li>Access times and dates</li>
                  <li>Error logs and crash reports</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">1.6 Communication Data</h3>
                <p className="leading-relaxed mb-2">If you contact us or submit feedback:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Contact information you provide</li>
                  <li>Message content</li>
                  <li>Support ticket history</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information - APP 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use your personal information for the following purposes:
            </p>
            
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">2.1 Service Provision</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Create and manage your account</li>
                  <li>Provide access to Platform features and content</li>
                  <li>Personalize your learning experience based on your profile</li>
                  <li>Track and display your learning progress</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Provide AI-powered features (Startegizer)</li>
                  <li>Deliver market scan articles and updates</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">2.2 Communication</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Send important service updates and notifications</li>
                  <li>Respond to your inquiries and support requests</li>
                  <li>Send administrative information (account changes, security alerts)</li>
                  <li>Send marketing communications (with your consent - you can opt-out)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">2.3 Improvement and Analytics</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Analyze Platform usage and performance</li>
                  <li>Improve our services and develop new features</li>
                  <li>Conduct research and analytics</li>
                  <li>Identify and fix technical issues</li>
                  <li>Ensure Platform security and prevent fraud</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">2.4 Legal Compliance</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Comply with legal obligations</li>
                  <li>Respond to legal requests and court orders</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Protect our rights and the rights of our users</li>
                  <li>Prevent fraud and abuse</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Lawful Basis (GDPR):</strong> We process your personal information based on: (1) Contract - to provide our services; (2) Consent - for marketing communications; (3) Legitimate Interest - for analytics and security; (4) Legal Obligation - to comply with applicable laws.
              </p>
            </div>
          </section>

          {/* Disclosure - APP 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Disclosure of Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may disclose your personal information to:
            </p>

            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">3.1 Service Providers</h3>
                <p className="leading-relaxed mb-2">We share information with third-party service providers who perform services on our behalf:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Google Firebase:</strong> Authentication and user management</li>
                  <li><strong>Stripe:</strong> Payment processing</li>
                  <li><strong>Google Cloud Platform:</strong> Hosting, data storage, and AI services (Vertex AI/Gemini)</li>
                  <li><strong>Cloud SQL:</strong> Database hosting</li>
                </ul>
                <p className="leading-relaxed mt-2 text-sm">
                  These service providers are contractually obligated to protect your information and use it only for the purposes we specify.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">3.2 Legal Requirements</h3>
                <p className="leading-relaxed mb-2">We may disclose information if required by law or in response to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Court orders or legal processes</li>
                  <li>Government requests</li>
                  <li>Regulatory investigations</li>
                  <li>To protect our rights or the rights of others</li>
                  <li>To prevent fraud or abuse</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">3.3 Business Transfers</h3>
                <p className="leading-relaxed">
                  If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change in ownership or control.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">3.4 With Your Consent</h3>
                <p className="leading-relaxed">
                  We may share your information with other parties when you have given us explicit consent to do so.
                </p>
              </div>
            </div>
          </section>

          {/* Cross-Border Disclosure - APP 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Cross-Border Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your personal information may be stored and processed in countries outside of Australia, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>United States:</strong> Google Cloud Platform data centers, Firebase, Stripe</li>
              <li><strong>European Union:</strong> Google Cloud Platform data centers (for EU users)</li>
              <li><strong>Other countries:</strong> Where our service providers operate</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When we transfer personal information outside Australia, we take reasonable steps to ensure that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>The recipient is subject to laws that provide adequate protection (or we use appropriate safeguards)</li>
              <li>We have contractual arrangements in place to protect your information</li>
              <li>For EU users: We use Standard Contractual Clauses (SCCs) or other approved transfer mechanisms</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By using our Platform, you consent to the transfer of your information to these countries.
            </p>
          </section>

          {/* Data Security - APP 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Encryption:</strong> Data is encrypted in transit (TLS/SSL) and at rest</li>
              <li><strong>Access Controls:</strong> Limited access to personal information on a need-to-know basis</li>
              <li><strong>Authentication:</strong> Secure authentication via Firebase</li>
              <li><strong>Regular Updates:</strong> Security patches and updates applied regularly</li>
              <li><strong>Monitoring:</strong> Security monitoring and intrusion detection</li>
              <li><strong>Backups:</strong> Regular backups with secure storage</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We retain your personal information for as long as necessary to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Provide our services to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain security and prevent fraud</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Specific retention periods:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Account Information:</strong> Retained while your account is active and for 7 years after closure (for legal compliance)</li>
              <li><strong>Payment Records:</strong> Retained for 7 years (tax and legal requirements)</li>
              <li><strong>Usage Data:</strong> Retained for 2 years after account closure</li>
              <li><strong>Marketing Data:</strong> Retained until you opt-out or withdraw consent</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          {/* Your Rights - APP 12, 13, GDPR, CCPA */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you have certain rights regarding your personal information:
            </p>

            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">7.1 Australian Privacy Act Rights</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Access (APP 12):</strong> Request access to your personal information</li>
                  <li><strong>Correction (APP 13):</strong> Request correction of inaccurate information</li>
                  <li><strong>Complaint:</strong> Make a complaint about how we handle your information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">7.2 GDPR Rights (EU Users)</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Right to Access (Article 15):</strong> Obtain a copy of your personal information</li>
                  <li><strong>Right to Rectification (Article 16):</strong> Correct inaccurate information</li>
                  <li><strong>Right to Erasure (Article 17):</strong> Request deletion of your information ("right to be forgotten")</li>
                  <li><strong>Right to Restrict Processing (Article 18):</strong> Limit how we use your information</li>
                  <li><strong>Right to Data Portability (Article 20):</strong> Receive your data in a portable format</li>
                  <li><strong>Right to Object (Article 21):</strong> Object to certain types of processing</li>
                  <li><strong>Rights Related to Automated Decision-Making (Article 22):</strong> Not be subject to automated decision-making</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">7.3 CCPA Rights (California Users)</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Right to Know:</strong> Know what personal information is collected, used, and disclosed</li>
                  <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
                  <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information (we do not sell personal information)</li>
                  <li><strong>Right to Non-Discrimination:</strong> Not be discriminated against for exercising your rights</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">7.4 How to Exercise Your Rights</h3>
                <p className="leading-relaxed mb-2">To exercise any of these rights, please contact us:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Email: startege.info@gmail.com</li>
                  <li>Subject: "Privacy Rights Request"</li>
                  <li>Include: Your account email and the specific right you wish to exercise</li>
                </ul>
                <p className="leading-relaxed mt-2 text-sm">
                  We will respond to your request within 30 days (or as required by applicable law). We may need to verify your identity before processing your request.
                </p>
              </div>
            </div>
          </section>

          {/* Direct Marketing - APP 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Direct Marketing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may use your personal information to send you marketing communications about our services, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>New features and updates</li>
              <li>Educational content and resources</li>
              <li>Special offers and promotions</li>
              <li>Newsletters</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Opt-Out:</strong> You can opt-out of marketing communications at any time by:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Clicking the "unsubscribe" link in marketing emails</li>
              <li>Updating your preferences in your account settings</li>
              <li>Contacting us directly</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We will not use sensitive information for direct marketing without your explicit consent.
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your experience. For detailed information about our use of cookies, please see our <a href="/legal/cookies" className="text-primary hover:underline">Cookie Policy</a>.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You can control cookies through your browser settings. However, disabling cookies may affect Platform functionality.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our Platform is not intended for users under the age of 18. We do not knowingly collect personal information from children under 18.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. If we become aware that we have collected personal information from a child under 18, we will take steps to delete that information.
            </p>
          </section>

          {/* Data Breach Notification */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Data Breach Notification</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              In the event of a data breach that is likely to result in serious harm, we will:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Notify affected users as soon as practicable</li>
              <li>Notify the Office of the Australian Information Commissioner (OAIC) within 30 days (if required)</li>
              <li>For EU users: Notify the relevant supervisory authority within 72 hours (if high risk)</li>
              <li>Provide information about the breach and steps we are taking</li>
              <li>Recommend actions you can take to protect yourself</li>
            </ul>
          </section>

          {/* Third-Party Links */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Posting the updated Privacy Policy on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending an email notification (for significant changes)</li>
              <li>Displaying a notice on the Platform</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Your continued use of the Platform after changes constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8 bg-accent/5 border border-accent/20 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions, concerns, or wish to exercise your privacy rights, please contact us:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Innovationera Pty Ltd</strong></p>
              <p>ACN: 643 136 752</p>
              <p>Email: startege.info@gmail.com</p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Complaints:</strong> If you are not satisfied with how we handle your privacy complaint, you may contact:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li><strong>Australia:</strong> Office of the Australian Information Commissioner (OAIC) - <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.oaic.gov.au</a></li>
              <li><strong>EU:</strong> Your local data protection authority</li>
              <li><strong>UK:</strong> Information Commissioner's Office (ICO) - <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk</a></li>
            </ul>
          </section>

          {/* Legal Disclaimer */}
          <section className="mb-8 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <p className="text-sm text-muted-foreground">
              <strong>Legal Disclaimer:</strong> This Privacy Policy is a template and should be reviewed by qualified legal counsel before use. It is not legal advice. Laws vary by jurisdiction and are subject to change. Innovationera Pty Ltd recommends consulting with an Australian privacy lawyer and, if applicable, lawyers in other jurisdictions where you operate.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

