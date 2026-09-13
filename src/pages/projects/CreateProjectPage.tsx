import { useState, type SubmitEvent } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import type { AppOutletContext } from "../../types/app";
import type { ProjectSummary } from "../../types/projects";

// 创建项目Number，根据年份等拼接出字符串
function createProjectNumber(projects: ProjectSummary[]) {
  const year = new Date().getFullYear();
  const prefix = `RD-${year}-`;
  // 找到今年已有 Project 编号中最大的流水号，用于生成下一个编号，largest的初始值为0
  const largestSequence = projects.reduce((largest, project) => {
    // 如果项目编号不以当前年份的前缀开头，则跳过
    // 例如"RD-2025-009".startsWith("RD-2026-") // false
    if (!project.projectNumber.startsWith(prefix)) return largest;

    // 提取项目编号中的流水号部分，并将其转换为数字
    // 例如"RD-2026-003".slice("RD-2026-".length) // => "003" => 3
    const sequence = Number(project.projectNumber.slice(prefix.length));
    // 转换后取最大值
    return Number.isNaN(sequence) ? largest : Math.max(largest, sequence);
  }, 0);

  // 用最终返回的largest拼接一个新的编号
  return `${prefix}${String(largestSequence + 1).padStart(3, "0")}`;
}

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { currentUser, projects, setProjects } =
    useOutletContext<AppOutletContext>();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  // 如果当前用户没有权限创建项目
  if (currentUser.role !== "PROJECT_MANAGER") {
    return (
      <section>
        <Link
          to="/projects"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Projects
        </Link>
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-xl font-semibold text-amber-900">
            You cannot create a project
          </h1>
          <p className="mt-2 text-sm text-amber-700">
            Only a Project Manager can perform this action.
          </p>
        </div>
      </section>
    );
  }

  // 处理表单提交
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    // 检查用户权限
    if (currentUser.role !== "PROJECT_MANAGER") return;

    // 检查项目名称是否为空
    const normalizedName = name.trim();
    if (!normalizedName) {
      setNameError("Project name is required.");
      return;
    }

    // 随机生成projectId，创建新的Project对象，并添加到projects中
    const projectId = `project-${crypto.randomUUID()}`;
    const newProject: ProjectSummary = {
      id: projectId,
      projectNumber: createProjectNumber(projects),
      name: normalizedName,
      ownerName: currentUser.name,
      status: "DRAFT",
      changeRequestCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setProjects((current) => [...current, newProject]);
    navigate(`/projects/${projectId}`);
  }

  return (
    <section className="mx-auto max-w-2xl">
      <Link
        to="/projects"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        ← Back to Projects
      </Link>

      <header className="mt-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Create Project
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Create an empty research and development project before adding its
          change requests.
        </p>
      </header>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="projectName"
            className="text-sm font-medium text-slate-700"
          >
            Project Name
          </label>
          <input
            id="projectName"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (nameError) setNameError("");
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Enter a project name"
          />
          {nameError ? (
            <p className="mt-1 text-sm text-red-600">{nameError}</p>
          ) : null}
        </div>

        <dl className="mt-5 grid gap-4 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Initial Status</dt>
            <dd className="mt-1 font-medium text-slate-900">Draft</dd>
          </div>
          <div>
            <dt className="text-slate-500">Project Owner</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {currentUser.name}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-6">
          <Link
            to="/projects"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Project
          </button>
        </div>
      </form>
    </section>
  );
}
