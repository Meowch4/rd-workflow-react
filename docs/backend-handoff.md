# RD Workflow — Backend Handoff

> Evidence basis: current repository code and documentation, checked on 2026-09-19. **Implemented** means present in the frontend code; it does not imply server enforcement. **Temporary frontend implementation** means the demo currently performs this work in React/mock/localStorage. **Planned** is work for the backend phase. Items without a settled rule are marked **Needs confirmation**.

## 1. Project Goal and Current Stage

RD Workflow models engineering change requests under long-lived projects. A request moves through a sequential designer submission and engineering/QA reviews; rejection creates rework, and the action history remains visible. The current deliverable is an accepted, runnable **React + TypeScript frontend demo**, with interactive Project/Change Request creation, parameter editing, Submit/Approve/Reject/Resubmit, task lists, timeline, audit history and resettable browser persistence. It has no server API or database. See [README.md](../README.md) for the demo walkthrough.

**Next phase:** move business facts and transition enforcement to a NestJS + PostgreSQL + Prisma backend, then replace demo state with API-backed data. The older [project baseline](PROJECT_BASELINE.md) names Express as a possible backend and sometimes describes a Project-level workflow. The current request specifies NestJS, and the implemented workflow is **ChangeRequest-centric**. Treat those differences as documentation to reconcile, not as a reason to redesign the existing frontend behavior silently.

## 2. Current Frontend Architecture

- **Implemented:** `src/layouts/AppLayout.tsx` owns seven shared business collections: `projects`, `changeRequests`, `workflowSteps`, `auditRecords`, `originalParameterSnapshots`, `parameterSnapshots` (saved/current values) and `rejectedParameterSnapshots`. It passes the data and setters to nested routes through React Router `Outlet` context (`src/types/app.ts`). Detail/create pages perform the mutations. This is currently both the read model and the write model; there is no API client or server-state cache.
- **Temporary frontend implementation:** `src/storage/demoDataStorage.ts` initializes these collections from `src/mocks/*`, restores the snapshot from browser `localStorage`, and saves the entire snapshot when AppLayout state changes. The storage key is `rd-workflow-demo-data-v1`; `version: 1` identifies the browser snapshot shape, **not** a domain/schema version. Validation only checks version and top-level container shapes. Reset replaces it with initial mock data, signs out and returns to Login. Browser storage is not shared between devices/users and is not authoritative.
- **Temporary frontend implementation:** `src/auth/AuthProvider.tsx` keeps the selected mock user ID in a separate `localStorage` entry. Login, protected routes and the user switcher operate on `src/mocks/currentUser.ts`; they are not real authentication or authorization. Frontend action visibility and handler checks improve the demo UX but do not establish security.
- **Implemented derived views:** Dashboard and My Tasks derive counts/tasks from the shared Change Requests and `PROCESSING` Steps (`src/utils/workflowTasks.ts`). There is no separate persisted Task entity. Project list change-request counts are recalculated from the current CR collection in `src/pages/projects/ProjectsPage.tsx`.

## 3. Core Domain Entities

The names below describe **current TypeScript shapes**, not a prescribed Prisma schema.

