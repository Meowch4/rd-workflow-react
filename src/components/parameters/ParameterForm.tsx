import { useState, type ChangeEvent, type SubmitEvent } from "react";
import type { EquipmentParameters, EquipmentTemplate } from "../../types/parameters";

interface ParameterFormProps {
  savedParameters: EquipmentParameters;
  templates: EquipmentTemplate[];
  onSave: (parameters: EquipmentParameters) => void;
}

type ParameterDraft = Record<keyof EquipmentParameters, string>;
type ParameterErrors = Partial<Record<keyof EquipmentParameters, string>>;

// input默认输入的是string，所以表单草稿使用string类型，保存时再转换为number类型
// 使用已保存的参数生成草稿
function createDraft(parameters: EquipmentParameters): ParameterDraft {
  return {
    model: parameters.model,
    powerKw: String(parameters.powerKw),
    weightKg: String(parameters.weightKg),
    minTemperatureC: String(parameters.minTemperatureC),
    maxTemperatureC: String(parameters.maxTemperatureC),
  };
}

// 校验草稿参数是否有错误的校验函数
function validateDraft(draft: ParameterDraft): ParameterErrors {
  const errors: ParameterErrors = {};
  const powerKw = Number(draft.powerKw);
  const weightKg = Number(draft.weightKg);
  const minTemperatureC = Number(draft.minTemperatureC);
  const maxTemperatureC = Number(draft.maxTemperatureC);

  // 验证逻辑：模型不能为空，功率和重量必须大于0，温度范围必须有效
  if (!draft.model.trim()) errors.model = "Model is required.";
  if (!Number.isFinite(powerKw) || powerKw <= 0) errors.powerKw = "Power must be greater than 0.";
  if (!Number.isFinite(weightKg) || weightKg <= 0) errors.weightKg = "Weight must be greater than 0.";
  if (!Number.isFinite(minTemperatureC)) errors.minTemperatureC = "Enter a valid minimum temperature.";
  if (!Number.isFinite(maxTemperatureC)) errors.maxTemperatureC = "Enter a valid maximum temperature.";
  if (!errors.minTemperatureC && !errors.maxTemperatureC && minTemperatureC >= maxTemperatureC) {
    errors.maxTemperatureC = "Maximum temperature must be greater than the minimum temperature.";
  }

  return errors;
}

// 入参是已保存参数和一个回调函数，让父组件能保存更改后的参数
export default function ParameterForm({ savedParameters, templates, onSave }: ParameterFormProps) {
  // 草稿初始值用函数生成
  const [draft, setDraft] = useState<ParameterDraft>(() => createDraft(savedParameters));
  const [errors, setErrors] = useState<ParameterErrors>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);

  function handleLoadTemplate() {
    if (!selectedTemplate) return;

    // 复用转换函数创建独立草稿；旧错误不再对应这份新草稿。
    setDraft(createDraft(selectedTemplate.parameters));
    setErrors({});
  }

  // input的onChange事件处理函数，更新草稿状态
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  }

  // 表单提交事件处理函数，验证草稿并调用onSave
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateDraft(draft);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    onSave({
      model: draft.model.trim(),
      powerKw: Number(draft.powerKw),
      weightKg: Number(draft.weightKg),
      minTemperatureC: Number(draft.minTemperatureC),
      maxTemperatureC: Number(draft.maxTemperatureC),
    });
  }

  const inputClassName =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">Equipment Parameters</h2>
      <p className="mt-1 text-sm text-slate-500">Changes are saved only after validation passes.</p>

      <form className="mt-6" noValidate onSubmit={handleSubmit}>
        <div className="mb-6 rounded-lg bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm font-medium text-slate-700">
              Equipment template
              <select
                className={inputClassName}
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.currentTarget.value)}
                disabled={templates.length === 0}
              >
                <option value="">
                  {templates.length === 0 ? "No templates available" : "Select a template"}
                </option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleLoadTemplate}
              disabled={!selectedTemplate}
              className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-transparent"
            >
              Load template
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Loading replaces your unsaved inputs. Review the values, then save to confirm.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Model
            <input className={inputClassName} name="model" value={draft.model} onChange={handleChange} />
            {errors.model && <span className="mt-1 block text-sm text-red-600">{errors.model}</span>}
          </label>

          <label className="text-sm font-medium text-slate-700">
            Power (kW)
            <input className={inputClassName} name="powerKw" type="number" min="0" value={draft.powerKw} onChange={handleChange} />
            {errors.powerKw && <span className="mt-1 block text-sm text-red-600">{errors.powerKw}</span>}
          </label>

          <label className="text-sm font-medium text-slate-700">
            Weight (kg)
            <input className={inputClassName} name="weightKg" type="number" min="0" value={draft.weightKg} onChange={handleChange} />
            {errors.weightKg && <span className="mt-1 block text-sm text-red-600">{errors.weightKg}</span>}
          </label>

          <label className="text-sm font-medium text-slate-700">
            Minimum temperature (°C)
            <input className={inputClassName} name="minTemperatureC" type="number" value={draft.minTemperatureC} onChange={handleChange} />
            {errors.minTemperatureC && <span className="mt-1 block text-sm text-red-600">{errors.minTemperatureC}</span>}
          </label>

          <label className="text-sm font-medium text-slate-700">
            Maximum temperature (°C)
            <input className={inputClassName} name="maxTemperatureC" type="number" value={draft.maxTemperatureC} onChange={handleChange} />
            {errors.maxTemperatureC && <span className="mt-1 block text-sm text-red-600">{errors.maxTemperatureC}</span>}
          </label>
        </div>

        <button type="submit" className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Save parameters
        </button>
      </form>
    </section>
  );
}
