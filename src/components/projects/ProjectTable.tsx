import { Link } from "react-router";
import type { ProjectSummary } from "../../types/projects";
import ProjectStatusBadge from "./ProjectStatusBadge";

interface ProjectTableProps {
    projects: ProjectSummary[];
}

export default function ProjectTable({ projects }: ProjectTableProps) {
    const headerCellClassName = "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="font-semibold text-slate-900">Projects</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className={headerCellClassName} scope="col">Project Number</th>
                            <th className={headerCellClassName} scope="col">Name</th>
                            <th className={headerCellClassName} scope="col">Owner</th>
                            <th className={headerCellClassName} scope="col">Status</th>
                            <th className={headerCellClassName} scope="col">Change Requests</th>
                            <th className={headerCellClassName} scope="col">Created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                {projects.length > 0 ? (
                projects.map((project) => (
                        <tr
                        key={project.id}
                        className="transition-colors hover:bg-slate-50"
                        >
                        <td className="whitespace-nowrap px-6 py-4">
                            <Link
                            to={`/projects/${project.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                            {project.projectNumber}
                            </Link>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                            {project.name}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                            {project.ownerName}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                            <ProjectStatusBadge status={project.status} />
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                            {project.changeRequestCount}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                            {project.createdAt}
                        </td>
                        </tr>
                    ))
                    ) : (<tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">暂无项目</td>
                        </tr>)
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}            