| Entity | Current purpose and key fields | Relationship / backend confirmation |
| --- | --- | --- |
| `UserSummary` | `id`, `name`, one `role` from `PROJECT_MANAGER`, `DESIGNER`, `MECHANICAL_ENGINEER`, `ELECTRICAL_ENGINEER`, `QA` (`src/types/user.ts`). Mock login and step assignment use it. | `WorkflowStep.assigneeId` and `AuditRecord.actorId` refer to users. **Needs confirmation:** user/role tables, whether one role per user remains sufficient, identity lifecycle. |
| `ProjectSummary` | `id`, `projectNumber`, `name`, `ownerName`, `status` (`DRAFT/ACTIVE/COMPLETED`), `changeRequestCount`, `createdAt` (`src/types/projects.ts`). Long-lived parent for CRs. | CRs refer to `projectId`. `ownerName` is text, not an owner ID relation; count is derived on the list and also present in mock shape. **Needs confirmation:** project owner relation, whether count/status are stored or computed, Project completion rule. |
| `ChangeRequestSummary` | `id`, `projectId`, `requestNumber`, `title`, `status` (`DRAFT/IN_REVIEW/REWORK/COMPLETED`), `currentStepName`, `currentAssigneeName`, `updatedAt` (`src/types/changeRequest.ts`). Main workflow subject. | One Project has many CRs; each CR currently has one logical sequence of Steps. Current step/assignee names are duplicated display fields, not IDs. **Needs confirmation:** canonical current-step relation and denormalized read-model strategy. |
| `WorkflowStepSummary` | `id`, `changeRequestId`, `name`, `assigneeId`, `assigneeName`, `status` (`PENDING/PROCESSING/APPROVED/REJECTED`), `completedAt`, `comment` (`src/types/workflow.ts`). A historical or active workflow node. | Steps are selected by CR ID and **array order** is execution order; rework/review adds new rows while old rejected rows remain. No `position`, `startedAt`, Step role, `WorkflowInstance` ID or round ID currently exists. **Needs confirmation:** explicit ordering and workflow/round representation in the database. |
| `EquipmentParameters` / parameter snapshots | Five fields: `model`, `powerKw`, `weightKg`, `minTemperatureC`, `maxTemperatureC` (`src/types/parameters.ts`). `originalParameterSnapshots[crId]` captures creation-time values; `parameterSnapshots[crId]` is current saved values; `rejectedParameterSnapshots[crId]` captures values at the **latest** rejection. | All three maps are keyed by CR ID, not by Project or Step. They are plain objects, not a `ParameterSnapshot` entity with ID/version/date. **Needs confirmation:** persistence/versioning and whether per-round history is required. |
| `AuditRecord` | `id`, `changeRequestId`, `stepId`, `stepName`, `actorId`, `actorName`, `action` (`CREATE/SUBMIT/REJECT/RESUBMIT/APPROVE`), `createdAt`, `comment`, `parameterChanges` (`src/types/audit.ts`). Read-only action history in the demo. | Belongs to a CR and references a Step/user by ID; `ParameterChange` holds `field/before/after`. Actor/step names are historical display copies. **Needs confirmation:** audit retention and whether parameter Save or Project creation should also create events. |
| `EquipmentTemplate` | `id`, `name`, `parameters`; static mock catalog in `src/mocks/equipmentTemplates.ts`. Used when creating a CR and to load values into the form draft. | The creation flow copies template values into **separate original and saved snapshots**; editing a CR does not mutate the template. **Needs confirmation:** server catalog ownership and template revision policy. |

**Not implemented:** `WorkflowTemplate` and a separately persisted `WorkflowInstance`. CR creation currently constructs the fixed sequence `Designer Submit → Mechanical Review → Electrical Review → QA Review` directly. The conceptual “one workflow per CR” should not be mistaken for existing template/instance tables.

## 4. Business Workflow

**Implemented path:** `DRAFT → IN_REVIEW → (APPROVE successive reviews → COMPLETED | REJECT → REWORK → RESUBMIT → IN_REVIEW)`. A newly created DRAFT CR already has `Designer Submit` as its one `PROCESSING` Step; `DRAFT` means **not yet submitted to review**, not “no step exists.” The pure transition functions live in `src/domain/workflow/` and receive actor/time/IDs from the page.

| Operation | Current preconditions and data mutations on success |
| --- | --- |
| Create CR | Project Manager chooses title, template, designer, mechanical/electrical/QA assignees. Adds a `DRAFT` CR, four Steps (Designer `PROCESSING`, reviews `PENDING`), independent original/saved parameter copies and `CREATE` audit record. Does **not** change Project status. |
| Save parameters | Only the assigned actor of a `PROCESSING` Designer Step in `DRAFT` or `REWORK` can see the form and pass the page guard. Form validation runs; Save replaces current **saved** parameters for the CR. Original/rejected snapshots stay unchanged. No audit record is written. Unsubmitted form input is local draft only. |
| Submit | Requires CR `DRAFT`, exactly one current `PROCESSING` Step assigned to actor, and a next `PENDING` Step. Designer Step becomes `APPROVED` with completion time; next review becomes `PROCESSING`; CR becomes `IN_REVIEW`, current display fields/`updatedAt` change; Project `DRAFT` becomes `ACTIVE` (other Project statuses unchanged). Adds `SUBMIT` audit with original-to-saved parameter diff, possibly empty. |
| Approve | Requires CR `IN_REVIEW`, current `PROCESSING` Step assigned to actor, and if present a next `PENDING` Step. Current Step becomes `APPROVED`; next Step becomes `PROCESSING`, or if none remains the CR becomes `COMPLETED` with current step label `Completed` and no assignee. Updates CR timestamp and adds `APPROVE` audit. Project status is **not** changed to `COMPLETED`. |
| Reject | Requires CR `IN_REVIEW`, a nonblank trimmed reason and current assigned `PROCESSING` Step. Current review becomes `REJECTED` with `completedAt` and `comment`; a new `Designer Rework` Step is inserted immediately after it and becomes `PROCESSING`, assigned to the designer from the first Step. CR becomes `REWORK`; latest rejected-parameter snapshot is copied from current saved values; `REJECT` audit stores reason. Saved/original parameters and Project remain unchanged. |
| Resubmit | Requires CR `REWORK`, assigned current `PROCESSING` rework Step, and at least one **saved** parameter differing from latest reject-time snapshot. Finds the nearest earlier `REJECTED` Step and creates a **new** review Step with its name/assignee; rework Step becomes `APPROVED`, new review `PROCESSING`; CR returns to `IN_REVIEW`. Adds `RESUBMIT` audit with reject-time-to-current-saved parameter diff. Earlier rejected/approved Steps remain historical; Project and original snapshot remain unchanged. |

