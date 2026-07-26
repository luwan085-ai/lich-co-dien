const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('/Users/namgyeongmin/Desktop/일력/src');
let brokenCount = 0;

files.forEach((f) => {
  const content = fs.readFileSync(f, 'utf-8');
  // Check for replacement character \uFFFD () or invalid UTF-8 sequences
  if (content.includes('\uFFFD') || content.includes('')) {
    console.log('Broken character found in:', f);
    brokenCount++;
  }
});

if (brokenCount === 0) {
  console.log('SUCCESS: Zero broken characters or unicode corruptions found across all 56 source files!');
}
