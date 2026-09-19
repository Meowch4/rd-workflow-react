import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { message, Modal } from "antd";
import useAuth from "../auth/useAuth";
import UserSwitcher from "../components/users/UserSwitcher";
import { usersData } from "../mocks/currentUser";
import {
  loadDemoData,
  resetDemoData,
  saveDemoData,
} from "../storage/demoDataStorage";
import type { AppOutletContext } from "../types/app";

export default function AppLayout() {
    const { currentUser, switchUser, signOut } = useAuth();
    const navigate = useNavigate();
    // 初始数据由提取出的载入DemoData函数提供，内层原理是从LocalStorage取出存储的数据
    const [initialDemoData] = useState(loadDemoData);
    const [projects, setProjects] = useState(initialDemoData.data.projects);
    const [changeRequests, setChangeRequests] = useState(
      initialDemoData.data.changeRequests,
    );
    const [workflowSteps, setWorkflowSteps] = useState(
      initialDemoData.data.workflowSteps,
    );
    const [auditRecords, setAuditRecords] = useState(
      initialDemoData.data.auditRecords,
    );
    const [originalParameterSnapshots, setOriginalParameterSnapshots] =
      useState(initialDemoData.data.originalParameterSnapshots);
    const [parameterSnapshots, setParameterSnapshots] = useState(
      initialDemoData.data.parameterSnapshots,
    );
    const [rejectedParameterSnapshots, setRejectedParameterSnapshots] =
      useState(initialDemoData.data.rejectedParameterSnapshots);

    // 每次state变化都把当前数据存到localStorage里持久化 
    useEffect(() => {
      saveDemoData({
        version: 1,
        projects,
        changeRequests,
        workflowSteps,
        auditRecords,
        originalParameterSnapshots,
        parameterSnapshots,
        rejectedParameterSnapshots,
      });
    }, [
      projects,
      changeRequests,
      workflowSteps,
      auditRecords,
      originalParameterSnapshots,
      parameterSnapshots,
      rejectedParameterSnapshots,
    ]);

    // 如果recoveredFromInvalidStorage为true，说明LocalStorage存储的数据有错误，直接恢复原始数据
    useEffect(() => {
      if (initialDemoData.recoveredFromInvalidStorage) {
        void message.warning(
          // 存储的demo data 无效，所以重新设置demo data
          "Stored demo data was invalid, so the initial demo data was restored.",
        );
      }
    }, [initialDemoData.recoveredFromInvalidStorage]);

    // 重置demo data，同时登出，跳转页面
    function handleResetDemoData() {
      Modal.confirm({
        title: "Reset demo data?",
        content:
          "All projects, workflow changes, parameter edits, and audit records will return to their initial demo values.",
        okText: "Reset and sign out",
        okButtonProps: { danger: true },
        onOk: () => {
          resetDemoData();
          signOut();
          navigate("/login", { replace: true });
        },
      });
    }
    // 如果没有当前用户，直接返回 null，不渲染任何内容 
    if (!currentUser) return null;

    const outletContext: AppOutletContext = {
      currentUser,
      projects,
      setProjects,
      changeRequests,
      setChangeRequests,
      workflowSteps,
      setWorkflowSteps,
      auditRecords,
      setAuditRecords,
      originalParameterSnapshots,
      setOriginalParameterSnapshots,
      parameterSnapshots,
      setParameterSnapshots,
      rejectedParameterSnapshots,
      setRejectedParameterSnapshots,
    };

    const getNavLinkClassName = ({ isActive }: { isActive: boolean }) => {
        const baseClassName = 'rounded-md px-3 py-2 text-sm font-medium transition-colors';

        return isActive 
        ? `${baseClassName} bg-blue-600 text-white` 
        : `${baseClassName} text-slate-300 hover:bg-slate-800 hover:text-white`;
    }
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-60 shrink-0 bg-slate-900 px-4 py-6 text-slate-200">
        <div className="mb-8 px-3">
          <div className="text-lg font-semibold text-white">RD Workflow</div>
          <div className="mt-1 text-xs text-slate-400">研发流程管理系统</div>
        </div>

        <nav className="flex flex-col gap-1" aria-label="主导航">
          <NavLink
            to="/dashboard"
            className={getNavLinkClassName}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/projects"
            className={getNavLinkClassName}
          >
            Projects
          </NavLink>

          <NavLink
            to="/tasks"
            className={getNavLinkClassName}
          >
            My Tasks
          </NavLink>
        </nav>
      </aside>

      <div className="flex flex-col min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <span className="text-sm font-medium text-slate-700">
            研发项目管理平台
          </span>
          <div className="flex items-center gap-3">
            <UserSwitcher
              users={usersData}
              currentUserId={currentUser.id}
              onUserChange={switchUser}
            />
            <button
              type="button"
              onClick={handleResetDemoData}
              className="text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              Reset demo data
            </button>
            <button
              type="button"
              onClick={signOut}
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
            <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
}
