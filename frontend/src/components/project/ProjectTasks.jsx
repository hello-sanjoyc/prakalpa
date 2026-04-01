import React from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDateTime, truncateString } from "../../utility/helper";

export default function ProjectTasks({
    tasksSearchInput,
    setTasksSearchInput,
    tasksSortBy,
    setTasksSortBy,
    tasksSortOrder,
    setTasksSortOrder,
    tasksLoading,
    tasksError,
    tasks,
    tasksPagination,
    tasksPage,
    tasksPageSize,
    setTasksPage,
    setTasksPageSize,
    expandedMilestones,
    setExpandedMilestones,
    openTaskDetail,
    openTaskEdit,
    handleDeleteTask,
    project,
}) {
    return (
        <div className="mt-5 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <input
                    value={tasksSearchInput}
                    onChange={(e) => setTasksSearchInput(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full rounded-full border auth-border bg-white/5 px-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 md:w-64"
                />
                <div className="flex items-center gap-2">
                    <select
                        value={tasksSortBy}
                        onChange={(e) => setTasksSortBy(e.target.value)}
                        className="rounded-full border auth-border bg-white/5 px-3 py-2 text-xs text-slate-200"
                    >
                        <option value="title">Title</option>
                        <option value="status">Status</option>
                        <option value="due_date">Due Date</option>
                        <option value="milestone">Milestone</option>
                    </select>
                    <button
                        type="button"
                        onClick={() =>
                            setTasksSortOrder((prev) =>
                                prev === "asc" ? "desc" : "asc",
                            )
                        }
                        className="rounded-full border auth-border bg-white/5 px-3 py-2 text-xs text-slate-200"
                    >
                        {tasksSortOrder === "asc" ? "Asc" : "Desc"}
                    </button>
                </div>
            </div>
            {tasksLoading ? (
                <p className="text-sm auth-text-secondary">Loading tasks...</p>
            ) : tasksError ? (
                <p className="text-sm text-rose-200">{tasksError}</p>
            ) : tasks.length ? (
                <div className="space-y-4">
                    {Array.from(
                        tasks
                            .reduce((acc, task) => {
                                const key = String(
                                    task.milestone_id ||
                                        task.milestone_title ||
                                        "unknown",
                                );
                                if (!acc.has(key)) {
                                    acc.set(key, {
                                        key,
                                        title:
                                            task.milestone_title ||
                                            `Milestone ${
                                                task.milestone_id || "—"
                                            }`,
                                        tasks: [],
                                    });
                                }
                                acc.get(key).tasks.push(task);
                                return acc;
                            }, new Map())
                            .values(),
                    ).map((group) => {
                        const isExpanded = expandedMilestones.includes(group.key);
                        return (
                            <div
                                key={group.key}
                                className="rounded-2xl border auth-border bg-slate-900/20 p-4"
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setExpandedMilestones((prev) =>
                                            prev.includes(group.key)
                                                ? prev.filter(
                                                      (entry) =>
                                                          entry !== group.key,
                                                  )
                                                : [...prev, group.key],
                                        )
                                    }
                                    className="flex w-full items-center justify-between gap-3 rounded-xl border auth-border bg-white/5 px-4 py-3 text-left"
                                >
                                    <div className="flex items-center gap-2 text-sm font-semibold auth-text-primary">
                                        {isExpanded ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                        <span>{group.title}</span>
                                    </div>
                                    <span className="text-xs auth-text-secondary">
                                        {group.tasks.length} task
                                        {group.tasks.length === 1 ? "" : "s"}
                                    </span>
                                </button>
                                {isExpanded ? (
                                    <div className="mt-4 overflow-x-auto overflow-y-hidden">
                                        <div className="min-w-[900px] space-y-3">
                                            <div className="grid grid-cols-[1.2fr_2fr_1fr_1fr_0.7fr_0.8fr_0.6fr] gap-3 rounded-2xl border auth-border bg-white/5 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] auth-accent">
                                                <span>Task name</span>
                                                <span>Description</span>
                                                <span>Deadline</span>
                                                <span>Assigned to</span>
                                                <span>Status</span>
                                                <span>Priority</span>
                                                <span>Actions</span>
                                            </div>
                                            {group.tasks.map((task) => {
                                                const ownerEntry =
                                                    project?.projectMembers?.find(
                                                        (entry) =>
                                                            entry.member_id ===
                                                                task.owner_id ||
                                                            entry.member?.id ===
                                                                task.owner_id,
                                                    ) || null;
                                                const owner =
                                                    ownerEntry?.member || null;
                                                const priority = (
                                                    task.priority || "MEDIUM"
                                                )
                                                    .toString()
                                                    .toUpperCase();
                                                const priorityStyles = {
                                                    LOW: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
                                                    MEDIUM: "bg-amber-500/15 text-amber-200 border-amber-400/30",
                                                    HIGH: "bg-rose-500/15 text-rose-200 border-rose-400/30",
                                                };
                                                return (
                                                    <div
                                                        key={task.id}
                                                        className="group grid items-center grid-cols-[1.2fr_2fr_1fr_1fr_0.7fr_0.8fr_0.6fr] gap-3 rounded-2xl border auth-border bg-slate-900/30 px-4 py-3 text-sm auth-text-primary"
                                                    >
                                                        <div>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openTaskDetail(
                                                                        task,
                                                                    )
                                                                }
                                                                className="text-left text-sm font-semibold auth-text-primary underline underline-offset-4"
                                                            >
                                                                {truncateString(
                                                                    task.title,
                                                                    30,
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div className="text-xs auth-text-secondary">
                                                            {truncateString(
                                                                task.description,
                                                                40,
                                                            ) || "—"}
                                                        </div>
                                                        <div className="text-xs auth-text-secondary">
                                                            {formatDateTime(
                                                                task.due_date,
                                                            ) || "—"}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-slate-800/70 flex items-center justify-center">
                                                                {owner?.avatar_path ? (
                                                                    <img
                                                                        src={
                                                                            owner.avatar_path
                                                                        }
                                                                        alt={
                                                                            owner.full_name ||
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
                                                            {owner ? (
                                                                <Link
                                                                    to={`/members/${
                                                                        owner.id ||
                                                                        ownerEntry?.member_id
                                                                    }`}
                                                                    className="text-xs auth-text-secondary underline underline-offset-4"
                                                                >
                                                                    {owner.full_name ||
                                                                        "Member"}
                                                                </Link>
                                                            ) : (
                                                                <span className="text-xs auth-text-secondary">
                                                                    Unassigned
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                                                {task.status ||
                                                                    "—"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span
                                                                className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                                                    priorityStyles[
                                                                        priority
                                                                    ] ||
                                                                    "bg-white/5 border-white/10 text-slate-200"
                                                                }`}
                                                            >
                                                                {priority}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openTaskEdit(
                                                                        task,
                                                                    )
                                                                }
                                                                className="rounded-full border auth-border bg-white/5 p-2 text-slate-200"
                                                                title="Edit task"
                                                            >
                                                                <Pencil
                                                                    size={14}
                                                                />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteTask(
                                                                        task,
                                                                    )
                                                                }
                                                                className="rounded-full border auth-border bg-white/5 p-2 text-rose-200"
                                                                title="Delete task"
                                                            >
                                                                <Trash2
                                                                    size={14}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-sm auth-text-secondary">No tasks found.</p>
            )}
            {tasksPagination ? (
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs auth-text-secondary">
                        Showing{" "}
                        <span className="text-slate-200">
                            {tasks.length
                                ? (tasksPage - 1) * tasksPageSize + 1
                                : 0}
                        </span>{" "}
                        -{" "}
                        <span className="text-slate-200">
                            {(tasksPage - 1) * tasksPageSize + tasks.length}
                        </span>{" "}
                        of{" "}
                        <span className="text-slate-200">
                            {tasksPagination.total || 0}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={tasksPageSize}
                            onChange={(e) => {
                                setTasksPageSize(Number(e.target.value));
                                setTasksPage(1);
                            }}
                            className="rounded-full border auth-border bg-white/5 px-3 py-1 text-xs text-slate-200"
                        >
                            {[5, 10, 25, 50, 100].map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() =>
                                setTasksPage((p) => Math.max(p - 1, 1))
                            }
                            disabled={tasksPage <= 1}
                            className="rounded-full border auth-border bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setTasksPage((p) =>
                                    Math.min(
                                        p + 1,
                                        tasksPagination.totalPages || p + 1,
                                    ),
                                )
                            }
                            disabled={
                                tasksPage >= (tasksPagination.totalPages || 1)
                            }
                            className="rounded-full border auth-border bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
