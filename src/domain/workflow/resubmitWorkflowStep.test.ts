import { describe, expect, it } from "vitest";
import type { ChangeRequestSummary } from "../../types/changeRequest";
import type { EquipmentParameters } from "../../types/parameters";
import type { UserSummary } from "../../types/user";
import type { WorkflowStepSummary } from "../../types/workflow";
import { resubmitWorkflowStep } from "./resubmitWorkflowStep";

const resubmittedAt = "2026-09-16T12:00:00.000Z";
const reviewStepId = "step-mechanical-review-round-2";
const designer: UserSummary = {
  id: "user-summer",
  name: "Summer Smith",
  role: "DESIGNER",
};
const rejectedParameters: EquipmentParameters = {
  model: "CX-400",
  powerKw: 50,
  weightKg: 820,
  minTemperatureC: -10,
  maxTemperatureC: 45,
};
const savedParameters: EquipmentParameters = {
  ...rejectedParameters,
  powerKw: 45,
};

function createChangeRequest(): ChangeRequestSummary {
  return {
    id: "cr-test",
    projectId: "project-test",
    requestNumber: "CR-2026-999",
    title: "Test workflow resubmission",
    status: "REWORK",
    currentStepName: "Designer Rework",
    currentAssigneeName: designer.name,
    updatedAt: "2026-09-16T10:00:00.000Z",
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
      status: "APPROVED",
      completedAt: "2026-09-15T09:00:00.000Z",
      comment: null,
    },
    {
      id: "step-mechanical-rejected",
      changeRequestId: "cr-test",
      name: "Mechanical Review",
      assigneeId: "user-rick",
      assigneeName: "Rick Sanchez",
      status: "REJECTED",
      completedAt: "2026-09-16T10:00:00.000Z",
      comment: "Power value must be revised.",
    },
    {
      id: "step-designer-rework",
      changeRequestId: "cr-test",
      name: "Designer Rework",
      assigneeId: designer.id,
      assigneeName: designer.name,
      status: "PROCESSING",
      completedAt: null,
      comment: null,
    },
    {
      id: "step-electrical",
      changeRequestId: "cr-test",
      name: "Electrical Review",
      assigneeId: "user-beth",
      assigneeName: "Beth Smith",
      status: "PENDING",
      completedAt: null,
      comment: null,
    },
  ];
}

describe("resubmitWorkflowStep", () => {
  it("completes rework and starts a new review round", () => {
    const changeRequest = createChangeRequest();
    const workflowSteps = createWorkflowSteps();

    const result = resubmitWorkflowStep({
      changeRequest,
      workflowSteps,
      actor: designer,
      rejectedParameters,
      savedParameters,
      resubmittedAt,
      reviewStepId,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.workflowSteps[1]).toMatchObject({
      id: "step-mechanical-rejected",
      status: "REJECTED",
      comment: "Power value must be revised.",
    });
    expect(result.workflowSteps[2]).toMatchObject({
      id: "step-designer-rework",
      status: "APPROVED",
      completedAt: resubmittedAt,
    });
    expect(result.workflowSteps[3]).toMatchObject({
      id: reviewStepId,
      name: "Mechanical Review",
      assigneeId: "user-rick",
      status: "PROCESSING",
    });
    expect(result.changeRequest).toMatchObject({
      status: "IN_REVIEW",
      currentStepName: "Mechanical Review",
      currentAssigneeName: "Rick Sanchez",
      updatedAt: resubmittedAt,
    });
    expect(result.auditRecord).toMatchObject({
      stepId: "step-designer-rework",
      actorId: designer.id,
      action: "RESUBMIT",
      parameterChanges: [{ field: "powerKw", before: 50, after: 45 }],
    });

    expect(changeRequest.status).toBe("REWORK");
    expect(workflowSteps[2]).toMatchObject({
      status: "PROCESSING",
      completedAt: null,
    });
  });

  it("returns a business failure when saved parameters are unchanged", () => {
    const result = resubmitWorkflowStep({
      changeRequest: createChangeRequest(),
      workflowSteps: createWorkflowSteps(),
      actor: designer,
      rejectedParameters,
      savedParameters: { ...rejectedParameters },
      resubmittedAt,
      reviewStepId,
    });

    expect(result).toEqual({ success: false, reason: "PARAMETERS_UNCHANGED" });
  });

  it("returns a business failure when the actor is not the assignee", () => {
    const result = resubmitWorkflowStep({
      changeRequest: createChangeRequest(),
      workflowSteps: createWorkflowSteps(),
      actor: { id: "user-rick", name: "Rick Sanchez", role: "MECHANICAL_ENGINEER" },
      rejectedParameters,
      savedParameters,
      resubmittedAt,
      reviewStepId,
    });

    expect(result).toEqual({ success: false, reason: "NOT_ASSIGNEE" });
  });

  it("throws when rework has no preceding rejected review", () => {
    const workflowSteps = createWorkflowSteps().filter(
      (step) => step.status !== "REJECTED",
    );

    expect(() =>
      resubmitWorkflowStep({
        changeRequest: createChangeRequest(),
        workflowSteps,
        actor: designer,
        rejectedParameters,
        savedParameters,
        resubmittedAt,
        reviewStepId,
      }),
    ).toThrow("does not have a rejected review");
  });
});
