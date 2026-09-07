# Zera PS 2.0 — Core Architecture Design

**Status:** Approved design baseline
**Date:** 2026-09-07
**Branch:** `zera-ps-2-design`

## 1. Objective

Rebuild Zera PS as a clean-room clinical documentation core that preserves the product's proven clinical-safety contracts while removing architectural debt from the current incremental migration.

The new implementation must reduce repeated documentation in emergency care without fabricating facts, increasing certainty, changing polarity, or overwriting the temporal record.

This design deliberately targets one coherent vertical slice: **a complete attendance lifecycle with one reference protocol**. Broad migration of the existing protocol library is explicitly deferred until the core is proven.

## 2. Product principle

> The patient should be heard. The physician should not need to retype the same clinical history.

Documentation reduction is the mechanism. More useful clinical time is the outcome.

The application is not a diagnostic system, autonomous prescriber, disposition engine, or institutional EMR replacement.

## 3. Scope

### Included in Zera PS 2.0 Core

- TypeScript codebase.
- Browser-first PWA.
- Offline-first operation.
- IndexedDB as primary persistence.
- One aggregate representing the full attendance lifecycle.
- Admission, initial conduct, pending results, reassessment, final documentation, and outcome.
- Temporal results and reassessments.
- Structured clinical values with explicit information state and provenance.
- Pure document generation.
- Workspace/document separation.
- Autosave.
- Append-only audit events for clinically relevant state changes.
- Protocol contract and registry.
- One reference protocol used to validate the architecture end to end.
- Score lifecycle with distinct available/applicable/calculable/applied states.
- PWA shell and offline cache.
- Automated unit, integration, regression, and persistence tests.

### Explicitly excluded from Core

- Backend.
- Cloud sync.
- Multi-user collaboration.
- Authentication.
- Institutional integration.
- Automatic diagnosis.
- Automatic prescribing.
- Automatic admission/discharge decisions.
- AI-generated clinical facts.
- Migration of every legacy syndrome/protocol.
- Analytics dashboard.
- Billing or authorization automation.

## 4. Architectural strategy

The new implementation will not extend the current `assets/` + `src/` dual architecture. Legacy code is treated as a source of requirements and regression behavior, not as the runtime foundation.

The new codebase uses four explicit boundaries:

```text
UI
 ↓
Application
 ↓
Domain
 ↑
Infrastructure
```

Protocols are declarative domain extensions interpreted by generic application services.

### Proposed tree

```text
src/
├── domain/
│   ├── attendance/
│   ├── clinical/
│   ├── documents/
│   └── protocols/
├── application/
│   ├── commands/
│   ├── queries/
│   └── services/
├── infrastructure/
│   ├── storage/
│   ├── audit/
│   └── pwa/
├── protocols/
│   └── scenarios/
├── ui/
│   ├── screens/
│   ├── components/
│   ├── controllers/
│   └── state/
└── main.ts

tests/
├── domain/
├── application/
├── persistence/
├── protocols/
├── documents/
└── regression/
```

The file tree may gain small focused files during implementation, but responsibilities must remain within these boundaries.

## 5. Core aggregate: Attendance

`Attendance` is the single aggregate root for a patient encounter.

It owns the temporal lifecycle and clinically meaningful state transitions.

```text
Attendance
├── id
├── createdAt
├── updatedAt
├── stage
├── admission
├── pendingItems[]
├── results[]
├── reassessments[]
├── appliedTools[]
├── outcome
├── documentSnapshots[]
└── timeline[]
```

### Stages

The canonical stage model is:

```text
initial_assessment
→ initial_conduct
→ pending_results
→ reassessment
→ final_documentation
```

Transitions are explicit commands. UI navigation alone cannot mutate clinical stage.

### Admission

Admission stores the initial clinical record and remains the historical source of truth after reassessment begins.

Minimum sections:

- QP
- HDA
- HPP
- EXAME
- EXAMES
- HD
- CONDUTA

Once the first reassessment is created, previously established admission content cannot be silently rewritten by later results or later clinical state.

## 6. Clinical value model

A clinical field cannot be represented as a primitive boolean when information state matters.

The baseline model is:

```ts
type ClinicalInformationState =
  | 'unknown'
  | 'present'
  | 'denied'
  | 'not_informed'
  | 'not_assessed';

interface ClinicalValue<T> {
  state: ClinicalInformationState;
  value?: T;
  source: ClinicalSource;
  observedAt?: string;
  confirmedAt?: string;
}
```

`ClinicalSource` identifies provenance such as patient report, companion report, examination, laboratory, imaging, external document, or physician synthesis.

### Semantic constraints

- `unknown` is not `denied`.
- `not_informed` is not `denied`.
- `not_assessed` is not `denied`.
- absence of input does not create content.
- a template cannot mark a finding as performed or negative.
- imported/migrated data cannot gain confirmation it did not previously have.

These constraints must be enforced both by types and tests.

## 7. Temporal events

New results are additive temporal events.

Examples:

```text
Troponin 0h
Troponin 2h
ECG initial
ECG repeat
CT result
Specialist opinion
```

