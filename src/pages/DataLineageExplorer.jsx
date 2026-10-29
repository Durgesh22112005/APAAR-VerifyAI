import React, { useState, useMemo } from 'react';
import {
  Network, Search, CheckCircle2, AlertTriangle, ArrowRight, Clock3,
  Database, CloudUpload, ListChecks, GitCompare, UserCheck, ShieldCheck,
  History, ExternalLink, FileSpreadsheet, Fingerprint
} from 'lucide-react';

export default function DataLineageExplorer({
  students,
  batches,
  cases,
  audit,
  setPage,
  onNotify
}) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 'APA-24081');
  const [q, setQ] = useState('');

  const activeStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const relatedBatch = useMemo(() => {
    return batches.find(b => b.institution === activeStudent?.institution) || batches[0];
  }, [batches, activeStudent]);

  const relatedCase = useMemo(() => {
    return cases.find(c => c.person === activeStudent?.name || c.student_id === activeStudent?.id);
  }, [cases, activeStudent]);

  // Construct the 8-Stage Lifecycle Provenance Timeline
  const lineageStages = useMemo(() => {
    if (!activeStudent) return [];

    const isVerified = activeStudent.status === 'Verified';
    const isConflict = activeStudent.status === 'Potential duplicate';
    const isCorrection = activeStudent.status === 'Needs correction';

    return [
      {
        step: '01',
        name: 'Institution Submission',
        icon: CloudUpload,
        timestamp: activeStudent.enrolledAt ? `${activeStudent.enrolledAt} 09:14:22` : '2026-08-15 09:14:22',
        source: `Institution ERP · ${activeStudent.institution}`,
        result: 'Payload Ingested',
        statusTone: 'green',
        findings: `Received student record inside ingestion envelope with 18 mandatory schema fields.`,
        relatedEntity: activeStudent.institution,
        nextStage: 'Batch Ingestion Gate'
      },
      {
        step: '02',
        name: 'Batch Intake & Deserialization',
        icon: FileSpreadsheet,
        timestamp: '2026-08-15 09:14:28',
        source: `Batch Envelope · ${relatedBatch?.id || 'SUB-8811'}`,
        result: 'CSV Schema Validated',
        statusTone: 'green',
        findings: `Extracted row for ${activeStudent.name}. Headers validated against AICTE 2026 format.`,
        relatedEntity: relatedBatch?.id,
        nextStage: 'Data Normalization Engine'
      },
      {
        step: '03',
        name: 'Data Normalization & Masking',
        icon: Fingerprint,
        timestamp: '2026-08-15 09:14:31',
        source: 'Security Engine Node 01',
        result: 'Identifier Masked',
        statusTone: 'green',
        findings: `Personal identifiers masked to ${activeStudent.apaar}. Field whitespace trimmed and normalized.`,
        relatedEntity: 'Security Service',
        nextStage: 'Validation Rules Engine'
      },
      {
        step: '04',
        name: 'Deterministic Rule Evaluation',
        icon: ListChecks,
        timestamp: '2026-08-15 09:14:35',
        source: 'Policy Rule Matrix v2.0',
        result: isCorrection ? 'Rule APAAR-REQ-01 Triggered' : 'All 7 Checks Passed',
        statusTone: isCorrection ? 'amber' : 'green',
        findings: isCorrection
          ? `Rule APAAR-REQ-01 triggered: Mandatory student identifier missing or non-conforming.`
          : `Checked required fields, program mapping, academic year consistency, and summary reconciliation.`,
        relatedEntity: 'Rule Matrix',
        nextStage: 'Identity Resolution Matching'
      },
      {
        step: '05',
        name: 'Identity Matching & Resolution',
        icon: GitCompare,
        timestamp: '2026-08-15 09:14:40',
        source: 'Mulberry32 Similarity Engine',
        result: isConflict ? 'Potential Candidate Pair Flagged' : 'No Conflict Detected',
        statusTone: isConflict ? 'red' : 'green',
        findings: isConflict
          ? `Cross-institution overlap detected: Matching suffix 4821 with active enrolment in secondary node.`
          : `Candidate comparison against 500 active records confirmed unique enrolment identity.`,
        relatedEntity: isConflict ? 'Candidate Match M-00281' : 'None',
        nextStage: (isConflict || isCorrection) ? 'Officer Review Desk' : 'Verification Vault'
      },
      {
        step: '06',
        name: 'Regulatory Officer Review',
        icon: UserCheck,
        timestamp: (isConflict || isCorrection) ? '2026-08-16 11:20:00' : 'Automated (Skipped)',
        source: 'Regulatory Review Operations',
        result: (isConflict || isCorrection) ? 'Case Dispatched to Desk' : 'Automated Fast-Path',
        statusTone: (isConflict || isCorrection) ? 'amber' : 'green',
        findings: relatedCase
          ? `Assigned to Regulation Bureau under ${relatedCase.id}. Recommended action: ${relatedCase.recommendation}`
          : `No discrepancies detected. Fast-pathed directly to accepted state.`,
        relatedEntity: relatedCase?.id || 'Automated Gate',
        nextStage: 'Final Verification Outcome'
      },
      {
        step: '07',
        name: 'Final Verification Outcome',
        icon: ShieldCheck,
        timestamp: '2026-08-16 11:45:10',
        source: 'Central Student Repository',
        result: `Record Status: ${activeStudent.status}`,
        statusTone: isVerified ? 'green' : isConflict ? 'red' : 'amber',
        findings: `Composite quality score ${activeStudent.score}/100. Status categorized as ${activeStudent.status}.`,
        relatedEntity: activeStudent.id,
        nextStage: 'Immutable Audit Journal'
      },
      {
        step: '08',
        name: 'Immutable Audit Trail',
        icon: History,
        timestamp: audit?.find(a => a.target === activeStudent.id || a.action?.includes(activeStudent.id))?.time 
          ? `Today ${audit.find(a => a.target === activeStudent.id || a.action?.includes(activeStudent.id)).time}` 
          : '2026-10-28 11:45:12',
        source: 'Tamper-Evident Event Ledger',
        result: 'Audit Hash Committed',
        statusTone: 'green',
        findings: audit?.find(a => a.target === activeStudent.id || a.action?.includes(activeStudent.id))
          ? `Journal entry: "${audit.find(a => a.target === activeStudent.id || a.action?.includes(activeStudent.id)).action}" authorized by ${audit.find(a => a.target === activeStudent.id || a.action?.includes(activeStudent.id)).actor}.`
          : `Committed cryptographic event hash to audit journal. Traceable under event reference ${audit?.[0]?.id || 'EVT-10024'}.`,
        relatedEntity: audit?.find(a => a.target === activeStudent.id || a.action?.includes(activeStudent.id))?.id || audit?.[0]?.id || 'EVT-10024',
        nextStage: 'Archive Active'
      }
    ];
  }, [activeStudent, relatedBatch, relatedCase, audit]);

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">AUDITABILITY & PROVENANCE / 07</div>
          <h1>Data Lineage & Provenance Explorer</h1>
          <p>Trace the end-to-end lifecycle, ingestion timestamps, validation decisions, and cryptographic audit records for any synthetic student.</p>
        </div>
        <div className="page-actions">
          <span className="badge green"><i /> PROVENANCE ACTIVE</span>
          <button className="btn btn-secondary" onClick={() => onNotify?.('Lineage graph refreshed for active student record.')}>
            <Network size={14} /> Refresh Lineage Graph
          </button>
        </div>
      </div>

      {/* Student Record Selector Bar */}
      <div className="dashboard-filter-bar">
        <div className="dashboard-filter-group" style={{ flex: 1 }}>
          <label style={{ minWidth: '130px' }}>Select Student Record:</label>
          <div className="search-input" style={{ width: '260px' }}>
            <Search size={14} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter student..." />
          </div>

          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            style={{ maxWidth: '340px' }}
          >
            {students
              .filter(s => `${s.id} ${s.name} ${s.institution}`.toLowerCase().includes(q.toLowerCase()))
              .slice(0, 25)
              .map(s => (
                <option key={s.id} value={s.id}>
                  {s.id} — {s.name} ({s.status})
                </option>
              ))}
          </select>
        </div>

        <div className="dashboard-filter-actions">
          <span className="mono" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            Selected: <b className="blue-text">{activeStudent?.id}</b>
          </span>
        </div>
      </div>

      {/* Active Student Overview Card */}
      {activeStudent && (
        <section className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '16px' }}>
                {activeStudent.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>{activeStudent.name}</h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  {activeStudent.institution} · <span className="mono">{activeStudent.program}</span>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Record Ref</div>
                <strong className="mono blue-text">{activeStudent.id}</strong>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Masked APAAR</div>
                <strong className="mono">{activeStudent.apaar}</strong>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Quality Score</div>
                <strong style={{ color: activeStudent.score > 85 ? 'var(--teal-600)' : 'var(--amber-text)' }}>{activeStudent.score}%</strong>
              </div>
              <span className={`badge ${activeStudent.status === 'Verified' ? 'green' : activeStudent.status === 'Potential duplicate' ? 'red' : 'amber'}`}>
                {activeStudent.status}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Visual Provenance Lineage Timeline */}
      <section className="panel" style={{ padding: '24px' }}>
        <div className="panel-head" style={{ padding: '0 0 20px', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <h3>Lifecycle Provenance Trail (8 Stages)</h3>
            <p>Chronological sequence of data transitions and validation milestones</p>
          </div>
          <span className="badge blue">AUDITABLE LINEAGE</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
          {lineageStages.map((stage, idx) => (
            <div
              key={stage.step}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '18px',
                position: 'relative',
                paddingBottom: idx < lineageStages.length - 1 ? '16px' : '0'
              }}
            >
              {/* Connector Line */}
              {idx < lineageStages.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '20px',
                    top: '42px',
                    bottom: '0',
                    width: '2px',
                    background: 'var(--border-color)',
                    zIndex: 0
                  }}
                />
              )}

              {/* Stage Icon */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: stage.statusTone === 'green' ? 'var(--teal-light)' : stage.statusTone === 'red' ? 'var(--red-light)' : 'var(--amber-light)',
                  color: stage.statusTone === 'green' ? 'var(--teal-600)' : stage.statusTone === 'red' ? 'var(--red-500)' : 'var(--amber-500)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  zIndex: 1,
                  border: '1px solid var(--border-light)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                <stage.icon size={19} />
              </div>

              {/* Stage Details Card */}
              <div
                style={{
                  flex: 1,
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  minWidth: 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono blue-text" style={{ fontSize: '11px', fontWeight: 800 }}>STAGE {stage.step}</span>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{stage.name}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}><Clock3 size={11} style={{ display: 'inline', marginRight: '3px' }} />{stage.timestamp}</span>
                    <span className={`badge ${stage.statusTone}`}>{stage.result}</span>
                  </div>
                </div>

                <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {stage.findings}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-light)', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                  <div>
                    <span>Source Node: </span>
                    <b style={{ color: 'var(--text-primary)' }}>{stage.source}</b>
                  </div>
                  <div>
                    <span>Reference: </span>
                    <b className="mono blue-text">{stage.relatedEntity}</b>
                  </div>
                  <div>
                    <span>Hand-off: </span>
                    <b style={{ color: 'var(--teal-600)' }}>{stage.nextStage}</b>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
