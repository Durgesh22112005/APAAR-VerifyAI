/**
 * APAAR VerifyAI — Demo Data Service
 * Centralizes data access, local storage persistence, and reset capabilities.
 */

import { masterSeedData, buildSyntheticDataset } from '../data/seedData.js';
import { validateDataset } from '../utils/dataValidation.js';
import { calculateDashboardMetrics, downloadCSV } from '../utils/dataCalculations.js';

export const initialAnomalies = [
  {
    id: 'ANOM-2026-0881',
    title: 'Unusual Intake Volume Spike (+38.4%)',
    institutionId: 'INST-003',
    institutionName: 'Delhi Technological University (DTU)',
    severity: 'Critical',
    status: 'Open',
    category: 'Intake Volume Anomaly',
    ruleTriggered: 'ANOM-RULE-01 (Surge Threshold > 25% MoM)',
    metricValues: {
      baseline: '1,200 records/cycle',
      detected: '1,660 records submitted',
      variance: '+38.4% variance over historical quota',
      failedBatches: 2
    },
    whyItMatters: 'Sudden high-volume intake surges without prior sanctioned capacity expansion request frequently correlate with unapproved lateral admissions or erroneous batch re-submissions.',
    recommendedAction: 'Issue Regulatory Query for sanctioned intake notification approval under AICTE Section 10(k). Request revised institutional enrollment ledger.',
    relatedBatch: 'BATCH-2026-004',
    relatedCase: 'CASE-2026-012',
    timestamp: '2026-10-28 14:15:22',
    assignedTo: 'Regional Directorate (North)'
  },
  {
    id: 'ANOM-2026-0882',
    title: 'Elevated Missing Identifier Clustering (62.5% Missing APAAR)',
    institutionId: 'INST-008',
    institutionName: 'Anna University College of Engineering (Guindy)',
    severity: 'High',
    status: 'In Review',
    category: 'Completeness Anomaly',
    ruleTriggered: 'ANOM-RULE-03 (Missing Key Identifier > 40%)',
    metricValues: {
      baseline: 'National Average 9.2%',
      detected: '62.5% omission rate (25/40 records)',
      variance: '+53.3% deficit against national standard',
      failedBatches: 3
    },
    whyItMatters: 'Systematic omission of 12-digit APAAR references prevents automated credit transfer reconciliation and breaks DigiLocker NAD sync.',
    recommendedAction: 'Trigger mandatory ABC ID linkage workflow with the institutional registrar desk. Schedule institutional data officer orientation.',
    relatedBatch: 'BATCH-2026-018',
    relatedCase: 'CASE-2026-029',
    timestamp: '2026-10-27 11:30:10',
    assignedTo: 'Data Governance Cell'
  },
  {
    id: 'ANOM-2026-0883',
    title: 'Cross-Campus Identity Duplication Cluster',
    institutionId: 'INST-014',
    institutionName: 'Vellore Institute of Technology (VIT)',
    severity: 'High',
    status: 'Open',
    category: 'Duplicate Candidate Density',
    ruleTriggered: 'ANOM-RULE-04 (Cross-Campus Match Ratio > 5%)',
    metricValues: {
      baseline: 'Allowable threshold < 1.0%',
      detected: '6 concurrent candidate matches detected',
      variance: 'Matches share DOB + Parent Name across 2 distinct states',
      failedBatches: 1
    },
    whyItMatters: 'Concurrent full-time enrolments across distant campuses violate AICTE full-time degree residency regulations.',
    recommendedAction: 'Dispatch candidate profiles to Regulatory Case Desk for dual-enrolment adjudication. Place candidate records on conditional administrative hold.',
    relatedBatch: 'BATCH-2026-027',
    relatedCase: 'CASE-2026-041',
    timestamp: '2026-10-26 09:42:00',
    assignedTo: 'Identity Resolution Lab'
  },
  {
    id: 'ANOM-2026-0884',
    title: 'Repeated Format Validation Failures (3 Consecutive Batches)',
    institutionId: 'INST-019',
    institutionName: 'BITS Pilani (Pilani Campus)',
    severity: 'Medium',
    status: 'Open',
    category: 'Validation Failure Trend',
    ruleTriggered: 'ANOM-RULE-02 (Batch Failure Recurrence >= 3)',
    metricValues: {
      baseline: '0 failures expected in accredited tier',
      detected: '3 consecutive ingestion rejects',
      variance: 'Header schema misaligned on "academic_session_id"',
      failedBatches: 3
    },
    whyItMatters: 'Persistent schema rejection prevents student cohort record finalization and delays scholarship eligibility indexing.',
    recommendedAction: 'Provide updated JSON/CSV ingestion schema v2.4 to the institutional IT administrator. Offer API integration sandbox test keys.',
    relatedBatch: 'BATCH-2026-031',
    relatedCase: 'CASE-2026-056',
    timestamp: '2026-10-25 16:20:45',
    assignedTo: 'Technical Ingestion Desk'
  },
  {
    id: 'ANOM-2026-0885',
    title: 'Unapproved Curriculum Branch Nomenclature Shift',
    institutionId: 'INST-022',
    institutionName: 'Thapar Institute of Engineering and Technology',
    severity: 'Low',
    status: 'Resolved',
    category: 'Curriculum Code Variance',
    ruleTriggered: 'ANOM-RULE-05 (AICTE Course Registry Mismatch)',
    metricValues: {
      baseline: 'AICTE Standard Nomenclature list',
      detected: 'Custom branch string: "B.Tech Robotics & Autonomous AI"',
      variance: 'Unmapped to AICTE Course Code Taxonomy',
      failedBatches: 1
    },
    whyItMatters: 'Discrepancy in standard course classification causes curriculum accreditation audit flags during national reporting.',
    recommendedAction: 'Map institutional taxonomy string to AICTE Standard Code #AICTE-CSE-AI-09.',
    relatedBatch: 'BATCH-2026-035',
    relatedCase: 'CASE-2026-077',
    timestamp: '2026-10-24 10:11:00',
    assignedTo: 'Academic Approval Bureau'
  }
];

