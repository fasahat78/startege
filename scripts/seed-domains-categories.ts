import { prisma } from "../lib/db";

/**
 * Seed Domains and Categories
 * 
 * Creates canonical taxonomy:
 * - 4 Domains (Domain 1-4)
 * - 9 Categories per Domain (36 total categories)
 * 
 * Category names should be from your locked list.
 * Update the CATEGORIES array below with your actual category names.
 */

// Canonical categories - EXACT strings (case + spacing) from ChatGPT
const CATEGORIES_BY_DOMAIN: Record<string, string[]> = {
  "Domain 1": [
    "AI Fundamentals",
    "Governance Principles",
    "Governance Structures & Roles",
    "Policies & Standards (Internal)",
    "AI Lifecycle Governance",
    "Decision-Making & Escalation",
    "Operating Models",
    "Organisational Change & Adoption",
    "Strategy & Value Realisation"
  ],
  "Domain 2": [
    "Data Protection & Privacy Law",
    "AI-Specific Regulation",
    "Other Relevant Laws",
    "Cross-Border Data & Jurisdiction",
    "Regulatory Oversight & Authorities",
    "Enforcement & Penalties",
    "International Standards & Frameworks",
    "Regulatory Interpretation & Guidance",
    "Emerging & Future Regulation"
  ],
  "Domain 3": [
    "Use Case Definition & Scoping",
    "Data Governance & Management",
    "Risk Identification & Assessment",
    "Impact Assessments",
    "Model Development & Training Controls",
    "Bias, Fairness & Harm Mitigation",
    "Testing, Validation & Evaluation",
    "Documentation & Record-Keeping",
    "Human Oversight in Development"
  ],
  "Domain 4": [
    "Deployment Models & Architecture",
    "Vendor & Third-Party Governance",
    "Operational Monitoring & Controls",
    "Transparency & Communication",
    "Human Oversight in Operations",
    "Incident & Issue Management",
    "Audit, Assurance & Review",
    "Change Management & Updates",
    "Decommissioning & Exit"
  ]
};

/**
 * Default category exam prompt (placeholder)
 * 
 * This will be replaced with actual category-specific prompts
 * generated using the CATEGORY_EXAM_PROMPT_TEMPLATE from lib/exam-prompts.ts
 * 
 * For now, we use a placeholder that will be updated when ChatGPT
 * provides the filled category prompts.
 */
const DEFAULT_EXAM_PROMPT = (categoryName: string) => `PLACEHOLDER: Category exam prompt for ${categoryName}

This is a placeholder. The actual category exam prompt will be generated using
the CATEGORY_EXAM_PROMPT_TEMPLATE from lib/exam-prompts.ts.

The filled prompt will include:
- Category scope (in/out of scope)
- Difficulty calibration
- Category purity rules
- Governance framing

Update this with the actual filled prompt from ChatGPT.`;

async function main() {
  console.log("🌱 Seeding Domains and Categories...");

  // Create Domains
  const domains = [];
  for (let i = 1; i <= 4; i++) {
    const domainName = `Domain ${i}`;
    const domain = await (prisma as any).domain.upsert({
      where: { name: domainName },
      update: {},
      create: {
        name: domainName,
        order: i,
        description: `Domain ${i} - AI Governance concepts`,
      },
    });
    domains.push(domain);
    console.log(`✅ Created Domain: ${domainName}`);
  }

  // Create Categories for each Domain
  let totalCategories = 0;
  for (const domain of domains) {
    const categoryNames = CATEGORIES_BY_DOMAIN[domain.name] || [];
    
    for (let i = 0; i < categoryNames.length; i++) {
      const categoryName = categoryNames[i];
      const category = await (prisma as any).category.upsert({
        where: {
          domainId_name: {
            domainId: domain.id,
            name: categoryName,
          },
        },
        update: {
          examSystemPrompt: DEFAULT_EXAM_PROMPT(categoryName),
        },
        create: {
          domainId: domain.id,
          name: categoryName,
          order: i + 1,
          description: `${categoryName} category in ${domain.name}`,
          examSystemPrompt: DEFAULT_EXAM_PROMPT(categoryName),
        },
      });
      totalCategories++;
      console.log(`  ✅ Created Category: ${categoryName} (${domain.name})`);
    }
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   - Domains: ${domains.length}`);
  console.log(`   - Categories: ${totalCategories}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding domains and categories:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

