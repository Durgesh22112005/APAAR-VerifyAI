import React, { useState, useMemo } from 'react';
import {
  BrainCircuit, Search, Sparkles, AlertTriangle, CheckCircle2, ShieldCheck,
  ShieldAlert, UserCheck, FileSearch, ArrowRight, Activity, GitCompare,
  ListChecks, CircleHelp, ExternalLink, ChevronRight, RefreshCw, BadgeCheck
} from 'lucide-react';

export default function AiDecisionCentre({
  cases,
  students,
  institutions,
  setPage,
  onLog,
  onNotify
}) {
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || 'CASE-2084');
  const [q, setQ] = useState('');
  const [activeTab, setActiveTab] = useState('explanation'); // explanation, rules, assistant

  const activeCase = useMemo(() => {
    return cases.find(c => c.id === selectedCaseId) || cases[0];
  }, [cases, selectedCaseId]);

  const relatedStudent = useMemo(() => {
    if (!activeCase?.student_id) return null;
    return students.find(s => s.id === activeCase.student_id);
  }, [activeCase, students]);

  // Deriving the primary triggered rule
  const ruleDetails = useMemo(() => {
    if (!activeCase) return null;
    const type = activeCase.type || 'Identity conflict';
    if (type.includes('Identity')) {
      return {
        id: 'MATCH-02',
        name: 'Cross-Institution Duplicate Candidate Match',
        policy: 'AICTE Identity Reconciliation Directive §4.2',
        threshold: 'Similarity Score ≥ 75% with overlapping academic cycle',
        logic: 'Normalized name similarity + masked identifier suffix matching across distinct institutional codes.',
        guardrail: 'No automatic merging or enrollment cancellation without secondary institutional clearance.'
      };
    } else if (type.includes('Reconciliation')) {
      return {
        id: 'REC-03',
        name: 'Summary-to-Detail Row Reconciliation',
        policy: 'Intake Integrity Standard 2026',
        threshold: 'Discrepancy Delta > 0 records between summary and batch rows',
        logic: 'Compares institution header report against count of validated student rows in payload.',
        guardrail: 'Batch is held in provisional state until institution resubmits matching counts.'
      };
    } else if (type.includes('Data quality')) {
      return {
        id: 'APAAR-REQ-01',
        name: 'Mandatory Student Identifier Completeness',
        policy: 'National Academic Depository Regulations',
        threshold: 'Field required for all regular & lateral entry enrollments',
        logic: 'Checks existence and standard 12-digit format of APAAR reference field.',
        guardrail: 'Block submission from entering central repository until field is populated.'
      };
    }
    return {
      id: 'ANOM-04',
      name: 'Unusual Enrolment Surge Monitoring',
      policy: 'Approved Intake Quota Compliance',
      threshold: 'Shift > 20% vs prior cycle baseline',
      logic: 'Compares total intake volume against approved capacity registered with AICTE.',
      guardrail: 'Routes batch for manual officer verification of sanctioned seats.'
    };
  }, [activeCase]);

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">EXPLAINABLE AUDIT INTELLIGENCE / 06</div>
          <h1>Explainable AI Decision Centre</h1>
          <p>Transparent reasoning behind flagged records, rule violation evidence, confidence scoring, and human-in-the-loop decision boundaries.</p>
        </div>
        <div className="page-actions">
          <span className="badge violet"><i /> EXPLAINABLE AI · NO BLACK-BOX</span>
        </div>
      </div>

      {/* Trust & Transparency Banner */}
      <div className="ai-banner">
        <div className="ai-banner-icon"><Sparkles size={24} /></div>
        <div>
          <span>TRANSPARENCY BY DESIGN</span>
          <h2>Every flagged signal answers three regulatory questions.</h2>
          <p>What pattern was detected? What specific evidence and policy rule triggered it? What recommended action should a regulatory officer take?</p>
        </div>
        <div className="ai-principles">
          <span><CheckCircle2 size={14} /> Deterministic Rules</span>
          <span><UserCheck size={14} /> Human Authorized</span>
          <span><ShieldCheck size={14} /> Documented Lineage</span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="matching-grid">
        {/* Left Column: Flagged Case Selector */}
        <section className="panel" style={{ overflow: 'hidden' }}>
          <div className="panel-head">
            <div>
              <h3>Flagged Review Signals ({cases.length})</h3>
              <p>Select a case or exception to inspect reasoning</p>
            </div>
            <FileSearch size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>

          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-light)' }}>
            <div className="search-input" style={{ width: '100%' }}>
              <Search size={15} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter flagged signals by title or ID..." />
            </div>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {cases.filter(c => `${c.id} ${c.title} ${c.institution}`.toLowerCase().includes(q.toLowerCase())).map(c => {
              const isSelected = activeCase?.id === c.id;
              return (
                <button
                  key={c.id}
                  className={`queue-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedCaseId(c.id)}
                  style={{ width: '100%', textAlign: 'left' }}
                >
                  <div className="queue-card-top">
                    <span className="mono blue-text">{c.id}</span>
                    <span className={`badge ${c.severity === 'High' ? 'red' : 'amber'}`}>{c.severity}</span>
                  </div>
                  <strong>{c.title}</strong>
                  <span>{c.institution}</span>
                  <div className="queue-card-bottom">
                    <small>{c.age || 'Recent'}</small>
                    <span style={{ fontSize: '11px', color: 'var(--blue-primary)', fontWeight: 600 }}>{c.confidence || 85}% review confidence</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right Column: Deep Explanation & Policy Rule Inspector */}
        {activeCase ? (
          <div className="panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '16px' }}>
              <div>
                <div className="eyebrow">{activeCase.id} · EXPLAINABLE SIGNAL BREAKDOWN</div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 6px', color: 'var(--text-primary)' }}>{activeCase.title}</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Associated Entity: <strong>{activeCase.person}</strong> · {activeCase.institution}
                </p>
              </div>
              <span className={`badge ${activeCase.severity === 'High' ? 'red' : 'amber'}`}>
                {activeCase.severity} Priority
              </span>
            </div>

            {/* Confidence & Review Score Meter */}
            <div style={{ background: 'var(--violet-light)', border: '1px solid rgba(139, 124, 255, 0.25)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#4B3F72' }}>Demonstration Review Confidence Score</span>
                <strong style={{ fontSize: '18px', color: '#31216B' }}>{activeCase.confidence || 88}%</strong>
              </div>
              <div className="progress" style={{ height: '8px' }}><i className="violet" style={{ width: `${activeCase.confidence || 88}%` }} /></div>
              <small style={{ color: '#55449A', fontSize: '11px', display: 'block', marginTop: '6px' }}>
                Calculated by combining field-level difference weights against policy threshold rules.
              </small>
            </div>

            {/* Findings & Evidence Grid */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                01 / Detected Evidence & Field Findings
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(activeCase.evidence || []).map((ev, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <span className="mono blue-text" style={{ fontSize: '11.5px', fontWeight: 700 }}>#{String(i + 1).padStart(2, '0')}</span>
                    <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.45 }}>{ev}</p>
                    <CheckCircle2 size={15} style={{ color: 'var(--teal-500)', marginLeft: 'auto', flexShrink: 0, marginTop: '2px' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Triggered Rule Logic Inspector */}
            {ruleDetails && (
              <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    02 / Underlying Policy Rule & Threshold Criteria
                  </div>
                  <span className="mono blue-text" style={{ fontSize: '11px', fontWeight: 800 }}>{ruleDetails.id}</span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>{ruleDetails.name}</h4>
                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
                  <div><strong>Governing Directive:</strong> {ruleDetails.policy}</div>
                  <div><strong>Trigger Threshold:</strong> {ruleDetails.threshold}</div>
                  <div><strong>Execution Logic:</strong> {ruleDetails.logic}</div>
                </div>
              </div>
            )}

            {/* Decision Guardrail & Recommended Officer Action */}
            <div className="case-caution" style={{ marginBottom: '20px' }}>
              <ShieldAlert size={18} />
              <div>
                <strong>Mandatory Regulatory Guardrail</strong>
                <p>This decision explanation is produced by deterministic rule evaluation for prototype demonstration. Final regulatory determinations must be confirmed by an authorized human officer.</p>
              </div>
            </div>

            <div className="next-action" style={{ marginBottom: '20px' }}>
              <div><Sparkles size={18} /></div>
              <section>
                <strong>Recommended Next Officer Action</strong>
                <p>{activeCase.recommendation}</p>
                <small>Officer retains full decision authority to resolve, escalate, or request correction.</small>
              </section>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => setPage('cases')}
              >
                Open Case in Review Desk <ArrowRight size={13} />
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setPage('matching')}
              >
                Inspect Identity Matching Lab <GitCompare size={13} />
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setPage('rules')}
              >
                View in Validation Studio <ListChecks size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className="panel empty">No case selected.</div>
        )}
      </div>
    </div>
  );
}
