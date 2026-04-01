import React from "react";
import { Link, useNavigate } from "react-router-dom";
import MemberForm from "./MemberForm";

export default function MemberCreate() {
    const navigate = useNavigate();
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] auth-accent">
                        Members
                    </p>
                    <h1 className="text-3xl font-semibold auth-text-primary">
                        Create New Member
                    </h1>
                    <p className="mt-2 text-sm auth-text-secondary">
                        Manage project participants and their contact details.
                    </p>
                </div>
                <Link
                    to="/members"
                    className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary"
                >
                    Back to list
                </Link>
            </div>
            <div className="space-y-4">
                <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow bg-gradient-to-br from-white/5 to-white/0">
                    <MemberForm
                        mode="create"
                        onSuccess={() => navigate("/members")}
                    />
                </div>
            </div>
        </div>
    );
}
