import type { EquipmentParameters } from "../../types/parameters";

interface ParameterSummaryProps {
  parameters: EquipmentParameters;
}

export default function ParameterSummary({ parameters }: ParameterSummaryProps) {
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">Saved Parameter Snapshot</h2>
      <dl className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm text-slate-500">Model</dt>
          <dd className="mt-1 font-medium text-slate-900">{parameters.model}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Power</dt>
          <dd className="mt-1 font-medium text-slate-900">{parameters.powerKw} kW</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Weight</dt>
          <dd className="mt-1 font-medium text-slate-900">{parameters.weightKg} kg</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Temperature range</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {parameters.minTemperatureC}°C to {parameters.maxTemperatureC}°C
          </dd>
        </div>
      </dl>
    </section>
  );
}
