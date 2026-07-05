#!/usr/bin/env node
/**
 * Contract audit: every REST call made by apps/graphql-gateway datasources
 * must match a route exposed by apps/api-gateway (NestJS, global prefix /api,
 * URI versioning default v1).
 *
 * Usage: node scripts/audit-contracts.mjs
 * Exits non-zero if any datasource call has no matching Nest route.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------- 1. Collect Nest routes ----------
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.controller.ts')) out.push(p);
  }
  return out;
}

const controllerFiles = walk(join(root, 'apps/api-gateway/src'));
const nestRoutes = []; // { method, path }

for (const file of controllerFiles) {
  const src = readFileSync(file, 'utf8');
  const ctrlMatch = src.match(/@Controller\(\s*(?:['"`]([^'"`]*)['"`])?\s*\)/);
  if (!ctrlMatch) continue;
  const base = ctrlMatch[1] || '';
  const re = /@(Get|Post|Put|Patch|Delete)\(\s*(?:['"`]([^'"`]*)['"`])?\s*\)/g;
  let m;
  while ((m = re.exec(src))) {
    const method = m[1].toUpperCase();
    const sub = m[2] || '';
    const full = ('/' + [base, sub].filter(Boolean).join('/')).replace(/\/+/g, '/');
    nestRoutes.push({ method, path: normalize('/api/v1' + full), file });
  }
}

// ---------- 2. Collect datasource calls ----------
const dsDir = join(root, 'apps/graphql-gateway/src/datasources');
const calls = []; // { method, path, file, line }

for (const name of readdirSync(dsDir)) {
  if (!name.endsWith('.ts')) continue;
  const file = join(dsDir, name);
  const src = readFileSync(file, 'utf8');

  // Split into classes so each call is resolved against its class's baseURL
  const classRe = /export class (\w+)[\s\S]*?(?=export class |$)/g;
  let cm;
  while ((cm = classRe.exec(src))) {
    const block = cm[0];
    const baseMatch = block.match(/baseURL:\s*`\$\{[A-Z_]+\}([^`]*)`/) ||
                      block.match(/baseURL:\s*['"`]([^'"`]*)['"`]/);
    // onboarding-api.ts talks GraphQL, not REST — skip classes without an /api base
    const base = baseMatch ? baseMatch[1] : null;
    if (!base || !base.startsWith('/api')) continue;

    const callRe = /this\.client\.(get|post|put|patch|delete)\(\s*(`[^`]*`|'[^']*'|"[^"]*")/g;
    let km;
    while ((km = callRe.exec(block))) {
      const method = km[1].toUpperCase();
      let p = km[2].slice(1, -1); // strip quotes/backticks
      p = p.replace(/\$\{[^}]+\}/g, ':param');
      const full = (base + '/' + p).replace(/\/+/g, '/').replace(/\/$/, '') || base;
      const line = src.slice(0, km.index + cm.index).split('\n').length;
      calls.push({ method, path: normalize(full), file: name, line, cls: cm[1] });
    }
  }
}

function normalize(p) {
  return (
    p
      .replace(/\/+/g, '/')
      .replace(/\/$/, '')
      .split('/')
      .map((seg) => (seg.startsWith(':') ? ':p' : seg))
      .join('/') || '/'
  );
}

// ---------- 3. Match ----------
function routeMatches(call, route) {
  if (call.method !== route.method) return false;
  const a = call.path.split('/');
  const b = route.path.split('/');
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === ':p' || b[i] === ':p') continue;
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const misses = calls.filter((c) => !nestRoutes.some((r) => routeMatches(c, r)));

console.log(`Nest routes: ${nestRoutes.length}`);
console.log(`Datasource REST calls: ${calls.length}`);
console.log(`Unmatched calls: ${misses.length}\n`);

for (const miss of misses) {
  console.log(
    `MISS  ${miss.method.padEnd(6)} ${miss.path}  (${miss.file}:${miss.line} in ${miss.cls})`
  );
}

if (misses.length) process.exit(1);
console.log('✔ All datasource calls have matching api-gateway routes.');
