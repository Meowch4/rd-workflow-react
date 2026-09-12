import { Empty, Tag, Timeline } from "antd";
import type { ChangeRequestAction } from "../../types/changeRequest";
import type { AuditRecord } from "../../types/audit";

interface AuditTimelineProps {
  records: AuditRecord[];
}

// Action状态对应的ui上的文字
const actionLabels: Record<ChangeRequestAction, string> = {
  CREATE: "Created",
  SUBMIT: "Submitted",
  APPROVE: "Approved",
  REJECT: "Rejected",
  RESUBMIT: "Resubmitted",
};

const actionColors: Record<ChangeRequestAction, string> = {
  CREATE: "purple",
  SUBMIT: "blue",
  APPROVE: "green",
  REJECT: "red",
  RESUBMIT: "cyan",
};

// 把时间戳格式化
function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default function AuditTimeline({ records }: AuditTimelineProps) {
  // 选出最新的记录展示
  const newestFirstRecords = [...records].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">Audit History</h2>

      {newestFirstRecords.length === 0 ? (
        <Empty
          className="my-8"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No audit records yet."
        />
      ) : (
        <Timeline
          className="mt-6"
          items={newestFirstRecords.map((record) => ({
            color: actionColors[record.action],
            children: (
              <div className="pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900">
                    {record.actorName}
                  </span>
                  <Tag color={actionColors[record.action]}>
                    {actionLabels[record.action]}
                  </Tag>
                  <span className="text-sm text-slate-600">
                    {record.stepName}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {formatTimestamp(record.createdAt)}
                </p>

                {record.comment ? (
                  <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    Reason: {record.comment}
                  </p>
                ) : null}

                {record.parameterChanges.length > 0 ? (
                  <div className="mt-2 rounded-md bg-cyan-50 px-3 py-2 text-sm text-cyan-800">
                    {record.parameterChanges.map((change) => (
                      <p key={change.field}>
                        {change.field}: {change.before} → {change.after}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            ),
          }))}
        />
      )}
    </section>
  );
}
