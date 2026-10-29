/**
 * APAAR VerifyAI — Deterministic Synthetic Data Engine
 * Generates interconnected datasets with valid relational integrity.
 */

import {
  VERIFICATION_STATUSES,
  CASE_SEVERITY,
  CASE_STATUSES,
  CASE_TYPES,
  BATCH_STATUSES,
  INSTITUTION_STATUSES,
  STUDENT_CATEGORIES,
  ACADEMIC_YEARS,
  PROGRAMS,
  INDIAN_STATES_CITIES,
  AUDIT_EVENT_TYPES
} from './constants.js';

// Deterministic Pseudo-Random Number Generator (Mulberry32)
export function createRng(seed = 20260315) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Advait', 'Ananya', 'Arjun', 'Arun', 'Aryan', 'Ayesha',
  'Bhavna', 'Chetan', 'Daniel', 'Deepak', 'Divya', 'Gaurav', 'Harish', 'Ishaan',
  'Jaya', 'Karthik', 'Kavya', 'Madhav', 'Meera', 'Mohammad', 'Nandini', 'Naveen',
  'Neha', 'Nikhil', 'Nisha', 'Pranav', 'Pooja', 'Priya', 'Rahul', 'Rakesh',
  'Rani', 'Rhea', 'Rohan', 'Rohit', 'Sahil', 'Sameer', 'Sanjay', 'Shreya',
  'Siddharth', 'Sneha', 'Sunil', 'Swati', 'Tanvi', 'Tarun', 'Varun', 'Vikas',
  'Vikram', 'Zoya', 'Abhishek', 'Akshaya', 'Bhuvan', 'Charan', 'Devika', 'Farhan',
  'Gayatri', 'Hema', 'Irfan', 'Jatin', 'Keerthi', 'Lakshmi', 'Manish', 'Nitin'
];

const LAST_NAMES = [
  'Kumar', 'Sharma', 'Patel', 'Nair', 'Iyer', 'Krishnan', 'Singh', 'Reddy',
  'Verma', 'Rao', 'Joseph', 'Menon', 'Gupta', 'Khan', 'Chatterjee', 'Bose',
  'Deshmukh', 'Joshi', 'Kulkarni', 'Naidu', 'Chauhan', 'Mehta', 'Bhat', 'Pillai',
  'Sengupta', 'Mishra', 'Agarwal', 'Choudhury', 'Pandey', 'Mukherjee', 'Das',
  'Venkatesh', 'Subramanian', 'Narayanan', 'Mahajan', 'Kapoor', 'Malhotra', 'Bose'
];

const INSTITUTION_NAMES = [
  'Sri Krishna College of Technology',
  'North Valley Institute of Technology',
  'Eastern Technical College',
  'Western Institute of Technology',
  'Central School of Engineering',
  'Vellore Academy of Higher Education',
  'Deccan Institute of Engineering & Research',
  'Sahyadri Technological University',
  'Malabar Institute of Engineering Sciences',
  'Kalinga National Institute of Technology',
  'Aravalli Institute of Advanced Studies',
  'National Capital College of Engineering',
  'Godavari Engineering College',
  'Konkan Institute of Technology',
  'Punjab Technological Campus',
  'Nilgiri College of Applied Sciences',
  'Chola Institute of Engineering',
  'Pataliputra Institute of Technology',
  'Marwar Institute of Technology & Research',
  'Coromandel Technological Academy',
  'Baroda Institute of Engineering',
  'Brahmaputra Engineering College',
  'Vidarbha Institute of Technology',
  'Bundelkhand Institute of Sciences',
  'Coorg Technological Institute'
];

/**
 * Generate 25 Realistic Institution Records
 */
export function generateInstitutions(rng, count = 25) {
  const institutions = [];
  for (let i = 0; i < count; i++) {
    const code = `INST-${String(i + 1).padStart(3, '0')}`;
    const name = INSTITUTION_NAMES[i % INSTITUTION_NAMES.length];
    const geo = INDIAN_STATES_CITIES[i % INDIAN_STATES_CITIES.length];
    const city = geo.cities[Math.floor(rng() * geo.cities.length)];
    const state = geo.state;
    const enrolled = 1200 + Math.floor(rng() * 2600);
    const programsCount = 8 + Math.floor(rng() * 15);
    const quality = parseFloat((82 + rng() * 17.5).toFixed(1));
    const coverage = parseFloat((88 + rng() * 11.8).toFixed(1));

    let status = INSTITUTION_STATUSES.HEALTHY;
    if (quality < 88) status = INSTITUTION_STATUSES.REVIEW_REQUIRED;
    else if (quality < 93) status = INSTITUTION_STATUSES.ACTION_NEEDED;

    const daysAgo = Math.floor(rng() * 5);
    const when = daysAgo === 0 ? 'Today, 10:42 AM' : daysAgo === 1 ? 'Yesterday, 4:30 PM' : `${daysAgo} days ago`;

    institutions.push({
      code,
      id: code,
      name,
      city: `${city}, ${state}`,
      state,
      students: enrolled,
      programs: programsCount,
      quality,
      coverage,
      submitted: when,
      status,
      change: `${rng() > 0.3 ? '+' : '-'}${(rng() * 6).toFixed(1)}%`,
      compliance: quality >= 90 ? 'High' : quality >= 85 ? 'Moderate' : 'Needs review',
      pendingCases: Math.floor(rng() * 5)
    });
  }
  return institutions;
}

