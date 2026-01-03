"use client";

import { useState, useRef, useEffect } from "react";
import { getCategoriesForPersona, getScenarioById, type UseCaseCategory, type UseCaseScenario } from "@/lib/use-case-categories";
import BUILDING_BLOCKS from "@/lib/use-case-blocks";

interface BuiltUseCase {
  systemType?: string;
  dataTypes: string[];
  deploymentContext?: string;
  riskLevel?: string;
  frameworks: string[];
  stakeholders: string[];
  decisionImpact?: string;
  description: string;
}

interface UseCaseBuilderProps {
  onUseCaseBuilt: (useCase: BuiltUseCase) => void;
  onClose: () => void;
  persona?: string | null;
}

type BuilderStep = "category" | "scenario" | "customize";

export default function UseCaseBuilder({ onUseCaseBuilt, onClose, persona }: UseCaseBuilderProps) {
  const [step, setStep] = useState<BuilderStep>("category");
  const [selectedCategory, setSelectedCategory] = useState<UseCaseCategory | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<UseCaseScenario | null>(null);
  const [builtUseCase, setBuiltUseCase] = useState<BuiltUseCase>({
    dataTypes: [],
    frameworks: [],
    stakeholders: [],
    description: "",
  });
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const blockRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Get persona-specific categories
  const categories = getCategoriesForPersona(persona || null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedBlock) {
        const currentRef = blockRefs.current[expandedBlock];
        if (currentRef && !currentRef.contains(event.target as Node)) {
          setExpandedBlock(null);
        }
      }
    };

    if (expandedBlock) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expandedBlock]);

  // When scenario is selected, pre-fill building blocks
  useEffect(() => {
    if (selectedScenario && step === "customize") {
      const suggested = selectedScenario.suggestedBlocks;
      setBuiltUseCase((prev) => ({
        ...prev,
        systemType: suggested.systemType || prev.systemType,
        dataTypes: suggested.dataTypes || prev.dataTypes,
        deploymentContext: suggested.deployment || prev.deploymentContext,
        riskLevel: suggested.riskLevel || prev.riskLevel,
        frameworks: suggested.frameworks || prev.frameworks,
        stakeholders: suggested.stakeholders || prev.stakeholders,
        decisionImpact: suggested.impact || prev.decisionImpact,
        description: selectedScenario.templateDescription,
      }));
    }
  }, [selectedScenario, step]);

  const handleCategorySelect = (category: UseCaseCategory) => {
    setSelectedCategory(category);
    setStep("scenario");
  };

  const handleScenarioSelect = (scenario: UseCaseScenario) => {
    setSelectedScenario(scenario);
    setStep("customize");
  };

  const handleBlockSelect = (blockId: string, value: string, isMultiSelect: boolean = false) => {
    setBuiltUseCase((prev) => {
      const block = BUILDING_BLOCKS.find((b) => b.id === blockId);
      if (!block) return prev;

      const newState = { ...prev };

      switch (block.type) {
        case "system-type":
          newState.systemType = value;
          break;
        case "data-type":
          if (isMultiSelect) {
            const currentTypes = newState.dataTypes || [];
            if (currentTypes.includes(value)) {
              newState.dataTypes = currentTypes.filter((t) => t !== value);
            } else {
              newState.dataTypes = [...currentTypes, value];
            }
          } else {
            newState.dataTypes = [value];
          }
          break;
        case "deployment":
          newState.deploymentContext = value;
          break;
        case "risk":
          newState.riskLevel = value;
          break;
        case "framework":
          if (isMultiSelect) {
            const currentFrameworks = newState.frameworks || [];
            if (currentFrameworks.includes(value)) {
              newState.frameworks = currentFrameworks.filter((f) => f !== value);
            } else {
              newState.frameworks = [...currentFrameworks, value];
            }
          } else {
            newState.frameworks = [value];
          }
          break;
        case "stakeholder":
          if (isMultiSelect) {
            const currentStakeholders = newState.stakeholders || [];
            if (currentStakeholders.includes(value)) {
              newState.stakeholders = currentStakeholders.filter((s) => s !== value);
            } else {
              newState.stakeholders = [...currentStakeholders, value];
            }
          } else {
            newState.stakeholders = [value];
          }
          break;
        case "impact":
          newState.decisionImpact = value;
          break;
        case "description":
          newState.description = value;
          break;
      }

      return newState;
    });
  };

  const handleSubmit = () => {
    if (!builtUseCase.description.trim()) {
      alert("Please provide a use case description");
      return;
    }
    onUseCaseBuilt(builtUseCase);
  };

  const handleBack = () => {
    if (step === "scenario") {
      setStep("category");
      setSelectedCategory(null);
    } else if (step === "customize") {
      setStep("scenario");
      setSelectedScenario(null);
    }
  };

  // Step 1: Category Selection
  if (step === "category") {
    return (
      <div className="bg-card rounded-lg border border-border p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">Use Case Builder</h2>
            <p className="text-sm text-muted-foreground">
              {persona 
                ? `Select a category relevant to your role as ${persona.replace(/_/g, " ")}`
                : "Select a category to get started"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground transition"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category)}
              className="text-left p-5 bg-muted border border-border rounded-lg hover:border-primary hover:bg-muted/80 transition group"
            >
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">{category.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground mb-1 group-hover:text-primary transition">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <svg
                  className="h-5 w-5 text-muted-foreground group-hover:text-primary transition"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {category.scenarios.length} scenario{category.scenarios.length !== 1 ? "s" : ""} available
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Scenario Selection
  if (step === "scenario" && selectedCategory) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={handleBack}
              className="text-sm text-muted-foreground hover:text-card-foreground mb-2 flex items-center gap-1"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Categories
            </button>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">{selectedCategory.name}</h2>
            <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground transition"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {selectedCategory.scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleScenarioSelect(scenario)}
              className="w-full text-left p-4 bg-muted border border-border rounded-lg hover:border-primary hover:bg-muted/80 transition group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground mb-1 group-hover:text-primary transition">
                    {scenario.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                </div>
                <svg
                  className="h-5 w-5 text-muted-foreground group-hover:text-primary transition flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 3: Customize Building Blocks
  return (
    <div className="bg-card rounded-lg border border-border p-6 max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={handleBack}
            className="text-sm text-muted-foreground hover:text-card-foreground mb-2 flex items-center gap-1"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Scenarios
          </button>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            {selectedScenario?.name || "Customize Use Case"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Review and customize the building blocks, then add your specific details
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-card-foreground transition"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Building Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {BUILDING_BLOCKS.filter((block) => block.type !== "description").map((block) => {
          const isMultiSelect =
            block.type === "data-type" ||
            block.type === "framework" ||
            block.type === "stakeholder";

          const hasSelection =
            block.type === "data-type"
              ? builtUseCase.dataTypes.length > 0
              : block.type === "framework"
              ? builtUseCase.frameworks.length > 0
              : block.type === "stakeholder"
              ? builtUseCase.stakeholders.length > 0
              : block.type === "system-type"
              ? !!builtUseCase.systemType
              : block.type === "deployment"
              ? !!builtUseCase.deploymentContext
              : block.type === "risk"
              ? !!builtUseCase.riskLevel
              : block.type === "impact"
              ? !!builtUseCase.decisionImpact
              : false;

          const getSelectedValues = () => {
            switch (block.type) {
              case "data-type":
                return builtUseCase.dataTypes;
              case "framework":
                return builtUseCase.frameworks;
              case "stakeholder":
                return builtUseCase.stakeholders;
              default:
                return [];
            }
          };

          const handleRemoveSelection = (value: string) => {
            handleBlockSelect(block.id, value, true);
          };

          const getSelectedLabel = (): string => {
            switch (block.type) {
              case "system-type":
                return block.options?.find((o) => o.value === builtUseCase.systemType)?.label || "Select...";
              case "data-type":
                if (builtUseCase.dataTypes.length === 0) return "Select...";
                return `${builtUseCase.dataTypes.length} selected`;
              case "deployment":
                return block.options?.find((o) => o.value === builtUseCase.deploymentContext)?.label || "Select...";
              case "risk":
                return block.options?.find((o) => o.value === builtUseCase.riskLevel)?.label || "Select...";
              case "framework":
                if (builtUseCase.frameworks.length === 0) return "Select...";
                return `${builtUseCase.frameworks.length} selected`;
              case "stakeholder":
                if (builtUseCase.stakeholders.length === 0) return "Select...";
                return `${builtUseCase.stakeholders.length} selected`;
              case "impact":
                return block.options?.find((o) => o.value === builtUseCase.decisionImpact)?.label || "Select...";
              default:
                return "";
            }
          };

          return (
            <div key={block.id} className="relative">
              <div className="w-full p-4 bg-muted border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-card-foreground">{block.label}</div>
                  {hasSelection && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isMultiSelect) {
                          const values = getSelectedValues();
                          values.forEach((val) => handleBlockSelect(block.id, val, true));
                        } else {
                          handleBlockSelect(block.id, "", false);
                        }
                      }}
                      className="text-xs text-muted-foreground hover:text-card-foreground transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Selected Items as Chips */}
                {hasSelection && isMultiSelect && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {getSelectedValues().map((value) => {
                      const option = block.options?.find((o) => o.value === value);
                      if (!option) return null;
                      return (
                        <div
                          key={value}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 rounded-full text-sm"
                        >
                          <span className="text-card-foreground">{option.label}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveSelection(value);
                            }}
                            className="text-primary hover:text-primary/70 transition"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Single Select Display */}
                {hasSelection && !isMultiSelect && (
                  <div className="mb-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-sm">
                      <span className="text-card-foreground">{getSelectedLabel()}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBlockSelect(block.id, "", false);
                        }}
                        className="text-primary hover:text-primary/70 transition"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Dropdown Toggle */}
                <button
                  onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
                  className="w-full text-left p-2 bg-card border border-border rounded-lg hover:border-primary transition flex items-center justify-between"
                >
                  <span className="text-sm text-muted-foreground">
                    {hasSelection ? (isMultiSelect ? "Add more..." : "Change selection") : "Select options..."}
                  </span>
                  <svg
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      expandedBlock === block.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Options */}
                {expandedBlock === block.id && block.options && (
                  <div
                    ref={(el) => {
                      if (el) blockRefs.current[block.id] = el;
                    }}
                    className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-lg p-4 max-h-64 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-2">
                      {block.options.map((option) => {
                        const isSelected =
                          block.type === "data-type"
                            ? builtUseCase.dataTypes.includes(option.value)
                            : block.type === "framework"
                            ? builtUseCase.frameworks.includes(option.value)
                            : block.type === "stakeholder"
                            ? builtUseCase.stakeholders.includes(option.value)
                            : block.type === "system-type"
                            ? builtUseCase.systemType === option.value
                            : block.type === "deployment"
                            ? builtUseCase.deploymentContext === option.value
                            : block.type === "risk"
                            ? builtUseCase.riskLevel === option.value
                            : block.type === "impact"
                            ? builtUseCase.decisionImpact === option.value
                            : false;

                        return (
                          <button
                            key={option.value}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBlockSelect(block.id, option.value, isMultiSelect);
                              if (!isMultiSelect) {
                                setTimeout(() => setExpandedBlock(null), 150);
                              }
                            }}
                            className={`w-full text-left p-3 rounded-lg transition ${
                              isSelected
                                ? "bg-primary/10 border-2 border-primary"
                                : "bg-muted border border-border hover:border-primary/50 hover:bg-muted/80"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-card-foreground flex items-center gap-2">
                                  {isSelected && (
                                    <svg className="h-4 w-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  <span>{option.label}</span>
                                </div>
                                {option.description && (
                                  <div className="text-xs text-muted-foreground mt-1 ml-6">{option.description}</div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Description Block */}
      <div className="mb-6">
        <label className="block font-semibold text-card-foreground mb-2">
          Use Case Description *
        </label>
        <textarea
          value={builtUseCase.description}
          onChange={(e) => handleBlockSelect("description", e.target.value)}
          placeholder="Describe your AI governance use case in detail..."
          rows={6}
          className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {selectedScenario 
            ? "Review and customize the template description above, or replace it with your own."
            : "Provide a detailed description of your AI system, its purpose, and the governance challenges you're facing."}
        </p>
      </div>

      {/* Preview */}
      <div className="mb-6 p-4 bg-muted/50 border border-border rounded-lg">
        <h3 className="font-semibold text-card-foreground mb-3">Use Case Preview</h3>
        <div className="space-y-2 text-sm">
          {builtUseCase.systemType && (
            <div>
              <span className="font-medium">System Type:</span>{" "}
              {BUILDING_BLOCKS.find((b) => b.id === "system-type")
                ?.options?.find((o) => o.value === builtUseCase.systemType)
                ?.label}
            </div>
          )}
          {builtUseCase.dataTypes.length > 0 && (
            <div>
              <span className="font-medium">Data Types:</span>{" "}
              {builtUseCase.dataTypes
                .map(
                  (dt) =>
                    BUILDING_BLOCKS.find((b) => b.id === "data-type")
                      ?.options?.find((o) => o.value === dt)
                      ?.label
                )
                .join(", ")}
            </div>
          )}
          {builtUseCase.deploymentContext && (
            <div>
              <span className="font-medium">Deployment:</span>{" "}
              {BUILDING_BLOCKS.find((b) => b.id === "deployment")
                ?.options?.find((o) => o.value === builtUseCase.deploymentContext)
                ?.label}
            </div>
          )}
          {builtUseCase.riskLevel && (
            <div>
              <span className="font-medium">Risk Level:</span>{" "}
              {BUILDING_BLOCKS.find((b) => b.id === "risk")
                ?.options?.find((o) => o.value === builtUseCase.riskLevel)
                ?.label}
            </div>
          )}
          {builtUseCase.frameworks.length > 0 && (
            <div>
              <span className="font-medium">Frameworks:</span>{" "}
              {builtUseCase.frameworks
                .map(
                  (f) =>
                    BUILDING_BLOCKS.find((b) => b.id === "framework")
                      ?.options?.find((o) => o.value === f)
                      ?.label
                )
                .join(", ")}
            </div>
          )}
          {builtUseCase.stakeholders.length > 0 && (
            <div>
              <span className="font-medium">Stakeholders:</span>{" "}
              {builtUseCase.stakeholders
                .map(
                  (s) =>
                    BUILDING_BLOCKS.find((b) => b.id === "stakeholder")
                      ?.options?.find((o) => o.value === s)
                      ?.label
                )
                .join(", ")}
            </div>
          )}
          {builtUseCase.decisionImpact && (
            <div>
              <span className="font-medium">Decision Impact:</span>{" "}
              {BUILDING_BLOCKS.find((b) => b.id === "impact")
                ?.options?.find((o) => o.value === builtUseCase.decisionImpact)
                ?.label}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleBack}
          className="px-6 py-2 border border-border rounded-lg font-medium hover:bg-muted transition"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!builtUseCase.description.trim()}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Build & Send to Startegizer
        </button>
      </div>
    </div>
  );
}
