const fs = require('fs');
const content = fs.readFileSync('scripts/seed-onboarding-scenarios.ts', 'utf8');

// Extract scenarios
const scenarioRegex = /personaType: PersonaType\.(\w+),\s*questionOrder: (\d+),[\s\S]*?optionA: `([^`]+)`[\s\S]*?optionB: `([^`]+)`[\s\S]*?optionC: `([^`]+)`[\s\S]*?optionD: `([^`]+)`[\s\S]*?correctAnswer: "([A-D])"[\s\S]*?explanation: `([^`]+)`/g;

let match;
let issues = [];

while ((match = scenarioRegex.exec(content)) !== null) {
  const [, persona, order, optA, optB, optC, optD, correct, explanation] = match;
  const correctText = correct === 'A' ? optA : correct === 'B' ? optB : correct === 'C' ? optC : optD;
  
  // Check if explanation mentions key phrases from correct answer
  const explanationLower = explanation.toLowerCase();
  const correctLower = correctText.toLowerCase();
  
  // Simple check: see if key words from explanation appear in correct answer
  const explanationWords = explanationLower.split(/\s+/).filter(w => w.length > 4);
  const matches = explanationWords.filter(word => correctLower.includes(word)).length;
  
  if (matches < 3) {
    issues.push({
      persona,
      order,
      correct,
      correctText: correctText.substring(0, 80) + '...',
      explanation: explanation.substring(0, 80) + '...'
    });
  }
}

console.log(`Found ${issues.length} potential mismatches:\n`);
issues.forEach((issue, i) => {
  console.log(`${i+1}. ${issue.persona} Q${issue.order} (correctAnswer: ${issue.correct})`);
  console.log(`   Correct text: ${issue.correctText}`);
  console.log(`   Explanation: ${issue.explanation}\n`);
});
