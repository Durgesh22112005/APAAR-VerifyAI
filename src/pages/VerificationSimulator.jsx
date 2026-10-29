import React, { useState, useEffect } from 'react';
import {
  Sparkles, Play, RotateCcw, CheckCircle2, AlertTriangle, AlertOctagon,
  Clock3, ShieldCheck, Database, CloudUpload, ListChecks, GitCompare,
  UserCheck, History, ArrowRight, Fingerprint, X, ShieldAlert, Check
} from 'lucide-react';

const SCENARIOS = [
  {
    id: 'SCENARIO-1',
    name: 'Valid Student Submission',
    badge: 'Clean Happy-Path',
    badgeTone: 'green',
    desc: 'Fully compliant B.Tech student with valid 12-digit APAAR format, recognized AICTE institution, and unique identity.',
    payload: {
      student_id: 'APA-SIM-001',
      student_name: 'Ananya Sharma',
      institution_code: 'INST-001',
      institution_name: 'Sri Krishna College of Technology',
      program: 'B.E. Computer Science & Engineering',
      academic_year: '2026–27',
      apaar_id: 'TEST-APAAR-7730',
      masked_apaar: '•••• •••• 7730',
      category: 'Regular Admission'
    },
    stages: [
      { name: 'Institutional Intake', status: 'Passed', tone: 'green', note: 'Payload ingested via secure API gateway. 8/8 fields present.' },
      { name: 'Field Validation Gate', status: 'Passed', tone: 'green', note: 'All mandatory fields present. No syntax or type anomalies.' },
      { name: 'Data Normalization', status: 'Passed', tone: 'green', note: 'Whitespace trimmed. APAAR masked to •••• 7730 for storage.' },
      { name: 'Identity Matching Scan', status: 'Clean', tone: 'green', note: 'No candidate collision found across 500 active records.' },
      { name: 'Rule Matrix Evaluation', status: '100% Pass', tone: 'green', note: 'Passed APAAR-REQ-01, SCHEMA-03, and YEAR-06.' },
      { name: 'Human Review Gate', status: 'Fast-Pathed', tone: 'green', note: 'Auto-accepted without requiring manual officer review.' },
      { name: 'Verification Outcome', status: 'Verified', tone: 'green', note: 'Record committed to Central Student Repository (Score: 100%).' },
      { name: 'Audit Journaling', status: 'Committed', tone: 'green', note: 'Cryptographic transaction hash recorded in tamper-evident ledger.' }
    ]
  },
  {
    id: 'SCENARIO-2',
    name: 'Missing Mandatory Identifier',
    badge: 'Rule APAAR-REQ-01 Block',
    badgeTone: 'amber',
    desc: 'Student uploaded with an empty APAAR identifier field, triggering immediate intake rejection and correction notice.',
    payload: {
      student_id: 'APA-SIM-002',
      student_name: 'Rahul V. Sharma',
      institution_code: 'INST-002',
      institution_name: 'North Valley Institute of Technology',
      program: 'B.Tech Mechanical Engineering',
      academic_year: '2026–27',
      apaar_id: '',
      masked_apaar: 'Not provided',
      category: 'Regular Admission'
    },
    stages: [
      { name: 'Institutional Intake', status: 'Ingested', tone: 'green', note: 'Payload received in batch envelope SUB-SIM-882.' },
      { name: 'Field Validation Gate', status: 'Failed', tone: 'red', note: 'Rule APAAR-REQ-01 triggered: Mandatory student identifier missing.' },
      { name: 'Data Normalization', status: 'Flagged', tone: 'amber', note: 'Assigned provisional placeholder; flagged as incomplete.' },
      { name: 'Identity Matching Scan', status: 'Bypassed', tone: 'blue', note: 'Matching skipped due to missing primary reference.' },
      { name: 'Rule Matrix Evaluation', status: 'Blocked', tone: 'red', note: 'Rejection policy enforced. Record cannot proceed to archive.' },
      { name: 'Human Review Gate', status: 'Correction Dispatched', tone: 'amber', note: 'Correction request notice dispatched to institution administrator.' },
      { name: 'Verification Outcome', status: 'Needs Correction', tone: 'amber', note: 'Quality Score: 41%. Record held in quarantine state.' },
      { name: 'Audit Journaling', status: 'Committed', tone: 'green', note: 'Discrepancy event logged in regulatory audit trail.' }
    ]
  },
  {
    id: 'SCENARIO-3',
    name: 'Potential Duplicate Student Record',
    badge: 'Cross-Institution Conflict',
    badgeTone: 'red',
    desc: 'Active student at Eastern Technical College matches an existing enrolled student at Sri Krishna College with high similarity.',
    payload: {
      student_id: 'APA-SIM-003',
      student_name: 'Meera Krishnan',
      institution_code: 'INST-003',
      institution_name: 'Eastern Technical College',
      program: 'B.E. Computer Science & Engineering',
      academic_year: '2026–27',
      apaar_id: 'TEST-APAAR-4821',
      masked_apaar: '•••• •••• 4821',
      category: 'Regular Admission'
    },
    stages: [
      { name: 'Institutional Intake', status: 'Ingested', tone: 'green', note: 'Batch intake received from Eastern Technical College.' },
      { name: 'Field Validation Gate', status: 'Passed', tone: 'green', note: 'All schema format checks passed.' },
      { name: 'Data Normalization', status: 'Passed', tone: 'green', note: 'Identifier masked and normalized.' },
      { name: 'Identity Matching Scan', status: 'Collision Detected', tone: 'red', note: 'High similarity (94%) detected against primary record APA-24084.' },
      { name: 'Rule Matrix Evaluation', status: 'Conflict Flagged', tone: 'red', note: 'Rule MATCH-02 triggered: Possible concurrent active enrolment.' },
      { name: 'Human Review Gate', status: 'Routed to Desk', tone: 'red', note: 'Assigned to Regulatory Officer in Risk & Case Desk (CASE-2084).' },
      { name: 'Verification Outcome', status: 'Review Required', tone: 'red', note: 'Provisional hold applied pending dual-enrolment clearance.' },
      { name: 'Audit Journaling', status: 'Committed', tone: 'green', note: 'Identity conflict audit entry committed with evidence payload.' }
    ]
  },
  {
    id: 'SCENARIO-4',
    name: 'Unapproved Academic Program Mismatch',
    badge: 'Reference Mismatch',
    badgeTone: 'amber',
    desc: 'Submitted program code does not exist in the approved AICTE master registry for this institution code.',
    payload: {
      student_id: 'APA-SIM-004',
      student_name: 'Sanjay Mukherjee',
      institution_code: 'INST-005',
      institution_name: 'Central School of Engineering',
      program: 'B.Tech Advanced Robotics & Drones (Unregistered)',
      academic_year: '2026–27',
      apaar_id: 'TEST-APAAR-3452',
      masked_apaar: '•••• •••• 3452',
      category: 'Regular Admission'
    },
    stages: [
      { name: 'Institutional Intake', status: 'Ingested', tone: 'green', note: 'Batch ingested from Central School of Engineering.' },
      { name: 'Field Validation Gate', status: 'Passed', tone: 'green', note: 'All required fields populated.' },
      { name: 'Data Normalization', status: 'Passed', tone: 'green', note: 'Record schema normalized.' },
      { name: 'Identity Matching Scan', status: 'Clean', tone: 'green', note: 'No student identity collision.' },
      { name: 'Rule Matrix Evaluation', status: 'Mapping Failure', tone: 'red', note: 'Rule MAP-05 triggered: Program code unmapped in AICTE registry.' },
      { name: 'Human Review Gate', status: 'Regulatory Clarification', tone: 'amber', note: 'Notice sent to academic registrar for course approval certificate.' },
      { name: 'Verification Outcome', status: 'Needs Review', tone: 'amber', note: 'Held in verification queue pending curriculum mapping confirmation.' },
      { name: 'Audit Journaling', status: 'Committed', tone: 'green', note: 'Policy mapping exception recorded in audit log.' }
    ]
  }
];

