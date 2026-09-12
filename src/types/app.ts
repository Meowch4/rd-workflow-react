import type { Dispatch, SetStateAction } from "react";
import type { AuditRecord } from "./audit";
import type { ChangeRequestSummary } from "./changeRequest";
import type { EquipmentParameters } from "./parameters";
import type { UserSummary } from "./user";
import type { WorkflowStepSummary } from "./workflow";

export interface AppOutletContext {
  currentUser: UserSummary;
  changeRequests: ChangeRequestSummary[];
  setChangeRequests: Dispatch<SetStateAction<ChangeRequestSummary[]>>;
  workflowSteps: WorkflowStepSummary[];
  setWorkflowSteps: Dispatch<SetStateAction<WorkflowStepSummary[]>>;
  auditRecords: AuditRecord[];
  setAuditRecords: Dispatch<SetStateAction<AuditRecord[]>>;
  parameterSnapshots: Record<string, EquipmentParameters>;
  setParameterSnapshots: Dispatch<
    SetStateAction<Record<string, EquipmentParameters>>
  >;
  rejectedParameterSnapshots: Record<string, EquipmentParameters>;
  setRejectedParameterSnapshots: Dispatch<
    SetStateAction<Record<string, EquipmentParameters>>
  >;
}
