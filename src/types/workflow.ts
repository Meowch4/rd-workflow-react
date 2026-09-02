export type WorkflowStepStatus =
  | "PENDING"
  | "PROCESSING"
  | "APPROVED"
  | "REJECTED";

export interface WorkflowStepSummary {
  id: string;
  changeRequestId: string;
  name: string;
  assigneeName: string | null;
  status: WorkflowStepStatus;
  completedAt: string | null;
}
