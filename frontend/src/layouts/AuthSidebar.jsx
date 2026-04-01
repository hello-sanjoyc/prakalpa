import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/projects", label: "Projects" },
    { to: "/projects/dashboard", label: "Portfolio" },
    { to: "/tasks", label: "Tasks" },
    { to: "/chart", label: "Charts" },
    { to: "/members", label: "Members" },
    { to: "/departments", label: "Departments" },
];

export default function AuthSidebar({ isMobile = false, onClose = () => {} }) {
    const containerClasses = isMobile
        ? "flex h-full w-full flex-col"
        : "hidden w-72 min-w-[18rem] lg:flex lg:flex-col";

    return (
        <div
            className={`${containerClasses} border-r auth-border auth-surface p-6 backdrop-blur auth-shadow`}
        >
            <div className="flex items-center justify-between md:block">
                <img
                    src="/images/logo.png"
                    alt="Logo"
                    className="h-16 w-16 mx-auto mb-4"
                />

                {isMobile && (
                    <button
                        onClick={onClose}
                        className="rounded-full border auth-border px-2 py-1 text-xs font-semibold auth-text-primary md:hidden"
                    >
                        Close
                    </button>
                )}
            </div>
            <nav className="w-full mt-8 space-y-2 text-sm">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `auth-nav-link flex w-full items-center justify-between rounded-xl px-4 py-3 text-base ${
                                isActive
                                    ? "auth-nav-link-active border auth-border"
                                    : ""
                            }`
                        }
                        onClick={isMobile ? onClose : undefined}
                    >
                        <span className="truncate">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