/**
 * Generate 40 Validation Batches
 */
export function generateBatches(rng, institutions, count = 40) {
  const batches = [];
  for (let i = 0; i < count; i++) {
    const inst = institutions[i % institutions.length];
    const id = `SUB-${8800 + i + 1}`;
    const rows = 120 + Math.floor(rng() * 320);
    
    // Balanced distribution of flags
    const flagRate = i % 5 === 0 ? 0.08 : i % 3 === 0 ? 0.03 : 0.0;
    const flagged = Math.floor(rows * flagRate);
    const passed = rows - flagged;

    let status = BATCH_STATUSES.ACCEPTED;
    if (flagged > 15) status = BATCH_STATUSES.NEEDS_CORRECTION;
    else if (flagged > 0) status = BATCH_STATUSES.NEEDS_REVIEW;

    const daysAgo = Math.floor(i / 3);
    const when = daysAgo === 0 ? 'Today, 11:24 AM' : daysAgo === 1 ? 'Yesterday, 3:15 PM' : `${daysAgo} days ago`;

    batches.push({
      id,
      institution_code: inst.code,
      institution: inst.name,
      rows,
      passed,
      flagged,
      when,
      status,
      processingTime: `${(1.2 + rng() * 2.8).toFixed(1)}s`,
      warnings: Math.floor(flagged * 0.7)
    });
  }
  return batches;
}

/**
 * Generate 500 Student Records with Referential Integrity
 */
export function generateStudents(rng, institutions, batches, count = 500) {
  const students = [];
  const apaarDigitsPool = new Set();

  for (let i = 0; i < count; i++) {
    const studentId = `APA-${24000 + i + 1}`;
    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const fullName = `${firstName} ${lastName}`;

    const inst = institutions[i % institutions.length];
    const batch = batches[i % batches.length];
    const program = PROGRAMS[Math.floor(rng() * PROGRAMS.length)];
    const category = STUDENT_CATEGORIES[Math.floor(rng() * STUDENT_CATEGORIES.length)];
    const year = ACADEMIC_YEARS[i % 3 === 0 ? 1 : 0];

    // Seeded duplicate candidates (roughly 10% overlap in masked identifier)
    let last4;
    const isDuplicateCandidate = (i > 30 && i % 10 === 0);
    if (isDuplicateCandidate) {
      // Pick an earlier student's last4
      last4 = students[i - 20]?.apaar?.slice(-4) || '4821';
    } else {
      do {
        last4 = String(1000 + Math.floor(rng() * 8999));
      } while (apaarDigitsPool.has(last4) && apaarDigitsPool.size < 4000);
      apaarDigitsPool.add(last4);
    }

    // Determine status & quality score
    let status = VERIFICATION_STATUSES.VERIFIED;
    let score = 92 + Math.floor(rng() * 8);
    let issue = 'No issues detected';
    let apaarDisplay = `•••• •••• ${last4}`;

    if (isDuplicateCandidate) {
      status = VERIFICATION_STATUSES.POTENTIAL_DUPLICATE;
      score = 58 + Math.floor(rng() * 14);
      issue = 'Possible cross-institution match candidate';
    } else if (i % 17 === 0) {
      status = VERIFICATION_STATUSES.NEEDS_CORRECTION;
      score = 40 + Math.floor(rng() * 15);
      issue = 'Mandatory identifier missing or malformed';
      apaarDisplay = 'Not provided';
    } else if (i % 13 === 0) {
      status = VERIFICATION_STATUSES.REVIEW_REQUIRED;
      score = 65 + Math.floor(rng() * 15);
      issue = 'Admission data mismatch against reference schema';
    } else if (i % 47 === 0) {
      status = VERIFICATION_STATUSES.INCOMPLETE;
      score = 52 + Math.floor(rng() * 10);
      issue = 'Pending document verification from institution';
    }

    students.push({
      id: studentId,
      student_id: studentId,
      name: fullName,
      student_name: fullName,
      institution_code: inst.code,
      institution: inst.name,
      program_code: program.code,
      program: program.name,
      year,
      academic_year: year,
      apaar: apaarDisplay,
      apaar_id: apaarDisplay === 'Not provided' ? '' : `TEST-APAAR-${last4}`,
      status,
      score,
      issue,
      category,
      batch_id: batch.id,
      completeness: `${score}%`,
      enrolledAt: `${2024 + (i % 3)}-08-15`,
      lastUpdated: i % 2 === 0 ? 'Today' : `${1 + (i % 14)} days ago`
    });
  }

  return students;
}

