import ProjectTable from "../../components/projects/ProjectTable";
import { projectsData } from "../../mocks/projects";

export default function ProjectsPage() {
  return (
    <section>
      <h1>Projects</h1>
      <p>查看和管理研发项目。</p>

      <div>
        <ProjectTable projects={projectsData} />
      </div>
    </section>
  );
}
