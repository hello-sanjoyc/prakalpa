import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SquarePen, Trash } from "lucide-react";
import usePageTitle from "../../lib/usePageTitle";
import { API_ENDPOINTS } from "../../lib/apiEndpoints";
import { apiRequest } from "../../lib/apiClient";
import {
    showError,
    showSuccess,
} from "../../components/common/AxToastMessage.jsx";
import Swal from "sweetalert2";

const statusBadge = {
    GREEN: "bg-green-500 text-emerald-100",
    AMBER: "bg-orange-500 text-amber-900",
    RED: "bg-red-500 text-rose-100",
};

export default function ProjectsList() {
    usePageTitle("Projects");
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pagination, setPagination] = useState(null);
    const [sortBy, setSortBy] = useState("title");
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const loadProjects = async (
        nextPage = page,
        nextSize = pageSize,
        nextSortBy = sortBy,
        nextSortOrder = sortOrder,
        nextSearch = searchQuery
    ) => {
        try {
            const params = new URLSearchParams({
                page: String(nextPage),
                limit: String(nextSize),
                sortBy: String(nextSortBy),
                sortOrder: String(nextSortOrder),
            });
            if (nextSearch) params.set("search", nextSearch);
            const res = await apiRequest(
                `${API_ENDPOINTS.PROJECTS}?${params.toString()}`,
                "GET"
            );
            const list = Array.isArray(res?.projects)
                ? res.projects
                : Array.isArray(res)
                ? res
                : [];
            setProjects(list);
            setPagination(res?.pagination || null);
            if (!list.length && res?.message) {
                setError(res.message);
            } else {
                setError(null);
            }
        } catch (err) {
            setError(err.message || "Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects(page, pageSize, sortBy, sortOrder, searchQuery);
    }, [page, pageSize, sortBy, sortOrder, searchQuery]);

    useEffect(() => {
        const handle = setTimeout(() => {
            setSearchQuery(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(handle);
    }, [searchInput]);

    const toggleSort = (key) => {
        if (sortBy === key) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(key);
            setSortOrder("asc");
        }
        setPage(1);
    };

    const handleDelete = async (projectId) => {
        const result = await Swal.fire({
            title: "Delete project?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            buttonsStyling: false,
            customClass: {
                popup: "rounded-2xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl",
                title: "text-lg font-semibold text-slate-100",
                htmlContainer: "text-sm text-slate-300",
                actions: "gap-3",
                confirmButton:
                    "rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-400",
                cancelButton:
                    "rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10",
            },
        });
        if (!result.isConfirmed) return;
        setDeletingId(projectId);
        try {
            await apiRequest(API_ENDPOINTS.PROJECT_DELETE(projectId), "DELETE");
            showSuccess("Project deleted.");
            const remaining = projects.length - 1;
            const nextTotal = Math.max((pagination?.total || 0) - 1, 0);
            const nextTotalPages = Math.ceil(nextTotal / pageSize) || 1;
            if (page > nextTotalPages) {
                setPage(nextTotalPages);
            } else if (remaining > 0) {
                setProjects((prev) =>
                    prev.filter((project) => project.id !== projectId)
                );
                setPagination((prev) =>
                    prev
                        ? {
                              ...prev,
                              total: nextTotal,
                              totalPages: nextTotalPages,
                          }
                        : prev
                );
            } else {
                loadProjects(page, pageSize, sortBy, sortOrder, searchQuery);
            }
        } catch (err) {
            showError(err.message || "Failed to delete project.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] auth-accent">
                        Projects
                    </p>
                    <h1 className="text-3xl font-semibold auth-text-primary">
                        All projects
                    </h1>
                    <p className="mt-2 text-sm auth-text-secondary">
                        Track status, ownership, and budgets across the
                        portfolio.
                    </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <div className="relative">
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search projects..."
                            className="w-full rounded-full border auth-border bg-white/5 px-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 sm:w-64"
                        />
                    </div>
                    <Link
                        to="/projects/dashboard"
                        className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/projects/new"
                        className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30"
                    >
                        New project
                    </Link>
                </div>
            </div>

            <div className="rounded-3xl border auth-border auth-surface auth-shadow overflow-hidden">
                <div className="hidden bg-white/5 px-6 py-3 text-xs tracking-[0.2em] auth-accent md:grid md:grid-cols-8">
                    <button
                        type="button"
                        onClick={() => toggleSort("title")}
                        className="col-span-2 flex items-center gap-2 text-left"
                    >
                        <span>Project</span>
                        {sortBy === "title" ? (
                            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        ) : null}
                    </button>
                    <button
                        type="button"
                        onClick={() => toggleSort("code")}
                        className="flex items-center gap-2 text-left"
                    >
                        <span>Code</span>
                        {sortBy === "code" ? (
                            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        ) : null}
                    </button>
                    <button
                        type="button"
                        onClick={() => toggleSort("department")}
                        className="flex items-center gap-2 text-left"
                    >
                        <span>Department</span>
                        {sortBy === "department" ? (
                            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        ) : null}
                    </button>
                    <button
                        type="button"
                        onClick={() => toggleSort("owner")}
                        className="flex items-center gap-2 text-left"
                    >
                        <span>Owner</span>
                        {sortBy === "owner" ? (
                            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        ) : null}
                    </button>
                    <button
                        type="button"
                        onClick={() => toggleSort("stage")}
                        className="flex items-center gap-2 text-left"
                    >
                        <span>Stage</span>
                        {sortBy === "stage" ? (
                            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        ) : null}
                    </button>
                    <button
                        type="button"
                        onClick={() => toggleSort("budget")}
                        className="flex items-center gap-2 text-left"
                    >
                        <span>Budget</span>
                        {sortBy === "budget" ? (
                            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        ) : null}
                    </button>
                    <span className="text-right">Actions</span>
                </div>
                {loading ? (
                    <div className="px-6 py-8 text-sm auth-text-secondary">
                        Loading projects...
                    </div>
                ) : error ? (
                    <div className="px-6 py-8 text-sm text-rose-200">
                        {error}
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="grid items-center gap-2 px-4 py-4 md:grid-cols-8 md:px-6"
                            >
                                <div className="col-span-2">
                                    <p className="text-sm font-semibold auth-text-primary flex items-center gap-2">
                                        <span
                                            className={`inline-block h-2.5 w-2.5 rounded-full ${
                                                statusBadge[
                                                    project.rag_status
                                                ] || "bg-white/30"
                                            }`}
                                            title={project.rag_status || "N/A"}
                                        />
                                        <Link
                                            to={`/projects/${project.id}`}
                                            className="underline underline-offset-4"
                                        >
                                            {project.title}
                                        </Link>
                                    </p>
                                </div>
                                <p className="text-sm auth-text-secondary">
                                    {project.code}
                                </p>
                                <p className="text-sm auth-text-secondary text-slate-200">
                                    {project.department_id ? (
                                        <Link
                                            to={`/departments/${project.department_id}`}
                                            className="text-slate-400 underline underline-offset-4"
                                        >
                                            {project.department_name ||
                                                project.department?.name ||
                                                "—"}
                                        </Link>
                                    ) : (
                                        "—"
                                    )}
                                </p>
                                <p className="text-sm auth-text-secondary text-slate-200">
                                    {project.owner_id ? (
                                        <Link
                                            to={`/members/${project.owner_id}`}
                                            className="text-slate-400 underline underline-offset-4"
                                        >
                                            {project.owner_name ||
                                                project.owner?.member
                                                    ?.full_name ||
                                                "—"}
                                        </Link>
                                    ) : (
                                        "—"
                                    )}
                                </p>
                                <span className="w-fit rounded-full px-3 py-1 text-[11px] font-semibold bg-white/10 text-slate-900 md:text-slate-400">
                                    {project.current_stage?.stage_slug ||
                                        project.currentStage?.stage_slug ||
                                        project.stage_slug ||
                                        "N/A"}
                                </span>
                                <p className="text-sm auth-text-secondary">
                                    {project.budget != null
                                        ? `${Number(
                                              project.budget
                                          ).toLocaleString()}`
                                        : "—"}
                                </p>
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        to={`/projects/${project.id}/edit`}
                                        className="mx-1 text-[11px] font-semibold text-slate-400 flex items-center gap-1"
                                        aria-label="Edit project"
                                    >
                                        <SquarePen size={14} strokeWidth={2} />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(project.id)}
                                        disabled={deletingId === project.id}
                                        className="rmx-1 text-[11px] font-semibold text-red-500 disabled:opacity-60 flex items-center gap-1"
                                        aria-label="Delete project"
                                    >
                                        <Trash size={14} strokeWidth={2} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!projects.length && (
                            <div className="px-6 py-8 text-sm auth-text-secondary">
                                No projects found.
                            </div>
                        )}
                    </div>
                )}
            </div>
            {pagination ? (
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs auth-text-secondary">
                        Showing{" "}
                        <span className="text-slate-200">
                            {projects.length ? (page - 1) * pageSize + 1 : 0}
                        </span>{" "}
                        -{" "}
                        <span className="text-slate-200">
                            {(page - 1) * pageSize + projects.length}
                        </span>{" "}
                        of{" "}
                        <span className="text-slate-200">
                            {pagination.total || 0}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-xs auth-text-secondary">
                            <span>Rows</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="rounded-full border auth-border bg-white/5 px-3 py-1 text-xs text-slate-200"
                            >
                                {[5, 10, 25, 50, 100, 200].map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setPage((p) => Math.max(p - 1, 1))
                                }
                                disabled={page <= 1}
                                className="rounded-full border auth-border bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="text-xs auth-text-secondary">
                                Page{" "}
                                <span className="text-slate-200">{page}</span>{" "}
                                of{" "}
                                <span className="text-slate-200">
                                    {pagination.totalPages || 1}
                                </span>
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(
                                            p + 1,
                                            pagination.totalPages || p + 1
                                        )
                                    )
                                }
                                disabled={page >= (pagination.totalPages || 1)}
                                className="rounded-full border auth-border bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
