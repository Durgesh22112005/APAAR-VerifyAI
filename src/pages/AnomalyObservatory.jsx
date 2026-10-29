import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Filter, 
  Search, 
  Info, 
  ArrowRight, 
  Layers, 
  FileText, 
  Eye, 
  Check, 
  UserCheck, 
  BarChart3,
  RefreshCw,
  Download,
  RotateCcw
} from 'lucide-react';
import { demoDataService } from '../services/demoDataService.js';
import { downloadCSV } from '../utils/dataCalculations.js';

export default function AnomalyObservatory({ 
  anomalies,
  setAnomalies,
  institutions = [], 
  batches = [], 
  students = [], 
  cases = [], 
  onNavigate, 
  onLogAudit,
  onNotify
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  // Dynamic alert catalog derived deterministically from dataset or prop
  const alertsState = anomalies || demoDataService.getAnomalies();

  // Handle alert status updates
  const handleAcknowledge = (alertId) => {
    const next = alertsState.map(a => {
      if (a.id === alertId) {
        return { ...a, status: 'In Review' };
      }
      return a;
    });
    demoDataService.updateAnomalies(next);
    setAnomalies?.(demoDataService.getAnomalies());

    if (onLogAudit) {
      onLogAudit(
        'Regulatory Officer acknowledged Anomaly Alert #' + alertId,
        alertId,
        'Anomaly triage'
      );
    }
    if (onNotify) {
      onNotify('Anomaly Alert #' + alertId + ' acknowledged and moved to In Review.');
    }
  };

  const handleResolve = (alertId) => {
    const next = alertsState.map(a => {
      if (a.id === alertId) {
        return { ...a, status: 'Resolved' };
      }
      return a;
    });
    demoDataService.updateAnomalies(next);
    setAnomalies?.(demoDataService.getAnomalies());

    if (onLogAudit) {
      onLogAudit(
        'Regulatory Officer resolved Anomaly Alert #' + alertId + ' with verified mitigation notes.',
        alertId,
        'Anomaly triage'
      );
    }
    if (onNotify) {
      onNotify('Anomaly Alert #' + alertId + ' marked as Mitigated / Resolved.');
    }
  };

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alertsState.filter(a => {
      const matchSearch = searchTerm === '' || 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchSeverity = selectedSeverity === 'All' || a.severity === selectedSeverity;
      const matchStatus = selectedStatus === 'All' || a.status === selectedStatus;

      return matchSearch && matchSeverity && matchStatus;
    });
  }, [alertsState, searchTerm, selectedSeverity, selectedStatus]);

  // Aggregate metrics
  const totalAnomalies = alertsState.length;
  const criticalCount = alertsState.filter(a => a.severity === 'Critical').length;
  const openCount = alertsState.filter(a => a.status === 'Open').length;
  const resolvedCount = alertsState.filter(a => a.status === 'Resolved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <span style={{ 
              padding: '0.2rem 0.55rem', 
              borderRadius: '9999px', 
              fontSize: '0.7rem', 
              fontWeight: 700, 
              background: 'rgba(239, 68, 68, 0.12)', 
              color: '#ef4444', 
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <ShieldAlert size={12} /> FEATURE G &bull; REGULATORY SURVEILLANCE
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Cross-Campus Pattern Recognition Engine
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Cross-Institution Anomaly Observatory
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Surveillance radar identifying macro discrepancies, unusual intake shifts, clustered omissions, and repeated batch failures across AICTE institutions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              downloadCSV(filteredAlerts, 'anomaly-alerts.csv');
              onNotify?.(`Exported ${filteredAlerts.length} anomaly alert records.`);
            }}
          >
            <Download size={14} /> Export CSV
          </button>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.4rem 0.75rem', 
            borderRadius: '6px', 
            background: 'rgba(245, 158, 11, 0.1)', 
            border: '1px solid rgba(245, 158, 11, 0.25)',
            fontSize: '0.75rem',
            color: '#f59e0b',
            fontWeight: 600
          }}>
            <Info size={14} /> Rule-Based Pattern Analysis (Non-Punitive)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', 
        gap: '1rem' 
      }}>
        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '10px', 
            background: 'rgba(239, 68, 68, 0.12)', 
            color: '#ef4444', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Anomalies</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalAnomalies}</div>
            <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>{criticalCount} Critical Severity</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '10px', 
            background: 'rgba(245, 158, 11, 0.12)', 
            color: '#f59e0b', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Officer Review</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{openCount}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Awaiting acknowledgment</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '10px', 
            background: 'rgba(16, 185, 129, 0.12)', 
            color: '#10b981', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Resolved & Rectified</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{resolvedCount}</div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Mitigation logged</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '10px', 
            background: 'rgba(99, 102, 241, 0.12)', 
            color: '#6366f1', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Institutions Scanned</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{institutions.length}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>100% Pan-India Coverage</div>
          </div>
        </div>
      </div>

      {/* Surveillance Rule Benchmarks banner */}
      <div className="card" style={{ 
        padding: '1rem 1.25rem', 
        background: 'linear-gradient(135deg, rgba(24, 28, 47, 0.7) 0%, rgba(15, 18, 30, 0.9) 100%)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ 
            padding: '0.5rem', 
            borderRadius: '8px', 
            background: 'rgba(99, 102, 241, 0.15)', 
            color: '#818cf8' 
          }}>
            <BarChart3 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Deterministic Anomaly Rules Engine Active
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Scans ingestion batches for volumetric surges, systematic omissions, cross-campus enrollment clusters, and nomenclature drifts.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <strong>ANOM-01:</strong> Surge &gt;25%
          </span>
          <span style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <strong>ANOM-02:</strong> &gt;=3 Batch Rejects
          </span>
          <span style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <strong>ANOM-03:</strong> Missing APAAR &gt;40%
          </span>
          <span style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <strong>ANOM-04:</strong> Cross-Campus &gt;5%
          </span>
        </div>
      </div>

      {/* Main Work Area: Filters + Alert Feed & Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedAnomaly ? '1.2fr 1fr' : '1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left / List View */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} style={{ color: '#ef4444' }} />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Surveillance Alert Feed ({filteredAlerts.length})
              </h2>
            </div>

            {/* Filter controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '200px' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Filter alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.5rem 0.4rem 1.85rem',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                style={{
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
              </select>

              {(searchTerm || selectedSeverity !== 'All' || selectedStatus !== 'All') && (
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: '11px', padding: '0.35rem 0.6rem' }}
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSeverity('All');
                    setSelectedStatus('All');
                  }}
                >
                  <RotateCcw size={11} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* List of Alerts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredAlerts.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 0.75rem auto' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No anomalies matching filter criteria</p>
                <span style={{ fontSize: '0.75rem' }}>Try clearing filters or search term to view all alerts.</span>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isSelected = selectedAnomaly && selectedAnomaly.id === alert.id;
                
                let sevBg = 'rgba(107, 114, 128, 0.15)';
                let sevColor = '#9ca3af';
                if (alert.severity === 'Critical') { sevBg = 'rgba(239, 68, 68, 0.15)'; sevColor = '#ef4444'; }
                else if (alert.severity === 'High') { sevBg = 'rgba(249, 115, 22, 0.15)'; sevColor = '#f97316'; }
                else if (alert.severity === 'Medium') { sevBg = 'rgba(245, 158, 11, 0.15)'; sevColor = '#f59e0b'; }
                else if (alert.severity === 'Low') { sevBg = 'rgba(59, 130, 246, 0.15)'; sevColor = '#3b82f6'; }

                let statusBadge = (
                  <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                    Open
                  </span>
                );
                if (alert.status === 'In Review') {
                  statusBadge = (
                    <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                      In Review
                    </span>
                  );
                } else if (alert.status === 'Resolved') {
                  statusBadge = (
                    <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      Resolved
                    </span>
                  );
                }

                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAnomaly(alert)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #6366f1' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.7rem', 
                          fontWeight: 700, 
                          background: sevBg, 
                          color: sevColor 
                        }}>
                          {alert.severity}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {alert.id}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>&bull; {alert.category}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {statusBadge}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      {alert.title}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '0.625rem' }}>
                      <Building2 size={13} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{alert.institutionName}</span>
                      <span style={{ color: 'var(--text-muted)' }}>({alert.institutionId})</span>
                    </div>

                    <div style={{ 
                      padding: '0.5rem 0.75rem', 
                      borderRadius: '6px', 
                      background: 'var(--bg-tertiary)', 
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.625rem',
                      borderLeft: '3px solid #6366f1'
                    }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Detected Variance:</strong> {alert.metricValues.detected} ({alert.metricValues.variance})
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>Rule: {alert.ruleTriggered}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#818cf8', fontWeight: 600 }}>
                        Inspect Anomaly <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right / Detail Panel */}
        {selectedAnomaly && (
          <div className="card" style={{ padding: '1.25rem', position: 'sticky', top: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  ANOMALY SURVEILLANCE REPORT
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.15rem 0 0 0' }}>
                  {selectedAnomaly.id}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedAnomaly(null)}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              {selectedAnomaly.title}
            </div>

            {/* Institution Badge */}
            <div style={{ 
              padding: '0.75rem', 
              borderRadius: '8px', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Target Institution</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedAnomaly.institutionName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {selectedAnomaly.institutionId} &bull; Assigned: {selectedAnomaly.assignedTo}</div>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('institutions')}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                Campus Record <ExternalLink size={12} />
              </button>
            </div>

            {/* Evidence & Calculated Metrics */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Statistical Evidence & Telemetry
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '0.5rem', 
                background: 'var(--bg-secondary)', 
                padding: '0.75rem', 
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.75rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Historical Baseline:</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedAnomaly.metricValues.baseline}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Detected Intake:</span>
                  <div style={{ fontWeight: 700, color: '#ef4444' }}>{selectedAnomaly.metricValues.detected}</div>
                </div>
                <div style={{ gridColumn: 'span 2', marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Governing Rule:</span>
                  <div style={{ fontWeight: 600, color: '#818cf8' }}>{selectedAnomaly.ruleTriggered}</div>
                </div>
              </div>
            </div>

            {/* Why It Matters */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Regulatory Significance
              </div>
              <div style={{ 
                padding: '0.75rem', 
                borderRadius: '8px', 
                background: 'rgba(239, 68, 68, 0.08)', 
                border: '1px solid rgba(239, 68, 68, 0.2)',
                fontSize: '0.775rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5
              }}>
                {selectedAnomaly.whyItMatters}
              </div>
            </div>

            {/* Recommended Next Action */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Prescribed Corrective Action
              </div>
              <div style={{ 
                padding: '0.75rem', 
                borderRadius: '8px', 
                background: 'rgba(16, 185, 129, 0.08)', 
                border: '1px solid rgba(16, 185, 129, 0.2)',
                fontSize: '0.775rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5
              }}>
                {selectedAnomaly.recommendedAction}
              </div>
            </div>

            {/* Connected Links */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {selectedAnomaly.relatedBatch && (
                <button
                  onClick={() => onNavigate && onNavigate('submissions')}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.725rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  <Layers size={13} /> Inspect {selectedAnomaly.relatedBatch}
                </button>
              )}
              {selectedAnomaly.relatedCase && (
                <button
                  onClick={() => onNavigate && onNavigate('cases')}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.725rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  <FileText size={13} /> View {selectedAnomaly.relatedCase}
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              {selectedAnomaly.status === 'Open' ? (
                <button
                  onClick={() => handleAcknowledge(selectedAnomaly.id)}
                  className="btn btn-primary"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Eye size={14} /> Acknowledge Alert
                </button>
              ) : selectedAnomaly.status === 'In Review' ? (
                <button
                  onClick={() => handleResolve(selectedAnomaly.id)}
                  className="btn"
                  style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Check size={14} /> Mark as Mitigated / Resolved
                </button>
              ) : (
                <div style={{ 
                  flex: 1, 
                  textAlign: 'center', 
                  padding: '0.5rem', 
                  borderRadius: '6px', 
                  background: 'rgba(16, 185, 129, 0.15)', 
                  color: '#10b981', 
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}>
                  <CheckCircle2 size={16} /> Anomaly Successfully Resolved
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
