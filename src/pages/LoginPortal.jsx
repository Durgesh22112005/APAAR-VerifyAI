import React, { useState } from 'react';
import {
  Fingerprint, ShieldCheck, Lock, Mail, Eye, EyeOff, Sparkles,
  ArrowRight, Landmark, Users, UserCheck, AlertCircle, CheckCircle2,
  HelpCircle, X, ShieldAlert, KeyRound, Info
} from 'lucide-react';

const ROLES = [
  {
    id: 'admin',
    title: 'AICTE / Regulatory Administrator',
    short: 'Regulatory Admin',
    icon: Landmark,
    defaultEmail: 'admin.directorate@aicte.gov.in',
    description: 'Institution-wide oversight, cross-institution analytics, regulatory compliance monitoring, anomaly surveillance, and audit visibility.',
    accessHighlights: [
      'Universal Command Centre & High-level KPIs',
      'Cross-Institution Anomaly Observatory',
      'AI Decision Centre & Model Governance',
      'Central Audit Trail & System Configuration'
    ]
  },
  {
    id: 'institution_operator',
    title: 'Institution Administrator',
    short: 'Institution Admin',
    icon: Users,
    defaultEmail: 'registrar.office@dtu.ac.in',
    description: 'Institutional student data submission, batch intake validation results, schema compliance telemetry, and data-quality corrections.',
    accessHighlights: [
      'Batch Intake & Ingestion Telemetry',
      'Institutional Student Data Registry',
      'Schema Validation Studio & Field Rules',
      'Prioritized Data-Cleanup Queue'
    ]
  },
  {
    id: 'reviewer',
    title: 'Verification Officer / Reviewer',
    short: 'Verification Reviewer',
    icon: UserCheck,
    defaultEmail: 'officer.investigations@aicte.gov.in',
    description: 'Assigned review cases, identity discrepancy resolution, multi-factor evidence comparison, and resolution decision history.',
    accessHighlights: [
      'Candidate Identity Resolution Lab',
      'Priority Regulatory Risk & Case Desk',
      'Credential Verification Gateway',
      'Evidence Comparison & Decision Journal'
    ]
  }
];

