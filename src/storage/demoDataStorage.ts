import { auditRecordsData } from "../mocks/auditRecords";
import { changeRequestsData } from "../mocks/changeRequests";
import { originalParameterSnapshotsData } from "../mocks/parameters";
import { projectsData } from "../mocks/projects";
import { workflowStepsData } from "../mocks/workflowSteps";
import type { AuditRecord } from "../types/audit";
import type { ChangeRequestSummary } from "../types/changeRequest";
import type { EquipmentParameters } from "../types/parameters";
import type { ProjectSummary } from "../types/projects";
import type { WorkflowStepSummary } from "../types/workflow";

export const DEMO_DATA_STORAGE_KEY = "rd-workflow-demo-data-v1";

export interface DemoDataSnapshot {
  // 这个版本号代表数据存储结构版本
  // 如果以后升版可以辨认出旧版本数据并替换
  version: 1;
  projects: ProjectSummary[];
  changeRequests: ChangeRequestSummary[];
  workflowSteps: WorkflowStepSummary[];
  auditRecords: AuditRecord[];
  originalParameterSnapshots: Record<string, EquipmentParameters>;
  parameterSnapshots: Record<string, EquipmentParameters>;
  rejectedParameterSnapshots: Record<string, EquipmentParameters>;
}

export interface DemoDataLoadResult {
  data: DemoDataSnapshot;
  recoveredFromInvalidStorage: boolean;
}

// 复制参数快照
function cloneParameterSnapshots(
  snapshots: Record<string, EquipmentParameters>,
): Record<string, EquipmentParameters> {
  return Object.fromEntries(
    Object.entries(snapshots).map(([id, parameters]) => [
      id,
      { ...parameters },
    ]),
  );
}

// 创建初始被拒绝参数快照
function createInitialRejectedParameterSnapshots() {
  return changeRequestsData.reduce<Record<string, EquipmentParameters>>(
    (snapshots, request) => {
      const parameters = originalParameterSnapshotsData[request.id];

      if (request.status === "REWORK" && parameters) {
        snapshots[request.id] = { ...parameters };
      }

      return snapshots;
    },
    {},
  );
}

// 创建初始Demo数据
export function createInitialDemoData(): DemoDataSnapshot {
  return {
    version: 1,
    projects: projectsData.map((project) => ({ ...project })),
    changeRequests: changeRequestsData.map((request) => ({ ...request })),
    workflowSteps: workflowStepsData.map((step) => ({ ...step })),
    auditRecords: auditRecordsData.map((record) => ({
      ...record,
      parameterChanges: record.parameterChanges.map((change) => ({ ...change })),
    })),
    originalParameterSnapshots: cloneParameterSnapshots(
      originalParameterSnapshotsData,
    ),
    parameterSnapshots: cloneParameterSnapshots(originalParameterSnapshotsData),
    rejectedParameterSnapshots: createInitialRejectedParameterSnapshots(),
  };
}

// 判断是否是Object的函数,由于typeof null == "object"，所以要排除value == null 的情况
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// 验证是否是Demo数据结构
// value之所以是unknown是因为这是刚从localStorage里取出的字符串JSON.parse而来
// 所以要先检查完类型才能调用里面的属性
function isDemoDataSnapshot(value: unknown): value is DemoDataSnapshot {
  return (
    isObject(value) &&
    value.version === 1 &&
    Array.isArray(value.projects) &&
    Array.isArray(value.changeRequests) &&
    Array.isArray(value.workflowSteps) &&
    Array.isArray(value.auditRecords) &&
    isObject(value.originalParameterSnapshots) &&
    isObject(value.parameterSnapshots) &&
    isObject(value.rejectedParameterSnapshots)
  );
}

// 从Local Storage里取出demo数据并载入
export function loadDemoData(): DemoDataLoadResult {
  // 先准备一份初始数据
  const initialData = createInitialDemoData();

  try {
    // 从LocalStorage里取出demo数据
    const storedData = localStorage.getItem(DEMO_DATA_STORAGE_KEY);
    // 如果没有存储
    if (!storedData) {
      return { data: initialData, recoveredFromInvalidStorage: false };
    }

    // 把取出的JSON数据parse
    // 如果抛错直接走catch
    const parsedData: unknown = JSON.parse(storedData);
    // 通过此检验后parsedData类型被缩窄为DemoDataSnapshot
    if (isDemoDataSnapshot(parsedData)) {
      // 结构和版本正确，直接恢复这份业务数据
      return { data: parsedData, recoveredFromInvalidStorage: false };
    }

    // 这一步是JSON合法但结构错误
    // 删除LocalStorage里的item，使用初始数据，并通知AppLayout显示恢复提示
    localStorage.removeItem(DEMO_DATA_STORAGE_KEY);
    return { data: initialData, recoveredFromInvalidStorage: true };
  } catch {
    try {
      localStorage.removeItem(DEMO_DATA_STORAGE_KEY);
    } catch {
      // Storage may be unavailable. The in-memory demo can still run.
    }
    return { data: initialData, recoveredFromInvalidStorage: true };
  }
}

// 把数据存到LocalStorage
export function saveDemoData(data: DemoDataSnapshot): boolean {
  try {
    localStorage.setItem(DEMO_DATA_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

// 重置DemoData
export function resetDemoData(): DemoDataSnapshot {
  const initialData = createInitialDemoData();
  saveDemoData(initialData);
  return initialData;
}
