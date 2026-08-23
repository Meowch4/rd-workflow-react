# RD Workflow development rules

Before designing or changing this repository, read `docs/PROJECT_BASELINE.md`.

## Product direction

- Treat this as a production-style, portfolio-grade enterprise application, not a tutorial demo.
- Keep React and TypeScript engineering as the main story. Full-stack work supports that story.
- Prioritize a complete, deployable MVP over adding fashionable technologies.
- Work incrementally. Do not generate the entire system in one pass.

## Collaboration rules

- Routine UI and repetitive work may move quickly.
- Explain important decisions involving React component boundaries, TypeScript models, state ownership, APIs, database design, authentication, authorization, and workflow transitions before or while implementing them.
- Distinguish server state from client state. Do not put API data into a global client store without a concrete reason.
- Avoid premature abstraction and performance optimization. State the actual problem before refactoring or optimizing.
- When a proposed feature expands scope, evaluate its value to the MVP and the job-search demonstration first.
- Record material architecture decisions in a form that can later support the README and interviews.

## Quality bar

- Prefer explicit TypeScript types and avoid `any`.
- Separate API concerns from UI concerns.
- Enforce authorization on the server; frontend visibility is only a UX layer.
- Cover loading, empty, error, and unauthorized states in core flows.
- Test critical workflow transitions and permission rules before chasing coverage numbers.

