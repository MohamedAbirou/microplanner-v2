#!/usr/bin/env node
/**
 * Bootstrap the Stripe products + monthly prices MicroPlanner needs.
 *
 * Idempotent: products are looked up by metadata.microplannerTier before
 * creating; prices are reused when an active monthly price with the right
 * amount already exists.
 *
 * Usage: node scripts/setup-stripe-products.mjs
 * Reads STRIPE_SECRET_KEY from apps/api-gateway/.env.local and appends the
 * STRIPE_*_PRICE_ID vars there if missing.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, 'apps/api-gateway/.env.local');
const require = createRequire(join(root, 'apps/api-gateway/package.json'));
const Stripe = require('stripe');

function readEnvVar(content, name) {
  const match = content.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim().replace(/^"|"$/g, '') : null;
}

const envContent = readFileSync(envPath, 'utf8');
const secretKey = readEnvVar(envContent, 'STRIPE_SECRET_KEY');
if (!secretKey || !secretKey.startsWith('sk_')) {
  console.error('STRIPE_SECRET_KEY missing or invalid in apps/api-gateway/.env.local');
  process.exit(1);
}
if (!secretKey.startsWith('sk_test_')) {
  console.error('Refusing to run against a LIVE key — this script is for test mode.');
  process.exit(1);
}

const stripe = new Stripe(secretKey, { apiVersion: '2025-10-29.clover' });

// Must match PRICING_PLANS in apps/api-gateway/src/modules/billing/billing.constants.ts
const PLANS = [
  { tier: 'STARTER', name: 'MicroPlanner Starter', amount: 700, envVar: 'STRIPE_STARTER_PRICE_ID' },
  { tier: 'PRO', name: 'MicroPlanner Pro', amount: 1500, envVar: 'STRIPE_PRO_PRICE_ID' },
  { tier: 'PREMIUM', name: 'MicroPlanner Premium', amount: 2900, envVar: 'STRIPE_PREMIUM_PRICE_ID' },
];

async function ensureProduct(plan) {
  const existing = await stripe.products.search({
    query: `metadata['microplannerTier']:'${plan.tier}' AND active:'true'`,
  });
  if (existing.data.length > 0) {
    console.log(`product exists: ${plan.tier} -> ${existing.data[0].id}`);
    return existing.data[0];
  }
  const product = await stripe.products.create({
    name: plan.name,
    metadata: { microplannerTier: plan.tier },
  });
  console.log(`product created: ${plan.tier} -> ${product.id}`);
  return product;
}

async function ensureMonthlyPrice(product, plan) {
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 20 });
  const match = prices.data.find(
    (p) =>
      p.currency === 'usd' &&
      p.recurring?.interval === 'month' &&
      p.unit_amount === plan.amount
  );
  if (match) {
    console.log(`price exists: ${plan.tier} -> ${match.id} ($${plan.amount / 100}/mo)`);
    return match;
  }
  const price = await stripe.prices.create({
    product: product.id,
    currency: 'usd',
    unit_amount: plan.amount,
    recurring: { interval: 'month' },
    metadata: { microplannerTier: plan.tier },
  });
  console.log(`price created: ${plan.tier} -> ${price.id} ($${plan.amount / 100}/mo)`);
  return price;
}

const resolved = {};
for (const plan of PLANS) {
  const product = await ensureProduct(plan);
  const price = await ensureMonthlyPrice(product, plan);
  resolved[plan.envVar] = price.id;
}

// Append/update the env vars in .env.local
let updated = envContent;
for (const [name, value] of Object.entries(resolved)) {
  if (readEnvVar(updated, name)) {
    updated = updated.replace(new RegExp(`^${name}=.*$`, 'm'), `${name}=${value}`);
  } else {
    updated += `\n${name}=${value}`;
  }
}
if (updated !== envContent) {
  writeFileSync(envPath, updated.endsWith('\n') ? updated : updated + '\n');
  console.log('\n.env.local updated with price IDs:');
} else {
  console.log('\n.env.local already up to date:');
}
for (const [name, value] of Object.entries(resolved)) {
  console.log(`  ${name}=${value}`);
}
