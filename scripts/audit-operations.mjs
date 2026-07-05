#!/usr/bin/env node
/**
 * Operations audit: every GraphQL document the web app sends must validate
 * against the graphql-gateway schema.
 *
 * Usage: node scripts/audit-operations.mjs
 * Exits non-zero if any document fails validation.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// Use the gateway's graphql install so schema + validation share one impl
const require = createRequire(join(root, 'apps/graphql-gateway/package.json'));
const { buildASTSchema, parse, validate, specifiedRules } = require('graphql');

// ---------- 1. Build the gateway schema ----------
const schemaDir = join(root, 'apps/graphql-gateway/src/schema');
const schemaFiles = [
  'scalars.graphql', 'index.graphql', 'user.graphql', 'waitlist.graphql',
  'onboarding.graphql', 'dashboard.graphql', 'goal.graphql', 'task.graphql',
  'project.graphql', 'productivity.graphql', 'plan.graphql', 'analytics.graphql',
  'calendar.graphql', 'teams.graphql', 'scheduling.graphql',
  'integrations.graphql', 'billing.graphql',
];
const sdl = schemaFiles.map((f) => readFileSync(join(schemaDir, f), 'utf8')).join('\n');
const schema = buildASTSchema(parse(sdl), { assumeValid: false });

// ---------- 2. Extract frontend documents ----------
const docFiles = [
  'apps/web/src/components/auth/user-sync.tsx',
  'apps/web/src/graphql/onboarding.graphql.ts',
  'apps/web/src/graphql/operations-extended.ts',
  'apps/web/src/graphql/operations.ts',
  'apps/web/src/lib/graphql/mutations/waitlist.ts',
  'apps/web/src/lib/graphql/queries/waitlist.ts',
];

let total = 0;
let failed = 0;

for (const rel of docFiles) {
  const src = readFileSync(join(root, rel), 'utf8');
  const re = /(?:export const|const)\s+(\w+)\s*=\s*gql`([\s\S]*?)`/g;
  let m;
  while ((m = re.exec(src))) {
    const [, name, body] = m;
    total++;
    let doc;
    try {
      doc = parse(body);
    } catch (e) {
      failed++;
      console.log(`PARSE FAIL  ${name} (${rel}): ${e.message.split('\n')[0]}`);
      continue;
    }
    const errors = validate(schema, doc, specifiedRules);
    if (errors.length) {
      failed++;
      console.log(`INVALID     ${name} (${rel})`);
      for (const err of errors.slice(0, 6)) {
        console.log(`            - ${err.message}`);
      }
    }
  }
}

console.log(`\nDocuments checked: ${total}, invalid: ${failed}`);
if (failed) process.exit(1);
console.log('✔ All frontend GraphQL documents validate against the gateway schema.');
