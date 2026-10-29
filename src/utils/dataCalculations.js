/**
 * APAAR VerifyAI — Data Calculations and Aggregations
 * Centralizes derived KPI metrics, chart series, and data export routines.
 */

export function calculateDashboardMetrics(students = [], cases = [], batches = [], institutions = []) {
  return calculateAdvancedDashboardMetrics({ students, cases, batches, institutions });
}

/**
 * Advanced Dashboard Metrics Engine (Phase 3)
 * Supports dynamic institution filtering, time-range slicing, trend series, and actionable insights.
 */
export function calculateAdvancedDashboardMetrics({
  students = [],
  cases = [],
  batches = [],
  institutions = [],
  matches = [],
  audit = [],
  selectedInstitution = 'All',
  selectedDateRange = 'Current cycle (2026–27)',
  selectedTrendPeriod = 'monthly'
}) {
  // 1. Institution Filtering
  let filteredStudents = students;
  let filteredCases = cases;
  let filteredBatches = batches;
  let filteredMatches = matches;

  let activeInstitution = null;
  if (selectedInstitution !== 'All') {
    activeInstitution = institutions.find(i => i.code === selectedInstitution || i.name === selectedInstitution);
    const instName = activeInstitution ? activeInstitution.name : selectedInstitution;
    const instCode = activeInstitution ? activeInstitution.code : selectedInstitution;

    filteredStudents = students.filter(s => s.institution === instName || s.institutionCode === instCode);
    filteredCases = cases.filter(c => c.institution === instName || c.institutionCode === instCode);
    filteredBatches = batches.filter(b => b.institution === instName || b.institutionCode === instCode);
    filteredMatches = matches.filter(m => 
      m.institutionA === instName || m.institutionB === instName ||
      m.institutionCodeA === instCode || m.institutionCodeB === instCode
    );
  }

  // 2. Date-Range Slicing (Demonstration simulation)
  if (selectedDateRange === 'Last 30 days') {
    filteredStudents = filteredStudents.slice(0, Math.max(1, Math.floor(filteredStudents.length * 0.4)));
    filteredBatches = filteredBatches.slice(0, Math.max(1, Math.floor(filteredBatches.length * 0.35)));
  } else if (selectedDateRange === 'Last 90 days') {
    filteredStudents = filteredStudents.slice(0, Math.max(1, Math.floor(filteredStudents.length * 0.75)));
    filteredBatches = filteredBatches.slice(0, Math.max(1, Math.floor(filteredBatches.length * 0.7)));
  }

  const totalStudents = filteredStudents.length;
  const verifiedStudents = filteredStudents.filter(s => s.status === 'Verified').length;
  const needsCorrectionCount = filteredStudents.filter(s => s.status === 'Needs correction').length;
  const reviewRequiredCount = filteredStudents.filter(s => s.status === 'Review required').length;
  const potentialDuplicateCount = filteredStudents.filter(s => s.status === 'Potential duplicate').length;
  const pendingStudents = needsCorrectionCount + reviewRequiredCount + potentialDuplicateCount;

  // Validation Success Rate from Batches
  const totalBatchRows = filteredBatches.reduce((acc, b) => acc + (b.rows || 0), 0);
  const passedBatchRows = filteredBatches.reduce((acc, b) => acc + (b.passed || 0), 0);
  const validationSuccessRate = totalBatchRows > 0
    ? ((passedBatchRows / totalBatchRows) * 100).toFixed(1)
    : (totalStudents > 0 ? ((verifiedStudents / totalStudents) * 100).toFixed(1) : '96.8');

  // Average Data Quality Score
  const averageQualityScore = totalStudents > 0
    ? (filteredStudents.reduce((acc, s) => acc + (s.score || 0), 0) / totalStudents).toFixed(1)
    : (activeInstitution?.quality ? String(activeInstitution.quality) : '91.4');

  // Open & High Priority Cases
  const openCasesList = filteredCases.filter(c => c.status !== 'Resolved');
  const highPriorityCasesList = openCasesList.filter(c => c.severity === 'High');
  const awaitingInstitutionCasesList = openCasesList.filter(c => c.status === 'Waiting on institution');
  const resolvedCasesCount = filteredCases.filter(c => c.status === 'Resolved').length;

  // Institution Health
  const healthyCount = institutions.filter(i => i.status === 'Healthy').length;
  const actionNeededCount = institutions.filter(i => i.status === 'Action needed').length;
  const instReviewRequiredCount = institutions.filter(i => i.status === 'Review required').length;
  const institutionsMonitored = selectedInstitution === 'All' ? institutions.length : 1;
  const complianceRate = Math.round((healthyCount / (institutions.length || 1)) * 100);

  // Status Distribution
  const verifiedPct = totalStudents > 0 ? Math.round((verifiedStudents / totalStudents) * 100) : 81;
  const correctionPct = totalStudents > 0 ? Math.round((needsCorrectionCount / totalStudents) * 100) : 11;
  const reviewPct = totalStudents > 0 ? Math.round((reviewRequiredCount / totalStudents) * 100) : 5;
  const duplicatePct = Math.max(0, 100 - verifiedPct - correctionPct - reviewPct);

  // Data Quality Breakdown (4 Tiers)
  const qualityHigh = filteredStudents.filter(s => (s.score || 0) >= 90).length;
  const qualityMedium = filteredStudents.filter(s => (s.score || 0) >= 75 && (s.score || 0) < 90).length;
  const qualityNeedsImprovement = filteredStudents.filter(s => (s.score || 0) >= 50 && (s.score || 0) < 75).length;
  const qualityCritical = filteredStudents.filter(s => (s.score || 0) < 50).length;

  // Verification Trend Series
  const monthlyTrend = [
    { period: 'Apr', verified: 36, pending: 8, flagged: 4, rejected: 2, total: 50 },
    { period: 'May', verified: 52, pending: 12, flagged: 6, rejected: 3, total: 73 },
    { period: 'Jun', verified: 48, pending: 10, flagged: 5, rejected: 2, total: 65 },
    { period: 'Jul', verified: 65, pending: 14, flagged: 8, rejected: 4, total: 91 },
    { period: 'Aug', verified: 60, pending: 11, flagged: 6, rejected: 3, total: 80 },
    { period: 'Sep', verified: 78, pending: 16, flagged: 9, rejected: 5, total: 108 },
    { period: 'Oct', verified: 94, pending: 18, flagged: 11, rejected: 6, total: 129 }
  ];

  const weeklyTrend = [
    { period: 'Wk 1', verified: 18, pending: 4, flagged: 2, rejected: 1, total: 25 },
    { period: 'Wk 2', verified: 26, pending: 6, flagged: 3, rejected: 1, total: 36 },
    { period: 'Wk 3', verified: 22, pending: 5, flagged: 2, rejected: 1, total: 30 },
    { period: 'Wk 4', verified: 34, pending: 8, flagged: 4, rejected: 2, total: 48 },
    { period: 'Wk 5', verified: 31, pending: 7, flagged: 3, rejected: 2, total: 43 },
    { period: 'Wk 6', verified: 42, pending: 9, flagged: 5, rejected: 3, total: 59 }
  ];

  const activeTrend = selectedTrendPeriod === 'weekly' ? weeklyTrend : monthlyTrend;

  // Institution Performance Rankings
  const institutionRankings = institutions.map(inst => {
    const instStudents = students.filter(s => s.institution === inst.name || s.institutionCode === inst.code);
    const instVerified = instStudents.filter(s => s.status === 'Verified').length;
    const coverage = instStudents.length > 0 ? Math.round((instVerified / instStudents.length) * 100) : 85;
    const pendingCasesCount = cases.filter(c => (c.institution === inst.name || c.institutionCode === inst.code) && c.status !== 'Resolved').length;

    return {
      code: inst.code,
      name: inst.name,
      city: inst.city,
      studentCount: instStudents.length || inst.students,
      coveragePct: coverage,
      qualityScore: inst.quality,
      pendingCases: pendingCasesCount,
      status: inst.status
    };
  }).sort((a, b) => b.qualityScore - a.qualityScore);

  // Priority Action Queue (Deterministic ranking)
  const priorityQueue = [
    ...openCasesList.filter(c => c.severity === 'High').map(c => ({
      id: c.id,
      category: 'Identity Conflict',
      title: c.title,
      description: `${c.person} · ${c.institution}`,
      severity: 'Critical',
      ref: c.id,
      age: c.age || 'Recent',
      status: c.status,
      action: c.recommendation || 'Verify source records and check cross-institution transfer status.',
      targetPage: 'cases'
    })),
    ...filteredMatches.slice(0, 3).map(m => ({
      id: m.id,
      category: 'Potential Duplicate',
      title: `Candidate match: ${m.name}`,
      description: `${m.institutionA} ↔ ${m.institutionB} (${m.matchScore}% similarity)`,
      severity: m.risk === 'High' ? 'High' : 'Medium',
      ref: m.refA,
      age: 'Just now',
      status: 'Needs Review',
      action: 'Open Identity Matching Lab to evaluate candidate evidence.',
      targetPage: 'matching'
    })),
    ...filteredBatches.filter(b => b.status === 'Needs correction').slice(0, 2).map(b => ({
      id: b.id,
      category: 'Failed Batch',
      title: `Intake exceptions in ${b.id}`,
      description: `${b.institution} (${b.flagged} flagged rows)`,
      severity: 'Medium',
      ref: b.id,
      age: b.when || 'Today',
      status: 'Needs Correction',
      action: 'Send correction notice to institution administrator.',
      targetPage: 'intake'
    }))
  ].slice(0, 6);

  // Actionable Platform Insights (3 deterministic insights)
  const platformInsights = [
    {
      id: 'INS-01',
      title: 'Cross-Institution Duplicate Cluster',
      finding: `${filteredMatches.length} candidate duplicate pairs detected in active pool.`,
      evidence: `Highest overlap density observed between Eastern Technical College and Sri Krishna College of Technology (shared identifiers with matching academic years).`,
      impact: 'Unresolved cross-institution duplicates distort AICTE seat allocation and funding statistics.',
      action: 'Review Candidate Pairs',
      targetPage: 'matching',
      tone: 'red'
    },
    {
      id: 'INS-02',
      title: 'Mandatory Identifier Omission Pattern',
      finding: `${needsCorrectionCount} records blocked under Rule APAAR-REQ-01.`,
      evidence: `Missing or incomplete APAAR references account for 68% of intake validation exceptions across Western & North Valley institutes.`,
      impact: 'Prevents automated identity reconciliation and delays batch acceptance sign-off.',
      action: 'View Validation Rules',
      targetPage: 'rules',
      tone: 'amber'
    },
    {
      id: 'INS-03',
      title: 'Summary-to-Detail Reconciliation Variance',
      finding: 'Aggregate institution summaries differ from row-level batches.',
      evidence: 'Batch SUB-8812 exhibits a 5-record delta between institution-reported active student count and uploaded rows.',
      impact: 'Fails mandatory regulatory reconciliation gate before records enter central repository.',
      action: 'Inspect Intake Gate',
      targetPage: 'intake',
      tone: 'blue'
    }
  ];

  // Recent Audit Feed (top 6)
  const recentAudit = audit.slice(0, 6);

  // Recent Cases (top 6)
  const recentCases = filteredCases.slice(0, 6);

  return {
    kpis: {
      totalStudents,
      verifiedStudents,
      pendingStudents,
      identityConflicts: filteredMatches.length || potentialDuplicateCount,
      institutionsMonitored,
      averageQualityScore,
      openCases: openCasesList.length,
      highPriorityCases: highPriorityCasesList.length,
      awaitingInstitutionCases: awaitingInstitutionCasesList.length,
      resolvedCases: resolvedCasesCount,
      validationSuccessRate,
      complianceRate
    },
    distribution: {
      verified: { count: verifiedStudents, pct: verifiedPct },
      needsCorrection: { count: needsCorrectionCount, pct: correctionPct },
      reviewRequired: { count: reviewRequiredCount, pct: reviewPct },
      potentialDuplicate: { count: potentialDuplicateCount, pct: duplicatePct }
    },
    qualityBreakdown: {
      high: { count: qualityHigh, pct: totalStudents ? Math.round((qualityHigh / totalStudents) * 100) : 68 },
      medium: { count: qualityMedium, pct: totalStudents ? Math.round((qualityMedium / totalStudents) * 100) : 22 },
      needsImprovement: { count: qualityNeedsImprovement, pct: totalStudents ? Math.round((qualityNeedsImprovement / totalStudents) * 100) : 7 },
      critical: { count: qualityCritical, pct: totalStudents ? Math.round((qualityCritical / totalStudents) * 100) : 3 }
    },
    trend: activeTrend,
    institutionRankings,
    priorityQueue,
    platformInsights,
    recentAudit,
    recentCases,
    submissionHealth: {
      totalBatches: filteredBatches.length,
      acceptedBatches: filteredBatches.filter(b => b.status === 'Accepted').length,
      flaggedBatches: filteredBatches.filter(b => b.status !== 'Accepted').length,
      totalRows: totalBatchRows,
      passedRows: passedBatchRows,
      healthTiers: [
        { name: 'Healthy / On Track', count: healthyCount, pct: complianceRate, tone: 'green' },
        { name: 'Action Needed', count: actionNeededCount, pct: Math.round((actionNeededCount / (institutions.length || 1)) * 100), tone: 'amber' },
        { name: 'Review Required', count: instReviewRequiredCount, pct: Math.round((instReviewRequiredCount / (institutions.length || 1)) * 100), tone: 'red' }
      ]
    },
    // Raw filtered items
    filteredStudents,
    filteredCases,
    filteredBatches,
    filteredMatches
  };
}

