import type { ChangeRequestAction } from "./changeRequest";
import type { ParameterChange } from "./parameters";

export interface AuditRecord {
  id: string;
  changeRequestId: string;
  stepId: string;
  stepName: string;
  actorId: string;
  actorName: string;
  action: ChangeRequestAction;
  createdAt: string;
  comment: string | null;
  parameterChanges: ParameterChange[];
}
