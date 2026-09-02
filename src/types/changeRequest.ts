export type ChangeRequestStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "REWORK"
  | "COMPLETED";

export type ChangeRequestAction = "SUBMIT" | "REJECT" | "RESUBMIT" | "APPROVE";

export interface ChangeRequestSummary {
  id: string;
  projectId: string;
  requestNumber: string;
  title: string;
  status: ChangeRequestStatus;
  currentStepName: string;
  currentAssigneeName: string | null;
  updatedAt: string;
}
