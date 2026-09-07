# Zera PS 2.0 Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean-room Zera PS 2.0 vertical slice that supports a complete offline emergency-department attendance lifecycle with safe temporal documentation and a chest-pain reference protocol.

**Architecture:** A strict TypeScript browser application centered on the `Attendance` aggregate. UI calls application commands/queries; domain owns clinical invariants; declarative protocols extend the domain without scenario branches in generic engines; infrastructure provides IndexedDB, audit persistence, and PWA caching.

**Tech Stack:** TypeScript 5.x strict mode, Vite 7.x, Vitest 3.x, fake-indexeddb 6.x, Playwright 1.x, browser DOM APIs, IndexedDB, Service Worker, Web App Manifest.

**Spec:** `docs/superpowers/specs/2026-09-07-zera-ps-2-core-design.md`

## Global Constraints

- Build on an isolated implementation branch/worktree; never implement on `main`.
- Legacy runtime modules are requirements/regression references only; do not import them into the new runtime.
- No backend, cloud sync, authentication, telemetry, or clinical-data network API.
- No React, Vue, Svelte, or state-management framework in Core.
- TypeScript `strict: true`; avoid `any` in domain/application code.
- IndexedDB is the primary persistent store behind `AttendanceRepository`.
- Clinical unknown/default state never produces a negative or performed finding.
- Reassessment never overwrites admission; later results never overwrite earlier temporal results.
- Score lifecycle remains `available ≠ applicable ≠ calculable ≠ applied`.
- Generated documents remain editable, and manual edits are never silently overwritten.
- UI navigation cannot mutate clinical stage or truth.
- Persistence failure must be visible and cannot be represented as successful autosave.
- Chest pain is the only Core reference protocol; broader protocol migration is deferred.

---

## File Structure

```text
src-v2/
├── domain/
│   ├── clinical/clinical-value.ts
│   ├── attendance/attendance.ts
│   ├── attendance/attendance-events.ts
│   ├── attendance/attendance-stage.ts
│   ├── attendance/attendance-invariants.ts
│   ├── documents/document-model.ts
│   └── protocols/protocol.ts
├── application/
│   ├── repository/attendance-repository.ts
│   ├── commands/attendance-commands.ts
│   ├── queries/attendance-queries.ts
│   └── services/document-builder.ts
├── infrastructure/
│   ├── storage/indexeddb-attendance-repository.ts
│   └── audit/audit-event.ts
├── protocols/
│   ├── registry.ts
│   └── scenarios/chest-pain.ts
├── ui/
│   ├── app-controller.ts
│   └── render-app.ts
└── main.ts

public-v2/
├── manifest.webmanifest
└── service-worker.js

tests-v2/
├── domain/
├── application/
├── persistence/
├── documents/
├── protocols/
└── browser/

index-v2.html
vite-v2.config.ts
tsconfig.v2.json
```

The `src-v2`/`tests-v2` naming is deliberate during coexistence. Replacement/renaming of the legacy runtime happens only after parity review.

---

### Task 1: Toolchain and isolated runtime shell

**Files:**
- Create: `tsconfig.v2.json`
- Create: `vite-v2.config.ts`
- Create: `index-v2.html`
- Create: `src-v2/main.ts`
- Create: `tests-v2/smoke.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run v2:test`, `npm run v2:build`, `npm run v2:verify`.
- Produces: a standalone Vite entry at `index-v2.html` that does not import legacy runtime modules.

- [ ] **Step 1: Add the failing smoke test** asserting the new entry module exports `ZERA_PS_V2_RUNTIME = 'clean-room'`.
- [ ] **Step 2: Run `npm run v2:test -- tests-v2/smoke.test.ts` and confirm failure because the V2 toolchain/module does not exist.**
- [ ] **Step 3: Add TypeScript/Vite/Vitest/fake-indexeddb/Playwright dev dependencies and V2 scripts without changing legacy `test`/`verify` scripts.**
- [ ] **Step 4: Create strict TS config, Vite config, HTML entry, and minimal `src-v2/main.ts` exporting the runtime marker.**
- [ ] **Step 5: Run `npm run v2:verify` and `npm run verify`; both must pass.**
- [ ] **Step 6: Commit `chore(v2): scaffold isolated TypeScript runtime`.**

