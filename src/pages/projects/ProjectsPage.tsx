import { useState } from "react";
import { Link, useOutletContext } from "react-router";
import ProjectTable from "../../components/projects/ProjectTable";
import ProjectFilters, { type ProjectStatusFilter } from "../../components/projects/ProjectFilters";
import type { AppOutletContext } from "../../types/app";


export default function ProjectsPage() {
  const { currentUser, projects, changeRequests } =
    useOutletContext<AppOutletContext>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>("ALL");

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();


  const projectsWithCurrentCounts = projects.map((project) => ({
    ...project,
    changeRequestCount: changeRequests.filter(
      (changeRequest) => changeRequest.projectId === project.id,
    ).length,
  }));

  // 根据搜索词筛选project
  const filteredProjects = projectsWithCurrentCounts.filter((project) => {
    return (
      (project.projectNumber.toLowerCase().includes(normalizedSearchTerm) ||
        project.name.toLowerCase().includes(normalizedSearchTerm)) &&
      (statusFilter === "ALL" || project.status === statusFilter)
    );
  });

  return (
    <section>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="mt-2 text-sm text-slate-500">查看和管理研发项目。</p>
        </div>
        {/* 如果当前用户有权限，显示创建项目按钮 */}
        {currentUser.role === "PROJECT_MANAGER" ? (
          <Link
            to="/projects/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Project
          </Link>
        ) : null}
      </header>
      <ProjectFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={() => {
          setSearchTerm('')
          setStatusFilter('ALL')
        }}
      />

      <div>
        <div className="mb-3 mt-6 text-sm text-slate-500">Showing {filteredProjects.length} of {projectsWithCurrentCounts.length} projects</div>
        <ProjectTable projects={filteredProjects} />
      </div>
    </section>
  );
}
