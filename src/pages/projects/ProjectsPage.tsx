import { useState } from "react";
import ProjectTable from "../../components/projects/ProjectTable";
import { projectsData } from "../../mocks/projects";
import ProjectFilters, { type ProjectStatusFilter } from "../../components/projects/ProjectFilters";


export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>("ALL");

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();


  const filteredProjects = projectsData.filter((project) => {
    return (
      (project.projectNumber.toLowerCase().includes(normalizedSearchTerm) ||
        project.name.toLowerCase().includes(normalizedSearchTerm)) &&
      (statusFilter === "ALL" || project.status === statusFilter)
    );
  });

  return (
    <section>
      <h1>Projects</h1>
      <p>查看和管理研发项目。</p>
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
        <div className="mb-3 mt-6 text-sm text-slate-500">Showing {filteredProjects.length} of {projectsData.length} projects</div>
        <ProjectTable projects={filteredProjects} />
      </div>
    </section>
  );
}
