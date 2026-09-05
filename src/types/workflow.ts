export type WorkflowStepStatus =
  | "PENDING"
  | "PROCESSING"
  | "APPROVED"
  | "REJECTED";

export interface WorkflowStepSummary {
  id: string;
  changeRequestId: string;
  name: string;
  assigneeId: string | null;
  assigneeName: string | null;
  status: WorkflowStepStatus;
  completedAt: string | null;
}
