import type {
  EquipmentParameters,
  ParameterChange,
} from "../../types/parameters";
import { getParameterChanges } from "../../utils/parameterChanges";

// ParameterChangesProps 当前组件接受的参数，一份初试参数值，一份当前参数值
interface ParameterChangesProps {
  original: EquipmentParameters;
  current: EquipmentParameters;
}

// 每个参数要有自己的名称和单位，单位是可选值
interface ParameterDisplay {
  label: string;
  unit?: string;
}

// 规定参数的显示方式，包括名称和单位
const parameterDisplays: Record<keyof EquipmentParameters, ParameterDisplay> = {
  model: { label: "Model" },
  powerKw: { label: "Power", unit: " kW" },
  weightKg: { label: "Weight", unit: " kg" },
  minTemperatureC: { label: "Minimum temperature", unit: "°C" },
  maxTemperatureC: { label: "Maximum temperature", unit: "°C" },
};


function formatValue(change: ParameterChange, value: string | number) {
  // 拼接参数的value和单位，没有单位就不拼接单位
  return `${value}${parameterDisplays[change.field].unit ?? ""}`;
}

export default function ParameterChanges({
  original,
  current,
}: ParameterChangesProps) {
  // 对比出change的函数
  const changes = getParameterChanges(original, current);

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">Parameter Changes</h2>

      {changes.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No parameter changes.</p>
      ) : (
        <div className="mt-4 divide-y divide-slate-100">
          {changes.map((change) => (
            <div
              key={change.field}
              className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_1fr_auto_1fr] sm:items-center"
            >
              <span className="font-medium text-slate-700">
                {parameterDisplays[change.field].label}
              </span>
              <span className="text-slate-500 line-through">
                {formatValue(change, change.before)}
              </span>
              <span aria-hidden="true" className="hidden text-slate-400 sm:inline">
                →
              </span>
              <span className="font-medium text-blue-600">
                {formatValue(change, change.after)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
