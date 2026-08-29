export type ChangeRequestStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "REWORK"
  | "COMPLETED";

export type WorkflowStepStatus =
  | "PENDING"
  | "PROCESSING"
  | "APPROVED"
  | "REJECTED";

export type ChangeRequestAction = "SUBMIT" | "REJECT" | "RESUBMIT" | "APPROVE";
