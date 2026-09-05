# RD Workflow project baseline

## 1. Purpose

RD Workflow is a research and development workflow management system for a React frontend or frontend-oriented full-stack portfolio. It should demonstrate the ability to design, build, explain, test, and deploy a realistic enterprise business application.

The project should primarily demonstrate:

- React component and data-flow design
- TypeScript domain modeling
- server-state and client-state ownership
- complex business workflow modeling
- authentication and resource authorization
- stable API contracts and relational data modeling
- forms, validation, auditability, failure handling, testing, and deployment

Success means being able to explain why the system is designed this way, not merely showing a large technology list.

## 2. Technical direction

### Frontend

- React, TypeScript, Vite, React Router, Tailwind CSS, Axios
- TanStack Query for server state when the API integration begins
- local state, Context, or Zustand only where client-state scope justifies it
- React Hook Form and Zod when dynamic-form requirements justify them

### Backend

- Node.js, Express, PostgreSQL, Prisma
- REST API contracts designed before controller implementation

### Quality tooling

- ESLint, Prettier, Git, GitHub, and deployment
- Vitest and React Testing Library for important logic
- Playwright for at least one core end-to-end flow if schedule allows

Do not add a tool unless it solves a current, concrete problem.

## 3. MVP business flow

1. A project manager creates a project.
2. They select an equipment template and a workflow template.
3. They assign a responsible user to each workflow step.
4. A designer fills or edits the project's parameter snapshot.
5. The designer submits the work.
6. Mechanical, electrical, and QA reviewers approve in sequence.
7. A reviewer may reject the work back to the designer with a reason.
8. The designer changes parameters and resubmits.
9. The project completes after all required reviews approve.
10. The backend records all important actions in the audit log.

MVP roles are Project Manager, Designer, Mechanical Engineer, Electrical Engineer, and QA.

## 4. Domain rules that must remain explicit

### Template versus instance

- `WorkflowTemplate` and its steps define a reusable standard process.
- Creating a project generates an independent `ProjectWorkflow` and `ProjectStep` set.
- Later template changes must not alter existing projects.
- `EquipmentTemplate` supplies initial parameter values only.
- A project owns its parameter snapshot or instances; editing them must not mutate the source template.

### Workflow status

- Project status initially considers Draft, Waiting, In Progress, Completed, Rejected, and Rework.
- Step status initially considers Pending, Processing, Approved, and Rejected.
- Project status must be derived through explicit domain transition rules rather than scattered UI `if/else` statements.
- MVP is sequential and single-assignee. Parallel, AND/OR, and countersign approval are later extensions.

### Authorization

An action is allowed only when the current workflow step, step status, assigned user, project state, role or permission, and requested resource all allow it. Hiding a button is not security; the backend must independently enforce every protected operation.

### Auditability

The backend creates audit records for project creation and edits, parameter changes and submissions, approvals, rejections, rework, resubmission, and assignment changes. Records include actor, action, resource, timestamp, result, and relevant details.

## 5. Core frontend responsibilities

- `WorkflowTimeline`: completed, current, pending, rejected, and rework states
- `DynamicParameterForm`: typed dynamic fields, validation, dependencies, and changed values
- `PermissionAction`: UI availability derived from the domain authorization result
- `ProjectTable`: search, filters, sorting, pagination, status, and current owner
- `AuditTimeline`: actor, time, action, resource, and result
- `StatusBadge`: centralized project and step status presentation

Extract a component or hook only when it creates a meaningful boundary or removes repeated business logic.

## 6. State ownership

Server state includes projects, workflows, tasks, parameters, audit logs, and users. TanStack Query should own fetching, caching, mutation state, invalidation, and refetch behavior.

Client state includes filters, dialogs, tabs, theme, and unsubmitted local form state. Use the smallest suitable mechanism: component state first, then Context or Zustand when scope and update patterns require it.

## 7. Planned pages

- Login
- Dashboard
- Projects
- Project Detail
- Create Project
- My Tasks
- Parameters
- History

Project Detail is the primary demonstration page and combines project information, workflow, parameters, the active step, review history, audit history, and authorized actions.

## 8. API and data principles

Before implementing controllers, define request and response DTOs, methods, status codes, error shape, pagination, query parameters, and authorization requirements.

Expected core entities include User, Role, Permission, UserRole, Project, WorkflowTemplate, WorkflowTemplateStep, ProjectWorkflow, ProjectStep, EquipmentTemplate, ProjectParameter, ParameterHistory, and AuditLog. Add constraints and indexes from concrete integrity and query requirements rather than hypothetical scale.

