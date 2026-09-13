import { Navigate, Outlet, useLocation } from "react-router";
import useAuth from "./useAuth";

export default function ProtectedRoute() {
  const { currentUser } = useAuth();
  const location = useLocation();

  // 如果没有当前用户
  if (!currentUser) {
    // 保存用户请求的路径，以便在登录后重定向回去
    const requestedPath = `${location.pathname}${location.search}${location.hash}`;
    // 当 React Router 渲染到这个组件时，它会执行路由跳转。这属于“声明式导航”
    // state用来给目标路由携带一份附加数据，跳转后可以从location.state读取到
    return <Navigate to="/login" replace state={{ from: requestedPath }} />;
  }

  // 有用户就返回目标业务页面
  return <Outlet />;
}
