/**
 * Building Blocks Configuration
 * Reusable building blocks for use case construction
 */

interface UseCaseBlock {
  id: string;
  type: "system-type" | "data-type" | "deployment" | "risk" | "framework" | "stakeholder" | "impact" | "description";
  label: string;
  value: string;
  options?: Array<{ label: string; value: string; description?: string }>;
}

const BUILDING_BLOCKS: UseCaseBlock[] = [
  {
    id: "system-type",
    type: "system-type",
    label: "AI System Type",
    value: "",
    options: [
      { label: "Classification System", value: "classification", description: "Categorizes or classifies data" },
      { label: "Recommendation System", value: "recommendation", description: "Provides personalized recommendations" },
      { label: "Generative AI", value: "generative", description: "Generates new content (text, images, etc.)" },
      { label: "Predictive Analytics", value: "predictive", description: "Predicts future outcomes" },
      { label: "Decision Support", value: "decision-support", description: "Assists in decision-making" },
      { label: "Automated Decision-Making", value: "automated-decision", description: "Makes decisions automatically" },
      { label: "Natural Language Processing", value: "nlp", description: "Processes and understands human language" },
      { label: "Computer Vision", value: "computer-vision", description: "Analyzes images and videos" },
      { label: "Other", value: "other", description: "Other AI system type" },
    ],
  },
  {
    id: "data-type",
    type: "data-type",
    label: "Data Types",
    value: "",
    options: [
      { label: "Personal Data", value: "personal-data", description: "GDPR-covered personal information" },
      { label: "Sensitive Personal Data", value: "sensitive-data", description: "Special category data (health, biometrics, etc.)" },
      { label: "Biometric Data", value: "biometric", description: "Fingerprints, facial recognition, etc." },
      { label: "Financial Data", value: "financial", description: "Payment, credit, transaction data" },
      { label: "Health Data", value: "health", description: "Medical records, health information" },
      { label: "Public Data", value: "public", description: "Publicly available information" },
      { label: "Anonymized Data", value: "anonymized", description: "Anonymized or pseudonymized data" },
      { label: "Synthetic Data", value: "synthetic", description: "Artificially generated data" },
    ],
  },
  {
    id: "deployment",
    type: "deployment",
    label: "Deployment Context",
    value: "",
    options: [
      { label: "Healthcare", value: "healthcare", description: "Medical, clinical, or health services" },
      { label: "Financial Services", value: "finance", description: "Banking, insurance, fintech" },
      { label: "Public Sector", value: "public-sector", description: "Government, public administration" },
      { label: "Education", value: "education", description: "Schools, universities, training" },
      { label: "Retail & E-commerce", value: "retail", description: "Shopping, customer service" },
      { label: "Human Resources", value: "hr", description: "Recruitment, performance management" },
      { label: "Legal & Compliance", value: "legal", description: "Legal services, compliance" },
      { label: "Manufacturing", value: "manufacturing", description: "Production, quality control" },
      { label: "Transportation", value: "transportation", description: "Logistics, autonomous vehicles" },
      { label: "Other", value: "other", description: "Other deployment context" },
    ],
  },
  {
    id: "risk",
    type: "risk",
    label: "Risk Level",
    value: "",
    options: [
      { label: "Unacceptable Risk", value: "unacceptable", description: "Prohibited under EU AI Act" },
      { label: "High Risk", value: "high", description: "Requires conformity assessment" },
      { label: "Limited Risk", value: "limited", description: "Transparency obligations" },
      { label: "Minimal Risk", value: "minimal", description: "No specific obligations" },
      { label: "Not Sure", value: "unknown", description: "Need help determining" },
    ],
  },
  {
    id: "framework",
    type: "framework",
    label: "Regulatory Frameworks",
    value: "",
    options: [
      { label: "EU AI Act", value: "ai-act", description: "European Union AI Act" },
      { label: "GDPR", value: "gdpr", description: "General Data Protection Regulation" },
      { label: "UK GDPR", value: "uk-gdpr", description: "UK General Data Protection Regulation" },
      { label: "NIST AI RMF", value: "nist-rmf", description: "NIST AI Risk Management Framework" },
      { label: "ISO/IEC 42001", value: "iso-42001", description: "AI Management System Standard" },
      { label: "Algorithmic Accountability Act", value: "aaa", description: "US Algorithmic Accountability Act" },
      { label: "Other", value: "other", description: "Other regulatory framework" },
    ],
  },
  {
    id: "stakeholder",
    type: "stakeholder",
    label: "Stakeholders",
    value: "",
    options: [
      { label: "End Users", value: "end-users", description: "People who interact with the system" },
      { label: "Data Subjects", value: "data-subjects", description: "Individuals whose data is processed" },
      { label: "Regulators", value: "regulators", description: "Regulatory authorities" },
      { label: "Internal Teams", value: "internal", description: "Your organization's teams" },
      { label: "Customers", value: "customers", description: "Your customers or clients" },
      { label: "Partners", value: "partners", description: "Business partners or vendors" },
      { label: "Public", value: "public", description: "General public" },
    ],
  },
  {
    id: "impact",
    type: "impact",
    label: "Decision Impact",
    value: "",
    options: [
      { label: "High-Stakes", value: "high-stakes", description: "Significant impact on individuals" },
      { label: "Medium-Stakes", value: "medium-stakes", description: "Moderate impact" },
      { label: "Low-Stakes", value: "low-stakes", description: "Minimal impact" },
      { label: "Not Applicable", value: "na", description: "No direct decisions made" },
    ],
  },
  {
    id: "description",
    type: "description",
    label: "Use Case Description",
    value: "",
  },
];

export default BUILDING_BLOCKS;

