import React, { useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock3,
    FileText,
    Folder,
    Users,
    Wallet,
} from "lucide-react";
import usePageTitle from "../lib/usePageTitle";
import { API_ENDPOINTS } from "../lib/apiEndpoints";
import { apiRequest } from "../lib/apiClient";

const PERIODS = [
    { key: "7d", label: "Last 7 days" },
    { key: "30d", label: "Last 30 days" },
    { key: "qtr", label: "This quarter" },
];

const EMPTY_OVERVIEW = {
    period: "30d",
    scope: { department_id: null },
    kpis: {
        projects: 0,
        open_tasks: 0,
        overdue_tasks: 0,
        files_uploaded: 0,
        budget_total: 0,
        budget_consumed: 0,
        budget_burn: 0,
    },
    project_health: [],
    upcoming_deadlines: [],
    activities: [],
    team_workload: [],
    finance_overview: [],
    files_logs: {
        files_uploaded: 0,
        action_logs: 0,
        completion_signals: 0,
        pending_reviews: 0,
    },
};

function ragTone(rag) {
    const tone = String(rag || "").toUpperCase();
    if (tone === "GREEN") return "bg-emerald-300/20 text-emerald-100";
    if (tone === "AMBER") return "bg-amber-300/20 text-amber-100";
    if (tone === "RED") return "bg-rose-300/20 text-rose-100";
    return "bg-slate-300/20 text-slate-100";
}

function activityTone(type) {
    if (type === "action") return "text-emerald-200";
    if (type === "finance") return "text-amber-200";
    return "text-slate-200";
}

