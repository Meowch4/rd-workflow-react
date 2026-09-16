import { describe, expect, it } from "vitest";
import type { ChangeRequestSummary } from "../../types/changeRequest";
import type { EquipmentParameters } from "../../types/parameters";
import type { UserSummary } from "../../types/user";
import type { WorkflowStepSummary } from "../../types/workflow";
import { rejectWorkflowStep } from "./rejectWorkflowStep";

const rejectedAt = "2026-09-16T10:00:00.000Z";
const reworkStepId = "step-designer-rework-test";
const reviewer: UserSummary = {
  id: "user-rick",
  name: "Rick Sanchez",
  role: "MECHANICAL_ENGINEER",
};
const savedParameters: EquipmentParameters = {
  model: "CX-400",
  powerKw: 45,
  weightKg: 820,
  minTemperatureC: -10,
  maxTemperatureC: 45,
};

function createChangeRequest(): ChangeRequestSummary {
  return {
    id: "cr-test",
    projectId: "project-test",
    requestNumber: "CR-2026-999",
    title: "Test workflow rejection",
    status: "IN_REVIEW",
    currentStepName: "Mechanical Review",
    currentAssigneeName: reviewer.name,
    updatedAt: "2026-09-15T10:00:00.000Z",
  };
}

function createWorkflowSteps(): WorkflowStepSummary[] {
  return [
    {
      id: "step-designer",
      changeRequestId: "cr-test",
      name: "Designer Submit",
      assigneeId: "user-summer",
      assigneeName: "Summer Smith",
      status: "APPROVED",
      completedAt: "2026-09-15T09:00:00.000Z",
      comment: null,
    },
    {
      id: "step-mechanical",
      changeRequestId: "cr-test",
      name: "Mechanical Review",
      assigneeId: reviewer.id,
      assigneeName: reviewer.name,
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

describe("rejectWorkflowStep", () => {
  it("rejects the current review and starts designer rework", () => {
    const changeRequest = createChangeRequest();
    const workflowSteps = createWorkflowSteps();

    const result = rejectWorkflowStep({
      changeRequest,
      workflowSteps,
      actor: reviewer,
      reason: "  Power value must be revised.  ",
      savedParameters,
      rejectedAt,
      reworkStepId,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.workflowSteps[1]).toMatchObject({
      id: "step-mechanical",
      status: "REJECTED",
      completedAt: rejectedAt,
      comment: "Power value must be revised.",
    });
    expect(result.workflowSteps[2]).toMatchObject({
      id: reworkStepId,
      name: "Designer Rework",
      assigneeId: "user-summer",
      status: "PROCESSING",
    });
    expect(result.changeRequest).toMatchObject({
      status: "REWORK",
      currentStepName: "Designer Rework",
      currentAssigneeName: "Summer Smith",
      updatedAt: rejectedAt,
    });
    // 证明两份数据的内容相同
    expect(result.rejectedParameterSnapshot).toEqual(savedParameters);
    // 证明它们不是同一个对象引用
    expect(result.rejectedParameterSnapshot).not.toBe(savedParameters);
    expect(result.auditRecord).toMatchObject({
      stepId: "step-mechanical",
      actorId: reviewer.id,
      action: "REJECT",
      comment: "Power value must be revised.",
      createdAt: rejectedAt,
    });

    expect(changeRequest.status).toBe("IN_REVIEW");
    expect(workflowSteps[1]).toMatchObject({
      status: "PROCESSING",
      completedAt: null,
      comment: null,
    });
    expect(savedParameters.powerKw).toBe(45);
  });

  it("returns a business failure when the actor is not the assignee", () => {
    const result = rejectWorkflowStep({
      changeRequest: createChangeRequest(),
      workflowSteps: createWorkflowSteps(),
      actor: { id: "user-beth", name: "Beth Smith", role: "ELECTRICAL_ENGINEER" },
      reason: "Power value must be revised.",
      savedParameters,
      rejectedAt,
      reworkStepId,
    });

    expect(result).toEqual({ success: false, reason: "NOT_ASSIGNEE" });
  });

  it("returns a business failure when the reason is blank", () => {
    const result = rejectWorkflowStep({
      changeRequest: createChangeRequest(),
      workflowSteps: createWorkflowSteps(),
      actor: reviewer,
      reason: "   ",
      savedParameters,
      rejectedAt,
      reworkStepId,
    });

    expect(result).toEqual({ success: false, reason: "REASON_REQUIRED" });
  });

  it("throws when the workflow contains multiple processing steps", () => {
    const workflowSteps = createWorkflowSteps();
    workflowSteps[2] = { ...workflowSteps[2], status: "PROCESSING" };

    expect(() =>
      rejectWorkflowStep({
        changeRequest: createChangeRequest(),
        workflowSteps,
        actor: reviewer,
        reason: "Power value must be revised.",
        savedParameters,
        rejectedAt,
        reworkStepId,
      }),
    ).toThrow("multiple processing steps");
  });
});
