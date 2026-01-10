const fs = require('fs');
let content = fs.readFileSync('scripts/seed-onboarding-scenarios.ts', 'utf8');

// Questions where correctAnswer changed from B to C or D
// Need to swap option text accordingly

// Function to swap options
function swapOptions(content, correctAnswer, fromOption, toOption) {
  // Find scenario blocks with the specific correctAnswer
  const regex = new RegExp(
    `(option${fromOption}:\\s*\`)([^\`]+)(\`[\\s\\S]*?option${toOption}:\\s*\`)([^\`]+)(\`[\\s\\S]*?correctAnswer:\\s*"${correctAnswer}")`,
    'g'
  );
  
  return content.replace(regex, (match, p1, p2, p3, p4, p5) => {
    // Swap: optionB text goes to optionC, optionC text goes to optionB
    return `${p1}${p4}${p3}${p2}${p5}`;
  });
}

// For questions where correctAnswer is C but correct text is in B
// Swap B and C
content = swapOptions(content, 'C', 'B', 'C');

// For questions where correctAnswer is D but correct text is in B  
// Swap B and D
content = content.replace(
  /(optionB:\s*`)([^\`]+)(`[\s\S]*?optionD:\s*`)([^\`]+)(`[\s\S]*?correctAnswer:\s*"D")/g,
  (match, p1, p2, p3, p4, p5) => {
    return `${p1}${p4}${p3}${p2}${p5}`;
  }
);

fs.writeFileSync('scripts/seed-onboarding-scenarios.ts', content);
console.log('✅ Swapped option text to match correctAnswer positions');
