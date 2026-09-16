import { describe, expect, it } from "vitest";
import type { ChangeRequestSummary } from "../../types/changeRequest";
import type { ProjectSummary } from "../../types/projects";
import type { UserSummary } from "../../types/user";
import type { WorkflowStepSummary } from "../../types/workflow";
import { submitWorkflowStep } from "./submitWorkflowStep";

const submittedAt = "2026-09-15T11:00:00.000Z";
const designer: UserSummary = {
  id: "user-summer",
  name: "Summer Smith",
  role: "DESIGNER",
};

function createChangeRequest(): ChangeRequestSummary {
  return {
    id: "cr-test",
    projectId: "project-test",
    requestNumber: "CR-2026-999",
    title: "Test workflow submission",
    status: "DRAFT",
    currentStepName: "Designer Submit",
    currentAssigneeName: designer.name,
    updatedAt: "2026-09-14T10:00:00.000Z",
  };
}

function createProject(status: ProjectSummary["status"] = "DRAFT"): ProjectSummary {
  return {
    id: "project-test",
    projectNumber: "RD-2026-999",
    name: "Test Project",
    ownerName: "Alice Johnson",
    status,
    changeRequestCount: 1,
    createdAt: "2026-09-14T08:00:00.000Z",
  };
}

function createWorkflowSteps(): WorkflowStepSummary[] {
  return [
    {
      id: "step-designer",
      changeRequestId: "cr-test",
      name: "Designer Submit",
      assigneeId: designer.id,
      assigneeName: designer.name,
      status: "PROCESSING",
      completedAt: null,
      comment: null,
    },
    {
      id: "step-mechanical",
      changeRequestId: "cr-test",
      name: "Mechanical Review",
      assigneeId: "user-rick",
      assigneeName: "Rick Sanchez",
      status: "PENDING",
      completedAt: null,
      comment: null,
    },
  ];
}

describe("submitWorkflowStep", () => {
  it("submits the draft, starts review, and activates its project", () => {
    const changeRequest = createChangeRequest();
    const project = createProject();
    const workflowSteps = createWorkflowSteps();
    const parameterChanges = [
      { field: "powerKw" as const, before: 50, after: 55 },
    ];

    const result = submitWorkflowStep({
      changeRequest,
      project,
      workflowSteps,
      actor: designer,
      submittedAt,
      parameterChanges,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.workflowSteps[0]).toMatchObject({
      status: "APPROVED",
      completedAt: submittedAt,
    });
    expect(result.workflowSteps[1].status).toBe("PROCESSING");
    expect(result.changeRequest).toMatchObject({
      status: "IN_REVIEW",
      currentStepName: "Mechanical Review",
      currentAssigneeName: "Rick Sanchez",
      updatedAt: submittedAt,
    });
    expect(result.project.status).toBe("ACTIVE");
    expect(result.auditRecord).toMatchObject({
      action: "SUBMIT",
      actorId: designer.id,
      parameterChanges,
    });

    expect(changeRequest.status).toBe("DRAFT");
    expect(project.status).toBe("DRAFT");
    expect(workflowSteps[0].status).toBe("PROCESSING");
  });

  it("keeps an already active project active", () => {
    const result = submitWorkflowStep({
      changeRequest: createChangeRequest(),
      project: createProject("ACTIVE"),
      workflowSteps: createWorkflowSteps(),
      actor: designer,
      submittedAt,
      parameterChanges: [],
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.project.status).toBe("ACTIVE");
  });

  it("returns a business failure when the actor is not the assignee", () => {
    const changeRequest = createChangeRequest();
    const project = createProject();
    const workflowSteps = createWorkflowSteps();

    const result = submitWorkflowStep({
      changeRequest,
      project,
      workflowSteps,
      actor: { id: "user-rick", name: "Rick Sanchez", role: "MECHANICAL_ENGINEER" },
      submittedAt,
      parameterChanges: [],
    });

    expect(result).toEqual({ success: false, reason: "NOT_ASSIGNEE" });
    expect(changeRequest.status).toBe("DRAFT");
    expect(project.status).toBe("DRAFT");
    expect(workflowSteps[0].status).toBe("PROCESSING");
  });

  it("throws when the change request belongs to another project", () => {
    expect(() =>
      submitWorkflowStep({
        changeRequest: createChangeRequest(),
        project: { ...createProject(), id: "another-project" },
        workflowSteps: createWorkflowSteps(),
        actor: designer,
        submittedAt,
        parameterChanges: [],
      }),
    ).toThrow("does not belong to project");
  });
});
