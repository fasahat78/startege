import { prisma } from "./db";

export interface LevelConfig {
  level: number;
  title: string;
  description: string;
  outcomeStatement: string; // "This Level Answers..." statement
  questionCount: number;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  basePoints: number;
  isBoss?: boolean; // Optional flag for boss levels
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  // Levels 1-10: Foundation (50 points)
  { level: 1, title: "Introduction to AI Governance", description: "Foundation concepts", outcomeStatement: "What is AI governance, and why does it matter?", questionCount: 10, timeLimit: 20, passingScore: 70, basePoints: 50 },
  { level: 2, title: "Core Principles", description: "Basic governance principles", outcomeStatement: "What principles should guide responsible AI use?", questionCount: 10, timeLimit: 20, passingScore: 70, basePoints: 50 },
  { level: 3, title: "GDPR Fundamentals", description: "GDPR basics and requirements", outcomeStatement: "How does data protection law shape AI governance?", questionCount: 10, timeLimit: 20, passingScore: 70, basePoints: 50 },
  { level: 4, title: "Data Protection", description: "Data protection principles", outcomeStatement: "How should personal data be governed in AI systems?", questionCount: 10, timeLimit: 20, passingScore: 70, basePoints: 50 },
  { level: 5, title: "Privacy Rights", description: "Individual privacy rights", outcomeStatement: "What rights do individuals have when AI uses their data?", questionCount: 12, timeLimit: 22, passingScore: 70, basePoints: 50 },
  { level: 6, title: "AI Act Overview", description: "EU AI Act introduction", outcomeStatement: "How does the AI Act change expectations for AI governance?", questionCount: 12, timeLimit: 22, passingScore: 70, basePoints: 50 },
  { level: 7, title: "Risk Management", description: "Risk-based approach", outcomeStatement: "How do organisations identify and reason about AI risk?", questionCount: 12, timeLimit: 22, passingScore: 70, basePoints: 50 },
  { level: 8, title: "Transparency", description: "Transparency requirements", outcomeStatement: "What must organisations explain about their AI systems, and to whom?", questionCount: 12, timeLimit: 22, passingScore: 70, basePoints: 50 },
  { level: 9, title: "Accountability", description: "Accountability mechanisms", outcomeStatement: "Who is accountable for AI decisions, failures, and escalation?", questionCount: 12, timeLimit: 22, passingScore: 70, basePoints: 50 },
  { level: 10, title: "Foundation Mastery", description: "Foundation level completion", outcomeStatement: "Can you apply core AI governance principles together in realistic situations?", questionCount: 12, timeLimit: 25, passingScore: 70, basePoints: 50 },
  
  // Levels 11-20: Building (75 points)
  { level: 11, title: "Intermediate Applications", description: "Applying foundational knowledge", outcomeStatement: "How do we define and scope AI use cases for governance?", questionCount: 12, timeLimit: 25, passingScore: 70, basePoints: 75 },
  { level: 12, title: "Cross-Border Data", description: "International data transfers", outcomeStatement: "How does geography and jurisdiction complicate AI governance?", questionCount: 12, timeLimit: 25, passingScore: 70, basePoints: 75 },
  { level: 13, title: "AI Act Requirements", description: "Detailed AI Act obligations", outcomeStatement: "Given an AI use case, what does the AI Act require us to do?", questionCount: 13, timeLimit: 25, passingScore: 70, basePoints: 75 },
  { level: 14, title: "Impact Assessments", description: "DPIA and AIA requirements", outcomeStatement: "How do we formally assess and document AI risks before deployment?", questionCount: 13, timeLimit: 25, passingScore: 70, basePoints: 75 },
  { level: 15, title: "High-Risk AI Systems", description: "High-risk AI classification", outcomeStatement: "What changes when an AI system is classified as high-risk?", questionCount: 13, timeLimit: 25, passingScore: 70, basePoints: 75 },
  { level: 16, title: "Algorithmic Accountability", description: "Accountability in AI systems", outcomeStatement: "How do we prove our AI governance claims are true?", questionCount: 13, timeLimit: 25, passingScore: 70, basePoints: 75 },
  { level: 17, title: "Bias and Fairness", description: "Addressing AI bias", outcomeStatement: "How do we govern whether AI systems behave fairly and responsibly?", questionCount: 14, timeLimit: 27, passingScore: 70, basePoints: 75 },
  { level: 18, title: "Enforcement Mechanisms", description: "Regulatory enforcement", outcomeStatement: "What happens when AI governance obligations are breached?", questionCount: 14, timeLimit: 27, passingScore: 70, basePoints: 75 },
  { level: 19, title: "Compliance Frameworks", description: "Building compliance programs", outcomeStatement: "How do organisations structure AI governance so it is repeatable, scalable, and defensible?", questionCount: 14, timeLimit: 27, passingScore: 70, basePoints: 75 },
  { level: 20, title: "Intermediate Mastery", description: "Intermediate level completion (Boss)", outcomeStatement: "Can you operate AI governance end-to-end in a real organisation?", questionCount: 20, timeLimit: 45, passingScore: 75, basePoints: 75 },
  