/**
 * Universal CSV Exporter
 */
export function downloadCSV(rows, filename = 'apaar-export.csv') {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const body = [
    keys.join(','),
    ...rows.map(r => keys.map(k => `"${String(r[k] ?? '').replaceAll('"', '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Robust CSV Parser
 */
export function parseCSV(txt) {
  const lines = txt.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  const parseLine = s => {
    const out = [];
    let v = '';
    let inQuotes = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '"' && s[i + 1] === '"' && inQuotes) {
        v += '"';
        i++;
      } else if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        out.push(v.trim());
        v = '';
      } else {
        v += c;
      }
    }
    out.push(v.trim());
    return out;
  };

  const headers = parseLine(lines[0]).map(x => x.toLowerCase().replaceAll(' ', '_'));
  const rows = lines.slice(1).filter(Boolean).map(line => {
    const vals = parseLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] || '']));
  });

  return { headers, rows };
}

/**
 * Standard AICTE Ingestion CSV Template
 */
export function downloadCSVTemplate() {
  const sampleRows = [
    {
      student_id: 'AICTE-2026-9001',
      student_name: 'Aarav Sharma',
      apaar_id: '202698741234',
      institution_code: 'INST-001',
      program_code: 'B.Tech Computer Science and Engineering',
      academic_year: '2026–27',
      category: 'Regular Admission'
    },
    {
      student_id: 'AICTE-2026-9002',
      student_name: 'Diya Patel',
      apaar_id: '202698741235',
      institution_code: 'INST-001',
      program_code: 'B.Tech Electronics & Communication',
      academic_year: '2026–27',
      category: 'Lateral Entry'
    },
    {
      student_id: 'AICTE-2026-9003',
      student_name: 'Karan Verma',
      apaar_id: '202698741236',
      institution_code: 'INST-002',
      program_code: 'B.Tech Information Technology',
      academic_year: '2026–27',
      category: 'Management Quota'
    },
    {
      student_id: 'AICTE-2026-9004_FLAGGED',
      student_name: 'Neha Gupta (Sample Flagged Record)',
      apaar_id: 'TEST-INVALID-FORMAT',
      institution_code: 'INST-003',
      program_code: 'B.Tech Mechanical Engineering',
      academic_year: '2026–27',
      category: 'Regular Admission'
    }
  ];
  downloadCSV(sampleRows, 'apaar-student-intake-template-v2.csv');
}

/**
 * Download Intake Error Report
 */
export function downloadErrorReport(flaggedRows, batchId = 'BATCH') {
  if (!flaggedRows || !flaggedRows.length) return;
  const reportRows = flaggedRows.map((r, i) => ({
    row_number: i + 1,
    student_id: r.id || r.student_id || 'Unknown',
    student_name: r.name || r.student_name || 'Missing Name',
    masked_apaar: r.apaar || r.apaar_id || 'Missing APAAR',
    institution: r.institution || r.institution_code || '',
    validation_status: r.status || 'Flagged for review',
    detected_exceptions: r.issue || r.errors || 'Validation exception detected',
    remediation_guidance: 'Correct identifier format (12 numeric digits) and resubmit through intake gate.'
  }));
  downloadCSV(reportRows, `${batchId}-validation-error-report.csv`);
}

