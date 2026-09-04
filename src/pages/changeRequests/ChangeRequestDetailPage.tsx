import { useState } from "react";
import { Link, useParams } from "react-router";
import ChangeRequestStatusBadge from "../../components/changeRequests/ChangeRequestStatusBadge";
import ParameterForm from "../../components/parameters/ParameterForm";
import ParameterSummary from "../../components/parameters/ParameterSummary";
import WorkflowTimeline from "../../components/workflow/WorkflowTimeline";
import { changeRequestsData } from "../../mocks/changeRequests";
import { parameterSnapshotsData } from "../../mocks/parameters";
import { projectsData } from "../../mocks/projects";
import { workflowStepsData } from "../../mocks/workflowSteps";
import type { EquipmentParameters } from "../../types/parameters";

export default function ChangeRequestDetailPage() {
  const { projectId, changeRequestId } = useParams();
  const [parameterSnapshots, setParameterSnapshots] = useState(parameterSnapshotsData);

  const project = projectsData.find((item) => item.id === projectId);
  const changeRequest = changeRequestsData.find(
    (item) =>
      item.id === changeRequestId && item.projectId === projectId,
  );

  const projectPath = project ? `/projects/${project.id}` : "/projects";

  if (!project || !changeRequest) {
    return (
      <section>
        <Link
          to={projectPath}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          Change Request not found
        </h1>
        <p className="mt-2 text-slate-500">
          The requested change request does not belong to this project or does
          not exist.
        </p>
      </section>
    );
  }

  // 根据 changeRequestId 过滤出对应的 workflowSteps
  const workflowSteps = workflowStepsData.filter(
    (step) => step.changeRequestId === changeRequest.id,
  );
  const currentChangeRequestId = changeRequest.id;
  const savedParameters = parameterSnapshots[currentChangeRequestId];

  function handleParameterSave(parameters: EquipmentParameters) {
    setParameterSnapshots((current) => ({
      ...current,
      [currentChangeRequestId]: parameters,
    }));
  }

  return (
    <section>
      <Link
        to={projectPath}
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        ← Back to {project.projectNumber}
      </Link>

      <header className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600">
            {changeRequest.requestNumber}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {changeRequest.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {project.projectNumber} · {project.name}
          </p>
        </div>

        <ChangeRequestStatusBadge status={changeRequest.status} />
      </header>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">
          Change Request Overview
        </h2>

        <dl className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-slate-500">Current Step</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {changeRequest.currentStepName}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-slate-500">Current Assignee</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {changeRequest.currentAssigneeName ?? "—"}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-slate-500">Last Updated</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {changeRequest.updatedAt}
            </dd>
          </div>
        </dl>
      </div>

      <WorkflowTimeline steps={workflowSteps} />
      <ParameterSummary parameters={savedParameters} />
      <ParameterForm
        key={currentChangeRequestId}
        savedParameters={savedParameters}
        onSave={handleParameterSave}
      />
    </section>
  );
}
