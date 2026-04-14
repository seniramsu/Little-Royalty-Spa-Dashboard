/**
 * Unit tests for getNextActionPrompt().
 *
 * Run with: npx tsx src/lib/booking-window.test.ts
 *
 * Tests cover:
 * - 1st of month before 9am CST → "opens today" (high)
 * - 1st of month at exactly 9am CST → "open now" (high)
 * - 1st of month after 9am CST → "open now" (high)
 * - 5 days before the 1st → medium urgency
 * - 6 days before the 1st → low urgency
 * - DST spring-forward: 2026-03-01 (America/Chicago spring forward is March 8)
 * - DST fall-back: 2026-11-01 (America/Chicago fall back is Nov 1, 2026)
 */

import { getNextActionPrompt } from './booking-window'

interface TestCase {
  label: string
  // UTC ISO string — the function converts to CST internally
  nowUTC: string
  expectedUrgency: 'low' | 'medium' | 'high'
  expectedMessageContains: string
}

const cases: TestCase[] = [
  {
    label: '1st of month at 8am CDT (May 1, before window) → opens today',
    // May 1 is in CDT (UTC-5); 8am CDT = 13:00 UTC
    nowUTC: '2026-05-01T13:00:00Z',
    expectedUrgency: 'high',
    expectedMessageContains: 'opens today at 9am CST',
  },
  {
    label: '1st of month at 9am CDT exactly (window open) → open now',
    // 9am CDT = 14:00 UTC
    nowUTC: '2026-05-01T14:00:00Z',
    expectedUrgency: 'high',
    expectedMessageContains: 'open now',
  },
  {
    label: '1st of month at 10am CDT (window already open) → open now',
    nowUTC: '2026-05-01T15:00:00Z',
    expectedUrgency: 'high',
    expectedMessageContains: 'open now',
  },
  {
    label: '5 days before 1st → medium urgency',
    // April 26 CST; next 1st is May 1 = 5 days away
    nowUTC: '2026-04-26T15:00:00Z',
    expectedUrgency: 'medium',
    expectedMessageContains: '5 days',
  },
  {
    label: '1 day before 1st → medium urgency (singular)',
    nowUTC: '2026-04-30T15:00:00Z',
    expectedUrgency: 'medium',
    expectedMessageContains: '1 day',
  },
  {
    label: '6 days before 1st → low urgency',
    nowUTC: '2026-04-25T15:00:00Z',
    expectedUrgency: 'low',
    expectedMessageContains: 'Next booking window',
  },
  {
    label: 'DST spring-forward: March 1, 2026 at 8am CST (CST=UTC-6, before CDT starts March 8)',
    // March 1 at 8am CST = 14:00 UTC
    nowUTC: '2026-03-01T14:00:00Z',
    expectedUrgency: 'high',
    expectedMessageContains: 'opens today at 9am CST',
  },
  {
    label: 'DST fall-back: Nov 1, 2026 at 8am CST (fall-back is Nov 1) — before 9am CST',
    // Nov 1 2026 fall-back: clocks go from CDT (UTC-5) to CST (UTC-6) at 2am local
    // At 8am CST on Nov 1 = 14:00 UTC (post-fallback CST offset)
    nowUTC: '2026-11-01T14:00:00Z',
    expectedUrgency: 'high',
    expectedMessageContains: 'opens today at 9am CST',
  },
  {
    label: 'DST spring: March 8, 2026 (CDT starts) — after 9am CDT, mid-month',
    // March 8 at noon CDT = 17:00 UTC (CDT is UTC-5); not the 1st
    nowUTC: '2026-03-08T17:00:00Z',
    expectedUrgency: 'low',
    expectedMessageContains: 'Next booking window',
  },
]

let passed = 0
let failed = 0

for (const tc of cases) {
  const now = new Date(tc.nowUTC)
  const result = getNextActionPrompt(now)

  const urgencyOk = result.urgency === tc.expectedUrgency
  const messageOk = result.message.includes(tc.expectedMessageContains)

  if (urgencyOk && messageOk) {
    console.log(`  PASS: ${tc.label}`)
    console.log(`        → "${result.message}" [${result.urgency}]`)
    passed++
  } else {
    console.error(`  FAIL: ${tc.label}`)
    console.error(`        Got: "${result.message}" [${result.urgency}]`)
    if (!urgencyOk) console.error(`        Expected urgency: ${tc.expectedUrgency}`)
    if (!messageOk) console.error(`        Expected message to contain: "${tc.expectedMessageContains}"`)
    failed++
  }
}

console.log(`\n${passed} passed, ${failed} failed`)

if (failed > 0) {
  process.exit(1)
}
