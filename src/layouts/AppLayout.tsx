import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import UserSwitcher from "../components/users/UserSwitcher";
import { defaultCurrentUserId, usersData } from "../mocks/currentUser";

export default function AppLayout() {
    const [currentUserId, setCurrentUserId] = useState(defaultCurrentUserId);
    const currentUser =
      usersData.find((user) => user.id === currentUserId) ?? usersData[0];

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
          <UserSwitcher
            users={usersData}
            currentUserId={currentUserId}
            onUserChange={setCurrentUserId}
          />
        </header>

        <main className="flex-1 p-6">
            <Outlet context={{ currentUser }} />
        </main>
      </div>
    </div>
  );
}
