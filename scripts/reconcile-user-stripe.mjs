#!/usr/bin/env node
/** One-off: sync a user's tier from Stripe subscriptions into Postgres. */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, 'apps/api-gateway/.env.local');
const prismaRequire = createRequire(join(root, 'packages/database/package.json'));
const stripeRequire = createRequire(join(root, 'apps/api-gateway/package.json'));
const Stripe = stripeRequire('stripe');
const { PrismaClient } = prismaRequire('@prisma/client');

function readEnvVar(content, name) {
  const match = content.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim().replace(/^"|"$/g, '') : null;
}

const envContent = readFileSync(envPath, 'utf8');
const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/reconcile-user-stripe.mjs user@email.com');
  process.exit(1);
}

const stripeKey = readEnvVar(envContent, 'STRIPE_SECRET_KEY');
const dbUrl = readEnvVar(envContent, 'DATABASE_URL');
const stripe = new Stripe(stripeKey, { apiVersion: '2025-10-29.clover' });
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

const PRICE_TO_TIER = {
  [readEnvVar(envContent, 'STRIPE_STARTER_PRICE_ID')]: 'STARTER',
  [readEnvVar(envContent, 'STRIPE_PRO_PRICE_ID')]: 'PRO',
  [readEnvVar(envContent, 'STRIPE_PREMIUM_PRICE_ID')]: 'PREMIUM',
};

const user = await prisma.user.findUnique({ where: { email } });
if (!user?.stripeCustomerId) {
  console.error('User not found or no stripeCustomerId');
  process.exit(1);
}

const subs = await stripe.subscriptions.list({
  customer: user.stripeCustomerId,
  status: 'all',
  limit: 10,
});

const active = subs.data
  .filter((s) => ['active', 'trialing', 'past_due'].includes(s.status))
  .sort((a, b) => b.created - a.created)[0];

if (!active) {
  console.log('No active subscription in Stripe — user stays FREE');
  await prisma.$disconnect();
  process.exit(0);
}

const priceId = active.items.data[0]?.price?.id;
const tier = PRICE_TO_TIER[priceId] || active.metadata?.tier || 'STARTER';

await prisma.user.update({
  where: { id: user.id },
  data: {
    tier,
    subscriptionStatus: active.status === 'past_due' ? 'PAST_DUE' : 'ACTIVE',
    subscriptionId: active.id,
  },
});

console.log(`Synced ${email} -> ${tier} (${active.id})`);

const dupes = subs.data.filter(
  (s) => s.status === 'active' && s.id !== active.id
);
for (const d of dupes) {
  await stripe.subscriptions.cancel(d.id);
  console.log(`Cancelled duplicate subscription ${d.id}`);
}

await prisma.$disconnect();
