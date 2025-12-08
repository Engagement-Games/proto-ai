const fs = require('fs');

const content = fs.readFileSync('app/page.tsx', 'utf8');
const lines = content.split('\n');

// Find key line numbers
const returnLineIndex = lines.findIndex((line, idx) => idx >= 600 && line.trim() === 'return (');
const settingsModalStartIndex = lines.findIndex(line => line.includes('{/* Settings Modal */}'));
const settingsModalEndIndex = lines.findIndex((line, idx) => idx > settingsModalStartIndex && line.includes('Save Game'));

console.log(`Return line: ${returnLineIndex + 1}`);
console.log(`Settings modal start: ${settingsModalStartIndex + 1}`);
console.log(`Settings modal end (Save Game): ${settingsModalEndIndex + 1}`);

// Extract settings content (from inside the modal)
// Find the div that contains all settings
let settingsContentStart = settingsModalStartIndex;
for (let i = settingsModalStartIndex; i < settingsModalEndIndex; i++) {
  if (lines[i].includes('<div className="w-1/2 p-6 border-r')) {
    settingsContentStart = i + 2; // Skip the div and h2
    break;
  }
}

console.log(`Settings content starts around: ${settingsContentStart + 1}`);

// Output for verification
console.log('\nFirst few lines of settings content:');
for (let i = 0; i < 5 && settingsContentStart + i < lines.length; i++) {
  console.log(`${settingsContentStart + i + 1}: ${lines[settingsContentStart + i]}`);
}


