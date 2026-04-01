import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import usePageTitle from "../../lib/usePageTitle";
import { API_ENDPOINTS } from "../../lib/apiEndpoints";
import { apiRequest } from "../../lib/apiClient";
import {
    showError,
    showSuccess,
} from "../../components/common/AxToastMessage.jsx";
import { Layers, SquarePen, Trash } from "lucide-react";
import Swal from "sweetalert2";

export default function DepartmentsList() {
    usePageTitle("Departments");
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pagination, setPagination] = useState(null);

    const loadDepartments = async (
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
                `${API_ENDPOINTS.DEPARTMENTS}?${params.toString()}`,
                "GET"
            );
            const list = Array.isArray(res?.departments)
                ? res.departments
                : Array.isArray(res)
                ? res
                : [];
            setDepartments(list);
            setPagination(res?.pagination || null);
            if (!list.length && res?.message) {
                setError(res.message);
            } else {
                setError(null);
            }
        } catch (err) {
            setError(err.message || "Failed to load departments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDepartments(page, pageSize, sortBy, sortOrder, searchQuery);
    }, [page, pageSize, sortBy, sortOrder, searchQuery]);

    useEffect(() => {
        const handle = setTimeout(() => {
            setSearchQuery(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(handle);
    }, [searchInput]);

    const departmentLookup = useMemo(() => {
        const map = new Map();
        departments.forEach((dept) => {
            map.set(String(dept.id), dept.name);
        });
        return map;
    }, [departments]);

    const toggleSort = (key) => {
        if (sortBy === key) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(key);
            setSortOrder("asc");
        }
        setPage(1);
    };

    const handleDelete = async (departmentId) => {
        const result = await Swal.fire({
            title: "Delete department?",
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
        setDeletingId(departmentId);
        try {
            await apiRequest(
                API_ENDPOINTS.DEPARTMENT_DELETE(departmentId),
                "DELETE"
            );
            showSuccess("Department deleted.");
            const remaining = departments.length - 1;
            const nextTotal = Math.max((pagination?.total || 0) - 1, 0);
            const nextTotalPages = Math.ceil(nextTotal / pageSize) || 1;
            if (page > nextTotalPages) {
                setPage(nextTotalPages);
            } else if (remaining > 0) {
                setDepartments((prev) =>
                    prev.filter((dept) => dept.id !== departmentId)
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
                loadDepartments(page, pageSize, sortBy, sortOrder, searchQuery);
            }
        } catch (err) {
            showError(err.message || "Failed to delete department.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] auth-accent">
                        Departments
                    </p>
                    <h1 className="text-3xl font-semibold auth-text-primary">
                        Department directory
                    </h1>
                    <p className="mt-2 text-sm auth-text-secondary">
                        Manage teams and organizational structure.
                    </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <div className="relative">
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search departments..."
                            className="w-full rounded-full border auth-border bg-white/5 px-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 sm:w-64"
                        />
                    </div>
                    <Link
                        to="/departments/new"
                        className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30"
                    >
                        New department
                    </Link>
                </div>
            </div>

            <div className="rounded-3xl border auth-border auth-surface auth-shadow overflow-hidden">
                <div className="hidden bg-white/5 px-6 py-3 text-xs tracking-[0.2em] auth-accent md:grid md:grid-cols-5">
                    <button
                        type="button"
                        onClick={() => toggleSort("name")}
                        className="col-span-2 flex items-center gap-2 text-left"
                    >
                        <span>Name</span>
                        {sortBy === "name" ? (
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
                        onClick={() => toggleSort("parent")}
                        className="flex items-center gap-2 text-left"
                    >
                        <span>Parent</span>
                        {sortBy === "parent" ? (
                            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        ) : null}
                    </button>
                    <span className="text-right">Actions</span>
                </div>
                {loading ? (
                    <div className="px-6 py-8 text-sm auth-text-secondary">
                        Loading departments...
                    </div>
                ) : error ? (
                    <div className="px-6 py-8 text-sm text-rose-200">
                        {error}
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {departments.map((dept) => {
                            const parentName =
                                departmentLookup.get(String(dept.parent_id)) ||
                                "—";
                            return (
                                <div
                                    key={dept.id}
                                    className="grid items-center gap-2 px-4 py-4 md:grid-cols-5 md:px-6"
                                >
                                    <div className="col-span-2 flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-2xl overflow-hidden bg-slate-800/70 flex items-center justify-center border border-white/10">
                                            <Layers
                                                size={18}
                                                className="text-slate-400"
                                            />
                                        </div>
                                        <Link
                                            to={`/departments/${dept.id}`}
                                            className="text-sm font-semibold auth-text-primary underline underline-offset-4"
                                        >
                                            {dept.name || "—"}
                                        </Link>
                                    </div>
                                    <p className="text-sm auth-text-secondary">
                                        {dept.code || "—"}
                                    </p>
                                    <p className="text-sm auth-text-secondary">
                                        {parentName}
                                    </p>
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            to={`/departments/${dept.id}/edit`}
                                            className="mx-1 text-[11px] font-semibold text-slate-400 flex items-center gap-1"
                                        >
                                            <SquarePen
                                                size={14}
                                                strokeWidth={2}
                                            />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(dept.id)
                                            }
                                            disabled={deletingId === dept.id}
                                            className="mx-1 text-[11px] font-semibold text-red-500 disabled:opacity-60 flex items-center gap-1"
                                        >
                                            <Trash
                                                size={14}
                                                strokeWidth={2}
                                            />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {!departments.length && (
                            <div className="px-6 py-8 text-sm auth-text-secondary">
                                No departments found.
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
                            {departments.length
                                ? (page - 1) * pageSize + 1
                                : 0}
                        </span>{" "}
                        -{" "}
                        <span className="text-slate-200">
                            {(page - 1) * pageSize + departments.length}
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
                                {[5, 10, 25, 50, 100].map((size) => (
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
