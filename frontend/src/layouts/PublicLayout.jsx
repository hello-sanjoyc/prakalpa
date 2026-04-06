import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import ContactModal from "../components/contact/ContactModal";

function PublicHeader({ onOpenContact }) {
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
                </div>
                <div className="flex flex-1 items-center justify-end gap-3">
                    <nav className="hidden items-center gap-4 text-sm text-slate-200 md:flex">
                        <Link to="/#modules" className="hover:text-white">
                            Modules
                        </Link>
                        <Link to="/#features" className="hover:text-white">
                            Capabilities
                        </Link>
                        <Link to="/#workflow" className="hover:text-white">
                            Usage Flow
                        </Link>
                        <Link to="/#faq" className="hover:text-white">
                            FAQ
                        </Link>
                        <button
                            type="button"
                            className="hover:text-white"
                            onClick={onOpenContact}
                        >
                            Contact
                        </button>
                    </nav>
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
    const [isContactOpen, setIsContactOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <PublicHeader onOpenContact={() => setIsContactOpen(true)} />
            <main>
                <Outlet
                    context={{
                        openContactModal: () => setIsContactOpen(true),
                    }}
                />
            </main>
            <ContactModal
                open={isContactOpen}
                onClose={() => setIsContactOpen(false)}
            />
        </div>
    );
}
