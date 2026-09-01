import { Table, type TableColumnsType } from "antd";
import type { ChangeRequestStatus, ChangeRequestSummary } from "../../types/changeRequest";
import ChangeRequestStatusBadge from "./ChangeRequestStatusBadge";
import { Link } from "react-router";

interface ChangeRequestTableProps {
  changeRequests: ChangeRequestSummary[];
}

const columns: TableColumnsType<ChangeRequestSummary> = [
  {
    title: "Request Number",
    dataIndex: "requestNumber",
    key: "requestNumber",
    render: (_, changeRequest) => (
      <Link
        to={`/projects/${changeRequest.projectId}/change-requests/${changeRequest.id}`}
        className="font-medium text-blue-600 hover:text-blue-700"
      >
        {changeRequest.requestNumber}
      </Link>
    ),
  },
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: ChangeRequestStatus) => <ChangeRequestStatusBadge status={status} />,
  },
  {
    title: "Current Step",
    dataIndex: "currentStepName",
    key: "currentStepName",
  },
  {
    title: "Current Assignee",
    dataIndex: "currentAssigneeName",
    key: "currentAssigneeName",
    render: (assignee: string | null) => assignee ?? "—",
  },
  {
    title: "Updated",
    dataIndex: "updatedAt",
    key: "updatedAt",
  },
];

export default function ChangeRequestTable({
  changeRequests,
}: ChangeRequestTableProps) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 className="font-semibold text-slate-900">Change Requests</h2>
        <span className="text-sm text-slate-500">
          {changeRequests.length} requests
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table<ChangeRequestSummary>
          rowKey="id"
          columns={columns}
          dataSource={changeRequests}
          pagination={false}
          locale={{ emptyText: "暂无变更请求" }}
        />
      </div>
    </div>
  );
}