function formatAge(createdAt) {
    const dt = new Date(createdAt);
    if (Number.isNaN(dt.getTime())) return "";
    const diffMs = Date.now() - dt.getTime();
    const mins = Math.max(1, Math.floor(diffMs / 60000));
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

function dueLabel(days) {
    const n = Number(days);
    if (Number.isNaN(n)) return "No due date";
    if (n < 0) return `Overdue by ${Math.abs(n)} days`;
    if (n === 0) return "Due today";
    return `Due in ${n} days`;
}

export default function Dashboard() {
    usePageTitle("Dashboard");

    const [period, setPeriod] = useState("30d");
    const [department, setDepartment] = useState("all");
    const [overview, setOverview] = useState(EMPTY_OVERVIEW);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const departments = useMemo(() => {
        const byId = new Map();
        (overview.project_health || []).forEach((project) => {
            if (project.department_id && project.department_name) {
                byId.set(String(project.department_id), project.department_name);
            }
        });
        (overview.team_workload || []).forEach((member) => {
            if (member.department_id && member.department_name) {
                byId.set(String(member.department_id), member.department_name);
            }
        });

        const values = Array.from(byId.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return [{ id: "all", name: "All departments" }, ...values];
    }, [overview]);

    useEffect(() => {
        if (department === "all") return;
        const hasSelected = departments.some((item) => item.id === department);
        if (!hasSelected) setDepartment("all");
    }, [department, departments]);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                setLoading(true);
                setError("");

                const params = new URLSearchParams();
                params.set("period", period);
                if (department !== "all") {
                    params.set("department_id", department);
                }

                const url = `${API_ENDPOINTS.DASHBOARD_OVERVIEW}?${params.toString()}`;
                const res = await apiRequest(url, "GET");

                if (!isMounted) return;
                setOverview(res?.overview || EMPTY_OVERVIEW);
            } catch (err) {
                if (!isMounted) return;
                setOverview(EMPTY_OVERVIEW);
                setError(err.message || "Failed to load dashboard data.");
            } finally {
                if (isMounted) setLoading(false);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [period, department]);

    const kpis = overview.kpis || EMPTY_OVERVIEW.kpis;
    const projectHealth = overview.project_health || [];
    const upcoming = overview.upcoming_deadlines || [];
    const activities = overview.activities || [];
    const teamWorkload = overview.team_workload || [];
    const financeOverview = overview.finance_overview || [];
    const filesLogs = overview.files_logs || EMPTY_OVERVIEW.files_logs;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] auth-accent">Overview</p>
                    <h2 className="text-3xl font-semibold auth-text-primary">Dashboard</h2>
                    <p className="mt-2 max-w-3xl text-sm auth-text-secondary">
                        Real-time summary across Projects, Tasks, Members, Finance, Files, and
                        Activities.
                    </p>
                    {error ? (
                        <p className="mt-2 text-xs text-rose-200">{error}</p>
                    ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {PERIODS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setPeriod(item.key)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                period === item.key
                                    ? "border-amber-200/60 bg-amber-300/20 text-amber-100"
                                    : "auth-border bg-white/5 auth-text-primary"
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                    <select
                        value={department}
                        onChange={(event) => setDepartment(event.target.value)}
                        className="rounded-full border auth-border bg-white/5 px-3 py-1.5 text-xs font-semibold auth-text-primary"
                    >
                        {departments.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border auth-border auth-surface p-5 auth-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">Active Projects</p>
                        <Activity size={16} className="auth-text-secondary" />
                    </div>
                    <p className="mt-3 text-3xl font-semibold auth-text-primary">
                        {Number(kpis.projects) || 0}
                    </p>
                </div>
                <div className="rounded-3xl border auth-border auth-surface p-5 auth-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">Open Tasks</p>
                        <Clock3 size={16} className="auth-text-secondary" />
                    </div>
                    <p className="mt-3 text-3xl font-semibold auth-text-primary">
                        {Number(kpis.open_tasks) || 0}
                    </p>
                </div>
                <div className="rounded-3xl border auth-border auth-surface p-5 auth-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">Overdue Tasks</p>
                        <AlertTriangle size={16} className="text-amber-200" />
                    </div>
                    <p className="mt-3 text-3xl font-semibold auth-text-primary">
                        {Number(kpis.overdue_tasks) || 0}
                    </p>
                </div>
                <div className="rounded-3xl border auth-border auth-surface p-5 auth-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">Budget Burn</p>
                        <Wallet size={16} className="auth-text-secondary" />
                    </div>
                    <p className="mt-3 text-3xl font-semibold auth-text-primary">
                        {Number(kpis.budget_burn) || 0}%
                    </p>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
                <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">Projects</p>
                            <h3 className="text-xl font-semibold auth-text-primary">Delivery Health</h3>
                        </div>
                        <span className="rounded-full border auth-border px-3 py-1 text-xs auth-text-secondary">
                            {period === "7d" ? "Weekly" : period === "30d" ? "Monthly" : "Quarterly"}
                        </span>
                    </div>
                    <div className="mt-5 space-y-3">
                        {projectHealth.map((project) => (
                            <div key={project.id} className="rounded-2xl border auth-border auth-surface p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold auth-text-primary">
                                            {project.title}
                                        </p>
                                        <p className="text-xs auth-text-secondary">
                                            {project.department_name || "Unassigned"} • {project.owner_name || "Unassigned"}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2 py-1 text-[11px] font-semibold ${ragTone(
                                            project.rag_status,
                                        )}`}
                                    >
                                        {String(project.rag_status || "N/A").toUpperCase()}
                                    </span>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs auth-text-secondary">
                                    <span>
                                        Milestones {Number(project.milestones_done) || 0}/
                                        {Number(project.milestones_total) || 0}
                                    </span>
                                    <span>{dueLabel(project.due_in_days)}</span>
                                </div>
                            </div>
                        ))}
                        {!projectHealth.length && !loading ? (
                            <p className="text-sm auth-text-secondary">No projects in scope.</p>
                        ) : null}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">Deadlines</p>
                        <h3 className="mt-2 text-xl font-semibold auth-text-primary">Upcoming</h3>
                        <div className="mt-4 space-y-3">
                            {upcoming.map((project) => (
                                <div
                                    key={`upcoming-${project.id}`}
                                    className="rounded-2xl border auth-border auth-surface px-4 py-3"
                                >
                                    <p className="text-sm font-semibold auth-text-primary">{project.title}</p>
                                    <p className="mt-1 text-xs auth-text-secondary">
                                        {Number(project.open_tasks) || 0} open • {Number(project.blocked_tasks) || 0} blocked
                                        • {dueLabel(project.due_in_days)}
                                    </p>
                                </div>
                            ))}
                            {!upcoming.length && !loading ? (
                                <p className="text-sm auth-text-secondary">No upcoming deadlines.</p>
                            ) : null}
                        </div>
                    </div>

                    <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">Recent Activity</p>
                        <div className="mt-4 space-y-3">
                            {activities.map((item) => (
                                <div
                                    key={`activity-${item.type}-${item.id}`}
                                    className="flex items-start justify-between gap-3 rounded-2xl border auth-border auth-surface px-4 py-3"
                                >
                                    <div className="min-w-0">
                                        <p className={`text-sm ${activityTone(item.type)}`}>{item.text}</p>
                                        <p className="mt-1 text-xs auth-text-secondary">{item.project_title}</p>
                                    </div>
                                    <span className="text-xs auth-text-secondary">
                                        {formatAge(item.created_at)}
                                    </span>
                                </div>
                            ))}
                            {!activities.length && !loading ? (
                                <p className="text-sm auth-text-secondary">No recent activity found.</p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">Members</p>
                        <Users size={16} className="auth-text-secondary" />
                    </div>
                    <h3 className="mt-2 text-xl font-semibold auth-text-primary">Team Workload</h3>
                    <div className="mt-4 space-y-3">
                        {teamWorkload.slice(0, 4).map((member) => (
                            <div
                                key={`member-${member.id}`}
                                className="rounded-2xl border auth-border auth-surface px-4 py-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-sm font-semibold auth-text-primary">
                                        {member.full_name}
                                    </p>
                                    <span className="text-xs auth-text-secondary">{member.role_name}</span>
                                </div>
                                <p className="mt-1 text-xs auth-text-secondary">
                                    {member.department_name || "Unassigned"} • {Number(member.in_progress) || 0} in
                                    progress • {Number(member.active_tasks) || 0} active
                                </p>
                            </div>
                        ))}
                        {!teamWorkload.length && !loading ? (
                            <p className="text-sm auth-text-secondary">No workload data found.</p>
                        ) : null}
                    </div>
                </div>

                <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">Finance</p>
                        <Wallet size={16} className="auth-text-secondary" />
                    </div>
                    <h3 className="mt-2 text-xl font-semibold auth-text-primary">Allocation vs Consumption</h3>
                    <div className="mt-4 space-y-3">
                        {financeOverview.slice(0, 4).map((project) => {
                            const allocated = Number(project.fund_allocated) || 0;
                            const consumed = Number(project.fund_consumed) || 0;
                            const percent = allocated ? Math.min(100, Math.round((consumed / allocated) * 100)) : 0;
                            return (
                                <div
                                    key={`finance-${project.id}`}
                                    className="rounded-2xl border auth-border auth-surface px-4 py-3"
                                >
                                    <p className="truncate text-sm font-semibold auth-text-primary">
                                        {project.title}
                                    </p>
                                    <p className="mt-1 text-xs auth-text-secondary">
                                        {consumed}Cr consumed / {allocated}Cr allocated
                                    </p>
                                    <div className="mt-2 h-2 rounded-full bg-white/10">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {!financeOverview.length && !loading ? (
                            <p className="text-sm auth-text-secondary">No finance overview found.</p>
                        ) : null}
                    </div>
                </div>

                <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">Files & Logs</p>
                        <Folder size={16} className="auth-text-secondary" />
                    </div>
                    <h3 className="mt-2 text-xl font-semibold auth-text-primary">Knowledge Footprint</h3>
                    <div className="mt-4 space-y-3">
                        <div className="rounded-2xl border auth-border auth-surface px-4 py-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold auth-text-primary">Files Uploaded</p>
                                <span className="text-sm auth-text-primary">
                                    {Number(filesLogs.files_uploaded) || 0}
                                </span>
                            </div>
                            <p className="mt-1 text-xs auth-text-secondary">Across active projects</p>
                        </div>
                        <div className="rounded-2xl border auth-border auth-surface px-4 py-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold auth-text-primary">Action Logs</p>
                                <span className="text-sm auth-text-primary">
                                    {Number(filesLogs.action_logs) || 0}
                                </span>
                            </div>
                            <p className="mt-1 text-xs auth-text-secondary">System + user activity entries</p>
                        </div>
                        <div className="rounded-2xl border auth-border auth-surface px-4 py-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold auth-text-primary">Completion Signals</p>
                                <span className="inline-flex items-center gap-1 text-emerald-200">
                                    <CheckCircle2 size={14} /> {Number(filesLogs.completion_signals) || 0}
                                </span>
                            </div>
                            <p className="mt-1 text-xs auth-text-secondary">
                                Milestone and task completion updates in selected window
                            </p>
                        </div>
                        <div className="rounded-2xl border auth-border auth-surface px-4 py-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold auth-text-primary">Pending Reviews</p>
                                <span className="inline-flex items-center gap-1 text-amber-200">
                                    <FileText size={14} /> {Number(filesLogs.pending_reviews) || 0}
                                </span>
                            </div>
                            <p className="mt-1 text-xs auth-text-secondary">
                                Activities and files awaiting final approval
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? <p className="text-xs auth-text-secondary">Loading dashboard...</p> : null}
        </div>
    );
}
