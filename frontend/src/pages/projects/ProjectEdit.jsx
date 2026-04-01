import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    UserMinus,
    UserPlus,
} from "lucide-react";
import usePageTitle from "../../lib/usePageTitle";
import { API_ENDPOINTS } from "../../lib/apiEndpoints";
import { apiRequest } from "../../lib/apiClient";
import {
    showError,
    showSuccess,
} from "../../components/common/AxToastMessage.jsx";

const statusBadge = {
    GREEN: "bg-green-500 text-emerald-100",
    AMBER: "bg-orange-500 text-amber-900",
    RED: "bg-red-500 text-rose-100",
};

const emptyProject = {
    code: "",
    title: "",
    department_id: "",
    owner_id: "",
    fin_year: "",
    budget: "",
    fund_allocated: "",
    fund_consumed: 0,
    current_stage_id: "",
    rag_status: "GREEN",
    rag_override_reason: "",
    start_date: "",
    end_date: "",
    revised_start_date: "",
    revised_end_date: "",
    actual_start_date: "",
    actual_end_date: "",
    description: "",
};

export default function ProjectEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ ...emptyProject, id });
    const [initialData, setInitialData] = useState({ ...emptyProject, id });
    const [stages, setStages] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [memberOptions, setMemberOptions] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [projectMembers, setProjectMembers] = useState([
        { member_id: "", role: "" },
    ]);
    const [initialProjectMembers, setInitialProjectMembers] = useState([
        { member_id: "", role: "" },
    ]);
    const [roleOptions, setRoleOptions] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [roleDraftName, setRoleDraftName] = useState("");
    const [roleSaving, setRoleSaving] = useState(false);
    const [roleTargetIndex, setRoleTargetIndex] = useState(null);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [vendorsLoading, setVendorsLoading] = useState(false);
    const [availableVendorSelection, setAvailableVendorSelection] = useState(
        [],
    );
    const [selectedVendorSelection, setSelectedVendorSelection] = useState([]);
    const [initialVendorIds, setInitialVendorIds] = useState([]);
    const [initialVendorsApplied, setInitialVendorsApplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    usePageTitle(form?.title ? `Edit ${form.title}` : "Edit Project");

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                setError(null);
                const [projectRes, deptRes] = await Promise.all([
                    apiRequest(API_ENDPOINTS.PROJECT_EDIT(id), "GET"),
                    apiRequest(API_ENDPOINTS.DEPARTMENT_OPTIONS, "GET"),
                ]);
                if (!isMounted) return;
                const payload = projectRes?.project || projectRes || {};
                const stageList = payload?.stages || [];
                const departmentList = deptRes?.departments || deptRes || [];
                const memberRows = Array.isArray(
                    payload?.projectMembers || payload?.project_members,
                )
                    ? (payload.projectMembers || payload.project_members || [])
                          .filter((row) => row.role !== "VENDOR")
                          .map((row) => ({
                              member_id: row.member_id || "",
                              role: row.role || "",
                          }))
                    : [];
                const vendorIds = Array.isArray(
                    payload?.projectMembers || payload?.project_members,
                )
                    ? (payload.projectMembers || payload.project_members || [])
                          .filter((row) => row.role === "VENDOR")
                          .map((row) => Number(row.member_id))
                          .filter(Boolean)
                    : [];
                const hydrated = {
                    ...emptyProject,
                    ...payload,
                    current_stage_id:
                        payload?.current_stage_id ||
                        (stageList[0]?.id ?? emptyProject.current_stage_id),
                };
                setStages(stageList);
                setDepartmentOptions(departmentList);
                setForm(hydrated);
                setInitialData(hydrated);
                const nextMembers = memberRows.length
                    ? memberRows
                    : [{ member_id: "", role: "" }];
                setProjectMembers(nextMembers);
                setInitialProjectMembers(nextMembers);
                setInitialVendorIds(vendorIds);
                setInitialVendorsApplied(false);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        const numericFields = [
            "department_id",
            "owner_id",
            "current_stage_id",
            "budget",
            "fund_allocated",
            "fund_consumed",
        ];
        const nextValue =
            numericFields.includes(name) && value !== ""
                ? Number(value)
                : value;
        setForm((prev) => {
            const updated = { ...prev, [name]: nextValue };
            if (name === "department_id") {
                updated.owner_id = "";
            }
            return updated;
        });
        if (name === "department_id") {
            setMemberOptions([]);
            setProjectMembers([{ member_id: "", role: "" }]);
            setInitialProjectMembers([{ member_id: "", role: "" }]);
            setVendorOptions([]);
            setSelectedVendors([]);
            setAvailableVendorSelection([]);
            setSelectedVendorSelection([]);
            setInitialVendorIds([]);
            setInitialVendorsApplied(false);
        }
    };

    useEffect(() => {
        if (!form.department_id) {
            setMemberOptions([]);
            setMembersLoading(false);
            return;
        }
        let isMounted = true;
        (async () => {
            setMembersLoading(true);
            try {
                const res = await apiRequest(
                    API_ENDPOINTS.DEPARTMENT_MEMBERS(form.department_id || 0),
                    "GET",
                );
                if (!isMounted) return;
                setMemberOptions(res?.members || res || []);
            } catch (err) {
                if (!isMounted) return;
                showError(err.message || "Failed to load members.");
            } finally {
                if (!isMounted) return;
                setMembersLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [form.department_id]);

    useEffect(() => {
        if (!id) return;
        let isMounted = true;
        (async () => {
            setRolesLoading(true);
            try {
                const params = new URLSearchParams({
                    project_id: String(id),
                });
                const res = await apiRequest(
                    `${
                        API_ENDPOINTS.PROJECT_MEMBER_ROLES
                    }?${params.toString()}`,
                    "GET",
                );
                if (!isMounted) return;
                setRoleOptions(res?.roles || res || []);
            } catch (err) {
                if (!isMounted) return;
                showError(err.message || "Failed to load roles.");
            } finally {
                if (!isMounted) return;
                setRolesLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        if (!form.department_id) {
            setVendorOptions([]);
            setSelectedVendors([]);
            setVendorsLoading(false);
            return;
        }
        if (initialVendorsApplied) return;
        let isMounted = true;
        (async () => {
            setVendorsLoading(true);
            try {
                const res = await apiRequest(
                    API_ENDPOINTS.DEPARTMENT_VENDORS(form.department_id || 0),
                    "GET",
                );
                if (!isMounted) return;
                const vendors = res?.vendors || res || [];
                if (!initialVendorIds.length) {
                    setVendorOptions(vendors);
                    setSelectedVendors([]);
                } else {
                    const selected = vendors.filter((vendor) =>
                        initialVendorIds.includes(Number(vendor.id)),
                    );
                    const available = vendors.filter(
                        (vendor) =>
                            !initialVendorIds.includes(Number(vendor.id)),
                    );
                    setSelectedVendors(selected);
                    setVendorOptions(available);
                }
                setAvailableVendorSelection([]);
                setSelectedVendorSelection([]);
                setInitialVendorsApplied(true);
            } catch (err) {
                if (!isMounted) return;
                showError(err.message || "Failed to load vendors.");
            } finally {
                if (!isMounted) return;
                setVendorsLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [form.department_id, initialVendorIds, initialVendorsApplied]);

    const validateForm = () => {
        const errors = {};
        const validMembers = projectMembers.filter(
            (member) => member.member_id && member.role,
        );
        const hasValidMember = validMembers.length > 0;
        if (!hasValidMember) {
            errors.project_members =
                "Add at least one project member with a role";
        } else {
            const memberIds = validMembers.map((member) =>
                String(member.member_id),
            );
            const uniqueMemberIds = new Set(memberIds);
            if (uniqueMemberIds.size !== memberIds.length) {
                errors.project_members =
                    "Each project member can only have one role";
            } else {
                const rolePairs = validMembers.map(
                    (member) => `${member.member_id}::${member.role}`,
                );
                const uniqueRolePairs = new Set(rolePairs);
                if (uniqueRolePairs.size !== rolePairs.length) {
                    errors.project_members =
                        "Duplicate member-role selections are not allowed";
                }
            }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showError("Please fix the highlighted fields.");
            return;
        }
        setSaving(true);
        try {
            const membersPayload = projectMembers.filter(
                (member) => member.member_id && member.role,
            );
            const vendorIds = selectedVendors.map((vendor) => vendor.id);
            await apiRequest(API_ENDPOINTS.PROJECT_EDIT(id), "PUT", {
                ...form,
                project_members: membersPayload,
                vendor_ids: vendorIds,
            });
            showSuccess("Project updated.");
            navigate(`/projects/${id}`);
        } catch (err) {
            showError(err.message || "Failed to update project.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await apiRequest(API_ENDPOINTS.PROJECT_EDIT(id), "DELETE");
            showSuccess("Project deleted.");
            navigate("/projects");
        } catch (err) {
            showError(err.message || "Failed to delete project.");
        }
    };

    const labelClass = "text-[11px] uppercase tracking-[0.25em] auth-accent";
    const fieldWrapper = "rounded-2xl border auth-border auth-surface p-4";
    const inputClass =
        "w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary focus:border-amber-200/60 focus:outline-none";
    const vendorSelectClass =
        "h-[140px] w-full rounded-xl border auth-border/60 bg-slate-900/60 px-3 py-2 text-sm auth-text-primary focus:border-amber-200/60 focus:outline-none";

    const handleMemberRowChange = (idx, key, value) => {
        setProjectMembers((prev) =>
            prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
        );
        setFormErrors((prev) => ({ ...prev, project_members: "" }));
    };

    const handleRoleChange = (idx, value) => {
        if (value === "__new__") {
            setRoleTargetIndex(idx);
            setRoleDraftName("");
            setRoleModalOpen(true);
            return;
        }
        handleMemberRowChange(idx, "role", value);
    };

    const handleCreateRole = async () => {
        const name = roleDraftName.trim();
        if (!name) {
            showError("Role name is required.");
            return;
        }
        setRoleSaving(true);
        try {
            const res = await apiRequest(
                API_ENDPOINTS.PROJECT_MEMBER_ROLES,
                "POST",
                { name, project_id: Number(id) },
            );
            const created = res?.role || res || { name };
            setRoleOptions((prev) => {
                const exists = prev.some(
                    (role) =>
                        String(role.name || "").toLowerCase() ===
                        name.toLowerCase(),
                );
                if (exists) return prev;
                const next = [...prev, created];
                next.sort((a, b) =>
                    String(a.name || "").localeCompare(String(b.name || "")),
                );
                return next;
            });
            if (roleTargetIndex !== null) {
                handleMemberRowChange(
                    roleTargetIndex,
                    "role",
                    created.name || name,
                );
            }
            showSuccess("Role added.");
            setRoleModalOpen(false);
            setRoleTargetIndex(null);
            setRoleDraftName("");
        } catch (err) {
            showError(err.message || "Failed to add role.");
        } finally {
            setRoleSaving(false);
        }
    };

    const handleAvailableVendorSelect = (e) => {
        const selected = Array.from(e.target.selectedOptions).map(
            (opt) => opt.value,
        );
        setAvailableVendorSelection(selected);
    };

    const handleChosenVendorSelect = (e) => {
        const selected = Array.from(e.target.selectedOptions).map(
            (opt) => opt.value,
        );
        setSelectedVendorSelection(selected);
    };

    const moveVendorsToSelected = () => {
        if (!availableVendorSelection.length) return;
        const selectedIds = new Set(availableVendorSelection);
        setVendorOptions((prevAvailable) => {
            const move = prevAvailable.filter((v) =>
                selectedIds.has(String(v.id)),
            );
            if (!move.length) return prevAvailable;
            setSelectedVendors((prevSelected) => {
                const existingIds = new Set(
                    prevSelected.map((v) => String(v.id)),
                );
                const additions = move.filter(
                    (v) => !existingIds.has(String(v.id)),
                );
                return [...prevSelected, ...additions];
            });
            return prevAvailable.filter((v) => !selectedIds.has(String(v.id)));
        });
        setAvailableVendorSelection([]);
    };

    const moveVendorsToAvailable = () => {
        if (!selectedVendorSelection.length) return;
        const selectedIds = new Set(selectedVendorSelection);
        setSelectedVendors((prevSelected) => {
            const move = prevSelected.filter((v) =>
                selectedIds.has(String(v.id)),
            );
            if (!move.length) return prevSelected;
            setVendorOptions((prevAvailable) => {
                const existingIds = new Set(
                    prevAvailable.map((v) => String(v.id)),
                );
                const additions = move.filter(
                    (v) => !existingIds.has(String(v.id)),
                );
                return [...prevAvailable, ...additions];
            });
            return prevSelected.filter((v) => !selectedIds.has(String(v.id)));
        });
        setSelectedVendorSelection([]);
    };

    const addMemberRow = () => {
        setProjectMembers((prev) => [...prev, { member_id: "", role: "" }]);
    };

    const removeMemberRow = (idx) => {
        setProjectMembers((prev) => prev.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="w-full space-y-3">
                        <p className="text-xs uppercase tracking-[0.25em] auth-accent">
                            Projects
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xl font-semibold auth-text-primary sm:text-2xl lg:text-3xl">
                            <span
                                className={`inline-block h-4 w-4 rounded-full sm:h-5 sm:w-5 ${
                                    statusBadge[form.rag_status] ||
                                    "bg-white/30"
                                }`}
                                title={form.rag_status || "N/A"}
                            />
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                disabled={saving}
                                className="min-w-0 flex-1 rounded-xl border border-white/60 bg-transparent px-3 py-2 text-xl font-semibold auth-text-primary focus:border-amber-200/70 focus:outline-none sm:text-2xl lg:text-3xl"
                                placeholder="Project title"
                            />
                        </div>
                        <div className="grid gap-4 text-sm auth-text-secondary md:grid-cols-[1fr,1.2fr] md:items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-[80px] shrink-0">Code:</span>
                                <span className="truncate">{form.code}</span>
                            </div>
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
                                <div className="shrink-0 md:text-right">
                                    Current Stage:
                                </div>
                                <select
                                    name="current_stage_id"
                                    value={form.current_stage_id || ""}
                                    onChange={handleChange}
                                    disabled={loading || saving}
                                    className="w-full rounded-xl border border-white/60 bg-transparent px-3 py-2 text-sm auth-text-primary focus:border-amber-200/70 focus:outline-none md:max-w-[240px]"
                                >
                                    <option value="">Select stage</option>
                                    {stages.map((stage) => (
                                        <option key={stage.id} value={stage.id}>
                                            {stage.stage_slug ||
                                                `Stage ${
                                                    stage.stage_order ||
                                                    stage.id
                                                }`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
                        <Link
                            to={`/projects/${id}`}
                            className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary"
                        >
                            View
                        </Link>
                        <Link
                            to="/projects"
                            className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30"
                        >
                            Back to list
                        </Link>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="rounded-full bg-rose-500/80 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/30"
                        >
                            Delete
                        </button>
                    </div>
                </header>

                <div className="grid gap-4 lg:grid-cols-3">
                    <section className="lg:col-span-2 rounded-3xl border auth-border auth-surface p-6 auth-shadow bg-gradient-to-br from-white/5 to-white/0 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold auth-text-primary">
                                Overview
                            </h2>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                disabled={loading || saving}
                                className="w-full min-h-[140px] rounded-2xl border border-white/60 bg-slate-900/30 px-3 py-3 text-sm auth-text-primary focus:border-amber-200/70 focus:outline-none"
                                placeholder="Project overview..."
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className={fieldWrapper}>
                                <p className={labelClass}>Department</p>
                                <select
                                    name="department_id"
                                    value={form.department_id}
                                    onChange={handleChange}
                                    disabled={loading || saving}
                                    className={`${inputClass} bg-slate-900/60`}
                                >
                                    <option value="">Select department</option>
                                    {departmentOptions.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name ||
                                                dept.code ||
                                                `#${dept.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={fieldWrapper}>
                                <p className={labelClass}>Owner</p>
                                <select
                                    name="owner_id"
                                    value={form.owner_id}
                                    onChange={handleChange}
                                    disabled={
                                        loading ||
                                        saving ||
                                        !form.department_id ||
                                        membersLoading
                                    }
                                    className={`${inputClass} bg-slate-900/60`}
                                >
                                    <option value="">Select owner</option>
                                    {memberOptions.map((member) => (
                                        <option
                                            key={member.id}
                                            value={member.id}
                                        >
                                            {member.full_name ||
                                                member.email ||
                                                `#${member.id}`}
                                            {member.designation
                                                ? ` — ${member.designation}`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={fieldWrapper}>
                                <p className={labelClass}>Financial Year</p>
                                <input
                                    name="fin_year"
                                    value={form.fin_year}
                                    onChange={handleChange}
                                    disabled={loading || saving}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className={fieldWrapper}>
                                <p className={labelClass}>Budget (₹ Crore)</p>
                                <input
                                    name="budget"
                                    type="number"
                                    value={form.budget}
                                    onChange={handleChange}
                                    disabled={loading || saving}
                                    className={inputClass}
                                />
                            </div>
                            <div className={fieldWrapper}>
                                <p className={labelClass}>
                                    Fund Allocated (₹ Crore)
                                </p>
                                <input
                                    name="fund_allocated"
                                    type="number"
                                    value={form.fund_allocated}
                                    onChange={handleChange}
                                    disabled={loading || saving}
                                    className={inputClass}
                                />
                            </div>
                            <div className={fieldWrapper}>
                                <p className={labelClass}>
                                    Fund Consumed (₹ Crore)
                                </p>
                                <input
                                    name="fund_consumed"
                                    type="number"
                                    value={form.fund_consumed}
                                    onChange={handleChange}
                                    disabled={loading || saving}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border auth-border auth-surface p-6 auth-shadow bg-gradient-to-br from-white/5 to-white/0 space-y-4">
                        <h3 className="text-lg font-semibold auth-text-primary">
                            Dates
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <p className={labelClass}>Planned Start</p>
                                <input
                                    name="start_date"
                                    type="date"
                                    value={form.start_date}
                                    onChange={handleChange}
                                    disabled={loading || saving}
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <p className={labelClass}>Planned End</p>
                                <input
                                    name="end_date"
                                    type="date"
                                    value={form.end_date}
                                    onChange={handleChange}
                                    disabled={loading || saving}
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <p className={labelClass}>Revised Start</p>
                                <input
                                    name="revised_start_date"
                                    type="date"
                                    value={form.revised_start_date}
                                    onChange={handleChange}
                                    disabled={loading || saving}
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <p className={labelClass}>Revised End</p>
                                <input
                                    name="revised_end_date"
                                    type="date"
                                    value={form.revised_end_date}
                                    onChange={handleChange}
                                    disabled={loading || saving}
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <p className={labelClass}>Actual Start</p>
                                <input
                                    name="actual_start_date"
                                    type="date"
                                    value={form.actual_start_date}
                                    onChange={handleChange}
                                    disabled={loading || saving}
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <p className={labelClass}>Actual End</p>
                                <input
                                    name="actual_end_date"
                                    type="date"
                                    value={form.actual_end_date}
                                    onChange={handleChange}
                                    disabled={loading || saving}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <section className="rounded-3xl border auth-border auth-surface p-6 auth-shadow bg-gradient-to-br from-white/5 to-white/0 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold auth-text-primary">
                                Project Members
                            </h2>
                            {formErrors.project_members ? (
                                <p className="text-xs text-red-400">
                                    {formErrors.project_members}
                                </p>
                            ) : null}
                        </div>
                        <div className="space-y-3">
                            {projectMembers.map((row, idx) => (
                                <div
                                    key={`pm-row-${idx}`}
                                    className="grid items-center gap-3 sm:grid-cols-[2fr,1fr] md:grid-cols-[2fr,1fr,auto]"
                                >
                                    <select
                                        value={row.member_id}
                                        onChange={(e) =>
                                            handleMemberRowChange(
                                                idx,
                                                "member_id",
                                                e.target.value,
                                            )
                                        }
                                        disabled={
                                            saving ||
                                            loading ||
                                            !form.department_id ||
                                            membersLoading
                                        }
                                        className={`${inputClass} bg-slate-900/60`}
                                    >
                                        <option value="">Members</option>
                                        {memberOptions.map((member) => (
                                            <option
                                                key={member.id}
                                                value={member.id}
                                            >
                                                {member.full_name ||
                                                    member.email ||
                                                    `#${member.id}`}
                                                {member.designation
                                                    ? ` — ${member.designation}`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={row.role}
                                        onChange={(e) =>
                                            handleRoleChange(
                                                idx,
                                                e.target.value,
                                            )
                                        }
                                        disabled={
                                            saving || loading || rolesLoading
                                        }
                                        className={`${inputClass} bg-slate-900/60`}
                                    >
                                        <option value="">Project Role</option>
                                        {roleOptions.map((role) => (
                                            <option
                                                key={role.id || role.name}
                                                value={role.name}
                                            >
                                                {role.name}
                                            </option>
                                        ))}
                                        <option value="__new__">
                                            + New Role
                                        </option>
                                    </select>
                                    {projectMembers.length > 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => removeMemberRow(idx)}
                                            disabled={saving || loading}
                                            className="text-red-300 hover:text-red-200 disabled:opacity-50 transition-colors sm:justify-self-end md:justify-self-center"
                                            aria-label="Remove project member"
                                        >
                                            <UserMinus
                                                size={16}
                                                strokeWidth={2}
                                            />
                                        </button>
                                    ) : null}
                                </div>
                            ))}
                            {projectMembers.at(-1)?.member_id &&
                            projectMembers.at(-1)?.role ? (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={addMemberRow}
                                        disabled={saving || loading}
                                        className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary disabled:opacity-60 flex items-center gap-2"
                                        aria-label="Add project member"
                                    >
                                        <UserPlus size={16} strokeWidth={2} />
                                        Add Member
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </section>

                    <section className="rounded-3xl border auth-border auth-surface p-6 auth-shadow bg-gradient-to-br from-white/5 to-white/0 space-y-4">
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold auth-text-primary">
                                Vendors
                            </h2>
                        </div>
                        <div className="flex flex-col gap-4 text-sm auth-text-secondary md:flex-row md:items-center md:justify-between">
                            <select
                                multiple
                                size={4}
                                value={availableVendorSelection.map(String)}
                                onChange={handleAvailableVendorSelect}
                                disabled={
                                    saving ||
                                    loading ||
                                    !form.department_id ||
                                    vendorsLoading
                                }
                                className={vendorSelectClass}
                            >
                                {vendorOptions.map((vendor) => (
                                    <option key={vendor.id} value={vendor.id}>
                                        {vendor.full_name ||
                                            vendor.email ||
                                            `#${vendor.id}`}
                                    </option>
                                ))}
                            </select>
                            <div className="flex w-full items-center justify-center gap-3 md:w-auto md:flex-col">
                                <button
                                    type="button"
                                    onClick={moveVendorsToSelected}
                                    disabled={
                                        saving ||
                                        loading ||
                                        !form.department_id ||
                                        vendorsLoading ||
                                        !availableVendorSelection.length
                                    }
                                    className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary disabled:opacity-60 flex items-center gap-2"
                                    aria-label="Add vendor"
                                >
                                    <ChevronRightIcon
                                        size={16}
                                        strokeWidth={2}
                                    />
                                    <span className="md:hidden">Add</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={moveVendorsToAvailable}
                                    disabled={
                                        saving ||
                                        loading ||
                                        !form.department_id ||
                                        vendorsLoading ||
                                        !selectedVendorSelection.length
                                    }
                                    className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary disabled:opacity-60 flex items-center gap-2"
                                    aria-label="Remove vendor"
                                >
                                    <ChevronLeftIcon
                                        size={16}
                                        strokeWidth={2}
                                    />
                                    <span className="md:hidden">Remove</span>
                                </button>
                            </div>
                            <select
                                multiple
                                size={4}
                                value={selectedVendorSelection.map(String)}
                                onChange={handleChosenVendorSelect}
                                disabled={
                                    saving ||
                                    loading ||
                                    !form.department_id ||
                                    vendorsLoading
                                }
                                className={vendorSelectClass}
                            >
                                {selectedVendors.map((vendor) => (
                                    <option key={vendor.id} value={vendor.id}>
                                        {vendor.full_name ||
                                            vendor.email ||
                                            `#${vendor.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setForm(initialData);
                            setProjectMembers(initialProjectMembers);
                            setInitialVendorIds(initialVendorIds);
                            setInitialVendorsApplied(false);
                        }}
                        disabled={saving || loading}
                        className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary disabled:opacity-60"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={saving || loading}
                        className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-5 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30 disabled:opacity-70"
                    >
                        {saving ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </form>

            {roleModalOpen ? (
                <div className="fixed left-1/2 top-1/2 z-50 flex h-[80vh] w-[92vw] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl bg-slate-950 p-4 sm:h-3/4 sm:w-3/4">
                    <div className="w-full max-w-md rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.25em] auth-accent">
                                    New Role
                                </p>
                                <p className="mt-1 text-xs auth-text-secondary">
                                    Add a role for project members.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setRoleModalOpen(false);
                                    setRoleTargetIndex(null);
                                    setRoleDraftName("");
                                }}
                                className="rounded-full border auth-border px-3 py-1 text-xs font-semibold auth-text-primary"
                            >
                                Close
                            </button>
                        </div>
                        <div className="mt-4 space-y-2">
                            <p className={labelClass}>Role name</p>
                            <input
                                value={roleDraftName}
                                onChange={(e) =>
                                    setRoleDraftName(e.target.value)
                                }
                                className={inputClass}
                                placeholder="e.g., QA Lead"
                                disabled={roleSaving}
                            />
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setRoleModalOpen(false);
                                    setRoleTargetIndex(null);
                                    setRoleDraftName("");
                                }}
                                className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary"
                                disabled={roleSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateRole}
                                disabled={roleSaving}
                                className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30 disabled:opacity-70"
                            >
                                {roleSaving ? "Saving..." : "Add role"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
