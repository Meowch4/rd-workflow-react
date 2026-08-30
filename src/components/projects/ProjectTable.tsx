import { Link } from "react-router";
import type { ProjectSummary } from "../../types/projects";
import ProjectStatusBadge from "./ProjectStatusBadge";
import { Table, type TableColumnsType } from "antd";

interface ProjectTableProps {
    projects: ProjectSummary[];
}

const columns: TableColumnsType<ProjectSummary> = [
        {
            title: "Project Number",
            dataIndex: "projectNumber",
            key: "projectNumber",
            render: (_, project) => (
                <Link
                    to={`/projects/${project.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    {project.projectNumber}
                </Link>
            ),
            sorter: (a, b) => a.projectNumber.localeCompare(b.projectNumber),
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Owner",
            dataIndex: "ownerName",
            key: "ownerName",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (_, project) => <ProjectStatusBadge status={project.status} />,
        },
        {
            title: "Change Requests",
            dataIndex: "changeRequestCount",
            key: "changeRequestCount",
            sorter: (a, b) => a.changeRequestCount - b.changeRequestCount,
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
        },
]

export default function ProjectTable({ projects }: ProjectTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="font-semibold text-slate-900">Projects</h2>
            </div>
            <div className="overflow-x-auto">
                <Table<ProjectSummary>
                    rowKey="id"
                    columns={columns}
                    dataSource={projects}
                    pagination={false}
                    locale={{ emptyText: "暂无项目" }}
                />
            </div>
        </div>
    )
}            