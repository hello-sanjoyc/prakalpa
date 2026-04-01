import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth, AuthProvider } from "./contexts/AuthContext";
import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Admin from "./pages/Admin";
import ChartDemo from "./components/ChartDemo";
import AxToastMessage from "./components/common/AxToastMessage.jsx";
import ProjectsList from "./pages/projects/ProjectsList";
import ProjectsDashboard from "./pages/projects/ProjectsDashboard";
import ProjectCreate from "./pages/projects/ProjectCreate";
import ProjectEdit from "./pages/projects/ProjectEdit";
import ProjectView from "./pages/projects/ProjectView";
import MembersList from "./pages/members/MembersList";
import MemberCreate from "./pages/members/MemberCreate";
import MemberEdit from "./pages/members/MemberEdit";
import MemberView from "./pages/members/MemberView";
import DepartmentsList from "./pages/departments/DepartmentsList";
import DepartmentCreate from "./pages/departments/DepartmentCreate";
import DepartmentEdit from "./pages/departments/DepartmentEdit";
import DepartmentView from "./pages/departments/DepartmentView";

function RequireAuth() {
    const { role } = useAuth();
    if (role === "guest") {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
}

export default function App() {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-slate-950 text-slate-50">
                <Routes>
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                    </Route>

                    <Route element={<RequireAuth />}>
                        <Route element={<AuthLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/projects" element={<ProjectsList />} />
                            <Route path="/projects/dashboard" element={<ProjectsDashboard />} />
                            <Route path="/projects/new" element={<ProjectCreate />} />
                            <Route path="/projects/:id" element={<ProjectView />} />
                            <Route path="/projects/:id/edit" element={<ProjectEdit />} />
                            <Route path="/members" element={<MembersList />} />
                            <Route path="/members/new" element={<MemberCreate />} />
                            <Route path="/members/:id" element={<MemberView />} />
                            <Route path="/members/:id/edit" element={<MemberEdit />} />
                            <Route path="/departments" element={<DepartmentsList />} />
                            <Route path="/departments/new" element={<DepartmentCreate />} />
                            <Route path="/departments/:id" element={<DepartmentView />} />
                            <Route path="/departments/:id/edit" element={<DepartmentEdit />} />
                            <Route path="/tasks" element={<Tasks />} />
                            <Route path="/chart" element={<ChartDemo />} />
                            <Route path="/admin" element={<Admin />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <AxToastMessage />
            </div>
        </AuthProvider>
    );
}
