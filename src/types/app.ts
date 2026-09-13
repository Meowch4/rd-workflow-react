import type { Dispatch, SetStateAction } from "react";
import type { AuditRecord } from "./audit";
import type { ChangeRequestSummary } from "./changeRequest";
import type { EquipmentParameters } from "./parameters";
import type { ProjectSummary } from "./projects";
import type { UserSummary } from "./user";
import type { WorkflowStepSummary } from "./workflow";

export interface AppOutletContext {
  currentUser: UserSummary;
  projects: ProjectSummary[];
  setProjects: Dispatch<SetStateAction<ProjectSummary[]>>;
  changeRequests: ChangeRequestSummary[];
  setChangeRequests: Dispatch<SetStateAction<ChangeRequestSummary[]>>;
  workflowSteps: WorkflowStepSummary[];
  setWorkflowSteps: Dispatch<SetStateAction<WorkflowStepSummary[]>>;
  auditRecords: AuditRecord[];
  setAuditRecords: Dispatch<SetStateAction<AuditRecord[]>>;
  originalParameterSnapshots: Record<string, EquipmentParameters>;
  setOriginalParameterSnapshots: Dispatch<
    SetStateAction<Record<string, EquipmentParameters>>
  >;
  parameterSnapshots: Record<string, EquipmentParameters>;
  setParameterSnapshots: Dispatch<
    SetStateAction<Record<string, EquipmentParameters>>
  >;
  rejectedParameterSnapshots: Record<string, EquipmentParameters>;
  setRejectedParameterSnapshots: Dispatch<
    SetStateAction<Record<string, EquipmentParameters>>
  >;
}
