import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layers, SquarePen, UserRound } from "lucide-react";
import usePageTitle from "../../lib/usePageTitle";
import { API_ENDPOINTS } from "../../lib/apiEndpoints";
import { apiRequest } from "../../lib/apiClient";
import { showError } from "../../components/common/AxToastMessage.jsx";

export default function DepartmentView() {
    const { id } = useParams();
    const [department, setDepartment] = useState(null);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [members, setMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [membersError, setMembersError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    usePageTitle(department?.name || "Department");

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const [deptRes, optionsRes] = await Promise.all([
                    apiRequest(API_ENDPOINTS.DEPARTMENT_VIEW(id), "GET"),
                    apiRequest(API_ENDPOINTS.DEPARTMENT_OPTIONS, "GET"),
                ]);
                if (!isMounted) return;
                setDepartment(deptRes?.department || deptRes || null);
                setDepartmentOptions(optionsRes?.departments || optionsRes || []);
            } catch (err) {
                if (!isMounted) return;
                setError(err.message || "Failed to load department");
                showError(err.message || "Failed to load department");
            } finally {
                if (isMounted) setLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        if (!id) return;
        let isMounted = true;
        setMembersLoading(true);
        setMembersError("");
        (async () => {
            try {
                const res = await apiRequest(
                    API_ENDPOINTS.DEPARTMENT_MEMBERS(id),
                    "GET"
                );
                if (!isMounted) return;
                setMembers(res?.members || res || []);
            } catch (err) {
                if (!isMounted) return;
                setMembersError(err.message || "Failed to load members");
            } finally {
                if (isMounted) setMembersLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [id]);

    const parentLabel = useMemo(() => {
        if (!department?.parent_id) return "—";
        const match = departmentOptions.find(
            (dept) => String(dept.id) === String(department.parent_id)
        );
        return match?.name || `Dept #${department.parent_id}`;
    }, [departmentOptions, department]);

    if (loading) {
        return (
            <div className="px-4 py-8 text-sm auth-text-secondary">
                Loading department...
            </div>
        );
    }

    if (error) {
        return <div className="px-4 py-8 text-sm text-rose-200">{error}</div>;
    }

    if (!department) {
        return (
            <div className="px-4 py-8 text-sm auth-text-secondary">
                Department not found.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] auth-accent">
                        Departments
                    </p>
                    <h1 className="text-3xl font-semibold auth-text-primary">
                        {department.name || "Department overview"}
                    </h1>
                    <p className="mt-2 text-sm auth-text-secondary">
                        Review department details and hierarchy.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        to="/departments"
                        className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary"
                    >
                        Back to list
                    </Link>
                    <Link
                        to={`/departments/${department.id}/edit`}
                        className="rounded-full border auth-border bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200 flex items-center gap-2"
                    >
                        <SquarePen size={14} strokeWidth={2} /> Edit department
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <aside className="space-y-4 rounded-3xl border auth-border auth-surface p-6 auth-shadow bg-gradient-to-br from-white/5 to-white/0">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-20 w-20 rounded-2xl bg-slate-900/60 flex items-center justify-center border border-white/10">
                            <Layers size={28} className="text-slate-300" />
                        </div>
                        <h2 className="text-xl font-semibold auth-text-primary">
                            {department.name || "Department"}
                        </h2>
                        <p className="text-xs auth-text-secondary">
                            Code: {department.code || "—"}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="rounded-2xl border auth-border bg-slate-900/40 px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.2em] auth-accent">
                                Parent Department
                            </p>
                            <p className="mt-1 text-sm font-semibold auth-text-primary">
                                {parentLabel}
                            </p>
                        </div>
                        <div className="rounded-2xl border auth-border bg-slate-900/40 px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.2em] auth-accent">
                                Department Code
                            </p>
                            <p className="mt-1 text-sm font-semibold auth-text-primary">
                                {department.code || "—"}
                            </p>
                        </div>
                    </div>
                </aside>

                <section className="lg:col-span-2 space-y-4">
                    <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow bg-gradient-to-br from-white/5 to-white/0">
                        <p className="text-[11px] uppercase tracking-[0.25em] auth-accent">
                            Summary
                        </p>
                        <p className="mt-3 text-sm auth-text-secondary leading-relaxed">
                            Departments can own projects, members, and vendors.
                            Use this space to keep track of organizational
                            structure and accountability.
                        </p>
                    </div>
                    <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow bg-gradient-to-br from-white/5 to-white/0">
                        <p className="text-[11px] uppercase tracking-[0.25em] auth-accent">
                            Members
                        </p>
                        {membersLoading ? (
                            <p className="mt-4 text-sm auth-text-secondary">
                                Loading members...
                            </p>
                        ) : membersError ? (
                            <p className="mt-4 text-sm text-rose-200">
                                {membersError}
                            </p>
                        ) : members.length ? (
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="rounded-2xl border auth-border bg-slate-900/30 p-4"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-800/70 flex items-center justify-center border border-white/10">
                                                {member.avatar_path ? (
                                                    <img
                                                        src={member.avatar_path}
                                                        alt={
                                                            member.full_name ||
                                                            "Member avatar"
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <UserRound
                                                        size={18}
                                                        className="text-slate-400"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-1 items-start justify-between gap-3">
                                                <div>
                                                    <Link
                                                        to={`/members/${member.id}`}
                                                        className="text-sm font-semibold auth-text-primary underline underline-offset-4"
                                                    >
                                                        {member.full_name ||
                                                            "Unnamed"}
                                                    </Link>
                                                    <p className="mt-1 text-xs auth-text-secondary">
                                                        {member.designation ||
                                                            "—"}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs auth-text-secondary">
                                                        {member.email || "—"}
                                                    </p>
                                                    <p className="mt-1 text-xs auth-text-secondary">
                                                        {member.phone || "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-sm auth-text-secondary">
                                No members assigned yet.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
