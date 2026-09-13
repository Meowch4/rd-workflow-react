import { useState, type SubmitEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import useAuth from "../../auth/useAuth";
import { usersData } from "../../mocks/currentUser";
import type { UserRole } from "../../types/user";

// 把类型定义里的大写字段转换成正常拼写
const roleLabels: Record<UserRole, string> = {
  PROJECT_MANAGER: "Project Manager",
  DESIGNER: "Designer",
  MECHANICAL_ENGINEER: "Mechanical Engineer",
  ELECTRICAL_ENGINEER: "Electrical Engineer",
  QA: "QA Reviewer",
};

export default function LoginPage() {
  // 用useAuth从AuthContext里获取currentUser和signIn
  const { currentUser, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // 默认选中的是mock用户数据里的第一个用户
  const [selectedUserId, setSelectedUserId] = useState(
    usersData[0]?.id ?? "",
  );
  const [loginError, setLoginError] = useState("");
  // 取得跳转到Login时传入的state
  // 可能是{ from:"xxxxx" } 也可能是null
  // 如果没有state就自动到/dashboard
  const requestedPath =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  // 如果当前已登录就跳转到登录前访问的页面
  if (currentUser) {
    return <Navigate to={requestedPath} replace />;
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    // 保证函数自身不会接受无效业务数据
    if (!signIn(selectedUserId)) {
      setLoginError("Select a valid user.");
      return;
    }

    // 登陆后跳转到用户登陆前访问的页面
    navigate(requestedPath, { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">RD Workflow</h1>

        <p className="mt-2 text-sm text-slate-600">研发流程管理系统</p>

        <form noValidate onSubmit={handleSubmit} className="mt-8">
          <label
            htmlFor="loginUser"
            className="text-sm font-medium text-slate-700"
          >
            Demo user
          </label>
          <select
            id="loginUser"
            value={selectedUserId}
            onChange={(event) => {
              setSelectedUserId(event.target.value);
              if (loginError) setLoginError("");
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {usersData.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} — {roleLabels[user.role]}
              </option>
            ))}
          </select>
          {loginError ? (
            <p className="mt-1 text-sm text-red-600">{loginError}</p>
          ) : null}

          <button
            type="submit"
            className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>

        <p className="mt-5 text-xs leading-5 text-slate-400">
          This portfolio demo uses mock users. No password or sensitive account
          data is stored.
        </p>
      </section>
    </main>
  );
}
