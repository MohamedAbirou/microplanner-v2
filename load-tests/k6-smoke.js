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

export const options = {
  scenarios: {
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
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.02'],
  },
};

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

  sleep(1);
}
