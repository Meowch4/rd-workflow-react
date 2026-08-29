import type { ProjectStatusBadgeProps, ProjectStatus } from "../../types/projects";

const statusStyles: Record<ProjectStatus, string> = {
    "DRAFT": "bg-gray-500",
    "ACTIVE": "bg-blue-500",
    "COMPLETED": "bg-green-500"
};

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
    return (
        <span className={`px-2 py-1 rounded text-white ${statusStyles[status]}`}>
            {status}
        </span>
    )
}