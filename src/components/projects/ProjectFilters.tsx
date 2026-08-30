import type { ProjectStatus } from "../../types/projects";

export type ProjectStatusFilter = ProjectStatus | "ALL";

interface ProjectFiltersProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    statusFilter: ProjectStatusFilter;
    onStatusFilterChange: (filter: ProjectStatusFilter) => void;
    onClear: () => void;
}

export default function ProjectFilters({ searchTerm, onSearchTermChange, statusFilter, onStatusFilterChange, onClear }: ProjectFiltersProps) {
    const hasActiveFilters =
        searchTerm.trim().toLowerCase() !== "" || statusFilter !== "ALL";

    return (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="Search by project number or name"
          className="flex-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as ProjectStatusFilter)}
          className="w-full sm:w-48 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
        </select>

        {hasActiveFilters && (
          <button
          className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
          type="button"
            onClick={onClear}
          >
            Clear Filters
          </button>
        )}
      </div>
    )


}