/**
 * Generate 120 Identity-Match Candidates
 */
export function generateIdentityMatches(rng, students, institutions, count = 120) {
  const matches = [];

  for (let i = 0; i < count; i++) {
    const matchId = `M-${String(200 + i + 1).padStart(5, '0')}`;
    const primaryStudent = students[i % students.length];
    
    // Choose candidate from another institution or variant name
    const candidateInst = institutions[(i + 3) % institutions.length];
    const nameParts = primaryStudent.name.split(' ');
    const variantName = i % 3 === 0
      ? `${nameParts[0]} ${nameParts[1]?.[0] || 'K'}.`
      : i % 3 === 1
      ? `${nameParts[0]?.[0] || 'A'}. ${nameParts[1] || 'Kumar'}`
      : primaryStudent.name;

    const matchConfidence = 60 + Math.floor(rng() * 38);
    const risk = matchConfidence > 85 ? 'High' : matchConfidence > 70 ? 'Medium' : 'Low';
    
    let reason = 'Masked identifier match + overlapping active enrolment';
    if (i % 3 === 1) reason = 'High name similarity + same academic program';
    else if (i % 3 === 2) reason = 'Identifier pattern match with historical record';

    matches.push({
      id: matchId,
      ref: `APA-${24000 + ((i * 3 + 17) % students.length) + 1}`,
      name: variantName,
      primaryId: primaryStudent.id,
      primaryName: primaryStudent.name,
      primaryInstitution: primaryStudent.institution,
      institution: candidateInst.name,
      institution_code: candidateInst.code,
      match: `${matchConfidence}%`,
      confidence: matchConfidence,
      risk,
      reason,
      status: i % 4 === 0 ? 'Clarification requested' : i % 5 === 0 ? 'Confirmed conflict' : 'Open for review',
      evidence: [
        `Primary record: ${primaryStudent.id} at ${primaryStudent.institution}`,
        `Candidate match score: ${matchConfidence}% illustrative similarity`,
        `Shared academic cycle: 2026–27 overlap detected`
      ]
    });
  }

  return matches;
}

/**
 * Generate 100 Regulatory Cases
 */
export function generateCases(rng, students, institutions, batches, matches, count = 100) {
  const cases = [];

  const CASE_TITLES = [
    'Potential cross-institution identity match',
    'Student summary does not reconcile with batch rows',
    'Missing mandatory student identifier',
    'Unusual enrolment surge exceeding monitoring threshold',
    'Program mapping mismatch against approved AICTE register',
    'Duplicate record candidates across regional clusters',
    'Academic year reporting discrepancy',
    'Repeated schema validation failures in batch upload',
    'Conflicting active admission status in dual institutions',
    'Delayed compliance submission beyond grace period'
  ];

  for (let i = 0; i < count; i++) {
    const caseId = `CASE-${2000 + i + 1}`;
    const student = students[i % students.length];
    const inst = institutions[i % institutions.length];
    const batch = batches[i % batches.length];
    const title = CASE_TITLES[i % CASE_TITLES.length];
    
    const severity = i % 4 === 0 ? CASE_SEVERITY.HIGH : i % 3 === 0 ? CASE_SEVERITY.MEDIUM : CASE_SEVERITY.LOW;
    
    let status = CASE_STATUSES.OPEN;
    if (i % 6 === 0) status = CASE_STATUSES.RESOLVED;
    else if (i % 4 === 0) status = CASE_STATUSES.WAITING_INSTITUTION;
    else if (i % 3 === 0) status = CASE_STATUSES.IN_REVIEW;
    else if (i % 11 === 0) status = CASE_STATUSES.ESCALATED;

    const confidence = 70 + Math.floor(rng() * 28);
    const hoursAgo = 1 + Math.floor(rng() * 72);
    const age = hoursAgo < 24 ? `${hoursAgo} hrs ago` : `${Math.floor(hoursAgo / 24)} days ago`;

    cases.push({
      id: caseId,
      title,
      person: i % 2 === 0 ? student.name : batch.id,
      student_id: student.id,
      institution: inst.name,
      institution_code: inst.code,
      batch_id: batch.id,
      severity,
      confidence,
      age,
      status,
      type: i % 3 === 0 ? CASE_TYPES.IDENTITY_CONFLICT : i % 2 === 0 ? CASE_TYPES.RECONCILIATION : CASE_TYPES.DATA_QUALITY,
      evidence: [
        `Validation signal generated for ${inst.name}`,
        `Referenced student record: ${student.id} (${student.name})`,
        `Threshold flag confidence: ${confidence}% based on configured rules`
      ],
      recommendation: 'Check transfer / withdrawal status and confirm authorized records with institution before closing.'
    });
  }

  return cases;
}