A later result never overwrites an earlier result.

Reassessment is also additive. Each reassessment stores its own timestamp, delta narrative, updated examination, new results available at that time, current hypothesis, and current conduct.

## 8. Reassessment contract

Reassessment belongs to the same `Attendance` and never replaces admission.

Generated documentation follows this semantic structure:

```text
# QP: "..."

# SCORES:
[only explicitly applied valid scores]

# HDA (ADMISSÃO):
[original admission history/context]

# EM TEMPO (REAVALIAÇÃO):
[current temporal delta]

# EXAME:
[current reassessed findings]

# EXAMES:
[new/current results]

# HD:
[current hypothesis]

# CONDUTA:
[current conduct]
```

Old conduct is never represented as current conduct simply because it exists in the attendance history.

## 9. Workspace and clinical document are separate products surfaces

The system has two semantic outputs from the same attendance state:

### Operational workspace

May show:

- current stage;
- pending items;
- missing data;
- tools;
- protocol context;
- alerts;
- incomplete fields;
- workflow actions.

### Clinical document

May contain only content explicitly authorized by the clinical state and document rules.

Operational warnings, UI labels, internal flags, and incomplete-state hints must never leak automatically into the clinical record.

## 10. Application layer

All state-changing actions use commands. Examples:

- `StartAttendance`
- `UpdateAdmission`
- `RecordClinicalValue`
- `RecordResult`
- `StartReassessment`
- `UpdateReassessment`
- `ApplyScore`
- `ChangeOutcome`
- `FinalizeAttendance`

Queries derive read models without mutating state. Examples:

- `GetAttendance`
- `BuildWorkspaceView`
- `BuildClinicalDocument`

Commands enforce invariants before repository persistence.

## 11. Protocol architecture

The core does not know specific diseases or syndromes.

A protocol declares:

- identity;
- entry presentation;
- fields;
- visibility rules;
- pending-item definitions;
- expected result types;
- optional tools/scores;
- document hints;
- stage-specific workspace sections.

Generic engines interpret the declaration.

No protocol may:

- directly manipulate DOM;
- write storage;
- generate unconfirmed clinical facts;
- force diagnosis;
- automatically apply a score;
- bypass domain invariants.

The Core ships with exactly one reference protocol sufficient to exercise admission, pending results, reassessment, score lifecycle, and final outcome. Additional protocols are a subsequent project.

## 12. Scores and clinical tools

Every tool has four distinct states:

```text
available
≠ applicable
≠ calculable
≠ applied
```

A score may be available to the current protocol but not applicable to the current clinical context.

A score may be applicable but not calculable because required data are incomplete.

A calculated result is not automatically documented. Documentation requires explicit application by the physician.

Incomplete scores never render as zero.

## 13. Document engine

The document engine is pure and deterministic.

Inputs:

- attendance snapshot;
- document type;
- explicit document options.

Output:

- plain clinical text or structured document representation that can be rendered to text.

The engine cannot read DOM, mutate storage, infer hidden clinical state, or trigger workflow transitions.

Manual physician edits are protected. Regeneration must not silently overwrite manually edited clinical text. The implementation must make provenance of generated versus manually edited sections explicit enough to preserve this invariant.

## 14. Persistence

### Primary store

IndexedDB.

### Repository boundary

Application code depends on an `AttendanceRepository` interface, never directly on IndexedDB.

Expected operations:

```text
create
getById
save
listDrafts
archive
```

### Persistence behavior

- autosave after meaningful state changes;
- atomic persistence of one attendance snapshot plus corresponding audit event set;
- schema versioning from the first release;
- migrations are explicit functions with tests;
- failed migration must not silently reinterpret clinical meaning.

Legacy local data are not automatically imported into the new runtime in Core. A later migration project may provide an explicit, reviewed importer.

## 15. Audit timeline

Clinically meaningful state changes produce append-only audit events.

Initial event vocabulary:

- `ATTENDANCE_STARTED`
- `STAGE_CHANGED`
- `CLINICAL_VALUE_RECORDED`
- `RESULT_RECORDED`
- `REASSESSMENT_STARTED`
- `REASSESSMENT_UPDATED`
- `SCORE_APPLIED`
- `OUTCOME_CHANGED`
- `DOCUMENT_GENERATED`
- `ATTENDANCE_FINALIZED`

Audit events are not a replacement for the attendance snapshot. They provide traceability: what changed, when, and through which application command.

No background telemetry or external transmission is included.

## 16. UI principles

The UI is a thin client over application commands and queries.

Requirements:

- keyboard-first where practical;
- minimal modal use;
- no hidden clinical mutation from navigation;
- no implicit negative from unchecked controls;
- autosave state visible but non-disruptive;
- one attendance workspace rather than disconnected document screens;
- progressive disclosure based on protocol and stage;
- copy-ready clinical document output;
- responsive desktop/tablet/mobile behavior;
- offline status clearly visible.

The UI may improve ergonomics without changing clinical semantics.

## 17. PWA and offline behavior

