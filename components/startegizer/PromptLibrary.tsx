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

// Mock prompt templates - will be replaced with database queries later
const MOCK_PROMPTS: PromptTemplate[] = [
  {
    id: "risk-assessment",
    title: "AI Risk Classification",
    description: "Classify an AI system according to risk categories (Unacceptable/High/Limited/Minimal)",
    category: "Risk Assessment",
    template: "Analyze the following AI use case and classify its risk level:\n\nUse Case: [Describe your AI use case]\nContext: [Business context]\nData Types: [Types of data processed]\nDecision Impact: [Impact of AI decisions]\n\nProvide:\n1. Risk classification\n2. Rationale\n3. Key risk factors\n4. Recommended mitigation strategies",
    tags: ["risk", "classification", "ai-act"],
  },
  {
    id: "gdpr-compliance",
    title: "GDPR Compliance Check",
    description: "Assess GDPR compliance for an AI system processing personal data",
    category: "Compliance",
    template: "Evaluate GDPR compliance for:\n\nAI System: [System description]\nData Types: [Personal data types]\nProcessing Purpose: [Why data is processed]\nData Subjects: [Who is affected]\n\nCheck:\n1. Lawful basis for processing\n2. Data minimization\n3. Purpose limitation\n4. Individual rights\n5. Data protection by design\n6. Required documentation",
    tags: ["gdpr", "compliance", "data-protection"],
  },
  {
    id: "transparency-requirements",
    title: "Transparency Requirements",
    description: "Identify transparency and explainability requirements for an AI system",
    category: "Transparency",
    template: "What transparency requirements apply to:\n\nAI System: [System description]\nUse Case: [How it's used]\nStakeholders: [Who needs to understand]\n\nIdentify:\n1. Required disclosures\n2. Explanation requirements\n3. Documentation needs\n4. Communication channels\n5. Regulatory obligations",
    tags: ["transparency", "explainability", "ai-act"],
  },
  {
    id: "bias-detection",
    title: "Bias Detection & Mitigation",
    description: "Identify potential biases and recommend mitigation strategies",
    category: "Ethics",
    template: "Analyze potential bias in:\n\nAI System: [System description]\nTraining Data: [Data characteristics]\nDecision Context: [Where decisions are made]\nAffected Groups: [Who is impacted]\n\nAssess:\n1. Potential bias sources\n2. Impact on different groups\n3. Detection methods\n4. Mitigation strategies\n5. Ongoing monitoring",
    tags: ["bias", "fairness", "ethics"],
  },
  {
    id: "ai-act-compliance",
    title: "EU AI Act Compliance",
    description: "Determine AI Act risk category and compliance requirements",
    category: "Compliance",
    template: "Assess EU AI Act compliance for:\n\nAI System: [System description]\nDeployment Context: [Where/how deployed]\nRisk Level: [Initial assessment]\n\nDetermine:\n1. Risk category (Unacceptable/High/Limited/Minimal)\n2. Applicable requirements\n3. Conformity assessment needs\n4. Documentation requirements\n5. Post-market monitoring",
    tags: ["ai-act", "eu", "compliance"],
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

