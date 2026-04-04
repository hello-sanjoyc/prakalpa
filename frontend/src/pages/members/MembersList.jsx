import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import usePageTitle from "../../lib/usePageTitle";
import { API_ENDPOINTS } from "../../lib/apiEndpoints";
import { apiRequest } from "../../lib/apiClient";
import {
    showError,
    showSuccess,
} from "../../components/common/AxToastMessage.jsx";
import {
    Mail,
    MessageCircle,
    Phone,
    SquarePen,
    Trash,
    UserRound,
} from "lucide-react";
import Swal from "sweetalert2";

export default function MembersList() {
    usePageTitle("Members");
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pagination, setPagination] = useState(null);
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const loadMembers = async (
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
                `${API_ENDPOINTS.MEMBERS}?${params.toString()}`,
                "GET"
            );
            const list = Array.isArray(res?.members)
                ? res.members
                : Array.isArray(res)
                ? res
                : [];
            setMembers(list);
            setPagination(res?.pagination || null);
            if (!list.length && res?.message) {
                setError(res.message);
            } else {
                setError(null);
            }
        } catch (err) {
            setError(err.message || "Failed to load members");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMembers(page, pageSize, sortBy, sortOrder, searchQuery);
    }, [page, pageSize, sortBy, sortOrder, searchQuery]);

    useEffect(() => {
        const handle = setTimeout(() => {
            setSearchQuery(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(handle);
    }, [searchInput]);

    const handleDelete = async (memberId) => {
        const result = await Swal.fire({
            title: "Delete member?",
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
        setDeletingId(memberId);
        try {
            await apiRequest(API_ENDPOINTS.MEMBER_DELETE(memberId), "DELETE");
            showSuccess("Member deleted.");
            const remaining = members.length - 1;
            const nextTotal = Math.max((pagination?.total || 0) - 1, 0);
            const nextTotalPages = Math.ceil(nextTotal / pageSize) || 1;
            if (page > nextTotalPages) {
                setPage(nextTotalPages);
            } else if (remaining > 0) {
                setMembers((prev) => prev.filter((m) => m.id !== memberId));
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
                loadMembers(page, pageSize, sortBy, sortOrder);
            }
        } catch (err) {
            showError(err.message || "Failed to delete member.");
        } finally {
            setDeletingId(null);
        }
    };

    const toggleSort = (key) => {
        if (sortBy === key) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(key);
            setSortOrder("asc");
        }
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] auth-accent">
                        Members
                    </p>
                    <h1 className="text-3xl font-semibold auth-text-primary">
                        Team directory
                    </h1>
                    <p className="mt-2 text-sm auth-text-secondary">
                        Manage project participants and their contact details.
                    </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <div className="relative">
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search members..."
                            className="w-full rounded-full border auth-border bg-white/5 px-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 sm:w-64"
                        />
                    </div>
                    <Link
                        to="/members/new"
                        className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30"
                    >
                        New member
                    </Link>
                </div>
            </div>

            <div className="rounded-3xl border auth-border auth-surface auth-shadow overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-white/5 px-4 py-3 text-xs uppercase tracking-[0.2em] auth-accent md:hidden">
                    <div className="flex items-center gap-3">
                        <span>Sort</span>
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setPage(1);
                            }}
                            className="rounded-full border auth-border bg-white/5 px-3 py-1 text-xs text-slate-200"
                        >
                            <option value="name">Name</option>
                            <option value="designation">Designation</option>
                            <option value="department">Department</option>
                            <option value="role">Role</option>
                        </select>
                        <button
                            type="button"
                            onClick={() =>
                                setSortOrder((prev) =>
                                    prev === "asc" ? "desc" : "asc"
                                )
                            }
                            className="rounded-full border auth-border bg-white/5 px-3 py-1 text-xs text-slate-200"
                        >
                            {sortOrder === "asc" ? "Asc" : "Desc"}
                        </button>
                    </div>
                </div>
                <div className="hidden bg-white/5 px-6 py-3 text-xs tracking-[0.2em] auth-accent md:grid md:grid-cols-[minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.7fr)_auto]">
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
                    <span>Contact</span>
                    <button
                        type="button"
                        onClick={() => toggleSort("designation")}
                        className="flex items-center gap-2 text-left"
                    >
                        <span>Designation</span>
                        {sortBy === "designation" ? (
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
                        onClick={() => toggleSort("role")}
                        className="flex items-center gap-2 text-left"
                    >
                        <span>Role</span>
                        {sortBy === "role" ? (
                            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        ) : null}
                    </button>
                    <span className="text-right">Actions</span>
                </div>
                {loading ? (
                    <div className="px-6 py-8 text-sm auth-text-secondary">
                        Loading members...
                    </div>
                ) : error ? (
                    <div className="px-6 py-8 text-sm text-rose-200">
                        {error}
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="grid items-center gap-2 px-4 py-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.7fr)_auto] md:px-6"
                            >
                                <div className="col-span-2 flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-800/70 flex items-center justify-center border border-white/10">
                                        {member.avatar_path ? (
                                            <img
                                                src={member.avatar_path}
                                                alt={
                                                    member.full_name ||
                                                    "Member avatar"
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <UserRound
                                                size={18}
                                                className="text-slate-400"
                                            />
                                        )}
                                    </div>
                                    <Link
                                        to={`/members/${member.id}`}
                                        className="text-sm font-semibold auth-text-primary underline underline-offset-4"
                                    >
                                        {member.full_name || "—"}
                                    </Link>
                                </div>
                                <div className="flex flex-col gap-1 text-sm auth-text-secondary">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} strokeWidth={2} />
                                        <span>{member.email || "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} strokeWidth={2} />
                                        <span>{member.phone || "—"}</span>
                                    </div>
                                </div>
                                <p className="text-sm auth-text-secondary">
                                    {member.designation || "—"}
                                </p>
                                <p className="text-sm auth-text-secondary">
                                    {member.department_id ? (
                                        <Link
                                            to={`/departments/${member.department_id}`}
                                            className="text-slate-400 underline underline-offset-4"
                                        >
                                            {member.department_name ||
                                                `Dept #${member.department_id}`}
                                        </Link>
                                    ) : (
                                        "—"
                                    )}
                                </p>
                                <p className="text-sm auth-text-secondary">
                                    {member.role_names || "—"}
                                </p>
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        to={`/members/${member.id}/edit`}
                                        className="mx-1 text-[11px] font-semibold text-slate-400 flex items-center gap-1"
                                    >
                                        <SquarePen size={14} strokeWidth={2} />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(member.id)}
                                        disabled={deletingId === member.id}
                                        className="mx-1 text-[11px] font-semibold text-red-500 disabled:opacity-60 flex items-center gap-1"
                                    >
                                        <Trash size={14} strokeWidth={2} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!members.length && (
                            <div className="px-6 py-8 text-sm auth-text-secondary">
                                No members found.
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
                            {members.length ? (page - 1) * pageSize + 1 : 0}
                        </span>{" "}
                        -{" "}
                        <span className="text-slate-200">
                            {(page - 1) * pageSize + members.length}
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
