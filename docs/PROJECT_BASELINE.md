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

