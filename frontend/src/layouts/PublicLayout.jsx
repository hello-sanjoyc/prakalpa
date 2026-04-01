import React from "react";
import { Outlet, Link } from "react-router-dom";

function PublicHeader() {
    return (
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 px-6 py-4 text-white backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="text-lg font-semibold tracking-tight"
                    >
                        Prakalpa
                    </Link>
                    <nav className="hidden items-center gap-4 text-sm text-slate-200 md:flex">
                        <a href="#modules" className="hover:text-white">
                            Modules
                        </a>
                        <a href="#features" className="hover:text-white">
                            Features
                        </a>
                        <a href="#workflow" className="hover:text-white">
                            Workflow
                        </a>
                        <a href="#faq" className="hover:text-white">
                            FAQ
                        </a>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-end gap-3">
                    <Link
                        to="/login"
                        className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/40"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default function PublicLayout() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <PublicHeader />
            <main>
                <Outlet />
            </main>
        </div>
    );
}
