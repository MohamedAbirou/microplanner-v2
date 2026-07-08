/**
 * k6 smoke + load test for MicroPlanner.
 *
 * Exercises the API gateway health endpoint and the GraphQL gateway with a
 * ramping virtual-user profile, asserting latency/error thresholds so a
 * regression in the hot path (or a broken deploy) fails CI.
 *
 * Usage:
 *   k6 run load-tests/k6-smoke.js
 *   API_URL=https://api.microplanner.app GRAPHQL_URL=https://gql.microplanner.app/graphql \
 *     k6 run load-tests/k6-smoke.js
 *
 * Optional auth for authenticated queries:
 *   AUTH_TOKEN=<clerk jwt> k6 run load-tests/k6-smoke.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

const API_URL = __ENV.API_URL || 'http://localhost:3000';
const GRAPHQL_URL = __ENV.GRAPHQL_URL || 'http://localhost:4000/graphql';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

const errorRate = new Rate('errors');

// Opt into the heavy 500-VU stress run with STRESS=true; default is a light
// smoke suitable for CI on every push.
const STRESS = __ENV.STRESS === 'true';

export const options = {
  scenarios: STRESS
    ? {
        stress_500: {
          executor: 'ramping-vus',
          startVUs: 0,
          stages: [
            { duration: '1m', target: 100 },
            { duration: '2m', target: 500 }, // 500 concurrent
            { duration: '2m', target: 500 }, // hold
            { duration: '1m', target: 0 },
          ],
          gracefulRampDown: '20s',
        },
      }
    : {
        smoke: {
          executor: 'ramping-vus',
          startVUs: 0,
          stages: [
            { duration: '30s', target: 20 }, // ramp up
            { duration: '1m', target: 20 }, // steady load
            { duration: '1m', target: 50 }, // push
            { duration: '30s', target: 0 }, // ramp down
          ],
          gracefulRampDown: '10s',
        },
      },
  thresholds: {
    // p95 < 500ms for the calendar-week hot path is the production target.
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.02'],
  },
};

function isoWeek() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start: start.toISOString(), end: end.toISOString() };
}

const headers = {
  'Content-Type': 'application/json',
  ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {}),
};

export default function () {
  group('api health', () => {
    const res = http.get(`${API_URL}/api/v1/health`);
    const ok = check(res, {
      'health status is 200': (r) => r.status === 200,
    });
    errorRate.add(!ok);
  });

  group('graphql introspection ping', () => {
    // A trivial, unauthenticated query keeps this runnable without a token
    // while still exercising the GraphQL server + schema execution path.
    const query = JSON.stringify({ query: '{ __typename }' });
    const res = http.post(GRAPHQL_URL, query, { headers });
    const ok = check(res, {
      'graphql status is 200': (r) => r.status === 200,
      'graphql has no errors': (r) => {
        try {
          return !JSON.parse(r.body).errors;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!ok);
  });

  // Authenticated hot paths — only run when a token is supplied.
  if (AUTH_TOKEN) {
    const week = isoWeek();

    group('calendar week (busy slots)', () => {
      const query = JSON.stringify({
        query: `query($start: DateTime!, $end: DateTime!) { busySlots(startDate: $start, endDate: $end) { start end title } }`,
        variables: { start: week.start, end: week.end },
      });
      const res = http.post(GRAPHQL_URL, query, { headers });
      errorRate.add(!check(res, { 'calendar week 200': (r) => r.status === 200 }));
    });

    group('tasks for week (bounded)', () => {
      const query = JSON.stringify({
        query: `query($start: DateTime!, $end: DateTime!) { tasks(filter: { dateRange: { start: $start, end: $end } }, pagination: { take: 80 }) { id title } }`,
        variables: { start: week.start, end: week.end },
      });
      const res = http.post(GRAPHQL_URL, query, { headers });
      errorRate.add(!check(res, { 'tasks week 200': (r) => r.status === 200 }));
    });

    group('plans list', () => {
      const query = JSON.stringify({ query: `{ plans { id status } }` });
      const res = http.post(GRAPHQL_URL, query, { headers });
      errorRate.add(!check(res, { 'plans 200': (r) => r.status === 200 }));
    });
  }

  sleep(1);
}