## 9. Delivery phases

1. React foundation: Vite, TypeScript, routing, layout, pages, base components, mock data.
2. Mock-driven product UI: Dashboard, Projects, Project Detail, Create Project, My Tasks.
3. Domain and PostgreSQL/Prisma data-model design.
4. Express API design and implementation, then frontend integration.
5. Login, current user, authentication, permissions, and resource authorization.
6. End-to-end workflow: create, fill, submit, approve, reject, rework, resubmit, complete.
7. Boundary states, tests, performance work where evidenced, README, and deployment.
8. Optional features only after the MVP is complete.

Target: a deployable MVP around mid-October 2026.

## 10. Scope guardrails

Until the MVP works end to end, treat AI features, multi-person approval, notifications, WebSockets, uploads, advanced visualization, Docker, complex CI/CD, microservices, Redis, and Kafka as optional. Before accepting such work, ask whether it materially improves the MVP or the job-search demonstration.

## 11. Decision records

For important choices, record:

1. What problem are we solving?
2. What options were considered?
3. What was selected and why?
4. What are its drawbacks?
5. Under what future condition should it change?

Likely records include server-state ownership, template-instance separation, parameter snapshots, backend authorization, component boundaries, hook extraction, and evidence-based performance optimization.

## 12. AI-assisted learning and collaboration

These rules supplement the existing guided-development rules. Where the wording conflicts, this section takes precedence. It does not change the product goal, business model, or frontend-showcase progress baseline.

### Separate implementation work from cognitive work

- AI may directly generate or rapidly implement repetitive, mechanical, or low-cognitive-value work such as Tailwind styling, repeated JSX, mock data, simple type boilerplate, routine Ant Design configuration, and obvious repetition.
- Important code does not have to be handwritten by the learner. AI may propose or implement React state ownership, data flow, component boundaries, hooks, workflow transitions, permission logic, data models, and form validation, provided the learner participates in key decisions and builds an accurate mental model.
- The learning objective is not memorizing implementation syntax. For important features, the learner should be able to explain the problem, data flow, state owner, control flow, changed files, design trade-offs, correctness criteria, and likely debugging entry points.

### Design checkpoints for new core concepts

- Before fully implementing a first-time core business component or a new React mental model, hold a short design checkpoint with one to three genuinely important questions for the learner to judge.
- Provide only the prerequisite context needed to understand the problem, without signaling the preferred answer. Then wait for the learner's reasoning before reviewing the options or trade-offs. Merely announcing a design or asking questions after implementation does not satisfy this checkpoint.
- Design confirmation does not by itself mean that AI should immediately generate the complete core implementation. Continue with an implementation checkpoint when the feature contains a new, high-value implementation pattern.
- For patterns the learner has already demonstrated understanding of, skip the checkpoint and proceed quickly within the agreed scope.
- This refines the implementation permissions above: do not abruptly turn the learner into a passive reviewer, and do not enforce a fixed human-versus-AI code-writing ratio. Preserve participation in design decisions.

### Preserve answer-free thinking time

- For a first-time design or implementation problem with learning value, the first checkpoint round must contain only the problem and open questions. Do not include a recommendation, model answer, completed trade-off conclusion, or wording that reveals which option is preferred.
- Prefer prompts that ask the learner to generate a state-owner decision, business meaning, data flow, control flow, pseudocode, or small core implementation before seeing AI's solution.
- Review only after the learner answers. Identify what is correct, what is missing, relevant counterexamples or boundary cases, and whether another approach fits better.
- If an answer is incomplete, first offer one counterexample, follow-up question, or small hint. Reveal the final answer progressively only if the learner remains blocked.
- Necessary prerequisite knowledge may be explained before the checkpoint, but that background must not imply the decision being tested.
- A checkpoint whose answer was already revealed is not evidence that the learner independently formed the reasoning. Replace it with a different unanswered question when checking understanding.
- Skip this process for patterns the learner has already demonstrated. The intended sequence is `problem -> independent reasoning -> answer -> feedback -> implementation`.

### Prefer concrete state and behavior reasoning

