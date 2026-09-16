import type { AuditRecord } from "../../types/audit";
import type { ChangeRequestSummary } from "../../types/changeRequest";
import type { EquipmentParameters } from "../../types/parameters";
import type { UserSummary } from "../../types/user";
import type { WorkflowStepSummary } from "../../types/workflow";

export type RejectWorkflowFailureReason =
  // cr不是in review状态
  | "CHANGE_REQUEST_NOT_IN_REVIEW"
  // step不是processing状态
  | "NO_PROCESSING_STEP"
  // 不是有权限用户
  | "NOT_ASSIGNEE"
  // 需要填入原因
  | "REASON_REQUIRED";

interface RejectWorkflowInput {
  changeRequest: ChangeRequestSummary;
  workflowSteps: WorkflowStepSummary[];
  actor: UserSummary;
  reason: string;
  savedParameters: EquipmentParameters;
  rejectedAt: string;
  reworkStepId: string;
}

export type RejectWorkflowResult =
  | {
      success: true;
      changeRequest: ChangeRequestSummary;
      workflowSteps: WorkflowStepSummary[];
      rejectedParameterSnapshot: EquipmentParameters;
      auditRecord: Omit<AuditRecord, "id">;
    }
  | {
      success: false;
      reason: RejectWorkflowFailureReason;
    };

export function rejectWorkflowStep({
  changeRequest,
  workflowSteps,
  actor,
  reason,
  savedParameters,
  rejectedAt,
  reworkStepId,
}: RejectWorkflowInput): RejectWorkflowResult {
  if (changeRequest.status !== "IN_REVIEW") {
    return { success: false, reason: "CHANGE_REQUEST_NOT_IN_REVIEW" };
  }

  const normalizedReason = reason.trim();
  if (!normalizedReason) {
    return { success: false, reason: "REASON_REQUIRED" };
  }

  const requestSteps = workflowSteps.filter(
    (step) => step.changeRequestId === changeRequest.id,
  );
  const processingSteps = requestSteps.filter(
    (step) => step.status === "PROCESSING",
  );

  // 如果processing的step多于1个
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

  const designerStep = requestSteps[0];
  if (!designerStep?.assigneeId || !designerStep.assigneeName) {
    throw new Error(
      `Change request ${changeRequest.id} does not have an assigned designer step.`,
    );
  }

  if (workflowSteps.some((step) => step.id === reworkStepId)) {
    throw new Error(`Workflow step id ${reworkStepId} already exists.`);
  }

  const reworkStep: WorkflowStepSummary = {
    id: reworkStepId,
    changeRequestId: changeRequest.id,
    name: "Designer Rework",
    assigneeId: designerStep.assigneeId,
    assigneeName: designerStep.assigneeName,
    status: "PROCESSING",
    completedAt: null,
    comment: null,
  };

  const updatedWorkflowSteps = workflowSteps.flatMap((step) =>
    step.id === currentStep.id
      ? [
          {
            ...step,
            status: "REJECTED" as const,
            completedAt: rejectedAt,
            comment: normalizedReason,
          },
          reworkStep,
        ]
      : step,
  );

  return {
    success: true,
    changeRequest: {
      ...changeRequest,
      status: "REWORK",
      currentStepName: reworkStep.name,
      currentAssigneeName: reworkStep.assigneeName,
      updatedAt: rejectedAt,
    },
    workflowSteps: updatedWorkflowSteps,
    rejectedParameterSnapshot: { ...savedParameters },
    auditRecord: {
      changeRequestId: changeRequest.id,
      stepId: currentStep.id,
      stepName: currentStep.name,
      actorId: actor.id,
      actorName: actor.name,
      action: "REJECT",
      createdAt: rejectedAt,
      comment: normalizedReason,
      parameterChanges: [],
    },
  };
}
