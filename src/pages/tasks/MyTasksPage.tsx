import { Table, type TableColumnsType } from "antd";
import { Link, useOutletContext } from "react-router";
import ChangeRequestStatusBadge from "../../components/changeRequests/ChangeRequestStatusBadge";
import type { AppOutletContext } from "../../types/app";
import {
  getAssignedWorkflowTasks,
  type AssignedWorkflowTask,
} from "../../utils/workflowTasks";

const columns: TableColumnsType<AssignedWorkflowTask> = [
  {
    title: "Request Number",
    key: "requestNumber",
    render: (_, task) => (
      <Link
        to={`/projects/${task.changeRequest.projectId}/change-requests/${task.changeRequest.id}`}
        className="font-medium text-blue-600 hover:text-blue-700"
      >
        {task.changeRequest.requestNumber}
      </Link>
    ),
  },
  {
    title: "Title",
    key: "title",
    render: (_, task) => task.changeRequest.title,
  },
  {
    title: "Current Step",
    key: "currentStep",
    render: (_, task) => task.step.name,
  },
  {
    title: "Status",
    key: "status",
    render: (_, task) => (
      <ChangeRequestStatusBadge status={task.changeRequest.status} />
    ),
  },
  {
    title: "Updated",
    key: "updatedAt",
    render: (_, task) => task.changeRequest.updatedAt,
  },
];

export default function MyTasksPage() {
  const { currentUser, changeRequests, workflowSteps } =
    useOutletContext<AppOutletContext>();

  const myTasks = getAssignedWorkflowTasks(
    workflowSteps,
    changeRequests,
    currentUser.id,
  );

  return (
    <section>
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">My Tasks</h1>
        <p className="mt-2 text-sm text-slate-500">
          Active workflow steps assigned to {currentUser.name}.
        </p>
      </header>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table<AssignedWorkflowTask>
          rowKey="id"
          columns={columns}
          dataSource={myTasks}
          pagination={false}
          locale={{
            emptyText: `No active tasks for ${currentUser.name}`,
          }}
        />
      </div>
    </section>
  );
}
