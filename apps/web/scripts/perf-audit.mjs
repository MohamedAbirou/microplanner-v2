/**
 * One-off production perf audit — login + measure GraphQL on navigation.
 * Run from apps/web: node scripts/perf-audit.mjs
 */
import { chromium } from 'playwright';

const BASE = 'https://microplanner-web.vercel.app';
const USERNAME = 'weebacc';
const PASSWORD = 'I@M_@-G3N1u$12';

const ROUTES = [
  { name: 'dashboard', path: '/dashboard', waitMs: 4000 },
  { name: 'today', path: '/today', waitMs: 4000 },
  { name: 'tasks', path: '/tasks', waitMs: 4000 },
  { name: 'goals', path: '/goals', waitMs: 3500 },
  { name: 'plans', path: '/plans', waitMs: 3500 },
  { name: 'analytics', path: '/analytics', waitMs: 5000 },
  { name: 'settings', path: '/settings', waitMs: 3500 },
];

function isGraphQL(url) {
  return /graphql/i.test(url);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allGraphQL = [];

  page.on('request', (req) => {
    if (isGraphQL(req.url())) {
      allGraphQL.push({
        url: req.url(),
        method: req.method(),
        op: null,
        route: 'pending',
        t: Date.now(),
        durationMs: null,
      });
    }
  });

  page.on('response', async (res) => {
    const url = res.url();
    if (!isGraphQL(url)) return;
    const pending = allGraphQL.filter((e) => e.url === url && e.durationMs == null);
    const entry = pending[pending.length - 1];
    if (!entry) return;
    entry.status = res.status();
    entry.durationMs = Date.now() - entry.t;
    try {
      const post = res.request().postDataJSON?.();
      entry.op = post?.operationName || '(anonymous)';
    } catch {
      entry.op = '(parse-error)';
    }
  });

  console.log('=== MicroPlanner Production Perf Audit ===\n');

  const signInStart = Date.now();
  await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log(`Sign-in page loaded in ${Date.now() - signInStart}ms`);

  const identifier = page.locator(
    'input[name="identifier"], input[name="username"], input#identifier-field, .cl-formFieldInput__identifier'
  ).first();
  await identifier.waitFor({ state: 'visible', timeout: 30000 });
  await identifier.fill(USERNAME);

  const continueBtn = page.locator(
    '.cl-formButtonPrimary:visible, button.cl-formButtonPrimary:visible, [data-localization-key="formButtonPrimary"]:visible'
  ).first();
  await continueBtn.waitFor({ state: 'visible', timeout: 15000 });
  await continueBtn.click();

  const password = page.locator(
    'input[name="password"], input#password-field, input[type="password"], .cl-formFieldInput__password'
  ).first();
  await password.waitFor({ state: 'visible', timeout: 30000 });
  await password.fill(PASSWORD);

  const signInBtn = page.locator(
    '.cl-formButtonPrimary:visible, button.cl-formButtonPrimary:visible, [data-localization-key="formButtonPrimary"]:visible'
  ).first();
  await signInBtn.waitFor({ state: 'visible', timeout: 15000 });
  await signInBtn.click();

  await page.waitForURL(/\/(dashboard|onboarding|today)/, { timeout: 90000 });
  const landed = page.url();
  console.log(`Authenticated → ${landed} (${Date.now() - signInStart}ms total login)\n`);

  // Let initial shell queries settle
  await page.waitForTimeout(3000);
  const postLoginGql = allGraphQL.length;
  console.log(`GraphQL during login + shell: ${postLoginGql}\n`);

  const routeReports = [];

  for (const route of ROUTES) {
    const gqlBefore = allGraphQL.length;
    const navStart = Date.now();

    await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(route.waitMs);

    const navMs = Date.now() - navStart;
    const newGql = allGraphQL.slice(gqlBefore);

    for (const e of newGql) e.route = route.name;

    const ops = {};
    for (const e of newGql) {
      const key = e.op || 'unknown';
      ops[key] = (ops[key] || 0) + 1;
    }

    const loaderVisible = await page
      .locator('.mp-page-loader, [role="status"][aria-busy="true"]')
      .first()
      .isVisible()
      .catch(() => false);

    const bodyText = await page.locator('body').innerText().catch(() => '');
    const hasPlainLoading = /Loading (goals|tasks|plans|today)/i.test(bodyText);

    routeReports.push({ route: route.name, navMs, graphqlCount: newGql.length, ops, loaderStillVisible: loaderVisible, plainLoadingText: hasPlainLoading });

    console.log(`--- ${route.name} (${route.path}) ---`);
    console.log(`  Navigation + wait: ${navMs}ms`);
    console.log(`  GraphQL requests: ${newGql.length}`);
    console.log(`  Operations: ${JSON.stringify(ops)}`);
    const durations = newGql.filter((e) => e.durationMs).sort((a, b) => b.durationMs - a.durationMs);
    for (const d of durations.slice(0, 8)) {
      console.log(`    ${d.op}: ${d.durationMs}ms (HTTP ${d.status})`);
    }
    console.log(`  Loader still visible: ${loaderVisible}`);
    console.log(`  Plain "Loading …" text: ${hasPlainLoading}`);
    console.log('');
  }

  const warmBefore = allGraphQL.length;
  const warmStart = Date.now();
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  const warmGql = allGraphQL.slice(warmBefore);
  console.log('--- dashboard (warm cache revisit) ---');
  console.log(`  Time: ${Date.now() - warmStart}ms`);
  console.log(`  GraphQL requests: ${warmGql.length}`);
  const warmOps = {};
  for (const e of warmGql) warmOps[e.op || 'unknown'] = (warmOps[e.op || 'unknown'] || 0) + 1;
  console.log(`  Operations: ${JSON.stringify(warmOps)}\n`);

  console.log('=== SUMMARY ===');
  console.log(`Total GraphQL requests: ${allGraphQL.length}`);
  const slowest = [...allGraphQL].filter((e) => e.durationMs).sort((a, b) => b.durationMs - a.durationMs).slice(0, 10);
  console.log('Slowest GraphQL calls:');
  for (const s of slowest) console.log(`  ${s.op} @ ${s.route}: ${s.durationMs}ms`);

  const problems = [];
  for (const r of routeReports) {
    if (r.graphqlCount > 12) problems.push(`${r.route}: ${r.graphqlCount} graphql reqs`);
    if (r.loaderStillVisible) problems.push(`${r.route}: loader still visible`);
    if (r.plainLoadingText) problems.push(`${r.route}: old plain loading text`);
  }
  if (warmGql.length > 8) problems.push(`warm dashboard: ${warmGql.length} graphql reqs`);

  if (problems.length) {
    console.log('\nIssues:');
    for (const p of problems) console.log(`  - ${p}`);
  } else {
    console.log('\nNo major perf red flags in this pass.');
  }

  // Client-side navigation (sidebar) — warm SPA routing
  console.log('=== CLIENT-SIDE NAV (sidebar clicks) ===\n');
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);

  const navLinks = [
    { name: 'today', selector: 'a[href="/today"]' },
    { name: 'tasks', selector: 'a[href="/tasks"]' },
    { name: 'goals', selector: 'a[href="/goals"]' },
    { name: 'plans', selector: 'a[href="/plans"]' },
  ];

  for (const link of navLinks) {
    const gqlBefore = allGraphQL.length;
    const navStart = Date.now();
    const el = page.locator(link.selector).first();
    if (!(await el.isVisible().catch(() => false))) {
      console.log(`--- ${link.name} (sidebar) --- skipped (link not found)\n`);
      continue;
    }
    await el.click();
    await page.waitForURL(new RegExp(`${link.name}|week`), { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3500);

    const newGql = allGraphQL.slice(gqlBefore);
    for (const e of newGql) e.route = `${link.name}-spa`;
    const ops = {};
    for (const e of newGql) ops[e.op || 'unknown'] = (ops[e.op || 'unknown'] || 0) + 1;

    const loaderVisible = await page.locator('.mp-page-loader, [role="status"][aria-busy="true"]').first().isVisible().catch(() => false);

    console.log(`--- ${link.name} (sidebar click) ---`);
    console.log(`  Time: ${Date.now() - navStart}ms`);
    console.log(`  GraphQL requests: ${newGql.length}`);
    console.log(`  Operations: ${JSON.stringify(ops)}`);
    console.log(`  Loader visible: ${loaderVisible}\n`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
