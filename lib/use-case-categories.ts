/**
 * Use Case Categories and Scenarios
 * Organized by persona type for better UX
 */

export interface UseCaseCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  scenarios: UseCaseScenario[];
}

export interface UseCaseScenario {
  id: string;
  name: string;
  description: string;
  suggestedBlocks: {
    systemType?: string;
    dataTypes?: string[];
    deployment?: string;
    riskLevel?: string;
    frameworks?: string[];
    stakeholders?: string[];
    impact?: string;
    riskAreas?: string[];
    jurisdiction?: string;
  };
  templateDescription: string;
}

// Persona-specific categories
export const PERSONA_CATEGORIES: Record<string, UseCaseCategory[]> = {
  COMPLIANCE_OFFICER: [
    {
      id: "risk-assessment",
      name: "Risk Assessment & Classification",
      description: "Assess and classify AI systems according to regulatory risk levels",
      icon: "⚠️",
      scenarios: [
        {
          id: "classify-new-system",
          name: "Classify New AI System",
          description: "Determine risk classification for a new AI system",
          suggestedBlocks: {
            systemType: "classification",
            riskLevel: "high",
            frameworks: ["ai-act", "gdpr"],
          },
          templateDescription: "I need to classify a new AI system according to the EU AI Act risk categories. The system is used for [purpose] and processes [data types]. What risk level does it fall under and what compliance requirements apply?",
        },
        {
          id: "audit-preparation",
          name: "Prepare for Compliance Audit",
          description: "Ensure AI systems meet audit requirements",
          suggestedBlocks: {
            frameworks: ["ai-act", "gdpr", "iso-42001"],
            stakeholders: ["regulators", "internal"],
          },
          templateDescription: "I'm preparing for a compliance audit of our AI systems. We have [system type] that processes [data types] in [deployment context]. What documentation and evidence do I need to prepare?",
        },
        {
          id: "gap-analysis",
          name: "Compliance Gap Analysis",
          description: "Identify gaps between current state and regulatory requirements",
          suggestedBlocks: {
            frameworks: ["ai-act", "gdpr"],
            riskLevel: "high",
          },
          templateDescription: "I need to conduct a gap analysis for our AI governance program. We're operating in [jurisdiction] and have [system types]. What are the key compliance gaps I should prioritize?",
        },
      ],
    },
    {
      id: "policy-development",
      name: "Policy & Framework Development",
      description: "Develop AI governance policies and frameworks",
      icon: "📋",
      scenarios: [
        {
          id: "create-ai-policy",
          name: "Create AI Governance Policy",
          description: "Develop comprehensive AI governance policy",
          suggestedBlocks: {
            frameworks: ["ai-act", "gdpr", "nist-rmf"],
            stakeholders: ["internal", "end-users"],
          },
          templateDescription: "I need to create an AI governance policy for our organization. We operate in [jurisdiction] and use [system types]. What should the policy cover and how should it be structured?",
        },
        {
          id: "risk-management-framework",
          name: "Implement Risk Management Framework",
          description: "Set up risk management processes for AI systems",
          suggestedBlocks: {
            frameworks: ["nist-rmf", "iso-42001"],
            riskLevel: "high",
          },
          templateDescription: "I'm implementing a risk management framework for our AI systems. We have [system types] in [deployment context]. What processes and controls should I establish?",
        },
      ],
    },
    {
      id: "incident-response",
      name: "Incident Response & Remediation",
      description: "Handle AI incidents and ensure remediation",
      icon: "🚨",
      scenarios: [
        {
          id: "bias-incident",
          name: "Address Bias Incident",
          description: "Respond to and remediate AI bias issues",
          suggestedBlocks: {
            riskAreas: ["Bias"],
            frameworks: ["ai-act", "gdpr"],
            impact: "high-stakes",
          },
          templateDescription: "We've identified a bias issue in our [system type] that affects [stakeholders]. What are the immediate steps I should take and how do I ensure compliance while remediating?",
        },
        {
          id: "data-breach",
          name: "AI-Related Data Breach",
          description: "Handle data breach involving AI systems",
          suggestedBlocks: {
            dataTypes: ["personal-data", "sensitive-data"],
            frameworks: ["gdpr"],
            impact: "high-stakes",
          },
          templateDescription: "We've experienced a data breach involving our AI system that processes [data types]. What are my GDPR obligations and how should I respond?",
        },
      ],
    },
  ],

  AI_ETHICS_RESEARCHER: [
    {
      id: "ethical-analysis",
      name: "Ethical Analysis & Impact Assessment",
      description: "Analyze ethical implications of AI systems",
      icon: "⚖️",
      scenarios: [
        {
          id: "fairness-assessment",
          name: "Fairness & Bias Assessment",
          description: "Assess fairness and identify bias in AI systems",
          suggestedBlocks: {
            riskAreas: ["Bias", "Fairness"],
            stakeholders: ["data-subjects", "end-users"],
            impact: "high-stakes",
          },
          templateDescription: "I'm conducting a fairness assessment of a [system type] used in [deployment context]. The system makes decisions affecting [stakeholders]. What metrics and methodologies should I use?",
        },
        {
          id: "societal-impact",
          name: "Societal Impact Analysis",
          description: "Evaluate broader societal implications",
          suggestedBlocks: {
            stakeholders: ["public", "end-users"],
            impact: "high-stakes",
          },
          templateDescription: "I'm researching the societal impact of [system type] deployed in [deployment context]. What are the key ethical considerations and potential harms I should investigate?",
        },
      ],
    },
    {
      id: "research-frameworks",
      name: "Research Frameworks & Methodologies",
      description: "Develop research approaches for AI ethics",
      icon: "🔬",
      scenarios: [
        {
          id: "ethical-framework",
          name: "Develop Ethical Framework",
          description: "Create ethical framework for AI research",
          suggestedBlocks: {
            frameworks: ["ai-act"],
          },
          templateDescription: "I'm developing an ethical framework for AI research in [deployment context]. What principles and methodologies should guide the framework?",
        },
      ],
    },
  ],

  TECHNICAL_AI_DEVELOPER: [
    {
      id: "technical-implementation",
      name: "Technical Implementation",
      description: "Implement governance in code and systems",
      icon: "⚙️",
      scenarios: [
        {
          id: "mlops-governance",
          name: "MLOps Governance Setup",
          description: "Set up governance processes in MLOps pipeline",
          suggestedBlocks: {
            systemType: "classification",
            frameworks: ["iso-42001"],
          },
          templateDescription: "I need to implement governance controls in our MLOps pipeline for [system type]. What technical controls should I implement for model versioning, monitoring, and compliance?",
        },
        {
          id: "explainability-implementation",
          name: "Implement Explainability",
          description: "Add explainability features to AI systems",
          suggestedBlocks: {
            riskAreas: ["Transparency"],
            frameworks: ["ai-act"],
          },
          templateDescription: "I need to implement explainability for our [system type] to meet transparency requirements. What technical approaches and tools should I use?",
        },
        {
          id: "bias-mitigation",
          name: "Bias Mitigation in Model",
          description: "Implement technical bias mitigation",
          suggestedBlocks: {
            riskAreas: ["Bias"],
            systemType: "classification",
          },
          templateDescription: "I need to implement bias mitigation techniques in our [system type] model. What technical methods should I apply and how do I measure effectiveness?",
        },
      ],
    },
    {
      id: "documentation",
      name: "Technical Documentation",
      description: "Document AI systems for compliance",
      icon: "📝",
      scenarios: [
        {
          id: "model-documentation",
          name: "Model Documentation",
          description: "Create comprehensive model documentation",
          suggestedBlocks: {
            frameworks: ["iso-42001", "ai-act"],
          },
          templateDescription: "I need to document our [system type] model for compliance. What technical details should I include and what format should follow?",
        },
      ],
    },
  ],

  LEGAL_REGULATORY_PROFESSIONAL: [
    {
      id: "legal-compliance",
      name: "Legal Compliance & Interpretation",
      description: "Interpret regulations and ensure legal compliance",
      icon: "⚖️",
      scenarios: [
        {
          id: "regulatory-interpretation",
          name: "Interpret Regulation",
          description: "Understand how regulations apply to specific use case",
          suggestedBlocks: {
            frameworks: ["ai-act", "gdpr"],
            jurisdiction: "EU",
          },
          templateDescription: "I need to interpret how [framework] applies to our [system type] used in [deployment context]. What are the specific legal requirements and obligations?",
        },
        {
          id: "cross-border-compliance",
          name: "Cross-Border Compliance",
          description: "Navigate multi-jurisdictional requirements",
          suggestedBlocks: {
            frameworks: ["ai-act", "gdpr", "uk-gdpr"],
            jurisdiction: "Multi-Jurisdictional",
          },
          templateDescription: "Our [system type] operates across [jurisdictions]. What are the compliance requirements in each jurisdiction and how do I reconcile conflicts?",
        },
        {
          id: "contract-review",
          name: "AI Contract Review",
          description: "Review contracts involving AI systems",
          suggestedBlocks: {
            frameworks: ["ai-act", "gdpr"],
          },
          templateDescription: "I'm reviewing a contract for [system type] that processes [data types]. What legal clauses and risk allocations should I include?",
        },
      ],
    },
  ],

  BUSINESS_EXECUTIVE: [
    {
      id: "business-strategy",
      name: "Business Strategy & Risk",
      description: "Strategic business decisions for AI governance",
      icon: "💼",
      scenarios: [
        {
          id: "governance-strategy",
          name: "AI Governance Strategy",
          description: "Develop business strategy for AI governance",
          suggestedBlocks: {
            stakeholders: ["internal", "customers"],
          },
          templateDescription: "I need to develop an AI governance strategy for our organization. We use [system types] in [deployment context]. What's the business case and how should we prioritize investments?",
        },
        {
          id: "risk-management",
          name: "Business Risk Management",
          description: "Manage business risks from AI systems",
          suggestedBlocks: {
            riskLevel: "high",
            impact: "high-stakes",
          },
          templateDescription: "I'm assessing business risks from our [system type] in [deployment context]. What are the key risks and how should we mitigate them from a business perspective?",
        },
      ],
    },
  ],

  DATA_PROTECTION_OFFICER: [
    {
      id: "data-protection",
      name: "Data Protection & Privacy",
      description: "Ensure GDPR and data protection compliance",
      icon: "🔒",
      scenarios: [
        {
          id: "dpia-ai-system",
          name: "DPIA for AI System",
          description: "Conduct Data Protection Impact Assessment",
          suggestedBlocks: {
            dataTypes: ["personal-data", "sensitive-data"],
            frameworks: ["gdpr"],
            riskLevel: "high",
          },
          templateDescription: "I need to conduct a DPIA for our [system type] that processes [data types]. What should the assessment cover and what are the key privacy risks?",
        },
        {
          id: "data-subject-rights",
          name: "Data Subject Rights",
          description: "Handle data subject rights requests for AI",
          suggestedBlocks: {
            dataTypes: ["personal-data"],
            frameworks: ["gdpr"],
          },
          templateDescription: "We're receiving data subject rights requests related to our [system type]. How should we handle requests for access, rectification, and erasure in the context of AI?",
        },
      ],
    },
  ],

  AI_GOVERNANCE_CONSULTANT: [
    {
      id: "consulting-services",
      name: "Consulting & Advisory",
      description: "Provide AI governance consulting services",
      icon: "💡",
      scenarios: [
        {
          id: "client-assessment",
          name: "Client Governance Assessment",
          description: "Assess client's AI governance maturity",
          suggestedBlocks: {
            frameworks: ["ai-act", "gdpr", "iso-42001"],
          },
          templateDescription: "I'm conducting a governance assessment for a client using [system types] in [deployment context]. What framework should I use and what are the key areas to evaluate?",
        },
        {
          id: "implementation-roadmap",
          name: "Create Implementation Roadmap",
          description: "Develop governance implementation plan",
          suggestedBlocks: {
            frameworks: ["ai-act", "nist-rmf"],
          },
          templateDescription: "I need to create an implementation roadmap for AI governance. The client operates in [jurisdiction] and uses [system types]. What should the roadmap include?",
        },
      ],
    },
  ],

  AI_PRODUCT_MANAGER: [
    {
      id: "product-governance",
      name: "Product Governance",
      description: "Integrate governance into product development",
      icon: "📦",
      scenarios: [
        {
          id: "product-risk-assessment",
          name: "Product Risk Assessment",
          description: "Assess risks for new AI product features",
          suggestedBlocks: {
            riskLevel: "high",
            frameworks: ["ai-act"],
          },
          templateDescription: "I'm launching a new AI feature for our product. The feature uses [system type] and processes [data types]. What governance considerations should I address?",
        },
        {
          id: "governance-by-design",
          name: "Governance by Design",
          description: "Build governance into product from the start",
          suggestedBlocks: {
            frameworks: ["ai-act", "gdpr"],
          },
          templateDescription: "I want to implement governance by design for our AI product. What controls and processes should I integrate into the product development lifecycle?",
        },
      ],
    },
  ],

  STUDENT_ACADEMIC: [
    {
      id: "learning-research",
      name: "Learning & Research",
      description: "Learn about AI governance concepts and research",
      icon: "📚",
      scenarios: [
        {
          id: "concept-exploration",
          name: "Explore Governance Concepts",
          description: "Learn about specific AI governance concepts",
          suggestedBlocks: {},
          templateDescription: "I'm researching [concept] in the context of AI governance. Can you explain how it applies to [system type] and what the key considerations are?",
        },
        {
          id: "case-study-analysis",
          name: "Case Study Analysis",
          description: "Analyze real-world AI governance cases",
          suggestedBlocks: {},
          templateDescription: "I'm analyzing a case study involving [system type] in [deployment context]. What governance frameworks and principles are relevant?",
        },
      ],
    },
  ],

  // Default categories for other personas or when persona is unknown
  DEFAULT: [
    {
      id: "general-governance",
      name: "General AI Governance",
      description: "General AI governance questions and scenarios",
      icon: "🤖",
      scenarios: [
        {
          id: "general-query",
          name: "General Governance Query",
          description: "Ask general questions about AI governance",
          suggestedBlocks: {},
          templateDescription: "I have questions about AI governance for [system type] in [deployment context]. Can you provide guidance?",
        },
      ],
    },
  ],
};

/**
 * Get categories for a specific persona
 * Maps persona enum values to category sets
 */
export function getCategoriesForPersona(persona: string | null): UseCaseCategory[] {
  if (!persona) return PERSONA_CATEGORIES.DEFAULT;
  
  // Normalize persona string to match enum keys
  const personaKey = persona.toUpperCase().replace(/\s+/g, "_");
  
  // Direct match
  if (personaKey in PERSONA_CATEGORIES) {
    return PERSONA_CATEGORIES[personaKey as keyof typeof PERSONA_CATEGORIES];
  }
  
  // Fallback to default
  return PERSONA_CATEGORIES.DEFAULT;
}

/**
 * Get scenario by ID
 */
export function getScenarioById(categoryId: string, scenarioId: string): UseCaseScenario | null {
  for (const categories of Object.values(PERSONA_CATEGORIES)) {
    for (const category of categories) {
      if (category.id === categoryId) {
        const scenario = category.scenarios.find(s => s.id === scenarioId);
        if (scenario) return scenario;
      }
    }
  }
  return null;
}