  // Levels 21-30: Advanced (100 points)
  { level: 21, title: "Advanced Scenarios", description: "Complex real-world scenarios", outcomeStatement: "How do you govern AI when there is no clear right answer?", questionCount: 14, timeLimit: 27, passingScore: 70, basePoints: 100 },
  { level: 22, title: "Multi-Jurisdictional", description: "Cross-border compliance", outcomeStatement: "How do you govern AI when different jurisdictions expect different things?", questionCount: 14, timeLimit: 27, passingScore: 70, basePoints: 100 },
  { level: 23, title: "Ethical Frameworks", description: "Ethical AI implementation", outcomeStatement: "How should we govern AI when legality does not guarantee legitimacy?", questionCount: 15, timeLimit: 28, passingScore: 70, basePoints: 100 },
  { level: 24, title: "Regulatory Sandboxes", description: "Innovation and regulation", outcomeStatement: "How can organisations innovate with AI while remaining governed and accountable?", questionCount: 15, timeLimit: 28, passingScore: 70, basePoints: 100 },
  { level: 25, title: "Case Law Analysis", description: "Legal precedents and cases", outcomeStatement: "What do real AI-related cases tell us about how governance fails or succeeds?", questionCount: 15, timeLimit: 28, passingScore: 70, basePoints: 100 },
  { level: 26, title: "Governance Models", description: "Hybrid governance approaches", outcomeStatement: "How should AI governance be organised inside an organisation?", questionCount: 15, timeLimit: 28, passingScore: 70, basePoints: 100 },
  { level: 27, title: "Risk Management Advanced", description: "Advanced risk strategies", outcomeStatement: "How do we decide which AI risks to accept, mitigate, escalate, or stop — at scale?", questionCount: 15, timeLimit: 28, passingScore: 70, basePoints: 100 },
  { level: 28, title: "Strategic Compliance", description: "Strategic compliance planning", outcomeStatement: "How can strong AI compliance strengthen, rather than constrain, the organisation?", questionCount: 15, timeLimit: 28, passingScore: 70, basePoints: 100 },
  { level: 29, title: "Emerging Regulations", description: "New regulatory developments", outcomeStatement: "How do we govern AI today for regulations that don't fully exist yet?", questionCount: 15, timeLimit: 28, passingScore: 70, basePoints: 100 },
  { level: 30, title: "Advanced Mastery", description: "Advanced level completion (Boss)", outcomeStatement: "Can you design and defend AI governance decisions when rules are incomplete, risks are systemic, and scrutiny is inevitable?", questionCount: 20, timeLimit: 50, passingScore: 80, basePoints: 100 },
  
  // Levels 31-40: Mastery (150 points)
  { level: 31, title: "Expert Synthesis", description: "Synthesizing complex knowledge", outcomeStatement: "How do expert practitioners integrate everything they know into sound AI governance judgement?", questionCount: 15, timeLimit: 28, passingScore: 75, basePoints: 150 },
  { level: 32, title: "Framework Design", description: "Designing governance frameworks", outcomeStatement: "How do you design an AI governance framework that actually works?", questionCount: 16, timeLimit: 30, passingScore: 75, basePoints: 150 },
  { level: 33, title: "Real-World Problems", description: "Complex problem-solving", outcomeStatement: "How does AI governance actually hold up in the real world?", questionCount: 16, timeLimit: 30, passingScore: 75, basePoints: 150 },
  { level: 34, title: "Multi-Domain Integration", description: "Integrating multiple domains", outcomeStatement: "How does AI governance fit into the broader governance ecosystem?", questionCount: 16, timeLimit: 30, passingScore: 75, basePoints: 150 },
  { level: 35, title: "Strategic Planning", description: "Strategic AI governance", outcomeStatement: "How do we plan AI governance over years, not projects?", questionCount: 16, timeLimit: 30, passingScore: 75, basePoints: 150 },
  { level: 36, title: "Expert Analysis", description: "Expert-level analysis", outcomeStatement: "How do experts evaluate whether AI governance is actually effective?", questionCount: 16, timeLimit: 30, passingScore: 75, basePoints: 150 },
  { level: 37, title: "Mastery Integration", description: "Master-level integration", outcomeStatement: "What does a fully integrated AI governance mindset look like?", questionCount: 17, timeLimit: 30, passingScore: 75, basePoints: 150 },
  { level: 38, title: "Advanced Frameworks", description: "Advanced framework design", outcomeStatement: "How do you govern AI when existing frameworks are not enough?", questionCount: 17, timeLimit: 30, passingScore: 75, basePoints: 150 },
  { level: 39, title: "Expert Synthesis", description: "Final synthesis challenges", outcomeStatement: "Can you articulate, defend, and consistently apply a complete AI governance philosophy?", questionCount: 18, timeLimit: 35, passingScore: 75, basePoints: 150 },
  { level: 40, title: "AI Governance Master", description: "Complete mastery achievement", outcomeStatement: "Can you be trusted to govern AI at the highest level?", questionCount: 25, timeLimit: 60, passingScore: 85, basePoints: 150, isBoss: true },
];

export function getLevelConfig(level: number): LevelConfig | undefined {
  return LEVEL_CONFIGS.find(config => config.level === level);
}

export function canAccessLevel(userTier: string, maxUnlockedLevel: number, level: number): boolean {
  // Free tier: Levels 1-10
  if (level <= 10) {
    return true;
  }
  
  // Premium tier: Levels 11-40
  if (level > 10 && level <= 40) {
    return userTier === "premium" && level <= maxUnlockedLevel;
  }
  
  return false;
}

export function getBasePointsForLevel(level: number): number {
  if (level <= 10) return 50;
  if (level <= 20) return 75;
  if (level <= 30) return 100;
  return 150;
}

