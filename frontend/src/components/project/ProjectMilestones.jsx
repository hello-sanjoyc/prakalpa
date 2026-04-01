import React from "react";
import { Pencil, Trash2 } from "lucide-react";

const getMilestoneDateParts = (dueDate) => {
    if (!dueDate) return { day: "--", month: "—" };
    const parsed = new Date(dueDate);
    if (Number.isNaN(parsed.getTime())) {
        return { day: "--", month: "—" };
    }
    return {
        day: parsed.getDate(),
        month: parsed.toLocaleString("en-US", { month: "short" }),
    };
};

export default function ProjectMilestones({
    milestonesSearchInput,
    setMilestonesSearchInput,
    milestonesSortBy,
    setMilestonesSortBy,
    milestonesSortOrder,
    setMilestonesSortOrder,
    milestonesLoading,
    milestonesError,
    milestones,
    milestonesPagination,
    milestonesPage,
    milestonesPageSize,
    setMilestonesPage,
    setMilestonesPageSize,
    openMilestoneEdit,
    handleDeleteMilestone,
}) {
    return (
        <div className="mt-5 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <input
                    value={milestonesSearchInput}
                    onChange={(e) => setMilestonesSearchInput(e.target.value)}
                    placeholder="Search milestones..."
                    className="w-full rounded-full border auth-border bg-white/5 px-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 md:w-64"
                />
                <div className="flex items-center gap-2">
                    <select
                        value={milestonesSortBy}
                        onChange={(e) => setMilestonesSortBy(e.target.value)}
                        className="rounded-full border auth-border bg-white/5 px-3 py-2 text-xs text-slate-200"
                    >
                        <option value="title">Title</option>
                        <option value="status">Status</option>
                        <option value="due_date">Due Date</option>
                    </select>
                    <button
                        type="button"
                        onClick={() =>
                            setMilestonesSortOrder((prev) =>
                                prev === "asc" ? "desc" : "asc",
                            )
                        }
                        className="rounded-full border auth-border bg-white/5 px-3 py-2 text-xs text-slate-200"
                    >
                        {milestonesSortOrder === "asc" ? "Asc" : "Desc"}
                    </button>
                </div>
            </div>
            {milestonesLoading ? (
                <p className="text-sm auth-text-secondary">
                    Loading milestones...
                </p>
            ) : milestonesError ? (
                <p className="text-sm text-rose-200">{milestonesError}</p>
            ) : milestones.length ? (
                <div className="space-y-3">
                    {milestones.map((milestone) => {
                        const dateParts = getMilestoneDateParts(
                            milestone.due_date,
                        );
                        return (
                            <div key={milestone.id} className="relative ">
                                <div className="rounded-2xl border auth-border bg-slate-900/30 px-4 py-3 pl-20">
                                    <div className="absolute -left-4 top-1/2 -translate-y-1/2">
                                        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border auth-border bg-slate-950/70 text-center shadow-lg">
                                            <p className="text-xl font-semibold auth-text-primary">
                                                {dateParts.day}
                                            </p>
                                            <p className="text-[11px] uppercase tracking-[0.2em] auth-accent">
                                                {dateParts.month}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-semibold auth-text-primary">
                                                {milestone.title}
                                            </p>
                                            <p>
                                                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-slate-300">
                                                    {milestone.status}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openMilestoneEdit(
                                                            milestone,
                                                        )
                                                    }
                                                    className="rounded-full border auth-border bg-white/5 p-2 text-slate-200"
                                                    title="Edit milestone"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteMilestone(
                                                            milestone,
                                                        )
                                                    }
                                                    className="rounded-full border auth-border bg-white/5 p-2 text-rose-200"
                                                    title="Delete milestone"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-sm auth-text-secondary">
                    No milestones found.
                </p>
            )}
            {milestonesPagination ? (
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs auth-text-secondary">
                        Showing{" "}
                        <span className="text-slate-200">
                            {milestones.length
                                ? (milestonesPage - 1) * milestonesPageSize + 1
                                : 0}
                        </span>{" "}
                        -{" "}
                        <span className="text-slate-200">
                            {(milestonesPage - 1) * milestonesPageSize +
                                milestones.length}
                        </span>{" "}
                        of{" "}
                        <span className="text-slate-200">
                            {milestonesPagination.total || 0}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={milestonesPageSize}
                            onChange={(e) => {
                                setMilestonesPageSize(Number(e.target.value));
                                setMilestonesPage(1);
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
                                setMilestonesPage((p) => Math.max(p - 1, 1))
                            }
                            disabled={milestonesPage <= 1}
                            className="rounded-full border auth-border bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setMilestonesPage((p) =>
                                    Math.min(
                                        p + 1,
                                        milestonesPagination.totalPages ||
                                            p + 1,
                                    ),
                                )
                            }
                            disabled={
                                milestonesPage >=
                                (milestonesPagination.totalPages || 1)
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
