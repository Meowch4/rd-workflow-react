import type { ChangeRequestSummary } from "../types/changeRequest";
import type { WorkflowStepSummary } from "../types/workflow";

export interface AssignedWorkflowTask {
  id: string;
  changeRequest: ChangeRequestSummary;
  step: WorkflowStepSummary;
}

export function getAssignedWorkflowTasks(
  workflowSteps: WorkflowStepSummary[],
  changeRequests: ChangeRequestSummary[],
  userId: string,
): AssignedWorkflowTask[] {
  return workflowSteps.flatMap((step) => {
    if (step.status !== "PROCESSING" || step.assigneeId !== userId) {
      return [];
    }

    const changeRequest = changeRequests.find(
      (request) => request.id === step.changeRequestId,
    );

    return changeRequest
      ? [{ id: step.id, changeRequest, step }]
      : [];
  });
}
