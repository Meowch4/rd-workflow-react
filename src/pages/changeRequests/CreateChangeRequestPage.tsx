import { useState, type SubmitEvent } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router";
import { equipmentTemplatesData } from "../../mocks/equipmentTemplates";
import { usersData } from "../../mocks/currentUser";
import type { AppOutletContext } from "../../types/app";
import type { ChangeRequestSummary } from "../../types/changeRequest";
import type { WorkflowStepSummary } from "../../types/workflow";

interface CreateChangeRequestDraft {
  title: string;
  templateId: string;
  designerId: string;
  mechanicalEngineerId: string;
  electricalEngineerId: string;
  qaId: string;
}

type CreateChangeRequestErrors = Partial<
  Record<keyof CreateChangeRequestDraft, string>
>;

// cr最开始的draft状态，所有字段为空
const emptyDraft: CreateChangeRequestDraft = {
  title: "",
  templateId: "",
  designerId: "",
  mechanicalEngineerId: "",
  electricalEngineerId: "",
  qaId: "",
};

const inputClassName =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const labelClassName = "text-sm font-medium text-slate-700";
const errorClassName = "mt-1 text-sm text-red-600";

// 创建changeRequest的requestNumber，格式为CR-YYYY-XXX，其中YYYY是当前年份，XXX是三位数的顺序号
function createRequestNumber(changeRequests: ChangeRequestSummary[]) {
  const year = new Date().getFullYear();
  const prefix = `CR-${year}-`;
  const largestSequence = changeRequests.reduce((largest, request) => {
    if (!request.requestNumber.startsWith(prefix)) return largest;

    const sequence = Number(request.requestNumber.slice(prefix.length));
    return Number.isNaN(sequence) ? largest : Math.max(largest, sequence);
  }, 0);

  return `${prefix}${String(largestSequence + 1).padStart(3, "0")}`;
}

