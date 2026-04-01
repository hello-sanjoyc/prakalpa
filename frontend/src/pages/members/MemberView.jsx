import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    CalendarDays,
    Mail,
    Phone,
    Globe,
    SquarePen,
    Trash,
    UserRound,
    Layers,
    ListChecks,
    MessageCircle,
} from "lucide-react";
import usePageTitle from "../../lib/usePageTitle";
import { API_ENDPOINTS } from "../../lib/apiEndpoints";
import { apiRequest } from "../../lib/apiClient";
import { showError } from "../../components/common/AxToastMessage.jsx";

export default function MemberView() {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    usePageTitle(member?.full_name || "Member");

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const res = await apiRequest(
                    API_ENDPOINTS.MEMBER_VIEW(id),
                    "GET"
                );
                if (!isMounted) return;
                setMember(res?.member || res || null);
            } catch (err) {
                if (!isMounted) return;
                setError(err.message || "Failed to load member");
                showError(err.message || "Failed to load member");
            } finally {
                if (isMounted) setLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [id]);

    const statCard = (title, value, icon) => (
        <div className="rounded-2xl border auth-border bg-slate-900/40 px-4 py-3 flex items-center justify-between">
            <div>
                <p className="text-[11px] uppercase tracking-[0.2em] auth-accent">
                    {title}
                </p>
                <p className="text-sm font-semibold auth-text-primary mt-1">
                    {value || "—"}
                </p>
            </div>
            {icon}
        </div>
    );

    if (loading) {
        return (
            <div className="px-4 py-8 text-sm auth-text-secondary">
                Loading member...
            </div>
        );
    }

    if (error) {
        return <div className="px-4 py-8 text-sm text-rose-200">{error}</div>;
    }

    if (!member) {
        return (
            <div className="px-4 py-8 text-sm auth-text-secondary">
                Member not found.
            </div>
        );
    }

    const displayEmail = member.email || member.user_email || "—";
    const displayPhone = member.phone || "—";
    const departmentLabel = member.department_name
        ? member.department_name
        : member.department_id
        ? `Dept #${member.department_id}`
        : "—";
    const roleLabel =
        typeof member.role_names === "string" && member.role_names.trim()
            ? member.role_names
                  .split(",")
                  .map((role) => role.trim())
                  .filter(Boolean)
                  .join(", ")
            : typeof member.role_slugs === "string" && member.role_slugs.trim()
            ? member.role_slugs
                  .split(",")
                  .map((role) => role.trim())
                  .filter(Boolean)
                  .join(", ")
            : "—";

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] auth-accent">
                        Members
                    </p>
                    <h1 className="text-3xl font-semibold auth-text-primary">
                        Profiole of {member.full_name || "Unnamed Member"}
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

            <div className="grid gap-6 lg:grid-cols-3">
            <aside className="space-y-4 rounded-3xl border auth-border auth-surface p-6 auth-shadow bg-gradient-to-br from-white/5 to-white/0">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-3xl font-semibold auth-text-primary border border-white/10">
                        {member.avatar_path ? (
                            <img
                                src={member.avatar_path}
                                alt={member.full_name || "Member avatar"}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <UserRound size={32} className="text-slate-400" />
                        )}
                    </div>
                    <div className="px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-200">
                        {member.designation || "Member"}
                    </div>
                        <h1 className="text-xl font-semibold auth-text-primary">
                            {member.full_name || "Unnamed"}
                        </h1>
                        {member.user_username ? (
                            <p className="text-xs auth-text-secondary">
                                @{member.user_username}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        <Link
                            to={`/members/${member.id}/edit`}
                            className="rounded-full border auth-border bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-200 flex items-center gap-1"
                        >
                            <SquarePen size={14} strokeWidth={2} /> Edit
                        </Link>
                        <button
                            type="button"
                            className="rounded-full border border-rose-400/80 px-3 py-1 text-[11px] font-semibold text-rose-200 flex items-center gap-1"
                        >
                            <Trash size={14} strokeWidth={2} /> Delete
                        </button>
                    </div>

                    <div className="space-y-3">
                        {statCard(
                            "Department",
                            departmentLabel,
                            <Layers size={18} />
                        )}
                        {statCard("Role", roleLabel, <UserRound size={18} />)}
                    </div>

                    <div className="space-y-2 rounded-2xl border auth-border bg-slate-900/30 p-4">
                        <div className="flex items-center gap-2 text-sm auth-text-secondary">
                            <Mail size={16} strokeWidth={2} />
                            <span>{displayEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm auth-text-secondary">
                            <Phone size={16} strokeWidth={2} />
                            <span>{displayPhone}</span>
                        </div>
                        {member.secondary_phone ? (
                            <div className="flex items-center gap-2 text-sm auth-text-secondary">
                                <Phone size={16} strokeWidth={2} />
                                <span>{member.secondary_phone}</span>
                            </div>
                        ) : null}
                        {member.whatsapp ? (
                            <div className="flex items-center gap-2 text-sm auth-text-secondary">
                                <MessageCircle size={16} strokeWidth={2} />
                                <span>{member.whatsapp}</span>
                            </div>
                        ) : null}
                        {member.website ? (
                            <div className="flex items-center gap-2 text-sm auth-text-secondary">
                                <Globe size={16} strokeWidth={2} />
                                <span>{member.website}</span>
                            </div>
                        ) : null}
                    </div>

                    <div>
                        <p className="text-[11px] uppercase tracking-[0.25em] auth-accent">
                            Bio
                        </p>
                        <p className="mt-2 text-sm auth-text-secondary leading-relaxed">
                            {member.bio ||
                                "No bio available. Add a short intro or responsibilities here."}
                        </p>
                    </div>
                </aside>

                <section className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold auth-text-primary">
                            Projects
                        </h2>
                        <div className="flex items-center gap-2 text-xs auth-text-secondary">
                            <CalendarDays size={14} /> Recent updates
                        </div>
                    </div>
                    <div className="space-y-4">
                        {(member.projects || []).map((proj) => (
                            <div
                                key={`proj-${proj.id}`}
                                className="rounded-2xl border auth-border auth-surface p-4 auth-shadow bg-gradient-to-br from-white/5 to-white/0"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.2em] auth-accent">
                                            Project
                                        </p>
                                        <p className="text-sm font-semibold auth-text-primary">
                                            {proj.title ||
                                                `Project #${proj.id}`}
                                        </p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-slate-300">
                                        {proj.status || "ACTIVE"}
                                    </span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-3 text-xs auth-text-secondary">
                                    <span>Code: {proj.code || "—"}</span>
                                    <span>Role: {proj.role || "Member"}</span>
                                    <Link
                                        to={`/projects/${proj.id}`}
                                        className="text-amber-200 underline underline-offset-4"
                                    >
                                        View project
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {!member.projects?.length ? (
                            <div className="rounded-2xl border auth-border bg-slate-900/20 p-6 text-sm auth-text-secondary">
                                No projects assigned yet.
                            </div>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold auth-text-primary">
                            Tasks
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {(member.tasks || []).map((task) => (
                            <div
                                key={`task-${task.id}`}
                                className="rounded-2xl border auth-border bg-slate-900/30 p-4"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-sm font-semibold auth-text-primary">
                                        {task.title || `Task #${task.id}`}
                                    </p>
                                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-slate-300">
                                        {task.status || "OPEN"}
                                    </span>
                                </div>
                                <p className="text-xs auth-text-secondary mt-1">
                                    {task.project_title || "No project linked"}
                                </p>
                            </div>
                        ))}

                        {!member.tasks?.length ? (
                            <div className="rounded-2xl border auth-border bg-slate-900/20 p-6 text-sm auth-text-secondary">
                                No tasks assigned yet.
                            </div>
                        ) : null}
                    </div>
                </section>
            </div>
        </div>
    );
}
