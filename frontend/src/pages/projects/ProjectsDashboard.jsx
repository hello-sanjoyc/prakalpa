import React from "react";
import usePageTitle from "../../lib/usePageTitle";

const portfolioStats = [
    { label: "Active Projects", value: 12, accent: "from-emerald-300 to-cyan-400" },
    { label: "At Risk", value: 3, accent: "from-amber-300 to-orange-400" },
    { label: "Completed YTD", value: 9, accent: "from-indigo-300 to-fuchsia-400" },
    { label: "Total Budget", value: "$14.8M", accent: "from-sky-300 to-blue-500" },
];

const timelines = [
    { name: "Port Modernization", progress: 0.82, owner: "N. Qureshi", due: "Aug 12" },
    { name: "Highway Corridor", progress: 0.61, owner: "L. Gomez", due: "Sep 01" },
    { name: "Rural Internet", progress: 0.37, owner: "S. Iyer", due: "Oct 20" },
    { name: "Water Grid", progress: 0.24, owner: "M. Yeoh", due: "Dec 05" },
];

const radarLabels = ["Budget", "Timeline", "Quality", "Stakeholders", "Risk"];

export default function ProjectsDashboard() {
    usePageTitle("Project Portfolio");

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] auth-accent">Portfolio</p>
                    <h1 className="text-3xl font-semibold auth-text-primary">Project dashboard</h1>
                    <p className="mt-2 text-sm auth-text-secondary">
                        Snapshot across delivery, risk, and budget to keep leadership in sync.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary">
                        Export
                    </button>
                    <button className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30">
                        New project
                    </button>
                </div>
            </header>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {portfolioStats.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-2xl border auth-border auth-surface p-4 shadow-sm auth-shadow"
                    >
                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">{item.label}</p>
                        <p className="mt-3 text-3xl font-semibold auth-text-primary">{item.value}</p>
                        <div className="mt-3 h-1.5 rounded-full bg-white/10">
                            <div
                                className={`h-1.5 rounded-full bg-gradient-to-r ${item.accent}`}
                                style={{ width: "78%" }}
                            />
                        </div>
                    </div>
                ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <div className="rounded-3xl border auth-border auth-surface p-6 xl:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">Timeline</p>
                            <h3 className="text-xl font-semibold auth-text-primary">Execution radar</h3>
                            <p className="text-sm auth-text-secondary">Delivery health across criteria.</p>
                        </div>
                        <span className="rounded-full border auth-border px-3 py-1 text-xs font-semibold auth-text-primary">
                            Updated 2h ago
                        </span>
                    </div>
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <div className="rounded-2xl border auth-border auth-surface p-4">
                            <div className="flex items-center justify-between text-sm auth-text-secondary">
                                <span>Coverage</span>
                                <span>78%</span>
                            </div>
                            <div className="mt-4 h-2 rounded-full bg-white/10">
                                <div className="h-2 w-[78%] rounded-full bg-gradient-to-r from-emerald-300 via-sky-400 to-blue-500" />
                            </div>
                            <ul className="mt-4 space-y-2 text-sm auth-text-secondary">
                                {radarLabels.map((label) => (
                                    <li key={label} className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-white/50" />
                                        {label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-3">
                            {timelines.map((row) => (
                                <div
                                    key={row.name}
                                    className="rounded-2xl border auth-border auth-surface px-4 py-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold auth-text-primary">{row.name}</p>
                                            <p className="text-xs auth-text-secondary">
                                                Owner: {row.owner} · Due {row.due}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80">
                                            {Math.round(row.progress * 100)}%
                                        </span>
                                    </div>
                                    <div className="mt-3 h-1.5 rounded-full bg-white/10">
                                        <div
                                            className="h-1.5 rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400"
                                            style={{ width: `${row.progress * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border auth-border auth-surface p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">Risks</p>
                            <h3 className="text-xl font-semibold auth-text-primary">Watchlist</h3>
                        </div>
                        <span className="rounded-full border auth-border px-3 py-1 text-xs font-semibold auth-text-primary">
                            3 at risk
                        </span>
                    </div>
                    {[
                        { title: "Funding approval delay", owner: "Finance", severity: "High" },
                        { title: "Vendor onboarding backlog", owner: "Procurement", severity: "Medium" },
                        { title: "Data quality gaps", owner: "PMO", severity: "Medium" },
                    ].map((risk) => (
                        <div key={risk.title} className="rounded-2xl border auth-border auth-surface px-4 py-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold auth-text-primary">{risk.title}</p>
                                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/70">
                                    {risk.severity}
                                </span>
                            </div>
                            <p className="mt-1 text-xs auth-text-secondary">Owner: {risk.owner}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
