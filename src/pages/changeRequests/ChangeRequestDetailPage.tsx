import { Link, useOutletContext, useParams } from "react-router";
import AuditTimeline from "../../components/audit/AuditTimeline";
import ChangeRequestStatusBadge from "../../components/changeRequests/ChangeRequestStatusBadge";
import ParameterForm from "../../components/parameters/ParameterForm";
import ParameterChanges from "../../components/parameters/ParameterChanges";
import ParameterSummary from "../../components/parameters/ParameterSummary";
import WorkflowActionPanel from "../../components/workflow/WorkflowActionPanel";
import WorkflowTimeline from "../../components/workflow/WorkflowTimeline";
import { equipmentTemplatesData } from "../../mocks/equipmentTemplates";
import type { AppOutletContext } from "../../types/app";
import type { AuditRecord } from "../../types/audit";
import type { EquipmentParameters } from "../../types/parameters";
import type { WorkflowStepSummary } from "../../types/workflow";
import { getParameterChanges } from "../../utils/parameterChanges";

export default function ChangeRequestDetailPage() {
  // 从url读取projectId和changeRequestId
  const { projectId, changeRequestId } = useParams();
  // 从OutletContext中获取当前用户信息
  const {
    currentUser,
    projects,
    setProjects,
    changeRequests,
    setChangeRequests,
    workflowSteps,
    setWorkflowSteps,
    auditRecords,
    setAuditRecords,
    originalParameterSnapshots,
    parameterSnapshots,
    setParameterSnapshots,
    rejectedParameterSnapshots,
    setRejectedParameterSnapshots,
  } = useOutletContext<AppOutletContext>();

  const project = projects.find((item) => item.id === projectId);
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
    originalParameterSnapshots[currentChangeRequestId];
  const savedParameters = parameterSnapshots[currentChangeRequestId];
  const rejectedParameters =
    rejectedParameterSnapshots[currentChangeRequestId];
  // 最新的被reject的step
  const latestRejectedStep = [...currentWorkflowSteps]
    .reverse()
    .find((step) => step.status === "REJECTED");
  const canResubmit = rejectedParameters
    ? getParameterChanges(rejectedParameters, savedParameters).length > 0
    : false;
  const savedParameterChanges = getParameterChanges(
    originalParameters,
    savedParameters,
  );
  const hasSavedParameterChanges = savedParameterChanges.length > 0;
  const canEditParameters =
    (changeRequest.status === "DRAFT" || changeRequest.status === "REWORK") &&
    currentStep?.status === "PROCESSING" &&
    currentStep.assigneeId === currentUser.id;
  // 当前ChangeRequest对应的AuditRecord
  const currentAuditRecords = auditRecords.filter(
    (record) => record.changeRequestId === currentChangeRequestId,
  );

  function appendAuditRecord(record: Omit<AuditRecord, "id">) {
    setAuditRecords((current) => [
      { ...record, id: `audit-${crypto.randomUUID()}` },
      ...current,
    ]);
  }

  // 传给ParameterForm组件的handleSave函数，处理参数保存逻辑
  function handleParameterSave(parameters: EquipmentParameters) {
    if (!canEditParameters) return;

    setParameterSnapshots((current) => ({
      ...current,
      [currentChangeRequestId]: parameters,
    }));
  }

  // Draft状态下提交
  function handleSubmit() {
    if (!changeRequest || changeRequest.status !== "DRAFT") return;

    const currentStepIndex = currentWorkflowSteps.findIndex(
      (step) => step.status === "PROCESSING",
    );
    if (currentStepIndex === -1) return;

    const stepToSubmit = currentWorkflowSteps[currentStepIndex];
    if (stepToSubmit.assigneeId !== currentUser.id) return;

    const nextStep = currentWorkflowSteps[currentStepIndex + 1];
    if (!nextStep || nextStep.status !== "PENDING") return;

    const submittedAt = new Date().toISOString();

    setWorkflowSteps((current) =>
      current.map((step) => {
        if (step.id === stepToSubmit.id) {
          return { ...step, status: "APPROVED", completedAt: submittedAt };
        }
        if (step.id === nextStep.id) {
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
              status: "IN_REVIEW",
              currentStepName: nextStep.name,
              currentAssigneeName: nextStep.assigneeName,
              updatedAt: submittedAt,
            }
          : request,
      ),
    );

    // 如果当前Project的状态是DRAFT，提交后需要把对应的Project状态改为ACTIVE
    setProjects((current) =>
      current.map((item) =>
        item.id === changeRequest.projectId && item.status === "DRAFT"
          ? { ...item, status: "ACTIVE" }
          : item,
      ),
    );

    appendAuditRecord({
      changeRequestId: currentChangeRequestId,
      stepId: stepToSubmit.id,
      stepName: stepToSubmit.name,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: "SUBMIT",
      createdAt: submittedAt,
      comment: null,
      parameterChanges: savedParameterChanges,
    });
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

    // Approve后加入一条历史记录
    appendAuditRecord({
      changeRequestId: currentChangeRequestId,
      stepId: stepToApprove.id,
      stepName: stepToApprove.name,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: "APPROVE",
      createdAt: approvedAt,
      comment: null,
      parameterChanges: [],
    });
  }

  function handleResubmit() {
    if (!changeRequest || changeRequest.status !== "REWORK") return;
    if (!rejectedParameters) return;
    const parameterChanges = getParameterChanges(
      rejectedParameters,
      savedParameters,
    );
    if (parameterChanges.length === 0) return;

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

    // Resubmit后加入一条历史记录
    appendAuditRecord({
      changeRequestId: currentChangeRequestId,
      stepId: reworkStepToSubmit.id,
      stepName: reworkStepToSubmit.name,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: "RESUBMIT",
      createdAt: resubmittedAt,
      comment: null,
      parameterChanges,
    });
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

    // reject后加入一条历史记录
    appendAuditRecord({
      changeRequestId: currentChangeRequestId,
      stepId: stepToReject.id,
      stepName: stepToReject.name,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: "REJECT",
      createdAt: rejectedAt,
      comment: reason,
      parameterChanges: [],
    });
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

      <WorkflowTimeline
        steps={currentWorkflowSteps}
        changeRequestStatus={changeRequest.status}
      />
      <WorkflowActionPanel
        currentStep={currentStep}
        currentUser={currentUser}
        changeRequestStatus={changeRequest.status}
        hasSavedParameterChanges={hasSavedParameterChanges}
        canResubmit={canResubmit}
        latestRejectReason={latestRejectedStep?.comment ?? null}
        onSubmit={handleSubmit}
        onApprove={handleApprove}
        onReject={handleReject}
        onResubmit={handleResubmit}
      />
      <ParameterSummary parameters={savedParameters} />
      <ParameterChanges
        original={originalParameters}
        current={savedParameters}
      />
      {canEditParameters ? (
        <ParameterForm
          key={currentChangeRequestId}
          savedParameters={savedParameters}
          templates={equipmentTemplatesData}
          onSave={handleParameterSave}
        />
      ) : null}
      <AuditTimeline records={currentAuditRecords} />
    </section>
  );
}
