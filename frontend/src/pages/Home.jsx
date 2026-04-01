import React from "react";
import usePageTitle from "../lib/usePageTitle";

const heroHighlights = [
    { title: "Project DNA", desc: "OKRs, roadmaps, and epics in one place." },
    {
        title: "Team heartbeat",
        desc: "Capacity-aware sprints with live health.",
    },
    {
        title: "Smart billing",
        desc: "Time, expenses, and invoices stay in sync.",
    },
];

const featureCards = [
    {
        title: "Unified workspace",
        desc: "Boards, timelines, docs, and approvals stitched together so teams never lose context.",
        badge: "Plan",
    },
    {
        title: "Execution clarity",
        desc: "Status by owner, risk, and effort with rollups for programs and portfolios.",
        badge: "Track",
    },
    {
        title: "Collaboration engine",
        desc: "Comments, decisions, and handoffs live beside the work—not buried in chat history.",
        badge: "Collaborate",
    },
    {
        title: "Governance ready",
        desc: "Audit-ready history, controls by role, and templates that enforce how your org ships.",
        badge: "Control",
    },
];

const modules = [
    {
        name: "Projects & Portfolios",
        desc: "Set outcomes, map milestones, and give leadership a crisp pulse.",
        tag: "Strategy",
    },
    {
        name: "Tasks & Sprints",
        desc: "Velocity-aware planning, WIP limits, and automation for repetitive work.",
        tag: "Delivery",
    },
    {
        name: "Documents & Decisions",
        desc: "Lightweight briefs, meeting notes, and approvals tied directly to tasks.",
        tag: "Knowledge",
    },
    {
        name: "Clients & Billing",
        desc: "Track time, expenses, and invoice states across retainers or fixed-fee work.",
        tag: "Revenue",
    },
];

const workflow = [
    {
        title: "Shape",
        desc: "Clarify the goal, constraints, and definition of done. Lock risks early.",
    },
    {
        title: "Plan",
        desc: "Capacity checks, sprint scaffolds, and milestone health at a glance.",
    },
    {
        title: "Deliver",
        desc: "Automations for intake, approvals, and handoffs keep momentum high.",
    },
    {
        title: "Measure",
        desc: "Outcome dashboards tie tasks and time back to business impact.",
    },
];

const faqs = [
    {
        q: "How close is this to the reference?",
        a: "The layout mirrors the sections of the Taskly showcase—hero, value props, modules, and FAQ—while using this project's visual system.",
    },
    {
        q: "Can we connect to our API?",
        a: "Yes. Point `VITE_API_BASE_URL` in `.env` to your backend to hydrate stats, projects, and billing data.",
    },
    {
        q: "Does it support role-based views?",
        a: "The UI honors the existing auth context; add guards per section if you need role-specific content.",
    },
    {
        q: "Is the layout responsive?",
        a: "Everything stacks gracefully on mobile with generous spacing and touch-friendly targets.",
    },
];

const brandPalette = [
    "from-amber-400/30 via-pink-500/20 to-indigo-500/30",
    "from-emerald-400/30 via-sky-400/20 to-indigo-500/30",
    "from-indigo-400/30 via-purple-500/20 to-rose-500/30",
];

function GradientBlob({ className }) {
    return (
        <div
            className={`absolute blur-3xl opacity-60 ${className}`}
            aria-hidden="true"
        />
    );
}

function SectionTitle({ eyebrow, title, subtitle }) {
    return (
        <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
                {eyebrow}
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                {title}
            </h2>
            <p className="mt-3 text-base text-slate-200 md:text-lg">
                {subtitle}
            </p>
        </div>
    );
}

function Card({ children }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.8)] backdrop-blur">
            {children}
        </div>
    );
}

