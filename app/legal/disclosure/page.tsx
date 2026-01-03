/**
 * Disclosure Page
 * 
 * Important disclosure about platform independence and IBM relationship
 */

export default function DisclosurePage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Disclosure</h1>
        
        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Platform Independence</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Startege is an <strong>independent educational platform</strong> designed to help individuals learn AI Governance concepts and prepare for the AI Governance Professional (AIGP) certification exam.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The platform creator is an IBM employee but Startege is <strong>not affiliated with, endorsed by, or connected to IBM</strong> in any way.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Content Sources</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All content on Startege is based on <strong>publicly available materials</strong>:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>AI Governance Professional (AIGP) certification content (public domain)</li>
              <li>Regulatory frameworks (EU AI Act, GDPR, NIST AI RMF - all publicly available)</li>
              <li>Industry standards and best practices (publicly documented)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              No IBM proprietary information, frameworks, or methodologies are used in the platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Technology Stack</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Startege uses an <strong>independent technology stack</strong>:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Google Cloud Platform (not IBM Cloud)</li>
              <li>Google Vertex AI / Gemini (not IBM Watson)</li>
              <li>Firebase Authentication (not IBM identity services)</li>
              <li>PostgreSQL on Google Cloud SQL</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">No Conflict of Interest</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Startege operates in a different market segment than IBM's AI governance offerings:
            </p>
            <div className="bg-muted/50 rounded-lg p-6 mb-4">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-status-success mt-1">✓</span>
                  <span><strong>Startege:</strong> Educational platform for individual learners preparing for certification</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-status-success mt-1">✓</span>
                  <span><strong>IBM:</strong> Enterprise AI governance solutions, consulting, and products</span>
                </li>
              </ul>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              There is no direct competition or conflict of interest between Startege and IBM's business offerings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Development</h2>
            <p className="text-muted-foreground leading-relaxed">
              Startege was developed independently, outside of IBM working hours, using no IBM resources, equipment, or infrastructure. The platform creator has received provisional approval from IBM to pursue this independent educational project.
            </p>
          </section>

          <section className="mb-8 bg-accent/5 border border-accent/20 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Questions?</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about Startege's independence or relationship with IBM, please contact us through the platform.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

