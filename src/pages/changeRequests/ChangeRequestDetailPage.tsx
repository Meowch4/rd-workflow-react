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
import type { WorkflowStepSummary } from "../../types/workflow";
import { getParameterChanges } from "../../utils/parameterChanges";

// 用mock data创建一个可编辑的parameterSnapshots对象，避免直接修改原始数据
function createEditableParameterSnapshots(): Record<string, EquipmentParameters> {
  return Object.fromEntries(
    Object.entries(originalParameterSnapshotsData).map(([id, parameters]) => [
      id,
      { ...parameters },
    ]),
  );
}

// 为已经处于返工状态的 mock 数据保留“被驳回时”的参数。
function createRejectedParameterSnapshots(): Record<
  string,
  EquipmentParameters
> {
  return changeRequestsData.reduce<Record<string, EquipmentParameters>>(
    (snapshots, request) => {
      const parameters = originalParameterSnapshotsData[request.id];

      if (request.status === "REWORK" && parameters) {
        snapshots[request.id] = { ...parameters };
      }

      return snapshots;
    },
    {},
  );
}

export default function ChangeRequestDetailPage() {
  // 从url读取projectId和changeRequestId
  const { projectId, changeRequestId } = useParams();
  // 从OutletContext中获取当前用户信息
  const { currentUser } = useOutletContext<AppOutletContext>();
  const [changeRequests, setChangeRequests] = useState(changeRequestsData);
  const [workflowSteps, setWorkflowSteps] = useState(workflowStepsData);
  const [parameterSnapshots, setParameterSnapshots] = useState(
    createEditableParameterSnapshots,
  );
  const [rejectedParameterSnapshots, setRejectedParameterSnapshots] = useState(
    createRejectedParameterSnapshots,
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

  // 当前 changeRequestId 对应的 workflowSteps
  const currentWorkflowSteps = workflowSteps.filter(
    (step) => step.changeRequestId === changeRequest.id,
  );
  // 当前状态是PROCESSING的workflowStep，表示当前正在处理的步骤
  const currentStep = currentWorkflowSteps.find(
    (step) => step.status === "PROCESSING",
  );
  const currentChangeRequestId = changeRequest.id;
  const originalParameters =
    originalParameterSnapshotsData[currentChangeRequestId];
  const savedParameters = parameterSnapshots[currentChangeRequestId];
  const rejectedParameters =
    rejectedParameterSnapshots[currentChangeRequestId];
  const latestRejectedStep = [...currentWorkflowSteps]
    .reverse()
    .find((step) => step.status === "REJECTED");
  const canResubmit = rejectedParameters
    ? getParameterChanges(rejectedParameters, savedParameters).length > 0
    : false;

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

  function handleResubmit() {
    if (!changeRequest || changeRequest.status !== "REWORK") return;
    if (!rejectedParameters) return;
    if (getParameterChanges(rejectedParameters, savedParameters).length === 0)
      return;

    // 找到当前正在进行的step的索引
    const reworkStepIndex = currentWorkflowSteps.findIndex(
      (step) => step.status === "PROCESSING",
    );
    if (reworkStepIndex === -1) return;

    const reworkStepToSubmit = currentWorkflowSteps[reworkStepIndex];
    if (reworkStepToSubmit.assigneeId !== currentUser.id) return;

    // 找到离Rework这步前面最近的被Reject的step，作为新建Review step的模板
    const rejectedReviewStep = currentWorkflowSteps
      .slice(0, reworkStepIndex)
      .reverse()
      .find((step) => step.status === "REJECTED");
    if (!rejectedReviewStep) return;

    const resubmittedAt = new Date().toISOString();
    const newReviewStep: WorkflowStepSummary = {
      id: `${currentChangeRequestId}-review-${Date.now()}`,
      changeRequestId: currentChangeRequestId,
      name: rejectedReviewStep.name,
      assigneeId: rejectedReviewStep.assigneeId,
      assigneeName: rejectedReviewStep.assigneeName,
      status: "PROCESSING",
      completedAt: null,
      comment: null,
    };

    // 依然把原来的step一变二，插入一个新的Review step
    setWorkflowSteps((current) =>
      current.flatMap((step) =>
        step.id === reworkStepToSubmit.id
          ? [
              {
                ...step,
                status: "APPROVED" as const,
                completedAt: resubmittedAt,
              },
              newReviewStep,
            ]
          : step,
      ),
    );

    // 修改changeRequest的状态和disgner信息
    setChangeRequests((current) =>
      current.map((request) =>
        request.id === currentChangeRequestId
          ? {
              ...request,
              status: "IN_REVIEW",
              currentStepName: newReviewStep.name,
              currentAssigneeName: newReviewStep.assigneeName,
              updatedAt: resubmittedAt,
            }
          : request,
      ),
    );
  }

  function handleReject(reason: string) {
    // 只有正在进行的
    const currentStepIndex = currentWorkflowSteps.findIndex(
      (step) => step.status === "PROCESSING",
    );
    if (currentStepIndex === -1) return;

    // 且是当前用户能reject的step才能操作
    const stepToReject = currentWorkflowSteps[currentStepIndex];
    if (stepToReject.assigneeId !== currentUser.id) return;

    // MVP 约束：第一个流程节点固定为 Designer Submit。
    const designerStep = currentWorkflowSteps[0];
    if (!designerStep?.assigneeId || !designerStep.assigneeName) return;

    // 记录reject的时间
    const rejectedAt = new Date().toISOString();
    // 新建一个Rework的step
    const reworkStep: WorkflowStepSummary = {
      id: `${currentChangeRequestId}-rework-${Date.now()}`,
      changeRequestId: currentChangeRequestId,
      name: "Designer Rework",
      assigneeId: designerStep.assigneeId,
      assigneeName: designerStep.assigneeName,
      status: "PROCESSING",
      completedAt: null,
      comment: null,
    };

    // 使用flatMap让原来的一个数组元素变为两个数组元素
    setWorkflowSteps((current) =>
      current.flatMap((step) =>
        // 找到该reject的step再插入节点
        step.id === stepToReject.id
          ? [
              {
                ...step,
                status: "REJECTED" as const,
                completedAt: rejectedAt,
                comment: reason,
              },
              reworkStep,
            ]
        // 非要reject的step就保持不变
          : step,
      ),
    );

    setChangeRequests((current) =>
      current.map((request) =>
        // 找到当前对应的changeRequest并修改到REWORK状态,同时更新step信息
        request.id === currentChangeRequestId
          ? {
              ...request,
              status: "REWORK",
              currentStepName: reworkStep.name,
              currentAssigneeName: reworkStep.assigneeName,
              updatedAt: rejectedAt,
            }
          : request,
      ),
    );

    setRejectedParameterSnapshots((current) => ({
      ...current,
      [currentChangeRequestId]: { ...savedParameters },
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

      <WorkflowTimeline steps={currentWorkflowSteps} />
      <WorkflowActionPanel
        currentStep={currentStep}
        currentUser={currentUser}
        changeRequestStatus={changeRequest.status}
        canResubmit={canResubmit}
        latestRejectReason={latestRejectedStep?.comment ?? null}
        onApprove={handleApprove}
        onReject={handleReject}
        onResubmit={handleResubmit}
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
