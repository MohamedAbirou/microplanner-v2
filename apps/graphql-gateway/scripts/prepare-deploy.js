const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'src', 'schema');
const dest = path.join(__dirname, '..', 'dist', 'schema');

fs.cpSync(src, dest, { recursive: true });
console.log('✓ Copied GraphQL schema files to dist/schema');
