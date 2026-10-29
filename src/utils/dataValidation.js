/**
 * APAAR VerifyAI — Synthetic Data Quality & Relational Integrity Validator
 * Runs verification checks across all generated datasets.
 */

export function validateDataset(dataset) {
  const errors = [];
  const warnings = [];

  const {
    institutions = [],
    batches = [],
    students = [],
    matches = [],
    cases = [],
    credentialRequests = [],
    submissionEvents = [],
    auditEvents = []
  } = dataset;

  // 1. Check duplicate IDs within each collection
  function checkDuplicateIds(items, name) {
    const seen = new Set();
    items.forEach((item, idx) => {
      const id = item.id || item.code;
      if (!id) {
        errors.push(`${name}[${idx}] is missing an id`);
      } else if (seen.has(id)) {
        errors.push(`Duplicate ID "${id}" in ${name}`);
      } else {
        seen.add(id);
      }
    });
    return seen;
  }

  const instIds = checkDuplicateIds(institutions, 'institutions');
  const batchIds = checkDuplicateIds(batches, 'batches');
  const studentIds = checkDuplicateIds(students, 'students');
  checkDuplicateIds(matches, 'matches');
  checkDuplicateIds(cases, 'cases');
  checkDuplicateIds(credentialRequests, 'credentialRequests');
  checkDuplicateIds(auditEvents, 'auditEvents');

  // 2. Validate Foreign Keys & Arithmetic Consistency

  // Batches: must point to valid institution, rows === passed + flagged
  batches.forEach((b) => {
    if (b.institution_code && !instIds.has(b.institution_code)) {
      errors.push(`Batch ${b.id} references non-existent institution ${b.institution_code}`);
    }
    if (b.rows < 0 || b.passed < 0 || b.flagged < 0) {
      errors.push(`Batch ${b.id} has negative record counts`);
    }
    if (b.rows !== b.passed + b.flagged) {
      errors.push(`Batch ${b.id} count arithmetic mismatch: ${b.rows} != ${b.passed} + ${b.flagged}`);
    }
  });

  // Students: must reference valid institution
  students.forEach((s) => {
    if (s.institution_code && !instIds.has(s.institution_code)) {
      errors.push(`Student ${s.id} references non-existent institution ${s.institution_code}`);
    }
    if (s.batch_id && !batchIds.has(s.batch_id)) {
      warnings.push(`Student ${s.id} references unknown batch ${s.batch_id}`);
    }
    if (s.score < 0 || s.score > 100) {
      errors.push(`Student ${s.id} has invalid score ${s.score}`);
    }
  });

  // Cases: must reference valid student or institution or batch
  cases.forEach((c) => {
    if (c.student_id && !studentIds.has(c.student_id)) {
      warnings.push(`Case ${c.id} references unknown student ${c.student_id}`);
    }
    if (c.institution_code && !instIds.has(c.institution_code)) {
      warnings.push(`Case ${c.id} references unknown institution ${c.institution_code}`);
    }
  });

  // Credential requests: must reference valid student
  credentialRequests.forEach((r) => {
    if (r.student_id && !studentIds.has(r.student_id)) {
      warnings.push(`Credential request ${r.id} references unknown student ${r.student_id}`);
    }
  });

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
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
  };
}