---

### Task 2: ClinicalValue semantic model

**Files:**
- Create: `src-v2/domain/clinical/clinical-value.ts`
- Create: `tests-v2/domain/clinical-value.test.ts`

**Interfaces:**
- Produces: `ClinicalInformationState`, `ClinicalSource`, `ClinicalValue<T>`, `unknownClinicalValue<T>()`, `recordClinicalValue<T>()`, `canRenderClinicalValue()`.
- Constraint: unknown values have no fabricated source, value, observation, or confirmation timestamp.

- [ ] **Step 1: Write failing tests** for unknown, present, denied, not-informed, and not-assessed states; assert only explicit present/denied values can render factual polarity.
- [ ] **Step 2: Run the focused test and confirm module-not-found failure.**
- [ ] **Step 3: Implement discriminated unions so invalid combinations are difficult/impossible to construct through public factories.**
- [ ] **Step 4: Run focused tests and typecheck.**
- [ ] **Step 5: Commit `feat(v2): model explicit clinical information states`.**

---

### Task 3: Attendance aggregate and temporal invariants

**Files:**
- Create: `src-v2/domain/attendance/attendance-stage.ts`
- Create: `src-v2/domain/attendance/attendance-events.ts`
- Create: `src-v2/domain/attendance/attendance.ts`
- Create: `src-v2/domain/attendance/attendance-invariants.ts`
- Create: `tests-v2/domain/attendance.test.ts`

**Interfaces:**
- Consumes: `ClinicalValue<T>` from Task 2.
- Produces: `Attendance`, `AdmissionRecord`, `TemporalResult`, `Reassessment`, `Outcome`, `startAttendance()`, `transitionStage()`, `recordTemporalResult()`, `startReassessment()`, `correctAdmission()`.
- `correctAdmission()` is the only post-reassessment admission correction path and must emit an explicit correction audit event rather than silently rewriting history.

- [ ] **Step 1: Write failing tests** for canonical stage transitions, serial results, immutable historical admission semantics, reassessment addition, and explicit correction.
- [ ] **Step 2: Run focused tests and confirm failures.**
- [ ] **Step 3: Implement minimal aggregate functions as pure functions returning new state plus domain events.**
- [ ] **Step 4: Add invariant guards for illegal stage transitions and attempts to mutate historical admission through the normal update path.**
- [ ] **Step 5: Run domain tests and typecheck.**
- [ ] **Step 6: Commit `feat(v2): add temporal attendance aggregate`.**

---

### Task 4: Audit event vocabulary and repository contract

**Files:**
- Create: `src-v2/infrastructure/audit/audit-event.ts`
- Create: `src-v2/application/repository/attendance-repository.ts`
- Create: `tests-v2/application/repository-contract.test.ts`

**Interfaces:**
- Consumes: `Attendance` and domain events from Task 3.
- Produces: `AuditEvent`, `AttendanceRepository` with `create`, `getById`, `save`, `listDrafts`, `archive`.
- `save(attendance, events)` is one logical persistence operation.

- [ ] **Step 1: Write failing compile/runtime contract tests using an in-memory repository test double.**
- [ ] **Step 2: Implement audit event normalization and repository interface.**
- [ ] **Step 3: Verify domain events can be mapped without embedding UI metadata or clinical inference.**
- [ ] **Step 4: Run tests/typecheck.**
- [ ] **Step 5: Commit `feat(v2): define audit and repository contracts`.**

---

### Task 5: Application command layer

**Files:**
- Create: `src-v2/application/commands/attendance-commands.ts`
- Create: `tests-v2/application/attendance-commands.test.ts`

