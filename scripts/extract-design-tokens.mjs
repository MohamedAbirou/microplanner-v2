import fs from 'fs';

const s = fs.readFileSync('c:/Users/defaultuser0/Downloads/MicroPlanner - standalone.html', 'utf8');

const start = s.indexOf('.mp-root{');
console.log('=== MP-ROOT CSS ===');
console.log(s.slice(start, start + 3000).replace(/\\n/g, '\n'));

console.log('\n=== SIDEBAR SNIPPET ===');
const si = s.indexOf('<!-- Sidebar -->');
console.log(s.slice(si, si + 2000).replace(/\\n/g, '\n'));

console.log('\n=== TODAY SNIPPET ===');
const ti = s.indexOf('showToday');
console.log(s.slice(ti, ti + 2500).replace(/\\n/g, '\n'));
