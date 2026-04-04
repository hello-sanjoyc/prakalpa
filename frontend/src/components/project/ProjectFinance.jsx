import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { formatDateTime, formatMoney } from "../../utility/helper";

export default function ProjectFinance({
    financesSearchInput,
    setFinancesSearchInput,
    financesSortBy,
    setFinancesSortBy,
    financesSortOrder,
    setFinancesSortOrder,
    financesLoading,
    financesError,
    finances,
    financesPagination,
    financesPage,
    financesPageSize,
    setFinancesPage,
    setFinancesPageSize,
    project,
    openFinanceEdit,
    handleDeleteFinance,
}) {
    const budgetValue =
        project?.budget === null || project?.budget === undefined
            ? null
            : Number(project.budget);
    const allocatedTotal =
        project?.fund_allocated === null ||
        project?.fund_allocated === undefined
            ? 0
            : Number(project.fund_allocated);
    const consumedTotal =
        project?.fund_consumed === null || project?.fund_consumed === undefined
            ? 0
            : Number(project.fund_consumed);
    const remaining = budgetValue != null ? budgetValue - allocatedTotal : null;

    return (
        <div className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border auth-border bg-slate-900/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                        Budget (₹ Crore)
                    </p>
                    <p className="mt-2 text-sm auth-text-primary">
                        {budgetValue != null && Number.isFinite(budgetValue)
                            ? formatMoney(budgetValue)
                            : "—"}
                    </p>
                </div>
                <div className="rounded-2xl border auth-border bg-slate-900/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                        Total Allocated (₹ Crore)
                    </p>
                    <p className="mt-2 text-sm auth-text-primary">
                        {formatMoney(allocatedTotal || 0)}
                    </p>
                </div>
                <div className="rounded-2xl border auth-border bg-slate-900/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                        Total Expenses (₹ Crore)
                    </p>
                    <p className="mt-2 text-sm auth-text-primary">
                        {formatMoney(consumedTotal || 0)}
                    </p>
                </div>
                <div className="rounded-2xl border auth-border bg-slate-900/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                        Remaining Budget (₹ Crore)
                    </p>
                    <p className="mt-2 text-sm auth-text-primary">
                        {remaining != null && Number.isFinite(remaining)
                            ? formatMoney(Math.max(remaining, 0))
                            : "—"}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <input
                    value={financesSearchInput}
                    onChange={(e) => setFinancesSearchInput(e.target.value)}
                    placeholder="Search finance entries..."
                    className="w-full rounded-full border auth-border bg-white/5 px-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 md:w-64"
                />
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={financesSortBy}
                        onChange={(e) => setFinancesSortBy(e.target.value)}
                        className="rounded-full border auth-border bg-white/5 px-3 py-2 text-xs text-slate-200"
                    >
                        <option value="entry_date">Date</option>
                        <option value="fund_allocated">
                            Allocated (₹ Crore)
                        </option>
                        <option value="fund_consumed">
                            Expenses (₹ Crore)
                        </option>
                        <option value="created_at">Created</option>
                    </select>
                    <button
                        type="button"
                        onClick={() =>
                            setFinancesSortOrder((prev) =>
                                prev === "asc" ? "desc" : "asc",
                            )
                        }
                        className="rounded-full border auth-border bg-white/5 px-3 py-2 text-xs text-slate-200"
                    >
                        {financesSortOrder === "asc" ? "Asc" : "Desc"}
                    </button>
                </div>
            </div>

            <div className="hidden md:block overflow-x-auto overflow-y-hidden">
                <div className="min-w-[860px] space-y-2">
                    <div className="grid grid-cols-[1fr_1fr_1fr_2fr_0.6fr] gap-3 rounded-2xl border auth-border bg-white/5 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] auth-accent">
                        <span>Date</span>
                        <span>Allocated (₹ Cr.)</span>
                        <span>Expenses (₹ Cr.)</span>
                        <span>Note</span>
                        <span>Actions</span>
                    </div>
                    {financesLoading ? (
                        <p className="text-sm auth-text-secondary">
                            Loading finance entries...
                        </p>
                    ) : financesError ? (
                        <p className="text-sm text-rose-200">{financesError}</p>
                    ) : finances.length ? (
                        finances.map((entry) => (
                            <div
                                key={entry.id}
                                className="grid items-center grid-cols-[1fr_1fr_1fr_2fr_0.6fr] gap-3 rounded-2xl border auth-border bg-slate-900/30 px-4 py-3 text-sm auth-text-primary"
                            >
                                <div className="text-xs auth-text-secondary">
                                    {formatDateTime(entry.entry_date) || "—"}
                                </div>
                                <div className="text-xs auth-text-secondary">
                                    {formatMoney(entry.fund_allocated || 0)}
                                </div>
                                <div className="text-xs auth-text-secondary">
                                    {formatMoney(entry.fund_consumed || 0)}
                                </div>
                                <div className="text-xs auth-text-secondary">
                                    {entry.note || "—"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openFinanceEdit(entry)}
                                        className="rounded-full border auth-border bg-white/5 p-2 text-slate-200"
                                        title="Edit finance"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteFinance(entry)
                                        }
                                        className="rounded-full border auth-border bg-white/5 p-2 text-rose-200"
                                        title="Delete finance"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm auth-text-secondary">
                            No finance entries found.
                        </p>
                    )}
                </div>
            </div>
            <div className="space-y-3 md:hidden">
                {financesLoading ? (
                    <p className="text-sm auth-text-secondary">
                        Loading finance entries...
                    </p>
                ) : financesError ? (
                    <p className="text-sm text-rose-200">{financesError}</p>
                ) : finances.length ? (
                    finances.map((entry) => (
                        <div
                            key={entry.id}
                            className="rounded-2xl border auth-border bg-slate-900/30 p-4 space-y-3"
                        >
                            <div className="grid grid-cols-2 gap-2 text-xs auth-text-secondary">
                                <span>{formatDateTime(entry.entry_date) || "—"}</span>
                                <span>{formatMoney(entry.fund_allocated || 0)}</span>
                                <span>{formatMoney(entry.fund_consumed || 0)}</span>
                                <span>{entry.note || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => openFinanceEdit(entry)}
                                    className="rounded-full border auth-border bg-white/5 p-2 text-slate-200"
                                    title="Edit finance"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteFinance(entry)}
                                    className="rounded-full border auth-border bg-white/5 p-2 text-rose-200"
                                    title="Delete finance"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm auth-text-secondary">
                        No finance entries found.
                    </p>
                )}
            </div>

            {financesPagination ? (
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs auth-text-secondary">
                        Showing{" "}
                        <span className="text-slate-200">
                            {finances.length
                                ? (financesPage - 1) * financesPageSize + 1
                                : 0}
                        </span>{" "}
                        -{" "}
                        <span className="text-slate-200">
                            {(financesPage - 1) * financesPageSize +
                                finances.length}
                        </span>{" "}
                        of{" "}
                        <span className="text-slate-200">
                            {financesPagination.total || 0}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={financesPageSize}
                            onChange={(e) => {
                                setFinancesPageSize(Number(e.target.value));
                                setFinancesPage(1);
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
                                setFinancesPage((p) => Math.max(p - 1, 1))
                            }
                            disabled={financesPage <= 1}
                            className="rounded-full border auth-border bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setFinancesPage((p) =>
                                    Math.min(
                                        p + 1,
                                        financesPagination.totalPages || p + 1,
                                    ),
                                )
                            }
                            disabled={
                                financesPage >=
                                (financesPagination.totalPages || 1)
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