- Build the learner's understanding in this order: business scenario, existing data, user action, before-and-after state changes, source-of-truth versus derived values, component data flow, boundary behavior and debugging entry points. Discuss abstractions only after these concrete facts are understood.
- For first-time core features, prefer questions about where data originates, which values change after an action, whether a value is a draft, saved data or derived output, which component naturally owns it, what sequence a handler follows, what the page shows in a boundary case, and where a small requirement change or bug should first be investigated.
- Do not use abstract architecture questions as the primary exercise before the learner has enough concrete context. Questions about whether a type, hook, service, domain model or architecture boundary should exist should arise from a real duplication, ambiguity, ownership problem or behavior requirement.
- Let abstractions emerge from concrete problems. Before introducing a type, function, hook or component boundary, establish what it represents, where it is used, and what repetition or ambiguity exists without it.
- When a requirement permits multiple reasonable interpretations, present a concrete sequence with specific values and actions. Ask the learner to predict the draft, saved values, summaries, derived displays and workflow results before and after each action.
- Do not assume that a familiar business label means every rule is settled. Use scenarios such as unsaved edits, repeated saves, rejection and resubmission, or changing parameter sources to expose missing rules at the point where implementation needs them.

### Implementation checkpoints for new core patterns

- After the design checkpoint, identify the single implementation point with the highest learning value, prioritizing concrete behavior: inputs, outputs, intermediate steps, state updates, values that must remain unchanged, and component data flow.
- Before showing the final implementation for that point, first ask the learner to describe those behaviors or predict the control flow. Ask for a small core function or handler only when writing it adds learning value. Then review the learner's reasoning and address mistakes before completing the remaining implementation.
- Before generating code, state which mechanical parts AI will generate, which one implementation point is reserved for the learner, and why that point is worth thinking through independently.
- Keep each implementation checkpoint small. Do not require the learner to handwrite boilerplate, Tailwind styles, routine Ant Design configuration, repeated JSX, mock data, or simple type declarations.
- Use only decisions that naturally exist in the feature. Do not create artificial TODOs or awkward architecture for teaching purposes. If a feature contains no valuable new pattern, implement it directly.
- Skip the implementation checkpoint when the learner has already demonstrated the same pattern. State which earlier feature it resembles and proceed quickly.
- Treat a pattern as learned when the learner can explain its data source, state changes, owner, control flow and behavior; identify where a small requirement change or bug belongs; and rebuild a solution to a similar problem with documentation or AI assistance. Memorizing a full component or third-party API is not required.
- After implementation, explain only the genuinely new difficulties and provide one to three runtime checks. Prefer a small requirement change or fault scenario to verify learning, such as identifying why an unsaved draft changed a summary or what data is missing to display an earlier submission.

### Let architecture and specifications converge through implementation

Use an iterative loop:

`current requirements and understanding -> initial design -> implementation -> run, test, and use -> feedback -> revise rules or architecture -> implement again`

Implementation is also an experiment for discovering unknown requirements, incorrect assumptions, and architecture problems. Do not attempt to finish the entire architecture before building, and do not preserve an early decision merely because it was previously documented.

### Avoid understanding debt

- Do not generate changes whose conceptual scope grows much faster than the learner's understanding.
- Split complex work into units with meaningful business or architectural boundaries, not arbitrary file counts or line counts.
- A unit may be implemented quickly, but after completion the learner should understand what changed, why it changed, and how to verify it.

### Review according to risk and cognitive value

- Review styling, mechanical configuration, boilerplate, and repetition quickly.
- Focus review attention on business logic, state transitions, permissions, data transformations, boundary cases, and tests.
- For a large diff, first explain why the requirement affects those areas rather than reading every line with equal weight.
- AI output is a proposal, not a source of correctness. Validate it against requirements, business rules, runtime behavior, tests, and debugging evidence. Encourage questions about alternatives, counterexamples, simpler solutions, and trade-offs.

### Treat debugging and feedback as core learning

- When a problem appears, first ask the learner to identify the likely layer, observable symptoms, and useful inspection points when that exercise has learning value.
- Provide progressively stronger help as needed instead of immediately giving every final fix or leaving the learner blocked on low-value friction.

### Maintain an appropriately chunked pace

- Do not return to line-by-line teaching, but do not generate hundreds or thousands of lines in one unexplained change.
- Move quickly through simple and repeated work. Slow down for important React, TypeScript, web, and engineering concepts when they first appear.
- Do not repeatedly teach concepts that the learner has already demonstrated.
- After each implementation, identify and explain its main new learning points or difficulties. For familiar patterns, reference the earlier feature with the same pattern instead of repeating the explanation.
- Keep each step focused on one or two questions with current value.
- React frontend engineering and the RD Workflow frontend showcase remain the first priority. Architecture, full-stack design, and AI-coding discussion must support that goal rather than replacing it.
