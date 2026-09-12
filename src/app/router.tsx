import { Navigate, Route, Routes } from "react-router";
import ProjectsPage from "../pages/projects/ProjectsPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import AppLayout from "../layouts/AppLayout";
import MyTasksPage from "../pages/tasks/MyTasksPage";
import LoginPage from "../pages/auth/LoginPage";
import NotFoundPage from "../pages/errors/NotFoundPage";
import ProjectDetailPage from "../pages/projects/ProjectDetailPage";
import ChangeRequestDetailPage from "../pages/changeRequests/ChangeRequestDetailPage";
import CreateChangeRequestPage from "../pages/changeRequests/CreateChangeRequestPage";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:projectId" element={<ProjectDetailPage />} />
                <Route
                    path="projects/:projectId/change-requests/new"
                    element={<CreateChangeRequestPage />}
                />
                <Route
                    path="projects/:projectId/change-requests/:changeRequestId"
                    element={<ChangeRequestDetailPage />}
                />
                <Route path="tasks" element={<MyTasksPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>

        </Routes>
    )
}
