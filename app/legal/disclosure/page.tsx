/**
 * Disclosure Page
 * 
 * Disclosure & Independence Statement
 */

export default function DisclosurePage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Disclosure & Independence Statement</h1>
        
        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Startege is an independent educational platform operated by Innovationera Pty Ltd, designed for personal learning and professional upskilling in AI governance.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Startege is not affiliated with, endorsed by, sponsored by, or connected to any current or former employer of the company's founders, shareholders, or contributors.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All content on the Platform is derived exclusively from publicly available sources, including laws, regulations, and industry standards. No proprietary, confidential, or employer-owned materials are used.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Startege operates on an independent technology stack and is developed and operated independently, without the use of any employer resources, systems, or infrastructure.
            </p>
          </section>

          <section className="mb-8 bg-accent/5 border border-accent/20 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Questions?</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about Startege's independence, please contact us at startege.info@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

