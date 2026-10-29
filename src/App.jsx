import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Activity, AlertOctagon, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BrainCircuit, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, ClipboardCheck, Clock3, CloudUpload, Command, Database, Download, Eye, FileSpreadsheet, FileText, Fingerprint, Gauge, GitCompare, GraduationCap, History, Home, LockKeyhole, Menu, MessageSquareText, MoreHorizontal, Network, Plus, RefreshCw, Search, Send, Settings2, Shield, ShieldAlert, ShieldCheck, SlidersHorizontal, Sparkles, Upload, Users, X, BarChart3, CheckCheck, CircleDot, ScanSearch, AlertCircle, Landmark, ListChecks, ChevronUp, UserCheck, FileSearch, MapPin, Server, BadgeCheck, Filter, LogOut
} from 'lucide-react';
import './styles.css';

import { demoDataService } from './services/demoDataService.js';
import { calculateDashboardMetrics, calculateAdvancedDashboardMetrics, downloadCSV, parseCSV, downloadCSVTemplate, downloadErrorReport } from './utils/dataCalculations.js';

import LoginPortal from './pages/LoginPortal.jsx';
import IdentityResolutionLab from './pages/IdentityResolutionLab.jsx';
import AiDecisionCentre from './pages/AiDecisionCentre.jsx';
import DataQualityIntelligence from './pages/DataQualityIntelligence.jsx';
import SubmissionHealthMonitor from './pages/SubmissionHealthMonitor.jsx';
import DataLineageExplorer from './pages/DataLineageExplorer.jsx';
import VerificationSimulator from './pages/VerificationSimulator.jsx';
import AnomalyObservatory from './pages/AnomalyObservatory.jsx';

const nav = [
  {
    section: 'COMMAND CENTRE',
    items: [
      ['overview', 'Overview', Home],
      ['intake', 'Data intake', CloudUpload],
      ['students', 'Student registry', Users],
      ['matching', 'Identity Resolution Lab', GitCompare],
      ['quality', 'Data Quality Intelligence', BarChart3]
    ]
  },
  {
    section: 'INTELLIGENCE & CONTROL',
    items: [
      ['insights', 'AI Decision Centre', BrainCircuit],
      ['anomalies', 'Anomaly Observatory', ShieldAlert],
      ['cases', 'Risk & case desk', AlertOctagon],
      ['rules', 'Validation studio', SlidersHorizontal]
    ]
  },
  {
    section: 'PIPELINE & PROVENANCE',
    items: [
      ['submissions', 'Submission Health Monitor', Activity],
      ['lineage', 'Data Lineage Explorer', Network],
      ['simulator', 'Verification Simulator', Sparkles]
    ]
  },
  {
    section: 'TRUST & GOVERNANCE',
    items: [
      ['institutions', 'Institution network', Landmark],
      ['verification', 'Verify credentials', BadgeCheck],
      ['reports', 'Analytics & reports', Gauge],
      ['audit', 'Audit trail', History],
      ['settings', 'Access & settings', Settings2]
    ]
  }
];

function cx(...a) { return a.filter(Boolean).join(' '); }
function Badge({ children, tone = 'neutral', dot = true }) { return <span className={`badge ${tone}`}>{dot && <i />}{children}</span>; }
function Btn({ children, icon: Icon, variant = 'secondary', onClick, className = '', ...props }) {
  return <button className={cx('btn', `btn-${variant}`, className)} onClick={onClick} {...props}>{Icon && <Icon size={15} />}{children}</button>;
}
function PageHead({ eyebrow, title, desc, actions }) {
  return <div className="page-head"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{desc}</p></div>{actions && <div className="page-actions">{actions}</div>}</div>;
}
function Panel({ title, sub, action, children, className = '' }) {
  return <section className={cx('panel', className)}><div className="panel-head"><div><h3>{title}</h3>{sub && <p>{sub}</p>}</div>{action}</div>{children}</section>;
}
function Metric({ label, value, change, icon: Icon, tone = 'blue', foot }) {
  return <div className="metric"><div className="metric-label">{label}<span className={`metric-icon ${tone}`}><Icon size={17} /></span></div><strong>{value}</strong><div className="metric-foot">{change && <span className={change.startsWith('-') ? 'negative' : 'positive'}>{change.startsWith('-') ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />} {change.replace('-', '')}</span>}<span>{foot}</span></div></div>;
}
function Progress({ value, tone = 'blue' }) {
  return <div className="progress"><i className={tone} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}
