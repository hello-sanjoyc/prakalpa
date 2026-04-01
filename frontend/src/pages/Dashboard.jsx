import React from "react";
import usePageTitle from "../lib/usePageTitle";

const stats = [
    { label: "Active projects", value: "18", tone: "from-emerald-400/40 via-sky-400/30 to-indigo-400/30" },
    { label: "Tasks due this week", value: "64", tone: "from-amber-400/40 via-orange-400/30 to-rose-400/30" },
    { label: "Billable hours", value: "312h", tone: "from-indigo-400/40 via-purple-400/30 to-rose-400/30" },
];

const health = [
    { title: "Delivery health", status: "On track", metric: "92%", color: "text-emerald-200" },
    { title: "Risk alerts", status: "2 flags", metric: "Medium", color: "auth-accent" },
    { title: "Client satisfaction", status: "NPS 62", metric: "↑ 4", color: "text-emerald-200" },
];

export default function Dashboard() {
    usePageTitle("Dashboard");
    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] auth-accent">Overview</p>
                    <h2 className="text-3xl font-semibold auth-text-primary">Dashboard</h2>
                    <p className="mt-2 max-w-2xl text-sm auth-text-secondary">
                        Auth layout for team members. Summaries mirror the Taskly-style hero: delivery pulse,
                        risks, and billable views in one place.
                    </p>
                </div>
                <div className="rounded-full auth-surface border auth-border px-4 py-2 text-xs font-semibold auth-text-primary">
                    Updated 5 min ago
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="relative overflow-hidden rounded-3xl border auth-border auth-surface p-5 auth-shadow"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.tone} opacity-60 blur-3xl`} />
                        <div className="relative z-10">
                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                {stat.label}
                            </p>
                            <p className="mt-3 text-3xl font-semibold auth-text-primary">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
                <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">Workstreams</p>
                            <h3 className="text-xl font-semibold auth-text-primary">Milestone health</h3>
                        </div>
                        <span className="rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                            Tracking
                        </span>
                    </div>
                    <div className="mt-6 space-y-4">
                        {["Platform revamp", "Data warehouse", "Client onboarding"].map((item, idx) => (
                            <div key={item} className="rounded-2xl border auth-border auth-surface p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                        <p className="text-sm font-semibold auth-text-primary">{item}</p>
                                    </div>
                                    <p className="text-xs auth-text-secondary">
                                        {idx === 0 ? "8/10 milestones" : idx === 1 ? "5/7 milestones" : "3/6 milestones"}
                                    </p>
                                </div>
                                <div className="mt-3 h-2 rounded-full bg-white/10">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400"
                                        style={{
                                            width: idx === 0 ? "82%" : idx === 1 ? "68%" : "52%",
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                    <p className="text-xs uppercase tracking-[0.2em] auth-accent">Signals</p>
                    <h3 className="mt-2 text-xl font-semibold auth-text-primary">Health summary</h3>
                    <div className="mt-4 space-y-3">
                        {health.map((item) => (
                            <div
                                key={item.title}
                                className="flex items-center justify-between rounded-2xl border auth-border auth-surface px-4 py-3"
                            >
                                <div>
                                    <p className="text-sm font-semibold auth-text-primary">{item.title}</p>
                                    <p className="text-xs auth-text-secondary">{item.status}</p>
                                </div>
                                <span className={`text-sm font-semibold ${item.color}`}>{item.metric}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
