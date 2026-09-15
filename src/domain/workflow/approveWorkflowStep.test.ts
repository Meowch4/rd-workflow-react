import { describe, expect, it } from "vitest";
import type { ChangeRequestSummary } from "../../types/changeRequest";
import type { UserSummary } from "../../types/user";
import type { WorkflowStepSummary } from "../../types/workflow";
import { approveWorkflowStep } from "./approveWorkflowStep";

// 固定时间
const approvedAt = "2026-09-15T10:00:00.000Z";
// 固定user
const mechanicalReviewer: UserSummary = {
  id: "user-rick",
  name: "Rick Sanchez",
  role: "MECHANICAL_ENGINEER",
};

// 测试数据工厂
function createChangeRequest(
  overrides: Partial<ChangeRequestSummary> = {},
): ChangeRequestSummary {
  return {
    id: "cr-test",
    projectId: "project-test",
    requestNumber: "CR-2026-999",
    title: "Test workflow transition",
    status: "IN_REVIEW",
    currentStepName: "Mechanical Review",
    currentAssigneeName: mechanicalReviewer.name,
    updatedAt: "2026-09-14T10:00:00.000Z",
    // 传入的入参作为override可以覆盖前面的默认字段
    ...overrides,
  };
}

function createReviewSteps(): WorkflowStepSummary[] {
  return [
    {
      id: "step-designer",
      changeRequestId: "cr-test",
      name: "Designer Submit",
      assigneeId: "user-summer",
      assigneeName: "Summer Smith",
      status: "APPROVED",
      completedAt: "2026-09-14T09:00:00.000Z",
      comment: null,
    },
    {
      id: "step-mechanical",
      changeRequestId: "cr-test",
      name: "Mechanical Review",
      assigneeId: mechanicalReviewer.id,
      assigneeName: mechanicalReviewer.name,
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

// describe 把同一个功能的测试组织在一起
// it 描述一个具体场景
// expect 检查实际结果是否符合预期
// toBe：严格比较简单值。
// toEqual：深度比较完整对象。
// toMatchObject：只检查对象中关心的部分。
// toThrow：检查函数是否抛出错误。
describe("approveWorkflowStep", () => {
  // approve当前step并让下一step进入proccessing
  it("approves the current step and starts the next step", () => {
    const changeRequest = createChangeRequest();
    const workflowSteps = createReviewSteps();

    const result = approveWorkflowStep({
      changeRequest,
      workflowSteps,
      actor: mechanicalReviewer,
      approvedAt,
    });

    // 期望result.success的值为true
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.workflowSteps[1]).toMatchObject({
      status: "APPROVED",
      completedAt: approvedAt,
    });
    expect(result.workflowSteps[2]).toMatchObject({
      status: "PROCESSING",
      completedAt: null,
    });
    expect(result.changeRequest).toMatchObject({
      status: "IN_REVIEW",
      currentStepName: "Electrical Review",
      currentAssigneeName: "Beth Smith",
      updatedAt: approvedAt,
    });
    expect(result.auditRecord).toMatchObject({
      stepId: "step-mechanical",
      actorId: mechanicalReviewer.id,
      action: "APPROVE",
      createdAt: approvedAt,
    });

    expect(workflowSteps[1].status).toBe("PROCESSING");
    expect(changeRequest.currentStepName).toBe("Mechanical Review");
  });

  // approve 最后一步的同时让cr complete
  it("completes the change request when the final step is approved", () => {
    const changeRequest = createChangeRequest({
      currentStepName: "QA Review",
      currentAssigneeName: "Jerry Smith",
    });
    const qaReviewer: UserSummary = {
      id: "user-jerry",
      name: "Jerry Smith",
      role: "QA",
    };
    const workflowSteps: WorkflowStepSummary[] = createReviewSteps().map((step) => ({
      ...step,
      status: "APPROVED" as const,
    }));
    workflowSteps.push({
      id: "step-qa",
      changeRequestId: "cr-test",
      name: "QA Review",
      assigneeId: qaReviewer.id,
      assigneeName: qaReviewer.name,
      status: "PROCESSING",
      completedAt: null,
      comment: null,
    });

    const result = approveWorkflowStep({
      changeRequest,
      workflowSteps,
      actor: qaReviewer,
      approvedAt,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.changeRequest).toMatchObject({
      status: "COMPLETED",
      currentStepName: "Completed",
      currentAssigneeName: null,
      updatedAt: approvedAt,
    });
    expect(result.workflowSteps.at(-1)).toMatchObject({
      status: "APPROVED",
      completedAt: approvedAt,
    });
  });

  // 如果操作者不是asignee就return一个失败
  it("returns a business failure when the actor is not the assignee", () => {
    const changeRequest = createChangeRequest();
    const workflowSteps = createReviewSteps();
    const unauthorizedUser: UserSummary = {
      id: "user-beth",
      name: "Beth Smith",
      role: "ELECTRICAL_ENGINEER",
    };

    const result = approveWorkflowStep({
      changeRequest,
      workflowSteps,
      actor: unauthorizedUser,
      approvedAt,
    });

    expect(result).toEqual({ success: false, reason: "NOT_ASSIGNEE" });
    expect(workflowSteps[1].status).toBe("PROCESSING");
    expect(changeRequest.currentStepName).toBe("Mechanical Review");
  });

  // 当有多个step就抛error
  it("throws when the workflow contains multiple processing steps", () => {
    const changeRequest = createChangeRequest();
    const workflowSteps = createReviewSteps();
    workflowSteps[2] = { ...workflowSteps[2], status: "PROCESSING" };

    expect(() =>
      approveWorkflowStep({
        changeRequest,
        workflowSteps,
        actor: mechanicalReviewer,
        approvedAt,
      }),
    ).toThrow("multiple processing steps");
  });
});