class DemoDataService {
  constructor() {
    this.dataset = this.loadInitialDataset();
    if (!this.dataset.anomalies) {
      this.dataset.anomalies = initialAnomalies;
      this.persist(this.dataset);
    }
    this.runIntegrityAudit();
  }

  loadInitialDataset() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return masterSeedData;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.metadata?.version === masterSeedData.metadata.version && parsed.students?.length >= 400) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Recovered from invalid local storage data. Re-initializing synthetic seed.', e);
    }

    // Default to clean deterministic seed data
    this.persist(masterSeedData);
    return masterSeedData;
  }

  persist(data) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('LocalStorage quota or permission error. Falling back to memory state.', e);
      }
    }
    this.dataset = data;
  }

  runIntegrityAudit() {
    const report = validateDataset(this.dataset);
    if (!report.valid) {
      console.warn('Synthetic dataset validation warnings:', report.errors);
    } else {
      console.log('✓ Synthetic Dataset Validated:', report.counts);
    }
    return report;
  }

  getDataset() {
    return this.dataset;
  }

  getStudents() {
    return this.dataset.students || [];
  }

  getStudentById(id) {
    return this.dataset.students.find(s => s.id === id);
  }

  getInstitutions() {
    return this.dataset.institutions || [];
  }

  getInstitutionByCode(code) {
    return this.dataset.institutions.find(i => i.code === code);
  }

  getCases() {
    return this.dataset.cases || [];
  }

  getMatches() {
    return this.dataset.matches || [];
  }

  getBatches() {
    return this.dataset.batches || [];
  }

  getCredentialRequests() {
    return this.dataset.credentialRequests || [];
  }

  getAuditEvents() {
    return this.dataset.auditEvents || [];
  }

  getSubmissionEvents() {
    return this.dataset.submissionEvents || [];
  }

  getMetrics() {
    return calculateDashboardMetrics(
      this.dataset.students,
      this.dataset.cases,
      this.dataset.batches,
      this.dataset.institutions
    );
  }

  updateStudents(updater) {
    const current = this.dataset.students;
    const next = typeof updater === 'function' ? updater(current) : updater;
    this.persist({ ...this.dataset, students: next });
    return next;
  }

  updateCases(updater) {
    const current = this.dataset.cases;
    const next = typeof updater === 'function' ? updater(current) : updater;
    this.persist({ ...this.dataset, cases: next });
    return next;
  }

  updateBatches(updater) {
    const current = this.dataset.batches;
    const next = typeof updater === 'function' ? updater(current) : updater;
    this.persist({ ...this.dataset, batches: next });
    return next;
  }

  updateMatches(updater) {
    const current = this.dataset.matches || [];
    const next = typeof updater === 'function' ? updater(current) : updater;
    this.persist({ ...this.dataset, matches: next });
    return next;
  }

  getAnomalies() {
    return this.dataset.anomalies || initialAnomalies;
  }

  updateAnomalies(updater) {
    const current = this.dataset.anomalies || initialAnomalies;
    const next = typeof updater === 'function' ? updater(current) : updater;
    this.persist({ ...this.dataset, anomalies: next });
    return next;
  }

  findMatchesForStudent(studentId, name) {
    if (!studentId && !name) return [];
    return (this.dataset.matches || []).filter(m => 
      m.ref === studentId || 
      m.primaryId === studentId ||
      m.candidateId === studentId ||
      (name && m.name?.toLowerCase() === name.toLowerCase())
    );
  }

  findCasesForStudent(studentId, name) {
    if (!studentId && !name) return [];
    return (this.dataset.cases || []).filter(c => 
      c.student_id === studentId || 
      (name && c.person?.toLowerCase() === name.toLowerCase())
    );
  }

  findBatchForStudent(institutionNameOrCode) {
    if (!institutionNameOrCode) return null;
    return (this.dataset.batches || []).find(b => 
      b.institution?.toLowerCase().includes(institutionNameOrCode.toLowerCase()) ||
      institutionNameOrCode.toLowerCase().includes(b.institution?.toLowerCase())
    );
  }

  logAuditEvent(action, target, type = 'Case action', actor = 'Regulatory Officer (demo)', outcome = 'Success') {
    const now = new Date();
    const newEvent = {
      id: `EVT-${10000 + (this.dataset.auditEvents?.length || 0) + 1}`,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      actor,
      target,
      type,
      outcome
    };
    const next = [newEvent, ...(this.dataset.auditEvents || [])];
    this.persist({ ...this.dataset, auditEvents: next });
    return next;
  }

  resetDemoData() {
    const fresh = buildSyntheticDataset(20260315);
    fresh.anomalies = initialAnomalies;
    this.persist(fresh);
    this.runIntegrityAudit();
    return fresh;
  }

  exportDataset(entityName) {
    switch (entityName) {
      case 'students':
        downloadCSV(this.getStudents(), 'apaar-synthetic-students.csv');
        break;
      case 'institutions':
        downloadCSV(this.getInstitutions(), 'apaar-synthetic-institutions.csv');
        break;
      case 'cases':
        downloadCSV(this.getCases(), 'apaar-synthetic-cases.csv');
        break;
      case 'batches':
        downloadCSV(this.getBatches(), 'apaar-synthetic-batches.csv');
        break;
      case 'matches':
        downloadCSV(this.getMatches(), 'apaar-synthetic-identity-matches.csv');
        break;
      case 'audit':
        downloadCSV(this.getAuditEvents(), 'apaar-synthetic-audit-trail.csv');
        break;
      default:
        console.warn(`Export for ${entityName} not recognized`);
    }
  }
}

export const demoDataService = new DemoDataService();