**Interfaces:**
- Consumes: `AttendanceRepository`, aggregate functions.
- Produces: `AttendanceCommandService` methods `startAttendance`, `updateAdmission`, `recordClinicalValue`, `recordResult`, `startReassessment`, `updateReassessment`, `applyScore`, `changeOutcome`, `finalizeAttendance`.
- Every mutating command persists the resulting snapshot and corresponding audit events before returning success.

- [ ] **Step 1: Write failing tests with an in-memory repository** for successful commands, invariant rejection, and persistence failure propagation.
- [ ] **Step 2: Implement command service with no DOM/storage implementation imports.**
- [ ] **Step 3: Assert a failed repository save never returns a successful command result.**
- [ ] **Step 4: Run application/domain tests.**
- [ ] **Step 5: Commit `feat(v2): add attendance command service`.**

---

### Task 6: IndexedDB persistence and migrations

**Files:**
- Create: `src-v2/infrastructure/storage/indexeddb-attendance-repository.ts`
- Create: `src-v2/infrastructure/storage/schema.ts`
- Create: `tests-v2/persistence/indexeddb-attendance-repository.test.ts`

**Interfaces:**
- Implements: `AttendanceRepository`.
- Produces: `openZeraPsDatabase()`, `IndexedDbAttendanceRepository`.
- Stores attendance snapshots and audit events transactionally in one IndexedDB transaction.

- [ ] **Step 1: Write failing fake-indexeddb tests** for create/get/save/list/archive, transaction rollback, and schema version 1 opening.
- [ ] **Step 2: Implement schema with separate `attendances` and `auditEvents` object stores and explicit version upgrade function.**
- [ ] **Step 3: Implement repository transaction semantics; abort must leave prior snapshot/audit state intact.**
- [ ] **Step 4: Run persistence and application tests.**
- [ ] **Step 5: Commit `feat(v2): persist attendances atomically in IndexedDB`.**

---

### Task 7: Protocol contract and registry

**Files:**
- Create: `src-v2/domain/protocols/protocol.ts`
- Create: `src-v2/protocols/registry.ts`
- Create: `tests-v2/protocols/protocol-contract.test.ts`

**Interfaces:**
- Produces: `ProtocolDefinition`, `ProtocolField`, `ProtocolToolDefinition`, `ProtocolRegistry`, `validateProtocol()`.
- Protocol declarations are data/functions over domain state only; no DOM or repository handles are accepted.

- [ ] **Step 1: Write failing tests** rejecting duplicate ids, invalid field references, impossible stage names, and malformed tool requirements.
- [ ] **Step 2: Implement deterministic validation and registry resolution.**
- [ ] **Step 3: Add a test proving registry lookup is generic and contains no chest-pain branch.**
- [ ] **Step 4: Run protocol tests/typecheck.**
- [ ] **Step 5: Commit `feat(v2): add declarative protocol contract`.**

---

### Task 8: Score lifecycle engine

**Files:**
- Create: `src-v2/domain/clinical/score.ts`
- Create: `tests-v2/domain/score.test.ts`

**Interfaces:**
- Produces: `ScoreDefinition`, `ScoreEvaluation`, `evaluateScore()`, `applyScore()`.
- Evaluation exposes independent `available`, `applicable`, `calculable`, `result`, `applied` semantics.

- [ ] **Step 1: Write failing tests** proving unavailable, inapplicable, incomplete, calculable-but-unapplied, and applied states are distinct; incomplete never equals zero.
- [ ] **Step 2: Implement generic score evaluation with required-variable validation.**
- [ ] **Step 3: Implement explicit application that rejects non-applicable/non-calculable scores.**
- [ ] **Step 4: Run focused/domain tests.**
- [ ] **Step 5: Commit `feat(v2): enforce explicit score lifecycle`.**

---

### Task 9: Chest-pain reference protocol and HEART

**Files:**
- Create: `src-v2/protocols/scenarios/chest-pain.ts`
- Create: `tests-v2/protocols/chest-pain.test.ts`

**Interfaces:**
- Consumes: protocol contract and score engine.
- Produces: `chestPainProtocol`, `heartScoreDefinition`.
- Declares ECG and troponin pending/result types and HEART inputs without making diagnosis or disposition decisions.

