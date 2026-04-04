import React from "react";
import {
    ChevronRight,
    Download,
    FileText,
    Folder,
    Folders,
    Lock,
    Trash2,
    Upload,
    Users,
} from "lucide-react";
import { formatDateTime, getShortFileType } from "../../utility/helper";

const formatBytes = (value) => {
    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) return "—";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let idx = 0;
    let adjusted = size;
    while (adjusted >= 1024 && idx < units.length - 1) {
        adjusted /= 1024;
        idx += 1;
    }
    return `${adjusted.toFixed(adjusted >= 10 || idx === 0 ? 0 : 1)} ${
        units[idx]
    }`;
};

export default function ProjectFiles({
    filesSearchInput,
    setFilesSearchInput,
    openFileModal,
    breadcrumbs,
    setBreadcrumbs,
    setCurrentFolder,
    setFilesPage,
    filesLoading,
    filesError,
    files,
    handleOpenFolder,
    handleDownloadFile,
    handleDeleteFile,
    filesTotal,
    filesStartIndex,
    filesEndIndex,
    filesPage,
    filesPageSize,
    setFilesPageSize,
    filesTotalPages,
}) {
    return (
        <div className="mt-5 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <input
                    value={filesSearchInput}
                    onChange={(e) => setFilesSearchInput(e.target.value)}
                    placeholder="Search files..."
                    className="w-full rounded-full border auth-border bg-white/5 px-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 md:w-64"
                />
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => openFileModal("folder")}
                        className="rounded-full border auth-border bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200"
                    >
                        <span className="inline-flex items-center gap-2">
                            <Folder size={14} />
                            New Folder
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => openFileModal("file")}
                        className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30"
                    >
                        <span className="inline-flex items-center gap-2">
                            <Upload size={14} />
                            New File
                        </span>
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs auth-text-secondary">
                {breadcrumbs.map((crumb, index) => (
                    <div
                        key={`crumb-${crumb.id ?? "root"}`}
                        className="flex items-center gap-2"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setBreadcrumbs((prev) =>
                                    prev.slice(0, index + 1),
                                );
                                setCurrentFolder(crumb.id ? crumb : null);
                                setFilesPage(1);
                            }}
                            className="underline underline-offset-4"
                        >
                            {crumb.id === null ? (
                                <span className="inline-flex items-center gap-1">
                                    Root <Folders size={16} />
                                </span>
                            ) : (
                                crumb.name
                            )}
                        </button>
                        {index < breadcrumbs.length - 1 ? (
                            <ChevronRight size={12} />
                        ) : null}
                    </div>
                ))}
            </div>
            <div className="hidden md:block overflow-x-auto overflow-y-hidden">
                <div className="min-w-[820px] space-y-2">
                    <div className="grid grid-cols-[2fr_0.9fr_0.8fr_1fr_1fr_0.6fr] gap-3 rounded-2xl border auth-border bg-white/5 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] auth-accent">
                        <span>File name</span>
                        <span>Type</span>
                        <span>Size</span>
                        <span>Shared</span>
                        <span>Last modified</span>
                        <span>Actions</span>
                    </div>
                    {filesLoading ? (
                        <p className="text-sm auth-text-secondary">
                            Loading files...
                        </p>
                    ) : filesError ? (
                        <p className="text-sm text-rose-200">{filesError}</p>
                    ) : files.length ? (
                        files.map((item) => {
                            let sharedList = [];
                            if (Array.isArray(item.shared_with)) {
                                sharedList = item.shared_with;
                            } else if (typeof item.shared_with === "string") {
                                try {
                                    const parsed = JSON.parse(
                                        item.shared_with,
                                    );
                                    sharedList = Array.isArray(parsed)
                                        ? parsed
                                        : [];
                                } catch (_) {
                                    sharedList = [];
                                }
                            }
                            const sharedCount = sharedList.length;
                            const sharedScope = item.share_scope || "only_me";
                            const SharedIcon =
                                sharedScope === "all_members" ||
                                (sharedScope === "selected" && sharedCount)
                                    ? Users
                                    : Lock;
                            const sharedLabel =
                                sharedScope === "all_members"
                                    ? "All members"
                                    : sharedScope === "selected"
                                      ? `${sharedCount} people`
                                      : "Only me";
                            return (
                                <div
                                    key={item.id}
                                    className="grid items-center grid-cols-[2fr_0.9fr_0.8fr_1fr_1fr_0.6fr] gap-3 rounded-2xl border auth-border bg-slate-900/30 px-4 py-3 text-sm auth-text-primary"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                                            {item.is_folder ? (
                                                <Folder
                                                    size={18}
                                                    className="text-amber-200"
                                                />
                                            ) : (
                                                <FileText
                                                    size={18}
                                                    className="text-sky-200"
                                                />
                                            )}
                                        </div>
                                        {item.is_folder ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenFolder(item)
                                                }
                                                className="text-left text-sm font-semibold auth-text-primary underline underline-offset-4"
                                            >
                                                {item.name}
                                            </button>
                                        ) : (
                                            <span className="text-sm font-semibold auth-text-primary">
                                                {item.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs auth-text-secondary">
                                        {item.is_folder
                                            ? "Folder"
                                            : getShortFileType(
                                                  item.mime_type,
                                              )}
                                    </div>
                                    <div className="text-xs auth-text-secondary">
                                        {item.is_folder
                                            ? "—"
                                            : formatBytes(item.size_bytes)}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs auth-text-secondary">
                                        <SharedIcon
                                            size={14}
                                            className="text-slate-400"
                                        />
                                        <span>{sharedLabel}</span>
                                    </div>
                                    <div className="text-xs auth-text-secondary">
                                        {formatDateTime(
                                            item.updated_at,
                                            "dd/LL/yyyy HH:mm",
                                        ) || "—"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="rounded-full border auth-border bg-white/5 p-2 text-slate-200"
                                            title="Download"
                                            onClick={() =>
                                                handleDownloadFile(item)
                                            }
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-full border auth-border bg-white/5 p-2 text-rose-200"
                                            title="Delete"
                                            onClick={() => handleDeleteFile(item)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm auth-text-secondary">
                            No files found.
                        </p>
                    )}
                </div>
            </div>
            <div className="space-y-3 md:hidden">
                {filesLoading ? (
                    <p className="text-sm auth-text-secondary">Loading files...</p>
                ) : filesError ? (
                    <p className="text-sm text-rose-200">{filesError}</p>
                ) : files.length ? (
                    files.map((item) => {
                        let sharedList = [];
                        if (Array.isArray(item.shared_with)) {
                            sharedList = item.shared_with;
                        } else if (typeof item.shared_with === "string") {
                            try {
                                const parsed = JSON.parse(item.shared_with);
                                sharedList = Array.isArray(parsed) ? parsed : [];
                            } catch (_) {
                                sharedList = [];
                            }
                        }
                        const sharedCount = sharedList.length;
                        const sharedScope = item.share_scope || "only_me";
                        const SharedIcon =
                            sharedScope === "all_members" ||
                            (sharedScope === "selected" && sharedCount)
                                ? Users
                                : Lock;
                        const sharedLabel =
                            sharedScope === "all_members"
                                ? "All members"
                                : sharedScope === "selected"
                                  ? `${sharedCount} people`
                                  : "Only me";

                        return (
                            <div
                                key={item.id}
                                className="rounded-2xl border auth-border bg-slate-900/30 p-4 space-y-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                                        {item.is_folder ? (
                                            <Folder size={16} className="text-amber-200" />
                                        ) : (
                                            <FileText size={16} className="text-sky-200" />
                                        )}
                                    </div>
                                    {item.is_folder ? (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenFolder(item)}
                                            className="text-left text-sm font-semibold auth-text-primary underline underline-offset-4"
                                        >
                                            {item.name}
                                        </button>
                                    ) : (
                                        <span className="text-sm font-semibold auth-text-primary">
                                            {item.name}
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs auth-text-secondary">
                                    <span>{item.is_folder ? "Folder" : getShortFileType(item.mime_type)}</span>
                                    <span>
                                        {item.is_folder ? "—" : formatBytes(item.size_bytes)}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <SharedIcon size={12} className="text-slate-400" />
                                        {sharedLabel}
                                    </span>
                                    <span>
                                        {formatDateTime(item.updated_at, "dd/LL/yyyy HH:mm") ||
                                            "—"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="rounded-full border auth-border bg-white/5 p-2 text-slate-200"
                                        title="Download"
                                        onClick={() => handleDownloadFile(item)}
                                    >
                                        <Download size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        className="rounded-full border auth-border bg-white/5 p-2 text-rose-200"
                                        title="Delete"
                                        onClick={() => handleDeleteFile(item)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm auth-text-secondary">No files found.</p>
                )}
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-xs auth-text-secondary">
                    Showing{" "}
                    <span className="text-slate-200">
                        {filesTotal ? filesStartIndex : 0}
                    </span>{" "}
                    -{" "}
                    <span className="text-slate-200">
                        {Math.min(filesEndIndex, filesTotal)}
                    </span>{" "}
                    of{" "}
                    <span className="text-slate-200">{filesTotal}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={filesPageSize}
                        onChange={(e) => {
                            setFilesPageSize(Number(e.target.value));
                            setFilesPage(1);
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
                        onClick={() => setFilesPage((p) => Math.max(p - 1, 1))}
                        disabled={filesPage <= 1}
                        className="rounded-full border auth-border bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            setFilesPage((p) => Math.min(p + 1, filesTotalPages))
                        }
                        disabled={filesPage >= filesTotalPages}
                        className="rounded-full border auth-border bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
