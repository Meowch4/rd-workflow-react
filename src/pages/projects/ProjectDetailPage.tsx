import { useParams } from "react-router";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  return (
    <section>
      <div>
        <p className="text-sm font-medium text-blue-600">Project</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Project Detail
        </h1>
      </div>

    {projectId 
    ? (<div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <span className="text-sm text-slate-500">Project ID</span>
        <p className="mt-1 font-medium text-slate-900">{projectId}</p>
      </div>)
    : (<div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <span className="text-sm text-slate-500">No Project ID</span>
      </div>)}
      
    </section>
  );
}