The application must remain functional without network connectivity after first successful load.

The service worker caches only the application shell and static assets required for the runtime.

Clinical data stay in IndexedDB on the device.

Core includes no network API for clinical data.

## 18. Safety invariants

These are non-negotiable system contracts:

1. Absence of information generates no clinical content.
2. Not informed is not denied.
3. Not informed is not not-assessed.
4. A template is not an examination performed.
5. A suggestion is not a finding, diagnosis, or performed conduct.
6. An incomplete score is not zero.
7. Available is not applicable.
8. Applicable is not calculable.
9. Reassessment does not overwrite admission.
10. A new result does not retrospectively rewrite an earlier fact.
11. Technical migration does not manufacture clinical confirmation.
12. Generated clinical text remains physician-reviewable and editable.
13. Visual changes cannot silently alter clinical meaning.
14. Legacy behavior is preserved only when explicitly selected as a requirement and covered by regression tests.
15. Authorization/justification text may reorganize confirmed data but may not invent risk, finding, or urgency.
16. Physician-edited clinical text cannot be silently overwritten by a generator.
17. UI navigation cannot itself change clinical stage or clinical truth.
18. Persistence failure cannot be presented as successful save.

## 19. Error handling

Errors are classified into four categories:

### Validation error

Invalid command or invariant violation. No mutation is committed.

### Persistence error

The in-memory state may remain visible, but the UI must show that persistence failed and must not claim successful autosave.

### Migration error

The affected stored attendance remains untouched and inaccessible for mutation until the migration is resolved. No best-effort reinterpretation of clinical values is allowed.

### Rendering error

Failure to render one view or document must not mutate the underlying attendance.

All errors exposed to the user must be actionable and must avoid implying clinical conclusions.

## 20. Testing strategy

### Domain tests

Test all invariants and transitions with no browser dependencies.

Mandatory examples:

- blank field does not produce `NEGA`;
- denied requires explicit denied state;
- result seriality is preserved;
- reassessment cannot overwrite admission;
- incomplete score has no result;
- calculated score is not documented until applied.

### Application tests

Test commands against an in-memory repository.

### Persistence tests

Test IndexedDB adapter and migrations separately from domain behavior.

### Document tests

Golden tests for exact clinical-document contracts, including admission and reassessment.

### Protocol tests

Validate protocol declarations and ensure no protocol can bypass the generic engine contract.

### Regression tests

Port only legacy behaviors intentionally retained. Legacy code itself is not imported merely to satisfy regression.

### Browser/PWA tests

Validate autosave, reload restoration, offline shell, responsive behavior, and copy output.

No release is considered clinically validated solely because CI is green.

## 21. Migration and coexistence strategy

The existing `main` remains untouched while Zera PS 2.0 is built on an isolated feature branch/worktree.

The current application remains the reference implementation for approved behaviors only.

Migration strategy:

```text
legacy requirement
→ explicit regression test
→ new implementation
→ parity verification
→ only then consider replacement
```

There is no in-place architectural conversion of legacy modules.

## 22. First reference vertical slice

The first implementation must prove this end-to-end flow:

```text
start attendance
→ document QP/HDA/HPP/EXAME/EXAMES/HD/CONDUTA
→ autosave
→ register initial conduct
→ create pending items
→ record temporal result
→ reassess in same attendance
→ optionally calculate/apply one score
→ generate reassessment document
→ define discharge or admission outcome
→ finalize attendance
→ reload offline and preserve state
```

The reference protocol should be chosen for workflow richness, not for breadth of clinical content. Its purpose is architectural validation.

## 23. Acceptance criteria for Core

Core is complete only when all of the following are true:

- one complete attendance can be performed without legacy runtime modules;
- the entire attendance survives browser reload through IndexedDB;
- the app remains usable offline after initial load;
- admission is immutable with respect to later reassessment history;
- serial results remain distinct temporal entities;
- no blank/default state produces a clinical negative;
- one reference protocol drives progressive disclosure without scenario-specific branches in generic engines;
- one clinical score demonstrates available/applicable/calculable/applied separation;
- generated admission and reassessment documents satisfy exact regression contracts;
- physician manual edits are not silently overwritten;
- persistence failures are surfaced accurately;
- all mandatory domain, application, persistence, protocol, document, and regression tests pass;
- no clinical data are transmitted to a backend.

## 24. Deferred follow-on projects

Only after Core reaches the acceptance criteria:

1. protocol library migration;
2. richer document types and justification documents;
3. explicit legacy-data importer if still necessary;
4. expanded browser automation and accessibility hardening;
5. optional future sync/backend design under a separate privacy/security review.

## 25. Decision summary

Zera PS 2.0 Core will be a TypeScript, browser-native, offline-first clinical documentation system centered on a temporal `Attendance` aggregate, explicit clinical information states, declarative protocols, pure document generation, IndexedDB persistence, append-only audit events, and strict separation between operational workspace and clinical record.

The new runtime will not inherit the current architectural duality. It will inherit only reviewed product behavior and safety contracts.