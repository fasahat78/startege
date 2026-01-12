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
    template: "I need to classify and assess the risk level of an AI system according to the EU AI Act and other relevant frameworks.",
    tags: ["risk", "classification", "ai-act", "compliance", "assessment"],
  },
  {
    id: "gdpr-compliance",
    title: "GDPR Compliance Assessment for AI Systems",
    description: "Comprehensive GDPR compliance check for AI systems processing personal data, including Article 22 automated decision-making",
    category: "Compliance",
    template: "I need to assess GDPR compliance for an AI system that processes personal data.",
    tags: ["gdpr", "compliance", "data-protection", "privacy", "article-22"],
  },
  {
    id: "transparency-requirements",
    title: "Transparency & Explainability Requirements",
    description: "Identify comprehensive transparency and explainability requirements across multiple frameworks (EU AI Act, GDPR, NIST)",
    category: "Transparency",
    template: "I need to understand the transparency and explainability requirements for my AI system.",
    tags: ["transparency", "explainability", "ai-act", "gdpr", "xai"],
  },
  {
    id: "bias-detection",
    title: "Bias Detection & Fairness Assessment",
    description: "Comprehensive bias detection and mitigation analysis with fairness metrics and ongoing monitoring strategies",
    category: "Ethics",
    template: "I need to assess potential bias and ensure fairness in my AI system.",
    tags: ["bias", "fairness", "ethics", "discrimination", "equity"],
  },
  {
    id: "ai-act-compliance",
    title: "EU AI Act Comprehensive Compliance",
    description: "Complete EU AI Act compliance assessment with risk classification, conformity assessment, and documentation requirements",
    category: "Compliance",
    template: "I need a comprehensive EU AI Act compliance assessment for my AI system.",
    tags: ["ai-act", "eu", "compliance", "conformity-assessment", "high-risk"],
  },
  {
    id: "dpia-ai-system",
    title: "Data Protection Impact Assessment (DPIA) for AI",
    description: "Comprehensive DPIA guidance for AI systems processing personal data, including methodology and template",
    category: "Privacy",
    template: "I need to conduct a Data Protection Impact Assessment (DPIA) for an AI system under GDPR Article 35.",
    tags: ["dpia", "gdpr", "privacy", "risk-assessment", "article-35"],
  },
  {
    id: "mlops-governance",
    title: "MLOps Governance Implementation",
    description: "Comprehensive MLOps governance framework with technical controls, monitoring, and compliance integration",
    category: "Technical",
    template: "I need to implement governance controls in our MLOps pipeline to ensure AI system compliance and quality.",
    tags: ["mlops", "governance", "technical", "monitoring", "compliance"],
  },
  {
    id: "cross-border-compliance",
    title: "Multi-Jurisdictional Compliance Strategy",
    description: "Navigate compliance across multiple jurisdictions (EU, UK, US) with conflicting requirements",
    category: "Compliance",
    template: "I need to ensure compliance for an AI system that operates across multiple jurisdictions.",
    tags: ["cross-border", "multi-jurisdictional", "compliance", "data-transfer", "international"],
  },
  {
    id: "incident-response",
    title: "AI Incident Response & Remediation",
    description: "Comprehensive incident response plan for AI system failures, bias incidents, and data breaches",
    category: "Risk Management",
    template: "I need to develop an incident response plan for AI system incidents.",
    tags: ["incident-response", "remediation", "breach", "risk-management", "compliance"],
  },
  {
    id: "model-documentation",
    title: "Model Documentation Standards",
    description: "Comprehensive model documentation following Model Cards, Datasheets, and regulatory requirements",
    category: "Documentation",
    template: "I need to create comprehensive documentation for my AI model to meet regulatory and best practice requirements.",
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
    // Use the template as-is (no placeholders to replace)
    // Prompt library prompts are standalone and don't need user context replacement
    onSelectPrompt(prompt.id, prompt.template);
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