The current implementation copies/returns new objects instead of mutating input arrays. The page then updates separate React collections. That separation is an implementation detail, **not** an atomic persistence mechanism.

## 5. Business Rules and Invariants

### Enforced by current frontend code

- A non-completed CR is expected to have **exactly one** `PROCESSING` Step; completed CRs have none. Transition functions return a business failure for zero and throw for more than one. `src/mocks/mockDataConsistency.test.ts` checks this and summary alignment for the seed data, not for all future persisted states.
- Submit/Approve/Reject/Resubmit require `currentStep.assigneeId === actor.id`; role alone is insufficient. Create Project/CR checks `PROJECT_MANAGER`. Parameter Save requires assigned `PROCESSING` Step and DRAFT/REWORK phase. These are client-side checks only.
- Reject reason must be nonblank after trimming. It is stored on the rejected Step and in the REJECT audit record.
- Rework appends a new Step rather than resetting a rejected Step. Resubmit repeats the **rejected** review from a new Step and keeps past steps visible. An unchanged *saved* parameter set relative to latest rejection blocks Resubmit; unsaved form changes cannot satisfy it.
- The original parameter copy is created with the CR and is not changed by later Save/Reject/Resubmit. Saved values drive Summary/Changes and submission; `getParameterChanges` computes differences and does not persist them as a separate entity.
- Successful Create CR, Submit, Approve, Reject and Resubmit add one action record. Blocked/failed actions do not. Save parameters and Create Project currently add none. Audit list is presented newest first.
- Transition functions return `{ success: false, reason }` for expected business failures and throw for some inconsistent structure (for example multiple active Steps, missing designer/rejected review or duplicate generated Step ID). This is a frontend contract, not an agreed HTTP error model.

### Current MVP assumptions, not database decisions

- Fixed sequential single-assignee route: Designer → Mechanical → Electrical → QA. Create form selects one user per role; no parallel voting. Step array position has meaning, though no explicit order field exists.
- All rework returns to the **first Step's designer**, and Resubmit restarts at the **most recently rejected** review. Earlier approved reviews are not replayed.
- Latest rejection gets one overwriteable rejected-parameter snapshot per CR. The past audit/steps remain, but prior reject-time parameter snapshots are not individually retained.
- `currentStepName`/`currentAssigneeName` are summary display fields kept in sync by transition code. They are not independent authority for permission checks; the `PROCESSING` Step is.
- Project becomes ACTIVE at first CR Submit. No implemented rule computes Project COMPLETED from its CRs, despite completed seed Projects.

### Planned server enforcement

The server must validate IDs/relationships and input, identify the actor from authentication, enforce role + Step assignment + current status, maintain one current processing Step, generate authoritative IDs/times, and persist Step/CR/Project/snapshot/audit changes consistently. Concurrency behavior and exact database constraints are **Needs confirmation**. Frontend guards must not be treated as authorization.

## 6. State Ownership: Frontend Now vs Backend Later

| Data | Current owner / source | Demo state? | Backend source of truth and future frontend access |
| --- | --- | --- | --- |
| `projects` | AppLayout state, seeded from mocks, full snapshot in localStorage | Yes | PostgreSQL via Project query/create endpoints; frontend fetches, displays and invalidates/refetches after mutations. Count/status derivation must be settled. |
| `changeRequests` | AppLayout state; create/detail pages update it | Yes | PostgreSQL via CR list/detail and command endpoints; frontend reads server response instead of independently deciding canonical status. |
| `workflowSteps` | AppLayout array; creation/transitions replace or insert Steps | Yes | PostgreSQL ordered Steps tied to CR; fetch with detail/tasks, update through transition commands rather than arbitrary client setters. |
| `auditRecords` | AppLayout array; page prepends successful-action entries | Yes | Server-written durable history; frontend queries per CR. Do not accept a client-supplied actor/time as authoritative. |
| `originalParameterSnapshots` | AppLayout `Record<crId, EquipmentParameters>`, copied at CR creation | Yes | Database fact captured at creation; frontend reads with CR detail, never edits it through ordinary Save. |
| `parameterSnapshots` (saved/current) | AppLayout map; ParameterForm has separate unsaved local draft | Yes, except draft is transient UI state | Database saved parameters; frontend fetches on detail and sends validated Save request. Keep input draft local until Save succeeds. |
| `rejectedParameterSnapshots` | AppLayout map; latest Reject overwrites entry | Yes | Server-captured reject-time values used to validate Resubmit. Version/history strategy **Needs confirmation**; frontend may read the relevant comparison/reason but cannot author it. |
| `currentUser` / auth | AuthProvider + mock users list + separate localStorage selected-user ID | Yes | Authenticated server identity/session; frontend queries current user and uses its roles/permissions for UX. Server independently checks each command. |

