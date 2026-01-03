"use client";

import { useState } from "react";

interface UserProfile {
  persona: string | null;
  knowledgeLevel: string | null;
  interests: string[];
  goals: string[];
}

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  template: string;
  tags: string[];
}

interface PromptLibraryProps {
  userProfile: UserProfile;
  onSelectPrompt: (promptId: string, promptText: string) => void;
}

// Comprehensive prompt templates - enhanced with detailed guidance
const MOCK_PROMPTS: PromptTemplate[] = [
  {
    id: "risk-assessment",
    title: "AI Risk Classification & Assessment",
    description: "Comprehensive risk classification according to EU AI Act categories (Unacceptable/High/Limited/Minimal) with detailed rationale and mitigation strategies",
    category: "Risk Assessment",
    template: "I need to classify and assess the risk level of an AI system according to the EU AI Act and other relevant frameworks.\n\n**AI System Details:**\n- System Type: [e.g., classification, recommendation, decision-making]\n- Purpose: [What the system does]\n- Deployment Context: [Where/how it's deployed - healthcare, finance, employment, etc.]\n- Data Types Processed: [Personal data, sensitive data, biometric data, etc.]\n- Decision Impact: [High-stakes decisions affecting individuals' rights, safety, or opportunities]\n- Affected Stakeholders: [End users, data subjects, employees, customers, etc.]\n- Jurisdiction: [EU, UK, US, Multi-jurisdictional]\n\n**Please provide:**\n1. Risk classification (Unacceptable/High/Limited/Minimal) with specific rationale\n2. Key risk factors and concerns\n3. Applicable regulatory requirements for this risk level\n4. Compliance obligations and deadlines\n5. Recommended risk mitigation strategies\n6. Documentation and evidence requirements\n7. Ongoing monitoring and reassessment needs\n8. Cross-border considerations if applicable",
    tags: ["risk", "classification", "ai-act", "compliance", "assessment"],
  },
  {
    id: "gdpr-compliance",
    title: "GDPR Compliance Assessment for AI Systems",
    description: "Comprehensive GDPR compliance check for AI systems processing personal data, including Article 22 automated decision-making",
    category: "Compliance",
    template: "I need to assess GDPR compliance for an AI system that processes personal data.\n\n**System Information:**\n- AI System Description: [What the system does]\n- Data Types: [Personal data categories - health, financial, biometric, etc.]\n- Processing Purpose: [Why personal data is processed]\n- Data Subjects: [Who is affected - employees, customers, patients, etc.]\n- Automated Decision-Making: [Yes/No - does the system make automated decisions?]\n- Profiling: [Yes/No - does the system create profiles?]\n- Jurisdiction: [EU, UK, or both]\n\n**Please evaluate:**\n1. Lawful basis for processing (Article 6) - which basis applies and why\n2. Data minimization and purpose limitation compliance\n3. Article 22 (Automated Decision-Making) requirements:\n   - Does Article 22 apply?\n   - Required safeguards and human oversight\n   - Right to human intervention\n   - Right to explanation\n4. Data subject rights:\n   - Right to access (Article 15)\n   - Right to rectification (Article 16)\n   - Right to erasure (Article 17) - challenges in AI context\n   - Right to object (Article 21)\n   - Right to data portability (Article 20)\n5. Data Protection by Design and by Default (Article 25)\n6. Privacy Impact Assessment (DPIA) requirements (Article 35)\n7. Documentation and record-keeping requirements (Article 30)\n8. Data breach notification obligations\n9. Cross-border data transfer considerations\n10. Compliance checklist and action items",
    tags: ["gdpr", "compliance", "data-protection", "privacy", "article-22"],
  },
  {
    id: "transparency-requirements",
    title: "Transparency & Explainability Requirements",
    description: "Identify comprehensive transparency and explainability requirements across multiple frameworks (EU AI Act, GDPR, NIST)",
    category: "Transparency",
    template: "I need to understand the transparency and explainability requirements for my AI system.\n\n**System Context:**\n- AI System: [Description of the system]\n- Use Case: [How it's used - hiring, credit scoring, medical diagnosis, etc.]\n- Risk Level: [Unacceptable/High/Limited/Minimal]\n- Stakeholders: [End users, data subjects, regulators, internal teams]\n- Jurisdiction: [EU, UK, US, Multi-jurisdictional]\n- Frameworks: [EU AI Act, GDPR, NIST AI RMF, ISO/IEC 42001]\n\n**Please identify:**\n1. **Pre-deployment Transparency Requirements:**\n   - Required disclosures to users\n   - Information that must be provided\n   - Timing of disclosures\n\n2. **In-operation Transparency Requirements:**\n   - Explanation requirements for decisions\n   - When explanations must be provided\n   - Format and detail level required\n   - User communication channels\n\n3. **Explainability Requirements:**\n   - Technical explainability methods needed\n   - Model-agnostic vs. model-specific approaches\n   - Level of detail required (global vs. local explanations)\n   - Tools and techniques recommended\n\n4. **Documentation Needs:**\n   - Model Cards requirements\n   - Datasheets requirements\n   - Technical documentation standards\n   - User-facing documentation\n\n5. **Regulatory Obligations:**\n   - EU AI Act transparency obligations (Article 13)\n   - GDPR right to explanation (Article 22)\n   - NIST AI RMF transparency considerations\n   - Sector-specific requirements\n\n6. **Implementation Guidance:**\n   - Technical implementation approaches\n   - Integration with existing systems\n   - User experience considerations\n   - Best practices and examples\n\n7. **Compliance Checklist:**\n   - What must be implemented\n   - Priority and timeline\n   - Evidence requirements",
    tags: ["transparency", "explainability", "ai-act", "gdpr", "xai"],
  },
  {
    id: "bias-detection",
    title: "Bias Detection & Fairness Assessment",
    description: "Comprehensive bias detection and mitigation analysis with fairness metrics and ongoing monitoring strategies",
    category: "Ethics",
    template: "I need to assess potential bias and ensure fairness in my AI system.\n\n**System Information:**\n- AI System: [System description and purpose]\n- Use Case: [Hiring, lending, healthcare, etc.]\n- Training Data: [Data characteristics, sources, size]\n- Decision Context: [Where/how decisions are made]\n- Affected Groups: [Demographics, protected characteristics]\n- Protected Attributes: [Race, gender, age, disability, etc.]\n- Decision Impact: [High-stakes decisions affecting opportunities, rights, or safety]\n\n**Please provide:**\n1. **Bias Identification:**\n   - Potential bias sources (data, algorithm, deployment)\n   - Historical bias in training data\n   - Representation bias\n   - Measurement bias\n   - Evaluation bias\n\n2. **Fairness Assessment:**\n   - Fairness metrics to evaluate:\n     * Demographic parity\n     * Equalized odds\n     * Calibration\n     * Individual fairness\n   - Which metrics are most appropriate for this use case\n   - Fairness-accuracy trade-offs\n\n3. **Impact Analysis:**\n   - Impact on different demographic groups\n   - Disparate impact assessment\n   - Intersectional considerations\n   - Long-term societal implications\n\n4. **Detection Methods:**\n   - Testing methodologies\n   - Tools and frameworks\n   - Benchmark datasets\n   - Evaluation protocols\n\n5. **Mitigation Strategies:**\n   - Pre-processing techniques (data balancing, reweighting)\n   - In-processing techniques (fairness constraints, adversarial debiasing)\n   - Post-processing techniques (calibration, threshold adjustment)\n   - Organizational measures (diverse teams, bias audits)\n\n6. **Ongoing Monitoring:**\n   - Continuous monitoring framework\n   - Key metrics to track\n   - Alerting thresholds\n   - Periodic reassessment schedule\n\n7. **Compliance Considerations:**\n   - EU AI Act requirements for high-risk systems\n   - GDPR non-discrimination obligations\n   - Sector-specific fairness requirements\n   - Documentation and evidence needs",
    tags: ["bias", "fairness", "ethics", "discrimination", "equity"],
  },
  {
    id: "ai-act-compliance",
    title: "EU AI Act Comprehensive Compliance",
    description: "Complete EU AI Act compliance assessment with risk classification, conformity assessment, and documentation requirements",
    category: "Compliance",
    template: "I need a comprehensive EU AI Act compliance assessment for my AI system.\n\n**System Details:**\n- AI System: [Description]\n- System Type: [Classification, recommendation, decision-making, etc.]\n- Deployment Context: [Healthcare, finance, employment, public services, etc.]\n- Risk Level (Initial Assessment): [Unacceptable/High/Limited/Minimal]\n- Geographic Scope: [EU only, EU + other jurisdictions]\n- Data Types: [Personal data, biometric data, sensitive data]\n- Decision Impact: [Impact on individuals' rights, safety, or opportunities]\n\n**Please provide:**\n1. **Risk Classification:**\n   - Final risk category determination\n   - Rationale based on EU AI Act Article 6 (prohibited), Article 6 (high-risk), or other categories\n   - Specific provisions that apply\n   - Borderline cases and how to resolve\n\n2. **Applicable Requirements:**\n   - Mandatory requirements for this risk level\n   - Prohibited practices (if applicable)\n   - High-risk system requirements (if applicable):\n     * Risk management system (Article 9)\n     * Data governance (Article 10)\n     * Technical documentation (Article 11)\n     * Record-keeping (Article 12)\n     * Transparency and user information (Article 13)\n     * Human oversight (Article 14)\n     * Accuracy, robustness, and cybersecurity (Article 15)\n\n3. **Conformity Assessment:**\n   - Required conformity assessment procedure\n   - Self-assessment vs. third-party assessment\n   - Conformity assessment body requirements\n   - Timeline and process\n\n4. **Documentation Requirements:**\n   - Technical documentation needed\n   - Model documentation standards\n   - Risk management documentation\n   - Post-market monitoring documentation\n   - Record-keeping requirements\n\n5. **Post-Market Monitoring:**\n   - Monitoring obligations\n   - Incident reporting requirements\n   - Corrective action procedures\n   - Ongoing compliance maintenance\n\n6. **Timeline & Deadlines:**\n   - When requirements take effect\n   - Transition periods\n   - Compliance deadlines\n   - Implementation roadmap\n\n7. **Compliance Checklist:**\n   - Step-by-step compliance actions\n   - Priority order\n   - Resource requirements\n   - Evidence needed for audit\n\n8. **Cross-Border Considerations:**\n   - If operating in multiple EU member states\n   - Lead supervisory authority\n   - Coordination requirements",
    tags: ["ai-act", "eu", "compliance", "conformity-assessment", "high-risk"],
  },
  {
    id: "dpia-ai-system",
    title: "Data Protection Impact Assessment (DPIA) for AI",
    description: "Comprehensive DPIA guidance for AI systems processing personal data, including methodology and template",
    category: "Privacy",
    template: "I need to conduct a Data Protection Impact Assessment (DPIA) for an AI system under GDPR Article 35.\n\n**System Information:**\n- AI System: [Description]\n- Data Types: [Personal data categories - health, financial, biometric, etc.]\n- Processing Purpose: [Why personal data is processed]\n- Data Subjects: [Who is affected]\n- Processing Scope: [Volume, frequency, duration]\n- Automated Decision-Making: [Yes/No]\n- Profiling: [Yes/No]\n- Special Category Data: [Yes/No - Article 9]\n- Criminal Data: [Yes/No - Article 10]\n\n**Please provide:**\n1. **DPIA Necessity Assessment:**\n   - Is a DPIA required? (Article 35(1) and (3))\n   - Criteria that trigger DPIA requirement\n   - When consultation with supervisory authority is needed (Article 36)\n\n2. **DPIA Methodology:**\n   - Recommended DPIA structure and sections\n   - Risk assessment methodology\n   - Risk scoring approach\n   - Stakeholder consultation process\n\n3. **Risk Identification:**\n   - Privacy risks to data subjects\n   - Risks from automated processing\n   - Risks from profiling\n   - Risks from special category data\n   - Risks from data sharing\n\n4. **Risk Assessment:**\n   - Likelihood and severity of risks\n   - Impact on data subjects\n   - Risk level determination\n   - Residual risks after mitigation\n\n5. **Mitigation Measures:**\n   - Technical measures (encryption, anonymization, access controls)\n   - Organizational measures (policies, training, procedures)\n   - Privacy by design implementation\n   - Data minimization strategies\n\n6. **Documentation Requirements:**\n   - What must be documented\n   - DPIA template structure\n   - Evidence and supporting materials\n   - Review and update schedule\n\n7. **Supervisory Authority Consultation:**\n   - When consultation is required\n   - How to submit DPIA\n   - What to include in submission\n   - Expected timeline\n\n8. **Ongoing Compliance:**\n   - When to update DPIA\n   - Monitoring and review requirements\n   - Integration with risk management",
    tags: ["dpia", "gdpr", "privacy", "risk-assessment", "article-35"],
  },
  {
    id: "mlops-governance",
    title: "MLOps Governance Implementation",
    description: "Comprehensive MLOps governance framework with technical controls, monitoring, and compliance integration",
    category: "Technical",
    template: "I need to implement governance controls in our MLOps pipeline to ensure AI system compliance and quality.\n\n**Current State:**\n- MLOps Platform: [e.g., MLflow, Kubeflow, SageMaker, custom]\n- AI System Types: [Classification, regression, NLP, computer vision, etc.]\n- Deployment Frequency: [How often models are deployed]\n- Team Size: [ML engineers, data scientists, DevOps]\n- Compliance Requirements: [EU AI Act, GDPR, ISO/IEC 42001, etc.]\n- Existing Controls: [What governance is already in place]\n\n**Please provide:**\n1. **Governance Architecture:**\n   - MLOps pipeline with governance checkpoints\n   - Integration points for compliance controls\n   - Approval workflows and gates\n   - Role-based access control design\n\n2. **Model Development Governance:**\n   - Experiment tracking and versioning\n   - Data lineage tracking\n   - Feature store governance\n   - Model registry and cataloging\n   - Documentation requirements (Model Cards, Datasheets)\n\n3. **Pre-Deployment Controls:**\n   - Model validation gates\n   - Bias and fairness testing\n   - Performance benchmarking\n   - Compliance checks (automated)\n   - Risk assessment integration\n   - Approval workflows\n\n4. **Deployment Governance:**\n   - Model versioning and rollback strategies\n   - A/B testing frameworks\n   - Canary deployment patterns\n   - Environment management (dev, staging, prod)\n   - Configuration management\n\n5. **Monitoring & Observability:**\n   - Model performance monitoring\n   - Data drift detection\n   - Model drift detection\n   - Bias and fairness monitoring\n   - Compliance metrics tracking\n   - Alerting and incident response\n\n6. **Technical Implementation:**\n   - Tools and platforms recommended\n   - Code examples for key controls\n   - API design for governance\n   - Integration patterns\n   - Automation opportunities\n\n7. **Documentation & Audit Trails:**\n   - What to log and track\n   - Audit trail requirements\n   - Compliance evidence collection\n   - Reporting and dashboards\n\n8. **Best Practices:**\n   - Industry best practices\n   - Common pitfalls to avoid\n   - Scalability considerations\n   - Cost optimization\n\n9. **Compliance Integration:**\n   - How governance controls map to regulations\n   - Evidence generation for audits\n   - Integration with compliance frameworks",
    tags: ["mlops", "governance", "technical", "monitoring", "compliance"],
  },
  {
    id: "cross-border-compliance",
    title: "Multi-Jurisdictional Compliance Strategy",
    description: "Navigate compliance across multiple jurisdictions (EU, UK, US) with conflicting requirements",
    category: "Compliance",
    template: "I need to ensure compliance for an AI system that operates across multiple jurisdictions.\n\n**System & Jurisdiction Details:**\n- AI System: [Description]\n- Primary Jurisdictions: [EU, UK, US, Canada, etc.]\n- Data Processing Locations: [Where data is processed]\n- Data Subject Locations: [Where data subjects are located]\n- Data Transfer: [Cross-border data transfers involved]\n- Risk Level: [In each jurisdiction]\n\n**Please provide:**\n1. **Jurisdictional Requirements Mapping:**\n   - Requirements in each jurisdiction:\n     * EU: EU AI Act, GDPR\n     * UK: UK GDPR, Data Protection Act, AI White Paper\n     * US: State-level regulations (CA, NY, IL), Federal guidance\n   - Overlapping requirements\n   - Conflicting requirements\n   - Most stringent requirements (golden standard approach)\n\n2. **Risk Classification Across Jurisdictions:**\n   - Risk level in each jurisdiction\n   - Differences in classification\n   - How to reconcile differences\n   - Compliance strategy (highest common denominator vs. jurisdiction-specific)\n\n3. **Data Transfer Considerations:**\n   - Cross-border data transfer mechanisms\n   - Standard Contractual Clauses (SCCs)\n   - Adequacy decisions\n   - Additional safeguards needed\n   - Data localization requirements\n\n4. **Compliance Strategy:**\n   - Unified vs. jurisdiction-specific approach\n   - How to prioritize requirements\n   - Resource allocation\n   - Timeline considerations\n\n5. **Regulatory Coordination:**\n   - Lead supervisory authority (EU)\n   - Coordination between regulators\n   - Reporting requirements\n   - Incident notification (which regulators)\n\n6. **Implementation Roadmap:**\n   - Phased approach\n   - Priority actions\n   - Dependencies\n   - Timeline\n\n7. **Ongoing Management:**\n   - Monitoring regulatory changes\n   - Updating compliance programs\n   - Managing multiple audits\n   - Documentation requirements",
    tags: ["cross-border", "multi-jurisdictional", "compliance", "data-transfer", "international"],
  },
  {
    id: "incident-response",
    title: "AI Incident Response & Remediation",
    description: "Comprehensive incident response plan for AI system failures, bias incidents, and data breaches",
    category: "Risk Management",
    template: "I need to develop an incident response plan for AI system incidents.\n\n**Incident Context:**\n- Incident Type: [Bias incident, data breach, system failure, model drift, adversarial attack, etc.]\n- AI System: [Description]\n- Severity: [Critical, High, Medium, Low]\n- Affected Stakeholders: [Data subjects, customers, employees, etc.]\n- Detection: [How the incident was discovered]\n- Current Status: [Ongoing, contained, resolved]\n\n**Please provide:**\n1. **Immediate Response Actions:**\n   - First steps to take (within hours)\n   - Containment measures\n   - Impact assessment\n   - Stakeholder notification (internal)\n   - Evidence preservation\n\n2. **Regulatory Notification Requirements:**\n   - GDPR breach notification (72-hour rule)\n   - EU AI Act incident reporting\n   - Sector-specific notifications (healthcare, finance)\n   - Which regulators to notify\n   - What information to provide\n   - Timeline for notifications\n\n3. **Data Subject Notification:**\n   - When notification is required\n   - What information to provide\n   - Communication channels\n   - Timeline\n   - Mitigation measures to communicate\n\n4. **Investigation & Root Cause Analysis:**\n   - Investigation methodology\n   - Root cause analysis\n   - Contributing factors\n   - System vulnerabilities\n   - Process failures\n\n5. **Remediation Plan:**\n   - Immediate fixes\n   - Short-term remediation (days/weeks)\n   - Long-term remediation (months)\n   - Model retraining requirements\n   - System updates needed\n   - Process improvements\n\n6. **Compliance During Remediation:**\n   - How to maintain compliance while fixing issues\n   - Temporary measures\n   - Risk mitigation\n   - Documentation requirements\n\n7. **Post-Incident Actions:**\n   - Lessons learned\n   - Process improvements\n   - System enhancements\n   - Training needs\n   - Monitoring improvements\n\n8. **Documentation & Reporting:**\n   - Incident report structure\n   - Regulatory reporting\n   - Internal reporting\n   - Evidence documentation\n   - Audit trail maintenance\n\n9. **Prevention Strategies:**\n   - How to prevent similar incidents\n   - Early warning systems\n   - Monitoring enhancements\n   - Testing improvements",
    tags: ["incident-response", "remediation", "breach", "risk-management", "compliance"],
  },
  {
    id: "model-documentation",
    title: "Model Documentation Standards",
    description: "Comprehensive model documentation following Model Cards, Datasheets, and regulatory requirements",
    category: "Documentation",
    template: "I need to create comprehensive documentation for my AI model to meet regulatory and best practice requirements.\n\n**Model Information:**\n- Model Type: [Classification, regression, NLP, computer vision, etc.]\n- Use Case: [Hiring, credit scoring, medical diagnosis, etc.]\n- Risk Level: [Unacceptable/High/Limited/Minimal]\n- Frameworks: [EU AI Act, ISO/IEC 42001, NIST AI RMF]\n- Audience: [Technical team, compliance, regulators, end users]\n\n**Please provide:**\n1. **Model Card Requirements:**\n   - Model Card structure and sections\n   - Required information:\n     * Model details (name, version, date)\n     * Intended use and limitations\n     * Performance metrics\n     * Training data overview\n     * Evaluation data\n     * Ethical considerations\n     * Caveats and recommendations\n   - Format and templates\n   - Best practices\n\n2. **Datasheet Requirements:**\n   - Datasheet structure\n   - Required information:\n     * Dataset motivation\n     * Dataset composition\n     * Data collection process\n     * Preprocessing and cleaning\n     * Uses and distribution\n     * Maintenance\n   - Format and templates\n\n3. **Technical Documentation:**\n   - Architecture documentation\n   - Training procedure\n   - Hyperparameters\n   - Evaluation methodology\n   - Performance benchmarks\n   - Limitations and known issues\n\n4. **Regulatory Documentation:**\n   - EU AI Act technical documentation (Article 11)\n   - ISO/IEC 42001 documentation requirements\n   - GDPR documentation (Article 30)\n   - Sector-specific documentation\n\n5. **User-Facing Documentation:**\n   - End-user documentation\n   - API documentation\n   - Usage guidelines\n   - Limitations and warnings\n\n6. **Documentation Maintenance:**\n   - Version control\n   - Update procedures\n   - Review schedule\n   - Change management\n\n7. **Tools & Templates:**\n   - Recommended tools\n   - Template libraries\n   - Automation opportunities\n   - Integration with MLOps\n\n8. **Best Practices:**\n   - Documentation standards\n   - Common mistakes to avoid\n   - Examples and references",
    tags: ["documentation", "model-cards", "datasheets", "technical", "compliance"],
  },
];

export default function PromptLibrary({
  userProfile,
  onSelectPrompt,
}: PromptLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = Array.from(new Set(MOCK_PROMPTS.map((p) => p.category)));

  const filteredPrompts = MOCK_PROMPTS.filter((prompt) => {
    const matchesCategory = !selectedCategory || prompt.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelectPrompt = (prompt: PromptTemplate) => {
    // Replace placeholders with user context if available
    let promptText = prompt.template;
    
    if (userProfile.persona) {
      promptText = promptText.replace(
        /\[Describe your AI use case\]/g,
        `[As a ${userProfile.persona}]`
      );
    }

    onSelectPrompt(prompt.id, promptText);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            selectedCategory === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrompts.map((prompt) => (
          <div
            key={prompt.id}
            className="bg-muted border border-border rounded-lg p-4 hover:border-primary transition cursor-pointer"
            onClick={() => handleSelectPrompt(prompt)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-card-foreground">{prompt.title}</h3>
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                {prompt.category}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{prompt.description}</p>
            <div className="flex flex-wrap gap-1">
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-card border border-border rounded text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No prompts found matching your search.</p>
        </div>
      )}
    </div>
  );
}