/**
 * Generate 80 Credential Verification Requests
 */
export function generateCredentialRequests(rng, students, count = 80) {
  const requests = [];
  const REQUEST_SOURCES = [
    'Employer Background Verification Agency',
    'Higher Education University Transfer Portal',
    'State Scholarship Regulatory Desk',
    'National Apprenticeship Portal',
    'Authorized Verifier Gateway'
  ];

  for (let i = 0; i < count; i++) {
    const student = students[i % students.length];
    const reqId = `VRF-2026-${String(800 + i + 1).padStart(5, '0')}`;
    const source = REQUEST_SOURCES[i % REQUEST_SOURCES.length];
    const status = i % 5 === 0 ? 'Pending' : i % 12 === 0 ? 'Format rejected' : 'Verified';

    requests.push({
      id: reqId,
      reference: reqId,
      student_id: student.id,
      student_name: student.name,
      institution: student.institution,
      program: student.program,
      requestDate: `2026-10-${String(1 + (i % 28)).padStart(2, '0')}`,
      status,
      source,
      outcome: status === 'Verified' ? 'Record format authentic' : 'Awaiting confirmation',
      disclosureScope: 'Minimum required (Enrolment Status Only)'
    });
  }

  return requests;
}

/**
 * Generate 150 Institution Submission Events
 */
export function generateSubmissionEvents(rng, institutions, batches, count = 150) {
  const events = [];

  for (let i = 0; i < count; i++) {
    const inst = institutions[i % institutions.length];
    const batch = batches[i % batches.length];
    const rows = 100 + Math.floor(rng() * 350);
    const failureCount = i % 4 === 0 ? Math.floor(rng() * 12) : 0;
    const daysAgo = Math.floor(i / 5);

    events.push({
      id: `SEVT-${5000 + i + 1}`,
      institution_code: inst.code,
      institution_name: inst.name,
      batch_id: batch.id,
      volume: rows,
      failures: failureCount,
      timestamp: daysAgo === 0 ? 'Today' : `${daysAgo}d ago`,
      status: failureCount === 0 ? 'Passed' : 'Flagged',
      description: `Submission of ${rows} records by ${inst.name} (${failureCount} exceptions).`
    });
  }

  return events;
}

/**
 * Generate 200 Audit Trail Events
 */
export function generateAuditEvents(rng, students, cases, batches, count = 200) {
  const audit = [];
  const ACTORS = [
    'Regulatory Officer (demo)',
    'Matching engine (automated)',
    'Validation gatekeeper',
    'Institution upload (demo)',
    'System policy monitor'
  ];

  for (let i = 0; i < count; i++) {
    const id = `EVT-${10000 + i + 1}`;
    const targetCase = cases[i % cases.length];
    const targetBatch = batches[i % batches.length];
    const targetStudent = students[i % students.length];

    const type = AUDIT_EVENT_TYPES[i % AUDIT_EVENT_TYPES.length];
    const actor = ACTORS[i % ACTORS.length];
    
    let action = 'Data batch processed';
    let target = targetBatch.id;

    if (type === 'Case action') {
      action = i % 2 === 0 ? 'Correction request sent to institution' : 'Case marked resolved';
      target = targetCase.id;
    } else if (type === 'Identity match') {
      action = 'Potential cross-institution identity conflict flagged';
      target = targetStudent.id;
    } else if (type === 'Data intake') {
      action = `Batch ${targetBatch.id} validated with quality checks`;
      target = targetBatch.id;
    } else if (type === 'Credential request') {
      action = `Reference lookup processed for student ${targetStudent.id}`;
      target = targetStudent.id;
    } else {
      action = 'Routine rule compliance verification performed';
      target = 'SYSTEM';
    }

    const hoursAgo = Math.floor(i * 1.5);
    const time = hoursAgo < 24 ? `${String(Math.floor(hoursAgo % 24)).padStart(2, '0')}:24:10` : `${Math.floor(hoursAgo / 24)}d ago`;

    audit.push({
      id,
      time,
      action,
      actor,
      target,
      type,
      outcome: i % 15 === 0 ? 'Flagged' : 'Success'
    });
  }

  return audit;
}
