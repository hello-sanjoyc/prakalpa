import React from "react";
import usePageTitle from "../lib/usePageTitle";

const tasks = [
    { title: "Finalize sprint scope", assignee: "Amari", status: "In progress", tags: ["Planning", "Critical"] },
    { title: "Data model review", assignee: "Leo", status: "Review", tags: ["Data", "Quality"] },
    { title: "Update onboarding emails", assignee: "Sara", status: "Blocked", tags: ["CX", "Content"] },
];

const columns = ["Backlog", "In progress", "Review", "Blocked"];

export default function Tasks() {
    usePageTitle("Tasks");
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                        Execution
                    </p>
                    <h2 className="text-3xl font-semibold auth-text-primary">Tasks</h2>
                    <p className="mt-2 text-sm auth-text-secondary">
                        Mirrors the kanban cues shown on the landing demo—organized for authenticated
                        users with status and tags.
                    </p>
                </div>
                <button className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary transition hover:-translate-y-0.5">
                    Add task
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {columns.map((col, idx) => (
                    <div
                        key={col}
                        className="rounded-3xl border auth-border auth-surface p-4 auth-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                <p className="text-sm font-semibold auth-text-primary">{col}</p>
                            </div>
                            <span className="text-xs auth-text-secondary">
                                {idx === 0 ? "12" : idx === 1 ? "9" : idx === 2 ? "3" : "2"}
                            </span>
                        </div>
                        <div className="mt-3 space-y-3">
                            {tasks
                                .filter((_, taskIdx) => taskIdx % columns.length === idx) // distribute for demo
                                .map((task) => (
                                    <div
                                        key={`${task.title}-${col}`}
                                        className="rounded-2xl border auth-border auth-surface px-3 py-3"
                                    >
                                        <p className="text-sm font-semibold auth-text-primary">
                                            {task.title}
                                        </p>
                                        <p className="text-xs auth-text-secondary">Owner: {task.assignee}</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {[task.status, ...task.tags].map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full bg-amber-300/20 px-2 py-1 text-[11px] font-semibold auth-accent"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
