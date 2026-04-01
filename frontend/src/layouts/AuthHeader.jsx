import React, { useEffect, useRef, useState } from "react";
import { Sun, Moon, Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function AuthHeader({
    onToggleTheme,
    isLightMode,
    onToggleMenu,
    isSidebarOpen,
}) {
    const { role, setRole, user } = useAuth();
    const appName = import.meta.env.VITE_APP_NAME || "Prakalpa";
    const appSubTitle = import.meta.env.VITE_APP_SUB_TITLE || "Workspace";

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        console.log("user----- ", user, role);
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = () => {
        setRole("guest");
        try {
            localStorage.removeItem("authToken");
        } catch (_) {}
        setMenuOpen(false);
    };

    const initials =
        user?.fullName
            ?.split(" ")
            ?.map((p) => p[0])
            ?.join("")
            .slice(0, 2) || (user?.username || "U").slice(0, 2).toUpperCase();

    return (
        <header className="relative z-50 flex items-center justify-between gap-4 border-b auth-border auth-surface px-4 py-4 backdrop-blur sm:px-6">
            <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold auth-text-primary sm:text-xl">
                    {appName}
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] auth-accent sm:text-xs">
                    {appSubTitle}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleMenu}
                    className="flex items-center gap-2 rounded-full border auth-border px-3 py-2 text-xs font-semibold auth-text-primary transition hover:-translate-y-0.5 lg:hidden"
                    aria-controls="auth-sidebar"
                    aria-expanded={isSidebarOpen}
                    aria-label={
                        isSidebarOpen
                            ? "Close navigation menu"
                            : "Open navigation menu"
                    }
                >
                    <Menu size={16} className="auth-text-primary" />
                    <span>Menu</span>
                </button>
                <button
                    onClick={onToggleTheme}
                    aria-label={`Switch to ${
                        isLightMode ? "dark" : "light"
                    } mode`}
                    className="flex items-center gap-2 rounded-full border auth-border p-3 text-xs font-semibold auth-text-primary transition hover:-translate-y-0.5"
                >
                    {isLightMode ? (
                        <Moon size={16} className="auth-text-primary" />
                    ) : (
                        <Sun size={16} className="auth-text-primary" />
                    )}
                </button>
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen((o) => !o)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border auth-border bg-white/10 text-sm font-semibold auth-text-primary transition hover:-translate-y-0.5"
                        aria-label="User menu"
                    >
                        {initials}
                    </button>
                    {menuOpen && (
                        <div className="auth-dropdown absolute right-0 z-[60] mt-2 w-56 rounded-2xl border auth-border p-3 shadow-2xl backdrop-blur-lg">
                            <div className="mb-3 border-b auth-border pb-3 text-sm">
                                <div className="font-semibold auth-text-primary">
                                    {user?.fullName || user?.username || "User"}
                                </div>
                                <div className="text-xs auth-text-secondary">
                                    {user?.roleName || "Member"}
                                </div>
                            </div>
                            <div className="space-y-1 text-sm auth-text-primary">
                                <button className="w-full rounded-xl px-3 py-2 text-left hover:auth-nav-hover">
                                    Profile
                                </button>
                                <button className="w-full rounded-xl px-3 py-2 text-left hover:auth-nav-hover">
                                    Change Password
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full rounded-xl px-3 py-2 text-left hover:auth-nav-hover"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
