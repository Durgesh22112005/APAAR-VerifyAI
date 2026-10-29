/**
 * APAAR VerifyAI — Master Seed Data Orchestrator
 * Deterministically constructs interconnected datasets.
 */

import {
  createRng,
  generateInstitutions,
  generateBatches,
  generateStudents,
  generateIdentityMatches,
  generateCases,
  generateCredentialRequests,
  generateSubmissionEvents,
  generateAuditEvents
} from './generators.js';

export function buildSyntheticDataset(seed = 20260315) {
  const rng = createRng(seed);

  // 1. Generate 25 Institutions
  const institutions = generateInstitutions(rng, 25);

  // 2. Generate 40 Validation Batches
  const batches = generateBatches(rng, institutions, 40);

  // 3. Generate 500 Students (referencing institutions & batches)
  const students = generateStudents(rng, institutions, batches, 500);

  // 4. Generate 120 Identity Matches (referencing students & institutions)
  const matches = generateIdentityMatches(rng, students, institutions, 120);

  // 5. Generate 100 Regulatory Cases (referencing students, institutions, batches, matches)
  const cases = generateCases(rng, students, institutions, batches, matches, 100);

  // 6. Generate 80 Credential Requests (referencing students)
  const credentialRequests = generateCredentialRequests(rng, students, 80);

  // 7. Generate 150 Submission Events (referencing institutions & batches)
  const submissionEvents = generateSubmissionEvents(rng, institutions, batches, 150);

  // 8. Generate 200 Audit Events (referencing students, cases, batches)
  const auditEvents = generateAuditEvents(rng, students, cases, batches, 200);

  return {
    institutions,
    batches,
    students,
    matches,
    cases,
    credentialRequests,
    submissionEvents,
    auditEvents,
    metadata: {
      generatedAt: '2026-10-30T00:00:00.000Z',
      seed,
      version: '2.0.0-synthetic',
      counts: {
        students: students.length,
        institutions: institutions.length,
        cases: cases.length,
        auditEvents: auditEvents.length,
        batches: batches.length,
        matches: matches.length,
        credentialRequests: credentialRequests.length,
        submissionEvents: submissionEvents.length
      }
    }
  };
}

// Master singleton seed dataset
export const masterSeedData = buildSyntheticDataset(20260315);
