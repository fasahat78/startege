/**
 * Onboarding Helper Functions
 */

import { prisma } from "./db";
import { PersonaType, KnowledgeLevel, OnboardingStatus } from "@prisma/client";

/**
 * Calculate knowledge level from scenario answers
 */
export function calculateKnowledgeLevel(correctAnswers: number, totalQuestions: number): KnowledgeLevel {
  if (totalQuestions === 0) return KnowledgeLevel.NOT_ASSESSED;
  
  const percentage = (correctAnswers / totalQuestions) * 100;
  
  if (percentage >= 80) return KnowledgeLevel.ADVANCED; // 4-5 correct out of 5
  if (percentage >= 40) return KnowledgeLevel.INTERMEDIATE; // 2-3 correct out of 5
  return KnowledgeLevel.BEGINNER; // 0-1 correct out of 5
}

/**
 * Get next onboarding status
 */
export function getNextOnboardingStatus(currentStatus: OnboardingStatus): OnboardingStatus {
  switch (currentStatus) {
    case OnboardingStatus.NOT_STARTED:
      return OnboardingStatus.PERSONA_SELECTED;
    case OnboardingStatus.PERSONA_SELECTED:
      return OnboardingStatus.KNOWLEDGE_ASSESSED;
    case OnboardingStatus.KNOWLEDGE_ASSESSED:
      return OnboardingStatus.INTERESTS_SELECTED;
    case OnboardingStatus.INTERESTS_SELECTED:
      return OnboardingStatus.GOALS_SELECTED;
    case OnboardingStatus.GOALS_SELECTED:
      return OnboardingStatus.COMPLETED;
    default:
      return currentStatus;
  }
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { onboardingStatus: true },
  });
  
  return profile?.onboardingStatus === OnboardingStatus.COMPLETED;
}

/**
 * Get user's onboarding status
 */
export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { onboardingStatus: true },
  });
  
  return profile?.onboardingStatus || null;
}

/**
 * Get persona display name
 */
export function getPersonaDisplayName(personaType: PersonaType): string {
  const names: Record<PersonaType, string> = {
    [PersonaType.COMPLIANCE_OFFICER]: "Compliance Officer",
    [PersonaType.AI_ETHICS_RESEARCHER]: "AI Ethics Researcher",
    [PersonaType.TECHNICAL_AI_DEVELOPER]: "Technical AI Developer",
    [PersonaType.LEGAL_REGULATORY_PROFESSIONAL]: "Legal/Regulatory Professional",
    [PersonaType.BUSINESS_EXECUTIVE]: "Business Executive",
    [PersonaType.DATA_PROTECTION_OFFICER]: "Data Protection Officer",
    [PersonaType.AI_GOVERNANCE_CONSULTANT]: "AI Governance Consultant",
    [PersonaType.AI_PRODUCT_MANAGER]: "AI Product Manager",
    [PersonaType.STUDENT_ACADEMIC]: "Student/Academic",
    [PersonaType.OTHER]: "Other",
  };
  
  return names[personaType] || personaType;
}

/**
 * Get persona description
 */
export function getPersonaDescription(personaType: PersonaType): string {
  const descriptions: Record<PersonaType, string> = {
    [PersonaType.COMPLIANCE_OFFICER]: "Ensure regulatory compliance, manage audit readiness, and assess compliance risks",
    [PersonaType.AI_ETHICS_RESEARCHER]: "Research ethical AI principles, assess fairness and bias, and evaluate societal impact",
    [PersonaType.TECHNICAL_AI_DEVELOPER]: "Build compliant AI systems, implement governance in code, and ensure technical standards",
    [PersonaType.LEGAL_REGULATORY_PROFESSIONAL]: "Interpret regulations, navigate requirements, and develop policies",
    [PersonaType.BUSINESS_EXECUTIVE]: "Make strategic decisions, balance innovation with governance, and manage business risk",
    [PersonaType.DATA_PROTECTION_OFFICER]: "Ensure data protection compliance, conduct privacy assessments, and handle data subject rights",
    [PersonaType.AI_GOVERNANCE_CONSULTANT]: "Advise organizations, develop implementation strategies, and apply best practices",
    [PersonaType.AI_PRODUCT_MANAGER]: "Build compliant AI products, balance UX with governance, and manage product risks",
    [PersonaType.STUDENT_ACADEMIC]: "Learn foundational concepts, apply theoretical frameworks, and conduct ethical research",
    [PersonaType.OTHER]: "Custom role with specific AI governance needs",
  };
  
  return descriptions[personaType] || "AI governance professional";
}

