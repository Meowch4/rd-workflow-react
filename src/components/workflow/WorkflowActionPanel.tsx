import { useState } from "react";
import { Input, Modal } from "antd";
import type { ChangeRequestStatus } from "../../types/changeRequest";
import type { UserSummary } from "../../types/user";
import type { WorkflowStepSummary } from "../../types/workflow";

interface WorkflowActionPanelProps {
  currentStep: WorkflowStepSummary | undefined;
  currentUser: UserSummary;
  changeRequestStatus: ChangeRequestStatus;
  canResubmit: boolean;
  latestRejectReason: string | null;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onResubmit: () => void;
}

export default function WorkflowActionPanel({
  currentStep,
  currentUser,
  changeRequestStatus,
  canResubmit,
  latestRejectReason,
  onApprove,
  onReject,
  onResubmit,
}: WorkflowActionPanelProps) {
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

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

  const canReview =
    changeRequestStatus === "IN_REVIEW" &&
    currentStep.status === "PROCESSING" &&
    currentStep.assigneeId === currentUser.id;

  // 关闭Reject弹窗
  function closeRejectModal() {
    setIsRejectOpen(false);
    setRejectReason("");
    setRejectError("");
  }

  // 提交Reject
  function handleRejectConfirm() {
    const reason = rejectReason.trim();

    if (!reason) {
      setRejectError("Reject reason is required.");
      return;
    }

    onReject(reason);
    closeRejectModal();
  }

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">Workflow Actions</h2>

      {canReview ? (
        <div className="mt-4">
          <p className="text-sm text-slate-500">
            You are assigned to {currentStep.name}.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onApprove}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setIsRejectOpen(true)}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Reject
            </button>
          </div>
        </div>
      ) : changeRequestStatus === "REWORK" &&
        currentStep.assigneeId === currentUser.id ? (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="font-medium text-blue-900">Parameter changes required</p>
          <p className="mt-1 text-sm leading-6 text-blue-700">
            Update and save the parameters below, then resubmit this change
            request for review.
          </p>
          {latestRejectReason ? (
            <div className="mt-3 rounded-md border border-blue-200 bg-white/70 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Reject reason
              </p>
              <p className="mt-1 text-sm text-blue-900">
                {latestRejectReason}
              </p>
            </div>
          ) : null}
          <button
            type="button"
            disabled={!canResubmit}
            onClick={onResubmit}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            Resubmit
          </button>
          {!canResubmit ? (
            <p className="mt-2 text-sm text-blue-700">
              Save at least one parameter change before resubmitting.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Waiting for {currentStep.assigneeName ?? "the current assignee"} to
          complete {currentStep.name}.
        </p>
      )}

      <Modal
        title="Reject workflow step"
        open={isRejectOpen}
        okText="Confirm Reject"
        okButtonProps={{ danger: true }}
        onOk={handleRejectConfirm}
        onCancel={closeRejectModal}
      >
        <p className="mb-3 text-sm text-slate-500">
          Explain what the designer needs to change before resubmitting.
        </p>
        <Input.TextArea
          value={rejectReason}
          rows={4}
          placeholder="Enter a reject reason"
          status={rejectError ? "error" : undefined}
          onChange={(event) => {
            setRejectReason(event.target.value);
            if (rejectError) setRejectError("");
          }}
        />
        {rejectError ? (
          <p className="mt-2 text-sm text-red-600">{rejectError}</p>
        ) : null}
      </Modal>
    </section>
  );
}
