import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    Activity,
    CheckSquare,
    FileText,
    Flag,
    Upload,
    Wallet,
    UserRound,
} from "lucide-react";
import Swal from "sweetalert2";
import usePageTitle from "../../lib/usePageTitle";
import { API_ENDPOINTS } from "../../lib/apiEndpoints";
import api, { apiRequest } from "../../lib/apiClient";
import { formatDateTime, formatMoney } from "../../utility/helper";
import ProjectMilestones from "../../components/project/ProjectMilestones";
import ProjectTasks from "../../components/project/ProjectTasks";
import ProjectFiles from "../../components/project/ProjectFiles";
import ProjectActions from "../../components/project/ProjectActions";
import ProjectFinance from "../../components/project/ProjectFinance";

const statusBadge = {
    GREEN: "bg-green-500 text-emerald-100",
    AMBER: "bg-orange-500 text-amber-900",
    RED: "bg-red-500 text-rose-100",
};

export default function ProjectView() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("milestones");
    const [milestones, setMilestones] = useState([]);
    const [milestonesLoading, setMilestonesLoading] = useState(false);
    const [milestonesError, setMilestonesError] = useState("");
    const [milestonesPage, setMilestonesPage] = useState(1);
    const [milestonesPageSize, setMilestonesPageSize] = useState(6);
    const [milestonesPagination, setMilestonesPagination] = useState(null);
    const [milestonesSortBy, setMilestonesSortBy] = useState("due_date");
    const [milestonesSortOrder, setMilestonesSortOrder] = useState("asc");
    const [milestonesSearchInput, setMilestonesSearchInput] = useState("");
    const [milestonesSearchQuery, setMilestonesSearchQuery] = useState("");
    const [milestonesReload, setMilestonesReload] = useState(0);
    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [tasksError, setTasksError] = useState("");
    const [tasksPage, setTasksPage] = useState(1);
    const [tasksPageSize, setTasksPageSize] = useState(6);
    const [tasksPagination, setTasksPagination] = useState(null);
    const [tasksSortBy, setTasksSortBy] = useState("due_date");
    const [tasksSortOrder, setTasksSortOrder] = useState("asc");
    const [tasksSearchInput, setTasksSearchInput] = useState("");
    const [tasksSearchQuery, setTasksSearchQuery] = useState("");
    const [tasksReload, setTasksReload] = useState(0);
    const [expandedMilestones, setExpandedMilestones] = useState([]);
    const [actions, setActions] = useState([]);
    const [actionsLoading, setActionsLoading] = useState(false);
    const [actionsError, setActionsError] = useState("");
    const [actionsPage, setActionsPage] = useState(1);
    const [actionsPageSize, setActionsPageSize] = useState(6);
    const [actionsPagination, setActionsPagination] = useState(null);
    const [actionsSortBy, setActionsSortBy] = useState("title");
    const [actionsSortOrder, setActionsSortOrder] = useState("asc");
    const [actionsSearchInput, setActionsSearchInput] = useState("");
    const [actionsSearchQuery, setActionsSearchQuery] = useState("");
    const [actionsReload, setActionsReload] = useState(0);
    const [finances, setFinances] = useState([]);
    const [financesLoading, setFinancesLoading] = useState(false);
    const [financesError, setFinancesError] = useState("");
    const [financesPage, setFinancesPage] = useState(1);
    const [financesPageSize, setFinancesPageSize] = useState(6);
    const [financesPagination, setFinancesPagination] = useState(null);
    const [financesSortBy, setFinancesSortBy] = useState("entry_date");
    const [financesSortOrder, setFinancesSortOrder] = useState("desc");
    const [financesSearchInput, setFinancesSearchInput] = useState("");
    const [financesSearchQuery, setFinancesSearchQuery] = useState("");
    const [financesReload, setFinancesReload] = useState(0);
    const [taskDetailOpen, setTaskDetailOpen] = useState(false);
    const [taskDetail, setTaskDetail] = useState(null);
    const [filesSearchInput, setFilesSearchInput] = useState("");
    const [filesSearchQuery, setFilesSearchQuery] = useState("");
    const [files, setFiles] = useState([]);
    const [filesLoading, setFilesLoading] = useState(false);
    const [filesError, setFilesError] = useState("");
    const [filesPagination, setFilesPagination] = useState(null);
    const [filesPage, setFilesPage] = useState(1);
    const [filesPageSize, setFilesPageSize] = useState(5);
    const [filesReload, setFilesReload] = useState(0);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([
        { id: null, name: "Files" },
    ]);
    const [fileModalOpen, setFileModalOpen] = useState(false);
    const [fileModalType, setFileModalType] = useState("file");
    const [fileModalSaving, setFileModalSaving] = useState(false);
    const [fileModalError, setFileModalError] = useState("");
    const [fileModalAttempted, setFileModalAttempted] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [fileUpload, setFileUpload] = useState(null);
    const [fileShareOption, setFileShareOption] = useState("only_me");
    const [fileSharedMembers, setFileSharedMembers] = useState([]);
    const [milestoneOptions, setMilestoneOptions] = useState([]);
    const [taskOptions, setTaskOptions] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState("milestones");
    const [modalSaving, setModalSaving] = useState(false);
    const [modalError, setModalError] = useState("");
    const [modalAttempted, setModalAttempted] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [editingFinance, setEditingFinance] = useState(null);
    const [milestoneDraft, setMilestoneDraft] = useState({
        title: "",
        due_date: "",
        status: "PENDING",
    });
    const [taskDraft, setTaskDraft] = useState({
        milestone_id: "",
        owner_id: "",
        title: "",
        description: "",
        due_date: "",
        priority: "MEDIUM",
        status: "OPEN",
    });
    const [actionDraft, setActionDraft] = useState({
        task_id: "",
        title: "",
        due_date: "",
        status: "OPEN",
    });
    const [financeDraft, setFinanceDraft] = useState({
        entry_date: "",
        fund_allocated: "",
        fund_consumed: "",
        note: "",
    });

    const financeAllocatedValue = Number(financeDraft.fund_allocated);
    const showFinanceDateError =
        modalTab === "finance" && modalAttempted && !financeDraft.entry_date;
    const showFinanceAllocatedError =
        modalTab === "finance" &&
        modalAttempted &&
        (!financeDraft.fund_allocated ||
            !Number.isFinite(financeAllocatedValue) ||
            financeAllocatedValue <= 0);
    const showMilestoneTitleError =
        modalTab === "milestones" &&
        modalAttempted &&
        !milestoneDraft.title.trim();
    const showMilestoneDateError =
        modalTab === "milestones" && modalAttempted && !milestoneDraft.due_date;
    const showTaskMilestoneError =
        modalTab === "tasks" && modalAttempted && !taskDraft.milestone_id;
    const showTaskTitleError =
        modalTab === "tasks" && modalAttempted && !taskDraft.title.trim();
    const showTaskDescriptionError =
        modalTab === "tasks" && modalAttempted && !taskDraft.description.trim();
    const showTaskDateError =
        modalTab === "tasks" && modalAttempted && !taskDraft.due_date;
    const showFolderNameError =
        fileModalType === "folder" && fileModalAttempted && !folderName.trim();
    usePageTitle(project?.title || "Project Details");

    const normalizeDateInput = (value) => {
        if (!value) return "";
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return "";
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        const day = String(parsed.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const res = await apiRequest(
                    API_ENDPOINTS.PROJECT_VIEW(id),
                    "GET",
                );
                if (!isMounted) return;
                setProject(res?.project || res || null);
            } catch (err) {
                if (!isMounted) return;
                setError(err.message || "Failed to load project");
            } finally {
                if (isMounted) setLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        const handle = setTimeout(() => {
            setMilestonesSearchQuery(milestonesSearchInput.trim());
            setMilestonesPage(1);
        }, 400);
        return () => clearTimeout(handle);
    }, [milestonesSearchInput]);

    useEffect(() => {
        const handle = setTimeout(() => {
            setTasksSearchQuery(tasksSearchInput.trim());
            setTasksPage(1);
        }, 400);
        return () => clearTimeout(handle);
    }, [tasksSearchInput]);

    useEffect(() => {
        const keys = Array.from(
            new Set(
                tasks.map((task) =>
                    String(
                        task.milestone_id || task.milestone_title || "unknown",
                    ),
                ),
            ),
        );
        setExpandedMilestones(keys);
    }, [tasks]);

    useEffect(() => {
        const handle = setTimeout(() => {
            setActionsSearchQuery(actionsSearchInput.trim());
            setActionsPage(1);
        }, 400);
        return () => clearTimeout(handle);
    }, [actionsSearchInput]);

    useEffect(() => {
        const handle = setTimeout(() => {
            setFinancesSearchQuery(financesSearchInput.trim());
            setFinancesPage(1);
        }, 400);
        return () => clearTimeout(handle);
    }, [financesSearchInput]);

    useEffect(() => {
        const handle = setTimeout(() => {
            setFilesSearchQuery(filesSearchInput.trim());
            setFilesPage(1);
        }, 300);
        return () => clearTimeout(handle);
    }, [filesSearchInput]);

    useEffect(() => {
        setCurrentFolder(null);
        setBreadcrumbs([{ id: null, name: "Files" }]);
        setFilesPage(1);
    }, [id]);

    const fetchMilestones = async () => {
        if (!id) return;
        setMilestonesLoading(true);
        setMilestonesError("");
        try {
            const params = new URLSearchParams({
                page: String(milestonesPage),
                limit: String(milestonesPageSize),
                sortBy: String(milestonesSortBy),
                sortOrder: String(milestonesSortOrder),
            });
            if (milestonesSearchQuery) {
                params.set("search", milestonesSearchQuery);
            }
            const res = await apiRequest(
                `${API_ENDPOINTS.PROJECT_MILESTONES(id)}?${params.toString()}`,
                "GET",
            );
            setMilestones(res?.milestones || []);
            setMilestonesPagination(res?.pagination || null);
        } catch (err) {
            setMilestonesError(err.message || "Failed to load milestones");
        } finally {
            setMilestonesLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchMilestones();
    }, [
        id,
        milestonesPage,
        milestonesPageSize,
        milestonesSortBy,
        milestonesSortOrder,
        milestonesSearchQuery,
        milestonesReload,
    ]);

    const fetchTasks = async () => {
        if (!id) return;
        setTasksLoading(true);
        setTasksError("");
        try {
            const params = new URLSearchParams({
                page: String(tasksPage),
                limit: String(tasksPageSize),
                sortBy: String(tasksSortBy),
                sortOrder: String(tasksSortOrder),
            });
            if (tasksSearchQuery) {
                params.set("search", tasksSearchQuery);
            }
            const res = await apiRequest(
                `${API_ENDPOINTS.PROJECT_TASKS(id)}?${params.toString()}`,
                "GET",
            );
            setTasks(res?.tasks || []);
            setTasksPagination(res?.pagination || null);
        } catch (err) {
            setTasksError(err.message || "Failed to load tasks");
        } finally {
            setTasksLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchTasks();
    }, [
        id,
        tasksPage,
        tasksPageSize,
        tasksSortBy,
        tasksSortOrder,
        tasksSearchQuery,
        tasksReload,
    ]);

    const fetchActions = async () => {
        if (!id) return;
        setActionsLoading(true);
        setActionsError("");
        try {
            const params = new URLSearchParams({
                page: String(actionsPage),
                limit: String(actionsPageSize),
                sortBy: String(actionsSortBy),
                sortOrder: String(actionsSortOrder),
            });
            if (actionsSearchQuery) {
                params.set("search", actionsSearchQuery);
            }
            const res = await apiRequest(
                `${API_ENDPOINTS.PROJECT_ACTIONS(id)}?${params.toString()}`,
                "GET",
            );
            setActions(res?.actions || []);
            setActionsPagination(res?.pagination || null);
        } catch (err) {
            setActionsError(err.message || "Failed to load activities");
        } finally {
            setActionsLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchActions();
    }, [
        id,
        actionsPage,
        actionsPageSize,
        actionsSortBy,
        actionsSortOrder,
        actionsSearchQuery,
        actionsReload,
    ]);

    const fetchFinances = async () => {
        if (!id) return;
        setFinancesLoading(true);
        setFinancesError("");
        try {
            const params = new URLSearchParams({
                page: String(financesPage),
                limit: String(financesPageSize),
                sortBy: String(financesSortBy),
                sortOrder: String(financesSortOrder),
            });
            if (financesSearchQuery) {
                params.set("search", financesSearchQuery);
            }
            const res = await apiRequest(
                `${API_ENDPOINTS.PROJECT_FINANCES(id)}?${params.toString()}`,
                "GET",
            );
            setFinances(res?.finances || []);
            setFinancesPagination(res?.pagination || null);
        } catch (err) {
            setFinancesError(err.message || "Failed to load finance entries");
        } finally {
            setFinancesLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchFinances();
    }, [
        id,
        financesPage,
        financesPageSize,
        financesSortBy,
        financesSortOrder,
        financesSearchQuery,
        financesReload,
    ]);

    const fetchFiles = async () => {
        if (!id) return;
        setFilesLoading(true);
        setFilesError("");
        try {
            const params = new URLSearchParams({
                page: String(filesPage),
                limit: String(filesPageSize),
            });
            if (filesSearchQuery) {
                params.set("search", filesSearchQuery);
            }
            if (currentFolder?.id) {
                params.set("parent_id", String(currentFolder.id));
            }
            const res = await apiRequest(
                `${API_ENDPOINTS.PROJECT_FILES(id)}?${params.toString()}`,
                "GET",
            );
            setFiles(res?.files || []);
            setFilesPagination(res?.pagination || null);
        } catch (err) {
            setFilesError(err.message || "Failed to load files");
        } finally {
            setFilesLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchFiles();
    }, [
        id,
        filesPage,
        filesPageSize,
        filesSearchQuery,
        filesReload,
        currentFolder?.id,
    ]);

    const filesTotal = filesPagination?.total || 0;
    const filesTotalPages = filesPagination?.totalPages || 1;
    const filesStartIndex = files.length
        ? (filesPage - 1) * filesPageSize + 1
        : 0;
    const filesEndIndex = (filesPage - 1) * filesPageSize + files.length;

    const openModal = async (tabKey) => {
        setModalTab(tabKey);
        setModalError("");
        setModalAttempted(false);
        setModalOpen(true);
        if (tabKey === "milestones") {
            setEditingMilestone(null);
            setMilestoneDraft({
                title: "",
                due_date: "",
                status: "PENDING",
            });
        }
        if (tabKey === "tasks") {
            setEditingTask(null);
            setTaskDraft({
                milestone_id: "",
                owner_id: "",
                title: "",
                description: "",
                due_date: "",
                priority: "MEDIUM",
                status: "OPEN",
            });
        }
        if (tabKey === "finance") {
            setEditingFinance(null);
            setFinanceDraft({
                entry_date: "",
                fund_allocated: "",
                fund_consumed: "",
                note: "",
            });
        }
        try {
            if (tabKey === "tasks") {
                const params = new URLSearchParams({
                    page: "1",
                    limit: "200",
                    sortBy: "due_date",
                    sortOrder: "asc",
                });
                const res = await apiRequest(
                    `${API_ENDPOINTS.PROJECT_MILESTONES(
                        id,
                    )}?${params.toString()}`,
                    "GET",
                );
                setMilestoneOptions(res?.milestones || []);
            }
            if (tabKey === "activities") {
                const params = new URLSearchParams({
                    page: "1",
                    limit: "200",
                    sortBy: "due_date",
                    sortOrder: "asc",
                });
                const res = await apiRequest(
                    `${API_ENDPOINTS.PROJECT_TASKS(id)}?${params.toString()}`,
                    "GET",
                );
                setTaskOptions(res?.tasks || []);
            }
        } catch (err) {
            setModalError(err.message || "Failed to load options.");
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalError("");
        setModalSaving(false);
        setModalAttempted(false);
        setEditingMilestone(null);
        setEditingTask(null);
        setEditingFinance(null);
    };

    const openFinanceEdit = (entry) => {
        setModalTab("finance");
        setModalError("");
        setModalOpen(true);
        setEditingFinance(entry);
        setFinanceDraft({
            entry_date: entry.entry_date || "",
            fund_allocated: entry.fund_allocated ?? "",
            fund_consumed: entry.fund_consumed ?? "",
            note: entry.note || "",
        });
    };

    const handleDeleteFinance = async (entry) => {
        if (!id || !entry?.id) return;
        const result = await Swal.fire({
            title: "Delete finance entry?",
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
        setFinancesLoading(true);
        setFinancesError("");
        try {
            await apiRequest(
                API_ENDPOINTS.PROJECT_FINANCE_DELETE(id, entry.id),
                "DELETE",
            );
            setFinancesReload((prev) => prev + 1);
            setProject((prev) => {
                if (!prev) return prev;
                const nextAllocated =
                    Number(prev.fund_allocated || 0) -
                    Number(entry.fund_allocated || 0);
                const nextConsumed =
                    Number(prev.fund_consumed || 0) -
                    Number(entry.fund_consumed || 0);
                return {
                    ...prev,
                    fund_allocated: Math.max(nextAllocated, 0),
                    fund_consumed: Math.max(nextConsumed, 0),
                };
            });
        } catch (err) {
            setFinancesError(err.message || "Failed to delete finance entry");
        } finally {
            setFinancesLoading(false);
        }
    };

    const openTaskDetail = (task) => {
        setTaskDetail(task);
        setTaskDetailOpen(true);
    };

    const closeTaskDetail = () => {
        setTaskDetailOpen(false);
        setTaskDetail(null);
    };

    const openFileModal = (type) => {
        setFileModalType(type);
        setFileModalOpen(true);
        setFileModalError("");
        setFileModalAttempted(false);
        setFolderName("");
        setFileUpload(null);
        if (currentFolder?.share_scope) {
            setFileShareOption(currentFolder.share_scope);
            let members = [];
            if (Array.isArray(currentFolder.shared_with)) {
                members = currentFolder.shared_with;
            } else if (typeof currentFolder.shared_with === "string") {
                try {
                    const parsed = JSON.parse(currentFolder.shared_with);
                    members = Array.isArray(parsed) ? parsed : [];
                } catch (_) {
                    members = [];
                }
            }
            setFileSharedMembers(members);
        } else {
            setFileShareOption("only_me");
            setFileSharedMembers([]);
        }
    };

    const closeFileModal = () => {
        setFileModalOpen(false);
        setFileModalError("");
        setFileModalSaving(false);
        setFileModalAttempted(false);
        setFolderName("");
        setFileUpload(null);
        setFileShareOption("only_me");
        setFileSharedMembers([]);
    };

    const handleCreateFolder = async () => {
        if (!id) return;
        setFileModalAttempted(true);
        const trimmed = folderName.trim();
        if (!trimmed) {
            setFileModalError("Folder name is required.");
            return;
        }
        setFileModalSaving(true);
        setFileModalError("");
        try {
            await apiRequest(API_ENDPOINTS.PROJECT_FILES_FOLDER(id), "POST", {
                name: trimmed,
                parent_id: currentFolder?.id || null,
                share_scope: fileShareOption,
                shared_with:
                    fileShareOption === "selected" ? fileSharedMembers : [],
            });
            closeFileModal();
            setFilesReload((prev) => prev + 1);
        } catch (err) {
            setFileModalError(err.message || "Failed to create folder.");
        } finally {
            setFileModalSaving(false);
        }
    };

    const handleUploadFile = async () => {
        if (!id) return;
        setFileModalAttempted(false);
        if (!fileUpload) {
            setFileModalError("Please select a file to upload.");
            return;
        }
        setFileModalSaving(true);
        setFileModalError("");
        try {
            const formData = new FormData();
            formData.append("file", fileUpload);
            if (currentFolder?.id) {
                formData.append("parent_id", String(currentFolder.id));
            }
            formData.append("share_scope", fileShareOption);
            if (fileShareOption === "selected") {
                formData.append(
                    "shared_with",
                    JSON.stringify(fileSharedMembers),
                );
            }
            await apiRequest(
                API_ENDPOINTS.PROJECT_FILES_UPLOAD(id),
                "POST",
                formData,
            );
            closeFileModal();
            setFilesReload((prev) => prev + 1);
        } catch (err) {
            setFileModalError(err.message || "Failed to upload file.");
        } finally {
            setFileModalSaving(false);
        }
    };

    const handleOpenFolder = (folder) => {
        if (!folder?.id) return;
        setCurrentFolder(folder);
        setBreadcrumbs((prev) => [
            ...prev,
            { id: folder.id, name: folder.name || "Folder" },
        ]);
        setFilesPage(1);
    };

    const handleDeleteFile = async (item) => {
        if (!id || !item?.id) return;
        const result = await Swal.fire({
            title: `Delete ${item.is_folder ? "folder" : "file"}?`,
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
        setFilesLoading(true);
        setFilesError("");
        try {
            await apiRequest(
                API_ENDPOINTS.PROJECT_FILES_DELETE(id, item.id),
                "DELETE",
            );
            setFilesReload((prev) => prev + 1);
        } catch (err) {
            setFilesError(err.message || "Failed to delete file");
        } finally {
            setFilesLoading(false);
        }
    };

    const handleDownloadFile = async (item) => {
        if (!id || !item?.id) return;
        try {
            const response = await api.get(
                API_ENDPOINTS.PROJECT_FILES_DOWNLOAD(id, item.id),
                { responseType: "blob" },
            );
            const contentType =
                response.headers?.["content-type"] ||
                "application/octet-stream";
            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            const disposition = response.headers?.["content-disposition"];
            let filename = item.is_folder
                ? `${item.name || "folder"}.zip`
                : item.name || "file";
            if (disposition) {
                const match = disposition.match(/filename="([^"]+)"/);
                if (match && match[1]) {
                    filename = match[1];
                }
            }
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setFilesError(err.message || "Failed to download file");
        }
    };

    const loadMilestoneOptions = async () => {
        const params = new URLSearchParams({
            page: "1",
            limit: "200",
            sortBy: "title",
            sortOrder: "asc",
        });
        const res = await apiRequest(
            `${API_ENDPOINTS.PROJECT_MILESTONES(id)}?${params.toString()}`,
            "GET",
        );
        setMilestoneOptions(res?.milestones || []);
    };

    const openMilestoneEdit = (milestone) => {
        setModalTab("milestones");
        setModalError("");
        setModalOpen(true);
        setEditingMilestone(milestone);
        setMilestoneDraft({
            title: milestone.title || "",
            due_date: milestone.due_date || "",
            status: milestone.status || "PENDING",
        });
    };

    const openTaskEdit = async (task) => {
        setModalTab("tasks");
        setModalError("");
        setModalOpen(true);
        setEditingTask(task);
        setTaskDraft({
            milestone_id: String(task.milestone_id || ""),
            owner_id: task.owner_id ? String(task.owner_id) : "",
            title: task.title || "",
            description: task.description || "",
            due_date: normalizeDateInput(task.due_date),
            priority: task.priority || "MEDIUM",
            status: task.status || "OPEN",
        });
        try {
            await loadMilestoneOptions();
        } catch (err) {
            setModalError(err.message || "Failed to load milestone options.");
        }
    };

    const handleDeleteMilestone = async (milestone) => {
        if (!id || !milestone?.id) return;
        const result = await Swal.fire({
            title: "Delete milestone?",
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
        setMilestonesLoading(true);
        setMilestonesError("");
        try {
            await apiRequest(
                API_ENDPOINTS.PROJECT_MILESTONE_DELETE(id, milestone.id),
                "DELETE",
            );
            setMilestonesReload((prev) => prev + 1);
        } catch (err) {
            setMilestonesError(err.message || "Failed to delete milestone");
        } finally {
            setMilestonesLoading(false);
        }
    };

    const handleDeleteTask = async (task) => {
        if (!id || !task?.id) return;
        const result = await Swal.fire({
            title: "Delete task?",
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
        setTasksLoading(true);
        setTasksError("");
        try {
            await apiRequest(
                API_ENDPOINTS.PROJECT_TASK_DELETE(id, task.id),
                "DELETE",
            );
            setTasksReload((prev) => prev + 1);
        } catch (err) {
            setTasksError(err.message || "Failed to delete task");
        } finally {
            setTasksLoading(false);
        }
    };

    const handleCreate = async () => {
        setModalAttempted(true);
        setModalSaving(true);
        setModalError("");
        try {
            if (modalTab === "milestones") {
                if (!milestoneDraft.title.trim()) {
                    throw new Error("Milestone title is required.");
                }
                if (!milestoneDraft.due_date) {
                    throw new Error("Milestone due date is required.");
                }
                if (editingMilestone?.id) {
                    await apiRequest(
                        API_ENDPOINTS.PROJECT_MILESTONE_UPDATE(
                            id,
                            editingMilestone.id,
                        ),
                        "PUT",
                        {
                            title: milestoneDraft.title,
                            due_date: milestoneDraft.due_date || null,
                            status: milestoneDraft.status,
                        },
                    );
                } else {
                    await apiRequest(
                        API_ENDPOINTS.PROJECT_MILESTONES(id),
                        "POST",
                        {
                            title: milestoneDraft.title,
                            due_date: milestoneDraft.due_date || null,
                            status: milestoneDraft.status,
                        },
                    );
                }
                setMilestoneDraft({
                    title: "",
                    due_date: "",
                    status: "PENDING",
                });
                setEditingMilestone(null);
                setMilestonesPage(1);
                setMilestonesReload((prev) => prev + 1);
            }
            if (modalTab === "tasks") {
                if (!taskDraft.milestone_id) {
                    throw new Error("Milestone is required.");
                }
                if (!taskDraft.title.trim()) {
                    throw new Error("Task title is required.");
                }
                if (!taskDraft.description.trim()) {
                    throw new Error("Task description is required.");
                }
                if (!taskDraft.due_date) {
                    throw new Error("Task due date is required.");
                }
                if (editingTask?.id) {
                    await apiRequest(
                        API_ENDPOINTS.PROJECT_TASK_UPDATE(id, editingTask.id),
                        "PUT",
                        {
                            milestone_id: Number(taskDraft.milestone_id),
                            owner_id: taskDraft.owner_id
                                ? Number(taskDraft.owner_id)
                                : null,
                            title: taskDraft.title,
                            description: taskDraft.description,
                            due_date: taskDraft.due_date || null,
                            priority: taskDraft.priority,
                            status: taskDraft.status,
                        },
                    );
                } else {
                    await apiRequest(API_ENDPOINTS.PROJECT_TASKS(id), "POST", {
                        milestone_id: Number(taskDraft.milestone_id),
                        owner_id: taskDraft.owner_id
                            ? Number(taskDraft.owner_id)
                            : null,
                        title: taskDraft.title,
                        description: taskDraft.description,
                        due_date: taskDraft.due_date || null,
                        priority: taskDraft.priority,
                        status: taskDraft.status,
                    });
                }
                setTaskDraft({
                    milestone_id: "",
                    owner_id: "",
                    title: "",
                    description: "",
                    due_date: "",
                    priority: "MEDIUM",
                    status: "OPEN",
                });
                setEditingTask(null);
                setTasksPage(1);
                setTasksReload((prev) => prev + 1);
            }
            if (modalTab === "activities") {
                await apiRequest(API_ENDPOINTS.PROJECT_ACTIONS(id), "POST", {
                    task_id: Number(actionDraft.task_id),
                    title: actionDraft.title,
                    due_date: actionDraft.due_date || null,
                    status: actionDraft.status,
                });
                setActionDraft({
                    task_id: "",
                    title: "",
                    due_date: "",
                    status: "OPEN",
                });
                setActionsPage(1);
                setActionsReload((prev) => prev + 1);
            }
            if (modalTab === "finance") {
                const allocated = Number(financeDraft.fund_allocated);
                const consumed = Number(financeDraft.fund_consumed);
                const dateValue = financeDraft.entry_date;
                if (!dateValue) {
                    throw new Error("Date is required.");
                }
                if (!financeDraft.fund_allocated || allocated <= 0) {
                    throw new Error(
                        "Fund Allocated is required and must be greater than 0.",
                    );
                }
                if (!Number.isFinite(allocated)) {
                    throw new Error("Fund Allocated must be a number.");
                }
                if (!Number.isFinite(consumed)) {
                    throw new Error("Fund Expenses must be a number.");
                }
                const currentAllocated = Number(project?.fund_allocated || 0);
                const currentConsumed = Number(project?.fund_consumed || 0);
                const totalAllocated = currentAllocated + allocated;
                const totalConsumed = currentConsumed + consumed;
                if (totalConsumed > totalAllocated) {
                    throw new Error(
                        "Total Fund Expenses should be less than or equal to Fund Allocated.",
                    );
                }
                if (
                    project?.budget != null &&
                    Number.isFinite(Number(project?.budget)) &&
                    totalAllocated > Number(project?.budget)
                ) {
                    throw new Error(
                        "Total Fund Allocated should be less than or equal to Budget.",
                    );
                }
                const payload = {
                    entry_date: financeDraft.entry_date,
                    fund_allocated: allocated,
                    fund_consumed: consumed,
                    note: financeDraft.note?.trim() || null,
                };
                if (editingFinance?.id) {
                    await apiRequest(
                        API_ENDPOINTS.PROJECT_FINANCE_UPDATE(
                            id,
                            editingFinance.id,
                        ),
                        "PUT",
                        payload,
                    );
                } else {
                    await apiRequest(
                        API_ENDPOINTS.PROJECT_FINANCES(id),
                        "POST",
                        payload,
                    );
                }
                setFinanceDraft({
                    entry_date: "",
                    fund_allocated: "",
                    fund_consumed: "",
                    note: "",
                });
                setEditingFinance(null);
                setFinancesPage(1);
                setFinancesReload((prev) => prev + 1);
                setProject((prev) => {
                    if (!prev) return prev;
                    if (editingFinance?.id) {
                        const oldAllocated = Number(
                            editingFinance.fund_allocated || 0,
                        );
                        const oldConsumed = Number(
                            editingFinance.fund_consumed || 0,
                        );
                        return {
                            ...prev,
                            fund_allocated:
                                Number(prev.fund_allocated || 0) -
                                oldAllocated +
                                allocated,
                            fund_consumed:
                                Number(prev.fund_consumed || 0) -
                                oldConsumed +
                                consumed,
                        };
                    }
                    return {
                        ...prev,
                        fund_allocated: totalAllocated,
                        fund_consumed: totalConsumed,
                    };
                });
            }
            closeModal();
        } catch (err) {
            setModalError(err.message || "Failed to create record.");
        } finally {
            setModalSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                <p className="text-sm auth-text-secondary">
                    Loading project...
                </p>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                <p className="text-sm text-rose-200">
                    {error || "Project not found."}
                </p>
                <Link
                    to="/projects"
                    className="mt-3 inline-block rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary"
                >
                    Back to list
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 min-w-0 overflow-x-hidden">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.25em] auth-accent">
                        Projects
                    </p>
                    <h1 className="flex flex-wrap items-center gap-2 break-words text-xl font-semibold leading-tight auth-text-primary sm:text-2xl lg:text-3xl">
                        <span
                            className={`inline-block h-4 w-4 shrink-0 rounded-full sm:h-5 sm:w-5 ${
                                statusBadge[project.rag_status] || "bg-white/30"
                            }`}
                            title={project.rag_status || "N/A"}
                        />
                        <span className="min-w-0 break-words">{project.title}</span>
                    </h1>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                        <p className="break-words text-sm auth-text-secondary">
                            Code: {project.code}
                        </p>
                        <p className="break-words text-sm auth-text-secondary">
                            Current Stage:{" "}
                            <span className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-400">
                                {project.currentStage?.stage_slug || "N/A"}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <Link
                        to={`/projects/${project.id}/edit`}
                        className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary"
                    >
                        Edit
                    </Link>
                    <Link
                        to="/projects"
                        className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30"
                    >
                        Back to list
                    </Link>
                </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="min-w-0 rounded-3xl border auth-border auth-surface p-4 sm:p-6 lg:col-span-2 auth-shadow">
                    <h3 className="text-lg font-semibold auth-text-primary">
                        Overview
                    </h3>
                    <p className="mt-3 text-sm auth-text-secondary leading-relaxed">
                        {project.description || "No description provided yet."}
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border auth-border auth-surface p-4">
                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                Department
                            </p>
                            <p className="mt-2 break-words text-sm auth-text-primary">
                                {project.department?.name ||
                                project.department_name ? (
                                    <Link
                                        to={`/departments/${project.department_id}`}
                                        className="underline underline-offset-4"
                                    >
                                        {project.department?.name ||
                                            project.department_name}
                                    </Link>
                                ) : (
                                    `#${project.department_id}`
                                )}
                            </p>
                        </div>

                        <div className="rounded-2xl border auth-border auth-surface p-4">
                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                Owner
                            </p>
                            <div className="mt-2 min-w-0 text-sm auth-text-primary">
                                {project.owner?.member?.full_name ||
                                project.owner_name ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-slate-800/70 flex items-center justify-center">
                                            {project.owner?.member?.avatar_path ? (
                                                <img
                                                    src={
                                                        project.owner.member
                                                            .avatar_path
                                                    }
                                                    alt={
                                                        project.owner?.member
                                                            ?.full_name ||
                                                        project.owner_name ||
                                                        "Owner avatar"
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <UserRound
                                                    size={14}
                                                    className="text-slate-400"
                                                />
                                            )}
                                        </div>
                                        <Link
                                            to={`/members/${project.owner_id}`}
                                            className="truncate underline underline-offset-4"
                                        >
                                            {project.owner?.member?.full_name ||
                                                project.owner_name}
                                        </Link>
                                    </div>
                                ) : (
                                    `#${project.owner_id}`
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border auth-border auth-surface p-4">
                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                Financial Year
                            </p>
                            <p className="mt-2 text-sm auth-text-primary">
                                {project.fin_year}
                            </p>
                        </div>

                        <div className="rounded-2xl border auth-border auth-surface p-4">
                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                Budget (₹ Crore)
                            </p>
                            <p className="mt-2 text-sm auth-text-primary">
                                {project.budget != null
                                    ? formatMoney(project.budget)
                                    : "—"}
                            </p>
                        </div>

                        <div className="rounded-2xl border auth-border auth-surface p-4">
                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                Fund Allocated (₹ Crore)
                            </p>
                            <p className="mt-2 text-sm auth-text-primary">
                                {project.fund_allocated != null
                                    ? formatMoney(project.fund_allocated)
                                    : "—"}
                            </p>
                        </div>

                        <div className="rounded-2xl border auth-border auth-surface p-4">
                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                Fund Consumed (₹ Crore)
                            </p>
                            <p className="mt-2 text-sm auth-text-primary">
                                {project.fund_consumed != null
                                    ? formatMoney(project.fund_consumed)
                                    : "—"}
                            </p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <p className="text-xs uppercase tracking-[0.25em] auth-accent">
                            Members
                        </p>
                        {project.projectMembers?.length ? (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                {project.projectMembers
                                    .filter((entry) => entry.role !== "VENDOR")
                                    .map((entry) => {
                                        const member = entry.member || {};
                                        return (
                                            <div
                                                key={`member-${entry.id}`}
                                                className="rounded-2xl border auth-border bg-slate-900/30 p-4"
                                            >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-800/70 flex items-center justify-center border border-white/10">
                                                            {member.avatar_path ? (
                                                                <img
                                                                    src={
                                                                        member.avatar_path
                                                                    }
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
                                                        <div>
                                                            <Link
                                                                to={`/members/${
                                                                    member.id ||
                                                                    entry.member_id
                                                                }`}
                                                                className="text-sm font-semibold auth-text-primary underline underline-offset-4"
                                                            >
                                                                {member.full_name ||
                                                                    "Unnamed"}
                                                            </Link>
                                                            <p className="mt-1 text-xs auth-text-secondary">
                                                                {entry.role ||
                                                                    "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right text-xs auth-text-secondary">
                                                        <p>
                                                            {member.email ||
                                                                "—"}
                                                        </p>
                                                        <p className="mt-1">
                                                            {member.phone ||
                                                                "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <p className="mt-4 text-sm auth-text-secondary">
                                No members assigned yet.
                            </p>
                        )}
                    </div>
                </div>

                <div className="min-w-0 space-y-4">
                    <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                        <h3 className="text-lg font-semibold auth-text-primary">
                            Dates
                        </h3>
                        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm auth-text-secondary">
                            <div className="">
                                <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                    Planned Start
                                </p>
                                <p className="mt-2 text-sm auth-text-primary">
                                    {formatDateTime(project.start_date) || "—"}
                                </p>
                            </div>
                            <div className="">
                                <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                    Planned End
                                </p>
                                <p className="mt-2 text-sm auth-text-primary">
                                    {formatDateTime(project.end_date) || "—"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm auth-text-secondary">
                            <div className="">
                                <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                    Revised Start
                                </p>
                                <p className="mt-2 text-sm auth-text-primary">
                                    {project.revised_start_date
                                        ? formatDateTime(
                                              project.revised_start_date,
                                          )
                                        : "—"}
                                </p>
                            </div>
                            <div className="">
                                <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                    Revised End
                                </p>
                                <p className="mt-2 text-sm auth-text-primary">
                                    {project.revised_end_date
                                        ? formatDateTime(
                                              project.revised_end_date,
                                          )
                                        : "—"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm auth-text-secondary">
                            <div className="">
                                <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                    Actual Start
                                </p>
                                <p className="mt-2 text-sm auth-text-primary">
                                    {project.actual_start_date
                                        ? formatDateTime(
                                              project.actual_start_date,
                                          )
                                        : "—"}
                                </p>
                            </div>
                            <div className="">
                                <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                    Actual End
                                </p>
                                <p className="mt-2 text-sm auth-text-primary">
                                    {project.actual_end_date
                                        ? formatDateTime(
                                              project.actual_end_date,
                                          )
                                        : "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                        <h3 className="text-lg font-semibold auth-text-primary">
                            Links
                        </h3>
                        <div className="mt-3 space-y-2 text-sm">
                            <Link
                                to={`/projects/${project.id}/edit`}
                                className="text-amber-200 underline"
                            >
                                Edit project
                            </Link>
                            <div className="text-xs auth-text-secondary">
                                Add documents, milestones, and tasks in upcoming
                                iterations.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                <div className="rounded-3xl border auth-border auth-surface p-6 md:col-span-2 auth-shadow">
                    <div className="mt-10 rounded-3xl border auth-border auth-surface p-4 sm:p-6 auth-shadow bg-gradient-to-br from-white/5 to-white/0">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="w-full overflow-x-auto">
                                <div className="flex min-w-max gap-2 text-xs uppercase tracking-[0.25em] auth-accent">
                                {[
                                    {
                                        key: "milestones",
                                        label: "Milestones",
                                        icon: Flag,
                                    },
                                    {
                                        key: "tasks",
                                        label: "Tasks",
                                        icon: CheckSquare,
                                    },
                                    {
                                        key: "files",
                                        label: "Files",
                                        icon: FileText,
                                    },
                                    {
                                        key: "finance",
                                        label: "Finance",
                                        icon: Wallet,
                                    },
                                    {
                                        key: "activities",
                                        label: "Activities",
                                        icon: Activity,
                                    },
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`rounded-full border px-4 py-2 text-[11px] font-semibold whitespace-nowrap ${
                                                activeTab === tab.key
                                                    ? "border-amber-200/70 text-amber-100"
                                                    : "border-white/10 text-slate-400"
                                            }`}
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <tab.icon size={12} />
                                                {tab.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {activeTab === "milestones" ||
                            activeTab === "tasks" ||
                            activeTab === "finance" ? (
                                <button
                                    type="button"
                                    onClick={() => openModal(activeTab)}
                                    className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30"
                                >
                                    {activeTab === "milestones"
                                        ? "New Milestone"
                                        : activeTab === "tasks"
                                          ? "New Task"
                                          : "New Finance"}
                                </button>
                            ) : null}
                        </div>

                        {activeTab === "milestones" ? (
                            <ProjectMilestones
                                milestonesSearchInput={milestonesSearchInput}
                                setMilestonesSearchInput={
                                    setMilestonesSearchInput
                                }
                                milestonesSortBy={milestonesSortBy}
                                setMilestonesSortBy={setMilestonesSortBy}
                                milestonesSortOrder={milestonesSortOrder}
                                setMilestonesSortOrder={setMilestonesSortOrder}
                                milestonesLoading={milestonesLoading}
                                milestonesError={milestonesError}
                                milestones={milestones}
                                milestonesPagination={milestonesPagination}
                                milestonesPage={milestonesPage}
                                milestonesPageSize={milestonesPageSize}
                                setMilestonesPage={setMilestonesPage}
                                setMilestonesPageSize={setMilestonesPageSize}
                                openMilestoneEdit={openMilestoneEdit}
                                handleDeleteMilestone={handleDeleteMilestone}
                            />
                        ) : null}

                        {activeTab === "tasks" ? (
                            <ProjectTasks
                                tasksSearchInput={tasksSearchInput}
                                setTasksSearchInput={setTasksSearchInput}
                                tasksSortBy={tasksSortBy}
                                setTasksSortBy={setTasksSortBy}
                                tasksSortOrder={tasksSortOrder}
                                setTasksSortOrder={setTasksSortOrder}
                                tasksLoading={tasksLoading}
                                tasksError={tasksError}
                                tasks={tasks}
                                tasksPagination={tasksPagination}
                                tasksPage={tasksPage}
                                tasksPageSize={tasksPageSize}
                                setTasksPage={setTasksPage}
                                setTasksPageSize={setTasksPageSize}
                                expandedMilestones={expandedMilestones}
                                setExpandedMilestones={setExpandedMilestones}
                                openTaskDetail={openTaskDetail}
                                openTaskEdit={openTaskEdit}
                                handleDeleteTask={handleDeleteTask}
                                project={project}
                            />
                        ) : null}

                        {activeTab === "files" ? (
                            <ProjectFiles
                                filesSearchInput={filesSearchInput}
                                setFilesSearchInput={setFilesSearchInput}
                                openFileModal={openFileModal}
                                breadcrumbs={breadcrumbs}
                                setBreadcrumbs={setBreadcrumbs}
                                setCurrentFolder={setCurrentFolder}
                                setFilesPage={setFilesPage}
                                filesLoading={filesLoading}
                                filesError={filesError}
                                files={files}
                                handleOpenFolder={handleOpenFolder}
                                handleDownloadFile={handleDownloadFile}
                                handleDeleteFile={handleDeleteFile}
                                filesTotal={filesTotal}
                                filesStartIndex={filesStartIndex}
                                filesEndIndex={filesEndIndex}
                                filesPage={filesPage}
                                filesPageSize={filesPageSize}
                                setFilesPageSize={setFilesPageSize}
                                filesTotalPages={filesTotalPages}
                            />
                        ) : null}

                        {activeTab === "finance" ? (
                            <ProjectFinance
                                financesSearchInput={financesSearchInput}
                                setFinancesSearchInput={setFinancesSearchInput}
                                financesSortBy={financesSortBy}
                                setFinancesSortBy={setFinancesSortBy}
                                financesSortOrder={financesSortOrder}
                                setFinancesSortOrder={setFinancesSortOrder}
                                financesLoading={financesLoading}
                                financesError={financesError}
                                finances={finances}
                                financesPagination={financesPagination}
                                financesPage={financesPage}
                                financesPageSize={financesPageSize}
                                setFinancesPage={setFinancesPage}
                                setFinancesPageSize={setFinancesPageSize}
                                project={project}
                                openFinanceEdit={openFinanceEdit}
                                handleDeleteFinance={handleDeleteFinance}
                            />
                        ) : null}

                        {activeTab === "activities" ? (
                            <ProjectActions
                                actionsSearchInput={actionsSearchInput}
                                setActionsSearchInput={setActionsSearchInput}
                                actionsSortBy={actionsSortBy}
                                setActionsSortBy={setActionsSortBy}
                                actionsSortOrder={actionsSortOrder}
                                setActionsSortOrder={setActionsSortOrder}
                                actionsLoading={actionsLoading}
                                actionsError={actionsError}
                                actions={actions}
                                actionsPagination={actionsPagination}
                                actionsPage={actionsPage}
                                actionsPageSize={actionsPageSize}
                                setActionsPage={setActionsPage}
                                setActionsPageSize={setActionsPageSize}
                            />
                        ) : null}
                    </div>
                </div>
            </div>

            {modalOpen ? (
                <div className="fixed inset-3 z-50 mt-0 flex items-center justify-center rounded-2xl bg-slate-950/95 p-3 sm:inset-6 sm:rounded-3xl sm:p-4">
                    <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.25em] auth-accent">
                                    {modalTab === "milestones"
                                        ? editingMilestone
                                            ? "Edit Milestone"
                                            : "New Milestone"
                                        : modalTab === "tasks"
                                          ? editingTask
                                              ? "Edit Task"
                                              : "New Task"
                                          : modalTab === "finance"
                                            ? editingFinance
                                                ? "Edit Finance"
                                                : "New Finance"
                                            : "New Activity"}
                                </p>
                                <p className="mt-1 text-xs auth-text-secondary">
                                    Add details for this project.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-full border auth-border px-3 py-1 text-xs font-semibold auth-text-primary"
                            >
                                Close
                            </button>
                        </div>
                        {modalError ? (
                            <div className="sr-only">{modalError}</div>
                        ) : null}

                        <div className="mt-4 space-y-4">
                            {modalTab === "milestones" ? (
                                <>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                            Title
                                        </p>
                                        <input
                                            value={milestoneDraft.title}
                                            onChange={(e) =>
                                                setMilestoneDraft((prev) => ({
                                                    ...prev,
                                                    title: e.target.value,
                                                }))
                                            }
                                            className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                            placeholder="Milestone title"
                                        />
                                        {showMilestoneTitleError ? (
                                            <p className="mt-1 text-xs text-red-400">
                                                Title is required.
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                                Due Date
                                            </p>
                                            <input
                                                type="date"
                                                value={milestoneDraft.due_date}
                                                onChange={(e) =>
                                                    setMilestoneDraft(
                                                        (prev) => ({
                                                            ...prev,
                                                            due_date:
                                                                e.target.value,
                                                        }),
                                                    )
                                                }
                                                className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                            />
                                            {showMilestoneDateError ? (
                                                <p className="mt-1 text-xs text-red-400">
                                                    Due date is required.
                                                </p>
                                            ) : null}
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                                Status
                                            </p>
                                            <select
                                                value={milestoneDraft.status}
                                                onChange={(e) =>
                                                    setMilestoneDraft(
                                                        (prev) => ({
                                                            ...prev,
                                                            status: e.target
                                                                .value,
                                                        }),
                                                    )
                                                }
                                                className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                            >
                                                <option value="PENDING">
                                                    PENDING
                                                </option>
                                                <option value="IN_PROGRESS">
                                                    IN_PROGRESS
                                                </option>
                                                <option value="COMPLETE">
                                                    COMPLETE
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                            {modalTab === "tasks" ? (
                                <>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                            Milestone
                                        </p>
                                        <select
                                            value={taskDraft.milestone_id}
                                            onChange={(e) =>
                                                setTaskDraft((prev) => ({
                                                    ...prev,
                                                    milestone_id:
                                                        e.target.value,
                                                }))
                                            }
                                            className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                        >
                                            <option value="">
                                                Select milestone
                                            </option>
                                            {milestoneOptions.map(
                                                (milestone) => (
                                                    <option
                                                        key={milestone.id}
                                                        value={milestone.id}
                                                    >
                                                        {milestone.title}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        {showTaskMilestoneError ? (
                                            <p className="mt-1 text-xs text-red-400">
                                                Milestone is required.
                                            </p>
                                        ) : null}
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                            Project Member
                                        </p>
                                        <select
                                            value={taskDraft.owner_id}
                                            onChange={(e) =>
                                                setTaskDraft((prev) => ({
                                                    ...prev,
                                                    owner_id: e.target.value,
                                                }))
                                            }
                                            className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                        >
                                            <option value="">Unassigned</option>
                                            {(project?.projectMembers || [])
                                                .filter(
                                                    (entry) =>
                                                        entry.role !== "VENDOR",
                                                )
                                                .map((entry) => {
                                                    const member =
                                                        entry.member || {};
                                                    return (
                                                        <option
                                                            key={`task-owner-${
                                                                member.id ||
                                                                entry.member_id
                                                            }`}
                                                            value={
                                                                member.id ||
                                                                entry.member_id
                                                            }
                                                        >
                                                            {member.full_name ||
                                                                entry.member_name ||
                                                                "Member"}
                                                        </option>
                                                    );
                                                })}
                                        </select>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                            Title
                                        </p>
                                        <input
                                            value={taskDraft.title}
                                            onChange={(e) =>
                                                setTaskDraft((prev) => ({
                                                    ...prev,
                                                    title: e.target.value,
                                                }))
                                            }
                                            className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                            placeholder="Task title"
                                        />
                                        {showTaskTitleError ? (
                                            <p className="mt-1 text-xs text-red-400">
                                                Title is required.
                                            </p>
                                        ) : null}
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                            Description
                                        </p>
                                        <textarea
                                            value={taskDraft.description}
                                            onChange={(e) =>
                                                setTaskDraft((prev) => ({
                                                    ...prev,
                                                    description: e.target.value,
                                                }))
                                            }
                                            className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                            placeholder="Task description"
                                            rows={3}
                                        />
                                        {showTaskDescriptionError ? (
                                            <p className="mt-1 text-xs text-red-400">
                                                Description is required.
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                                Due Date
                                            </p>
                                            <input
                                                type="date"
                                                value={taskDraft.due_date}
                                                onChange={(e) =>
                                                    setTaskDraft((prev) => ({
                                                        ...prev,
                                                        due_date:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                            />
                                            {showTaskDateError ? (
                                                <p className="mt-1 text-xs text-red-400">
                                                    Due date is required.
                                                </p>
                                            ) : null}
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                                Priority
                                            </p>
                                            <select
                                                value={taskDraft.priority}
                                                onChange={(e) =>
                                                    setTaskDraft((prev) => ({
                                                        ...prev,
                                                        priority:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                            >
                                                <option value="LOW">LOW</option>
                                                <option value="MEDIUM">
                                                    MEDIUM
                                                </option>
                                                <option value="HIGH">
                                                    HIGH
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                                Status
                                            </p>
                                            <select
                                                value={taskDraft.status}
                                                onChange={(e) =>
                                                    setTaskDraft((prev) => ({
                                                        ...prev,
                                                        status: e.target.value,
                                                    }))
                                                }
                                                className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                            >
                                                <option value="OPEN">
                                                    OPEN
                                                </option>
                                                <option value="IN_PROGRESS">
                                                    IN_PROGRESS
                                                </option>
                                                <option value="BLOCKED">
                                                    BLOCKED
                                                </option>
                                                <option value="DONE">
                                                    DONE
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                            {modalTab === "activities" ? (
                                <>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                            Task
                                        </p>
                                        <select
                                            value={actionDraft.task_id}
                                            onChange={(e) =>
                                                setActionDraft((prev) => ({
                                                    ...prev,
                                                    task_id: e.target.value,
                                                }))
                                            }
                                            className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                        >
                                            <option value="">
                                                Select task
                                            </option>
                                            {taskOptions.map((task) => (
                                                <option
                                                    key={task.id}
                                                    value={task.id}
                                                >
                                                    {task.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                            Title
                                        </p>
                                        <input
                                            value={actionDraft.title}
                                            onChange={(e) =>
                                                setActionDraft((prev) => ({
                                                    ...prev,
                                                    title: e.target.value,
                                                }))
                                            }
                                            className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                            placeholder="Activity title"
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                                Due Date
                                            </p>
                                            <input
                                                type="date"
                                                value={actionDraft.due_date}
                                                onChange={(e) =>
                                                    setActionDraft((prev) => ({
                                                        ...prev,
                                                        due_date:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                                Status
                                            </p>
                                            <select
                                                value={actionDraft.status}
                                                onChange={(e) =>
                                                    setActionDraft((prev) => ({
                                                        ...prev,
                                                        status: e.target.value,
                                                    }))
                                                }
                                                className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                            >
                                                <option value="OPEN">
                                                    OPEN
                                                </option>
                                                <option value="DONE">
                                                    DONE
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                            {modalTab === "finance" ? (
                                <>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                            Date
                                        </p>
                                        <input
                                            type="date"
                                            value={financeDraft.entry_date}
                                            onChange={(e) =>
                                                setFinanceDraft((prev) => ({
                                                    ...prev,
                                                    entry_date: e.target.value,
                                                }))
                                            }
                                            className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                        />
                                        {showFinanceDateError ? (
                                            <p className="mt-1 text-xs text-red-400">
                                                Date is required.
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                                Fund Allocated (₹ Cr.)
                                            </p>
                                            <input
                                                type="text"
                                                value={
                                                    financeDraft.fund_allocated
                                                }
                                                onChange={(e) =>
                                                    setFinanceDraft((prev) => ({
                                                        ...prev,
                                                        fund_allocated:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                                placeholder="Allocated amount"
                                            />
                                            {showFinanceAllocatedError ? (
                                                <p className="mt-1 text-xs text-red-400">
                                                    Fund Allocated is required
                                                    and must be greater than 0.
                                                </p>
                                            ) : null}
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                                Fund Expenses (₹ Cr.)
                                            </p>
                                            <input
                                                type="text"
                                                value={
                                                    financeDraft.fund_consumed
                                                }
                                                onChange={(e) =>
                                                    setFinanceDraft((prev) => ({
                                                        ...prev,
                                                        fund_consumed:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                                placeholder="Expense amount"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                            Note
                                        </p>
                                        <textarea
                                            value={financeDraft.note}
                                            onChange={(e) =>
                                                setFinanceDraft((prev) => ({
                                                    ...prev,
                                                    note: e.target.value,
                                                }))
                                            }
                                            className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                            placeholder="Add a note (optional)"
                                            rows={3}
                                        />
                                    </div>
                                </>
                            ) : null}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary"
                                disabled={modalSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreate}
                                disabled={modalSaving}
                                className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30 disabled:opacity-70"
                            >
                                {modalSaving
                                    ? "Saving..."
                                    : editingMilestone || editingTask
                                      ? "Save"
                                      : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {taskDetailOpen && taskDetail ? (
                <div className="fixed inset-3 z-50 mt-0 flex items-center justify-center rounded-2xl bg-slate-950/95 p-3 sm:inset-6 sm:rounded-3xl sm:p-4">
                    <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.25em] auth-accent">
                                    Task Details
                                </p>
                                <p className="mt-1 text-lg font-semibold auth-text-primary">
                                    {taskDetail.title || "Untitled"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeTaskDetail}
                                className="rounded-full border auth-border px-3 py-1 text-xs font-semibold auth-text-primary"
                            >
                                Close
                            </button>
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border auth-border bg-slate-900/30 p-4">
                                <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                    Milestone
                                </p>
                                <p className="mt-2 text-sm auth-text-primary">
                                    {taskDetail.milestone_title ||
                                        taskDetail.milestone_id ||
                                        "—"}
                                </p>
                            </div>
                            <div className="rounded-2xl border auth-border bg-slate-900/30 p-4">
                                <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                    Due Date
                                </p>
                                <p className="mt-2 text-sm auth-text-primary">
                                    {formatDateTime(taskDetail.due_date) || "—"}
                                </p>
                            </div>
                            <div className="rounded-2xl border auth-border bg-slate-900/30 p-4">
                                <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                    Status
                                </p>
                                <p className="mt-2 text-sm auth-text-primary">
                                    {taskDetail.status || "—"}
                                </p>
                            </div>
                            <div className="rounded-2xl border auth-border bg-slate-900/30 p-4">
                                <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                    Priority
                                </p>
                                <p className="mt-2 text-sm auth-text-primary">
                                    {taskDetail.priority || "MEDIUM"}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 rounded-2xl border auth-border bg-slate-900/30 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                Description
                            </p>
                            <p className="mt-2 text-sm auth-text-secondary whitespace-pre-line">
                                {taskDetail.description || "—"}
                            </p>
                        </div>
                        <div className="mt-4 rounded-2xl border auth-border bg-slate-900/30 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                Assigned To
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                                {(() => {
                                    const ownerEntry =
                                        project?.projectMembers?.find(
                                            (entry) =>
                                                entry.member_id ===
                                                    taskDetail.owner_id ||
                                                entry.member?.id ===
                                                    taskDetail.owner_id,
                                        ) || null;
                                    const owner = ownerEntry?.member || null;
                                    if (!owner) {
                                        return (
                                            <span className="text-sm auth-text-secondary">
                                                Unassigned
                                            </span>
                                        );
                                    }
                                    return (
                                        <>
                                            <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-slate-800/70 flex items-center justify-center">
                                                {owner.avatar_path ? (
                                                    <img
                                                        src={owner.avatar_path}
                                                        alt={
                                                            owner.full_name ||
                                                            "Assignee"
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <UserRound
                                                        size={16}
                                                        className="text-slate-400"
                                                    />
                                                )}
                                            </div>
                                            <Link
                                                to={`/members/${
                                                    owner.id ||
                                                    ownerEntry?.member_id
                                                }`}
                                                className="text-sm auth-text-primary underline underline-offset-4"
                                            >
                                                {owner.full_name || "Member"}
                                            </Link>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {fileModalOpen ? (
                <div className="fixed inset-3 z-50 mt-0 flex items-center justify-center rounded-2xl bg-slate-950/95 p-3 sm:inset-6 sm:rounded-3xl sm:p-4">
                    <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.25em] auth-accent">
                                    {fileModalType === "folder"
                                        ? "New Folder"
                                        : "Upload File"}
                                </p>
                                <p className="mt-1 text-xs auth-text-secondary">
                                    {fileModalType === "folder"
                                        ? "Create a folder to organize files."
                                        : "Upload a file to this project."}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeFileModal}
                                className="rounded-full border auth-border px-3 py-1 text-xs font-semibold auth-text-primary"
                            >
                                Close
                            </button>
                        </div>
                        {fileModalError ? (
                            <div className="sr-only">{fileModalError}</div>
                        ) : null}
                        <div className="mt-4 space-y-4">
                            {fileModalType === "folder" ? (
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                        Folder Name
                                    </p>
                                    <input
                                        value={folderName}
                                        onChange={(e) =>
                                            setFolderName(e.target.value)
                                        }
                                        className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                        placeholder="Folder name"
                                    />
                                    {showFolderNameError ? (
                                        <p className="mt-1 text-xs text-red-400">
                                            Folder name is required.
                                        </p>
                                    ) : null}
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                        File
                                    </p>
                                    <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed auth-border bg-slate-900/40 px-4 py-8 text-center text-xs auth-text-secondary">
                                        <Upload size={18} />
                                        <span>
                                            Drag & drop or click to upload
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) =>
                                                setFileUpload(
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                        />
                                    </label>
                                    {fileUpload ? (
                                        <p className="mt-2 text-xs auth-text-secondary">
                                            Selected: {fileUpload.name}
                                        </p>
                                    ) : null}
                                </div>
                            )}
                            <div className="mt-4 space-y-3">
                                <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                    Sharing
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {[
                                        {
                                            value: "only_me",
                                            label: "Only Me",
                                        },
                                        {
                                            value: "all_members",
                                            label: "All Members",
                                        },
                                        {
                                            value: "selected",
                                            label: "Selected Members",
                                        },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() =>
                                                currentFolder?.share_scope
                                                    ? null
                                                    : (() => {
                                                          setFileShareOption(
                                                              option.value,
                                                          );
                                                          if (
                                                              option.value ===
                                                                  "selected" &&
                                                              fileSharedMembers.length ===
                                                                  0
                                                          ) {
                                                              const ids = (
                                                                  project?.projectMembers ||
                                                                  []
                                                              )
                                                                  .filter(
                                                                      (entry) =>
                                                                          entry.role !==
                                                                          "VENDOR",
                                                                  )
                                                                  .map(
                                                                      (entry) =>
                                                                          Number(
                                                                              entry
                                                                                  .member
                                                                                  ?.id ||
                                                                                  entry.member_id,
                                                                          ),
                                                                  )
                                                                  .filter(
                                                                      (value) =>
                                                                          value,
                                                                  );
                                                              setFileSharedMembers(
                                                                  ids,
                                                              );
                                                          }
                                                      })()
                                            }
                                            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                                fileShareOption === option.value
                                                    ? "border-amber-200/70 text-amber-100"
                                                    : "border-white/10 text-slate-400"
                                            }`}
                                            disabled={Boolean(
                                                currentFolder?.share_scope,
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                                {currentFolder?.share_scope ? (
                                    <p className="text-xs auth-text-secondary">
                                        Sharing is inherited from this folder.
                                    </p>
                                ) : null}
                                {fileShareOption === "selected" ? (
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                                            Members
                                        </p>
                                        <select
                                            multiple
                                            value={fileSharedMembers}
                                            onChange={(e) =>
                                                setFileSharedMembers(
                                                    Array.from(
                                                        e.target
                                                            .selectedOptions,
                                                    ).map((opt) => opt.value),
                                                )
                                            }
                                            className="mt-2 w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary"
                                        >
                                            {(project?.projectMembers || [])
                                                .filter(
                                                    (entry) =>
                                                        entry.role !== "VENDOR",
                                                )
                                                .filter((entry) => {
                                                    if (
                                                        currentFolder?.share_scope !==
                                                        "selected"
                                                    ) {
                                                        return true;
                                                    }
                                                    let allowed = [];
                                                    if (
                                                        Array.isArray(
                                                            currentFolder.shared_with,
                                                        )
                                                    ) {
                                                        allowed =
                                                            currentFolder.shared_with;
                                                    } else if (
                                                        typeof currentFolder.shared_with ===
                                                        "string"
                                                    ) {
                                                        try {
                                                            const parsed =
                                                                JSON.parse(
                                                                    currentFolder.shared_with,
                                                                );
                                                            allowed =
                                                                Array.isArray(
                                                                    parsed,
                                                                )
                                                                    ? parsed
                                                                    : [];
                                                        } catch (_) {
                                                            allowed = [];
                                                        }
                                                    }
                                                    const memberId =
                                                        entry.member?.id ||
                                                        entry.member_id;
                                                    return allowed.includes(
                                                        Number(memberId),
                                                    );
                                                })
                                                .map((entry) => {
                                                    const member =
                                                        entry.member || {};
                                                    return (
                                                        <option
                                                            key={`share-${
                                                                member.id ||
                                                                entry.member_id
                                                            }`}
                                                            value={
                                                                member.id ||
                                                                entry.member_id
                                                            }
                                                        >
                                                            {member.full_name ||
                                                                "Member"}
                                                        </option>
                                                    );
                                                })}
                                        </select>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeFileModal}
                                className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary"
                                disabled={fileModalSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={
                                    fileModalType === "folder"
                                        ? handleCreateFolder
                                        : handleUploadFile
                                }
                                disabled={fileModalSaving}
                                className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30 disabled:opacity-70"
                            >
                                {fileModalSaving
                                    ? "Saving..."
                                    : fileModalType === "folder"
                                      ? "Create Folder"
                                      : "Upload File"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
