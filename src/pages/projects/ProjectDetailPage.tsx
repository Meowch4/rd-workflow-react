import { Link, useOutletContext, useParams } from "react-router";
import ProjectStatusBadge from "../../components/projects/ProjectStatusBadge";
import ChangeRequestTable from "../../components/changeRequests/ChangeRequestTable";
import type { AppOutletContext } from "../../types/app";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { currentUser, projects, changeRequests } =
    useOutletContext<AppOutletContext>();

  const project = projects.find((project) => project.id === projectId);
  
  if (!project) {
    return (
      <section>
        <Link
          to="/projects"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
          ← Back to Projects
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">
          Project not found
        </h1>
        <p className="mt-2 text-slate-500">
          The requested project does not exist.
        </p>
      </section>
    );
  }

  const projectChangeRequests = changeRequests.filter(
    (changeRequest) => changeRequest.projectId === project.id,
  );

  return (
    <section>
      <Link
        to="/projects"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        ← Back to Projects
      </Link>

      <header className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600">
            {project.projectNumber}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {project.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.role === "PROJECT_MANAGER" ? (
            <Link
              to={`/projects/${project.id}/change-requests/new`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create Change Request
            </Link>
          ) : null}
          <ProjectStatusBadge status={project.status} />
        </div>
      </header>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Project Overview</h2>

        <dl className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-slate-500">Owner</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {project.ownerName}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-slate-500">Change Requests</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {projectChangeRequests.length}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-slate-500">Created</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {project.createdAt}
            </dd>
          </div>
        </dl>
      </div>

      <ChangeRequestTable changeRequests={projectChangeRequests} />
    </section>
  );
}
