import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AuthHeader from "./AuthHeader.jsx";
import AuthSidebar from "./AuthSidebar.jsx";

export default function AuthLayout() {
    const [theme, setTheme] = useState(() => {
        if (typeof window === "undefined") return "dark";
        return localStorage.getItem("auth-theme") || "dark";
    });
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem("auth-theme", theme);
    }, [theme]);

    useEffect(() => {
        document.body.classList.toggle("no-scroll", isSidebarOpen);
        return () => document.body.classList.remove("no-scroll");
    }, [isSidebarOpen]);

    useEffect(() => {
        if (!isSidebarOpen) return;
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setSidebarOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSidebarOpen]);

    const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    return (
        <div
            className="min-h-screen auth-bg auth-text-primary overflow-x-hidden"
            data-auth-theme={theme}
        >
            <div className="flex">
                <AuthSidebar />
                {/* Mobile drawer */}
                <div
                    id="auth-sidebar"
                    className={`fixed inset-y-0 left-0 z-50 w-64 border-r auth-border auth-surface backdrop-blur transition-transform duration-300 ease-out md:w-72 lg:hidden ${
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                    role="dialog"
                    aria-modal="true"
                >
                    <AuthSidebar isMobile onClose={() => setSidebarOpen(false)} />
                </div>
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                <div className="flex min-h-screen flex-1 flex-col">
                    <AuthHeader
                        isLightMode={theme === "light"}
                        onToggleTheme={toggleTheme}
                        onToggleMenu={toggleSidebar}
                        isSidebarOpen={isSidebarOpen}
                    />
                    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