`EquipmentTemplate` and user choices are also static mocks today; they will need server-owned query data if kept in the backend MVP. Dashboard counts and My Tasks are derived views, not presently persisted collections.

## 7. Backend Responsibilities

**Planned responsibility boundary, not a prescribed implementation:**

1. Expose Project/CR/template/user/task/detail/history read APIs and the creation, parameter Save and transition commands the frontend actually uses.
2. Validate request shape and relationships (CR belongs to Project, selected users fit requested roles, parameter constraints, required reason). Avoid trusting browser `localStorage` or IDs/actor names sent by the client.
3. Enforce workflow transitions and authorization from the authenticated actor, current CR status and assigned `PROCESSING` Step. Maintain consistent ordered Steps and current summary/read model.
4. Persist Project, CR, Steps, parameter facts and audit history in PostgreSQL through Prisma. A command affecting several records should be consistent as one business operation; choose transaction boundaries during backend design.
5. Generate authoritative IDs, request/project numbers and timestamps, and handle simultaneous commands safely. Define expected business failures versus malformed/inconsistent state for the API.
6. Implement actual authentication/session management and server-side permissions. **Not implemented in frontend:** password/session/token security; mock role switching is demo-only.

## 8. Suggested Initial API Surface

**Candidate API draft for discussion; no paths, DTOs, status codes or transport semantics are committed by current code.** Keep command endpoints aligned with the four existing transition functions rather than exposing unrestricted status updates.

| User need visible today | Candidate operation(s) |
| --- | --- |
| Projects list/detail/create | `GET /projects`, `GET /projects/:projectId`, `POST /projects` |
| CRs under a Project and creation | `GET /projects/:projectId/change-requests`, `POST /projects/:projectId/change-requests` |
| CR detail with Steps/snapshots | `GET /change-requests/:id` (or a Project-nested equivalent) |
| Saved parameter editing | `PUT/PATCH /change-requests/:id/parameters` |
| Workflow commands | `POST /change-requests/:id/submit`, `/approve`, `/reject`, `/resubmit` |
| Audit history | `GET /change-requests/:id/audit-records` |
| My Tasks / Dashboard | `GET /me/tasks`; optional server summary query if fetching CRs/Steps is no longer appropriate |
| Create-form choices and identity | `GET /equipment-templates`, eligible-assignee query, `GET /me`; login/logout endpoints **only after auth approach is chosen** |

The exact nesting, payloads, filtering/pagination and response shape remain **Needs confirmation**. A successful command should return enough updated server data for the frontend to refresh the affected CR/Steps/Project/history without reproducing state transitions locally.

## 9. Temporary Frontend Implementations That Should NOT Be Copied Blindly to Backend

- **Separate React setters for one action:** Submit changes Steps + CR + sometimes Project + audit; Reject also changes rejected snapshot. These setters are not a database transaction and can be interrupted independently.
- **Whole-demo localStorage snapshot:** useful for a single-browser demo, not a persistence design, cross-user data model or migration source. Its shallow version/shape check is not business validation.
- **Client-generated values:** CR/Project IDs use browser UUIDs; new rework/review Step IDs incorporate `Date.now()`; audit IDs use browser UUIDs; timestamps use browser clock; visible numbers are calculated by scanning current arrays. These must not be assumed unique or authoritative in concurrent server use.
- **Pure transition functions executed in the page:** valuable executable examples of current rules, but server must revalidate state/actor and persist atomically. Do not trust the caller's `actor`, timestamp, reason or snapshot.
- **Mock currentUser/role switching:** proves UI states only. It provides no real login, identity proof, session expiry or server authorization.
- **Array order and duplicated display names:** frontend Step position drives `nextStep`; CR carries current Step/assignee names. A database should model ordering and identity explicitly enough to avoid drift. Exactly how is **Needs confirmation**.
- **Single latest rejected snapshot and absent Save audit:** adequate for this demo; do not infer that the final backend history/version requirements are settled.
- **Seed data is illustrative:** mock Project `changeRequestCount` values need not match real CR counts; ProjectsPage recalculates them. Do not seed a database expecting those counts to be canonical.

