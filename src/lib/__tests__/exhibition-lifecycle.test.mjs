/**
 * Deterministic lifecycle boundary tests — pure Node.js (no framework needed).
 *
 * Run:  node src/lib/__tests__/exhibition-lifecycle.test.mjs
 *
 * All instants use explicit +05:30 (IST = Asia/Kolkata) offsets.
 * Date comparisons in the functions use UTC epoch — correct since
 * Supabase TIMESTAMPTZ is stored as UTC.
 */

// ── Inline the exact production logic ───────────────────────────────────────

function evaluateExhibitionStatus(exhibition) {
  const now   = new Date();
  const start = exhibition.exhibition_start ? new Date(exhibition.exhibition_start) : null;
  const end   = exhibition.exhibition_end   ? new Date(exhibition.exhibition_end)   : null;

  if (exhibition.status === 'draft')    return 'draft';
  if (exhibition.status === 'archived') return 'archived';

  if (exhibition.status === 'upcoming') {
    if (start && now >= start) {
      if (end && now > end) return 'archived';
      return 'ongoing';
    }
    return 'upcoming';
  }

  if (exhibition.status === 'ongoing') {
    if (end && now > end) return 'archived';
    return 'ongoing';
  }

  if (end && now > end)      return 'archived';
  if (start && now >= start) return 'ongoing';
  return exhibition.status || 'upcoming';
}

function isRegistrationOpen(exhibition) {
  if (!exhibition) return false;
  if (exhibition.status === 'draft' || exhibition.status === 'archived') return false;

  const now   = new Date();
  const start = exhibition.registration_start ? new Date(exhibition.registration_start) : null;
  const end   = exhibition.submission_end     ? new Date(exhibition.submission_end)     : null;

  if (!start || !end) return false;
  return now >= start && now <= end;
}

// ── Minimal test harness ─────────────────────────────────────────────────────

let passed = 0, failed = 0;
const failures = [];

