import React, { useState, useMemo } from 'react';
import {
  GitCompare, Search, Filter, AlertTriangle, CheckCircle2, X, MessageSquareText,
  Sparkles, AlertCircle, ShieldAlert, Check, RefreshCw, ChevronRight, UserCheck,
  Eye, FileText, ArrowRight, ShieldCheck, History, ExternalLink, SlidersHorizontal,
  Download, RotateCcw
} from 'lucide-react';
import { demoDataService } from '../services/demoDataService.js';
import { downloadCSV } from '../utils/dataCalculations.js';

function Badge({ children, tone = 'neutral', dot = true }) {
  return <span className={`badge ${tone}`}>{dot && <i />}{children}</span>;
}

export default function IdentityResolutionLab({
  matches,
  setMatches,
  students,
  institutions,
  cases,
  setCases,
  onLog,
  onNotify,
  onViewStudent
}) {
  const [q, setQ] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('All');
  const [institutionFilter, setInstitutionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [discrepancyFilter, setDiscrepancyFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(matches[0]?.id || 'M-00201');
  const [reviewNotes, setReviewNotes] = useState('');
  const [showEvidenceMeters, setShowEvidenceMeters] = useState(true);

  // Filter candidate queue
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const matchQ = `${m.id} ${m.name} ${m.primaryName || ''} ${m.institution} ${m.primaryInstitution || ''} ${m.ref} ${m.primaryId || ''}`.toLowerCase().includes(q.toLowerCase());
      
      const conf = m.confidence || parseInt(m.match) || 75;
      let matchConf = true;
      if (confidenceFilter === 'High (85%+)') matchConf = conf >= 85;
      else if (confidenceFilter === 'Medium (70–84%)') matchConf = conf >= 70 && conf < 85;
      else if (confidenceFilter === 'Low (<70%)') matchConf = conf < 70;

      let matchInst = true;
      if (institutionFilter !== 'All') {
        matchInst = m.institution === institutionFilter || m.primaryInstitution === institutionFilter;
      }

      let matchStatus = true;
      if (statusFilter !== 'All') {
        matchStatus = (m.status || 'Open for review') === statusFilter;
      }

      let matchDiscrepancy = true;
      if (discrepancyFilter !== 'All') {
        if (discrepancyFilter === 'Masked ID match') matchDiscrepancy = (m.reason || '').toLowerCase().includes('identifier');
        else if (discrepancyFilter === 'Name similarity') matchDiscrepancy = (m.reason || '').toLowerCase().includes('name');
        else if (discrepancyFilter === 'Dual active enrolment') matchDiscrepancy = (m.reason || '').toLowerCase().includes('enrolment');
      }

      return matchQ && matchConf && matchInst && matchStatus && matchDiscrepancy;
    });
  }, [matches, q, confidenceFilter, institutionFilter, statusFilter, discrepancyFilter]);

  const activeMatch = useMemo(() => {
    return matches.find(m => m.id === selectedId) || filteredMatches[0] || matches[0];
  }, [matches, selectedId, filteredMatches]);

  // Retrieve underlying student records for full side-by-side details
  const primaryRecord = useMemo(() => {
    if (!activeMatch) return null;
    return students.find(s => s.id === activeMatch.primaryId) || {
      id: activeMatch.primaryId || 'APA-24084',
      name: activeMatch.primaryName || activeMatch.name,
      institution: activeMatch.primaryInstitution || 'Eastern Technical College',
      program: 'B.E. Computer Science & Engineering',
      year: '2026–27',
      apaar: '•••• •••• 4821',
      category: 'Regular Admission',
      status: 'Verified',
      score: 96
    };
  }, [students, activeMatch]);

  const candidateRecord = useMemo(() => {
    if (!activeMatch) return null;
    return students.find(s => s.id === activeMatch.ref) || {
      id: activeMatch.ref || 'APA-11802',
      name: activeMatch.name,
      institution: activeMatch.institution,
      program: 'B.E. Information Technology',
      year: '2026–27',
      apaar: activeMatch.confidence > 80 ? '•••• •••• 4821' : '•••• •••• 9912',
      category: 'Regular Admission',
      status: activeMatch.status === 'Confirmed conflict' ? 'Potential duplicate' : 'Review required',
      score: 64
    };
  }, [students, activeMatch]);

  // Review Decision Handlers
  function handleConfirmConflict() {
    if (!activeMatch) return;
    const note = reviewNotes.trim() || 'Confirmed duplicate conflict after reviewing cross-institution evidence.';
    demoDataService.updateMatches(old => old.map(m => m.id === activeMatch.id ? {
      ...m,
      status: 'Confirmed conflict',
      reviewHistory: [
        ...(m.reviewHistory || []),
        { action: 'Conflict Confirmed', officer: 'Regulatory Officer', date: 'Just now', note }
      ]
    } : m));
    setMatches(demoDataService.getMatches());
    onLog?.(`Identity conflict confirmed for candidate pair ${activeMatch.id}`, activeMatch.id, 'Case action');
    onNotify?.(`Match ${activeMatch.id} marked as Confirmed Duplicate Conflict.`);
    setReviewNotes('');
  }

  function handleMarkNotDuplicate() {
    if (!activeMatch) return;
    const note = reviewNotes.trim() || 'Dismissed: Confirmed distinct individuals despite similarity.';
    demoDataService.updateMatches(old => old.map(m => m.id === activeMatch.id ? {
      ...m,
      status: 'Dismissed / Not a duplicate',
      reviewHistory: [
        ...(m.reviewHistory || []),
        { action: 'Dismissed as False Positive', officer: 'Regulatory Officer', date: 'Just now', note }
      ]
    } : m));
    setMatches(demoDataService.getMatches());
    onLog?.(`Match ${activeMatch.id} dismissed as distinct individuals`, activeMatch.id, 'Case action');
    onNotify?.(`Match ${activeMatch.id} dismissed (distinct individuals).`);
    setReviewNotes('');
  }

  function handleRequestClarification() {
    if (!activeMatch) return;
    const note = reviewNotes.trim() || 'Requested institution clarification for dual enrolment verification.';
    const newCaseId = `CASE-${2100 + cases.length}`;
    const newCase = {
      id: newCaseId,
      student_id: activeMatch.ref || activeMatch.primaryId,
      title: `Identity clarification: ${activeMatch.name} (${activeMatch.primaryId} / ${activeMatch.ref})`,
      person: activeMatch.name,
      institution: activeMatch.primaryInstitution || activeMatch.institution,
      severity: activeMatch.risk || 'High',
      confidence: activeMatch.confidence || 88,
      age: 'Just now',
      status: 'Waiting on institution',
      type: 'Identity conflict',
      evidence: [
        `Primary record: ${primaryRecord?.id} (${primaryRecord?.institution})`,
        `Candidate record: ${candidateRecord?.id} (${candidateRecord?.institution})`,
        activeMatch.reason || 'Masked identifier pattern match across different institutions',
        `Reviewer note: ${note}`
      ],
      recommendation: 'Request authorized withdrawal or transfer certificate from candidate institution before closing.'
    };

    demoDataService.updateCases(old => [newCase, ...old]);
    setCases(demoDataService.getCases());

    demoDataService.updateMatches(old => old.map(m => m.id === activeMatch.id ? {
      ...m,
      status: 'Clarification requested',
      caseId: newCaseId,
      reviewHistory: [
        ...(m.reviewHistory || []),
        { action: `Clarification Case ${newCaseId} Created`, officer: 'Regulatory Officer', date: 'Just now', note }
      ]
    } : m));
    setMatches(demoDataService.getMatches());

    onLog?.(`Created clarification case ${newCaseId} for candidate ${activeMatch.id}`, newCaseId, 'Case action');
    onNotify?.(`Clarification request case ${newCaseId} created and dispatched to Case Desk.`);
    setReviewNotes('');
  }

  const confidenceTier = useMemo(() => {
    const score = activeMatch?.confidence || 85;
    if (score >= 85) return { tier: 'High Similarity', tone: 'red' };
    if (score >= 70) return { tier: 'Uncertain / Moderate', tone: 'amber' };
    return { tier: 'Low Similarity', tone: 'blue' };
  }, [activeMatch]);

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">ENTITY RESOLUTION ENGINE / 04</div>
          <h1>Smart Identity Resolution Lab</h1>
          <p>Multi-factor candidate detection, field-by-field evidence comparison, explainable similarity scores, and human-in-the-loop conflict resolution.</p>
        </div>
        <div className="page-actions">
          <span className="badge violet"><i /> HUMAN-IN-THE-LOOP CONTROL</span>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              downloadCSV(filteredMatches, 'identity-candidates.csv');
              onNotify?.(`Exported ${filteredMatches.length} identity candidate records.`);
            }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-secondary" onClick={() => onNotify?.('Identity Resolution engine synchronized · 120 candidate pairs active.')}>
            <RefreshCw size={14} /> Re-run Duplicate Scan
          </button>
        </div>
      </div>

      {/* Overview Banner */}
      <div className="matching-banner">
        <div className="matching-banner-icon"><GitCompare size={23} /></div>
        <div>
          <strong>Transparent Candidate Matching, Not Automatic Merging</strong>
          <p>Similarity signals prioritize potential conflicts for human evaluation. No records are automatically merged or rejected based on similarity scores alone.</p>
        </div>
        <Badge tone="violet">{matches.length} CANDIDATES IN POOL</Badge>
      </div>

      {/* Main Workspace Layout */}
      <div className="matching-grid">
        {/* Left Column: Filterable Candidate Queue */}
        <section className="panel" style={{ overflow: 'hidden' }}>
          <div className="panel-head">
            <div>
              <h3>Candidate Queue ({filteredMatches.length})</h3>
              <p>Ranked by similarity confidence score</p>
            </div>
            <SlidersHorizontal size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>

          {/* Search & Filters */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="search-input" style={{ width: '100%' }}>
              <Search size={15} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search candidate, student name, ID..." />
              {q && <button onClick={() => setQ('')}><X size={14} /></button>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              <select value={confidenceFilter} onChange={e => setConfidenceFilter(e.target.value)} style={{ fontSize: '11.5px', padding: '6px' }}>
                <option>All Confidences</option>
                <option>High (85%+)</option>
                <option>Medium (70–84%)</option>
                <option>Low (&lt;70%)</option>
              </select>

              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ fontSize: '11.5px', padding: '6px' }}>
                <option value="All">All Statuses</option>
                <option>Open for review</option>
                <option>Clarification requested</option>
                <option>Confirmed conflict</option>
                <option>Dismissed / Not a duplicate</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              <select value={institutionFilter} onChange={e => setInstitutionFilter(e.target.value)} style={{ fontSize: '11.5px', padding: '6px' }}>
                <option value="All">All Institutions</option>
                {institutions.slice(0, 10).map(i => <option key={i.code} value={i.name}>{i.name}</option>)}
              </select>

              <select value={discrepancyFilter} onChange={e => setDiscrepancyFilter(e.target.value)} style={{ fontSize: '11.5px', padding: '6px' }}>
                <option value="All">All Discrepancies</option>
                <option>Masked ID match</option>
                <option>Name similarity</option>
                <option>Dual active enrolment</option>
              </select>
            </div>

            {(q || confidenceFilter !== 'All' || statusFilter !== 'All' || institutionFilter !== 'All' || discrepancyFilter !== 'All') && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                  onClick={() => {
                    setQ('');
                    setConfidenceFilter('All');
                    setStatusFilter('All');
                    setInstitutionFilter('All');
                    setDiscrepancyFilter('All');
                  }}
                >
                  <RotateCcw size={11} /> Reset filters
                </button>
              </div>
            )}
          </div>

          {/* Candidate List */}
          <div className="candidate-list" style={{ maxHeight: '580px', overflowY: 'auto', padding: '10px' }}>
            {filteredMatches.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 16px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 6px', fontWeight: 600 }}>No candidate pairs match filters</p>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Try resetting confidence or discrepancy filters</span>
              </div>
            ) : filteredMatches.map(m => {
              const score = m.confidence || parseInt(m.match) || 75;
              const isSelected = activeMatch?.id === m.id;
              return (
                <button
                  key={m.id}
                  className={isSelected ? 'active' : ''}
                  onClick={() => setSelectedId(m.id)}
                  style={{ position: 'relative' }}
                >
                  <div className="candidate-avatar">{m.name.split(' ').map(x => x[0]).slice(0, 2).join('')}</div>
                  <div className="candidate-main">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="mono" style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>{m.id}</span>
                      <Badge tone={m.status === 'Confirmed conflict' ? 'red' : m.status === 'Clarification requested' ? 'amber' : 'neutral'}>
                        {m.status || 'Open'}
                      </Badge>
                    </div>
                    <strong>{m.name}</strong>
                    <span>{m.institution}</span>
                    <small>{m.primaryId} ↔ {m.ref}</small>
                  </div>
                  <div className="candidate-score">
                    <strong>{score}%</strong>
                    <Badge tone={score >= 85 ? 'red' : score >= 70 ? 'amber' : 'blue'}>
                      {score >= 85 ? 'High' : score >= 70 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                </button>
              );
            })}

            {!filteredMatches.length && (
              <div className="empty" style={{ padding: '36px 12px' }}>
                <Search size={20} />
                <strong>No candidates match filters</strong>
                <span>Try resetting search or confidence filters.</span>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Detailed Side-by-Side Comparison & Manual Review Panel */}
        {activeMatch ? (
          <div className="panel match-detail" style={{ padding: '24px' }}>
            {/* Header */}
            <div className="match-detail-top">
              <div>
                <div className="eyebrow">CASE {activeMatch.id} · CANDIDATE DUPLICATE PAIR</div>
                <h2>{activeMatch.name}</h2>
                <p>Cross-institution pair: {activeMatch.primaryInstitution} ↔ {activeMatch.institution}</p>
              </div>
              <Badge tone={confidenceTier.tone}>{confidenceTier.tier}</Badge>
            </div>

            {/* Explainable Score Meter */}
            <div className="match-confidence">
              <div>
                <span>Demonstration Match Confidence Score</span>
                <strong>{activeMatch.confidence || activeMatch.match || 88}%</strong>
              </div>
              <div className="progress" style={{ height: '10px' }}>
                <i className={confidenceTier.tone} style={{ width: `${activeMatch.confidence || 88}%` }} />
              </div>
              <small>Deterministic similarity metric based on permitted identifiers, normalized name tokens, and active academic period overlap.</small>
            </div>

            {/* Side-by-Side Field Comparison Panel */}
            <div style={{ margin: '20px 0 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Field-Level Side-by-Side Comparison
              </div>
              <div className="compare-records">
                {/* Record A */}
                <div className="compare-card">
                  <div className="compare-card-head">
                    <span>PRIMARY RECORD A</span>
                    <Badge tone="blue">Record A</Badge>
                  </div>
                  <strong>{primaryRecord?.name}</strong>
                  <span>{primaryRecord?.institution}</span>
                  <div>
                    <small>Internal Student Ref</small>
                    <b className="mono blue-text">{primaryRecord?.id}</b>
                  </div>
                  <div>
                    <small>Masked APAAR ID</small>
                    <b className="mono">{primaryRecord?.apaar}</b>
                  </div>
                  <div>
                    <small>Academic Program</small>
                    <b>{primaryRecord?.program}</b>
                  </div>
                  <div>
                    <small>Academic Cycle</small>
                    <b>{primaryRecord?.year}</b>
                  </div>
                  <div>
                    <small>Enrolment Status</small>
                    <b style={{ color: 'var(--teal-600)' }}>Active · Reported</b>
                  </div>
                </div>

                {/* Compare Marker */}
                <div className="compare-center">
                  <GitCompare size={22} />
                  <span>COMPARE</span>
                </div>

                {/* Record B */}
                <div className="compare-card">
                  <div className="compare-card-head">
                    <span>CANDIDATE RECORD B</span>
                    <Badge tone="amber">Record B</Badge>
                  </div>
                  <strong>{candidateRecord?.name}</strong>
                  <span>{candidateRecord?.institution}</span>
                  <div>
                    <small>Internal Student Ref</small>
                    <b className="mono blue-text">{candidateRecord?.id}</b>
                  </div>
                  <div>
                    <small>Masked APAAR ID</small>
                    <b className="mono">{candidateRecord?.apaar}</b>
                  </div>
                  <div>
                    <small>Academic Program</small>
                    <b>{candidateRecord?.program}</b>
                  </div>
                  <div>
                    <small>Academic Cycle</small>
                    <b>{candidateRecord?.year}</b>
                  </div>
                  <div>
                    <small>Enrolment Status</small>
                    <b style={{ color: activeMatch.status === 'Confirmed conflict' ? 'var(--red-500)' : 'var(--amber-500)' }}>
                      {activeMatch.status === 'Confirmed conflict' ? 'Flagged Duplicate' : 'Active · Reported'}
                    </b>
                  </div>
                </div>
              </div>
            </div>

            {/* Field-Level Difference Indicators */}
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '10px' }}>
                Field Similarity & Discrepancy Evidence
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--teal-500)' }} />
                  <div>
                    <strong>Masked Identifier:</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Matching suffix 4821</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--teal-500)' }} />
                  <div>
                    <strong>Academic Year:</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>2026–27 (Active Overlap)</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <AlertTriangle size={16} style={{ color: 'var(--red-500)' }} />
                  <div>
                    <strong>Institution Clash:</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Two distinct AICTE nodes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why was this match suggested? Accordion */}
            <button className="evidence-toggle" onClick={() => setShowEvidenceMeters(!showEvidenceMeters)}>
              <span><Sparkles size={15} /> Explainable Evidence Breakdown</span>
              <ChevronRight size={15} style={{ transform: showEvidenceMeters ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>

            {showEvidenceMeters && (
              <div className="match-evidence" style={{ marginBottom: '20px' }}>
                <div>
                  <span>Identifier Pattern</span>
                  <strong>98% Similarity</strong>
                  <div className="progress" style={{ height: '6px' }}><i className="violet" style={{ width: '98%' }} /></div>
                </div>
                <div>
                  <span>Name Token Similarity</span>
                  <strong>91% Similarity</strong>
                  <div className="progress" style={{ height: '6px' }}><i className="violet" style={{ width: '91%' }} /></div>
                </div>
                <div>
                  <span>Academic Period Overlap</span>
                  <strong>88% Overlap</strong>
                  <div className="progress" style={{ height: '6px' }}><i className="violet" style={{ width: '88%' }} /></div>
                </div>
                <div style={{ gridColumn: '1 / -1', marginTop: '6px' }}>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#55449A', lineHeight: 1.5 }}>
                    <AlertCircle size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {activeMatch.reason}. Confirm transfer, migration or withdrawal status before taking regulatory action.
                  </p>
                </div>
              </div>
            )}

            {/* Decision History (Audit Trail for this candidate) */}
            {activeMatch.reviewHistory && activeMatch.reviewHistory.length > 0 && (
              <div style={{ marginBottom: '20px', padding: '14px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <History size={14} /> Candidate Review Decision History
                </div>
                {activeMatch.reviewHistory.map((h, i) => (
                  <div key={i} style={{ fontSize: '12px', padding: '6px 0', borderBottom: i < activeMatch.reviewHistory.length - 1 ? '1px solid var(--border-light)' : '0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <strong>{h.action}</strong>
                      <span className="mono" style={{ fontSize: '11px' }}>{h.date}</span>
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '11.5px', marginTop: '2px' }}>
                      Officer: {h.officer} — "{h.note}"
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Manual-Review Decision Panel */}
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  <UserCheck size={15} style={{ display: 'inline', marginRight: '6px', color: 'var(--blue-primary)' }} />
                  Officer Decision & Review Rationale
                </div>
                <Badge tone={activeMatch.status === 'Confirmed conflict' ? 'red' : activeMatch.status === 'Clarification requested' ? 'amber' : 'neutral'}>
                  Current: {activeMatch.status || 'Pending Review'}
                </Badge>
              </div>

              <textarea
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="Enter regulatory review notes, rationale or investigation instructions..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12.5px',
                  marginBottom: '12px',
                  fontFamily: 'inherit',
                  outline: 0
                }}
              />

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleRequestClarification}
                  title="Dispatch clarification notice to institution"
                >
                  <MessageSquareText size={14} /> Request Clarification
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleMarkNotDuplicate}
                  title="Dismiss candidate as false positive / distinct students"
                >
                  <X size={14} /> Not a Duplicate (Dismiss)
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmConflict}
                  style={{ background: 'var(--red-500)', borderColor: 'var(--red-500)' }}
                  title="Mark as confirmed duplicate enrollment conflict"
                >
                  <CheckCircle2 size={14} /> Confirm Duplicate Conflict
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="panel empty">No candidate selected.</div>
        )}
      </div>
    </div>
  );
}