## 10. MVP Scope and Explicit Non-Goals

**Backend MVP aligned with implemented frontend:** Projects containing CRs; one sequential, single-assignee workflow per CR; fixed designer/mechanical/electrical/QA path; equipment-template-based initial parameters; saved editable CR parameters; Submit/Approve/Reject/Rework/Resubmit/Complete; audit/history; authenticated users and server-enforced role/assignment checks; queryable Projects, CRs and current tasks; PostgreSQL persistence via Prisma. Preserve the demo's meaningful loading/empty/error/unauthorized behavior when moving to APIs.

**Outside the current MVP:** multi-person AND/OR approval, parallel/countersign flows, CAD/PLM integration, file upload, industrial calculations or complex product-version algorithms, real-time notifications/WebSockets, AI/RAG/MCP features, Redis/Kafka, microservices and elaborate infrastructure/CI/CD. The baseline explicitly prioritizes a narrow deployable flow over adding technologies. This list is a scope boundary, not a claim that every listed item had a prior design.

## 11. Open Questions for Backend Phase

1. **Authentication:** session/cookie or JWT (and expiry/refresh), seed/demo accounts versus real credentials, and how role/assignee identity is sourced. **Needs confirmation.**
2. **Prisma relations:** Project owner ID versus name; CR current Step relation versus derived summary; Step order and repeat-review/rework rounds; whether an explicit WorkflowInstance/Template adds value now. **Needs confirmation.**
3. **Project lifecycle:** when, if ever, Project becomes `COMPLETED`; whether one active CR affects Project status; how to represent projects with multiple CRs in different states. Current code only moves DRAFT→ACTIVE at first Submit. **Needs confirmation.**
4. **Parameter persistence:** immutable creation snapshot, mutable saved values, reject-time snapshots per round versus latest only, template revision, and whether Save needs audit/version history. **Needs confirmation.**
5. **Atomicity/concurrency:** transaction boundary for each command, uniqueness of visible numbers, duplicate clicks/retries, stale clients and competing reviewers, idempotency policy. **Needs confirmation.**
6. **API contract:** DTOs, validation/error reason/status mapping, pagination/query filters, command response shape, and how frontend refreshes after success/failure. **Needs confirmation.**
7. **Audit semantics:** which actions are recorded, whether failed attempts are logged separately, retention, and how parameter differences/actor display names are preserved. Current frontend records only successful listed actions. **Needs confirmation.**
8. **Existing demo data:** whether mocks become development seeds; do not assume users' localStorage is production data to migrate. **Needs confirmation.**

## 12. Files Worth Reading First

Read these in order for the shortest path from business intent to current executable behavior (paths are repository-relative):

1. `docs/PROJECT_BASELINE.md` — scope and long-term intent; note the older Express/Project-workflow wording.
2. `docs/decisions/001-change-request-lifecycle.md` — earlier lifecycle decision; compare with current transition code.
3. `src/types/changeRequest.ts` — CR statuses and current summary fields.
4. `src/types/workflow.ts` — Step statuses, assignment and history fields.
5. `src/types/parameters.ts` — exact parameter and template shapes.
6. `src/types/audit.ts` — action-history record shape.
7. `src/types/projects.ts` — Project fields/status and denormalized count.
8. `src/layouts/AppLayout.tsx` — all shared demo business state and route handoff.
9. `src/storage/demoDataStorage.ts` — mock initialization, browser persistence and reset boundary.
10. `src/pages/changeRequests/CreateChangeRequestPage.tsx` — CR, Step, snapshot and CREATE-audit initialization.
11. `src/pages/changeRequests/ChangeRequestDetailPage.tsx` — Save and command orchestration, UI/data guards.
12. `src/domain/workflow/submitWorkflowStep.ts` — Draft→review and Project activation.
13. `src/domain/workflow/approveWorkflowStep.ts` — review advancement/completion.
14. `src/domain/workflow/rejectWorkflowStep.ts` — rejection, rework Step and reject-time snapshot.
15. `src/domain/workflow/resubmitWorkflowStep.ts` — latest rejected review retry and saved-parameter-change rule.

For concrete seed examples, also inspect `src/mocks/`; for the demonstration sequence, read `README.md`. These are supporting sources, not additional schema authority.
