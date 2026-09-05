import type { UserSummary } from "../../types/user";
import type { WorkflowStepSummary } from "../../types/workflow";

interface WorkflowActionPanelProps {
  currentStep: WorkflowStepSummary | undefined;
  currentUser: UserSummary;
  onApprove: () => void;
}

export default function WorkflowActionPanel({
  currentStep,
  currentUser,
  onApprove,
}: WorkflowActionPanelProps) {
  if (!currentStep) {
    return (
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Workflow Actions</h2>
        <p className="mt-3 text-sm text-slate-500">
          No workflow action is currently available.
        </p>
      </section>
    );
  }

  const canApprove =
    currentStep.status === "PROCESSING" &&
    currentStep.assigneeId === currentUser.id;

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">Workflow Actions</h2>

      {canApprove ? (
        <div className="mt-4">
          <p className="text-sm text-slate-500">
            You are assigned to {currentStep.name}.
          </p>
          <button
            type="button"
            onClick={onApprove}
            className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Approve
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Waiting for {currentStep.assigneeName ?? "the current assignee"} to
          complete {currentStep.name}.
        </p>
      )}
    </section>
  );
}
