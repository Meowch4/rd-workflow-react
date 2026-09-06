import { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router";
import ChangeRequestStatusBadge from "../../components/changeRequests/ChangeRequestStatusBadge";
import ParameterForm from "../../components/parameters/ParameterForm";
import ParameterChanges from "../../components/parameters/ParameterChanges";
import ParameterSummary from "../../components/parameters/ParameterSummary";
import WorkflowActionPanel from "../../components/workflow/WorkflowActionPanel";
import WorkflowTimeline from "../../components/workflow/WorkflowTimeline";
import { changeRequestsData } from "../../mocks/changeRequests";
import { equipmentTemplatesData } from "../../mocks/equipmentTemplates";
import { originalParameterSnapshotsData } from "../../mocks/parameters";
import { projectsData } from "../../mocks/projects";
import { workflowStepsData } from "../../mocks/workflowSteps";
import type { EquipmentParameters } from "../../types/parameters";
import type { AppOutletContext } from "../../types/user";

// 用mock data创建一个可编辑的parameterSnapshots对象，避免直接修改原始数据
function createEditableParameterSnapshots(): Record<string, EquipmentParameters> {
  return Object.fromEntries(
    Object.entries(originalParameterSnapshotsData).map(([id, parameters]) => [
      id,
      { ...parameters },
    ]),
  );
}

export default function ChangeRequestDetailPage() {
  // 从url读取projectId
  const { projectId, changeRequestId } = useParams();
  // 从OutletContext中获取当前用户信息
  const { currentUser } = useOutletContext<AppOutletContext>();
  const [changeRequests, setChangeRequests] = useState(changeRequestsData);
  const [workflowSteps, setWorkflowSteps] = useState(workflowStepsData);
  const [parameterSnapshots, setParameterSnapshots] = useState(
    createEditableParameterSnapshots,
  );

  const project = projectsData.find((item) => item.id === projectId);
  const changeRequest = changeRequests.find(
    (item) =>
      item.id === changeRequestId && item.projectId === projectId,
  );

  const projectPath = project ? `/projects/${project.id}` : "/projects";

  // 如果没找到projectId对应的项目或者没找到changeRequest
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
  const currentWorkflowSteps = workflowSteps.filter(
    (step) => step.changeRequestId === changeRequest.id,
  );
  const currentStep = currentWorkflowSteps.find(
    (step) => step.status === "PROCESSING",
  );
  const currentChangeRequestId = changeRequest.id;
  const originalParameters =
    originalParameterSnapshotsData[currentChangeRequestId];
  const savedParameters = parameterSnapshots[currentChangeRequestId];

  // 传给ParameterForm组件的handleSave函数，处理参数保存逻辑
  function handleParameterSave(parameters: EquipmentParameters) {
    setParameterSnapshots((current) => ({
      ...current,
      [currentChangeRequestId]: parameters,
    }));
  }
  
  // 传给Approve按钮的handleApprove函数，处理审批通过逻辑
  function handleApprove() {
    const currentStepIndex = currentWorkflowSteps.findIndex(
      (step) => step.status === "PROCESSING",
    );
    if (currentStepIndex === -1) return;

    const stepToApprove = currentWorkflowSteps[currentStepIndex];
    if (stepToApprove.assigneeId !== currentUser.id) return;

    const nextStep = currentWorkflowSteps[currentStepIndex + 1];
    if (nextStep && nextStep.status !== "PENDING") return;

    const approvedAt = new Date().toISOString();

    setWorkflowSteps((current) =>
      current.map((step) => {
        if (step.id === stepToApprove.id) {
          return { ...step, status: "APPROVED", completedAt: approvedAt };
        }
        if (step.id === nextStep?.id) {
          return { ...step, status: "PROCESSING" };
        }
        return step;
      }),
    );

    setChangeRequests((current) =>
      current.map((request) =>
        request.id === currentChangeRequestId
          ? {
              ...request,
              status: nextStep ? "IN_REVIEW" : "COMPLETED",
              currentStepName: nextStep?.name ?? "Completed",
              currentAssigneeName: nextStep?.assigneeName ?? null,
              updatedAt: approvedAt,
            }
          : request,
      ),
    );
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

      <WorkflowTimeline steps={currentWorkflowSteps} />
      <WorkflowActionPanel
        currentStep={currentStep}
        currentUser={currentUser}
        onApprove={handleApprove}
      />
      <ParameterSummary parameters={savedParameters} />
      <ParameterChanges
        original={originalParameters}
        current={savedParameters}
      />
      <ParameterForm
        key={currentChangeRequestId}
        savedParameters={savedParameters}
        templates={equipmentTemplatesData}
        onSave={handleParameterSave}
      />
    </section>
  );
}