export default function Home() {
    usePageTitle("Home");
    const appName = import.meta.env.VITE_APP_NAME || "PMS";

    return (
        <div className="relative overflow-hidden">
            <GradientBlob className="left-[-10%] top-[-10%] h-72 w-72 bg-gradient-to-br from-amber-400/30 via-rose-400/40 to-indigo-500/30" />
            <GradientBlob className="right-[-10%] top-[20%] h-80 w-80 bg-gradient-to-br from-emerald-400/20 via-sky-400/30 to-indigo-500/30" />
            <GradientBlob className="left-[20%] bottom-[-20%] h-96 w-96 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-rose-500/20" />

            <section className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-20 pt-16 md:pt-24">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-100">
                            Project operating system
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
                                Ship every project with confidence using{" "}
                                {appName}
                            </h1>
                            <p className="text-lg text-slate-200 md:text-xl">
                                Inspired by Taskly’s showcase—rebuilt for this
                                product. Capture strategy, execution, and
                                billing in one calm workspace teams love.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <a
                                href="#modules"
                                className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/30 transition hover:-translate-y-0.5 hover:bg-white"
                            >
                                Explore modules
                            </a>
                            <a
                                href="#demo"
                                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/40"
                            >
                                See live workspace
                            </a>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {heroHighlights.map((item, idx) => (
                                <Card key={item.title}>
                                    <p className="text-xs uppercase tracking-[0.2em] text-amber-200">
                                        {String(idx + 1).padStart(2, "0")}
                                    </p>
                                    <h3 className="mt-2 text-lg font-semibold text-white">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-200">
                                        {item.desc}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-amber-400/20 via-white/10 to-indigo-500/20 blur-3xl" />
                        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-amber-200">
                                        Health pulse
                                    </p>
                                    <h3 className="text-2xl font-semibold text-white mt-1">
                                        Programs dashboard
                                    </h3>
                                </div>
                                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                    97% on-track
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                {["Delivery", "Risks", "Billing"].map(
                                    (row, i) => (
                                        <div
                                            key={row}
                                            className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3"
                                        >
                                            <div
                                                className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${
                                                    brandPalette[
                                                        i % brandPalette.length
                                                    ]
                                                } flex items-center justify-center text-sm font-semibold text-white`}
                                            >
                                                {row[0]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-white">
                                                        {row}
                                                    </p>
                                                    <span className="text-xs text-slate-200">
                                                        {i === 0
                                                            ? "8/9 milestones"
                                                            : i === 1
                                                              ? "Low"
                                                              : "Invoiced"}
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-2 rounded-full bg-white/5">
                                                    <div
                                                        className="h-2 rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400"
                                                        style={{
                                                            width:
                                                                i === 0
                                                                    ? "88%"
                                                                    : i === 1
                                                                      ? "64%"
                                                                      : "72%",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                            <div className="mt-6 grid grid-cols-3 gap-3">
                                {[
                                    { label: "Active projects", value: "24" },
                                    { label: "Avg. cycle", value: "7.2d" },
                                    { label: "NPS", value: "62" },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                                    >
                                        <p className="text-xs uppercase tracking-[0.2em] text-amber-200">
                                            {item.label}
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-white">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="modules"
                className="relative mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-white/5 px-6 py-16 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur md:px-10"
            >
                <SectionTitle
                    eyebrow="Built for modern PMOs"
                    title="Every pillar of project tracking in one place"
                    subtitle="Reference-ready cards mirror the Taskly layout: modules, value props, and quick cues your stakeholders expect."
                />
                <div className="mt-10 grid gap-6 md:grid-cols-2">
                    {modules.map((mod, idx) => (
                        <div
                            key={mod.name}
                            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6"
                        >
                            <div className="absolute right-6 top-6 h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-300/50 via-pink-400/40 to-indigo-500/40 blur-xl" />
                            <div className="relative z-10">
                                <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                                    {mod.tag}
                                </div>
                                <h3 className="mt-3 text-xl font-semibold text-white">
                                    {mod.name}
                                </h3>
                                <p className="mt-2 text-sm text-slate-200">
                                    {mod.desc}
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-xs text-amber-100">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                    Ready-made templates and views
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section
                id="features"
                className="relative mx-auto max-w-6xl px-6 py-16 md:px-10"
            >
                <SectionTitle
                    eyebrow="Why teams choose this"
                    title="Clarity for leaders, calm for builders"
                    subtitle="From idea to invoice, every section is mapped to the Taskly-style story: simple, confident, and outcome-led."
                />
                <div className="mt-10 grid gap-6 md:grid-cols-2">
                    {featureCards.map((feature) => (
                        <Card key={feature.title}>
                            <div className="inline-flex rounded-full bg-amber-300/20 px-3 py-1 text-xs font-semibold text-amber-100">
                                {feature.badge}
                            </div>
                            <h3 className="mt-3 text-xl font-semibold text-white">
                                {feature.title}
                            </h3>
                            <p className="mt-2 text-sm text-slate-200">
                                {feature.desc}
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs text-amber-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                Built for distributed teams
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            <section
                id="workflow"
                className="relative mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-white/5 px-6 py-16 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur md:px-10"
            >
                <SectionTitle
                    eyebrow="Delivery rhythm"
                    title="A four-beat workflow the whole org understands"
                    subtitle="Keep the same cadence as the reference site: shape, plan, deliver, measure—each step with crisp, visual cues."
                />
                <div className="mt-10 grid gap-6 md:grid-cols-[1fr,1.2fr]">
                    <div className="space-y-4">
                        {workflow.map((step, idx) => (
                            <div
                                key={step.title}
                                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5"
                            >
                                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-300 via-pink-400 to-indigo-500" />
                                <div className="pl-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
                                            {String(idx + 1).padStart(2, "0")}
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">
                                            {step.title}
                                        </h3>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-200">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div
                        id="demo"
                        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-amber-300/10 via-white/5 to-indigo-500/10 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-amber-200">
                                    Live workspace
                                </p>
                                <h3 className="mt-1 text-2xl font-semibold text-white">
                                    Sprint cockpit
                                </h3>
                            </div>
                            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                Auto-updating
                            </div>
                        </div>
                        <div className="mt-6 space-y-3">
                            {[
                                "Backlog",
                                "In progress",
                                "Review",
                                "Blocked",
                            ].map((column, idx) => (
                                <div
                                    key={column}
                                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                            <p className="text-sm font-semibold text-white">
                                                {column}
                                            </p>
                                        </div>
                                        <span className="text-xs text-slate-200">
                                            {idx === 0
                                                ? "12 cards"
                                                : idx === 1
                                                  ? "9 cards"
                                                  : "3 cards"}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-200">
                                        <span className="rounded-full bg-amber-300/20 px-2 py-1 text-amber-100">
                                            SLA
                                        </span>
                                        <span className="rounded-full bg-emerald-300/20 px-2 py-1 text-emerald-100">
                                            Owner
                                        </span>
                                        <span className="rounded-full bg-indigo-400/20 px-2 py-1 text-indigo-100">
                                            Dependencies
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 grid grid-cols-3 gap-3">
                            {[
                                { label: "Burn-down", value: "Ahead" },
                                { label: "Risk alerts", value: "2" },
                                { label: "New notes", value: "14" },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                                >
                                    <p className="text-xs uppercase tracking-[0.2em] text-amber-200">
                                        {item.label}
                                    </p>
                                    <p className="mt-2 text-lg font-semibold text-white">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="faq"
                className="relative mx-auto max-w-6xl px-6 py-16 md:px-10"
            >
                <SectionTitle
                    eyebrow="Answers"
                    title="FAQs your buyers actually ask"
                    subtitle="Drop these into your sales deck or docs—the wording mirrors the Taskly page but is tuned to this stack."
                />
                <div className="mt-10 grid gap-6 md:grid-cols-2">
                    {faqs.map((item) => (
                        <Card key={item.q}>
                            <h3 className="text-lg font-semibold text-white">
                                {item.q}
                            </h3>
                            <p className="mt-2 text-sm text-slate-200">
                                {item.a}
                            </p>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="relative mx-auto max-w-6xl px-6 pb-16 md:px-10">
                <div className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-amber-300/15 via-white/10 to-indigo-500/15 px-8 py-10 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-3">
                            <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-100">
                                Launch-ready
                            </div>
                            <h3 className="text-3xl font-semibold text-white">
                                Ready to roll this out?
                            </h3>
                            <p className="text-slate-200">
                                Use the CTA structure from the reference page:
                                one tap to start, one tap to talk. No more
                                wandering home screens.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href="#"
                                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-white/30 transition hover:-translate-y-0.5"
                            >
                                Get started now
                            </a>
                            <a
                                href="#features"
                                className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/60"
                            >
                                See features
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
