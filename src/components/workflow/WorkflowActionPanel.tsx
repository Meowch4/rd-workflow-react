import { useState } from "react";
import { Input, Modal } from "antd";
import type { ChangeRequestStatus } from "../../types/changeRequest";
import type { UserSummary } from "../../types/user";
import type { WorkflowStepSummary } from "../../types/workflow";

interface WorkflowActionPanelProps {
  currentStep: WorkflowStepSummary | undefined;
  currentUser: UserSummary;
  changeRequestStatus: ChangeRequestStatus;
  hasSavedParameterChanges: boolean;
  canResubmit: boolean;
  latestRejectReason: string | null;
  onSubmit: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onResubmit: () => void;
}

export default function WorkflowActionPanel({
  currentStep,
  currentUser,
  changeRequestStatus,
  hasSavedParameterChanges,
  canResubmit,
  latestRejectReason,
  onSubmit,
  onApprove,
  onReject,
  onResubmit,
}: WorkflowActionPanelProps) {
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);

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

  // DRAFT状态能否Submit的判断
  const canSubmit =
    changeRequestStatus === "DRAFT" &&
    currentStep.status === "PROCESSING" &&
    currentStep.assigneeId === currentUser.id;

  // IN_REVIEW状态能否Approve/Reject的判断 
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

  function handleSubmitClick() {
    // Draft提交时如果有参数更改就直接submit
    if (hasSavedParameterChanges) {
      onSubmit();
      return;
    }
    
    // Draft提交时如果没有参数更改就打开确认提交弹窗
    setIsSubmitConfirmOpen(true);
  }

  let actionContent = (
    <p className="mt-3 text-sm text-slate-500">
      Waiting for {currentStep.assigneeName ?? "the current assignee"} to
      complete {currentStep.name}.
    </p>
  );

  if (canSubmit) {
    actionContent = (
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="font-medium text-amber-900">Draft ready for submission</p>
        <p className="mt-1 text-sm leading-6 text-amber-700">
          Save the final parameter values, then submit them for mechanical
          review.
        </p>
        <button
          type="button"
          onClick={handleSubmitClick}
          className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Submit for Review
        </button>
      </div>
    );
  } else if (canReview) {
    actionContent = (
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
    );
  } else if (
    changeRequestStatus === "REWORK" &&
    currentStep.assigneeId === currentUser.id
  ) {
    actionContent = (
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
            <p className="mt-1 text-sm text-blue-900">{latestRejectReason}</p>
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
    );
  }

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">Workflow Actions</h2>

      {actionContent}

      <Modal
        title="Submit unchanged parameters?"
        open={isSubmitConfirmOpen}
        okText="Submit Anyway"
        onOk={() => {
          onSubmit();
          setIsSubmitConfirmOpen(false);
        }}
        onCancel={() => setIsSubmitConfirmOpen(false)}
      >
        <p className="text-sm leading-6 text-slate-600">
          The saved parameters are identical to the initial snapshot. Are you
          sure you want to submit them for review?
        </p>
      </Modal>

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
