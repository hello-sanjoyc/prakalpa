import React, { useEffect, useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import usePageTitle from "../lib/usePageTitle";
import { API_ENDPOINTS } from "../lib/apiEndpoints";
import { apiRequest } from "../lib/apiClient";

const DEFAULT_FILTERS = {
    project: "all",
    member: "me",
    status: "all",
    priority: "all",
};

const STATUS_CARDS = [
    { key: "open", label: "Open" },
    { key: "in_progress", label: "In progress" },
    { key: "blocked", label: "Blocked" },
    { key: "done", label: "Done" },
];

const TASK_TABS = [
    { key: "overdue", label: "Overdue", statusValue: null },
    { key: "open", label: "Open", statusValue: "open" },
    { key: "in_progress", label: "In Progress", statusValue: "in_progress" },
    { key: "blocked", label: "Blocked", statusValue: "blocked" },
    { key: "done", label: "Done", statusValue: "done" },
];

export default function Tasks() {
    usePageTitle("Tasks");
    const { user } = useAuth();
    const loggedInMemberId =
        user?.member_id || user?.memberId || user?.id || null;
    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedProject, setSelectedProject] = useState(
        DEFAULT_FILTERS.project,
    );
    const [selectedMember, setSelectedMember] = useState(
        DEFAULT_FILTERS.member,
    );
    const [selectedStatus, setSelectedStatus] = useState(
        DEFAULT_FILTERS.status,
    );
    const [selectedPriority, setSelectedPriority] = useState(
        DEFAULT_FILTERS.priority,
    );
    const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
    const [summary, setSummary] = useState({
        open: 0,
        in_progress: 0,
        blocked: 0,
        done: 0,
        total: 0,
    });
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overdue");
    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [tasksError, setTasksError] = useState("");
    const [assigneeDirectory, setAssigneeDirectory] = useState([]);
    const [tasksPage, setTasksPage] = useState(1);
    const [tasksPageSize, setTasksPageSize] = useState(5);

    const statusOptions = [
        { value: "all", label: "All Statuses" },
        { value: "open", label: "Open" },
        { value: "in_progress", label: "In progress" },
        { value: "blocked", label: "Blocked" },
        { value: "done", label: "Done" },
    ];

    const priorityOptions = [
        { value: "all", label: "All Priorities" },
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
    ];

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const loggedInMemberId =
                    user?.member_id || user?.memberId || user?.id || null;
                const projectUrl = loggedInMemberId
                    ? API_ENDPOINTS.PROJECT_BY_MEMBER(loggedInMemberId)
                    : API_ENDPOINTS.PROJECTS;
                const pjRes = await apiRequest(projectUrl, "GET");
                if (!isMounted) return;
                setProjects(pjRes.projects || pjRes || []);

                let membersUrl;
                if (selectedProject && selectedProject !== "all") {
                    membersUrl = API_ENDPOINTS.PROJECT_MEMBERS(
                        selectedProject,
                        loggedInMemberId,
                    );
                } else {
                    membersUrl = loggedInMemberId
                        ? API_ENDPOINTS.MEMBERS_BY_PROJECT_MEMBER(
                              loggedInMemberId,
                          )
                        : API_ENDPOINTS.MEMBERS;
                }
                const mbRes = await apiRequest(membersUrl, "GET");
                if (!isMounted) return;
                const memberRows = mbRes.members || mbRes || [];
                const filteredMembers = loggedInMemberId
                    ? memberRows.filter(
                          (member) =>
                              String(member.id) !== String(loggedInMemberId),
                      )
                    : memberRows;
                setMembers(filteredMembers);

                if (
                    selectedMember !== "all" &&
                    selectedMember !== "me" &&
                    !filteredMembers.some(
                        (m) => String(m.id) === selectedMember,
                    )
                ) {
                    setSelectedMember("all");
                }
            } catch (err) {
                console.warn("Failed to load filter options:", err.message);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [selectedProject, user]);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                setSummaryLoading(true);
                const params = new URLSearchParams();
                if (appliedFilters.project !== "all") {
                    params.set("project_id", appliedFilters.project);
                }
                if (appliedFilters.member === "me") {
                    params.set("member_scope", "me");
                } else if (appliedFilters.member !== "all") {
                    params.set("member_id", appliedFilters.member);
                }
                if (appliedFilters.status !== "all") {
                    params.set("status", appliedFilters.status.toUpperCase());
                }
                if (appliedFilters.priority !== "all") {
                    params.set(
                        "priority",
                        appliedFilters.priority.toUpperCase(),
                    );
                }

                const query = params.toString();
                const url = query
                    ? `${API_ENDPOINTS.TASKS_DASHBOARD}?${query}`
                    : API_ENDPOINTS.TASKS_DASHBOARD;
                const res = await apiRequest(url, "GET");
                if (!isMounted) return;
                setSummary({
                    open: Number(res?.summary?.open) || 0,
                    in_progress: Number(res?.summary?.in_progress) || 0,
                    blocked: Number(res?.summary?.blocked) || 0,
                    done: Number(res?.summary?.done) || 0,
                    total: Number(res?.summary?.total) || 0,
                });
            } catch (err) {
                if (!isMounted) return;
                setSummary({
                    open: 0,
                    in_progress: 0,
                    blocked: 0,
                    done: 0,
                    total: 0,
                });
                console.warn("Failed to load task dashboard:", err.message);
            } finally {
                if (isMounted) {
                    setSummaryLoading(false);
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [appliedFilters]);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                setTasksLoading(true);
                setTasksError("");

                let projectIds = [];
                if (appliedFilters.project !== "all") {
                    projectIds = [Number(appliedFilters.project)];
                } else {
                    const projectUrl = loggedInMemberId
                        ? API_ENDPOINTS.PROJECT_BY_MEMBER(loggedInMemberId)
                        : API_ENDPOINTS.PROJECTS;
                    const pjRes = await apiRequest(projectUrl, "GET");
                    const projectRows = pjRes.projects || pjRes || [];
                    projectIds = projectRows
                        .map((project) => Number(project.id))
                        .filter((id) => id > 0);
                }

                if (!projectIds.length) {
                    if (!isMounted) return;
                    setTasks([]);
                    return;
                }

                const uniqueProjectIds = [...new Set(projectIds)];
                const taskResponses = await Promise.all(
                    uniqueProjectIds.map(async (projectId) => {
                        try {
                            const [taskRes, memberRes] = await Promise.all([
                                apiRequest(
                                    API_ENDPOINTS.PROJECT_TASKS(projectId),
                                    "GET",
                                ),
                                apiRequest(
                                    API_ENDPOINTS.PROJECT_MEMBERS(projectId),
                                    "GET",
                                ),
                            ]);
                            return {
                                projectId,
                                tasks: taskRes?.tasks || [],
                                members: memberRes?.members || [],
                            };
                        } catch (_) {
                            return {
                                projectId,
                                tasks: [],
                                members: [],
                            };
                        }
                    }),
                );

                if (!isMounted) return;
                const assigneeMap = new Map();
                taskResponses.forEach((entry) => {
                    (entry.members || []).forEach((member) => {
                        assigneeMap.set(String(member.id), member);
                    });
                });
                setAssigneeDirectory(Array.from(assigneeMap.values()));

                const mergedTasks = taskResponses.flatMap((entry) =>
                    (entry.tasks || []).map((task) => ({
                        ...task,
                        project_id: Number(task.project_id) || entry.projectId,
                    })),
                );
                setTasks(mergedTasks);
            } catch (err) {
                if (!isMounted) return;
                setTasks([]);
                setAssigneeDirectory([]);
                setTasksError(err.message || "Failed to load tasks.");
            } finally {
                if (isMounted) {
                    setTasksLoading(false);
                }
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [appliedFilters, loggedInMemberId]);

    const memberMap = useMemo(() => {
        const map = new Map();
        assigneeDirectory.forEach((member) => {
            map.set(String(member.id), member);
        });
        members.forEach((member) => {
            if (!map.has(String(member.id))) {
                map.set(String(member.id), member);
            }
        });
        return map;
    }, [members, assigneeDirectory]);

    const projectMap = useMemo(
        () => new Map(projects.map((project) => [String(project.id), project])),
        [projects],
    );

    const visibleTasks = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const normalize = (value) =>
            String(value || "")
                .toUpperCase()
                .trim();

        return tasks
            .filter((task) => {
                const taskStatus = normalize(task.status);
                const taskPriority = normalize(task.priority);
                const taskOwnerId = String(task.owner_id || "");

                if (
                    appliedFilters.member === "me" &&
                    String(loggedInMemberId || "") !== taskOwnerId
                ) {
                    return false;
                }
                if (
                    appliedFilters.member !== "all" &&
                    appliedFilters.member !== "me" &&
                    taskOwnerId !== String(appliedFilters.member)
                ) {
                    return false;
                }
                if (
                    appliedFilters.priority !== "all" &&
                    taskPriority !== normalize(appliedFilters.priority)
                ) {
                    return false;
                }

                if (activeTab === "overdue") {
                    if (!task.due_date) return false;
                    const dueDate = new Date(task.due_date);
                    dueDate.setHours(0, 0, 0, 0);
                    return dueDate < today && taskStatus !== "DONE";
                }
                const activeTabStatus = normalize(activeTab);
                return taskStatus === activeTabStatus;
            })
            .sort((a, b) => {
                const aDate = a?.due_date ? new Date(a.due_date).getTime() : 0;
                const bDate = b?.due_date ? new Date(b.due_date).getTime() : 0;
                return aDate - bDate;
            });
    }, [tasks, appliedFilters, activeTab, loggedInMemberId]);

    const paginatedTasks = useMemo(() => {
        const start = (tasksPage - 1) * tasksPageSize;
        return visibleTasks.slice(start, start + tasksPageSize);
    }, [visibleTasks, tasksPage, tasksPageSize]);

    const totalTaskRows = visibleTasks.length;
    const totalTaskPages = Math.max(
        1,
        Math.ceil(totalTaskRows / tasksPageSize) || 1,
    );
    const showingFrom = totalTaskRows ? (tasksPage - 1) * tasksPageSize + 1 : 0;
    const showingTo = totalTaskRows
        ? Math.min(
              (tasksPage - 1) * tasksPageSize + tasksPageSize,
              totalTaskRows,
          )
        : 0;

    const formatDeadline = (value) => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "—";
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const resolveAssignee = (task) => {
        if (!task?.owner_id) return null;
        if (String(task.owner_id) === String(loggedInMemberId)) {
            const self = memberMap.get(String(task.owner_id));
            return (
                self || {
                    id: loggedInMemberId,
                    full_name: user?.fullName || "Myself",
                    avatar_path: null,
                }
            );
        }
        return (
            memberMap.get(String(task.owner_id)) || {
                id: task.owner_id,
                full_name: `Member #${task.owner_id}`,
                avatar_path: null,
            }
        );
    };

    const handleApply = () => {
        setAppliedFilters({
            project: selectedProject,
            member: selectedMember,
            status: selectedStatus,
            priority: selectedPriority,
        });
    };

    const handleReset = () => {
        setSelectedProject(DEFAULT_FILTERS.project);
        setSelectedMember(DEFAULT_FILTERS.member);
        setSelectedStatus(DEFAULT_FILTERS.status);
        setSelectedPriority(DEFAULT_FILTERS.priority);
        setAppliedFilters(DEFAULT_FILTERS);
        setActiveTab("overdue");
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab.key);
        setTasksPage(1);
    };

    useEffect(() => {
        setTasksPage(1);
    }, [appliedFilters, activeTab, tasksPageSize]);

    useEffect(() => {
        if (tasksPage > totalTaskPages) {
            setTasksPage(totalTaskPages);
        }
    }, [tasksPage, totalTaskPages]);

    return (
        <>
            <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden sm:space-y-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                            Execution
                        </p>
                        <h2 className="text-2xl font-semibold auth-text-primary sm:text-3xl">
                            Tasks
                        </h2>
                        <p className="mt-2 text-sm auth-text-secondary">
                            Stay on top of your workload with real-time task
                            status, priorities, and deadlines—all in one place.
                        </p>
                    </div>
                    <button className="w-fit rounded-full border auth-border px-3 py-2 text-xs font-semibold auth-text-primary transition hover:-translate-y-0.5 sm:px-4">
                        Add task
                    </button>
                </div>

                {/* Add Search Filter */}
                <div className="my-3 grid grid-cols-1 gap-3 items-end md:grid-cols-2 xl:grid-cols-4">
                    <div>
                        <label className="text-[11px] uppercase auth-accent">
                            Project
                        </label>
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="mt-1 block w-full rounded-md border auth-border bg-transparent px-3 py-2 text-sm auth-text-primary"
                        >
                            <option value="all">My Projects</option>
                            {projects.map((p) => (
                                <option key={p.id} value={String(p.id)}>
                                    {p.title || `Project #${p.id}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] uppercase auth-accent">
                            Member
                        </label>
                        <select
                            value={selectedMember}
                            onChange={(e) => setSelectedMember(e.target.value)}
                            className="mt-1 block w-full rounded-md border auth-border bg-transparent px-3 py-2 text-sm auth-text-primary"
                        >
                            <option value="all">All Members</option>
                            <option value="me">Myself</option>
                            {members.map((m) => (
                                <option key={m.id} value={String(m.id)}>
                                    {m.full_name ||
                                        m.email ||
                                        `Member #${m.id}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] uppercase auth-accent">
                            Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="mt-1 block w-full rounded-md border auth-border bg-transparent px-3 py-2 text-sm auth-text-primary"
                        >
                            {statusOptions.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[11px] uppercase auth-accent">
                            Priority
                        </label>
                        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                            <select
                                value={selectedPriority}
                                onChange={(e) =>
                                    setSelectedPriority(e.target.value)
                                }
                                className="block w-full rounded-md border auth-border bg-transparent px-3 py-2 text-sm auth-text-primary"
                            >
                                {priorityOptions.map((p) => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>

                            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
                                <button
                                    className="rounded-full border auth-border px-3 py-2 text-xs font-semibold auth-text-primary sm:px-4"
                                    onClick={handleApply}
                                    disabled={summaryLoading}
                                >
                                    Apply
                                </button>
                                <button
                                    className="rounded-full border auth-border px-3 py-2 text-xs font-semibold auth-text-primary sm:px-4"
                                    onClick={handleReset}
                                    disabled={summaryLoading}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Close Search Filter */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {STATUS_CARDS.map((card) => (
                        <div
                            key={card.key}
                            className="rounded-3xl border auth-border auth-surface p-4 auth-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                    <p className="text-sm font-semibold auth-text-primary">
                                        {card.label}
                                    </p>
                                </div>
                                <span className="text-xs auth-text-secondary">
                                    {summaryLoading ? "..." : summary[card.key]}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 max-w-full space-y-6 sm:mt-12 sm:space-y-8">
                <div className="my-8 overflow-x-auto">
                    <div className="flex min-w-max items-center gap-2 pr-2">
                        {TASK_TABS.map((tab) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleTabClick(tab)}
                                    className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-semibold transition sm:px-4 ${
                                        isActive
                                            ? "border-emerald-300/80 bg-emerald-300/10 text-emerald-100"
                                            : "auth-border auth-text-secondary hover:auth-text-primary"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="hidden xl:grid grid-cols-[2.75fr_2.5fr_1fr_1.5fr_1fr_0.75fr] gap-3 rounded-3xl border auth-border auth-surface px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] auth-accent">
                        <span>Task Name</span>
                        <span>Project</span>
                        <span>Deadline</span>
                        <span>Assigned To</span>
                        <span>Status</span>
                        <span>Priority</span>
                    </div>

                    {tasksLoading ? (
                        <div className="rounded-3xl border auth-border auth-surface px-6 py-6 text-sm auth-text-secondary">
                            Loading tasks...
                        </div>
                    ) : tasksError ? (
                        <div className="rounded-3xl border auth-border auth-surface px-6 py-6 text-sm text-rose-200">
                            {tasksError}
                        </div>
                    ) : paginatedTasks.length ? (
                        <>
                            <div className="hidden xl:block rounded-3xl border auth-border auth-surface px-6 py-6 space-y-2">
                                {paginatedTasks.map((task) => {
                                    const status = String(task.status || "—")
                                        .toUpperCase()
                                        .replace(/\s+/g, "_");

                                    const priority = String(task.priority || "—")
                                        .toUpperCase()
                                        .replace(/\s+/g, "_");

                                    const assignee = resolveAssignee(task);
                                    const project =
                                        projectMap.get(String(task.project_id)) ||
                                        null;

                                    const priorityClass =
                                        priority === "HIGH"
                                            ? "border-rose-400/40 bg-rose-400/10 text-rose-200"
                                            : priority === "LOW"
                                              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                                              : "border-amber-400/40 bg-amber-400/10 text-amber-200";

                                    return (
                                        <div
                                            key={task.id}
                                            className="grid grid-cols-[2.75fr_2.5fr_1fr_1.5fr_1fr_0.75fr] items-center gap-3 py-1"
                                        >
                                            <div className="min-w-0 text-sm auth-text-primary">
                                                <p
                                                    className="mb-1 truncate font-semibold"
                                                    title={
                                                        task.title ||
                                                        `Task #${task.id}`
                                                    }
                                                >
                                                    {task.title ||
                                                        `Task #${task.id}`}
                                                </p>
                                                <span
                                                    className="block truncate text-gray-500"
                                                    title={task.description || "—"}
                                                >
                                                    {task.description || "—"}
                                                </span>
                                            </div>

                                            <Link
                                                to={`/projects/${task.project_id}`}
                                                className="truncate text-sm auth-text-primary underline underline-offset-4"
                                                title={
                                                    project?.title ||
                                                    `Project #${task.project_id}`
                                                }
                                            >
                                                {project?.title ||
                                                    `Project #${task.project_id}`}
                                            </Link>

                                            <p className="text-sm auth-text-secondary">
                                                {formatDeadline(task.due_date)}
                                            </p>

                                            {assignee ? (
                                                <div className="min-w-0 flex items-center gap-2">
                                                    <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-slate-800/70 flex items-center justify-center">
                                                        {assignee.avatar_path ? (
                                                            <img
                                                                src={
                                                                    assignee.avatar_path
                                                                }
                                                                alt={
                                                                    assignee.full_name ||
                                                                    "Assignee"
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <UserRound
                                                                size={16}
                                                                className="text-slate-400"
                                                            />
                                                        )}
                                                    </div>

                                                    <Link
                                                        to={`/members/${assignee.id}`}
                                                        className="truncate text-sm auth-text-primary underline underline-offset-4"
                                                        title={
                                                            assignee.full_name ||
                                                            "Member"
                                                        }
                                                    >
                                                        {assignee.full_name ||
                                                            "Member"}
                                                    </Link>
                                                </div>
                                            ) : (
                                                <span className="text-sm auth-text-secondary">
                                                    Unassigned
                                                </span>
                                            )}

                                            <span className="w-fit rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200">
                                                {status}
                                            </span>

                                            <span
                                                className={`w-fit rounded-full border px-4 py-2 text-xs font-semibold ${priorityClass}`}
                                            >
                                                {priority}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="space-y-3 xl:hidden">
                                {paginatedTasks.map((task) => {
                                    const status = String(task.status || "—")
                                        .toUpperCase()
                                        .replace(/\s+/g, "_");

                                    const priority = String(task.priority || "—")
                                        .toUpperCase()
                                        .replace(/\s+/g, "_");

                                    const assignee = resolveAssignee(task);
                                    const project =
                                        projectMap.get(String(task.project_id)) ||
                                        null;

                                    const priorityClass =
                                        priority === "HIGH"
                                            ? "border-rose-400/40 bg-rose-400/10 text-rose-200"
                                            : priority === "LOW"
                                              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                                              : "border-amber-400/40 bg-amber-400/10 text-amber-200";

                                    return (
                                        <div
                                            key={task.id}
                                            className="max-w-full rounded-2xl border auth-border auth-surface p-3 space-y-3 sm:p-4"
                                        >
                                            <div className="min-w-0">
                                                <p
                                                    className="truncate text-sm font-semibold auth-text-primary"
                                                    title={
                                                        task.title ||
                                                        `Task #${task.id}`
                                                    }
                                                >
                                                    {task.title || `Task #${task.id}`}
                                                </p>
                                                <p
                                                    className="mt-1 break-words text-xs auth-text-secondary"
                                                    title={task.description || "—"}
                                                >
                                                    {task.description || "—"}
                                                </p>
                                            </div>
                                            <Link
                                                to={`/projects/${task.project_id}`}
                                                className="block break-words text-xs auth-text-primary underline underline-offset-4"
                                            >
                                                {project?.title ||
                                                    `Project #${task.project_id}`}
                                            </Link>
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <p className="text-xs auth-text-secondary">
                                                    {formatDeadline(task.due_date)}
                                                </p>
                                                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                                    {status}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                                {assignee ? (
                                                    <div className="min-w-0 flex max-w-full items-center gap-2">
                                                        <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-slate-800/70 flex items-center justify-center">
                                                            {assignee.avatar_path ? (
                                                                <img
                                                                    src={
                                                                        assignee.avatar_path
                                                                    }
                                                                    alt={
                                                                        assignee.full_name ||
                                                                        "Assignee"
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <UserRound
                                                                    size={14}
                                                                    className="text-slate-400"
                                                                />
                                                            )}
                                                        </div>
                                                        <Link
                                                            to={`/members/${assignee.id}`}
                                                            className="truncate text-xs auth-text-primary underline underline-offset-4"
                                                            title={
                                                                assignee.full_name ||
                                                                "Member"
                                                            }
                                                        >
                                                            {assignee.full_name ||
                                                                "Member"}
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs auth-text-secondary">
                                                        Unassigned
                                                    </span>
                                                )}
                                                <div className="w-full sm:w-auto">
                                                    <span
                                                        className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${priorityClass}`}
                                                    >
                                                        {priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="rounded-3xl border auth-border auth-surface px-6 py-6 text-sm auth-text-secondary">
                            No tasks found for this tab.
                        </div>
                    )}

                    <div className="flex flex-col gap-3 px-1 py-0 sm:px-4 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm auth-text-secondary">
                            Showing {showingFrom} - {showingTo} of{" "}
                            {totalTaskRows}
                        </p>
                        <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
                            <select
                                value={tasksPageSize}
                                onChange={(e) =>
                                    setTasksPageSize(Number(e.target.value))
                                }
                                className="rounded-full border auth-border bg-white/5 px-3 py-2 text-xs auth-text-primary sm:min-w-20 sm:text-sm"
                            >
                                {[5, 10, 20, 50].map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() =>
                                    setTasksPage((prev) =>
                                        Math.max(prev - 1, 1),
                                    )
                                }
                                disabled={tasksPage <= 1}
                                className="rounded-full border auth-border px-3 py-2 text-xs font-semibold auth-text-primary disabled:opacity-50 sm:text-sm"
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setTasksPage((prev) =>
                                        Math.min(prev + 1, totalTaskPages),
                                    )
                                }
                                disabled={tasksPage >= totalTaskPages}
                                className="rounded-full border auth-border px-3 py-2 text-xs font-semibold auth-text-primary disabled:opacity-50 sm:text-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