export default function LoginPortal({ onEnterDemo }) {
  const [selectedRoleId, setSelectedRoleId] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoModal, setInfoModal] = useState(null);

  const activeRole = ROLES.find(r => r.id === selectedRoleId) || ROLES[0];

  function handleSignInAttempt(e) {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your institutional email and password to test sign in, or click "Explore Prototype" below for immediate demo access.');
      return;
    }

    // Honest feedback without hardcoded credential bypass
    setInfoModal({
      title: 'Simulated Authentication Gateway',
      icon: Info,
      content: (
        <div>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', lineHeight: 1.5 }}>
            You attempted to sign in as <strong>{email}</strong> for the <strong>{activeRole.title}</strong> role.
          </p>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '12.5px', color: '#334155' }}>
            <strong>Demonstration Notice:</strong> Direct password authentication is simulated for this Smart India Hackathon prototype to avoid requiring pre-shared credentials. Production deployment will integrate with <strong>AICTE Central Single Sign-On (SSO / SAML 2.0)</strong>.
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
            Click <strong>Enter Demo Session</strong> to immediately proceed with the selected role using deterministic synthetic records.
          </p>
        </div>
      ),
      actionText: `Enter Demo Session as ${activeRole.short}`,
      onAction: () => {
        setInfoModal(null);
        onEnterDemo(selectedRoleId, email);
      }
    });
  }

  function handleForgotPassword() {
    setErrorMessage('');
    setInfoModal({
      title: 'Credential Recovery Information',
      icon: KeyRound,
      content: (
        <div>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', lineHeight: 1.5 }}>
            Password reset and identity issuance in the production AICTE architecture are managed via the <strong>AICTE Institutional Nodal Officer Portal</strong> and <strong>National Directory Services</strong>.
          </p>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px 14px', borderRadius: '8px', fontSize: '12.5px', color: '#166534' }}>
            <strong>SIH Prototype Access:</strong> No credential recovery is required. You can freely explore all authorized modules by selecting any demonstration role.
          </div>
        </div>
      ),
      actionText: 'Got it, Return to Portal',
      onAction: () => setInfoModal(null)
    });
  }

  return (
    <div className="login-page-wrapper">
      {/* Background Decor */}
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />

      <div className="login-container">
        {/* Top Government Platform Notice */}
        <div className="login-top-banner">
          <div className="login-top-banner-content">
            <span className="login-flag-accent" />
            <span>AICTE Student Identity & Institutional Regulatory Oversight System</span>
            <span className="login-badge-pill">SIH 2026 Prototype — Demonstration Environment</span>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="login-card">
          {/* Card Tri-color Accent Bar */}
          <div className="login-tricolor-bar" />

          {/* Header */}
          <div className="login-header">
            <div className="login-brand-icon">
              <Fingerprint size={28} />
              <div className="login-brand-ring" />
            </div>
            <h1>APAAR <span>VerifyAI</span></h1>
            <h2>Student Data Verification & Institutional Compliance Portal</h2>
            <p>Authorized access point for AICTE regulators, institution registrars, and verification officers.</p>
          </div>

          {/* Step 1: Role-Based Access Selection */}
          <div className="login-section">
            <label className="login-section-label">
              <span>01 / SELECT YOUR DEMONSTRATION ROLE</span>
              <small>Configures accessible modules & permissions</small>
            </label>

            <div className="login-role-grid">
              {ROLES.map(role => {
                const Icon = role.icon;
                const isSelected = role.id === selectedRoleId;
                return (
                  <button
                    key={role.id}
                    type="button"
                    className={`login-role-card ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedRoleId(role.id);
                      setErrorMessage('');
                    }}
                  >
                    <div className="login-role-card-header">
                      <div className="login-role-icon">
                        <Icon size={16} />
                      </div>
                      <span className="login-role-radio">
                        <i />
                      </span>
                    </div>
                    <strong>{role.title}</strong>
                    <span>{role.short}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Role Responsibility Description Box */}
            <div className="login-role-responsibilities">
              <div className="login-resp-head">
                <CheckCircle2 size={14} />
                <strong>Role Responsibilities: {activeRole.title}</strong>
              </div>
              <p>{activeRole.description}</p>
              <div className="login-resp-tags">
                {activeRole.accessHighlights.map((tag, idx) => (
                  <span key={idx}>&bull; {tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Authentication Fields */}
          <form className="login-form" onSubmit={handleSignInAttempt}>
            <div className="login-section-label" style={{ marginBottom: '10px' }}>
              <span>02 / AUTHENTICATION CREDENTIALS</span>
              <small>Simulated form validation</small>
            </div>

            {errorMessage && (
              <div className="login-error-banner">
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="login-field">
              <label>Official or Institutional Email</label>
              <div className="login-input-box">
                <Mail size={16} />
                <input
                  type="email"
                  placeholder={activeRole.defaultEmail}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label>Institutional Password</label>
                <button
                  type="button"
                  className="login-forgot-link"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>
              <div className="login-input-box">
                <Lock size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter institutional credentials..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="login-action-row">
              <button type="submit" className="login-btn-primary">
                Sign In with Credentials
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span>OR EXPLORE WITHOUT CREDENTIALS</span>
          </div>

          {/* Step 3: Explore Prototype Direct Access (SIH Evaluator Flow) */}
          <div className="login-demo-access-box">
            <div className="login-demo-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} style={{ color: 'var(--blue-primary)' }} />
                <strong>Direct Evaluator Demonstration Access</strong>
              </div>
              <p>
                Enter the prototype immediately without requiring usernames or passwords. Session opens with <strong>500 deterministic synthetic records</strong> configured for the <strong>{activeRole.title}</strong> persona.
              </p>
            </div>

            <button
              type="button"
              className="login-btn-explore"
              onClick={() => onEnterDemo(selectedRoleId, email || activeRole.defaultEmail)}
            >
              <span>Explore Prototype as {activeRole.short}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Security & Regulatory Notice */}
          <div className="login-security-notice">
            <ShieldCheck size={16} />
            <div>
              <strong>Protected Regulatory Demonstration Environment</strong>
              <p>
                SIH Problem Statement 26263. All student records, identity matches, institution codes, and compliance scores are generated synthetically. No actual student PII or live government databases are accessed.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="login-footer">
          <div className="login-footer-links">
            <span>AICTE Regulatory Architecture</span>
            <span>&bull;</span>
            <span>APAAR ID Scheme Compliance</span>
            <span>&bull;</span>
            <span>Zero-Knowledge Proof Concept</span>
            <span>&bull;</span>
            <span>SIH 2026</span>
          </div>
          <div className="login-footer-copy">
            &copy; 2026 APAAR VerifyAI Prototype &bull; Centralized Student Data Verification & Regulatory Oversight Platform
          </div>
        </footer>
      </div>

      {/* Informational / Forgot Password Modal */}
      {infoModal && (
        <div className="modal-layer" onMouseDown={() => setInfoModal(null)} role="dialog" aria-modal="true">
          <div className="modal" style={{ maxWidth: '520px' }} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {infoModal.icon && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--blue-light)', color: 'var(--blue-primary)', display: 'grid', placeItems: 'center' }}>
                    <infoModal.icon size={17} />
                  </div>
                )}
                <div>
                  <h2>{infoModal.title}</h2>
                  <p>AICTE Regulatory Suite · Demonstration Protocol</p>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setInfoModal(null)} aria-label="Close dialog">
                <X size={18} />
              </button>
            </div>

            <div className="modal-content" style={{ padding: '20px' }}>
              {infoModal.content}
            </div>

            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setInfoModal(null)}>Close</button>
              {infoModal.actionText && (
                <button
                  className="btn btn-primary"
                  onClick={infoModal.onAction || (() => setInfoModal(null))}
                >
                  {infoModal.actionText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
