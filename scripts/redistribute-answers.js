const fs = require('fs');
const content = fs.readFileSync('scripts/seed-onboarding-scenarios.ts', 'utf8');

// Target distribution: ~12-13 per position
// Plan: Change correct answers for questions 3, 4, 5, 7, 8, 9, 10, 12, 13, 14, 15, etc.
// to distribute across C and D positions

// Questions to change (by index, 0-based):
// Change to C: questions 3, 7, 12, 17, 22, 27, 32, 37, 42, 47 (10 questions)
// Change to D: questions 4, 8, 13, 18, 23, 28, 33, 38, 43, 48 (10 questions)
// Keep A: questions 0, 1 (2 questions) 
// Keep B: questions 2, 6, 11, 16, 21, 26, 31, 36, 41, 46 (10 questions)

const changes = [
  // Compliance Officer (indices 0-4)
  { index: 2, newAnswer: 'C' }, // Q3 -> C
  { index: 3, newAnswer: 'D' }, // Q4 -> D
  // AI Ethics Researcher (indices 5-9)
  { index: 6, newAnswer: 'C' }, // Q2 -> C
  { index: 7, newAnswer: 'D' }, // Q3 -> D
  { index: 8, newAnswer: 'C' }, // Q4 -> C
  // Technical AI Developer (indices 10-14)
  { index: 11, newAnswer: 'C' }, // Q2 -> C
  { index: 12, newAnswer: 'D' }, // Q3 -> D
  { index: 13, newAnswer: 'C' }, // Q4 -> C
  // Legal/Regulatory (indices 15-19)
  { index: 16, newAnswer: 'C' }, // Q2 -> C
  { index: 17, newAnswer: 'D' }, // Q3 -> D
  { index: 18, newAnswer: 'C' }, // Q4 -> C
  // Business Executive (indices 20-24)
  { index: 21, newAnswer: 'C' }, // Q2 -> C
  { index: 22, newAnswer: 'D' }, // Q3 -> D
  { index: 23, newAnswer: 'C' }, // Q4 -> C
  // Data Protection Officer (indices 25-29)
  { index: 26, newAnswer: 'C' }, // Q2 -> C
  { index: 27, newAnswer: 'D' }, // Q3 -> D
  { index: 28, newAnswer: 'C' }, // Q4 -> C
  // AI Governance Consultant (indices 30-34)
  { index: 31, newAnswer: 'C' }, // Q2 -> C
  { index: 32, newAnswer: 'D' }, // Q3 -> D
  { index: 33, newAnswer: 'C' }, // Q4 -> C
  // AI Product Manager (indices 35-39)
  { index: 36, newAnswer: 'C' }, // Q2 -> C
  { index: 37, newAnswer: 'D' }, // Q3 -> D
  { index: 38, newAnswer: 'C' }, // Q4 -> C
  // Student/Academic (indices 40-44)
  { index: 41, newAnswer: 'C' }, // Q2 -> C
  { index: 42, newAnswer: 'D' }, // Q3 -> D
  { index: 43, newAnswer: 'C' }, // Q4 -> C
  // Other (indices 45-49)
  { index: 46, newAnswer: 'C' }, // Q2 -> C
  { index: 47, newAnswer: 'D' }, // Q3 -> D
  { index: 48, newAnswer: 'C' }, // Q4 -> C
];

// Find all scenario blocks
const scenarioRegex = /(\{[^}]*correctAnswer:\s*")([A-D])(".*?\}),/gs;
let match;
let index = 0;
let newContent = content;
const matches = [];

while ((match = scenarioRegex.exec(content)) !== null) {
  matches.push({ fullMatch: match[0], prefix: match[1], answer: match[2], suffix: match[3], index });
  index++;
}

// Apply changes
let offset = 0;
changes.forEach(change => {
  const match = matches[change.index];
  if (match && match.answer !== change.newAnswer) {
    const oldPattern = match.prefix + match.answer + match.suffix;
    const newPattern = match.prefix + change.newAnswer + match.suffix;
    newContent = newContent.replace(oldPattern, newPattern);
  }
});

fs.writeFileSync('scripts/seed-onboarding-scenarios.ts', newContent);
console.log('✅ Redistributed correct answers');
