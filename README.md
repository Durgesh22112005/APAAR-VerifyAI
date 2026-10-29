# APAAR VerifyAI — Advanced SIH 2026 Prototype (PS 26263)

A multi-page React + Vite prototype for an APAAR ID-based student data management and verification platform for AICTE-approved institutions.

## Run locally

Requires Node.js 18+ recommended.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Build with `npm run build`.

## Screens and workflows

1. **Regulatory command centre** — submission pulse, readiness, action queue and end-to-end operating model.
2. **Data intake & quality gate** — CSV upload, schema checks, basic row-level required-field / duplicate checks, batch history and template export.
3. **Student registry** — search, status filtering, masked identifiers, quality indicators, record detail and CSV export.
4. **Identity matching lab** — compare synthetic candidate records, inspect match signals and create a clarification case.
5. **Risk & case desk** — evidence, confidence context, recommended next action, timeline, and local status changes.
6. **AI intelligence workbench** — simulated conversational assistant, explainable signals, ML concepts, model governance checklist and roadmap.
7. **Institution oversight** — institution cards, search, status filters and profiles.
8. **Validation studio** — toggle illustrative rules and inspect rule concepts.
9. **Credential verification gateway** — simulated reference-only flow and privacy design guidance.
10. **Analytics & reports** — choose a report and export sample records / cases / batches.
11. **Audit trail** — sample event history and newly created local events for case actions and uploads.
12. **Access & settings** — role/profile concept, preferences and production security checklist.

## CSV schema

Required headers:
- `student_id`
- `student_name`
- `apaar_id`
- `institution_code`
- `program_code`
- `academic_year`

Optional:
- `category`

Use the template download from Data Intake. Use synthetic values only.

## Important limitations

This is a frontend demonstration, not a production regulatory system. All seeded metrics and initial records are synthetic. UI state is held in memory and resets on refresh. CSV checks run in the browser and are not a substitute for backend validation. Identity matching examples, ML signals, forecasting concepts, the assistant and credential verification are illustrative. The assistant is rule-based simulation, not a live LLM. There is no live AICTE/APAAR integration, official identity check, backend, database, real authentication, permanent audit store, trained ML model, or production QR verification.

Do not upload real student data or present demo figures as official AICTE statistics.

## Recommended production architecture

- React + Vite frontend
- Spring Boot REST API with server-side validation
- MySQL or PostgreSQL
- Institution onboarding and server-enforced role-based access
- Secure, authorised integrations only
- Versioned rule engine and idempotent batch processing
- Candidate matching service with reviewer-controlled outcomes
- Audit events, encryption, masked identifiers, access monitoring and retention policy
- ML only after representative historical data, labelled outcomes, baseline evaluation, privacy review, false-positive analysis and drift monitoring
