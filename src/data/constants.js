/**
 * APAAR VerifyAI — Constants and Reference Data
 * SIH Problem Statement 26263 — Synthetic Regulatory Intelligence Dataset
 */

export const DISCLAIMER_NOTE = 'Synthetic demonstration data. Not connected to official AICTE, APAAR, or government databases.';

export const VERIFICATION_STATUSES = {
  VERIFIED: 'Verified',
  POTENTIAL_DUPLICATE: 'Potential duplicate',
  NEEDS_CORRECTION: 'Needs correction',
  REVIEW_REQUIRED: 'Review required',
  INCOMPLETE: 'Incomplete',
  REJECTED: 'Rejected'
};

export const CASE_SEVERITY = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

export const CASE_STATUSES = {
  OPEN: 'Open',
  IN_REVIEW: 'In review',
  WAITING_INSTITUTION: 'Waiting on institution',
  ESCALATED: 'Escalated',
  RESOLVED: 'Resolved'
};

export const CASE_TYPES = {
  IDENTITY_CONFLICT: 'Identity conflict',
  RECONCILIATION: 'Reconciliation',
  DATA_QUALITY: 'Data quality',
  ANOMALY_SIGNAL: 'Anomaly signal',
  POLICY_VIOLATION: 'Policy violation'
};

export const BATCH_STATUSES = {
  ACCEPTED: 'Accepted',
  NEEDS_REVIEW: 'Needs review',
  NEEDS_CORRECTION: 'Needs correction',
  PROCESSING: 'Processing'
};

export const INSTITUTION_STATUSES = {
  HEALTHY: 'Healthy',
  ACTION_NEEDED: 'Action needed',
  REVIEW_REQUIRED: 'Review required'
};

export const STUDENT_CATEGORIES = [
  'Regular',
  'Lateral Entry',
  'NRI',
  'OCI',
  'PMSSS (J&K)',
  'TFW (Tuition Fee Waiver)'
];

export const ACADEMIC_YEARS = ['2026–27', '2025–26', '2024–25'];

export const PROGRAMS = [
  { code: 'CSE', name: 'B.E. Computer Science & Engineering' },
  { code: 'IT', name: 'B.Tech Information Technology' },
  { code: 'AI-DS', name: 'B.Tech Artificial Intelligence & Data Science' },
  { code: 'ECE', name: 'B.E. Electronics & Communication' },
  { code: 'EEE', name: 'B.E. Electrical & Electronics' },
  { code: 'MECH', name: 'B.E. Mechanical Engineering' },
  { code: 'CIVIL', name: 'B.E. Civil Engineering' },
  { code: 'CYBER', name: 'B.Tech Cyber Security' },
  { code: 'ROBOT', name: 'B.Tech Robotics & Automation' },
  { code: 'BIOTECH', name: 'B.Tech Biotechnology' },
  { code: 'MCA', name: 'Master of Computer Applications' },
  { code: 'MBA-TECH', name: 'MBA Technology Management' }
];

export const INDIAN_STATES_CITIES = [
  { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'] },
  { state: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'] },
  { state: 'Maharashtra', cities: ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Aurangabad'] },
  { state: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'] },
  { state: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'] },
  { state: 'Uttar Pradesh', cities: ['Noida', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra'] },
  { state: 'Delhi NCR', cities: ['New Delhi', 'Gurugram', 'Faridabad', 'Ghaziabad'] },
  { state: 'Gujarat', cities: ['Ahmedabad', 'Vadodara', 'Surat', 'Rajkot'] },
  { state: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'] },
  { state: 'West Bengal', cities: ['Kolkata', 'Durgapur', 'Siliguri', 'Kharagpur'] },
  { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur'] },
  { state: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'] }
];

export const AUDIT_EVENT_TYPES = [
  'Data intake',
  'Case action',
  'Identity match',
  'System',
  'Credential request',
  'Rule configuration',
  'Report export'
];