export default function CreateChangeRequestPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    currentUser,
    projects,
    changeRequests,
    setChangeRequests,
    setWorkflowSteps,
    setAuditRecords,
    setOriginalParameterSnapshots,
    setParameterSnapshots,
  } = useOutletContext<AppOutletContext>();
  const [draft, setDraft] = useState(emptyDraft);
  const [errors, setErrors] = useState<CreateChangeRequestErrors>({});

  const project = projects.find((item) => item.id === projectId);
  // 筛选出每个role下面的用户列表呈现在下拉框里
  const designers = usersData.filter((user) => user.role === "DESIGNER");
  const mechanicalEngineers = usersData.filter(
    (user) => user.role === "MECHANICAL_ENGINEER",
  );
  const electricalEngineers = usersData.filter(
    (user) => user.role === "ELECTRICAL_ENGINEER",
  );
  const qaUsers = usersData.filter((user) => user.role === "QA");

  if (!project) {
    return (
      <section>
        <Link
          to="/projects"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Projects
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          Project not found
        </h1>
      </section>
    );
  }

  if (currentUser.role !== "PROJECT_MANAGER") {
    return (
      <section>
        <Link
          to={`/projects/${project.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to {project.projectNumber}
        </Link>
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-xl font-semibold text-amber-900">
            You cannot create a change request
          </h1>
          <p className="mt-2 text-sm text-amber-700">
            Only a Project Manager can perform this action.
          </p>
        </div>
      </section>
    );
  }

  // 创建cr的submit handler，先做表单验证，如果有错误就显示错误信息，如果没有错误就创建cr和workflowStep，并跳转到cr详情页
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    // 权限验证
    if (!project || currentUser.role !== "PROJECT_MANAGER") return;

    // 从表单里填入的信息找到对应的对象
    const selectedTemplate = equipmentTemplatesData.find(
      (template) => template.id === draft.templateId,
    );
    const designer = designers.find((user) => user.id === draft.designerId);
    const mechanicalEngineer = mechanicalEngineers.find(
      (user) => user.id === draft.mechanicalEngineerId,
    );
    const electricalEngineer = electricalEngineers.find(
      (user) => user.id === draft.electricalEngineerId,
    );
    const qaUser = qaUsers.find((user) => user.id === draft.qaId);
    const nextErrors: CreateChangeRequestErrors = {};

    // 如果表单填入的信息空着则提示错误并阻止提交
    if (!draft.title.trim()) nextErrors.title = "Title is required.";
    if (!selectedTemplate) {
      nextErrors.templateId = "Select an equipment template.";
    }
    if (!designer) nextErrors.designerId = "Select a designer.";
    if (!mechanicalEngineer) {
      nextErrors.mechanicalEngineerId = "Select a mechanical engineer.";
    }
    if (!electricalEngineer) {
      nextErrors.electricalEngineerId = "Select an electrical engineer.";
    }
    if (!qaUser) nextErrors.qaId = "Select a QA reviewer.";

    setErrors(nextErrors);
    if (
      Object.keys(nextErrors).length > 0 ||
      !selectedTemplate ||
      !designer ||
      !mechanicalEngineer ||
      !electricalEngineer ||
      !qaUser
    ) {
      return;
    }

    // 生成新cr的创建时间，id等并生成cr对象和steps
    const createdAt = new Date().toISOString();
    const changeRequestId = `cr-${crypto.randomUUID()}`;
    const designerStepId = `step-${crypto.randomUUID()}`;
    const newChangeRequest: ChangeRequestSummary = {
      id: changeRequestId,
      projectId: project.id,
      requestNumber: createRequestNumber(changeRequests),
      title: draft.title.trim(),
      status: "DRAFT",
      currentStepName: "Designer Submit",
      currentAssigneeName: designer.name,
      updatedAt: createdAt,
    };
    const newWorkflowSteps: WorkflowStepSummary[] = [
      {
        id: designerStepId,
        changeRequestId,
        name: "Designer Submit",
        assigneeId: designer.id,
        assigneeName: designer.name,
        status: "PROCESSING",
        completedAt: null,
        comment: null,
      },
      {
        id: `step-${crypto.randomUUID()}`,
        changeRequestId,
        name: "Mechanical Review",
        assigneeId: mechanicalEngineer.id,
        assigneeName: mechanicalEngineer.name,
        status: "PENDING",
        completedAt: null,
        comment: null,
      },
      {
        id: `step-${crypto.randomUUID()}`,
        changeRequestId,
        name: "Electrical Review",
        assigneeId: electricalEngineer.id,
        assigneeName: electricalEngineer.name,
        status: "PENDING",
        completedAt: null,
        comment: null,
      },
      {
        id: `step-${crypto.randomUUID()}`,
        changeRequestId,
        name: "QA Review",
        assigneeId: qaUser.id,
        assigneeName: qaUser.name,
        status: "PENDING",
        completedAt: null,
        comment: null,
      },
    ];

    // 更新新增cr后需要更新的对应数据
    setChangeRequests((current) => [...current, newChangeRequest]);
    setWorkflowSteps((current) => [...current, ...newWorkflowSteps]);
    setOriginalParameterSnapshots((current) => ({
      ...current,
      [changeRequestId]: { ...selectedTemplate.parameters },
    }));
    setParameterSnapshots((current) => ({
      ...current,
      [changeRequestId]: { ...selectedTemplate.parameters },
    }));
    setAuditRecords((current) => [
      {
        id: `audit-${crypto.randomUUID()}`,
        changeRequestId,
        stepId: designerStepId,
        stepName: "Change Request",
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: "CREATE",
        createdAt,
        comment: null,
        parameterChanges: [],
      },
      ...current,
    ]);

    // 跳转到新增的cr页面
    navigate(`/projects/${project.id}/change-requests/${changeRequestId}`);
  }

  return (
    <section className="mx-auto max-w-3xl">
      <Link
        to={`/projects/${project.id}`}
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        ← Back to {project.projectNumber}
      </Link>

      <header className="mt-4">
        <p className="text-sm font-medium text-blue-600">
          {project.projectNumber}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Create Change Request
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Define the request, starting parameters, and sequential reviewers.
        </p>
      </header>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="title" className={labelClassName}>
            Title
          </label>
          <input
            id="title"
            value={draft.title}
            onChange={(event) =>
              setDraft((current) => ({ ...current, title: event.target.value }))
            }
            className={inputClassName}
          />
          {errors.title ? <p className={errorClassName}>{errors.title}</p> : null}
        </div>

        <div className="mt-5">
          <label htmlFor="templateId" className={labelClassName}>
            Equipment Template
          </label>
          <select
            id="templateId"
            value={draft.templateId}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                templateId: event.target.value,
              }))
            }
            className={inputClassName}
          >
            <option value="">Select a template</option>
            {equipmentTemplatesData.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          {errors.templateId ? (
            <p className={errorClassName}>{errors.templateId}</p>
          ) : null}
        </div>

        <fieldset className="mt-6 border-t border-slate-200 pt-6">
          <legend className="font-semibold text-slate-900">
            Workflow Assignees
          </legend>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="designerId" className={labelClassName}>
                Designer
              </label>
              <select
                id="designerId"
                value={draft.designerId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    designerId: event.target.value,
                  }))
                }
                className={inputClassName}
              >
                <option value="">Select a designer</option>
                {designers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              {errors.designerId ? (
                <p className={errorClassName}>{errors.designerId}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="mechanicalEngineerId" className={labelClassName}>
                Mechanical Engineer
              </label>
              <select
                id="mechanicalEngineerId"
                value={draft.mechanicalEngineerId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    mechanicalEngineerId: event.target.value,
                  }))
                }
                className={inputClassName}
              >
                <option value="">Select a mechanical engineer</option>
                {mechanicalEngineers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              {errors.mechanicalEngineerId ? (
                <p className={errorClassName}>
                  {errors.mechanicalEngineerId}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="electricalEngineerId" className={labelClassName}>
                Electrical Engineer
              </label>
              <select
                id="electricalEngineerId"
                value={draft.electricalEngineerId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    electricalEngineerId: event.target.value,
                  }))
                }
                className={inputClassName}
              >
                <option value="">Select an electrical engineer</option>
                {electricalEngineers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              {errors.electricalEngineerId ? (
                <p className={errorClassName}>
                  {errors.electricalEngineerId}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="qaId" className={labelClassName}>
                QA Reviewer
              </label>
              <select
                id="qaId"
                value={draft.qaId}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, qaId: event.target.value }))
                }
                className={inputClassName}
              >
                <option value="">Select a QA reviewer</option>
                {qaUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              {errors.qaId ? <p className={errorClassName}>{errors.qaId}</p> : null}
            </div>
          </div>
        </fieldset>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-6">
          <Link
            to={`/projects/${project.id}`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Change Request
          </button>
        </div>
      </form>
    </section>
  );
}
