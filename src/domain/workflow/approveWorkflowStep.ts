import type { AuditRecord } from "../../types/audit";
import type { ChangeRequestSummary } from "../../types/changeRequest";
import type { UserSummary } from "../../types/user";
import type { WorkflowStepSummary } from "../../types/workflow";

// 失败原因
export type ApproveWorkflowFailureReason =
  // CR不在IN_REVIEW状态
  | "CHANGE_REQUEST_NOT_IN_REVIEW"
  // step不在PROCCESSING状态
  | "NO_PROCESSING_STEP"
  // assignee不匹配
  | "NOT_ASSIGNEE"
  // 下一step不是PENDING状态
  | "NEXT_STEP_NOT_PENDING";

interface ApproveWorkflowInput {
  changeRequest: ChangeRequestSummary;
  workflowSteps: WorkflowStepSummary[];
  actor: UserSummary;
  approvedAt: string;
}

// 业务逻辑上可预测的成功或失败
export type ApproveWorkflowResult =
  | {
      success: true;
      changeRequest: ChangeRequestSummary;
      workflowSteps: WorkflowStepSummary[];
      auditRecord: Omit<AuditRecord, "id">;
    }
  | {
      success: false;
      reason: ApproveWorkflowFailureReason;
    };

export function approveWorkflowStep({
  changeRequest,
  workflowSteps,
  actor,
  approvedAt,
}: ApproveWorkflowInput): ApproveWorkflowResult {
  if (changeRequest.status !== "IN_REVIEW") {
    return { success: false, reason: "CHANGE_REQUEST_NOT_IN_REVIEW" };
  }

  const requestSteps = workflowSteps.filter(
    (step) => step.changeRequestId === changeRequest.id,
  );
  const processingSteps = requestSteps.filter(
    (step) => step.status === "PROCESSING",
  );

  // 因为数据结构错误而出错就抛出error
  if (processingSteps.length > 1) {
    throw new Error(
      `Change request ${changeRequest.id} has multiple processing steps.`,
    );
  }

  const currentStep = processingSteps[0];
  if (!currentStep) {
    return { success: false, reason: "NO_PROCESSING_STEP" };
  }

  if (currentStep.assigneeId !== actor.id) {
    return { success: false, reason: "NOT_ASSIGNEE" };
  }

  const currentStepIndex = requestSteps.findIndex(
    (step) => step.id === currentStep.id,
  );
  const nextStep = requestSteps[currentStepIndex + 1];

  if (nextStep && nextStep.status !== "PENDING") {
    return { success: false, reason: "NEXT_STEP_NOT_PENDING" };
  }

  const updatedWorkflowSteps = workflowSteps.map((step) => {
    if (step.id === currentStep.id) {
      return { ...step, status: "APPROVED" as const, completedAt: approvedAt };
    }
    if (step.id === nextStep?.id) {
      return { ...step, status: "PROCESSING" as const };
    }
    return step;
  });
  const updatedChangeRequest: ChangeRequestSummary = {
    ...changeRequest,
    status: nextStep ? "IN_REVIEW" : "COMPLETED",
    currentStepName: nextStep?.name ?? "Completed",
    currentAssigneeName: nextStep?.assigneeName ?? null,
    updatedAt: approvedAt,
  };

  return {
    success: true,
    changeRequest: updatedChangeRequest,
    workflowSteps: updatedWorkflowSteps,
    auditRecord: {
      changeRequestId: changeRequest.id,
      stepId: currentStep.id,
      stepName: currentStep.name,
      actorId: actor.id,
      actorName: actor.name,
      action: "APPROVE",
      createdAt: approvedAt,
      comment: null,
      parameterChanges: [],
    },
  };
}
