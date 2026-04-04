import React from "react";
import { formatDateTime } from "../../utility/helper";

export default function ProjectActions({
    actionsSearchInput,
    setActionsSearchInput,
    actionsSortBy,
    setActionsSortBy,
    actionsSortOrder,
    setActionsSortOrder,
    actionsLoading,
    actionsError,
    actions,
    actionsPagination,
    actionsPage,
    actionsPageSize,
    setActionsPage,
    setActionsPageSize,
}) {
    return (
        <div className="mt-5 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <input
                    value={actionsSearchInput}
                    onChange={(e) =>
                        setActionsSearchInput(e.target.value)
                    }
                    placeholder="Search activities..."
                    className="w-full rounded-full border auth-border bg-white/5 px-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 md:w-64"
                />
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={actionsSortBy}
                        onChange={(e) => setActionsSortBy(e.target.value)}
                        className="rounded-full border auth-border bg-white/5 px-3 py-2 text-xs text-slate-200"
                    >
                        <option value="title">Title</option>
                        <option value="status">Status</option>
                        <option value="due_date">Due Date</option>
                        <option value="task">Task</option>
                    </select>
                    <button
                        type="button"
                        onClick={() =>
                            setActionsSortOrder((prev) =>
                                prev === "asc" ? "desc" : "asc",
                            )
                        }
                        className="rounded-full border auth-border bg-white/5 px-3 py-2 text-xs text-slate-200"
                    >
                        {actionsSortOrder === "asc" ? "Asc" : "Desc"}
                    </button>
                </div>
            </div>
            {actionsLoading ? (
                <p className="text-sm auth-text-secondary">
                    Loading activities...
                </p>
            ) : actionsError ? (
                <p className="text-sm text-rose-200">{actionsError}</p>
            ) : actions.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {actions.map((action) => (
                        <div
                            key={action.id}
                            className="rounded-2xl border auth-border bg-slate-900/30 p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold auth-text-primary">
                                        {action.title}
                                    </p>
                                    <p className="mt-1 text-xs auth-text-secondary">
                                        {action.task_title || "Task"}
                                    </p>
                                    <p className="mt-1 text-xs auth-text-secondary">
                                        Due{" "}
                                        {formatDateTime(action.due_date) ||
                                            "—"}
                                    </p>
                                </div>
                                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-slate-300">
                                    {action.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm auth-text-secondary">
                    No activities found.
                </p>
            )}
            {actionsPagination ? (
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs auth-text-secondary">
                        Showing{" "}
                        <span className="text-slate-200">
                            {actions.length
                                ? (actionsPage - 1) * actionsPageSize + 1
                                : 0}
                        </span>{" "}
                        -{" "}
                        <span className="text-slate-200">
                            {(actionsPage - 1) * actionsPageSize +
                                actions.length}
                        </span>{" "}
                        of{" "}
                        <span className="text-slate-200">
                            {actionsPagination.total || 0}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={actionsPageSize}
                            onChange={(e) => {
                                setActionsPageSize(Number(e.target.value));
                                setActionsPage(1);
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
                                setActionsPage((p) => Math.max(p - 1, 1))
                            }
                            disabled={actionsPage <= 1}
                            className="rounded-full border auth-border bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setActionsPage((p) =>
                                    Math.min(
                                        p + 1,
                                        actionsPagination.totalPages || p + 1,
                                    ),
                                )
                            }
                            disabled={
                                actionsPage >=
                                (actionsPagination.totalPages || 1)
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
