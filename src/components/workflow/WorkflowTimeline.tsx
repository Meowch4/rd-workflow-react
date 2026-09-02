import { Steps } from "antd";
import type {
  WorkflowStepStatus,
  WorkflowStepSummary,
} from "../../types/workflow";

interface WorkflowTimelineProps {
  steps: WorkflowStepSummary[];
}

// Antd 的 Step 组件可应用给status属性的四种状态值
type AntdStepStatus  = "wait" | "process" | "finish" | "error";

// 对应到Antd的Step组件的status属性的值，会决定Step组件的图标
const antdStatusByStepStatus: Record<
  WorkflowStepStatus,
  AntdStepStatus 
> = {
  PENDING: "wait",
  PROCESSING: "process",
  APPROVED: "finish",
  REJECTED: "error",
};

// WorkflowStep对应到的在antd显示的标签
const stepStatusLabels: Record<WorkflowStepStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default function WorkflowTimeline({ steps }: WorkflowTimelineProps) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">Workflow</h2>

      {steps.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          Workflow steps are not available for this change request yet.
        </p>
      ) : (
        <Steps
          className="mt-6"
          orientation="vertical"
          size="small"
          items={steps.map((step) => ({
            // 括号让 split 保留 Rework，只给匹配的文字上色。
            title: step.name.split(/(Rework)/).map((part, index) =>
              part === "Rework" ? (
                <span key={index} className="text-blue-600">
                  {part}
                </span>
              ) : (
                part
              ),
            ),
            // status属性会决定Step组件的图标
            status: antdStatusByStepStatus[step.status],
            content: (
              <div className="pb-2 text-sm text-slate-500">
                <p>{step.assigneeName ?? "Unassigned"}</p>
                <p className="mt-1">
                  {/* 如果完成了就显示完成时间 */}
                  {step.completedAt
                    ? `${stepStatusLabels[step.status]} · ${step.completedAt}`
                    : stepStatusLabels[step.status]}
                </p>
              </div>
            ),
          }))}
        />
      )}
    </div>
  );
}
