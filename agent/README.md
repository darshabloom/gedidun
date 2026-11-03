# Marina OS Agent — isolated foundation prototype

**Status:** Design and implementation scaffold only. This branch is not deployed and has no access to Marina's Google Sheets, email, Granola, Tower information, or credentials.

## Product boundary

Gedidun remains the deterministic operational control layer. The agent is a persistent, evidence-grounded thinking and opportunity-discovery service; it cannot directly change commitments, send messages, make payments, publish, or create events.

Agent functions (pilot):
1. **Think:** work with Marina on hypotheses, alternative explanations, strategy and unresolved questions; keep observations separate from interpretations and decisions.
2. **Offer to help:** identify up to three strategically or tactically useful pieces of work, including integration/capability discovery; cite evidence, likely value and estimated effort.
3. **Remember feedback:** preserve accept/defer/reject responses and corrections in a durable, auditable record.
4. **Propose operations:** create *pending* structured proposals for deterministic Gedidun validation; no direct arbitrary database or Google Sheets writes.

## First two pilot cases

- P027 Tower Role — thinking continuity using synthetic data initially. Production handling of employer information is **blocked pending data-handling authorisation and access boundaries**.
- P001 Marina OS — propose and evaluate a small capability (e.g. utility provider API feasibility) using public information, with no banking permissions.

## Technology direction (proposed, not committed)

- Private backend: TypeScript HTTP service deployed separately from the public GitHub Pages site.
- Durable private database dedicated to Marina OS (do **not** reuse Yumorilnik Supabase).
- Hosted LLM calls from server only; never expose API keys to browser.
- Identity: verify authenticated user and ownership before any read or write. Browser bearer tokens must be validated server-side.
- Operational registry: keep existing Google Sheets as authority, accessed via a dedicated least-privilege adapter after permission and access design.
- Jobs: scheduler with retries, idempotency keys and execution limits once proactive workflows are tested.
- Audit: input source IDs, decision type, agent version, human approvals, tool execution outcome and read-back verification.

## Core record contracts

**Thinking entry:** id, owner, project_id, observed_at, source_ref, source_permission, raw_observation, interpretation, alternatives, confidence, next_question, state, revisions.

**Opportunity proposal:** id, owner, project_id, trigger_evidence[], objective, strategy, proposed_work, expected_output, estimated_time, dependencies, integration_options[], risk_level, permissions_requested[], proposed_by_agent_version, feedback (accept/defer/reject), state.

**Controlled operation:** id, owner, target_system, source_record_id, action_type, proposed_payload, expected_current_version, rationale, permission_class, approval_id, execution_state, verification_evidence.

**Learning:** id, proposal_id, correction, tested_scenario, observed_result, confidence, proposed_rule, rule_state (proposed/tested/adopted/rejected), reviewer.

Never treat model confidence as authorisation. Separate proposed work from verified execution.

## Deterministic safety invariants

- No mutation of Google Sheets or external systems directly by a language-model response.
- Operational write requests use typed commands, exact stable source IDs, expected-version checks, allowed transitions, idempotency keys and post-write read-back verification.
- Default deny for payments, communications, publications and calendar writes unless explicit authorisation for that specific action is recorded.
- Duplicate detection before accepting new actions.
- Uncertain source-to-project mapping becomes **Review**, never an invented commitment.
- Email content or a speculative AI inference is not definitive payment confirmation.
- Preserve original evidence, historical decisions, correction trail and user-visible audit.
- Never use employer confidential material without verified handling approval.

## Prototype acceptance tests

1. After two independent login sessions, the authorised user can retrieve an earlier thinking entry and continue the same hypothesis with source attribution.
2. Agent suggests three bounded P001/P027 opportunities and explains each source, expected output and permissions.
3. Rejecting a suggestion is saved and retrieved on the next session; a materially identical proposal is suppressed unless the source context changes.
4. An attempted direct payment, event booking or Google Sheets edit is rejected without a human-authorised typed operation.
5. Simulated duplicate tasks, mismatched source versions and missing provenance result in review/error, not silent writes.
6. No test dataset, credentials or private registry contents appear in public repo/build artifacts.

## Sequencing and decision gates

**Gate A (here):** isolated design/scaffold and synthetic tests; no paid resources.
**Gate B:** choose a dedicated hosting account/project and private database; confirm owner, costs, authentication and data policies before provision.
**Gate C:** deploy read-only persistent thinking/opportunity prototype; test new-session continuity.
**Gate D:** add deterministic Gedidun write gateway and approved integration adapters; verify audit/readback.
**Gate E:** add recurring background jobs only after proven quality and notification controls.

**Open:** hosting/database ownership (Vercel connection currently belongs to an existing team), ongoing API spend cap, authentication identity, Tower data clearance and source access for an unattended service.