export default function VerificationSimulator({ onNotify }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(SCENARIOS[0].id);
  const [currentStep, setCurrentStep] = useState(0); // 0 = ready, 1..8 = running
  const [isSimulating, setIsSimulating] = useState(false);

  const scenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];

  useEffect(() => {
    setCurrentStep(0);
    setIsSimulating(false);
  }, [selectedScenarioId]);

  function startSimulation() {
    setIsSimulating(true);
    setCurrentStep(1);

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= 8) {
          clearInterval(timer);
          setIsSimulating(false);
          onNotify?.(`Simulation complete: ${scenario.name} reached outcome stage.`);
          return 8;
        }
        return prev + 1;
      });
    }, 600);
  }

  function resetSimulation() {
    setCurrentStep(0);
    setIsSimulating(false);
    onNotify?.('Simulator reset to initial state.');
  }

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">INTERACTIVE LAB / 08</div>
          <h1>Verification Journey Simulator</h1>
          <p>Step through simulated student record journeys to observe automated validation, entity resolution, and decision routing in real time.</p>
        </div>
        <div className="page-actions">
          <span className="badge violet"><i /> SIMULATION SANDBOX · ISOLATED</span>
        </div>
      </div>

      {/* Scenario Picker Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {SCENARIOS.map(s => {
          const isSelected = s.id === selectedScenarioId;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedScenarioId(s.id)}
              style={{
                textAlign: 'left',
                padding: '16px',
                background: isSelected ? 'var(--blue-light)' : 'var(--bg-surface)',
                border: isSelected ? '2px solid var(--blue-primary)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: isSelected ? '0 4px 14px var(--blue-glow)' : 'var(--shadow-xs)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="mono" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{s.id}</span>
                <span className={`badge ${s.badgeTone}`}>{s.badge}</span>
              </div>
              <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>{s.name}</strong>
              <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{s.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Simulator Workspace */}
      <div className="overview-grid" style={{ gridTemplateColumns: 'minmax(320px, 0.9fr) minmax(0, 1.5fr)' }}>
        {/* Left: Input Payload & Controls */}
        <section className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <h3>Simulated Input Payload</h3>
              <p>Synthetic student payload supplied by institution</p>
            </div>
            <span className={`badge ${scenario.badgeTone}`}>{scenario.badge}</span>
          </div>

          <div style={{ margin: '16px 0', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Student Payload Fields
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Reference ID:</span> <b className="mono blue-text">{scenario.payload.student_id}</b></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Full Name:</span> <strong>{scenario.payload.student_name}</strong></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Institution:</span> <span>{scenario.payload.institution_name}</span></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Program:</span> <span>{scenario.payload.program}</span></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Academic Year:</span> <b>{scenario.payload.academic_year}</b></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Masked APAAR:</span> <b className="mono">{scenario.payload.masked_apaar}</b></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={startSimulation}
              disabled={isSimulating}
            >
              <Play size={15} /> {isSimulating ? 'Simulating Pipeline...' : 'Run Simulation'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={resetSimulation}
              title="Reset simulation to initial state"
            >
              <RotateCcw size={15} /> Reset
            </button>
          </div>

          <div className="readiness-callout" style={{ marginTop: '16px' }}>
            <ShieldCheck size={15} />
            Isolated test execution. Scenario runs do not pollute or modify the primary 500 student dataset.
          </div>
        </section>

        {/* Right: Step-by-Step Progressive Pipeline Execution */}
        <section className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <h3>Progressive Verification Execution</h3>
              <p>Step {currentStep} of 8 · Observation of decision rules</p>
            </div>
            {currentStep === 8 ? (
              <span className={`badge ${scenario.stages[6].tone}`}>FINAL: {scenario.stages[6].status}</span>
            ) : currentStep > 0 ? (
              <span className="badge blue"><i /> PROCESSING STAGE {currentStep}</span>
            ) : (
              <span className="badge neutral">READY</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {scenario.stages.map((stage, i) => {
              const stepNumber = i + 1;
              const isPast = currentStep >= stepNumber;
              const isCurrent = currentStep === stepNumber;

              return (
                <div
                  key={stage.name}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isCurrent ? 'var(--blue-light)' : isPast ? 'var(--bg-subtle)' : '#FFFFFF',
                    border: isCurrent ? '1.5px solid var(--blue-primary)' : isPast ? '1px solid var(--border-light)' : '1px dashed var(--border-light)',
                    opacity: isPast ? 1 : 0.45,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isPast ? (stage.tone === 'green' ? 'var(--teal-500)' : stage.tone === 'red' ? 'var(--red-500)' : 'var(--amber-500)') : 'var(--border-color)',
                      color: '#FFFFFF',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    {isPast ? <Check size={14} /> : stepNumber}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{stage.name}</strong>
                      {isPast && <span className={`badge ${stage.tone}`}>{stage.status}</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: isPast ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
                      {isPast ? stage.note : 'Awaiting upstream pipeline execution...'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
