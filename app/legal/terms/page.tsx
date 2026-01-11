/**
 * Terms of Service Page
 * Comprehensive terms covering Australian law, subscriptions, refunds, and disclaimers
 * 
 * IMPORTANT: This is a template. Review with qualified legal counsel before use.
 * Replace [placeholders] with actual company information.
 */

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none">
          {/* Company Information */}
          <section className="mb-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Last Updated:</strong> January 2025
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <p className="text-muted-foreground mb-2">
                <strong>Company:</strong> Innovationera Pty Ltd<br />
                <strong>ACN:</strong> 643 136 752<br />
                <strong>Contact Email:</strong> startege.info@gmail.com
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service ("Terms", "Agreement") govern your access to and use of Startege ("the Platform", "our platform", "our service", "we", "our", or "us"), operated by Innovationera Pty Ltd ("the Company", "we", "our", or "us"). By accessing or using our Platform, you agree to be bound by these Terms and our Privacy Policy.
            </p>
          </section>

          {/* Acceptance */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By creating an account, accessing, or using Startege, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use the Platform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              These Terms constitute a legally binding agreement between you and Innovationera Pty Ltd. If you are using the Platform on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
            </p>
          </section>

          {/* Service Description */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Startege is an educational platform that provides AI Governance learning resources and exam preparation materials. Our Platform includes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Interactive concept cards covering AI Governance topics</li>
              <li>Mastery exams and practice tests</li>
              <li>AIGP exam preparation resources</li>
              <li>AI-powered learning assistant (Startegizer)</li>
              <li>Market scan articles and regulatory updates</li>
              <li>Progress tracking and gamification features</li>
              <li>Badges and achievements</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any aspect of the Platform at any time, with or without notice.
            </p>
          </section>

          {/* Account Requirements */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">3.1 Account Creation</h3>
                <p className="leading-relaxed mb-2">To access certain features, you must create an account. When creating an account, you agree to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information as necessary</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">3.2 Age Requirement</h3>
                <p className="leading-relaxed">
                  You must be at least 18 years old to use the Platform. By using Startege, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into this Agreement.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">3.3 Account Security</h3>
                <p className="leading-relaxed mb-2">You are responsible for:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access or use</li>
                  <li>Using a strong, unique password</li>
                </ul>
                <p className="leading-relaxed mt-2">
                  We are not liable for any loss or damage arising from your failure to protect your account credentials.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">3.4 Account Sharing</h3>
                <p className="leading-relaxed">
                  Your account is personal to you. You may not share your account credentials with others or allow others to access your account. Each user must have their own account.
                </p>
              </div>
            </div>
          </section>

          {/* Subscription and Payment */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Subscription and Payment</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">4.1 Free Tier</h3>
                <p className="leading-relaxed">
                  Basic features are available free of charge. Free tier access may be limited compared to premium features. We reserve the right to modify free tier features at any time.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">4.2 Premium Subscriptions</h3>
                <p className="leading-relaxed mb-2">Premium subscriptions provide access to additional features:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Startegizer AI assistant</li>
                  <li>AIGP Prep Exams</li>
                  <li>Market Scan articles</li>
                  <li>Advanced Analytics</li>
                  <li>Priority support</li>
                </ul>
                <p className="leading-relaxed mt-2">
                  Subscription fees are displayed on our pricing page and are subject to change. We will notify you of price changes at least 30 days in advance.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">4.3 Billing</h3>
                <p className="leading-relaxed mb-2">Subscriptions are billed:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Monthly:</strong> Billed monthly in advance</li>
                  <li><strong>Annually:</strong> Billed annually in advance (with discount)</li>
                </ul>
                <p className="leading-relaxed mt-2">
                  Payment is processed securely through Stripe. By subscribing, you authorize us to charge your payment method for the subscription fee.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">4.4 Auto-Renewal</h3>
                <p className="leading-relaxed">
                  Subscriptions automatically renew at the end of each billing period unless you cancel before the renewal date. You will be charged the then-current subscription fee. We will notify you before renewal.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">4.5 AI Credits</h3>
                <p className="leading-relaxed mb-2">AI credits are:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Purchased separately from subscriptions</li>
                  <li>Non-refundable except as required by law</li>
                  <li>Used to access premium AI features (Startegizer)</li>
                  <li>Subject to expiration terms (if any) specified at purchase</li>
                  <li>Non-transferable between accounts</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">4.6 Price Changes</h3>
                <p className="leading-relaxed">
                  We reserve the right to change subscription prices. Price changes will not affect your current subscription period but will apply to renewals. We will notify you of price changes at least 30 days in advance.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">4.7 Taxes</h3>
                <p className="leading-relaxed">
                  All prices are in USD. You are responsible for any taxes, duties, or fees applicable to your purchase. For Australian customers, GST (if applicable) is included in the price.
                </p>
              </div>
            </div>
          </section>

          {/* Cancellation and Refunds */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Cancellation and Refunds</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">5.1 Subscription Cancellation</h3>
                <p className="leading-relaxed mb-2">You may cancel your subscription at any time:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Through your account settings</li>
                  <li>By contacting us directly</li>
                  <li>Via Stripe Customer Portal</li>
                </ul>
                <p className="leading-relaxed mt-2">
                  Cancellation will take effect at the end of your current billing period. You will continue to have access to premium features until the end of the billing period. No refunds are provided for the unused portion of the current billing period, except as required by law.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">5.2 Refund Policy</h3>
                <p className="leading-relaxed mb-2"><strong>General Policy:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Subscription fees are generally non-refundable</li>
                  <li>AI credits are non-refundable</li>
                  <li>Refunds may be provided at our discretion in exceptional circumstances</li>
                </ul>
                <p className="leading-relaxed mt-2 mb-2"><strong>Australian Consumer Law:</strong></p>
                <p className="leading-relaxed">
                  Nothing in these Terms excludes your rights under the Australian Consumer Law. If our services fail to meet consumer guarantees, you may be entitled to a refund or replacement. Consumer guarantees do not apply if you acquired the service for business purposes.
                </p>
                <p className="leading-relaxed mt-2 mb-2"><strong>Refund Requests:</strong></p>
                <p className="leading-relaxed">
                  To request a refund, contact us with your account email and reason for the request. We will review your request and respond within 14 business days.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">5.3 Termination by Us</h3>
                <p className="leading-relaxed mb-2">We may suspend or terminate your subscription if:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You breach these Terms</li>
                  <li>Payment fails and is not resolved</li>
                  <li>You engage in fraudulent activity</li>
                  <li>Required by law</li>
                </ul>
                <p className="leading-relaxed mt-2">
                  If we terminate your subscription for breach, no refund will be provided. If we terminate for other reasons, we may provide a pro-rated refund at our discretion.
                </p>
              </div>
            </div>
          </section>

          {/* User Conduct */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. User Conduct and Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Use the Platform for any illegal or unauthorized purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Attempt to gain unauthorized access to the Platform or its systems</li>
              <li>Interfere with or disrupt the Platform's operation</li>
              <li>Share your account credentials with others</li>
              <li>Use automated systems (bots, scrapers) to access the Platform without permission</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Platform</li>
              <li>Copy, modify, distribute, or create derivative works of Platform content</li>
              <li>Remove or alter copyright notices or proprietary markings</li>
              <li>Use the Platform to transmit viruses, malware, or harmful code</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate others or provide false information</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Violation of these terms may result in immediate termination of your account without refund.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Intellectual Property</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">7.1 Platform Content</h3>
                <p className="leading-relaxed mb-2">All content on Startege, including but not limited to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Concept cards and learning materials</li>
                  <li>Exam questions and challenges</li>
                  <li>Platform design and user interface</li>
                  <li>Logos, trademarks, and branding</li>
                  <li>Software code and functionality</li>
                  <li>Documentation and help content</li>
                </ul>
                <p className="leading-relaxed mt-2">
                  is the property of Innovationera Pty Ltd or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not use, reproduce, distribute, or create derivative works without our express written permission.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">7.2 License to Use</h3>
                <p className="leading-relaxed">
                  We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for personal, non-commercial purposes in accordance with these Terms. This license does not include the right to resell or redistribute Platform content.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">7.3 User Content</h3>
                <p className="leading-relaxed mb-2">You retain ownership of content you create or submit to the Platform (e.g., feedback, comments). By submitting content, you grant us:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>A worldwide, royalty-free, perpetual license to use, modify, and display your content</li>
                  <li>The right to use your content for Platform operation and improvement</li>
                </ul>
                <p className="leading-relaxed mt-2">
                  You represent that you have the right to grant this license and that your content does not infringe on any third-party rights.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">7.4 Third-Party Content</h3>
                <p className="leading-relaxed">
                  Our Platform may include content from third parties (e.g., regulatory frameworks, standards). This content is used under fair use or with appropriate licenses. We respect third-party intellectual property rights and expect you to do the same.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Disclaimers</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">8.1 Educational Content Disclaimer</h3>
                <p className="leading-relaxed mb-2"><strong>Not Legal Advice:</strong></p>
                <p className="leading-relaxed mb-4">
                  The content on Startege is for educational purposes only and does not constitute legal, professional, or regulatory advice. You should not rely on Platform content as a substitute for professional advice from qualified legal, compliance, or regulatory professionals.
                </p>
                <p className="leading-relaxed mb-4">
                  You agree that you will not rely on the Platform or any AI-generated content as a substitute for professional, legal, regulatory, or compliance advice, or for making operational or business decisions.
                </p>
                <p className="leading-relaxed mb-4">
                  Nothing on the Platform creates a professional-client, advisory, consulting, fiduciary, or legal relationship between you and Innovationera Pty Ltd.
                </p>
                <p className="leading-relaxed mb-2"><strong>Not Professional Certification:</strong></p>
                <p className="leading-relaxed mb-4">
                  While Startege provides educational content to help you prepare for the AIGP certification exam, we do not guarantee that using the Platform will result in passing the exam. We are not affiliated with the AIGP certification body. Exam content and formats may change without notice.
                </p>
                <p className="leading-relaxed mb-2"><strong>Regulatory Information:</strong></p>
                <p className="leading-relaxed">
                  Regulatory information provided on the Platform may become outdated. Regulations change frequently, and you should verify current regulatory requirements from official sources. We are not responsible for any consequences arising from reliance on outdated information.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">8.2 AI-Generated Content Disclaimer</h3>
                <p className="leading-relaxed mb-2">
                  Startegizer and other AI-powered features generate responses using artificial intelligence. AI-generated content:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>May contain errors or inaccuracies</li>
                  <li>Should not be relied upon as authoritative</li>
                  <li>Is not a substitute for professional advice</li>
                  <li>May not reflect current regulations or standards</li>
                </ul>
                <p className="leading-relaxed mt-2">
                  Always verify AI-generated information from authoritative sources and consult qualified professionals for important decisions.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">8.3 Service Availability</h3>
                <p className="leading-relaxed">
                  We strive to maintain Platform availability but do not guarantee uninterrupted access. The Platform may be unavailable due to maintenance, updates, technical issues, or unforeseen circumstances. We are not liable for any downtime or service interruptions.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">8.4 Third-Party Services</h3>
                <p className="leading-relaxed">
                  Our Platform uses third-party services (Firebase, Stripe, Google Cloud). We are not responsible for the availability, performance, or security of these third-party services. Your use of third-party services is subject to their respective terms and privacy policies.
                </p>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Limitation of Liability</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">9.1 General Limitation</h3>
                <p className="leading-relaxed">
                  To the maximum extent permitted by law, Innovationera Pty Ltd, its directors, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenues, data, use, goodwill, or other intangible losses, whether incurred directly or indirectly, resulting from:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Your use or inability to use the Platform</li>
                  <li>Any errors or omissions in Platform content</li>
                  <li>Any unauthorized access to or use of our servers or your data</li>
                  <li>Any interruption or cessation of the Platform</li>
                  <li>Any bugs, viruses, or other harmful code</li>
                  <li>Any third-party conduct or content</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">9.2 Maximum Liability</h3>
                <p className="leading-relaxed">
                  Our total liability to you for all claims arising from or related to the Platform shall not exceed the amount you paid us in the 12 months preceding the claim, or AUD $100, whichever is greater.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">9.3 Australian Consumer Law</h3>
                <p className="leading-relaxed">
                  Nothing in these Terms excludes, restricts, or modifies any rights you may have under the Australian Consumer Law (Schedule 2 of the Competition and Consumer Act 2010). If our services fail to meet consumer guarantees, you may be entitled to remedies including refund, replacement, or compensation. These consumer guarantees do not apply if you acquired the service for business purposes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">9.4 Indemnification</h3>
                <p className="leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Innovationera Pty Ltd, its directors, officers, employees, and agents from and against any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Your use of the Platform</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Any content you submit to the Platform</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Termination</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">10.1 Termination by You</h3>
                <p className="leading-relaxed">
                  You may terminate your account at any time by canceling your subscription (if applicable) and deleting your account through account settings or by contacting us. Upon termination, your access to the Platform will cease, but certain information may be retained as required by law or for legitimate business purposes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">10.2 Termination by Us</h3>
                <p className="leading-relaxed mb-2">We reserve the right to suspend or terminate your account at any time, with or without notice, for:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Abuse of the Platform or other users</li>
                  <li>Non-payment of subscription fees</li>
                  <li>Extended period of inactivity</li>
                  <li>Any other reason we deem necessary</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">10.3 Effect of Termination</h3>
                <p className="leading-relaxed mb-2">Upon termination:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your right to access and use the Platform will immediately cease</li>
                  <li>You will lose access to your account and all associated data</li>
                  <li>Any unused AI credits will be forfeited</li>
                  <li>No refunds will be provided (except as required by law)</li>
                  <li>Provisions that by their nature should survive termination will survive</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Dispute Resolution</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">11.1 Informal Resolution</h3>
                <p className="leading-relaxed">
                  If you have a dispute with us, please contact us first. We will attempt to resolve the dispute informally through good faith negotiations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">11.2 Governing Law</h3>
                <p className="leading-relaxed">
                  These Terms are governed by the laws of Western Australia, Australia, without regard to conflict of law principles. Any disputes will be subject to the exclusive jurisdiction of the courts of Western Australia, Australia.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">11.3 Class Action Waiver</h3>
                <p className="leading-relaxed">
                  You agree that any disputes will be resolved individually and not as part of a class action or representative proceeding.
                </p>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Posting the updated Terms on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending an email notification (for significant changes)</li>
              <li>Displaying a notice on the Platform</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Your continued use of the Platform after changes constitutes acceptance of the updated Terms. If you do not agree to the changes, you must stop using the Platform and may terminate your account.
            </p>
          </section>

          {/* Miscellaneous */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Miscellaneous</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">13.1 Entire Agreement</h3>
                <p className="leading-relaxed">
                  These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and Innovationera Pty Ltd regarding the Platform and supersede all prior agreements.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">13.2 Severability</h3>
                <p className="leading-relaxed">
                  If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">13.3 Waiver</h3>
                <p className="leading-relaxed">
                  Our failure to enforce any provision of these Terms does not constitute a waiver of that provision or any other provision.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">13.4 Assignment</h3>
                <p className="leading-relaxed">
                  You may not assign or transfer these Terms or your account without our prior written consent. We may assign these Terms without restriction.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">13.5 Force Majeure</h3>
                <p className="leading-relaxed">
                  We are not liable for any failure to perform our obligations due to circumstances beyond our reasonable control, including natural disasters, war, terrorism, labor disputes, or internet failures.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8 bg-accent/5 border border-accent/20 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Innovationera Pty Ltd</strong></p>
              <p>ACN: 643 136 752</p>
              <p>Email: startege.info@gmail.com</p>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <section className="mb-8 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <p className="text-sm text-muted-foreground">
              <strong>Legal Disclaimer:</strong> These Terms of Service are a template and should be reviewed by qualified legal counsel before use. They are not legal advice. Laws vary by jurisdiction and are subject to change. Innovationera Pty Ltd recommends consulting with an Australian lawyer specializing in technology and consumer law.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
