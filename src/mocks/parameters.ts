import type { EquipmentParameters } from "../types/parameters";

// key是 changeRequestId，value是对应的 EquipmentParameters
export const parameterSnapshotsData: Record<string, EquipmentParameters> = {
  "cr-001": { model: "CX-400", powerKw: 45, weightKg: 820, minTemperatureC: -10, maxTemperatureC: 45 },
  "cr-002": { model: "EC-220", powerKw: 30, weightKg: 640, minTemperatureC: -5, maxTemperatureC: 40 },
  "cr-003": { model: "EV-180", powerKw: 22, weightKg: 480, minTemperatureC: 0, maxTemperatureC: 38 },
  "cr-004": { model: "CP-500", powerKw: 55, weightKg: 910, minTemperatureC: -15, maxTemperatureC: 45 },
  "cr-005": { model: "TR-320", powerKw: 38, weightKg: 720, minTemperatureC: -8, maxTemperatureC: 50 },
  "cr-006": { model: "FA-280", powerKw: 26, weightKg: 560, minTemperatureC: -5, maxTemperatureC: 42 },
  "cr-007": { model: "MS-160", powerKw: 18, weightKg: 410, minTemperatureC: 5, maxTemperatureC: 35 },
  "cr-008": { model: "SI-360", powerKw: 42, weightKg: 760, minTemperatureC: -10, maxTemperatureC: 48 },
  "cr-009": { model: "CF-440", powerKw: 50, weightKg: 850, minTemperatureC: -12, maxTemperatureC: 46 },
  "cr-010": { model: "QA-200", powerKw: 20, weightKg: 450, minTemperatureC: 0, maxTemperatureC: 40 },
};
