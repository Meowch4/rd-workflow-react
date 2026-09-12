import { Empty } from "antd";
import { Link, useOutletContext } from "react-router";
import ChangeRequestStatusBadge from "../../components/changeRequests/ChangeRequestStatusBadge";
import type { AppOutletContext } from "../../types/app";
import { getAssignedWorkflowTasks } from "../../utils/workflowTasks";

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  valueClassName?: string;
}

// 纯展示组件
function StatCard({
  label,
  value,
  description,
  valueClassName = "text-slate-900",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${valueClassName}`}>{value}</p>
      <p className="mt-2 text-xs text-slate-400">{description}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser, changeRequests, workflowSteps } =
    useOutletContext<AppOutletContext>();
  const assignedTasks = getAssignedWorkflowTasks(
    workflowSteps,
    changeRequests,
    currentUser.id,
  );
  // 当前用户最近四条任务
  const recentTasks = [...assignedTasks]
    .sort((a, b) =>
      b.changeRequest.updatedAt.localeCompare(a.changeRequest.updatedAt),
    )
    .slice(0, 4);

  const draftCount = changeRequests.filter(
    (request) => request.status === "DRAFT",
  ).length;
  const inReviewCount = changeRequests.filter(
    (request) => request.status === "IN_REVIEW",
  ).length;
  const reworkCount = changeRequests.filter(
    (request) => request.status === "REWORK",
  ).length;
  const completedCount = changeRequests.filter(
    (request) => request.status === "COMPLETED",
  ).length;

  return (
    <section>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">
            Welcome back, {currentUser.name}. Here is the current workflow
            overview.
          </p>
        </div>
        <Link
          to="/tasks"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all my tasks →
        </Link>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {/* 当前用户的 Active Tasks 数量 */}
        <StatCard
          label="My Active Tasks"
          value={assignedTasks.length}
          description="Steps waiting for your action"
          valueClassName="text-blue-600"
        />
        {/* Draft、In Review、Rework、Completed 统计 */}
        <StatCard
          label="Draft"
          value={draftCount}
          description="Not submitted"
        />
        <StatCard
          label="In Review"
          value={inReviewCount}
          description="Moving through approval"
          valueClassName="text-blue-600"
        />
        <StatCard
          label="Rework"
          value={reworkCount}
          description="Returned to a designer"
          valueClassName="text-amber-600"
        />
        <StatCard
          label="Completed"
          value={completedCount}
          description="Finished change requests"
          valueClassName="text-emerald-600"
        />
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-900">My Current Tasks</h2>
            <p className="mt-1 text-sm text-slate-500">
              Your most recently updated active workflow steps.
            </p>
          </div>
          <span className="text-sm text-slate-400">
            {assignedTasks.length} active
          </span>
        </div>

        {recentTasks.length === 0 ? (
          // 空任务状态
          <Empty
            className="my-8"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={`No active tasks for ${currentUser.name}`}
          />
        ) : (
          <div className="mt-5 divide-y divide-slate-100">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  {/* 点击任务进入 Change Request 详情 */}
                  <Link
                    to={`/projects/${task.changeRequest.projectId}/change-requests/${task.changeRequest.id}`}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    {task.changeRequest.requestNumber}
                  </Link>
                  <p className="mt-1 truncate text-sm text-slate-700">
                    {task.changeRequest.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {task.step.name}
                  </p>
                </div>
                <ChangeRequestStatusBadge
                  status={task.changeRequest.status}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