- [ ] **Step 1: Write failing tests** for protocol validation, stage visibility, serial ECG/troponin result support, HEART availability/applicability/calculability/application.
- [ ] **Step 2: Implement the protocol declaratively.**
- [ ] **Step 3: Assert the protocol contains no automatic admission/discharge rule and no preconfirmed negative.**
- [ ] **Step 4: Run protocol/domain tests.**
- [ ] **Step 5: Commit `feat(v2): add chest pain reference protocol`.**

---

### Task 10: Pure clinical document engine

**Files:**
- Create: `src-v2/domain/documents/document-model.ts`
- Create: `src-v2/application/services/document-builder.ts`
- Create: `tests-v2/documents/document-builder.test.ts`

**Interfaces:**
- Consumes: attendance snapshot and applied scores.
- Produces: `buildAdmissionDocument()`, `buildReassessmentDocument()`, `ClinicalDocument`, `renderClinicalDocumentText()`.
- No DOM, repository, clock, or protocol-specific import in document builder.

- [ ] **Step 1: Write failing golden tests** for exact admission/reassessment headings and ordering: QP, optional SCORES, HDA (ADMISSÃO), EM TEMPO, EXAME, EXAMES, HD, CONDUTA.
- [ ] **Step 2: Add negative tests** proving unknown fields do not produce `NEGA`, unapplied scores do not render, and old conduct is not rendered as current reassessment conduct.
- [ ] **Step 3: Implement pure structured document creation and text rendering.**
- [ ] **Step 4: Run document/domain tests.**
- [ ] **Step 5: Commit `feat(v2): generate safe temporal clinical documents`.**

---

### Task 11: Manual-edit protection

**Files:**
- Create: `src-v2/domain/documents/document-edit.ts`
- Modify: `src-v2/domain/documents/document-model.ts`
- Modify: `src-v2/application/services/document-builder.ts`
- Create: `tests-v2/documents/document-edit.test.ts`

**Interfaces:**
- Produces: generated/manual section provenance, `applyManualSectionEdit()`, `regenerateDocument()`.
- Regeneration may update generated sections but cannot replace a manually edited section unless explicit replacement is requested.

- [ ] **Step 1: Write failing tests** where physician edits HDA/CONDUTA and subsequent regeneration preserves those sections while updating untouched generated sections.
- [ ] **Step 2: Implement section provenance and explicit override semantics.**
- [ ] **Step 3: Run document tests.**
- [ ] **Step 4: Commit `feat(v2): protect physician document edits`.**

---

### Task 12: Query/read-model layer

**Files:**
- Create: `src-v2/application/queries/attendance-queries.ts`
- Create: `tests-v2/application/attendance-queries.test.ts`

**Interfaces:**
- Produces: `getAttendance()`, `buildWorkspaceView()`, `buildClinicalDocumentView()`.
- Workspace may contain pending/missing/tool state; clinical document view contains only authorized document content.

- [ ] **Step 1: Write failing tests** proving workspace warnings/missing-data hints do not leak into clinical document view.
- [ ] **Step 2: Implement pure read-model builders.**
- [ ] **Step 3: Run application/document tests.**
- [ ] **Step 4: Commit `feat(v2): separate workspace and document read models`.**

---

### Task 13: Minimal one-workspace UI

**Files:**
- Create: `src-v2/ui/app-controller.ts`
- Create: `src-v2/ui/render-app.ts`
- Modify: `src-v2/main.ts`
- Create: `tests-v2/browser/app.spec.ts`

**Interfaces:**
- Consumes: command/query services and repository.
- Produces: browser workspace for start/edit/conduct/pending/result/reassessment/outcome/finalize/copy flows.
- UI state changes only through command service; navigation/rendering cannot directly mutate aggregate state.

