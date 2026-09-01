import type { ChangeRequestStatus } from "../../types/changeRequest";

interface ChangeRequestStatusBadgeProps {
    status: ChangeRequestStatus
}

const statusStyles: Record<ChangeRequestStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  IN_REVIEW: "bg-blue-100 text-blue-700",
  REWORK: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

const statusLabels: Record<ChangeRequestStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In Review",
  REWORK: "Rework",
  COMPLETED: "Completed",
};

export default function ChangeRequestStatusBadge({ status }: ChangeRequestStatusBadgeProps) {
    return (
        <span className={`px-2 py-1 rounded ${statusStyles[status]}`}>
            {statusLabels[status]}
        </span>
    )
}