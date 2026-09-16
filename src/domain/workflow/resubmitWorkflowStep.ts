import type { AuditRecord } from "../../types/audit";
import type { ChangeRequestSummary } from "../../types/changeRequest";
import type { EquipmentParameters } from "../../types/parameters";
import type { UserSummary } from "../../types/user";
import type { WorkflowStepSummary } from "../../types/workflow";
import { getParameterChanges } from "../../utils/parameterChanges";

export type ResubmitWorkflowFailureReason =
  // cr不是REWORK状态
  | "CHANGE_REQUEST_NOT_IN_REWORK"
  // 参数未更改
  | "PARAMETERS_UNCHANGED"
  // 没有procssing的step
  | "NO_PROCESSING_STEP"
  // 没有权限
  | "NOT_ASSIGNEE";

interface ResubmitWorkflowInput {
  changeRequest: ChangeRequestSummary;
  workflowSteps: WorkflowStepSummary[];
  actor: UserSummary;
  rejectedParameters: EquipmentParameters;
  savedParameters: EquipmentParameters;
  resubmittedAt: string;
  reviewStepId: string;
}

export type ResubmitWorkflowResult =
  | {
      success: true;
      changeRequest: ChangeRequestSummary;
      workflowSteps: WorkflowStepSummary[];
      auditRecord: Omit<AuditRecord, "id">;
    }
  | {
      success: false;
      reason: ResubmitWorkflowFailureReason;
    };

export function resubmitWorkflowStep({
  changeRequest,
  workflowSteps,
  actor,
  rejectedParameters,
  savedParameters,
  resubmittedAt,
  reviewStepId,
}: ResubmitWorkflowInput): ResubmitWorkflowResult {
  if (changeRequest.status !== "REWORK") {
    return { success: false, reason: "CHANGE_REQUEST_NOT_IN_REWORK" };
  }

  const parameterChanges = getParameterChanges(
    rejectedParameters,
    savedParameters,
  );
  if (parameterChanges.length === 0) {
    return { success: false, reason: "PARAMETERS_UNCHANGED" };
  }

  const requestSteps = workflowSteps.filter(
    (step) => step.changeRequestId === changeRequest.id,
  );
  const processingSteps = requestSteps.filter(
    (step) => step.status === "PROCESSING",
  );

  if (processingSteps.length > 1) {
    throw new Error(
      `Change request ${changeRequest.id} has multiple processing steps.`,
    );
  }

  const reworkStep = processingSteps[0];
  if (!reworkStep) {
    return { success: false, reason: "NO_PROCESSING_STEP" };
  }

  if (reworkStep.assigneeId !== actor.id) {
    return { success: false, reason: "NOT_ASSIGNEE" };
  }

  const reworkStepIndex = requestSteps.findIndex(
    (step) => step.id === reworkStep.id,
  );
  // 只检查当前rework step前的step
  // 反转
  // 找到距离最近的rejected step
  const rejectedReviewStep = requestSteps
    .slice(0, reworkStepIndex)
    .reverse()
    .find((step) => step.status === "REJECTED");

  if (!rejectedReviewStep) {
    throw new Error(
      `Change request ${changeRequest.id} does not have a rejected review before rework.`,
    );
  }

  if (workflowSteps.some((step) => step.id === reviewStepId)) {
    throw new Error(`Workflow step id ${reviewStepId} already exists.`);
  }

  const newReviewStep: WorkflowStepSummary = {
    id: reviewStepId,
    changeRequestId: changeRequest.id,
    name: rejectedReviewStep.name,
    assigneeId: rejectedReviewStep.assigneeId,
    assigneeName: rejectedReviewStep.assigneeName,
    status: "PROCESSING",
    completedAt: null,
    comment: null,
  };

  const updatedWorkflowSteps = workflowSteps.flatMap((step) =>
    step.id === reworkStep.id
      ? [
          {
            ...step,
            status: "APPROVED" as const,
            completedAt: resubmittedAt,
          },
          newReviewStep,
        ]
      : step,
  );

  return {
    success: true,
    changeRequest: {
      ...changeRequest,
      status: "IN_REVIEW",
      currentStepName: newReviewStep.name,
      currentAssigneeName: newReviewStep.assigneeName,
      updatedAt: resubmittedAt,
    },
    workflowSteps: updatedWorkflowSteps,
    auditRecord: {
      changeRequestId: changeRequest.id,
      stepId: reworkStep.id,
      stepName: reworkStep.name,
      actorId: actor.id,
      actorName: actor.name,
      action: "RESUBMIT",
      createdAt: resubmittedAt,
      comment: null,
      parameterChanges,
    },
  };
}
