import React, { useState, useMemo } from 'react';
import {
  CloudUpload, Search, Filter, AlertTriangle, CheckCircle2, Clock3, FileSpreadsheet,
  RefreshCw, Check, ArrowRight, ShieldAlert, Landmark, Server, AlertOctagon, BarChart3,
  CalendarDays, ChevronRight, X, Download, RotateCcw
} from 'lucide-react';
import { demoDataService } from '../services/demoDataService.js';
import { downloadCSV } from '../utils/dataCalculations.js';

export default function SubmissionHealthMonitor({
  batches,
  setBatches,
  institutions,
  setPage,
  onLog,
  onNotify
}) {
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || 'SUB-8812');
  const [inspectBatch, setInspectBatch] = useState(null);

  // Totals & Volume Calculations
  const metrics = useMemo(() => {
    const total = batches.length;
    const accepted = batches.filter(b => b.status === 'Accepted').length;
    const review = batches.filter(b => b.status === 'Needs review').length;
    const correction = batches.filter(b => b.status === 'Needs correction').length;
    const totalRows = batches.reduce((acc, b) => acc + (b.rows || 0), 0);
    const passedRows = batches.reduce((acc, b) => acc + (b.passed || 0), 0);
    const flaggedRows = batches.reduce((acc, b) => acc + (b.flagged || 0), 0);
    const passRate = totalRows > 0 ? ((passedRows / totalRows) * 100).toFixed(1) : '97.5';

    return { total, accepted, review, correction, totalRows, passedRows, flaggedRows, passRate };
  }, [batches]);

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      const matchQ = `${b.id} ${b.institution}`.toLowerCase().includes(q.toLowerCase());
      const matchStatus = statusFilter === 'All' || b.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [batches, q, statusFilter]);

  const activeBatch = useMemo(() => {
    return batches.find(b => b.id === selectedBatchId) || filteredBatches[0] || batches[0];
  }, [batches, selectedBatchId, filteredBatches]);

  // Institutions with repeated failures
  const repeatedFailureInstitutions = useMemo(() => {
    const countMap = {};
    batches.forEach(b => {
      if (b.status !== 'Accepted') {
        countMap[b.institution] = (countMap[b.institution] || 0) + 1;
      }
    });
    return Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [batches]);

  // Reprocess Demonstration Action
  function handleReprocess(batch) {
    demoDataService.updateBatches(old => old.map(b => b.id === batch.id ? {
      ...b,
      passed: b.rows,
      flagged: 0,
      status: 'Accepted',
      reprocessedAt: 'Just now'
    } : b));
    setBatches(demoDataService.getBatches());

    onLog?.(`Batch ${batch.id} reprocessed & accepted after automated correction`, batch.id, 'Data intake');
    onNotify?.(`Batch ${batch.id} reprocessed successfully. All ${batch.rows} rows accepted.`);
    setInspectBatch(null);
  }

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">INTAKE PIPELINE & MONITORING / 03</div>
          <h1>Submission Health Monitor</h1>
          <p>Real-time telemetry on institutional batch ingestion, validation pass rates, repeat-failure patterns, and automated reprocessing gates.</p>
        </div>
        <div className="page-actions">
          <span className="badge blue"><i /> INTAKE GATE ACTIVE</span>
          <button className="btn btn-primary" onClick={() => setPage('intake')}>
            <CloudUpload size={14} /> Intake Workspace
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="metrics-grid">
        <div className="metric">
          <div className="metric-label">
            <span>Total Intake Batches</span>
            <span className="metric-icon blue"><FileSpreadsheet size={17} /></span>
          </div>
          <strong>{metrics.total}</strong>
          <div className="metric-foot">
            <span className="positive">{metrics.totalRows.toLocaleString()} rows</span>
            <span>processed in cycle</span>
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">
            <span>Validation Pass Rate</span>
            <span className="metric-icon green"><CheckCircle2 size={17} /></span>
          </div>
          <strong>{metrics.passRate}%</strong>
          <div className="metric-foot">
            <span className="positive">{metrics.passedRows.toLocaleString()} passed</span>
            <span>across all submissions</span>
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">
            <span>Batches Requiring Action</span>
            <span className="metric-icon amber"><AlertTriangle size={17} /></span>
          </div>
          <strong>{metrics.review + metrics.correction}</strong>
          <div className="metric-foot">
            <span className="negative">{metrics.flaggedRows} flagged rows</span>
            <span>need institutional review</span>
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">
            <span>Clean Acceptance</span>
            <span className="metric-icon green"><CheckCircle2 size={17} /></span>
          </div>
          <strong>{metrics.accepted}</strong>
          <div className="metric-foot">
            <span className="positive">{Math.round((metrics.accepted / metrics.total) * 100)}%</span>
            <span>batches ready for archive</span>
          </div>
        </div>
      </div>

      {/* Operational Breakdown Row */}
      <div className="overview-grid">
        {/* Repeat Failure Monitoring */}
        <section className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <h3>Institutions with Repeated Discrepancies</h3>
              <p>Entities requiring targeted regulatory guidance and outreach</p>
            </div>
            <span className="badge amber">ALERT</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {repeatedFailureInstitutions.map((item, idx) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="rule-num">#{idx + 1}</div>
                  <div>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{item.name}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Multiple batches returned for schema correction</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge red">{item.count} Flagged Batches</span>
                </div>
              </div>
            ))}
          </div>

          <div className="readiness-callout" style={{ marginTop: '16px' }}>
            <AlertTriangle size={15} />
            Institutions exceeding 3 consecutive discrepancy batches are scheduled for regional technical assistance.
          </div>
        </section>

        {/* SLA & Processing Timelines */}
        <section className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <h3>Intake Telemetry & SLAs</h3>
              <p>System throughput, validation latency, and compliance status</p>
            </div>
            <span className="badge green">HEALTHY</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: '12.5px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Average Validation Pipeline Latency:</span>
              <strong>1.4 seconds / 1,000 rows</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: '12.5px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Submission Cut-off Window Compliance:</span>
              <strong className="green-text">92.4% On Schedule</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: '12.5px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Active Grace Period Submissions:</span>
              <strong className="amber-text">3 Participating Nodes</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', fontSize: '12.5px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Automated Remediation Engine:</span>
              <span className="badge blue">READY FOR RETRY</span>
            </div>
          </div>
        </section>
      </div>

      {/* Main Batches Workspace */}
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>All Ingestion Batches ({filteredBatches.length})</h3>
            <p>Inspect row-level pass rates, errors, and trigger automated re-processing</p>
          </div>
          <div className="page-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => {
                downloadCSV(filteredBatches, 'submission-health-batches.csv');
                onNotify?.(`Exported ${filteredBatches.length} batch records.`);
              }}
            >
              <Download size={14} /> Export CSV
            </button>
            <button className="btn btn-secondary" onClick={() => onNotify?.('Synced intake queue with central storage.')}>
              <RefreshCw size={14} /> Refresh Queue
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="table-tools">
          <div className="search-input">
            <Search size={15} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search batch ID, institution..." />
          </div>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Ingestion Statuses</option>
            <option>Accepted</option>
            <option>Needs review</option>
            <option>Needs correction</option>
          </select>

          {(q || statusFilter !== 'All') && (
            <button
              className="btn btn-ghost"
              style={{ fontSize: '12px' }}
              onClick={() => {
                setQ('');
                setStatusFilter('All');
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
                <th>BATCH ID</th>
                <th>INSTITUTION</th>
                <th>SUBMISSION TIME</th>
                <th>TOTAL ROWS</th>
                <th>PASSED</th>
                <th>FLAGGED</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map(b => (
                <tr key={b.id}>
                  <td><span className="mono blue-text">{b.id}</span></td>
                  <td><strong>{b.institution}</strong></td>
                  <td className="mono" style={{ fontSize: '11.5px' }}>{b.when}</td>
                  <td>{b.rows}</td>
                  <td className="green-text"><b>{b.passed}</b></td>
                  <td>
                    {b.flagged > 0 ? (
                      <span className="amber-text"><b>{b.flagged}</b></span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)' }}>0</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${b.status === 'Accepted' ? 'green' : 'amber'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                      onClick={() => setInspectBatch(b)}
                    >
                      Inspect Batch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBatches.length === 0 && (
            <div className="empty" style={{ padding: '36px' }}>
              <CheckCircle2 size={24} style={{ color: 'var(--teal-500)' }} />
              <strong>No ingestion batches match current filters</strong>
              <span>Try clearing search term or status selection.</span>
            </div>
          )}
        </div>
      </section>

      {/* Batch Inspector & Reprocess Modal */}
      {inspectBatch && (
        <div className="modal-layer" onMouseDown={() => setInspectBatch(null)}>
          <div className="modal" style={{ maxWidth: '640px' }} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>Batch Telemetry · {inspectBatch.id}</h2>
                <p>{inspectBatch.institution} · Submitted {inspectBatch.when}</p>
              </div>
              <button className="icon-btn" onClick={() => setInspectBatch(null)}><X size={18} /></button>
            </div>

            <div className="modal-content" style={{ padding: '20px' }}>
              <div className="detail-cards" style={{ marginBottom: '16px' }}>
                <div><span>Batch Ref</span><strong className="mono">{inspectBatch.id}</strong></div>
                <div><span>Total Rows</span><strong>{inspectBatch.rows}</strong></div>
                <div><span>Passed Schema</span><strong className="green-text">{inspectBatch.passed}</strong></div>
                <div><span>Flagged Rows</span><strong className="amber-text">{inspectBatch.flagged}</strong></div>
                <div><span>Ingestion Status</span><strong>{inspectBatch.status}</strong></div>
                <div><span>Pass Rate</span><strong>{Math.round((inspectBatch.passed / inspectBatch.rows) * 100)}%</strong></div>
              </div>

              <div className="evidence-box" style={{ marginBottom: '16px' }}>
                <AlertTriangle size={18} />
                <div>
                  <strong>Validation Findings Summary</strong>
                  <p>{inspectBatch.flagged > 0 ? `${inspectBatch.flagged} rows contain schema warnings or missing APAAR identifiers requiring correction.` : 'All rows passed schema completeness, format validation, and reference mapping.'}</p>
                </div>
              </div>

              {inspectBatch.status !== 'Accepted' && (
                <div style={{ background: 'var(--blue-light)', border: '1px solid rgba(79, 124, 255, 0.3)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--blue-primary)', marginBottom: '4px' }}>
                    Automated Reprocessing Demonstration
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0 }}>
                    Execute automated remediation rules to normalize whitespace, validate institution mappings, and accept batch.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setInspectBatch(null)}>Close</button>
              {inspectBatch.status !== 'Accepted' && (
                <button className="btn btn-primary" onClick={() => handleReprocess(inspectBatch)}>
                  <RefreshCw size={14} /> Reprocess & Auto-Correct Batch
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