function SectionLabel({ children }) { return <div className="section-label">{children}</div>; }
function Modal({ title, desc, onClose, children, footer }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-layer" onMouseDown={onClose} role="dialog" aria-modal="true">
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {desc && <p>{desc}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        </div>
        <div className="modal-content">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

function PaginationBar({ currentPage, totalPages, onPageChange, totalCount, pageSize, itemName = 'records' }) {
  const start = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, totalCount);
  return (
    <div className="table-bottom">
      <span>Showing {totalCount > 0 ? `${start}–${end}` : '0'} of {totalCount} {itemName} · sensitive IDs masked</span>
      <div className="pagination-controls">
        <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>Previous</button>
        <span className="pagination-info">Page {currentPage} of {totalPages}</span>
        <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</button>
      </div>
      <span className="demo-label">SYNTHETIC DATASET (PHASE 2)</span>
    </div>
  );
}

/* ==========================================================================
   1. OVERVIEW (ADVANCED REGULATORY COMMAND CENTRE DASHBOARD — PHASE 3)
   ========================================================================== */
function Overview({ students, cases, batches, institutions, matches = [], audit = [], setPage, onNotify }) {
  const [selectedInstitution, setSelectedInstitution] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('Current cycle (2026–27)');
  const [selectedTrendPeriod, setSelectedTrendPeriod] = useState('monthly');
  const [hoveredTrend, setHoveredTrend] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [lastUpdated, setLastUpdated] = useState('Just now · 12:30 AM');
  const [refreshing, setRefreshing] = useState(false);

  const metrics = useMemo(() => {
    return calculateAdvancedDashboardMetrics({
      students,
      cases,
      batches,
      institutions,
      matches,
      audit,
      selectedInstitution,
      selectedDateRange,
      selectedTrendPeriod
    });
  }, [students, cases, batches, institutions, matches, audit, selectedInstitution, selectedDateRange, selectedTrendPeriod]);

  function handleRefresh() {
    setRefreshing(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTimeout(() => {
      setLastUpdated(`Just now · ${timeStr}`);
      setRefreshing(false);
      onNotify?.('Regulatory Command Centre data refreshed · Deterministic seed synchronized.');
    }, 350);
  }

  function handleExportBriefing() {
    const rows = [
      {
        metric: 'Total Student Records in Scope',
        value: metrics.kpis.totalStudents,
        institution_filter: selectedInstitution,
        date_range: selectedDateRange
      },
      {
        metric: 'Verified Students',
        value: metrics.kpis.verifiedStudents,
        pct: `${metrics.distribution.verified.pct}%`,
        institution_filter: selectedInstitution
      },
      {
        metric: 'Pending Verification / Needs Review',
        value: metrics.kpis.pendingStudents,
        pct: `${metrics.distribution.needsCorrection.pct + metrics.distribution.reviewRequired.pct}%`,
        institution_filter: selectedInstitution
      },
      {
        metric: 'Identity Conflict Candidates',
        value: metrics.kpis.identityConflicts,
        institution_filter: selectedInstitution
      },
      {
        metric: 'Monitored Institutions',
        value: metrics.kpis.institutionsMonitored,
        institution_filter: selectedInstitution
      },
      {
        metric: 'Average Data Quality Score',
        value: `${metrics.kpis.averageQualityScore}%`,
        institution_filter: selectedInstitution
      },
      {
        metric: 'Open Regulatory Cases',
        value: metrics.kpis.openCases,
        high_priority: metrics.kpis.highPriorityCases,
        institution_filter: selectedInstitution
      },
      {
        metric: 'Validation Batch Success Rate',
        value: `${metrics.kpis.validationSuccessRate}%`,
        institution_filter: selectedInstitution
      }
    ];
    downloadCSV(rows, `regulatory-briefing-${selectedInstitution.toLowerCase().replace(/[^a-z0-9]/g, '-')}.csv`);
    onNotify?.('Command Centre briefing report downloaded.');
  }

  const filteredQueue = useMemo(() => {
    if (priorityFilter === 'All') return metrics.priorityQueue;
    if (priorityFilter === 'Critical') return metrics.priorityQueue.filter(i => i.severity === 'Critical' || i.severity === 'High');
    if (priorityFilter === 'Identity') return metrics.priorityQueue.filter(i => i.category === 'Identity Conflict' || i.category === 'Potential Duplicate');
    if (priorityFilter === 'Failed Batches') return metrics.priorityQueue.filter(i => i.category === 'Failed Batch');
    return metrics.priorityQueue;
  }, [metrics.priorityQueue, priorityFilter]);

  return (
    <div className="page-stack">
      {/* 1. Page Header & Live Status */}
      <PageHead
        eyebrow="REGULATORY COMMAND CENTRE / 01"
        title="Regulatory Command Centre"
        desc="A central operational command centre for monitoring APAAR student verification, institutional data compliance, identity reconciliation, and risk triage across AICTE-approved institutions."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge amber"><i /> SYNTHETIC DEMO ENVIRONMENT · DETERMINISTIC DATA</span>
          </div>
        }
      />

      {/* 2. Interactive Filter Controls & Quick Actions */}
      <div className="dashboard-filter-bar">
        <div className="dashboard-filter-group">
          <label>
            <Landmark size={14} /> Institution Filter:
            <select value={selectedInstitution} onChange={e => setSelectedInstitution(e.target.value)}>
              <option value="All">All Institutions ({institutions.length})</option>
              {institutions.map(inst => (
                <option key={inst.code} value={inst.code}>{inst.name}</option>
              ))}
            </select>
          </label>

          <label>
            <CalendarDays size={14} /> Cycle / Window:
            <select value={selectedDateRange} onChange={e => setSelectedDateRange(e.target.value)}>
              <option>Current cycle (2026–27)</option>
              <option>Last 90 days</option>
              <option>Last 30 days</option>
            </select>
          </label>
        </div>

        <div className="dashboard-filter-actions">
          <span className="last-updated-text">
            <Clock3 size={13} /> {lastUpdated}
          </span>
          <Btn icon={RefreshCw} onClick={handleRefresh} title="Synchronize and re-evaluate dataset">
            <span className={refreshing ? 'spin-icon' : ''}>Refresh</span>
          </Btn>
          <Btn icon={FileText} onClick={() => window.print()} title="Print or save official regulatory briefing">
            Print Briefing
          </Btn>
          <Btn variant="primary" icon={Download} onClick={handleExportBriefing} title="Export current dashboard summary to CSV">
            Export Briefing
          </Btn>
        </div>
      </div>

      {/* Quick Action Navigation Chips */}
      <div className="quick-actions-bar">
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-tertiary)', marginRight: '4px' }}>QUICK ACTIONS:</span>
        <button className="quick-action-chip" onClick={() => setPage('intake')}><CloudUpload size={13} /> Submit Batch</button>
        <button className="quick-action-chip" onClick={() => setPage('matching')}><GitCompare size={13} /> Investigate Matches ({matches.length})</button>
        <button className="quick-action-chip" onClick={() => setPage('cases')}><ShieldAlert size={13} /> Case Action Desk ({metrics.kpis.openCases} Open)</button>
        <button className="quick-action-chip" onClick={() => setPage('verification')}><BadgeCheck size={13} /> Verify Credential</button>
        <button className="quick-action-chip" onClick={() => setPage('audit')}><History size={13} /> View Audit Journal</button>
      </div>

      {/* Empty State Guard if Filter yields no records */}
      {metrics.kpis.totalStudents === 0 ? (
        <section className="panel empty" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Landmark size={36} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
          <h3>No records match the selected institution filter</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Select another institution or reset the filter to view full network operations.</p>
          <Btn variant="primary" onClick={() => setSelectedInstitution('All')}>Reset to All Institutions</Btn>
        </section>
      ) : (
        <>
          {/* 3. Top 8 KPI Cards (2 rows of 4) */}
          <div className="metrics-grid">
            {/* Card 1 */}
            <div
              className="metric metric-clickable"
              onClick={() => setPage('students')}
              title="Click to view all student records in the Central Registry"
            >
              <div className="metric-label">
                <span>Total Student Records</span>
                <span className="metric-icon blue"><Users size={17} /></span>
              </div>
              <strong>{metrics.kpis.totalStudents.toLocaleString()}</strong>
              <div className="metric-foot">
                <span className="positive"><ArrowUpRight size={13} /> +8.4%</span>
                <span>active synthetic pool</span>
                <ChevronRight size={14} className="metric-nav-hint" />
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="metric metric-clickable"
              onClick={() => setPage('students')}
              title="Click to view verified student records"
            >
              <div className="metric-label">
                <span>Verified Students</span>
                <span className="metric-icon green"><CheckCircle2 size={17} /></span>
              </div>
              <strong>{metrics.kpis.verifiedStudents.toLocaleString()}</strong>
              <div className="metric-foot">
                <span className="positive"><Check size={13} /> {metrics.distribution.verified.pct}%</span>
                <span>passed all schema & identity rules</span>
                <ChevronRight size={14} className="metric-nav-hint" />
              </div>
            </div>

            {/* Card 3 */}
            <div
              className="metric metric-clickable"
              onClick={() => setPage('students')}
              title="Click to review pending student records"
            >
              <div className="metric-label">
                <span>Pending Verification</span>
                <span className="metric-icon amber"><Clock3 size={17} /></span>
              </div>
              <strong>{metrics.kpis.pendingStudents.toLocaleString()}</strong>
              <div className="metric-foot">
                <span className="negative"><AlertTriangle size={13} /> {metrics.distribution.needsCorrection.pct + metrics.distribution.reviewRequired.pct}%</span>
                <span>awaiting correction / review</span>
                <ChevronRight size={14} className="metric-nav-hint" />
              </div>
            </div>

            {/* Card 4 */}
            <div
              className="metric metric-clickable"
              onClick={() => setPage('matching')}
              title="Click to open the Identity Matching Lab"
            >
              <div className="metric-label">
                <span>Identity Conflicts</span>
                <span className="metric-icon red"><GitCompare size={17} /></span>
              </div>
              <strong>{metrics.kpis.identityConflicts.toLocaleString()}</strong>
              <div className="metric-foot">
                <span className="negative"><AlertOctagon size={13} /> {metrics.kpis.identityConflicts}</span>
                <span>cross-institution candidates</span>
                <ChevronRight size={14} className="metric-nav-hint" />
              </div>
            </div>

            {/* Card 5 */}
            <div
              className="metric metric-clickable"
              onClick={() => setPage('institutions')}
              title="Click to view participating technical institutions"
            >
              <div className="metric-label">
                <span>Institutions Monitored</span>
                <span className="metric-icon violet"><Landmark size={17} /></span>
              </div>
              <strong>{metrics.kpis.institutionsMonitored}</strong>
              <div className="metric-foot">
                <span className="positive"><Check size={13} /> {metrics.submissionHealth.healthTiers[0].count}</span>
                <span>compliant in network</span>
                <ChevronRight size={14} className="metric-nav-hint" />
              </div>
            </div>

            {/* Card 6 */}
            <div
              className="metric metric-clickable"
              onClick={() => setPage('rules')}
              title="Click to view Validation Rules and quality scoring criteria"
            >
              <div className="metric-label">
                <span>Data Quality Score</span>
                <span className="metric-icon blue"><Gauge size={17} /></span>
              </div>
              <strong>{metrics.kpis.averageQualityScore}%</strong>
              <div className="metric-foot">
                <span className="positive"><ArrowUpRight size={13} /> +1.8%</span>
                <span>weighted composite index</span>
                <ChevronRight size={14} className="metric-nav-hint" />
              </div>
            </div>

            {/* Card 7 */}
            <div
              className="metric metric-clickable"
              onClick={() => setPage('cases')}
              title="Click to open the Regulatory Case Desk"
            >
              <div className="metric-label">
                <span>Open Regulatory Cases</span>
                <span className="metric-icon amber"><ShieldAlert size={17} /></span>
              </div>
              <strong>{metrics.kpis.openCases}</strong>
              <div className="metric-foot">
                <span className="negative"><AlertTriangle size={13} /> {metrics.kpis.highPriorityCases} high priority</span>
                <span>awaiting officer review</span>
                <ChevronRight size={14} className="metric-nav-hint" />
              </div>
            </div>

            {/* Card 8 */}
            <div
              className="metric metric-clickable"
              onClick={() => setPage('intake')}
              title="Click to inspect Validation Batches in Data Intake"
            >
              <div className="metric-label">
                <span>Validation Success Rate</span>
                <span className="metric-icon green"><CheckCheck size={17} /></span>
              </div>
              <strong>{metrics.kpis.validationSuccessRate}%</strong>
              <div className="metric-foot">
                <span className="positive"><ArrowUpRight size={13} /> +2.1%</span>
                <span>across {metrics.submissionHealth.totalBatches} intake batches</span>
                <ChevronRight size={14} className="metric-nav-hint" />
              </div>
            </div>
          </div>

          {/* 4. Verification Analytics (Trend Chart & Status Donut / Quality Breakdown) */}
          <div className="overview-grid">
            {/* Chart A: Verification Trend */}
            <Panel
              title="Verification trend & batch intake activity"
              sub="Chronological distribution of submitted vs validated records across reporting windows"
              action={
                <div className="seg-btn-group">
                  <button
                    className={`seg-btn ${selectedTrendPeriod === 'monthly' ? 'active' : ''}`}
                    onClick={() => setSelectedTrendPeriod('monthly')}
                  >
                    Monthly (2026–27)
                  </button>
                  <button
                    className={`seg-btn ${selectedTrendPeriod === 'weekly' ? 'active' : ''}`}
                    onClick={() => setSelectedTrendPeriod('weekly')}
                  >
                    Weekly (Recent)
                  </button>
                </div>
              }
            >
              <div className="chart-legend">
                <span><i className="legend-indigo" />Submitted Volume</span>
                <span><i className="legend-mint" />Passed Validation</span>
              </div>

              <div className="big-chart">
                <div className="axis-labels">
                  <span>140</span>
                  <span>105</span>
                  <span>70</span>
                  <span>35</span>
                  <span>0</span>
                </div>
                <div className="chart-field">
                  <div className="chart-grid">{Array.from({ length: 5 }, (_, i) => <i key={i} />)}</div>
                  <div className="chart-bars">
                    {metrics.trend.map((d, i) => (
                      <div
                        className="chart-column chart-column-interactive"
                        key={d.period}
                        onMouseEnter={() => setHoveredTrend(i)}
                        onMouseLeave={() => setHoveredTrend(null)}
                      >
                        <div className="bar-pair">
                          <i className="bar-submit" style={{ height: `${Math.min(100, Math.round((d.total / 140) * 100))}%` }} />
                          <i className="bar-pass" style={{ height: `${Math.min(100, Math.round((d.verified / 140) * 100))}%` }} />
                        </div>
                        <span>{d.period}</span>

                        {hoveredTrend === i && (
                          <div className="chart-tooltip-hover">
                            <strong>{d.period} Reporting Window</strong>
                            <div><span>Total:</span> <b>{d.total}</b></div>
                            <div><span>Verified:</span> <b style={{ color: 'var(--teal-500)' }}>{d.verified}</b></div>
                            <div><span>Pending:</span> <b style={{ color: 'var(--amber-500)' }}>{d.pending}</b></div>
                            <div><span>Flagged:</span> <b style={{ color: 'var(--red-500)' }}>{d.flagged}</b></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="chart-bottom">
                <span><strong>{metrics.kpis.totalStudents.toLocaleString()}</strong> active student records tracked</span>
                <span className="positive"><ArrowUpRight size={13} /> 100% deterministic synthetic records</span>
              </div>
            </Panel>

            {/* Chart B: Verification Status Distribution & Quality Tiers */}
            <Panel
              title="Verification status & data quality tiers"
              sub="Derived distribution across active student records"
              action={
                <button className="text-link" onClick={() => setPage('students')}>
                  View registry <ArrowRight size={13} />
                </button>
              }
            >
              <div className="readiness" style={{ paddingBottom: '12px' }}>
                <div
                  className="ring"
                  style={{
                    background: `conic-gradient(var(--teal-500) 0% ${metrics.distribution.verified.pct}%, var(--amber-500) ${metrics.distribution.verified.pct}% ${metrics.distribution.verified.pct + metrics.distribution.needsCorrection.pct}%, var(--violet-500) ${metrics.distribution.verified.pct + metrics.distribution.needsCorrection.pct}% ${metrics.distribution.verified.pct + metrics.distribution.needsCorrection.pct + metrics.distribution.reviewRequired.pct}%, var(--red-500) ${metrics.distribution.verified.pct + metrics.distribution.needsCorrection.pct + metrics.distribution.reviewRequired.pct}% 100%)`
                  }}
                >
                  <div>
                    <strong>{metrics.distribution.verified.pct}%</strong>
                    <span>verified</span>
                  </div>
                </div>

                <div className="readiness-list">
                  <div>
                    <i className="dot ready" />
                    <span>Verified</span>
                    <strong>{metrics.distribution.verified.count} ({metrics.distribution.verified.pct}%)</strong>
                  </div>
                  <div>
                    <i className="dot correction" />
                    <span>Needs correction</span>
                    <strong>{metrics.distribution.needsCorrection.count} ({metrics.distribution.needsCorrection.pct}%)</strong>
                  </div>
                  <div>
                    <i className="dot" style={{ background: 'var(--violet-500)' }} />
                    <span>Review required</span>
                    <strong>{metrics.distribution.reviewRequired.count} ({metrics.distribution.reviewRequired.pct}%)</strong>
                  </div>
                  <div>
                    <i className="dot review" />
                    <span>Potential duplicate</span>
                    <strong>{metrics.distribution.potentialDuplicate.count} ({metrics.distribution.potentialDuplicate.pct}%)</strong>
                  </div>
                </div>
              </div>

              {/* Data Quality Breakdown (4 Tiers) */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px', marginTop: '4px' }}>
                <div style={{ padding: '0 20px 8px', fontSize: '11.5px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Data Quality Tiers Breakdown
                </div>
                <div className="quality-tiers-list">
                  <div className="quality-tier-row">
                    <strong>High (Score ≥ 90)</strong>
                    <Progress value={metrics.qualityBreakdown.high.pct} tone="green" />
                    <span>{metrics.qualityBreakdown.high.count} ({metrics.qualityBreakdown.high.pct}%)</span>
                  </div>
                  <div className="quality-tier-row">
                    <strong>Medium (75–89)</strong>
                    <Progress value={metrics.qualityBreakdown.medium.pct} tone="blue" />
                    <span>{metrics.qualityBreakdown.medium.count} ({metrics.qualityBreakdown.medium.pct}%)</span>
                  </div>
                  <div className="quality-tier-row">
                    <strong>Needs Review (50–74)</strong>
                    <Progress value={metrics.qualityBreakdown.needsImprovement.pct} tone="amber" />
                    <span>{metrics.qualityBreakdown.needsImprovement.count} ({metrics.qualityBreakdown.needsImprovement.pct}%)</span>
                  </div>
                  <div className="quality-tier-row">
                    <strong>Critical (&lt; 50)</strong>
                    <Progress value={metrics.qualityBreakdown.critical.pct} tone="red" />
                    <span>{metrics.qualityBreakdown.critical.count} ({metrics.qualityBreakdown.critical.pct}%)</span>
                  </div>
                </div>
                <div style={{ padding: '0 20px 14px', fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CircleHelp size={13} />
                  <span>Scores reflect schema completeness, APAAR format compliance, and institutional cross-referencing.</span>
                </div>
              </div>
            </Panel>
          </div>

          {/* 5. End-to-End Verification Pipeline (6 Stages) */}
          <Panel
            title="End-to-end verification operating pipeline"
            sub="Demonstration workflow tracking records from institutional upload through automated validation, matching, and human review."
            action={<span className="live-status"><i /> WORKFLOW ACTIVE</span>}
          >
            <div className="pipeline pipeline-6">
              {[
                { n: '01', icon: CloudUpload, title: 'Institution Submission', sub: 'Batch file intake', tag: `${metrics.submissionHealth.totalBatches} batches`, target: 'intake', tone: 'blue' },
                { n: '02', icon: ListChecks, title: 'Validation Gate', sub: 'Schema & policy rules', tag: `${metrics.kpis.validationSuccessRate}% pass`, target: 'rules', tone: 'green' },
                { n: '03', icon: GitCompare, title: 'Identity Matching', sub: 'Cross-institution compare', tag: `${metrics.kpis.identityConflicts} candidates`, target: 'matching', tone: 'violet' },
                { n: '04', icon: ShieldAlert, title: 'Risk & Triage', sub: 'Anomaly & signal detection', tag: `${metrics.kpis.openCases + metrics.kpis.resolvedCases} cases created`, target: 'cases', tone: 'amber' },
                { n: '05', icon: UserCheck, title: 'Officer Review Desk', sub: 'Human-in-the-loop audit', tag: `${metrics.kpis.openCases} cases pending`, target: 'cases', tone: 'red' },
                { n: '06', icon: Database, title: 'Accepted Vault', sub: 'Tamper-evident archive', tag: `${audit.length} audit logs`, target: 'audit', tone: 'green' }
              ].map(s => (
                <div
                  className="pipeline-step clickable"
                  key={s.n}
                  onClick={() => setPage(s.target)}
                  title={`Click to open ${s.title}`}
                >
                  <div className="pipeline-number">{s.n}</div>
                  <div className="pipeline-icon" style={{ background: `var(--${s.tone}-light)`, color: `var(--${s.tone}-500)` }}>
                    <s.icon size={19} />
                  </div>
                  <strong>{s.title}</strong>
                  <span>{s.sub}</span>
                  <em>{s.tag}</em>
                </div>
              ))}
            </div>
          </Panel>

          {/* 6. Institution Performance Table */}
          <Panel
            title="Institution performance & verification coverage"
            sub="Top institutions ranked by composite data quality index and reporting readiness"
            action={
              <button className="text-link" onClick={() => setPage('institutions')}>
                View all {institutions.length} institutions <ArrowRight size={13} />
              </button>
            }
          >
            <div className="table-scroll">
              <table className="institution-rank-table">
                <thead>
                  <tr>
                    <th>INSTITUTION</th>
                    <th>LOCATION</th>
                    <th>STUDENTS</th>
                    <th>VERIFICATION COVERAGE</th>
                    <th>DATA QUALITY</th>
                    <th>PENDING CASES</th>
                    <th>STATUS</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.institutionRankings.slice(0, 5).map(inst => (
                    <tr key={inst.code}>
                      <td>
                        <div className="table-institution">
                          <strong>{inst.name}</strong>
                          <span className="mono blue-text">{inst.code}</span>
                        </div>
                      </td>
                      <td>{inst.city}</td>
                      <td>{inst.studentCount.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px' }}>
                          <Progress value={inst.coveragePct} tone={inst.coveragePct > 85 ? 'green' : 'amber'} />
                          <strong style={{ fontSize: '12px' }}>{inst.coveragePct}%</strong>
                        </div>
                      </td>
                      <td>
                        <div className="quality-cell">
                          <strong style={{ color: inst.qualityScore > 90 ? 'var(--teal-600)' : 'var(--amber-text)' }}>{inst.qualityScore}%</strong>
                        </div>
                      </td>
                      <td>
                        {inst.pendingCases > 0 ? (
                          <Badge tone="amber">{inst.pendingCases} pending</Badge>
                        ) : (
                          <span className="green-text" style={{ fontSize: '12px' }}>0 cases</span>
                        )}
                      </td>
                      <td>
                        <Badge tone={inst.status === 'Healthy' ? 'green' : inst.status === 'Review required' ? 'red' : 'amber'}>
                          {inst.status}
                        </Badge>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                          onClick={() => setSelectedInstitution(inst.code)}
                          title="Filter entire dashboard to this institution"
                        >
                          Filter Dashboard
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* 7. Priority Action Queue & Actionable Platform Insights */}
          <div className="overview-grid">
            {/* Left: Priority Action Queue */}
            <Panel
              title="Priority action queue"
              sub="Urgent items requiring officer review, ordered by risk severity"
              action={
                <button className="text-link" onClick={() => setPage('cases')}>
                  Open case desk <ArrowRight size={13} />
                </button>
              }
            >
              <div className="queue-filter-chips">
                {['All', 'Critical', 'Identity', 'Failed Batches'].map(f => (
                  <button
                    key={f}
                    className={`queue-chip ${priorityFilter === f ? 'active' : ''}`}
                    onClick={() => setPriorityFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="priority-list">
                {filteredQueue.map(item => (
                  <div className="priority-row" key={item.id} style={{ alignItems: 'flex-start' }}>
                    <span className={`priority-mark ${item.severity === 'Critical' ? 'high' : item.severity === 'High' ? 'medium' : 'low'}`}>
                      <AlertTriangle size={16} />
                    </span>
                    <div className="priority-main">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="mono" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{item.id}</span>
                        <Badge tone={item.severity === 'Critical' ? 'red' : item.severity === 'High' ? 'amber' : 'blue'}>
                          {item.severity}
                        </Badge>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{item.category}</span>
                      </div>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                      <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        <Sparkles size={12} style={{ color: 'var(--blue-primary)', display: 'inline', marginRight: '4px' }} />
                        {item.action}
                      </p>
                    </div>
                    <Btn
                      variant="secondary"
                      style={{ padding: '6px 12px', fontSize: '11.5px', flexShrink: 0 }}
                      onClick={() => setPage(item.targetPage)}
                    >
                      Investigate <ArrowRight size={12} />
                    </Btn>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Right: Actionable Platform Insights */}
            <Panel
              title="Platform intelligence & actionable insights"
              sub="Deterministic operational insights derived from the active synthetic dataset"
              action={<Badge tone="violet">DEMO INSIGHTS</Badge>}
            >
              <div className="insights-deck">
                {metrics.platformInsights.map(ins => (
                  <div className={`insight-card ${ins.tone}`} key={ins.id}>
                    <div className={`insight-icon ${ins.tone}`}>
                      {ins.tone === 'red' ? <Fingerprint size={18} /> : ins.tone === 'amber' ? <AlertTriangle size={18} /> : <GitCompare size={18} />}
                    </div>
                    <div className="insight-body">
                      <h4>{ins.title}</h4>
                      <p><strong>Finding:</strong> {ins.finding}</p>
                      <p><strong>Evidence:</strong> {ins.evidence}</p>
                      <div className="insight-meta">
                        <span><strong>Impact:</strong> {ins.impact}</span>
                        <button className="insight-btn" onClick={() => setPage(ins.targetPage)}>
                          {ins.action} <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* 8. Recent Operations: Recent Cases Table & Audit Trail Stream */}
          <div className="overview-grid bottom-overview">
            {/* Left: Recent Cases Table */}
            <Panel
              title="Recent regulatory cases"
              sub="Active exceptions and review signals pending officer evaluation"
              action={
                <button className="text-link" onClick={() => setPage('cases')}>
                  View all {cases.length} cases <ArrowRight size={13} />
                </button>
              }
            >
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>CASE</th>
                      <th>TITLE & PERSON</th>
                      <th>INSTITUTION</th>
                      <th>PRIORITY</th>
                      <th>STATUS</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recentCases.map(c => (
                      <tr key={c.id}>
                        <td><span className="mono blue-text">{c.id}</span></td>
                        <td>
                          <div>
                            <strong>{c.title}</strong>
                            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{c.person}</div>
                          </div>
                        </td>
                        <td><span style={{ fontSize: '12px' }}>{c.institution}</span></td>
                        <td>
                          <Badge tone={c.severity === 'High' ? 'red' : c.severity === 'Medium' ? 'amber' : 'blue'}>
                            {c.severity}
                          </Badge>
                        </td>
                        <td>
                          <Badge tone={c.status === 'Resolved' ? 'green' : c.status === 'Waiting on institution' ? 'amber' : 'neutral'}>
                            {c.status}
                          </Badge>
                        </td>
                        <td>
                          <button
                            className="icon-btn"
                            onClick={() => setPage('cases')}
                            title="Inspect case details"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            {/* Right: Audit Trail Stream & Submission Health */}
            <Panel
              title="Audit journal & intake pulse"
              sub="Traceable system decision events and institutional submission health"
              action={
                <button className="text-link" onClick={() => setPage('audit')}>
                  View audit log <ArrowRight size={13} />
                </button>
              }
            >
              <div style={{ padding: '16px 20px 10px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Institution Submission Health Tiers
                </div>
                <div className="health-rows" style={{ padding: 0 }}>
                  {metrics.submissionHealth.healthTiers.map(tier => (
                    <div className="health-row" key={tier.name} style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                        <span>{tier.name}</span>
                        <strong>{tier.count} institutions ({tier.pct}%)</strong>
                      </div>
                      <Progress value={tier.pct} tone={tier.tone} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="activity-stream">
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Latest System Activity
                </div>
                {metrics.recentAudit.map(a => (
                  <div className="activity-row" key={a.id}>
                    <div className="activity-info">
                      <History size={15} style={{ color: 'var(--blue-primary)', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <strong>{a.action}</strong>
                        <span style={{ display: 'block' }}>Target: {a.target} · {a.actor}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="activity-time">{a.time}</span>
                      <Badge tone={a.type === 'Case action' ? 'violet' : a.type === 'Data intake' ? 'blue' : 'neutral'}>
                        {a.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

/* ==========================================================================
   2. STUDENTS PAGE (STUDENT REGISTRY)
   ========================================================================== */
function StudentsPage({ students, setStudents, matches = [], cases = [], setCases, batches = [], onLog, onNavigate, onNotify }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All records');
  const [sortBy, setSortBy] = useState('score_desc');
  const [pageNumber, setPageNumber] = useState(1);
  const [picked, setPicked] = useState(null);
  const [newForm, setNewForm] = useState({
    name: '',
    id: '',
    apaar: '',
    institution: 'Delhi Technological University',
    program: 'B.Tech Computer Science and Engineering',
    category: 'Regular Admission',
    year: '2026–27'
  });
  const [formError, setFormError] = useState('');
  const pageSize = 15;

  const filtered = useMemo(() => {
    let result = students.filter(s => {
      const matchQ = `${s.id} ${s.name} ${s.institution} ${s.program} ${s.apaar}`.toLowerCase().includes(q.toLowerCase());
      const matchF = filter === 'All records' || s.status === filter;
      return matchQ && matchF;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'score_desc') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'score_asc') return (a.score || 0) - (b.score || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'id') return a.id.localeCompare(b.id);
      return 0;
    });

    return result;
  }, [students, q, filter, sortBy]);

  useEffect(() => {
    setPageNumber(1);
  }, [q, filter, sortBy]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageNumber, pageSize]);


  const verifiedCount = useMemo(() => students.filter(s => s.status === 'Verified').length, [students]);
  const reviewCount = useMemo(() => students.filter(s => s.status !== 'Verified').length, [students]);

  function markStudentReviewed(studentId) {
    demoDataService.updateStudents(old => old.map(s => s.id === studentId ? { ...s, status: 'Verified', score: 100, issue: 'Reviewed & verified by officer' } : s));
    setStudents(demoDataService.getStudents());
    onLog?.(`Student record ${studentId} marked reviewed`, studentId, 'Data operations');
    onNotify?.(`Student ${studentId} verified by officer.`);
    setPicked(null);
  }

  const relatedMatch = useMemo(() => {
    if (!picked || picked.new) return null;
    return matches.find(m => m.ref === picked.id || m.primaryId === picked.id || m.candidateId === picked.id || m.name?.toLowerCase() === picked.name?.toLowerCase());
  }, [picked, matches]);

  const relatedCase = useMemo(() => {
    if (!picked || picked.new) return null;
    return cases.find(c => c.student_id === picked.id || c.person?.toLowerCase() === picked.name?.toLowerCase());
  }, [picked, cases]);

  const relatedBatch = useMemo(() => {
    if (!picked || picked.new) return null;
    return batches.find(b => b.institution === picked.institution || b.id === picked.batchRef) || batches[0];
  }, [picked, batches]);

  function handleFlagForInvestigation(student) {
    if (relatedCase) {
      onNotify?.(`Case ${relatedCase.id} already exists for this student.`);
      onNavigate?.('cases');
      setPicked(null);
      return;
    }
    const newCaseId = `CASE-${2100 + (cases?.length || 0)}`;
    const newCase = {
      id: newCaseId,
      student_id: student.id,
      title: `Regulatory Investigation: ${student.name} (${student.id})`,
      person: student.name,
      institution: student.institution,
      severity: student.score < 50 ? 'High' : 'Medium',
      confidence: 89,
      age: 'Just now',
      status: 'Open',
      type: 'Data exception',
      evidence: [
        `Record reference: ${student.id} (${student.institution})`,
        `Quality score: ${student.score}/100`,
        `Validation issue: ${student.issue}`,
        `Admission category: ${student.category || 'Regular'}`
      ],
      recommendation: 'Issue institutional inquiry requesting original enrolment ledger and student photo identity proof.'
    };
    demoDataService.updateCases(old => [newCase, ...old]);
    setCases?.(demoDataService.getCases());

    demoDataService.updateStudents(old => old.map(s => s.id === student.id ? { ...s, status: 'Review required' } : s));
    setStudents(demoDataService.getStudents());

    onLog?.(`Created regulatory case ${newCaseId} for student ${student.id}`, newCaseId, 'Case action');
    onNotify?.(`Dispatched Case ${newCaseId} to Regulatory Case Desk.`);
    setPicked(null);
  }

  function handleCreateRecord() {
    if (!newForm.name.trim() || !newForm.institution.trim()) {
      setFormError('Student name and institution are required fields.');
      return;
    }
    const newId = newForm.id.trim() || `STU-${1000 + students.length + 1}`;
    const rawApaar = newForm.apaar.trim();
    const maskedApaar = rawApaar ? (rawApaar.length >= 4 ? `•••• ${rawApaar.slice(-4)}` : `•••• ${rawApaar}`) : '•••• 4821';
    const newStudent = {
      id: newId,
      name: newForm.name.trim(),
      institution: newForm.institution.trim(),
      program: newForm.program || 'B.Tech Computer Science and Engineering',
      year: newForm.year || '2026–27',
      apaar: maskedApaar,
      status: 'Review required',
      score: 91,
      issue: 'New demonstration record added manually (pending regulatory verification)',
      category: newForm.category || 'Regular Admission'
    };
    demoDataService.updateStudents(old => [newStudent, ...old]);
    setStudents(demoDataService.getStudents());
    onLog?.(`Demo student record ${newId} created: ${newStudent.name}`, newId, 'Data operations');
    onNotify?.(`Student ${newId} (${newStudent.name}) added to registry.`);
    setPicked(null);
    setNewForm({
      name: '',
      id: '',
      apaar: '',
      institution: 'Delhi Technological University',
      program: 'B.Tech Computer Science and Engineering',
      category: 'Regular Admission',
      year: '2026–27'
    });
    setFormError('');
  }

  return (
    <div className="page-stack">
      <PageHead
        eyebrow="CENTRAL STUDENT REPOSITORY / 02"
        title="Student registry"
        desc="A protected, searchable view of submitted records, validation outcomes and the issues that prevent acceptance."
        actions={
          <>
            <Btn icon={Download} onClick={() => downloadCSV(filtered, 'student-registry.csv')}>Export filtered ({filtered.length})</Btn>
            <Btn variant="primary" icon={Plus} onClick={() => { setFormError(''); setPicked({ new: true }); }}>Add demo record</Btn>
          </>
        }
      />

      <div className="metrics-grid compact">
        <Metric label="Records in view" value={filtered.length.toLocaleString()} icon={Users} foot={`of ${students.length} total synthetic records`} />
        <Metric label="Rule checks passed" value={verifiedCount.toLocaleString()} icon={CheckCircle2} tone="green" foot={`${Math.round((verifiedCount / (students.length || 1)) * 100)}% verified`} />
        <Metric label="Require review" value={reviewCount.toLocaleString()} icon={AlertTriangle} tone="amber" foot="exceptions or conflicts" />
      </div>

      <section className="panel">
        <div className="table-tools">
          <div className="search-input">
            <Search size={16} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search student name, reference, institution, APAAR..." />
            {q && <button onClick={() => setQ('')}><X size={14} /></button>}
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option>All records</option>
            <option>Verified</option>
            <option>Needs correction</option>
            <option>Potential duplicate</option>
            <option>Review required</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} title="Sort Records">
            <option value="score_desc">Sort: Quality (High to Low)</option>
            <option value="score_asc">Sort: Quality (Low to High)</option>
            <option value="name">Sort: Name (A–Z)</option>
            <option value="id">Sort: Record Reference</option>
          </select>
          <Btn icon={Filter} onClick={() => setFilter(filter === 'Potential duplicate' ? 'All records' : 'Potential duplicate')}>
            {filter === 'Potential duplicate' ? 'Show all' : 'Potential duplicates'}
          </Btn>
          {(q || filter !== 'All records' || sortBy !== 'score_desc') && (
            <button
              className="text-link"
              onClick={() => { setQ(''); setFilter('All records'); setSortBy('score_desc'); }}
              style={{ fontSize: '12px' }}
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>RECORD REF</th>
                <th>STUDENT</th>
                <th>MASKED APAAR</th>
                <th>INSTITUTION / PROGRAM</th>
                <th>QUALITY</th>
                <th>RECORD STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(s => (
                <tr key={s.id}>
                  <td><span className="mono blue-text">{s.id}</span></td>
                  <td>
                    <div className="table-person">
                      <span className="avatar">{s.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
                      <strong>{s.name}</strong>
                    </div>
                  </td>
                  <td className="mono muted">{s.apaar}</td>
                  <td>
                    <div className="table-institution">
                      <strong>{s.institution}</strong>
                      <span>{s.program}</span>
                    </div>
                  </td>
                  <td>
                    <div className="quality-cell">
                      <div className="quality-track">
                        <i style={{ width: `${s.score}%`, background: s.score > 90 ? '#21a783' : s.score > 65 ? '#d8a044' : '#df6470' }} />
                      </div>
                      <strong>{s.score}</strong>
                    </div>
                  </td>
                  <td>
                    <Badge tone={s.status === 'Verified' ? 'green' : s.status === 'Potential duplicate' ? 'red' : s.status === 'Needs correction' ? 'amber' : 'blue'}>
                      {s.status}
                    </Badge>
                  </td>
                  <td>
                    <button className="icon-btn" onClick={() => setPicked(s)} title="Inspect student record"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!paginated.length && (
            <div className="empty">
              <Search size={24} />
              <strong>No matching student records</strong>
              <span>Change the search or status filter.</span>
            </div>
          )}
        </div>

        <PaginationBar
          currentPage={pageNumber}
          totalPages={totalPages}
          onPageChange={setPageNumber}
          totalCount={filtered.length}
          pageSize={pageSize}
          itemName="student records"
        />
      </section>

      {picked && (
        <Modal
          title={picked.new ? 'Create demo student record' : `Record ${picked.id}`}
          desc={picked.new ? 'Add an illustrative student record with schema validation into the active session' : 'Inspect record context, validation findings and connected regulatory workflows.'}
          onClose={() => { setPicked(null); setFormError(''); }}
          footer={
            picked.new ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
                <Btn onClick={() => { setPicked(null); setFormError(''); }}>Cancel</Btn>
                <Btn variant="primary" icon={CheckCircle2} onClick={handleCreateRecord}>Create Student Record</Btn>
              </div>
            ) : (
              <>
                <Btn onClick={() => setPicked(null)}>Close</Btn>
                <Btn variant="secondary" icon={AlertTriangle} onClick={() => handleFlagForInvestigation(picked)}>
                  Flag for Investigation
                </Btn>
                <Btn variant="primary" icon={CheckCircle2} onClick={() => markStudentReviewed(picked.id)}>
                  Mark verified
                </Btn>
              </>
            )
          }
        >
          {picked.new ? (
            <div className="form-grid">
              {formError && (
                <div style={{ gridColumn: '1 / -1', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '6px', color: '#b91c1c', fontSize: '12px' }}>
                  {formError}
                </div>
              )}
              <label>
                Student name *
                <input
                  value={newForm.name}
                  onChange={e => setNewForm(s => ({ ...s, name: e.target.value }))}
                  placeholder="e.g. Ananya Roy"
                />
              </label>
              <label>
                Student reference ID
                <input
                  value={newForm.id}
                  onChange={e => setNewForm(s => ({ ...s, id: e.target.value }))}
                  placeholder="e.g. STU-9901 (auto if empty)"
                />
              </label>
              <label>
                Masked APAAR ID (12 digits)
                <input
                  value={newForm.apaar}
                  onChange={e => setNewForm(s => ({ ...s, apaar: e.target.value }))}
                  placeholder="e.g. 202688192345"
                />
              </label>
              <label>
                Institution name *
                <input
                  value={newForm.institution}
                  onChange={e => setNewForm(s => ({ ...s, institution: e.target.value }))}
                  placeholder="e.g. Delhi Technological University"
                />
              </label>
              <label>
                Degree program
                <input
                  value={newForm.program}
                  onChange={e => setNewForm(s => ({ ...s, program: e.target.value }))}
                  placeholder="e.g. B.Tech Computer Science and Engineering"
                />
              </label>
              <label>
                Admission category
                <select
                  value={newForm.category}
                  onChange={e => setNewForm(s => ({ ...s, category: e.target.value }))}
                >
                  <option>Regular Admission</option>
                  <option>Lateral Entry</option>
                  <option>Management Quota</option>
                  <option>Reserved / Quota</option>
                </select>
              </label>
              <label>
                Academic year
                <input
                  value={newForm.year}
                  onChange={e => setNewForm(s => ({ ...s, year: e.target.value }))}
                />
              </label>
            </div>
          ) : (
            <>
              <div className="detail-cards">
                <div><span>Student name</span><strong>{picked.name}</strong></div>
                <div><span>Reference</span><strong>{picked.id}</strong></div>
                <div><span>Masked APAAR ID</span><strong>{picked.apaar}</strong></div>
                <div><span>Admission category</span><strong>{picked.category || 'Regular'}</strong></div>
                <div><span>Academic year</span><strong>{picked.year}</strong></div>
                <div><span>Quality score</span><strong>{picked.score}/100</strong></div>
              </div>
              <div className="evidence-box">
                <AlertTriangle size={17} />
                <div>
                  <strong>Validation note</strong>
                  <p>{picked.issue}</p>
                  <small>Synthetic demonstration record. Scores and references do not reflect official AICTE or government data.</small>
                </div>
              </div>

              {/* Connected Workflows Integration */}
              <div style={{ marginTop: '14px', padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Connected Verification Workflows
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  {relatedMatch && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--red-500)' }}>Identity Conflict Candidate #{relatedMatch.id}</span>
                        <span style={{ color: 'var(--text-tertiary)', marginLeft: '6px' }}>({relatedMatch.confidence}% match confidence)</span>
                      </div>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                        onClick={() => { setPicked(null); onNavigate?.('matching'); }}
                      >
                        Identity Lab <ArrowRight size={12} />
                      </button>
                    </div>
                  )}

                  {relatedCase && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--amber-text)' }}>Regulatory Case #{relatedCase.id}</span>
                        <span style={{ color: 'var(--text-tertiary)', marginLeft: '6px' }}>({relatedCase.severity} Priority · {relatedCase.status})</span>
                      </div>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                        onClick={() => { setPicked(null); onNavigate?.('cases'); }}
                      >
                        Case Desk <ArrowRight size={12} />
                      </button>
                    </div>
                  )}

                  {relatedBatch && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--blue-primary)' }}>Ingestion Batch #{relatedBatch.id}</span>
                        <span style={{ color: 'var(--text-tertiary)', marginLeft: '6px' }}>({relatedBatch.status})</span>
                      </div>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                        onClick={() => { setPicked(null); onNavigate?.('submissions'); }}
                      >
                        Batch Telemetry <ArrowRight size={12} />
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Lifecycle Provenance Trace</span>
                      <span style={{ color: 'var(--text-tertiary)', marginLeft: '6px' }}>(8-stage end-to-end timeline)</span>
                    </div>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                      onClick={() => { setPicked(null); onNavigate?.('lineage'); }}
                    >
                      Lineage Explorer <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ==========================================================================
   3. INTAKE PAGE (DATA INTAKE & QUALITY GATE)
   ========================================================================== */
function IntakePage({ batches, setBatches, onUpload }) {
  const file = useRef(null);
  const [tab, setTab] = useState('upload');
  const [step, setStep] = useState(1);
  const [drag, setDrag] = useState(false);

  return (
    <div className="page-stack">
      <PageHead
        eyebrow="INSTITUTION DATA PIPELINE / 03"
        title="Data intake & quality gate"
        desc="Standardise institution submissions, validate incoming records and return actionable row-level feedback before acceptance."
        actions={
          <Btn icon={Download} onClick={() => downloadCSV([{ student_id: 'DEMO-001', student_name: 'Sample Student', apaar_id: 'TEST-APAAR-001', institution_code: 'INST-001', program_code: 'CSE', academic_year: '2026-27', category: 'Regular' }], 'APAAR-student-template.csv')}>
            Download CSV template
          </Btn>
        }
      />

      <div className="wizard-steps">
        {[
          { n: 1, t: 'Submit batch' },
          { n: 2, t: 'Validate schema' },
          { n: 3, t: 'Review exceptions' },
          { n: 4, t: 'Accept or return' }
        ].map(s => (
          <button key={s.n} className={step === s.n ? 'active' : step > s.n ? 'done' : ''} onClick={() => setStep(s.n)}>
            <span>{step > s.n ? <Check size={14} /> : s.n}</span>{s.t}
          </button>
        ))}
      </div>

      <div className="intake-grid">
        <Panel title="Submission workspace" sub="Choose an intake path. Real integrations require an authenticated backend." action={<Badge tone="blue">STEP {step} / 4</Badge>}>
          <div className="seg-tabs">
            <button className={tab === 'upload' ? 'active' : ''} onClick={() => setTab('upload')}><CloudUpload size={15} /> CSV upload</button>
            <button className={tab === 'api' ? 'active' : ''} onClick={() => setTab('api')}><Server size={15} /> Institution API</button>
            <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}><History size={15} /> Batch history</button>
          </div>

          {tab === 'upload' ? (
            <>
              <div className={cx('drop-target', drag && 'drag')} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) onUpload(e.dataTransfer.files[0]); }}>
                <div className="drop-graphic"><CloudUpload size={29} /></div>
                <h3>Bring in a student data batch</h3>
                <p>Drop a CSV here or browse your computer. Start with synthetic sample data.</p>
                <Btn variant="primary" icon={Upload} onClick={() => file.current?.click()}>Select CSV file</Btn>
                <input hidden ref={file} type="file" accept=".csv,text/csv" onChange={e => e.target.files[0] && onUpload(e.target.files[0])} />
                <div className="file-specs">
                  <span><Check size={13} /> CSV UTF-8</span>
                  <span><Check size={13} /> Header validation</span>
                  <span><Check size={13} /> Duplicate scan</span>
                </div>
              </div>
              <div className="intake-bottom">
                <div><ShieldCheck size={16} /><span>Records are checked before they enter the accepted state.</span></div>
                <div><LockKeyhole size={16} /><span>Do not upload real personal data into this demo.</span></div>
              </div>
            </>
          ) : tab === 'api' ? (
            <div className="api-card">
              <div className="api-symbol"><Server size={25} /></div>
              <h3>Institution ERP integration</h3>
              <p>Future-ready API contract for authorised institution systems. Endpoint credentials and server implementation are not configured in this frontend.</p>
              <div className="terminal">
                <span>POST</span> /api/v1/institutions/{'{institutionId}'}/submissions<br />
                <span>Content-Type</span>: application/json<br />
                <span>Authorization</span>: Bearer &lt;institution-token&gt;
              </div>
              <Btn onClick={() => alert('Demo only: no live API or credentials are configured.')} icon={FileText}>View API contract</Btn>
            </div>
          ) : (
            <div className="history-list">
              {batches.slice(0, 10).map(b => (
                <div className="history-item" key={b.id}>
                  <FileSpreadsheet size={18} />
                  <div>
                    <strong>{b.id}</strong>
                    <span>{b.institution} · {b.when}</span>
                  </div>
                  <Badge tone={b.status === 'Accepted' ? 'green' : 'amber'}>{b.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Validation policy checklist" sub="Checks run before a batch can move forward" action={<span className="small-muted">7 checks</span>}>
          <div className="rule-checks">
            {[
              { id: '01', title: 'Required field completeness', desc: 'Student reference, name, institution, program and year' },
              { id: '02', title: 'APAAR field format', desc: 'Check presence and configured format; not identity proof' },
              { id: '03', title: 'Duplicate row detection', desc: 'Exact and normalised duplicate candidates' },
              { id: '04', title: 'Institution / program mapping', desc: 'Check against approved reference data' },
              { id: '05', title: 'Academic year consistency', desc: 'Ensure the record belongs to the submission cycle' },
              { id: '06', title: 'Summary reconciliation', desc: 'Compare batch totals with reported counts' },
              { id: '07', title: 'Anomaly triage', desc: 'Flag unusual changes for human review' }
            ].map(r => (
              <div className="rule-check" key={r.id}>
                <span className="rule-num">{r.id}</span>
                <div>
                  <strong>{r.title}</strong>
                  <p>{r.desc}</p>
                </div>
                <CheckCircle2 size={16} className="check-muted" />
              </div>
            ))}
          </div>
          <div className="policy-note">
            <CircleHelp size={16} />
            <p>Only the basic CSV field checks are implemented locally. Production rules must run on the backend against approved reference data.</p>
          </div>
        </Panel>
      </div>

      <Panel title="Recent batch activity" sub={`Traceable submission outcomes (${batches.length} synthetic batches)`} action={<Btn icon={Download} onClick={() => downloadCSV(batches, 'submission-batches.csv')}>Export batches</Btn>}>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>BATCH REF</th>
                <th>INSTITUTION</th>
                <th>TOTAL ROWS</th>
                <th>PASSED</th>
                <th>FLAGGED</th>
                <th>SUBMISSION TIME</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {batches.slice(0, 15).map(b => (
                <tr key={b.id}>
                  <td className="mono blue-text">{b.id}</td>
                  <td>{b.institution}</td>
                  <td>{b.rows}</td>
                  <td className="green-text">{b.passed}</td>
                  <td className={b.flagged ? 'amber-text' : ''}>{b.flagged}</td>
                  <td>{b.when}</td>
                  <td><Badge tone={b.status === 'Accepted' ? 'green' : 'amber'}>{b.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-bottom">
          <span>Displaying 15 most recent batches of {batches.length} synthetic batches</span>
          <span className="demo-label">SYNTHETIC DATASET</span>
        </div>
      </Panel>
    </div>
  );
}

/* ==========================================================================
   4. MATCHING PAGE (IDENTITY MATCHING LAB)
   ========================================================================== */
function MatchingPage({ matches, setMatches, students, cases, setCases, onLog }) {
  const [selected, setSelected] = useState(0);
  const [method, setMethod] = useState('Hybrid');
  const [showEvidence, setShowEvidence] = useState(true);

  const activeMatch = matches[selected] || matches[0];

  function handleRequestClarification() {
    if (!activeMatch) return;
    const newCase = {
      id: `CASE-${2100 + cases.length}`,
      title: `Identity clarification: ${activeMatch.name} (${activeMatch.refA} / ${activeMatch.refB})`,
      person: activeMatch.name,
      institution: activeMatch.institutionA,
      severity: activeMatch.risk || 'Medium',
      confidence: activeMatch.matchScore || 85,
      age: 'Just now',
      status: 'Waiting on institution',
      type: 'Identity conflict',
      evidence: [
        `Candidate pair: ${activeMatch.refA} (${activeMatch.institutionA}) and ${activeMatch.refB} (${activeMatch.institutionB})`,
        `Synthetic match score: ${activeMatch.matchScore}%`,
        activeMatch.reason || 'Candidate pair requires institutional source verification'
      ],
      recommendation: 'Request authorised institution clarification and verify active enrolment status.'
    };
    demoDataService.updateCases(old => [newCase, ...old]);
    setCases(demoDataService.getCases());
    onLog?.(`Identity clarification requested for ${activeMatch.name}`, newCase.id, 'Case action');
    alert(`Case ${newCase.id} created and routed to the Case Desk.`);
  }

  return (
    <div className="page-stack">
      <PageHead
        eyebrow="ENTITY RESOLUTION / 04"
        title="Identity matching lab"
        desc="Investigate possible duplicate enrolments with explainable candidate matches, evidence comparison and human-controlled outcomes."
        actions={<Btn icon={RefreshCw} onClick={() => alert('Demo matching: 120 candidate pairs loaded from deterministic synthetic engine.')}>Re-run demo matching</Btn>}
      />

      <div className="matching-banner">
        <div className="matching-banner-icon"><GitCompare size={23} /></div>
        <div>
          <strong>Candidate matching, not automatic identity decisions ({matches.length} candidates)</strong>
          <p>Signals help reviewers prioritise records. Similar names or identifiers alone must never trigger automatic rejection or merge.</p>
        </div>
        <Badge tone="violet">HUMAN-IN-LOOP</Badge>
      </div>

      <div className="matching-grid">
        <Panel title="Candidate queue" sub="Ranked by illustrative candidate similarity score" action={<select value={method} onChange={e => setMethod(e.target.value)}><option>Hybrid</option><option>Identifier-first</option><option>Name similarity</option></select>}>
          <div className="candidate-list" style={{ maxHeight: '620px', overflowY: 'auto' }}>
            {matches.slice(0, 15).map((m, i) => (
              <button className={selected === i ? 'active' : ''} key={m.id || i} onClick={() => setSelected(i)}>
                <div className="candidate-avatar">{m.name.split(' ').map(x => x[0]).slice(0, 2).join('')}</div>
                <div className="candidate-main">
                  <strong>{m.name}</strong>
                  <span>{m.institutionA}</span>
                  <small>{m.refA} ↔ {m.refB}</small>
                </div>
                <div className="candidate-score">
                  <strong>{m.matchScore}%</strong>
                  <Badge tone={m.risk === 'High' ? 'red' : 'amber'}>{m.risk}</Badge>
                </div>
              </button>
            ))}
          </div>
          <div className="candidate-foot">
            <span>Showing top 15 of {matches.length} candidate pairs</span>
            <span>Deterministic engine</span>
          </div>
        </Panel>

        {activeMatch && (
          <div className="panel match-detail">
            <div className="match-detail-top">
              <div>
                <div className="eyebrow">MATCH REVIEW · {activeMatch.id}</div>
                <h2>{activeMatch.name}</h2>
                <p>Primary reference: {activeMatch.refA} · {activeMatch.institutionA}</p>
              </div>
              <Badge tone="red">Potential conflict</Badge>
            </div>

            <div className="match-confidence">
              <div>
                <span>Candidate match confidence</span>
                <strong>{activeMatch.matchScore}%</strong>
              </div>
              <Progress value={activeMatch.matchScore} tone="violet" />
              <small>Illustrative combined score · not a probability of identity</small>
            </div>

            <div className="compare-records">
              <div className="compare-card">
                <div className="compare-card-head"><span>RECORD A</span><Badge tone="blue">Primary</Badge></div>
                <strong>{activeMatch.name}</strong>
                <span>{activeMatch.institutionA}</span>
                <div><small>Reference</small><b>{activeMatch.refA}</b></div>
                <div><small>Academic year</small><b>2026–27</b></div>
                <div><small>Masked identifier</small><b>{activeMatch.maskedApaarA || '•••• 4821'}</b></div>
                <div><small>Enrolment</small><b>Active · reported</b></div>
              </div>

              <div className="compare-center">
                <GitCompare size={21} />
                <span>COMPARE</span>
              </div>

              <div className="compare-card">
                <div className="compare-card-head"><span>RECORD B</span><Badge tone="amber">Candidate</Badge></div>
                <strong>{activeMatch.name}</strong>
                <span>{activeMatch.institutionB}</span>
                <div><small>Reference</small><b>{activeMatch.refB}</b></div>
                <div><small>Academic year</small><b>2026–27</b></div>
                <div><small>Masked identifier</small><b>{activeMatch.maskedApaarB || '•••• 4821'}</b></div>
                <div><small>Enrolment</small><b>Active · reported</b></div>
              </div>
            </div>

            <button className="evidence-toggle" onClick={() => setShowEvidence(!showEvidence)}>
              <span><Sparkles size={15} /> Why was this match suggested?</span>
              {showEvidence ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {showEvidence && (
              <div className="match-evidence">
                {[
                  { label: 'Identifier similarity', value: `${activeMatch.evidenceScores?.identifier || 92}%`, score: activeMatch.evidenceScores?.identifier || 92 },
                  { label: 'Name similarity', value: `${activeMatch.evidenceScores?.name || 88}%`, score: activeMatch.evidenceScores?.name || 88 },
                  { label: 'Academic overlap', value: `${activeMatch.evidenceScores?.academic || 95}%`, score: activeMatch.evidenceScores?.academic || 95 }
                ].map(x => (
                  <div key={x.label}>
                    <span>{x.label}</span>
                    <strong>{x.value}</strong>
                    <Progress value={x.score} tone="violet" />
                  </div>
                ))}
                <p><AlertCircle size={14} /> {activeMatch.reason}. Confirm transfer, withdrawal or enrolment status before a decision.</p>
              </div>
            )}

            <div className="match-actions">
              <Btn icon={MessageSquareText} onClick={handleRequestClarification}>Request clarification</Btn>
              <Btn variant="secondary" icon={X} onClick={() => alert('Demo action: dismissal requires an officer rationale and audit logging.')}>Not a match</Btn>
              <Btn variant="primary" icon={CheckCircle2} onClick={() => alert('Demo action: conflict confirmation requires secondary reviewer verification and creates an audit event.')}>Confirm conflict</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   5. CASES PAGE (RISK & CASE MANAGEMENT)
   ========================================================================== */
function CasesPage({ cases, setCases, students = [], batches = [], setAnomalies, onLog, onNavigate, onNotify }) {
  const [filter, setFilter] = useState('All cases');
  const [selected, setSelected] = useState(cases[0]?.id);
  const [pageNumber, setPageNumber] = useState(1);
  const [resolvingCase, setResolvingCase] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const pageSize = 10;

  const filtered = useMemo(() => {
    return cases.filter(c => {
      if (filter === 'All cases') return true;
      if (filter === 'Open') return c.status === 'Open';
      if (filter === 'High priority') return c.severity === 'High';
      if (filter === 'Needs action') return c.status !== 'Resolved';
      return true;
    });
  }, [cases, filter]);

  useEffect(() => {
    setPageNumber(1);
    if (filtered.length && !filtered.find(c => c.id === selected)) {
      setSelected(filtered[0]?.id);
    }
  }, [filter, filtered]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageNumber, pageSize]);

  const item = filtered.find(c => c.id === selected) || paginated[0] || cases[0];

  function handleUpdateAssignment(caseId, unit) {
    demoDataService.updateCases(old => old.map(c => c.id === caseId ? { ...c, assignedTo: unit } : c));
    setCases(demoDataService.getCases());
    onLog?.(`Case ${caseId} assignment updated to ${unit}`, caseId, 'Case action');
    onNotify?.(`Case ${caseId} reassigned to ${unit}.`);
  }

  function updateStatus(caseId, nextStatus, customNote) {
    const note = customNote || (nextStatus === 'Resolved' ? 'Case resolved by regulatory officer after evidence reconciliation.' : `Status updated to ${nextStatus}`);
    demoDataService.updateCases(old => old.map(c => c.id === caseId ? { ...c, status: nextStatus, resolutionNote: note } : c));
    setCases(demoDataService.getCases());

    // If case is resolved, sync any related anomaly alert
    if (nextStatus === 'Resolved') {
      demoDataService.updateAnomalies(old => old.map(a => {
        if (a.relatedCase === caseId) {
          return { ...a, status: 'Resolved' };
        }
        return a;
      }));
      setAnomalies?.(demoDataService.getAnomalies());
    }

    onLog?.(`Case ${caseId} status updated to ${nextStatus}: ${note}`, caseId, 'Case action');
    onNotify?.(`Case ${caseId} marked as ${nextStatus}.`);
    setResolvingCase(null);
    setResolutionNotes('');
  }

  return (
    <div className="page-stack">
      <PageHead
        eyebrow="REGULATORY REVIEW OPERATIONS / 05"
        title="Risk & case desk"
        desc="A single queue for data-quality exceptions, identity conflicts and institutional reconciliation—with evidence and next actions attached."
        actions={<Btn icon={Download} onClick={() => downloadCSV(filtered, 'regulatory-cases.csv')}>Export filtered cases ({filtered.length})</Btn>}
      />

      <div className="metrics-grid compact">
        <Metric label="Unresolved cases" value={cases.filter(c => c.status !== 'Resolved').length} icon={AlertOctagon} tone="red" foot="active queue" />
        <Metric label="High priority" value={cases.filter(c => c.severity === 'High' && c.status !== 'Resolved').length} icon={ShieldAlert} tone="amber" foot="urgent intervention" />
        <Metric label="Awaiting institution" value={cases.filter(c => c.status === 'Waiting on institution').length} icon={Clock3} tone="violet" foot="clarifications pending" />
        <Metric label="Resolved cases" value={cases.filter(c => c.status === 'Resolved').length} icon={CheckCircle2} tone="green" foot="decisions recorded" />
      </div>

      <div className="case-layout">
        <section className="panel queue-panel">
          <div className="panel-head">
            <div>
              <h3>Review queue</h3>
              <p>{filtered.length} cases matching filter</p>
            </div>
            {filter !== 'All cases' && (
              <button className="text-link" onClick={() => setFilter('All cases')} style={{ fontSize: '11.5px' }}>
                Reset filter
              </button>
            )}
            <SlidersHorizontal size={16} />
          </div>

          <div className="filter-tabs">
            {['All cases', 'Open', 'High priority', 'Needs action'].map(f => (
              <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {paginated.map(c => (
              <button className={cx('queue-card', item?.id === c.id && 'selected')} key={c.id} onClick={() => setSelected(c.id)}>
                <div className="queue-card-top">
                  <span className="mono">{c.id}</span>
                  <Badge tone={c.severity === 'High' ? 'red' : c.severity === 'Medium' ? 'amber' : 'blue'}>{c.severity}</Badge>
                </div>
                <strong>{c.title}</strong>
                <span>{c.institution}</span>
                <div className="queue-card-bottom">
                  <small><Clock3 size={12} />{c.age}</small>
                  <Badge tone={c.status === 'Resolved' ? 'green' : c.status === 'Waiting on institution' ? 'amber' : 'neutral'}>{c.status}</Badge>
                </div>
              </button>
            ))}
          </div>

          <div className="table-bottom" style={{ padding: '10px 14px' }}>
            <span style={{ fontSize: '11px' }}>Page {pageNumber} of {totalPages}</span>
            <div className="pagination-controls">
              <button disabled={pageNumber <= 1} onClick={() => setPageNumber(pageNumber - 1)}>Prev</button>
              <button disabled={pageNumber >= totalPages} onClick={() => setPageNumber(pageNumber + 1)}>Next</button>
            </div>
          </div>
        </section>

        {item ? (
          <section className="panel case-detail">
            <div className="case-detail-heading">
              <div>
                <div className="eyebrow">{item.id} · {(item.type || 'Review').toUpperCase()}</div>
                <h2>{item.title}</h2>
                <p>{item.institution} · {item.person}</p>
              </div>
              <Badge tone={item.severity === 'High' ? 'red' : item.severity === 'Medium' ? 'amber' : 'blue'}>
                {item.severity} priority
              </Badge>
            </div>

            <div className="case-facts">
              <div><span>Case confidence</span><strong>{item.confidence}%</strong></div>
              <div><span>Detected</span><strong>{item.age}</strong></div>
              <div>
                <span>Assigned unit</span>
                <select
                  value={item.assignedTo || 'Regulation Bureau'}
                  onChange={e => handleUpdateAssignment(item.id, e.target.value)}
                  style={{
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    marginTop: '2px'
                  }}
                  title="Change Unit Assignment"
                >
                  <option value="Regulation Bureau">Regulation Bureau</option>
                  <option value="Regional Directorate (North)">Regional Directorate (North)</option>
                  <option value="Data Governance Cell">Data Governance Cell</option>
                  <option value="Institutional Registrar Desk">Institutional Registrar Desk</option>
                  <option value="Central Ombudsman">Central Ombudsman</option>
                </select>
              </div>
              <div><span>Current status</span><strong>{item.status}</strong></div>
            </div>

            {item.status === 'Resolved' && item.resolutionNote && (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px 14px', borderRadius: '8px', margin: '14px 0' }}>
                <strong style={{ fontSize: '12px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} /> Officer Resolution Notes
                </strong>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#166534', lineHeight: 1.4 }}>
                  {item.resolutionNote}
                </p>
              </div>
            )}

            <SectionLabel>01 / EVIDENCE COLLECTED</SectionLabel>
            <div className="evidence-list">
              {(item.evidence || []).map((e, i) => (
                <div key={i}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <p>{e}</p>
                  <CheckCircle2 size={15} />
                </div>
              ))}
            </div>

            <div className="case-caution">
              <ShieldAlert size={18} />
              <div>
                <strong>Decision guardrail</strong>
                <p>This is a system-generated review signal from the synthetic dataset, not a final finding of misconduct. Validate source records, relevant policy and transfer history before acting.</p>
              </div>
            </div>

            <SectionLabel>02 / RECOMMENDED NEXT ACTION</SectionLabel>
            <div className="next-action">
              <div><Sparkles size={18} /></div>
              <section>
                <strong>Suggested officer workflow</strong>
                <p>{item.recommendation}</p>
                <small>Recommendation is rule-based synthetic guidance; officer retains full decision authority.</small>
              </section>
            </div>

            <SectionLabel>03 / CASE TIMELINE</SectionLabel>
            <div className="timeline">
              <div className="timeline-row complete">
                <i />
                <div>
                  <strong>Validation signal generated</strong>
                  <span>Rule & matching engine · {item.age}</span>
                </div>
              </div>
              <div className="timeline-row complete">
                <i />
                <div>
                  <strong>Case reference created</strong>
                  <span>Evidence summary attached to case {item.id}</span>
                </div>
              </div>
              <div className={cx('timeline-row', item.status === 'Resolved' ? 'complete' : 'current')}>
                <i />
                <div>
                  <strong>{item.status === 'Resolved' ? 'Resolution recorded' : 'Officer action pending'}</strong>
                  <span>{item.status === 'Resolved' ? 'Case marked resolved in demo store' : 'Select an action below to update the demo case status.'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', margin: '14px 0', border: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', width: '100%', textTransform: 'uppercase' }}>
                Connected Investigative Tools
              </span>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => onNavigate?.('insights')}
              >
                <BrainCircuit size={13} style={{ marginRight: '4px' }} /> Explain in AI Decision Centre
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => onNavigate?.('lineage')}
              >
                <Network size={13} style={{ marginRight: '4px' }} /> Trace Student Lineage
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => onNavigate?.('students')}
              >
                <Users size={13} style={{ marginRight: '4px' }} /> View Student Registry
              </button>
            </div>

            <div className="case-footer-actions">
              <Btn onClick={() => updateStatus(item.id, 'Waiting on institution')} icon={MessageSquareText}>Request correction</Btn>
              <Btn onClick={() => updateStatus(item.id, 'In review')} icon={Eye}>Move to review</Btn>
              <Btn variant="primary" icon={CheckCircle2} onClick={() => { setResolutionNotes(`Resolved by Officer: Verified student records with ${item.institution}. Remediation criteria satisfied.`); setResolvingCase(item); }}>
                Resolve case...
              </Btn>
            </div>
          </section>
        ) : (
          <section className="panel empty">No cases match this filter.</section>
        )}
      </div>

      {/* Case Resolution Modal with custom notes */}
      {resolvingCase && (
        <Modal
          title={`Resolve Regulatory Case · ${resolvingCase.id}`}
          desc={`Subject: ${resolvingCase.title} (${resolvingCase.person || resolvingCase.institution})`}
          onClose={() => setResolvingCase(null)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
              <Btn onClick={() => setResolvingCase(null)}>Cancel</Btn>
              <Btn
                variant="primary"
                icon={CheckCircle2}
                onClick={() => updateStatus(resolvingCase.id, 'Resolved', resolutionNotes)}
              >
                Confirm Resolution & Log Audit
              </Btn>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="evidence-box">
              <Sparkles size={18} />
              <div>
                <strong>Recommended Next Action</strong>
                <p>{resolvingCase.recommendation}</p>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                Officer Resolution Notes & Regulatory Rationale *
              </label>
              <textarea
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                placeholder="Enter detailed investigation findings, registrar clarification, or remediation confirmation..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '12.5px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                This rationale will be recorded permanently in the immutable audit trail for case #{resolvingCase.id}.
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ==========================================================================
   6. INSIGHTS PAGE (AI INTELLIGENCE WORKBENCH)
   ========================================================================== */
function InsightsPage({ cases, students, institutions }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Welcome to the regulatory intelligence workbench. Currently tracking ${students.length} synthetic student records, ${institutions.length} institutions, and ${cases.length} case signals. This assistant uses deterministic reasoning over the loaded dataset.` }
  ]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('Explainable signals');

  const prompts = ['Summarise highest-priority cases', 'Explain cross-institution matching', 'How should we reduce data errors?'];

  function ask(raw) {
    const text = (raw || q).trim();
    if (!text) return;
    setMessages(a => [...a, { role: 'user', text }]);
    setQ('');
    setBusy(true);

    setTimeout(() => {
      let answer = 'Start with deterministic validation, display evidence behind each signal, route exceptions to a reviewer, and record the resolution. This demo is not connected to official APAAR data or a live AI service.';
      const t = text.toLowerCase();
      if (t.includes('priority') || t.includes('case') || t.includes('summar')) {
        const openCount = cases.filter(c => c.status !== 'Resolved').length;
        const highCount = cases.filter(c => c.severity === 'High' && c.status !== 'Resolved').length;
        answer = `The case desk contains ${openCount} unresolved cases out of ${cases.length} total, with ${highCount} designated as High Priority. The most common triggers include cross-institution candidate pairs, admission data mismatches, and summary reconciliation variances.`;
      } else if (t.includes('match') || t.includes('identity')) {
        answer = 'A safe matching pipeline normalises permitted fields, checks exact identifier candidates, compares enrolment periods and institution context, then ranks possible pairs. Display why a pair was suggested and allow the reviewer to confirm, dismiss or request clarification. Never automatically merge records or declare a person fraudulent from similarity alone.';
      } else if (t.includes('error') || t.includes('quality') || t.includes('data')) {
        answer = `In our current dataset of ${students.length} students, data quality issues are caught at intake. Reduce errors with one standard template, schema checks before upload, field-level feedback, reference-data validation, and an institution resubmission loop.`;
      } else if (t.includes('ml') || t.includes('model') || t.includes('anomaly')) {
        answer = 'Potential ML additions include anomaly detection on institution-level submission changes, calibrated candidate ranking for possible duplicates, and forecasting of reporting delays. These require representative historical data, documented labels, bias and drift checks, human review, and evaluation against a rule-based baseline.';
      }
      setMessages(a => [...a, { role: 'assistant', text: answer }]);
      setBusy(false);
    }, 350);
  }

  return (
    <div className="page-stack">
      <PageHead
        eyebrow="EXPLAINABLE INTELLIGENCE / 06"
        title="AI intelligence workbench"
        desc="Combine deterministic controls with carefully governed ML concepts—explainable, measurable and always subject to human review."
        actions={<Badge tone="violet">SIMULATED AI</Badge>}
      />

      <div className="ai-banner">
        <div className="ai-banner-icon"><Sparkles size={24} /></div>
        <div>
          <span>DESIGNED FOR TRUST</span>
          <h2>Every signal should answer three questions.</h2>
          <p>What was detected? What evidence supports it? What should an authorised reviewer do next?</p>
        </div>
        <div className="ai-principles">
          <span><CheckCircle2 size={14} /> Explainable</span>
          <span><UserCheck size={14} /> Human-reviewed</span>
          <span><ShieldCheck size={14} /> Privacy-aware</span>
        </div>
      </div>

      <div className="ai-layout">
        <div className="ai-left">
          <Panel title="Signal intelligence" sub="Illustrative signals from configured rules" action={<select value={mode} onChange={e => setMode(e.target.value)}><option>Explainable signals</option><option>ML concepts</option></select>}>
            <div className="signal-cards">
              {(mode === 'Explainable signals' ? [
                { title: 'Cross-institution match candidates', n: '120', desc: 'Possible overlapping enrolments require source confirmation.', tone: 'red', icon: Fingerprint },
                { title: 'Summary / detail mismatch', n: '40', desc: 'Reported batch counts differ from student-level submission totals.', tone: 'amber', icon: GitCompare },
                { title: 'Mandatory field omissions', n: '18', desc: 'Rows need correction before acceptance can proceed.', tone: 'blue', icon: AlertTriangle },
                { title: 'Unusual submission movement', n: '05', desc: 'Changes exceed the configured monitoring threshold.', tone: 'violet', icon: Activity }
              ] : [
                { title: 'Candidate match ranking', n: 'ML', desc: 'Rank candidate record pairs; measure precision and false-positive rate.', tone: 'violet', icon: GitCompare },
                { title: 'Submission anomaly detection', n: 'ML', desc: 'Flag unusual changes against historical institution patterns.', tone: 'amber', icon: Activity },
                { title: 'Reporting delay forecast', n: 'ML', desc: 'Estimate likely late submissions with uncertainty intervals.', tone: 'blue', icon: BarChart3 },
                { title: 'Error root-cause clustering', n: 'ML', desc: 'Group recurring correction reasons to improve guidance.', tone: 'green', icon: Network }
              ]).map(s => (
                <div className="signal-card" key={s.title}>
                  <div className={`signal-symbol ${s.tone}`}><s.icon size={18} /></div>
                  <div><strong>{s.title}</strong><p>{s.desc}</p></div>
                  <b>{s.n}</b>
                </div>
              ))}
            </div>
            <div className="ai-footnote"><CircleHelp size={15} /> Counts derived from synthetic dataset. ML models are concepts here; no model is trained on real data.</div>
          </Panel>

          <Panel title="Model governance checklist" sub="Requirements before ML can influence real workflows">
            <div className="governance-grid">
              {[
                { title: 'Baseline first', desc: 'Compare against deterministic rules.', icon: ListChecks },
                { title: 'Evidence & explainability', desc: 'Show features that contributed to a flag.', icon: FileSearch },
                { title: 'Human decision rights', desc: 'No automatic rejection or record merging.', icon: UserCheck },
                { title: 'Monitor drift', desc: 'Measure false positives and changing data.', icon: Activity }
              ].map(x => (
                <div key={x.title}>
                  <x.icon size={18} />
                  <strong>{x.title}</strong>
                  <span>{x.desc}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Regulatory data assistant" sub="Ask questions about this prototype's sample signals" className="chat-panel">
          <div className="assistant-status">
            <span className="assistant-avatar"><BrainCircuit size={17} /></span>
            <div>
              <strong>APAAR intelligence assistant</strong>
              <span><i /> Local simulated responses · synthetic dataset</span>
            </div>
            <Badge tone="violet">BETA UI</Badge>
          </div>

          <div className="chat-log">
            {messages.map((m, i) => (
              <div className={cx('chat-msg', m.role)} key={i}>
                <span className="chat-avatar">{m.role === 'assistant' ? <Sparkles size={13} /> : <Users size={13} />}</span>
                <p>{m.text}</p>
              </div>
            ))}
            {busy && (
              <div className="chat-msg assistant">
                <span className="chat-avatar"><Sparkles size={13} /></span>
                <p className="typing">Thinking through the demo data…</p>
              </div>
            )}
          </div>

          <div className="prompt-list">
            {prompts.map(p => (
              <button key={p} onClick={() => ask(p)}>{p}<ArrowUpRight size={12} /></button>
            ))}
          </div>

          <form className="chat-form" onSubmit={e => { e.preventDefault(); ask(); }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Ask about validation, matching, risk or ML…" />
            <button disabled={!q.trim() || busy}><Send size={15} /></button>
          </form>
          <div className="chat-note">Not a live LLM. Do not use the assistant output as an official regulatory decision.</div>
        </Panel>
      </div>
    </div>
  );
}

/* ==========================================================================
   7. INSTITUTIONS PAGE (INSTITUTION OVERSIGHT)
   ========================================================================== */
function InstitutionsPage({ institutions }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => {
    return institutions.filter(x => {
      const matchQ = `${x.name} ${x.city} ${x.code}`.toLowerCase().includes(q.toLowerCase());
      const matchS = status === 'All' || x.status === status;
      return matchQ && matchS;
    });
  }, [institutions, q, status]);

  const healthyCount = institutions.filter(i => i.status === 'Healthy').length;
  const actionCount = institutions.filter(i => i.status !== 'Healthy').length;

  return (
    <div className="page-stack">
      <PageHead
        eyebrow="INSTITUTION NETWORK / 07"
        title="Institution oversight"
        desc="Monitor submission compliance, program coverage, data quality and the institutions requiring targeted intervention."
        actions={<Btn icon={Download} onClick={() => downloadCSV(rows, 'institution-oversight.csv')}>Export directory ({rows.length})</Btn>}
      />

      <div className="metrics-grid compact">
        <Metric label="Institutions in network" value={institutions.length} icon={Landmark} foot="synthetic demonstration network" />
        <Metric label="Healthy / Compliant" value={healthyCount} icon={CloudUpload} tone="green" foot={`${Math.round((healthyCount / institutions.length) * 100)}% on track`} />
        <Metric label="Needs intervention" value={actionCount} icon={AlertTriangle} tone="amber" foot="action or review required" />
      </div>

      <div className="institution-cards">
        {institutions.slice(0, 3).map(i => (
          <div className="institution-card" key={i.code}>
            <div className="institution-card-top">
              <div className="institution-logo"><Landmark size={19} /></div>
              <Badge tone={i.status === 'Healthy' ? 'green' : i.status === 'Review required' ? 'red' : 'amber'}>{i.status}</Badge>
            </div>
            <h3>{i.name}</h3>
            <p><MapPin size={13} />{i.city}</p>
            <div className="institution-stats">
              <div><span>Student records</span><strong>{i.students.toLocaleString()}</strong></div>
              <div><span>Programs</span><strong>{i.programs}</strong></div>
            </div>
            <div className="institution-quality">
              <div><span>Data quality index</span><strong>{i.quality}%</strong></div>
              <Progress value={i.quality} tone={i.quality > 95 ? 'green' : i.quality > 90 ? 'blue' : 'amber'} />
            </div>
            <button className="text-link" onClick={() => setSelected(i)}>View institution profile <ArrowRight size={13} /></button>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="table-tools">
          <div className="search-input">
            <Search size={15} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search institution, location, code…" />
            {q && <button onClick={() => setQ('')}><X size={14} /></button>}
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option>All</option>
            <option>Healthy</option>
            <option>Action needed</option>
            <option>Review required</option>
          </select>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>INSTITUTION</th>
                <th>PROGRAMS</th>
                <th>RECORDS</th>
                <th>QUALITY INDEX</th>
                <th>LAST SUBMISSION</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(i => (
                <tr key={i.code}>
                  <td>
                    <div className="table-institution">
                      <strong>{i.name}</strong>
                      <span>{i.code} · {i.city}</span>
                    </div>
                  </td>
                  <td>{i.programs}</td>
                  <td>{i.students.toLocaleString()}</td>
                  <td>
                    <div className="quality-cell">
                      <div className="quality-track"><i style={{ width: `${i.quality}%` }} /></div>
                      <strong>{i.quality}%</strong>
                    </div>
                  </td>
                  <td>{i.submitted}</td>
                  <td>
                    <Badge tone={i.status === 'Healthy' ? 'green' : i.status === 'Review required' ? 'red' : 'amber'}>
                      {i.status}
                    </Badge>
                  </td>
                  <td>
                    <button className="icon-btn" onClick={() => setSelected(i)} title="View details"><ChevronRight size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-bottom">
          <span>Showing {rows.length} of {institutions.length} institutions</span>
          <span className="demo-label">SYNTHETIC DATASET</span>
        </div>
      </section>

      {selected && (
        <Modal title={selected.name} desc={`${selected.code} · Institution oversight profile`} onClose={() => setSelected(null)} footer={<Btn variant="primary" onClick={() => setSelected(null)}>Done</Btn>}>
          <div className="detail-cards">
            <div><span>Location</span><strong>{selected.city}</strong></div>
            <div><span>Programs</span><strong>{selected.programs}</strong></div>
            <div><span>Student records</span><strong>{selected.students.toLocaleString()}</strong></div>
            <div><span>Data quality index</span><strong>{selected.quality}%</strong></div>
            <div><span>Last submission</span><strong>{selected.submitted}</strong></div>
            <div><span>Current status</span><strong>{selected.status}</strong></div>
          </div>
          <div className="evidence-box">
            <AlertTriangle size={16} />
            <div>
              <strong>Recommended oversight</strong>
              <p>Review batch validation outcomes, repeated error categories and unresolved cases before considering reporting readiness.</p>
              <small>Fictional institution record for demonstration. Does not represent an officially accredited AICTE institution.</small>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ==========================================================================
   8. RULES PAGE (VALIDATION STUDIO)
   ========================================================================== */
function RulesPage() {
  const [rules, setRules] = useState([
    { id: 'APAAR-REQ-01', title: 'Mandatory field completeness', desc: 'Flag records missing required student or institution fields.', on: true, category: 'Data quality', severity: 'Block submission' },
    { id: 'MATCH-02', title: 'Cross-institution candidate match', desc: 'Create review candidates when permitted identifiers and context overlap.', on: true, category: 'Identity matching', severity: 'Human review' },
    { id: 'REC-03', title: 'Summary-to-detail reconciliation', desc: 'Compare submitted student rows against institution summary totals.', on: true, category: 'Reconciliation', severity: 'Return for correction' },
    { id: 'ANOM-04', title: 'Unusual submission change', desc: 'Flag material deviations from an institution baseline.', on: true, category: 'Anomaly monitoring', severity: 'Human review' },
    { id: 'MAP-05', title: 'Program reference mapping', desc: 'Check program codes against approved reference data.', on: true, category: 'Data quality', severity: 'Return for correction' },
    { id: 'YEAR-06', title: 'Academic year consistency', desc: 'Ensure the batch and each record use the intended reporting cycle.', on: false, category: 'Data quality', severity: 'Block submission' }
  ]);
  const [q, setQ] = useState('');

  return (
    <div className="page-stack">
      <PageHead
        eyebrow="POLICY & RULE CONFIGURATION / 08"
        title="Validation studio"
        desc="Configure the control layer that sits before identity verification and regulatory acceptance. Rules should be versioned, tested and auditable."
        actions={<Btn variant="primary" icon={Plus} onClick={() => alert('Demo: create-rule editor is a future backend capability.')}>Create rule</Btn>}
      />

      <div className="rule-hero">
        <div>
          <span>ACTIVE POLICY SET</span>
          <h2>Student Data Intake · 2026–27</h2>
          <p>Version 2.0 · Example rules controlling the synthetic validation pipeline</p>
        </div>
        <div className="rule-hero-score">
          <strong>{rules.filter(r => r.on).length}/{rules.length}</strong>
          <span>active rules</span>
        </div>
      </div>

      <div className="table-tools panel-tools">
        <div className="search-input">
          <Search size={15} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Find a rule…" />
        </div>
        <Badge tone="green">Rule engine active</Badge>
      </div>

      <div className="rules-grid">
        {rules.filter(r => (r.title + ' ' + r.id + ' ' + r.category).toLowerCase().includes(q.toLowerCase())).map(r => (
          <div className="rule-card" key={r.id}>
            <div className="rule-card-head">
              <span className="rule-id">{r.id}</span>
              <button className={cx('switch', r.on && 'on')} onClick={() => setRules(old => old.map(x => x.id === r.id ? { ...x, on: !x.on } : x))} aria-label={`Toggle ${r.title}`}><i /></button>
            </div>
            <h3>{r.title}</h3>
            <p>{r.desc}</p>
            <div className="rule-card-meta">
              <Badge tone="blue">{r.category}</Badge>
              <Badge tone={r.severity === 'Block submission' ? 'red' : 'amber'}>{r.severity}</Badge>
            </div>
            <div className="rule-card-foot">
              <span><CircleDot size={13} />{r.on ? 'Enabled' : 'Disabled'}</span>
              <button onClick={() => alert(`${r.id}\n${r.title}\n\n${r.desc}\n\nProduction implementation should include test cases, owner, effective date and version history.`)}>Inspect rule <ArrowRight size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="governance-note">
        <ShieldCheck size={18} />
        <div>
          <strong>Policy changes require governance</strong>
          <p>In production, a rule edit should create a new version, pass test cases, require authorised approval and preserve prior versions for audit. These toggles modify local demo state.</p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   9. VERIFICATION PAGE (CREDENTIAL VERIFICATION GATEWAY)
   ========================================================================== */
function VerificationPage({ credentialRequests, students }) {
  const [ref, setRef] = useState('VRF-2026-00842');
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState(null);

  function runVerification() {
    if (!consent || !ref.trim()) return;
    const match = credentialRequests.find(r => r.id.toLowerCase() === ref.trim().toLowerCase());
    if (match) {
      setResult({ found: true, details: match });
    } else {
      setResult({
        found: true,
        details: {
          id: ref.trim(),
          studentName: 'Simulated Student Record',
          institution: 'Participating Technical Institution',
          outcome: 'Valid · Verified Format',
          status: 'Processed'
        }
      });
    }
  }

  return (
    <div className="page-stack">
      <PageHead
        eyebrow="TRUST & CREDENTIALS / 09"
        title="Credential verification gateway"
        desc="Demonstrate a privacy-first verification request using a protected reference and minimum necessary disclosure."
        actions={<Badge tone="green"><LockKeyhole size={13} /> PRIVACY-FIRST DESIGN</Badge>}
      />

      <div className="verify-grid">
        <Panel title="Verify a record reference" sub="A reference-only flow for authorised verification requests">
          <div className="verify-form">
            <div className="verify-emblem"><ShieldCheck size={28} /></div>
            <h2>Confirm academic record</h2>
            <p>Enter the verification reference supplied by an authorised issuer. The prototype operates on synthetic demonstration data.</p>
            <label>
              Verification reference
              <input value={ref} onChange={e => { setRef(e.target.value); setResult(null); }} placeholder="VRF-2026-00000" />
            </label>
            <label className="consent">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
              I confirm this is a legitimate, authorised verification purpose.
            </label>
            <Btn variant="primary" icon={ScanSearch} className="wide-btn" disabled={!consent || !ref.trim()} onClick={runVerification}>
              Run demo verification
            </Btn>

            {result && (
              <div className="verify-result">
                <CheckCircle2 size={20} />
                <div>
                  <strong>Reference format verified · Synthetic demonstration</strong>
                  <p>Status: {result.details.outcome || 'Valid'}. No real personal or government databases were queried.</p>
                </div>
              </div>
            )}

            <div className="demo-reference">
              <span>Sample references:</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                {credentialRequests.slice(0, 3).map(cr => (
                  <button key={cr.id} onClick={() => { setRef(cr.id); setResult(null); }}>
                    {cr.id} <ArrowRight size={12} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <div className="verify-side">
          <div className="credential-preview">
            <div className="credential-top">
              <div><GraduationCap size={23} /></div>
              <span>ACADEMIC CREDENTIAL · DEMO</span>
              <Badge tone="green">SAMPLE</Badge>
            </div>
            <div className="credential-rule" />
            <h3>Academic record verification</h3>
            <p>Protected verification reference</p>
            <div className="credential-fields">
              <div><span>Reference ID</span><strong>{result?.details?.id || ref}</strong></div>
              <div><span>Issuer</span><strong>{result?.details?.institution || 'Demo Institution'}</strong></div>
              <div><span>Record type</span><strong>Enrolment status</strong></div>
              <div><span>Disclosure</span><strong>Minimum required</strong></div>
            </div>
            <div className="credential-qr">
              {Array.from({ length: 121 }, (_, i) => (
                <i key={i} style={{ background: ([0, 1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16, 17, 18, 22, 23, 24, 25, 26, 27, 28, 29, 33, 34, 35, 36, 37, 38, 39, 40, 44, 45, 46, 47, 48, 49, 50, 51, 55, 56, 57, 58, 59, 60, 61, 62, 66, 67, 68, 69, 70, 71, 72, 73, 77, 78, 79, 80, 81, 82, 83, 84, 88, 89, 90, 91, 92, 93, 94, 95, 99, 100, 101, 102, 103, 104, 105, 106, 110, 111, 112, 113, 114, 115, 116, 117].includes(i) || ((i * 7 + (i % 4) * 3) % 11 < 4)) ? '#172747' : '#fff' }} />
              ))}
            </div>
            <div className="credential-footer"><ShieldCheck size={14} /> Example only · not a real credential QR</div>
          </div>

          <div className="privacy-panel">
            <Shield size={19} />
            <div>
              <strong>Privacy by design</strong>
              <p>Never expose raw APAAR IDs in a URL or QR payload. Production verification requires authorised source integration, access logging, and carefully scoped minimum disclosure.</p>
            </div>
          </div>

          <div className="privacy-panel">
            <Fingerprint size={19} />
            <div>
              <strong>Identity is not inferred</strong>
              <p>A matching score or record-format check is not official identity proof. Verification must rely on authorised evidence sources.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   10. REPORTS PAGE (ANALYTICS & REPORTS)
   ========================================================================== */
function ReportsPage({ students, cases, batches, institutions, audit, credentialRequests }) {
  const [kind, setKind] = useState('Operational quality summary');
  const [period, setPeriod] = useState('2026–27');

  const choices = [
    { name: 'Operational quality summary', desc: 'Validation outcomes, issue trends and correction status.', icon: Gauge, count: students.length },
    { name: 'Student registry export', desc: 'Masked student records and configured validation statuses.', icon: Users, count: students.length },
    { name: 'Review case register', desc: 'Severity, evidence category, status and recommended action.', icon: ShieldAlert, count: cases.length },
    { name: 'Institution oversight', desc: 'Submission activity, data quality and reporting readiness.', icon: Landmark, count: institutions.length },
    { name: 'Batch processing report', desc: 'Submitted rows, pass counts, flagged records and outcomes.', icon: FileSpreadsheet, count: batches.length },
    { name: 'Audit activity report', desc: 'Traceable changes and decision events (demo only).', icon: History, count: audit.length }
  ];

  function exportIt() {
    if (kind === 'Student registry export') downloadCSV(students, 'student-registry-report.csv');
    else if (kind === 'Review case register') downloadCSV(cases, 'case-register-report.csv');
    else if (kind === 'Institution oversight') downloadCSV(institutions, 'institution-oversight-report.csv');
    else if (kind === 'Batch processing report') downloadCSV(batches, 'batch-processing-report.csv');
    else if (kind === 'Audit activity report') downloadCSV(audit, 'audit-trail-report.csv');
    else {
      downloadCSV([
        {
          report: kind,
          period,
          generated_at: new Date().toISOString(),
          students_tracked: students.length,
          institutions_in_network: institutions.length,
          open_review_cases: cases.filter(c => c.status !== 'Resolved').length,
          validation_batches_processed: batches.length,
          note: 'Synthetic prototype data export · SIH 2026 Problem 26263'
        }
      ], 'operational-quality-summary.csv');
    }
  }

  return (
    <div className="page-stack">
      <PageHead
        eyebrow="EVIDENCE & REPORTING / 10"
        title="Analytics & reports"
        desc="Produce transparent operational reports with clear scope, reporting period and data provenance."
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Btn icon={FileText} onClick={() => window.print()} title="Print or save report as PDF">
              Print / Save PDF
            </Btn>
            <Btn variant="primary" icon={Download} onClick={exportIt}>
              Export selected report
            </Btn>
          </div>
        }
      />

      <div className="report-selector panel">
        <label>
          Report type
          <select value={kind} onChange={e => setKind(e.target.value)}>
            {choices.map(c => <option key={c.name}>{c.name}</option>)}
          </select>
        </label>
        <label>
          Academic cycle
          <select value={period} onChange={e => setPeriod(e.target.value)}>
            <option>2026–27</option>
            <option>2025–26</option>
            <option>2024–25</option>
          </select>
        </label>
        <div className="report-preview">
          <FileText size={20} />
          <div>
            <strong>{kind}</strong>
            <span>Period {period} · {choices.find(c => c.name === kind)?.count || 500} records · Synthetic demonstration</span>
          </div>
          <Badge tone="green">Ready</Badge>
        </div>
      </div>

      <div className="report-grid">
        {choices.map(c => (
          <button className={cx('report-card', kind === c.name && 'selected')} key={c.name} onClick={() => setKind(c.name)}>
            <div className="report-card-icon"><c.icon size={20} /></div>
            <h3>{c.name}</h3>
            <p>{c.desc}</p>
            <div>
              <span>{kind === c.name ? 'Selected report' : 'Choose report'}</span>
              <ArrowRight size={15} />
            </div>
          </button>
        ))}
      </div>

      <div className="governance-note">
        <ShieldCheck size={18} />
        <div>
          <strong>Reporting integrity</strong>
          <p>Every production export should include data source, generation time, applied filters, reporting period and freshness. Do not present the seeded numbers as official AICTE statistics.</p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   11. AUDIT PAGE (AUDIT TRAIL)
   ========================================================================== */
function AuditPage({ audit }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All events');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 20;

  const filtered = useMemo(() => {
    return audit.filter(a => {
      const matchQ = `${a.action} ${a.actor} ${a.target}`.toLowerCase().includes(q.toLowerCase());
      const matchF = filter === 'All events' || a.type === filter;
      return matchQ && matchF;
    });
  }, [audit, q, filter]);

  useEffect(() => {
    setPageNumber(1);
  }, [q, filter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageNumber, pageSize]);

  return (
    <div className="page-stack">
      <PageHead
        eyebrow="ACCOUNTABILITY & TRACEABILITY / 11"
        title="Audit trail"
        desc="A demonstrator for the event history required to make sensitive data workflows accountable and reviewable."
        actions={<Btn icon={Download} onClick={() => downloadCSV(filtered, 'audit-trail-export.csv')}>Export visible events ({filtered.length})</Btn>}
      />

      <div className="audit-banner">
        <div><History size={22} /></div>
        <section>
          <strong>Trace every meaningful action ({audit.length} chronological events).</strong>
          <p>Production audit events should be server-generated, access-controlled, time-stamped, tamper-evident and retained under an approved policy. The entries below reflect synthetic demonstration events.</p>
        </section>
        <Badge tone="amber">DEMO AUDIT LOG</Badge>
      </div>

      <div className="metrics-grid compact">
        <Metric label="Events logged" value={String(audit.length)} icon={Activity} foot="synthetic audit journal" />
        <Metric label="Review decisions" value={audit.filter(a => a.type === 'Case action').length} icon={ClipboardCheck} tone="violet" foot="officer interventions" />
        <Metric label="Data operations" value={audit.filter(a => a.type === 'Data intake').length} icon={Database} tone="blue" foot="intake & submissions" />
      </div>

      <section className="panel">
        <div className="table-tools">
          <div className="search-input">
            <Search size={15} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search event, actor or target reference…" />
            {q && <button onClick={() => setQ('')}><X size={14} /></button>}
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option>All events</option>
            <option>Data intake</option>
            <option>Case action</option>
            <option>System</option>
          </select>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>TIME</th>
                <th>EVENT</th>
                <th>ACTOR</th>
                <th>RECORD / TARGET</th>
                <th>EVENT TYPE</th>
                <th>OUTCOME</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(a => (
                <tr key={a.id}>
                  <td className="mono">{a.time}</td>
                  <td><strong>{a.action}</strong></td>
                  <td>{a.actor}</td>
                  <td className="mono muted">{a.target}</td>
                  <td>
                    <Badge tone={a.type === 'Case action' ? 'violet' : a.type === 'Data intake' ? 'blue' : 'neutral'}>
                      {a.type}
                    </Badge>
                  </td>
                  <td><Badge tone="green">{a.outcome || 'Success'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!paginated.length && (
            <div className="empty">
              <Search size={24} />
              <strong>No matching audit events</strong>
              <span>Adjust search or event type filter.</span>
            </div>
          )}
        </div>

        <PaginationBar
          currentPage={pageNumber}
          totalPages={totalPages}
          onPageChange={setPageNumber}
          totalCount={filtered.length}
          pageSize={pageSize}
          itemName="audit events"
        />
      </section>
    </div>
  );
}

/* ==========================================================================
   12. SETTINGS PAGE (ACCESS & SETTINGS + SEED CONTROLS)
   ========================================================================== */
function SettingsPage({ onResetDemoData, totalCounts, activeRole = 'admin', setActiveRole, session, onSignOut }) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [toggles, setToggles] = useState({ mask: true, alerts: true, weekly: false, anomaly: true });

  const roleLabels = {
    admin: { title: 'Administrator', desc: 'Full demo workspace, institution oversight, reports, settings, and case management.' },
    institution_operator: { title: 'Institution Operator', desc: 'Institution records, data intake, validation results, and correction workflows.' },
    reviewer: { title: 'Reviewer', desc: 'Assigned review cases, identity-match candidates, evidence, and decision history.' }
  };

  return (
    <div className="page-stack">
      <PageHead
        eyebrow="PLATFORM GOVERNANCE / 12"
        title="Access & settings"
        desc="Explore role-aware views, notification preferences and the safeguards expected in a real regulatory platform."
      />

      <div className="settings-grid">
        <Panel title="Demonstration role" sub="Switch active persona to preview role-based view restrictions">
          <label className="settings-field">
            Active demo role
            <select value={activeRole} onChange={e => setActiveRole?.(e.target.value)}>
              <option value="admin">Administrator (Full Access)</option>
              <option value="institution_operator">Institution Operator (Intake & Registry)</option>
              <option value="reviewer">Reviewer (Case Desk & Candidate Matching)</option>
            </select>
          </label>
          <div className="role-card">
            <div><ShieldCheck size={20} /></div>
            <section>
              <strong>{roleLabels[activeRole]?.title || activeRole}</strong>
              <p>{roleLabels[activeRole]?.desc}</p>
              <small style={{ color: 'var(--text-tertiary)', display: 'block', marginTop: '4px' }}>
                Simulated frontend demonstration role. In production, server-enforced JWT / OAuth permissions protect sensitive endpoints.
              </small>
            </section>
          </div>

          <div style={{ marginTop: '12px', padding: '12px', background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="badge amber" style={{ fontSize: '9px', padding: '1px 6px' }}>DEMO SESSION</span>
              <small style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
                {session?.authenticatedAt ? `Started: ${new Date(session.authenticatedAt).toLocaleTimeString()}` : 'Simulation Mode'}
              </small>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Active Demo Identity: <strong style={{ color: 'var(--navy-900)' }}>{session?.email || 'regulatory.official@aicte.gov.in'}</strong>
            </div>
            {onSignOut && (
              <Btn variant="secondary" icon={LogOut} onClick={onSignOut} style={{ width: '100%', justifyContent: 'center', color: '#DC2626', borderColor: '#FECACA' }}>
                End Demonstration Session & Return to Portal
              </Btn>
            )}
          </div>

          <SectionLabel>SECURITY PRINCIPLES</SectionLabel>
          {['Least-privilege access', 'Masked identifiers by default', 'Server-side authorisation', 'Auditable decisions', 'Defined retention and deletion'].map(x => (
            <div className="security-principle" key={x}>
              <CheckCircle2 size={15} />{x}
            </div>
          ))}
        </Panel>

        <Panel title="Notification preferences" sub="Local UI preferences for the demo">
          <div className="settings-toggles">
            {[
              { key: 'mask', title: 'Mask identifiers by default', desc: 'Hide personal identifiers in list views.' },
              { key: 'alerts', title: 'Submission status alerts', desc: 'Surface completed and failed batch events.' },
              { key: 'anomaly', title: 'Data-quality alerts', desc: 'Show configured validation signals.' },
              { key: 'weekly', title: 'Weekly regulatory digest', desc: 'Summarise cases and institution readiness.' }
            ].map(t => (
              <div className="toggle-row" key={t.key}>
                <div>
                  <strong>{t.title}</strong>
                  <span>{t.desc}</span>
                </div>
                <button className={cx('switch', toggles[t.key] && 'on')} onClick={() => setToggles(s => ({ ...s, [t.key]: !s[t.key] }))}><i /></button>
              </div>
            ))}
          </div>
          <div className="privacy-panel">
            <Shield size={18} />
            <div>
              <strong>Production readiness checklist</strong>
              <p>Authentication, authorisation, encryption, approved integrations, consent/legal review, rate limiting, retention, monitoring and security testing remain backend responsibilities.</p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Synthetic Data Engine & Seed Controls (Phase 2)" sub="Manage deterministic seed data, entity volumes and demo resets">
        <div className="detail-cards" style={{ marginBottom: '16px' }}>
          <div><span>Student records</span><strong>{totalCounts?.students || 500}</strong></div>
          <div><span>Institutions</span><strong>{totalCounts?.institutions || 25}</strong></div>
          <div><span>Regulatory cases</span><strong>{totalCounts?.cases || 100}</strong></div>
          <div><span>Validation batches</span><strong>{totalCounts?.batches || 40}</strong></div>
          <div><span>Identity candidates</span><strong>{totalCounts?.matches || 120}</strong></div>
          <div><span>Audit events</span><strong>{totalCounts?.audit || 200}</strong></div>
        </div>

        <div className="evidence-box" style={{ marginBottom: '16px' }}>
          <RefreshCw size={18} />
          <div>
            <strong>Deterministic PRNG Seed (mulberry32)</strong>
            <p>The synthetic dataset uses deterministic generation with seed 20260315. All relational references between institutions, students, batches and cases are strictly validated. You can reset to this baseline anytime.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Btn variant="primary" icon={RefreshCw} onClick={() => setShowConfirmReset(true)}>
            Reset to Demonstration Seed State
          </Btn>
          <Btn icon={Download} onClick={() => demoDataService.exportDataset('students')}>
            Export Master Student CSV
          </Btn>
        </div>
      </Panel>

      {showConfirmReset && (
        <Modal
          title="Confirm Demo Dataset Reset"
          desc="Restore synthetic repository to deterministic seed baseline"
          onClose={() => setShowConfirmReset(false)}
          footer={
            <>
              <Btn onClick={() => setShowConfirmReset(false)}>Cancel</Btn>
              <button
                className="btn btn-danger"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => {
                  onResetDemoData();
                  setShowConfirmReset(false);
                }}
              >
                <RefreshCw size={15} /> Confirm Reset Dataset
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="evidence-box" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.06)' }}>
              <AlertTriangle size={20} className="red-text" />
              <div>
                <strong style={{ color: 'var(--red-text)' }}>Destructive Reset Warning</strong>
                <p>This action will discard any temporary in-memory changes, uploaded batch submissions, and officer case resolutions from this session.</p>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              The system will re-instantiate the synthetic dataset with 500 validated student records, 25 institutions, 40 batches, 120 candidate pairs, and 200 chronological audit events using seed <code>20260315</code>.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ==========================================================================
   GLOBAL SEARCH OVERLAY MODAL (PHASE 6)
   ========================================================================== */
function GlobalSearchModal({ isOpen, onClose, onNavigate, datasets }) {
  const [q, setQ] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQ('');
    }
  }, [isOpen]);

  // Search across entities
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return { all: [], students: [], institutions: [], cases: [], batches: [], matches: [], anomalies: [] };

    const studentHits = (datasets.students || [])
      .filter(s => `${s.name} ${s.id} ${s.apaar} ${s.institution} ${s.program}`.toLowerCase().includes(query))
      .slice(0, 6)
      .map(s => ({
        type: 'students',
        typeLabel: 'Student Record',
        id: s.id,
        title: s.name,
        badge: s.status,
        badgeTone: s.status === 'Verified' ? 'green' : s.status === 'Potential duplicate' ? 'red' : 'amber',
        subtitle: `${s.id} · ${s.institution} · DQI ${s.score}% · ${s.apaar}`,
        page: 'students',
        icon: Users,
        iconTone: 'blue'
      }));

    const instHits = (datasets.institutions || [])
      .filter(i => `${i.name} ${i.code} ${i.city} ${i.state || ''}`.toLowerCase().includes(query))
      .slice(0, 5)
      .map(i => ({
        type: 'institutions',
        typeLabel: 'Institution',
        id: i.code,
        title: i.name,
        badge: i.status,
        badgeTone: i.status === 'Healthy' ? 'green' : 'amber',
        subtitle: `${i.code} · ${i.city} · ${i.students} enrolled · DQI ${i.quality}%`,
        page: 'institutions',
        icon: Landmark,
        iconTone: 'green'
      }));

    const caseHits = (datasets.cases || [])
      .filter(c => `${c.id} ${c.title} ${c.person} ${c.institution}`.toLowerCase().includes(query))
      .slice(0, 5)
      .map(c => ({
        type: 'cases',
        typeLabel: 'Regulatory Case',
        id: c.id,
        title: `${c.id}: ${c.title}`,
        badge: `${c.severity} priority`,
        badgeTone: c.severity === 'High' ? 'red' : 'amber',
        subtitle: `${c.person} · ${c.institution} · ${c.status}`,
        page: 'cases',
        icon: AlertOctagon,
        iconTone: 'red'
      }));

    const batchHits = (datasets.batches || [])
      .filter(b => `${b.id} ${b.institution}`.toLowerCase().includes(query))
      .slice(0, 5)
      .map(b => ({
        type: 'batches',
        typeLabel: 'Validation Batch',
        id: b.id,
        title: `Batch ${b.id}`,
        badge: b.status,
        badgeTone: b.status === 'Accepted' ? 'green' : 'amber',
        subtitle: `${b.institution} · ${b.rows} rows · ${b.passed} passed · ${b.when}`,
        page: 'submissions',
        icon: CloudUpload,
        iconTone: 'blue'
      }));

    const matchHits = (datasets.matches || [])
      .filter(m => `${m.id} ${m.name} ${m.institution} ${m.ref} ${m.primaryId || ''}`.toLowerCase().includes(query))
      .slice(0, 5)
      .map(m => ({
        type: 'matches',
        typeLabel: 'Identity Conflict',
        id: m.id,
        title: `Candidate Pair ${m.id}: ${m.name}`,
        badge: `${m.confidence || 85}% match`,
        badgeTone: 'violet',
        subtitle: `${m.institution} ↔ ${m.primaryInstitution || 'Network'} · ${m.reason || 'Candidate conflict'}`,
        page: 'matching',
        icon: GitCompare,
        iconTone: 'violet'
      }));

    const anomalyHits = (datasets.anomalies || [])
      .filter(a => `${a.id} ${a.title} ${a.institutionName}`.toLowerCase().includes(query))
      .slice(0, 5)
      .map(a => ({
        type: 'anomalies',
        typeLabel: 'Anomaly Alert',
        id: a.id,
        title: `Alert ${a.id}: ${a.title}`,
        badge: a.severity,
        badgeTone: a.severity === 'Critical' ? 'red' : 'amber',
        subtitle: `${a.institutionName} · ${a.type} · ${a.status}`,
        page: 'anomalies',
        icon: ShieldAlert,
        iconTone: 'red'
      }));

    const all = [...studentHits, ...instHits, ...caseHits, ...batchHits, ...matchHits, ...anomalyHits];

    return {
      all,
      students: studentHits,
      institutions: instHits,
      cases: caseHits,
      batches: batchHits,
      matches: matchHits,
      anomalies: anomalyHits
    };
  }, [q, datasets]);

  const activeList = activeTab === 'all' ? results.all : (results[activeTab] || []);

  // Keyboard navigation
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < activeList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : activeList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeList[selectedIndex]) {
        const item = activeList[selectedIndex];
        onNavigate(item.page, item);
        onClose();
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div className="search-modal-backdrop" onMouseDown={onClose}>
      <div className="search-modal-card" onMouseDown={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="search-modal-input-row">
          <Search size={20} style={{ color: 'var(--blue-primary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => { setQ(e.target.value); setSelectedIndex(0); }}
            placeholder="Search across students, institutions, cases, batches, matching candidates, anomalies..."
          />
          {q && (
            <button className="icon-btn" onClick={() => setQ('')} aria-label="Clear query">
              <X size={16} />
            </button>
          )}
        </div>

        {q.trim() && (
          <div className="search-category-tabs">
            {[
              { id: 'all', label: `All (${results.all.length})` },
              { id: 'students', label: `Students (${results.students.length})` },
              { id: 'institutions', label: `Institutions (${results.institutions.length})` },
              { id: 'cases', label: `Cases (${results.cases.length})` },
              { id: 'batches', label: `Batches (${results.batches.length})` },
              { id: 'matches', label: `Candidates (${results.matches.length})` },
              { id: 'anomalies', label: `Anomalies (${results.anomalies.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => { setActiveTab(tab.id); setSelectedIndex(0); }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="search-results-container">
          {!q.trim() ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'var(--bg-subtle)', marginBottom: '12px', color: 'var(--blue-primary)' }}>
                <Search size={24} />
              </div>
              <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>Universal Synthetic Entity Search</h3>
              <p style={{ fontSize: '12.5px', maxWidth: '420px', margin: '0 auto 16px' }}>
                Type to search across 500 student records, 25 institutions, 100 cases, 40 batches, 120 matching candidates, and 30 anomaly signals.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span className="badge neutral" style={{ cursor: 'pointer' }} onClick={() => setQ('Rahul')}>Try "Rahul"</span>
                <span className="badge neutral" style={{ cursor: 'pointer' }} onClick={() => setQ('NIT')}>Try "NIT"</span>
                <span className="badge neutral" style={{ cursor: 'pointer' }} onClick={() => setQ('CASE-2101')}>Try "CASE-2101"</span>
                <span className="badge neutral" style={{ cursor: 'pointer' }} onClick={() => setQ('SUB-8812')}>Try "SUB-8812"</span>
              </div>
            </div>
          ) : activeList.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <AlertCircle size={28} style={{ color: 'var(--amber-500)', marginBottom: '10px' }} />
              <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>No synthetic records matched "{q}"</h3>
              <p style={{ fontSize: '12.5px' }}>Check for spelling errors or try searching by candidate name, institution code, or reference identifier.</p>
            </div>
          ) : (
            <div className="search-results-group">
              {activeList.map((item, idx) => {
                const ItemIcon = item.icon || FileText;
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={`${item.type}-${item.id}-${idx}`}
                    className={cx('search-result-item', isSelected && 'highlighted')}
                    onClick={() => {
                      onNavigate(item.page, item);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="search-result-item-left">
                      <div className="search-result-icon" style={{ background: `var(--${item.iconTone || 'blue'}-light)`, color: `var(--${item.iconTone || 'blue'}-500)` }}>
                        <ItemIcon size={16} />
                      </div>
                      <div className="search-result-info">
                        <div className="search-result-title">
                          <span>{item.title}</span>
                          <span className="badge" style={{ fontSize: '10px', padding: '2px 6px' }}>{item.typeLabel}</span>
                          {item.badge && <Badge tone={item.badgeTone}>{item.badge}</Badge>}
                        </div>
                        <div className="search-result-subtitle">{item.subtitle}</div>
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="search-modal-footer">
          <div className="search-keys-hint">
            <span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
            <span><kbd>Enter</kbd> open</span>
            <span><kbd>Esc</kbd> close</span>
          </div>
          <span>Sensitive identifiers masked</span>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   IMPORT PREVIEW MODAL (PHASE 6)
   ========================================================================== */
function ImportPreviewModal({ data, onCancel, onConfirm, onDownloadErrorReport }) {
  if (!data) return null;

  const { fileName, batchId, rows, validCount, warningCount, rejectedCount, duplicateCandidates = [] } = data;
  const committableCount = validCount + warningCount;

  return (
    <Modal
      title={`Batch Intake Preview · ${batchId}`}
      desc={`File: ${fileName} · Local in-browser schema & policy validation`}
      onClose={onCancel}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            {(warningCount > 0 || rejectedCount > 0) && (
              <Btn icon={Download} onClick={() => onDownloadErrorReport(rows.filter(r => r.status !== 'Verified'), batchId)}>
                Download Validation Error Report ({warningCount + rejectedCount})
              </Btn>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Btn onClick={onCancel}>Cancel</Btn>
            <Btn
              variant="primary"
              icon={CheckCircle2}
              onClick={onConfirm}
              disabled={committableCount === 0}
            >
              Confirm & Commit {committableCount} Records
            </Btn>
          </div>
        </div>
      }
    >
      <div className="import-stat-grid">
        <div className="import-stat-card">
          <span>Total Processed Rows</span>
          <strong>{rows.length}</strong>
        </div>
        <div className="import-stat-card">
          <span style={{ color: 'var(--green-500)' }}>Ready to Accept</span>
          <strong style={{ color: 'var(--green-500)' }}>{validCount}</strong>
        </div>
        <div className="import-stat-card">
          <span style={{ color: 'var(--amber-500)' }}>Flagged / Warnings</span>
          <strong style={{ color: 'var(--amber-500)' }}>{warningCount}</strong>
        </div>
        <div className="import-stat-card">
          <span style={{ color: 'var(--red-500)' }}>Rejected / Malformed</span>
          <strong style={{ color: 'var(--red-500)' }}>{rejectedCount}</strong>
        </div>
      </div>

      <div className="evidence-box" style={{ marginBottom: '16px' }}>
        <ShieldCheck size={18} />
        <div>
          <strong>Local In-Browser Processing</strong>
          <p>This intake batch is parsed and validated in browser client memory against AICTE schema rules (Rule APAAR-REQ-01, duplicate collisions, and identifier formats). Confirming commits records to the demonstration state.</p>
        </div>
      </div>

      <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
        Parsed Record Preview ({Math.min(rows.length, 8)} of {rows.length} rows)
      </div>

      <div className="table-scroll" style={{ maxHeight: '280px' }}>
        <table className="import-preview-table">
          <thead>
            <tr>
              <th>STUDENT</th>
              <th>MASKED APAAR</th>
              <th>INSTITUTION / PROGRAM</th>
              <th>QUALITY</th>
              <th>VALIDATION OUTCOME</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 8).map((r, i) => (
              <tr key={r.id || i}>
                <td>
                  <strong>{r.name}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{r.id}</div>
                </td>
                <td className="mono muted">{r.apaar}</td>
                <td>
                  <div style={{ fontSize: '12px' }}>{r.institution}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{r.program}</div>
                </td>
                <td>
                  <span className="mono" style={{ fontWeight: 700, color: r.score >= 90 ? 'var(--green-500)' : r.score >= 65 ? 'var(--amber-500)' : 'var(--red-500)' }}>
                    {r.score}%
                  </span>
                </td>
                <td>
                  <Badge tone={r.status === 'Verified' ? 'green' : r.status === 'Needs correction' ? 'amber' : 'red'}>
                    {r.status}
                  </Badge>
                  {r.issue && <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>{r.issue}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}


/* ==========================================================================
   MAIN APP ORCHESTRATOR
   ========================================================================== */
function App() {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem('apaar_auth_session');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeRole, setActiveRole] = useState(() => {
    try {
      const raw = localStorage.getItem('apaar_auth_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.role) return parsed.role;
      }
    } catch (e) {}
    return 'admin';
  });

  const [page, setPage] = useState(() => {
    try {
      const raw = localStorage.getItem('apaar_auth_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.role === 'institution_operator') return 'intake';
        if (parsed.role === 'reviewer') return 'matching';
      }
    } catch (e) {}
    return 'overview';
  });

  // Centralized datasets initialized from DemoDataService
  const [students, setStudents] = useState(() => demoDataService.getStudents());
  const [cases, setCases] = useState(() => demoDataService.getCases());
  const [batches, setBatches] = useState(() => demoDataService.getBatches());
  const [institutions, setInstitutions] = useState(() => demoDataService.getInstitutions());
  const [matches, setMatches] = useState(() => demoDataService.getMatches());
  const [audit, setAudit] = useState(() => demoDataService.getAuditEvents());
  const [anomalies, setAnomalies] = useState(() => demoDataService.getAnomalies());
  const [credentialRequests, setCredentialRequests] = useState(() => demoDataService.getCredentialRequests());

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [toast, setToast] = useState(null);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState(null);

  const [notificationHistory, setNotificationHistory] = useState([
    {
      id: 'NOTIF-01',
      title: 'High Priority Exception Queue',
      text: 'Priority review queue active: cases pending officer evaluation.',
      time: '10m ago',
      type: 'warning'
    },
    {
      id: 'NOTIF-02',
      title: 'Batch Intake Gate Synchronized',
      text: 'Deterministic seed engine active across 40 batches and 500 students.',
      time: '1h ago',
      type: 'info'
    }
  ]);

  const roleDetails = {
    admin: {
      name: 'Administrator',
      subtitle: 'AICTE National Bureau',
      initials: 'AD',
      description: 'Full workspace oversight, institution network supervision, validation studio, reports, settings, and deterministic seed resets.',
      allowedPages: ['overview', 'intake', 'students', 'matching', 'quality', 'insights', 'anomalies', 'cases', 'rules', 'submissions', 'lineage', 'simulator', 'institutions', 'verification', 'reports', 'audit', 'settings']
    },
    institution_operator: {
      name: 'Institution Operator',
      subtitle: 'Campus Submissions & Registry',
      initials: 'IO',
      description: 'Authorized access to institution student registry, batch intake gateway, validation rules studio, submission health monitoring, and lineage tracking.',
      allowedPages: ['overview', 'intake', 'students', 'quality', 'rules', 'submissions', 'lineage', 'simulator', 'institutions', 'verification']
    },
    reviewer: {
      name: 'Reviewer',
      subtitle: 'Regulatory Investigations Desk',
      initials: 'RO',
      description: 'Authorized access to candidate identity matching lab, priority regulatory case desk, AI explainability centre, anomaly observatory, and audit journals.',
      allowedPages: ['overview', 'students', 'matching', 'quality', 'insights', 'anomalies', 'cases', 'lineage', 'simulator', 'verification', 'reports', 'audit']
    }
  };

  function handleEnterDemo(role, email) {
    const selectedRole = role || 'admin';
    const newSession = {
      role: selectedRole,
      email: email || (selectedRole === 'admin' ? 'official.admin@aicte.gov.in' : selectedRole === 'institution_operator' ? 'registrar@iitd.ac.in' : 'officer.deshmukh@aicte.gov.in'),
      mode: 'demo',
      authenticatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('apaar_auth_session', JSON.stringify(newSession));
    } catch (e) {}
    setSession(newSession);
    setActiveRole(selectedRole);
    if (selectedRole === 'institution_operator') {
      setPage('intake');
    } else if (selectedRole === 'reviewer') {
      setPage('matching');
    } else {
      setPage('overview');
    }
    notify(`Demonstration Session Initialized · Role: ${roleDetails[selectedRole]?.name || selectedRole}`);
  }

  function handleSignOut() {
    try {
      localStorage.removeItem('apaar_auth_session');
    } catch (e) {}
    setSession(null);
    setRoleMenuOpen(false);
    setPage('overview');
  }

  function handleRoleChange(newRole) {
    setActiveRole(newRole);
    if (session) {
      const updated = { ...session, role: newRole };
      setSession(updated);
      try {
        localStorage.setItem('apaar_auth_session', JSON.stringify(updated));
      } catch (e) {}
    }
    notify(`Switched demonstration persona to: ${roleDetails[newRole]?.name || newRole}`);
  }

  // Keyboard shortcut Ctrl+K / Cmd+K for Global Search
  useEffect(() => {
    function handleGlobalKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const active = nav.flatMap(g => g.items).find(x => x[0] === page) || nav[0].items[0];

  function notify(text, type = 'success') {
    setToast({ text, type });
    setNotificationHistory(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        title: type === 'error' ? 'Validation Error' : type === 'warning' ? 'Regulatory Warning' : 'System Action Completed',
        text,
        time: 'Just now',
        type
      },
      ...prev
    ].slice(0, 15));
    setTimeout(() => setToast(null), 3400);
  }

  function logAction(action, target, type = 'Case action') {
    const updated = demoDataService.logAuditEvent(action, target, type);
    setAudit(updated);
  }

  function handleResetDemoData() {
    const reset = demoDataService.resetDemoData();
    setStudents(reset.students);
    setCases(reset.cases);
    setBatches(reset.batches);
    setInstitutions(reset.institutions);
    setMatches(reset.matches);
    setAudit(reset.auditEvents);
    setAnomalies(reset.anomalies || demoDataService.getAnomalies());
    setCredentialRequests(reset.credentialRequests);
    notify('Synthetic demonstration dataset reset to deterministic seed state (500 students, 25 institutions).', 'info');
  }

  function upload(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      notify('Please choose a valid CSV file (.csv format required).', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const { headers, rows } = parseCSV(String(reader.result || ''));
      if (!rows.length) {
        notify('No data rows found in this CSV file.', 'warning');
        return;
      }

      // Column header validation
      const hasName = headers.some(h => h.includes('name'));
      const hasApaar = headers.some(h => h.includes('apaar'));
      if (!hasName || !hasApaar) {
        notify(`Schema Validation Error: Required headers missing (${!hasName ? 'student_name ' : ''}${!hasApaar ? 'apaar_id' : ''}). Please download and use the official CSV template.`, 'error');
        return;
      }

      const batchId = `SUB-${8813 + Math.floor(Math.random() * 90)}`;
      const seenBatchApaar = new Set();
      let flaggedCount = 0;
      let duplicateCandidatesCreated = [];

      // Match institution by filename or fallback to registered institution
      const instMatch = institutions.find(i => 
        file.name.toLowerCase().includes(i.code.toLowerCase()) || 
        file.name.toLowerCase().includes(i.name.toLowerCase())
      ) || institutions[0];

      const processedStudents = rows.map((r, i) => {
        let errors = [];

        // Field normalization
        const sId = r.student_id?.trim() || r.id?.trim() || `STU-${Date.now().toString().slice(-4)}-${i + 1}`;
        const sName = r.student_name?.trim() || r.name?.trim() || 'Unnamed Candidate';
        const rawApaar = (r.apaar_id || r.apaar || '').trim();
        const instCode = r.institution_code?.trim() || instMatch.code;
        const progCode = r.program_code?.trim() || r.program?.trim() || 'B.Tech Information Technology';
        const acadYear = r.academic_year?.trim() || '2026–27';

        // Completeness checks
        if (!r.student_name && !r.name) errors.push('Student name missing');
        if (!rawApaar) errors.push('Mandatory APAAR ID missing (Rule APAAR-REQ-01)');

        // Format checks
        if (rawApaar && !/^\d{12}$/.test(rawApaar.replace(/\s+/g, '')) && !rawApaar.startsWith('TEST-')) {
          errors.push('APAAR format irregular (must be 12 numeric digits)');
        }

        // In-batch duplicate checks
        if (rawApaar && seenBatchApaar.has(rawApaar)) {
          errors.push('Duplicate APAAR identifier collision within batch');
        }
        if (rawApaar) seenBatchApaar.add(rawApaar);

        // Cross-dataset candidate duplicate check
        if (rawApaar) {
          const existingColliding = students.find(s => 
            s.apaar && s.apaar.endsWith(rawApaar.slice(-4)) && s.name.toLowerCase() === sName.toLowerCase()
          );
          if (existingColliding) {
            errors.push(`Cross-institution candidate match with ${existingColliding.id} (${existingColliding.institution})`);
            const candId = `M-${Date.now().toString().slice(-5)}`;
            duplicateCandidatesCreated.push({
              id: candId,
              name: sName,
              ref: sId,
              primaryId: existingColliding.id,
              institution: instCode,
              primaryInstitution: existingColliding.institution,
              confidence: 94,
              risk: 'High',
              reason: 'Identical masked identifier and student name across institutions',
              status: 'Candidate / Under Review',
              evidenceScores: { identifier: 98, name: 92, academic: 85 }
            });
          }
        }

        const isFlagged = errors.length > 0;
        if (isFlagged) flaggedCount++;

        return {
          id: sId,
          name: sName,
          institution: instCode,
          program: progCode,
          year: acadYear,
          apaar: rawApaar ? `•••• ${rawApaar.slice(-4)}` : 'Not provided',
          status: isFlagged ? 'Needs correction' : 'Review required',
          score: isFlagged ? Math.max(35, 80 - errors.length * 20) : 92,
          issue: errors.join('; ') || 'Standard intake validation passed',
          category: r.category?.trim() || 'Regular Admission',
          batchRef: batchId
        };
      });

      const passedCount = rows.length - flaggedCount;
      const rejectedCount = processedStudents.filter(s => s.score < 50).length;

      // Open Import Preview Modal
      setImportPreviewData({
        fileName: file.name,
        batchId,
        rows: processedStudents,
        validCount: passedCount,
        warningCount: Math.max(0, flaggedCount - rejectedCount),
        rejectedCount: rejectedCount,
        duplicateCandidates: duplicateCandidatesCreated,
        instMatch
      });
    };
    reader.readAsText(file);
  }

  function handleConfirmBatchImport() {
    if (!importPreviewData) return;
    const { batchId, rows, instMatch, duplicateCandidates, validCount, warningCount } = importPreviewData;

    // Update students
    demoDataService.updateStudents(old => [...rows, ...old]);
    setStudents(demoDataService.getStudents());

    // Update batches
    const newBatch = {
      id: batchId,
      institution: instMatch.name,
      rows: rows.length,
      passed: validCount,
      flagged: warningCount,
      when: 'Just now',
      status: warningCount === 0 ? 'Accepted' : 'Needs review'
    };
    demoDataService.updateBatches(old => [newBatch, ...old]);
    setBatches(demoDataService.getBatches());

    // Update matches if any new candidate pairs detected
    if (duplicateCandidates && duplicateCandidates.length > 0) {
      demoDataService.updateMatches(old => [...duplicateCandidates, ...old]);
      setMatches(demoDataService.getMatches());
    }

    // Record structured audit event
    logAction(
      `Batch ${batchId} ingested & committed: ${rows.length} rows processed (${validCount} passed, ${warningCount} flagged, ${duplicateCandidates?.length || 0} duplicate candidates detected)`,
      batchId,
      'Data intake'
    );

    setImportPreviewData(null);
    setPage('intake');
    notify(`Batch ${batchId} committed successfully: ${rows.length} rows imported (${warningCount} flagged for review).`, 'success');
  }


  const titleMap = {
    overview: 'Regulatory Command Centre',
    intake: 'Data intake',
    students: 'Student registry',
    matching: 'Identity Resolution Lab',
    quality: 'Data Quality Intelligence',
    insights: 'AI Decision Centre',
    anomalies: 'Anomaly Observatory',
    cases: 'Risk & case desk',
    rules: 'Validation studio',
    submissions: 'Submission Health Monitor',
    lineage: 'Data Lineage Explorer',
    simulator: 'Verification Simulator',
    institutions: 'Institution network',
    verification: 'Credential verification',
    reports: 'Analytics & reports',
    audit: 'Audit trail',
    settings: 'Access & settings'
  };

  const openCasesCount = cases.filter(c => c.status !== 'Resolved').length;

  if (!session) {
    return <LoginPortal onEnterDemo={handleEnterDemo} />;
  }

  return (
    <div className="app-shell">
      <aside className={cx('sidebar', mobileOpen && 'mobile-open', sidebarCollapsed && 'collapsed')}>
        <div className="brand">
          <div className="brand-symbol">
            <Fingerprint size={24} />
            <i />
          </div>
          <div className="brand-text">
            <strong>APAAR <span>VERIFY</span></strong>
            <small>AICTE REGULATORY SUITE</small>
          </div>
          <button className="mobile-close icon-btn" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="workspace">
          <div className="workspace-icon"><Landmark size={18} /></div>
          <div className="workspace-info">
            <strong>Regulation Bureau</strong>
            <span>AICTE Node · Demo Mode</span>
          </div>
          <ChevronDown size={14} className="workspace-arrow" />
        </div>

        <div className="sidebar-label">WORKSPACE ENVIRONMENT</div>
        <div className="environment"><i /><span style={{ textTransform: 'uppercase' }}>Demo Role: {roleDetails[activeRole]?.name || activeRole}</span></div>

        <nav>
          {nav.map(group => (
            <div className="nav-group" key={group.section}>
              <div className="nav-section">{group.section}</div>
              {group.items.map(([id, label, Icon]) => {
                const isRestrictedForRole = !roleDetails[activeRole]?.allowedPages?.includes(id);
                return (
                  <button
                    key={id}
                    className={cx('nav-item', page === id && 'active', isRestrictedForRole && 'restricted')}
                    onClick={() => { setPage(id); setMobileOpen(false); }}
                    title={isRestrictedForRole ? `${label} (Restricted for ${roleDetails[activeRole]?.name})` : label}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                    {isRestrictedForRole && <small style={{ background: 'var(--navy-800)', color: 'var(--amber-500)', fontSize: '9px' }}>LOCK</small>}
                    {id === 'cases' && !isRestrictedForRole && <small>{openCasesCount}</small>}
                    {id === 'insights' && !isRestrictedForRole && <em>AI</em>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div><Sparkles size={16} /><span>EVIDENCE-LED CONTROL</span></div>
            <strong>Every flag has a reason.</strong>
            <p>Investigate candidate conflicts and audit signals with transparent explainability.</p>
            <button onClick={() => setPage('matching')}>Open matching lab <ArrowRight size={13} /></button>
          </div>

          <div className="user-profile" onClick={() => setRoleMenuOpen(!roleMenuOpen)} style={{ cursor: 'pointer' }} title="Click to Switch Demo Persona / Sign Out">
            <div className="user-avatar">{roleDetails[activeRole]?.initials || 'DM'}</div>
            <div className="user-info">
              <strong>{roleDetails[activeRole]?.name || activeRole}</strong>
              <span>{roleDetails[activeRole]?.subtitle}</span>
            </div>
            <button className="icon-btn" title="End Demo Session" onClick={e => { e.stopPropagation(); handleSignOut(); }}>
              <LogOut size={16} style={{ color: 'var(--red-400)' }} />
            </button>
          </div>
        </div>
      </aside>

      <div className={cx('sidebar-shade', mobileOpen && 'show')} onClick={() => setMobileOpen(false)} />

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu icon-btn" onClick={() => setMobileOpen(true)} title="Open navigation">
              <Menu size={20} />
            </button>
            <button className="icon-btn desktop-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <Menu size={18} />
            </button>
            <div className="breadcrumbs">
              <span>AICTE NATIONAL PORTAL</span>
              <ChevronRight size={14} />
              <strong>{titleMap[page]}</strong>
            </div>
            <div className="live-node-pill"><i /><span>AICTE Node 01 · Connected</span></div>
          </div>

          <div className="topbar-right">
            <div className="global-search" onClick={() => setSearchOpen(true)} style={{ cursor: 'pointer' }} title="Open Universal Search (Ctrl+K)">
              <Search size={16} />
              <input
                readOnly
                placeholder="Search records, cases, institutions…"
                onClick={() => setSearchOpen(true)}
                style={{ cursor: 'pointer' }}
              />
              <kbd><Command size={11} /> K</kbd>
            </div>
            <button className="icon-btn bell-btn" onClick={() => setNotifications(!notifications)} title="Notifications">
              <Bell size={18} />
              {notificationHistory.length > 0 && <i />}
            </button>
            <div className="top-divider" />
            <button
              className="btn btn-secondary"
              onClick={handleSignOut}
              title="End demo session and return to Login Portal"
              style={{ fontSize: '11.5px', padding: '4px 9px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <LogOut size={13} style={{ color: 'var(--red-500)' }} />
              <span>Exit Demo</span>
            </button>
            <div className="top-user" onClick={() => setRoleMenuOpen(!roleMenuOpen)} style={{ cursor: 'pointer' }} title="Click to Switch Demo Persona / Sign Out">
              <div className="user-avatar">{roleDetails[activeRole]?.initials || 'DM'}</div>
              <div className="top-user-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong>{roleDetails[activeRole]?.name || activeRole}</strong>
                  <span className={cx('role-badge', activeRole)} style={{ fontSize: '9px', padding: '1px 5px' }}>DEMO</span>
                </div>
                <span>{roleDetails[activeRole]?.subtitle}</span>
              </div>
              <ChevronDown size={14} />
            </div>
          </div>

          {roleMenuOpen && (
            <div className="role-switcher-menu">
              <div style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Demo Persona ({session?.email?.split('@')[0] || 'User'})</span>
                <span className="badge amber" style={{ fontSize: '8.5px', padding: '1px 5px' }}>Demo Mode</span>
              </div>
              {Object.entries(roleDetails).map(([roleKey, details]) => (
                <button
                  key={roleKey}
                  className={cx('role-option-btn', activeRole === roleKey && 'active')}
                  onClick={() => {
                    handleRoleChange(roleKey);
                    setRoleMenuOpen(false);
                  }}
                >
                  <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>{details.initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: '12.5px', color: '#172033', display: 'block' }}>{details.name}</strong>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block', lineHeight: 1.3 }}>{details.subtitle}</span>
                  </div>
                </button>
              ))}
              <div style={{ padding: '8px 10px 4px', fontSize: '10.5px', color: 'var(--text-tertiary)', borderTop: '1px solid #F1F5F9', marginTop: '4px' }}>
                Client-side demonstration simulation of role permissions matrix.
              </div>
              <button
                className="role-option-btn"
                style={{ marginTop: '4px', borderTop: '1px solid #E2E8F0', paddingTop: '8px', color: '#B91C1C', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={handleSignOut}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LogOut size={14} />
                </div>
                <div style={{ minWidth: 0, textAlign: 'left' }}>
                  <strong style={{ fontSize: '12px', color: '#B91C1C', display: 'block' }}>End Demo Session</strong>
                  <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block' }}>Return to Login Portal</span>
                </div>
              </button>
            </div>
          )}

          {notifications && (
            <div className="notification-menu">
              <div className="notification-header">
                <strong>Notifications & Activity ({notificationHistory.length})</strong>
                <button className="icon-btn" onClick={() => setNotifications(false)}><X size={15} /></button>
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notificationHistory.map(n => (
                  <div className={cx('notification-item', n.type === 'error' ? 'alert' : n.type === 'warning' ? 'warning' : 'info')} key={n.id}>
                    {n.type === 'error' ? <AlertTriangle size={18} className="red-text" /> : n.type === 'warning' ? <AlertOctagon size={18} className="amber-text" /> : <CheckCircle2 size={18} className="green-text" />}
                    <span>
                      <strong>{n.title || 'System Notification'}</strong>
                      <small>{n.text}</small>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{n.time}</div>
                    </span>
                  </div>
                ))}
              </div>
              <div className="notification-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="text-link" onClick={() => { setNotificationHistory([]); setNotifications(false); }}>
                  Clear notifications
                </button>
                <button className="text-link" onClick={() => { setPage('audit'); setNotifications(false); }}>
                  Open audit log <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </header>

        <div className="content-scroll">
          {/* Printable Report Header */}
          <div className="print-header">
            <h2>AICTE APAAR VERIFYAI — OFFICIAL REGULATORY BRIEFING</h2>
            <p>National Student Verification & Regulatory Intelligence Platform · Problem Statement 26263</p>
            <small>Generated: {new Date().toLocaleString()} · Node: AICTE-CENTRAL-01 · Deterministic PRNG Seed 20260315</small>
          </div>

          {/* Role Access Restriction Guard */}
          {!roleDetails[activeRole]?.allowedPages?.includes(page) ? (
            <div className="role-restricted-view panel">
              <div className="role-restricted-icon">
                <ShieldAlert size={34} />
              </div>
              <h2>Restricted View · {titleMap[page]}</h2>
              <p style={{ maxWidth: '580px', color: 'var(--text-secondary)', margin: '8px auto 16px', fontSize: '13.5px' }}>
                The module <strong>{titleMap[page]}</strong> is unavailable to the <strong>{roleDetails[activeRole].name}</strong> persona to demonstrate least-privilege permission boundaries in regulatory environments.
              </p>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 18px', borderRadius: '8px', maxWidth: '540px', margin: '0 auto 20px', fontSize: '12.5px', textAlign: 'left' }}>
                <strong>Permitted scope for {roleDetails[activeRole].name}:</strong> {roleDetails[activeRole].description}
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Btn variant="primary" icon={ShieldCheck} onClick={() => { setActiveRole('admin'); notify('Switched persona to Administrator (Full Access)'); }}>
                  Switch to Administrator (Full Access)
                </Btn>
                {activeRole !== 'reviewer' && (
                  <Btn icon={UserCheck} onClick={() => { setActiveRole('reviewer'); notify('Switched persona to Reviewer'); }}>
                    Switch to Reviewer Role
                  </Btn>
                )}
                {activeRole !== 'institution_operator' && (
                  <Btn icon={Landmark} onClick={() => { setActiveRole('institution_operator'); notify('Switched persona to Institution Operator'); }}>
                    Switch to Institution Operator
                  </Btn>
                )}
              </div>
            </div>
          ) : (
            <>
              {page === 'overview' && (
                <Overview
                  students={students}
                  cases={cases}
                  batches={batches}
                  institutions={institutions}
                  matches={matches}
                  audit={audit}
                  setPage={setPage}
                  onNotify={notify}
                />
              )}

              {page === 'intake' && (
                <IntakePage
                  batches={batches}
                  setBatches={setBatches}
                  onUpload={upload}
                />
              )}

              {page === 'students' && (
                <StudentsPage
                  students={students}
                  setStudents={setStudents}
                  matches={matches}
                  cases={cases}
                  setCases={setCases}
                  batches={batches}
                  onLog={logAction}
                  onNavigate={setPage}
                  onNotify={notify}
                />
              )}

              {page === 'matching' && (
                <IdentityResolutionLab
                  matches={matches}
                  setMatches={setMatches}
                  students={students}
                  cases={cases}
                  setCases={setCases}
                  institutions={institutions}
                  onNavigate={setPage}
                  onLogAudit={logAction}
                  onNotify={notify}
                />
              )}

              {page === 'quality' && (
                <DataQualityIntelligence
                  students={students}
                  setStudents={setStudents}
                  institutions={institutions}
                  onNavigate={setPage}
                  onLogAudit={logAction}
                  onNotify={notify}
                />
              )}

              {page === 'cases' && (
                <CasesPage
                  cases={cases}
                  setCases={setCases}
                  students={students}
                  batches={batches}
                  setAnomalies={setAnomalies}
                  onLog={logAction}
                  onNavigate={setPage}
                  onNotify={notify}
                />
              )}

              {page === 'insights' && (
                <AiDecisionCentre
                  cases={cases}
                  students={students}
                  institutions={institutions}
                  onNavigate={setPage}
                  onLogAudit={logAction}
                  onNotify={notify}
                />
              )}

              {page === 'anomalies' && (
                <AnomalyObservatory
                  anomalies={anomalies}
                  setAnomalies={setAnomalies}
                  institutions={institutions}
                  batches={batches}
                  students={students}
                  cases={cases}
                  onNavigate={setPage}
                  onLogAudit={logAction}
                  onNotify={notify}
                />
              )}

              {page === 'submissions' && (
                <SubmissionHealthMonitor
                  batches={batches}
                  setBatches={setBatches}
                  institutions={institutions}
                  onNavigate={setPage}
                  onLogAudit={logAction}
                  onNotify={notify}
                />
              )}

              {page === 'lineage' && (
                <DataLineageExplorer
                  students={students}
                  batches={batches}
                  cases={cases}
                  audit={audit}
                  onNavigate={setPage}
                  onLogAudit={logAction}
                  onNotify={notify}
                />
              )}

              {page === 'simulator' && (
                <VerificationSimulator
                  onNavigate={setPage}
                  onLogAudit={logAction}
                  onNotify={notify}
                />
              )}

              {page === 'institutions' && (
                <InstitutionsPage
                  institutions={institutions}
                />
              )}

              {page === 'rules' && <RulesPage />}

              {page === 'verification' && (
                <VerificationPage
                  credentialRequests={credentialRequests}
                  students={students}
                />
              )}

              {page === 'reports' && (
                <ReportsPage
                  students={students}
                  cases={cases}
                  batches={batches}
                  institutions={institutions}
                  audit={audit}
                  credentialRequests={credentialRequests}
                />
              )}

              {page === 'audit' && (
                <AuditPage
                  audit={audit}
                />
              )}

              {page === 'settings' && (
                <SettingsPage
                  onResetDemoData={handleResetDemoData}
                  totalCounts={{
                    students: students.length,
                    institutions: institutions.length,
                    cases: cases.length,
                    batches: batches.length,
                    matches: matches.length,
                    audit: audit.length
                  }}
                  activeRole={activeRole}
                  setActiveRole={handleRoleChange}
                  session={session}
                  onSignOut={handleSignOut}
                />
              )}

              {!Object.keys(titleMap).includes(page) && (
                <div className="panel" style={{ padding: '48px 24px', textAlign: 'center', margin: '20px 0' }}>
                  <AlertCircle size={44} style={{ color: 'var(--amber-500)', margin: '0 auto 14px', display: 'block' }} />
                  <h2 style={{ marginBottom: '8px' }}>Module Route Not Found</h2>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px', fontSize: '13.5px' }}>
                    The requested route <code>{page}</code> could not be resolved in the AICTE demonstration platform.
                  </p>
                  <Btn variant="primary" icon={Home} onClick={() => setPage('overview')}>
                    Return to Regulatory Command Centre
                  </Btn>
                </div>
              )}
            </>
          )}

          <footer className="app-footer">
            <span>APAAR VERIFYAI <i /> SIH 2026 · National Platform Prototype v2.0 (Phase 2 Data Engine)</span>
            <span><Shield size={14} /> Synthetic demonstration dataset · 500 Students · 25 Institutions</span>
            <button onClick={() => notify('APAAR VerifyAI v2.0 · Centralized Synthetic Data Layer Active')}>Build v2.0.0</button>
          </footer>
        </div>
      </main>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(targetPage, item) => {
          setPage(targetPage);
          if (item && item.title) {
            notify(`Navigated to ${titleMap[targetPage] || targetPage} for ${item.title}`);
          }
        }}
        datasets={{ students, institutions, cases, batches, matches, anomalies }}
      />

      {/* Intake Batch Import Preview Modal */}
      <ImportPreviewModal
        data={importPreviewData}
        onCancel={() => setImportPreviewData(null)}
        onConfirm={handleConfirmBatchImport}
        onDownloadErrorReport={downloadErrorReport}
      />

      {toast && (
        <div className={cx('toast', toast.type === 'error' && 'toast-error', toast.type === 'warning' && 'toast-warning')}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : toast.type === 'warning' ? <AlertOctagon size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}
    </div>
  );
}

export default App;
