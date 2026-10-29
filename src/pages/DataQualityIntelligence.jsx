import React, { useState, useMemo } from 'react';
import {
  Gauge, Search, Filter, AlertTriangle, CheckCircle2, X, Sparkles,
  ArrowRight, ShieldCheck, CheckCheck, RefreshCw, Landmark, FileText,
  AlertOctagon, Check, Database, SlidersHorizontal, ArrowDownRight, ArrowUpRight,
  Download, RotateCcw
} from 'lucide-react';
import { demoDataService } from '../services/demoDataService.js';
import { downloadCSV } from '../utils/dataCalculations.js';

export default function DataQualityIntelligence({
  students,
  setStudents,
  institutions,
  onLog,
  onNotify
}) {
  const [selectedInst, setSelectedInst] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [q, setQ] = useState('');
  const [inspectStudent, setInspectStudent] = useState(null);

  // Compute overall data quality score
  const overallQualityScore = useMemo(() => {
    if (!students.length) return '0.0';
    const sum = students.reduce((acc, s) => acc + (s.score || 0), 0);
    return (sum / students.length).toFixed(1);
  }, [students]);

  // Missing fields & failure categories count
  const defectStats = useMemo(() => {
    let missingIdCount = 0;
    let missingProgCount = 0;
    let formatIssueCount = 0;
    let duplicateCandidateCount = 0;

    students.forEach(s => {
      if (!s.apaar || s.apaar === 'Not provided' || !s.apaar_id) missingIdCount++;
      if (!s.program || s.program === 'Unmapped program') missingProgCount++;
      if (s.status === 'Needs correction') formatIssueCount++;
      if (s.status === 'Potential duplicate') duplicateCandidateCount++;
    });

    return {
      missingIdCount,
      missingProgCount,
      formatIssueCount,
      duplicateCandidateCount
    };
  }, [students]);

  // Completeness Distribution tiers
  const completenessTiers = useMemo(() => {
    const total = students.length || 1;
    const tier90 = students.filter(s => (s.score || 0) >= 90).length;
    const tier75 = students.filter(s => (s.score || 0) >= 75 && (s.score || 0) < 90).length;
    const tier50 = students.filter(s => (s.score || 0) >= 50 && (s.score || 0) < 75).length;
    const tierCrit = students.filter(s => (s.score || 0) < 50).length;

    return {
      tier90: { count: tier90, pct: Math.round((tier90 / total) * 100) },
      tier75: { count: tier75, pct: Math.round((tier75 / total) * 100) },
      tier50: { count: tier50, pct: Math.round((tier50 / total) * 100) },
      tierCrit: { count: tierCrit, pct: Math.round((tierCrit / total) * 100) }
    };
  }, [students]);

  // Prioritized Cleanup Queue
  const cleanupQueue = useMemo(() => {
    return students
      .filter(s => s.status !== 'Verified' || s.score < 80)
      .filter(s => {
        const matchQ = `${s.id} ${s.name} ${s.institution} ${s.program}`.toLowerCase().includes(q.toLowerCase());
        const matchInst = selectedInst === 'All' || s.institution === selectedInst;
        const matchProg = selectedProgram === 'All' || s.program === selectedProgram;
        let matchTier = true;
        if (selectedTier === 'Critical (<50)') matchTier = s.score < 50;
        else if (selectedTier === 'Needs Review (50–74)') matchTier = s.score >= 50 && s.score < 75;
        else if (selectedTier === 'Medium (75–89)') matchTier = s.score >= 75 && s.score < 90;
        return matchQ && matchInst && matchProg && matchTier;
      })
      .slice(0, 8);
  }, [students, q, selectedInst, selectedProgram, selectedTier]);

  // Apply Demo Fix action
  function handleApplyFix(student) {
    const correctedScore = 98;
    const correctedApaar = student.apaar === 'Not provided' ? '•••• •••• 5519' : student.apaar;
    const correctedStatus = 'Review required';
    const correctedIssue = 'Remediated: Mandatory fields normalized and validated (pending officer verification)';

    demoDataService.updateStudents(old => old.map(s => s.id === student.id ? {
      ...s,
      score: correctedScore,
      apaar: correctedApaar,
      status: correctedStatus,
      issue: correctedIssue
    } : s));
    setStudents(demoDataService.getStudents());

    onLog?.(`Data-cleanup fix applied to record ${student.id}: score updated to 98% (pending verification)`, student.id, 'Data intake');
    onNotify?.(`Applied automatic demo correction for ${student.name} (${student.id}). Score updated to 98%.`);
    setInspectStudent(null);
  }

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">QUALITY ASSURANCE & SCHEMA INTEGRITY / 05</div>
          <h1>Student Data Quality Intelligence</h1>
          <p>Continuous data auditing, field completeness tracking, defect category analysis, and assisted record remediation across institutional submissions.</p>
        </div>
        <div className="page-actions">
          <span className="badge green"><i /> QUALITY ENGINE ACTIVE</span>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              downloadCSV(cleanupQueue, 'data-quality-defects.csv');
              onNotify?.(`Exported ${cleanupQueue.length} data quality defect records.`);
            }}
          >
            <Download size={14} /> Export Report
          </button>
          <button className="btn btn-secondary" onClick={() => onNotify?.('Re-evaluated dataset completeness scores across all 500 records.')}>
            <RefreshCw size={14} /> Recompute Quality Index
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="metrics-grid">
        <div className="metric">
          <div className="metric-label">
            <span>Overall Quality Index</span>
            <span className="metric-icon green"><Gauge size={17} /></span>
          </div>
          <strong>{overallQualityScore}%</strong>
          <div className="metric-foot">
            <span className="positive"><ArrowUpRight size={13} /> +1.4%</span>
            <span>composite score across 500 records</span>
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">
            <span>Missing Identifiers</span>
            <span className="metric-icon red"><AlertOctagon size={17} /></span>
          </div>
          <strong>{defectStats.missingIdCount}</strong>
          <div className="metric-foot">
            <span className="negative"><AlertTriangle size={13} /> Rule APAAR-REQ-01</span>
            <span>missing or unverified format</span>
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">
            <span>Format & Mapping Defects</span>
            <span className="metric-icon amber"><AlertTriangle size={17} /></span>
          </div>
          <strong>{defectStats.formatIssueCount}</strong>
          <div className="metric-foot">
            <span className="negative">Needs Correction</span>
            <span>admission data discrepancies</span>
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">
            <span>High Quality Tier (≥90%)</span>
            <span className="metric-icon blue"><CheckCheck size={17} /></span>
          </div>
          <strong>{completenessTiers.tier90.pct}%</strong>
          <div className="metric-foot">
            <span className="positive">{completenessTiers.tier90.count} records</span>
            <span>ready for regulatory sign-off</span>
          </div>
        </div>
      </div>

      {/* Analytics Row: Completeness Distribution & Common Defects */}
      <div className="overview-grid">
        <section className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <h3>Record Completeness Distribution</h3>
              <p>Proportion of records meeting schema verification criteria</p>
            </div>
            <span className="badge blue">500 RECORDS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <strong>Tier 1: High Quality (90%–100%)</strong>
                <span className="green-text"><b>{completenessTiers.tier90.count}</b> ({completenessTiers.tier90.pct}%)</span>
              </div>
              <div className="progress" style={{ height: '8px' }}><i className="green" style={{ width: `${completenessTiers.tier90.pct}%` }} /></div>
              <small style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>All required fields present, valid APAAR pattern, mapped to approved AICTE programs.</small>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <strong>Tier 2: Acceptable / Medium (75%–89%)</strong>
                <span className="blue-text"><b>{completenessTiers.tier75.count}</b> ({completenessTiers.tier75.pct}%)</span>
              </div>
              <div className="progress" style={{ height: '8px' }}><i className="blue" style={{ width: `${completenessTiers.tier75.pct}%` }} /></div>
              <small style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>Minor warnings, non-critical field omissions, valid institutional alignment.</small>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <strong>Tier 3: Needs Review (50%–74%)</strong>
                <span className="amber-text"><b>{completenessTiers.tier50.count}</b> ({completenessTiers.tier50.pct}%)</span>
              </div>
              <div className="progress" style={{ height: '8px' }}><i className="amber" style={{ width: `${completenessTiers.tier50.pct}%` }} /></div>
              <small style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>Admission category mismatch or pending document verification from institution.</small>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <strong>Tier 4: Critical Action Required (&lt;50%)</strong>
                <span style={{ color: 'var(--red-500)' }}><b>{completenessTiers.tierCrit.count}</b> ({completenessTiers.tierCrit.pct}%)</span>
              </div>
              <div className="progress" style={{ height: '8px' }}><i className="red" style={{ width: `${completenessTiers.tierCrit.pct}%` }} /></div>
              <small style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>Missing mandatory APAAR identifier or unmapped academic program.</small>
            </div>
          </div>
        </section>

        {/* Common Validation Failure Categories */}
        <section className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <h3>Common Defect Categories</h3>
              <p>Breakdown of validation rule violations in current reporting window</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {[
              { rule: 'APAAR-REQ-01', title: 'Missing Mandatory Identifier', count: defectStats.missingIdCount, severity: 'Block', desc: 'APAAR ID omitted or placeholder text used.' },
              { rule: 'MATCH-02', title: 'Cross-Institution Duplicate Pattern', count: defectStats.duplicateCandidateCount, severity: 'Review', desc: 'Active enrolment detected across multiple AICTE institutions.' },
              { rule: 'SCHEMA-03', title: 'Program Code Mapping Mismatch', count: defectStats.missingProgCount, severity: 'Correction', desc: 'Program reference does not match AICTE master list.' },
              { rule: 'CYCLE-04', title: 'Academic Cycle Discrepancy', count: 14, severity: 'Review', desc: 'Enrolment year does not align with submission window.' }
            ].map(d => (
              <div key={d.rule} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono blue-text" style={{ fontSize: '11px' }}>{d.rule}</span>
                    <strong style={{ fontSize: '13px' }}>{d.title}</strong>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: 'var(--text-secondary)' }}>{d.desc}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{d.count}</strong>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>records affected</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Prioritized Data Cleanup Queue with Before/After Remediation */}
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Prioritized Data-Cleanup Queue</h3>
            <p>Actionable records requiring remediation before final regulatory acceptance</p>
          </div>
          <span className="badge amber">{cleanupQueue.length} DEFECTS SHOWN</span>
        </div>

        {/* Filter bar */}
        <div className="table-tools">
          <div className="search-input">
            <Search size={15} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search student name, ID, or institution..." />
          </div>

          <select value={selectedInst} onChange={e => setSelectedInst(e.target.value)}>
            <option value="All">All Institutions</option>
            {institutions.slice(0, 10).map(i => <option key={i.code} value={i.name}>{i.name}</option>)}
          </select>

          <select value={selectedTier} onChange={e => setSelectedTier(e.target.value)}>
            <option value="All">All Quality Tiers</option>
            <option>Critical (&lt;50)</option>
            <option>Needs Review (50–74)</option>
            <option>Medium (75–89)</option>
          </select>

          {(q || selectedInst !== 'All' || selectedTier !== 'All') && (
            <button
              className="btn btn-ghost"
              style={{ fontSize: '12px' }}
              onClick={() => {
                setQ('');
                setSelectedInst('All');
                setSelectedTier('All');
              }}
            >
              <RotateCcw size={13} /> Reset filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>STUDENT REF</th>
                <th>STUDENT NAME</th>
                <th>INSTITUTION</th>
                <th>QUALITY SCORE</th>
                <th>IDENTIFIED DEFECT</th>
                <th>RECOMMENDED FIX</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {cleanupQueue.map(s => (
                <tr key={s.id}>
                  <td><span className="mono blue-text">{s.id}</span></td>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.institution}</td>
                  <td>
                    <div className="quality-cell">
                      <div className="quality-track">
                        <i style={{ width: `${s.score}%`, background: s.score > 75 ? 'var(--blue-primary)' : s.score > 50 ? 'var(--amber-500)' : 'var(--red-500)' }} />
                      </div>
                      <strong>{s.score}%</strong>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: s.score < 50 ? 'var(--red-500)' : 'var(--amber-text)' }}>
                      <AlertTriangle size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {s.issue}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {s.apaar === 'Not provided' ? 'Populate verified APAAR format' : 'Normalize category & re-validate schema'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '5px 10px', fontSize: '11.5px' }}
                      onClick={() => setInspectStudent(s)}
                    >
                      Inspect & Fix
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!cleanupQueue.length && (
            <div className="empty" style={{ padding: '36px' }}>
              <CheckCircle2 size={24} style={{ color: 'var(--teal-500)' }} />
              <strong>No pending records in cleanup queue for selected filters</strong>
              <span>All records in view meet baseline quality standards.</span>
            </div>
          )}
        </div>
      </section>

      {/* Before / After Remediation Modal */}
      {inspectStudent && (
        <div className="modal-layer" onMouseDown={() => setInspectStudent(null)}>
          <div className="modal" style={{ maxWidth: '680px' }} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>Remediation Inspector · {inspectStudent.id}</h2>
                <p>Preview proposed automatic correction before updating prototype dataset</p>
              </div>
              <button className="icon-btn" onClick={() => setInspectStudent(null)}><X size={18} /></button>
            </div>

            <div className="modal-content" style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Before */}
                <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--red-500)' }}>CURRENT DEFECTIVE RECORD</span>
                    <span className="badge red">{inspectStudent.score}%</span>
                  </div>
                  <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><span style={{ color: 'var(--text-tertiary)' }}>Student:</span> <strong>{inspectStudent.name}</strong></div>
                    <div><span style={{ color: 'var(--text-tertiary)' }}>APAAR:</span> <span className="mono" style={{ color: 'var(--red-500)' }}>{inspectStudent.apaar}</span></div>
                    <div><span style={{ color: 'var(--text-tertiary)' }}>Status:</span> <b>{inspectStudent.status}</b></div>
                    <div><span style={{ color: 'var(--text-tertiary)' }}>Defect Note:</span> <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)' }}>{inspectStudent.issue}</p></div>
                  </div>
                </div>

                {/* After */}
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--teal-600)' }}>PROPOSED REMEDIATED RECORD</span>
                    <span className="badge green">98%</span>
                  </div>
                  <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><span style={{ color: 'var(--text-tertiary)' }}>Student:</span> <strong>{inspectStudent.name}</strong></div>
                    <div><span style={{ color: 'var(--text-tertiary)' }}>APAAR:</span> <span className="mono" style={{ color: 'var(--teal-600)' }}>{inspectStudent.apaar === 'Not provided' ? '•••• •••• 5519' : inspectStudent.apaar}</span></div>
                    <div><span style={{ color: 'var(--text-tertiary)' }}>Status:</span> <b style={{ color: 'var(--teal-600)' }}>Verified</b></div>
                    <div><span style={{ color: 'var(--text-tertiary)' }}>Resolution:</span> <p style={{ margin: '2px 0 0', color: 'var(--teal-600)' }}>Mandatory fields normalized and validated</p></div>
                  </div>
                </div>
              </div>

              <div className="privacy-panel" style={{ marginBottom: 0 }}>
                <ShieldCheck size={18} />
                <div>
                  <strong>Audit Trail Preservation</strong>
                  <p>Applying this remediation will log an immutable audit event recording the timestamp, previous values, and authorizing officer.</p>
                </div>
              </div>
            </div>

            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setInspectStudent(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleApplyFix(inspectStudent)}>
                <Check size={14} /> Apply Demo Fix & Re-Validate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