function withFakeNow(isoInstant, fn) {
  const RealDate = globalThis.Date;
  const fakeMs   = new RealDate(isoInstant).getTime();

  // Proxy the Date constructor: zero-arg returns fake now; otherwise normal.
  const FakeDate = new Proxy(RealDate, {
    construct(target, args) {
      return args.length === 0 ? new target(fakeMs) : new target(...args);
    },
    get(target, prop) {
      if (prop === 'now')   return () => fakeMs;
      if (prop === 'parse') return (...a) => target.parse(...a);
      if (prop === 'UTC')   return (...a) => target.UTC(...a);
      const val = target[prop];
      return typeof val === 'function' ? val.bind(target) : val;
    }
  });

  globalThis.Date = FakeDate;
  try   { fn(); }
  finally { globalThis.Date = RealDate; }
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅  ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ❌  ${name}`);
    console.error(`       ${e.message}`);
    failures.push(name);
    failed++;
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected)
    throw new Error(`${label}: expected "${expected}" but got "${actual}"`);
}

// ── Test fixtures ────────────────────────────────────────────────────────────
//   IST → UTC offsets (IST = UTC+05:30):
//   10:00:00+05:30 → 04:30:00Z
//   23:59:59+05:30 → 18:29:59Z
//   20:00:00+05:30 → 14:30:00Z

const REGISTRATION_START = '2026-09-19T10:00:00+05:30'; // UTC: 2026-09-19T04:30:00Z
const SUBMISSION_END     = '2026-10-19T23:59:59+05:30'; // UTC: 2026-10-19T18:29:59Z
const EXHIBITION_START   = '2026-10-09T10:00:00+05:30'; // UTC: 2026-10-09T04:30:00Z
const EXHIBITION_END     = '2026-10-11T20:00:00+05:30'; // UTC: 2026-10-11T14:30:00Z

const base = {
  id: 'test', theme_en: 'Test',
  registration_start: REGISTRATION_START,
  submission_end:     SUBMISSION_END,
  exhibition_start:   EXHIBITION_START,
  exhibition_end:     EXHIBITION_END,
};

// ── Section 1: Physical exhibition lifecycle ─────────────────────────────────

console.log('\n── evaluateExhibitionStatus: physical lifecycle boundaries ──\n');

test('draft → always "draft"', () => {
  withFakeNow('2026-10-10T00:00:00Z', () =>
    assertEqual(evaluateExhibitionStatus({ ...base, status: 'draft' }), 'draft', 'status'));
});

test('archived → always "archived"', () => {
  withFakeNow('2026-10-10T00:00:00Z', () =>
    assertEqual(evaluateExhibitionStatus({ ...base, status: 'archived' }), 'archived', 'status'));
});

test('1 second BEFORE exhibition_start (09:59:59+05:30) → "upcoming"', () => {
  // 2026-10-09T04:29:59Z = 09:59:59+05:30
  withFakeNow('2026-10-09T04:29:59Z', () =>
    assertEqual(evaluateExhibitionStatus({ ...base, status: 'upcoming' }), 'upcoming', 'status'));
});

test('EXACTLY AT exhibition_start (10:00:00+05:30) → "ongoing"', () => {
  // 2026-10-09T04:30:00Z = 10:00:00+05:30
  withFakeNow('2026-10-09T04:30:00Z', () =>
    assertEqual(evaluateExhibitionStatus({ ...base, status: 'upcoming' }), 'ongoing', 'status'));
});

test('1 second AFTER exhibition_start → "ongoing"', () => {
  withFakeNow('2026-10-09T04:30:01Z', () =>
    assertEqual(evaluateExhibitionStatus({ ...base, status: 'upcoming' }), 'ongoing', 'status'));
});

test('mid-exhibition (Oct 10 10:00 IST) → "ongoing"', () => {
  withFakeNow('2026-10-10T04:30:00Z', () =>
    assertEqual(evaluateExhibitionStatus({ ...base, status: 'ongoing' }), 'ongoing', 'status'));
});

test('1 second BEFORE exhibition_end (19:59:59+05:30) → "ongoing"', () => {
  // 2026-10-11T14:29:59Z = 19:59:59+05:30
  withFakeNow('2026-10-11T14:29:59Z', () =>
    assertEqual(evaluateExhibitionStatus({ ...base, status: 'ongoing' }), 'ongoing', 'status'));
});

test('1 second AFTER exhibition_end (20:00:01+05:30) → "archived"', () => {
  // 2026-10-11T14:30:01Z = 20:00:01+05:30
  withFakeNow('2026-10-11T14:30:01Z', () =>
    assertEqual(evaluateExhibitionStatus({ ...base, status: 'ongoing' }), 'archived', 'status'));
});

test('"upcoming" in DB that has completely passed both dates → "archived"', () => {
  withFakeNow('2026-10-12T00:00:00Z', () =>
    assertEqual(evaluateExhibitionStatus({ ...base, status: 'upcoming' }), 'archived', 'status'));
});

// ── Section 2: IST midnight boundary ────────────────────────────────────────

console.log('\n── evaluateExhibitionStatus: IST midnight boundary ──\n');

test('UTC midnight on exhibition day = 05:30 IST < 10:00 IST → "upcoming"', () => {
  // 2026-10-09T00:00:00Z = 05:30+05:30, before 10:00 IST start
  withFakeNow('2026-10-09T00:00:00Z', () =>
    assertEqual(evaluateExhibitionStatus({ ...base, status: 'upcoming' }), 'upcoming', 'status'));
});

test('IST midnight (00:00:00+05:30 = prev day 18:30:00Z) → ongoing (past start)', () => {
  // 2026-10-09T18:30:00Z = 2026-10-10T00:00:00+05:30 (IST midnight, within exhibition)
  withFakeNow('2026-10-09T18:30:00Z', () =>
    assertEqual(evaluateExhibitionStatus({ ...base, status: 'upcoming' }), 'ongoing', 'status'));
});

// ── Section 3: isRegistrationOpen — submission deadline ─────────────────────

console.log('\n── isRegistrationOpen: submission window boundaries ──\n');

test('before registration_start (09:59:59+05:30) → false', () => {
  withFakeNow('2026-09-19T04:29:59Z', () =>
    assertEqual(isRegistrationOpen({ ...base, status: 'upcoming' }), false, 'open'));
});

test('exactly at registration_start (10:00:00+05:30) → true', () => {
  withFakeNow('2026-09-19T04:30:00Z', () =>
    assertEqual(isRegistrationOpen({ ...base, status: 'upcoming' }), true, 'open'));
});

test('during exhibition (Oct 10, ongoing) → submissions still open', () => {
  withFakeNow('2026-10-10T04:30:00Z', () =>
    assertEqual(isRegistrationOpen({ ...base, status: 'ongoing' }), true, 'open'));
});

test('after exhibition end (Oct 12), before submission_end (Oct 19) → open', () => {
  // Exhibition is archived but check is on status='ongoing' to test date logic
  // (archived status already returns false — we test the date math with 'ongoing')
  withFakeNow('2026-10-12T05:30:00Z', () =>
    assertEqual(isRegistrationOpen({ ...base, status: 'ongoing' }), true, 'open'));
});

test('1 second before submission_end (23:59:58+05:30) → open', () => {
  // 2026-10-19T18:29:58Z = 23:59:58+05:30
  withFakeNow('2026-10-19T18:29:58Z', () =>
    assertEqual(isRegistrationOpen({ ...base, status: 'ongoing' }), true, 'open'));
});

test('exactly at submission_end (now <= end) → still open', () => {
  // 2026-10-19T18:29:59Z = 23:59:59+05:30 — the exact deadline second
  withFakeNow('2026-10-19T18:29:59Z', () =>
    assertEqual(isRegistrationOpen({ ...base, status: 'ongoing' }), true, 'open'));
});

test('1 second after submission_end (00:00:00+05:30 next day) → closed', () => {
  // 2026-10-19T18:30:00Z = 2026-10-20T00:00:00+05:30
  withFakeNow('2026-10-19T18:30:00Z', () =>
    assertEqual(isRegistrationOpen({ ...base, status: 'ongoing' }), false, 'open'));
});

test('draft status → always false', () => {
  withFakeNow('2026-10-10T05:30:00Z', () =>
    assertEqual(isRegistrationOpen({ ...base, status: 'draft' }), false, 'open'));
});

test('archived status → always false', () => {
  withFakeNow('2026-10-10T05:30:00Z', () =>
    assertEqual(isRegistrationOpen({ ...base, status: 'archived' }), false, 'open'));
});

test('missing registration_start → false', () => {
  withFakeNow('2026-10-10T05:30:00Z', () =>
    assertEqual(isRegistrationOpen({ ...base, status: 'upcoming', registration_start: null }), false, 'open'));
});

test('missing submission_end → false', () => {
  withFakeNow('2026-10-10T05:30:00Z', () =>
    assertEqual(isRegistrationOpen({ ...base, status: 'upcoming', submission_end: null }), false, 'open'));
});

// ── Section 4: Multiple exhibitions — independent lifecycle ──────────────────

console.log('\n── Multiple exhibitions: independent lifecycle calculation ──\n');

const exA = {
  id: 'a', theme_en: 'A', status: 'upcoming',
  registration_start: '2026-10-01T00:00:00+05:30',
  submission_end:     '2026-10-15T23:59:59+05:30',
  exhibition_start:   '2026-10-01T00:00:00+05:30',
  exhibition_end:     '2026-10-05T20:00:00+05:30',
};
const exB = {
  id: 'b', theme_en: 'B', status: 'upcoming',
  registration_start: '2026-11-01T00:00:00+05:30',
  submission_end:     '2026-11-15T23:59:59+05:30',
  exhibition_start:   '2026-11-01T00:00:00+05:30',
  exhibition_end:     '2026-11-10T20:00:00+05:30',
};

test('Oct 20: exA=archived, exB=upcoming (calculated independently)', () => {
  withFakeNow('2026-10-20T00:00:00Z', () => {
    assertEqual(evaluateExhibitionStatus(exA), 'archived', 'exA');
    assertEqual(evaluateExhibitionStatus(exB), 'upcoming', 'exB');
  });
});

test('Nov 5: exA=archived, exB=ongoing (simultaneously)', () => {
  withFakeNow('2026-11-05T00:00:00Z', () => {
    assertEqual(evaluateExhibitionStatus(exA), 'archived', 'exA');
    assertEqual(evaluateExhibitionStatus(exB), 'ongoing',  'exB');
  });
});

test('Nov 20: both archived', () => {
  withFakeNow('2026-11-20T00:00:00Z', () => {
    assertEqual(evaluateExhibitionStatus(exA), 'archived', 'exA');
    assertEqual(evaluateExhibitionStatus(exB), 'archived', 'exB');
  });
});

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(55)}`);
console.log(`  Passed: ${passed}   Failed: ${failed}   Total: ${passed + failed}`);
if (failures.length) {
  console.log('\n  Failed tests:');
  failures.forEach(f => console.log(`    • ${f}`));
  console.log('');
  process.exit(1);
} else {
  console.log('  All tests passed ✅\n');
}
