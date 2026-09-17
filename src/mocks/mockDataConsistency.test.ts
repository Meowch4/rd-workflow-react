import { describe, expect, it } from "vitest";
import { auditRecordsData } from "./auditRecords";
import { changeRequestsData } from "./changeRequests";
import { originalParameterSnapshotsData } from "./parameters";
import { workflowStepsData } from "./workflowSteps";

describe("mock workflow data", () => {
  // Cr必须有 Workflow Steps
  // 必须有 Parameter SnapShot
  // 必须有 Audit Record
  it("gives every change request steps, parameters, and audit history", () => {
    for (const changeRequest of changeRequestsData) {
      expect(
        workflowStepsData.some(
          (step) => step.changeRequestId === changeRequest.id,
        ),
      ).toBe(true);
      expect(originalParameterSnapshotsData[changeRequest.id]).toBeDefined();
      expect(
        auditRecordsData.some(
          (record) => record.changeRequestId === changeRequest.id,
        ),
      ).toBe(true);
    }
  });

  // active 的 cr 必须有且只有一个processing step
  it("keeps active change request summaries aligned with processing steps", () => {
    for (const changeRequest of changeRequestsData) {
      const requestSteps = workflowStepsData.filter(
        (step) => step.changeRequestId === changeRequest.id,
      );
      const processingSteps = requestSteps.filter(
        (step) => step.status === "PROCESSING",
      );

      // 如果是completed 的 cr，没有processing step，所有step都approved
      if (changeRequest.status === "COMPLETED") {
        expect(processingSteps).toHaveLength(0);
        expect(requestSteps.every((step) => step.status === "APPROVED")).toBe(
          true,
        );
        expect(changeRequest.currentStepName).toBe("Completed");
        expect(changeRequest.currentAssigneeName).toBeNull();
        continue;
      }

      expect(processingSteps).toHaveLength(1);
      expect(processingSteps[0].name).toBe(changeRequest.currentStepName);
      expect(processingSteps[0].assigneeName).toBe(
        changeRequest.currentAssigneeName,
      );
    }
  });

  // 每条历史记录都与存在的cr和step关联
  it("keeps audit references connected to existing requests and steps", () => {
    for (const record of auditRecordsData) {
      expect(
        changeRequestsData.some(
          (changeRequest) => changeRequest.id === record.changeRequestId,
        ),
      ).toBe(true);
      expect(
        workflowStepsData.some((step) => step.id === record.stepId),
      ).toBe(true);
    }
  });
});
