import type { AuditRecord } from "../../types/audit";
import type { ChangeRequestSummary } from "../../types/changeRequest";
import type { ParameterChange } from "../../types/parameters";
import type { ProjectSummary } from "../../types/projects";
import type { UserSummary } from "../../types/user";
import type { WorkflowStepSummary } from "../../types/workflow";

export type SubmitWorkflowFailureReason =
  | "CHANGE_REQUEST_NOT_DRAFT"
  | "NO_PROCESSING_STEP"
  | "NOT_ASSIGNEE"
  | "NEXT_STEP_NOT_PENDING";

interface SubmitWorkflowInput {
  changeRequest: ChangeRequestSummary;
  project: ProjectSummary;
  workflowSteps: WorkflowStepSummary[];
  actor: UserSummary;
  submittedAt: string;
  parameterChanges: ParameterChange[];
}

export type SubmitWorkflowResult =
  | {
      success: true;
      changeRequest: ChangeRequestSummary;
      project: ProjectSummary;
      workflowSteps: WorkflowStepSummary[];
      auditRecord: Omit<AuditRecord, "id">;
    }
  | {
      success: false;
      reason: SubmitWorkflowFailureReason;
    };

export function submitWorkflowStep({
  changeRequest,
  project,
  workflowSteps,
  actor,
  submittedAt,
  parameterChanges,
}: SubmitWorkflowInput): SubmitWorkflowResult {
  if (changeRequest.projectId !== project.id) {
    throw new Error(
      `Change request ${changeRequest.id} does not belong to project ${project.id}.`,
    );
  }

  if (changeRequest.status !== "DRAFT") {
    return { success: false, reason: "CHANGE_REQUEST_NOT_DRAFT" };
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

  if (!nextStep || nextStep.status !== "PENDING") {
    return { success: false, reason: "NEXT_STEP_NOT_PENDING" };
  }

  const updatedWorkflowSteps = workflowSteps.map((step) => {
    if (step.id === currentStep.id) {
      return { ...step, status: "APPROVED" as const, completedAt: submittedAt };
    }
    if (step.id === nextStep.id) {
      return { ...step, status: "PROCESSING" as const };
    }
    return step;
  });

  return {
    success: true,
    changeRequest: {
      ...changeRequest,
      status: "IN_REVIEW",
      currentStepName: nextStep.name,
      currentAssigneeName: nextStep.assigneeName,
      updatedAt: submittedAt,
    },
    project:
      project.status === "DRAFT"
        ? { ...project, status: "ACTIVE" }
        : project,
    workflowSteps: updatedWorkflowSteps,
    auditRecord: {
      changeRequestId: changeRequest.id,
      stepId: currentStep.id,
      stepName: currentStep.name,
      actorId: actor.id,
      actorName: actor.name,
      action: "SUBMIT",
      createdAt: submittedAt,
      comment: null,
      parameterChanges,
    },
  };
}