- [ ] **Step 1: Write Playwright test** for the complete happy-path attendance lifecycle using synthetic non-identifiable data.
- [ ] **Step 2: Implement a semantic, keyboard-usable DOM UI with one workspace and progressive sections.**
- [ ] **Step 3: Add autosave indicator states `saving`, `saved`, `error`; repository rejection must visibly show `error`.**
- [ ] **Step 4: Add copy-ready generated document surface and explicit manual-edit preservation behavior.**
- [ ] **Step 5: Run browser tests plus `npm run v2:verify`.**
- [ ] **Step 6: Commit `feat(v2): add end-to-end attendance workspace`.**

---

### Task 14: PWA shell and offline restoration

**Files:**
- Create: `public-v2/manifest.webmanifest`
- Create: `public-v2/service-worker.js`
- Modify: `index-v2.html`
- Modify: `src-v2/main.ts`
- Modify: `tests-v2/browser/app.spec.ts`

**Interfaces:**
- Produces: installable shell and offline reload after first successful online load.
- Service worker caches only V2 app shell/static assets; no clinical payload leaves IndexedDB.

- [ ] **Step 1: Add failing browser tests** for service-worker registration and restored attendance after reload/offline context.
- [ ] **Step 2: Implement manifest and conservative cache-first static shell worker with versioned cache name.**
- [ ] **Step 3: Register service worker from V2 entry only.**
- [ ] **Step 4: Run browser/offline tests.**
- [ ] **Step 5: Commit `feat(v2): enable offline PWA runtime`.**

---

### Task 15: Safety regression suite

**Files:**
- Create: `tests-v2/regression/safety-invariants.test.ts`
- Create: `tests-v2/regression/temporal-document.test.ts`

**Interfaces:**
- Consumes: all Core public interfaces.
- Produces: executable regression coverage for the 18 safety invariants in the design spec.

- [ ] **Step 1: Encode every invariant as an explicit named regression test**, including blank≠NEGA, template≠performed exam, suggestion≠fact, score semantics, admission/reassessment temporal integrity, migration confirmation safety, manual edit protection, navigation non-mutation, and persistence error visibility contract.
- [ ] **Step 2: Run the regression suite; any discovered failure is fixed in the owning module, never papered over in the test.**
- [ ] **Step 3: Run `npm run v2:verify` and legacy `npm run verify`.**
- [ ] **Step 4: Commit `test(v2): lock clinical safety invariants`.**

---

### Task 16: Build isolation, documentation, and final verification

**Files:**
- Create: `docs/v2/ARCHITECTURE.md`
- Create: `docs/v2/CLINICAL_SAFETY.md`
- Create: `docs/v2/DEVELOPMENT.md`
- Modify: `package.json`

**Interfaces:**
- Produces: documented V2 developer workflow and one `v2:verify` gate covering typecheck, unit/integration tests, build, and browser tests.

- [ ] **Step 1: Document architecture boundaries, safety invariants, local development, persistence behavior, and explicit non-homologation warning.**
- [ ] **Step 2: Ensure V2 build output is separate from the legacy app and does not replace legacy `index.html`.**
- [ ] **Step 3: Run `npm run v2:verify` from a clean dependency install.**
- [ ] **Step 4: Run legacy `npm run verify` to prove coexistence.**
- [ ] **Step 5: Inspect built assets and source search to confirm no backend endpoint/telemetry and no legacy runtime imports.**
- [ ] **Step 6: Commit `docs(v2): document and verify clean-room core`.**

---

## Final Acceptance Gate

Before any merge/replacement discussion, independently verify:

```text
✓ complete attendance without legacy runtime
✓ IndexedDB reload persistence
✓ offline reload after first load
✓ serial ECG/troponin temporal integrity
✓ admission preserved after reassessment
✓ no default/blank clinical negative
✓ HEART available/applicable/calculable/applied separation
✓ exact admission/reassessment document contract
✓ manual document edits protected
✓ persistence failures visible
✓ workspace metadata absent from clinical document
✓ no clinical-data network API
✓ legacy main runtime still passes its own verification
```

Do not merge to `main` automatically. Final implementation remains on its isolated branch for whole-branch review and explicit integration decision.