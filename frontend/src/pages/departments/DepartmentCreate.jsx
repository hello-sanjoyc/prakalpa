import React from "react";
import { Link, useNavigate } from "react-router-dom";
import DepartmentForm from "./DepartmentForm";

export default function DepartmentCreate() {
    const navigate = useNavigate();
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] auth-accent">
                        Departments
                    </p>
                    <h1 className="text-3xl font-semibold auth-text-primary">
                        Create New Department
                    </h1>
                    <p className="mt-2 text-sm auth-text-secondary">
                        Organize teams and ownership across projects.
                    </p>
                </div>
                <Link
                    to="/departments"
                    className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary"
                >
                    Back to list
                </Link>
            </div>
            <div className="space-y-4">
                <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow bg-gradient-to-br from-white/5 to-white/0">
                    <DepartmentForm
                        mode="create"
                        onSuccess={() => navigate("/departments")}
                    />
                </div>
            </div>
        </div>
    );
}
