import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import usePageTitle from "../../lib/usePageTitle";
import { API_ENDPOINTS } from "../../lib/apiEndpoints";
import { apiRequest } from "../../lib/apiClient";
import {
    showError,
    showSuccess,
} from "../../components/common/AxToastMessage.jsx";
import { getCurrentFinancialYear } from "../../utility/helper.js";

const statusBadge = {
    GREEN: "bg-green-500 text-emerald-100",
    AMBER: "bg-orange-500 text-amber-900",
    RED: "bg-red-500 text-rose-100",
};

const initialForm = {
    code: "",
    title: "",
    department_id: "",
    owner_id: "",
    fin_year: getCurrentFinancialYear(),
    budget: "",
    fund_allocated: "",
    fund_consumed: "",
    current_stage_id: "",
    rag_status: "GREEN",
    rag_override_reason: "",
    description: "",
    start_date: "",
    end_date: "",
    revised_start_date: "",
    revised_end_date: "",
    actual_start_date: "",
    actual_end_date: "",
};

export default function ProjectCreate() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [memberOptions, setMemberOptions] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    usePageTitle(form?.title ? `Create ${form.title}` : "Create Project");

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const res = await apiRequest(
                    API_ENDPOINTS.DEPARTMENT_OPTIONS,
                    "GET"
                );
                if (!isMounted) return;
                setDepartmentOptions(res?.departments || res || []);
            } catch (err) {
                showError(err.message || "Failed to load departments.");
            }
        })();
        return () => {
            isMounted = false;
        };
    }, []);

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
            if (name === "start_date") {
                const startDate = value ? new Date(value) : null;
                if (startDate && !isNaN(startDate)) {
                    const year = startDate.getFullYear();
                    const month = startDate.getMonth(); // 0-indexed
                    const startYear = month >= 3 ? year : year - 1;
                    const endYearShort = String(startYear + 1).slice(-2);
                    updated.fin_year = `${startYear}-${endYearShort}`;
                } else {
                    updated.fin_year = "";
                }
            }
            return updated;
        });
        setFormErrors((prev) => ({
            ...prev,
            [name]: "",
            ...(name === "start_date" ? { fin_year: "" } : {}),
        }));
        if (name === "department_id") {
            setMemberOptions([]);
        }

        if (name === "fin_year" && value) {
            const fyPattern = /^\d{4}-\d{2}$/;
            if (!fyPattern.test(value)) {
                setFormErrors((prev) => ({
                    ...prev,
                    fin_year: "Use format YYYY-YY (e.g., 2025-26)",
                }));
            }
        }
    };

    const validateForm = () => {
        const errors = {};
        const fyPattern = /^\d{4}-\d{2}$/;

        if (!form.title) errors.title = "Title is required";
        if (!form.description) errors.description = "Overview is required";
        if (!form.department_id)
            errors.department_id = "Department is required";
        if (!form.owner_id) errors.owner_id = "Owner is required";
        if (!form.fin_year) errors.fin_year = "Financial year is required";
        if (form.fin_year && !fyPattern.test(form.fin_year))
            errors.fin_year = "Use format YYYY-YY (e.g., 2025-26)";

        if (!form.start_date) errors.start_date = "Start date is required";
        if (!form.end_date) errors.end_date = "End date is required";

        if (
            form.fund_allocated !== "" &&
            form.budget !== "" &&
            Number(form.fund_allocated) > Number(form.budget)
        ) {
            errors.fund_allocated = "Fund Allocated cannot exceed Budget";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    useEffect(() => {
        if (!form.department_id) {
            setMemberOptions([]);
            return;
        }
        let isMounted = true;
        (async () => {
            setMembersLoading(true);
            try {
                const res = await apiRequest(
                    API_ENDPOINTS.DEPARTMENT_MEMBERS(form.department_id || 0),
                    "GET"
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showError("Please fix the highlighted fields.");
            return;
        }
        setSaving(true);
        try {
            await apiRequest(API_ENDPOINTS.PROJECT_CREATE, "POST", {
                ...form,
                current_stage_id: form.current_stage_id || 0,
                fund_allocated:
                    form.fund_allocated === "" ? 0 : form.fund_allocated,
                fund_consumed:
                    form.fund_consumed === "" ? 0 : form.fund_consumed,
            });
            showSuccess("Project created.");
            navigate("/projects");
        } catch (err) {
            showError(err.message || "Failed to create project.");
        } finally {
            setSaving(false);
        }
    };

    const labelClass = "text-[11px] uppercase tracking-[0.25em] auth-accent";
    const fieldWrapper = "rounded-2xl border auth-border auth-surface p-4";
    const inputClass =
        "w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary focus:border-amber-200/60 focus:outline-none";

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="w-3/4">
                        <p className="text-xs uppercase tracking-[0.25em] auth-accent">
                            Projects
                        </p>
                        <div className="text-3xl font-semibold auth-text-primary flex items-center gap-2">
                            <span
                                className={`inline-block h-5 w-5 rounded-full ${
                                    statusBadge[form.rag_status] ||
                                    "bg-white/30"
                                }`}
                                title={form.rag_status || "N/A"}
                            />
                            <div className="w-full">
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    disabled={saving}
                                    className="w-full rounded-xl border border-white/60 bg-transparent px-4 py-2 text-3xl font-semibold auth-text-primary focus:border-amber-200/70 focus:outline-none"
                                    placeholder="Project title"
                                />
                                {formErrors.title && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {formErrors.title}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-8 mt-2">
                            {/* <div className="w-1/2 flex items-center gap-2 text-sm auth-text-secondary">
                                <span className="w-[80px]">Code:</span>
                                <input
                                    name="code"
                                    value={form.code}
                                    onChange={handleChange}
                                    disabled={saving}
                                    className="w-[200px] rounded-xl border border-white/60 bg-transparent px-3 py-2 text-sm auth-text-primary focus:border-amber-200/70 focus:outline-none"
                                    placeholder="INF-001"
                                />
                            </div> */}
                            {/* <div className="w-1/2 flex items-center justify-end text-sm auth-text-secondary">
                                <div className="w-[200px] me-2">
                                    Current Stage:{" "}
                                </div>
                                <select
                                    name="current_stage_id"
                                    value={form.current_stage_id || ""}
                                    onChange={handleChange}
                                    disabled={saving}
                                    className="w-[200px] rounded-xl border border-white/60 bg-transparent px-3 py-2 text-sm auth-text-primary focus:border-amber-200/70 focus:outline-none"
                                >
                                    <option value="">Select stage</option>
                                    <option value="1">Stage 1</option>
                                    <option value="2">Stage 2</option>
                                    <option value="3">Stage 3</option>
                                </select>
                            </div> */}
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Link
                            to="/projects"
                            className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary"
                        >
                            Back to list
                        </Link>
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
                                disabled={saving}
                                maxLength={500}
                                className="w-full min-h-[140px] rounded-2xl border border-white/60 bg-slate-900/30 px-3 py-3 text-sm auth-text-primary focus:border-amber-200/70 focus:outline-none"
                                placeholder="Project overview..."
                            />
                            {form.description?.length ? (
                                <p className="text-xs text-slate-400 text-right">
                                    {form.description.length}/500
                                </p>
                            ) : null}
                            {formErrors.description && (
                                <p className="mt-1 text-xs text-red-400">
                                    {formErrors.description}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className={fieldWrapper}>
                                <p className={labelClass}>Department</p>
                                <select
                                    name="department_id"
                                    value={form.department_id}
                                    onChange={handleChange}
                                    disabled={saving}
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
                                {formErrors.department_id && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {formErrors.department_id}
                                    </p>
                                )}
                            </div>
                            <div className={fieldWrapper}>
                                <p className={labelClass}>Owner</p>
                                <select
                                    name="owner_id"
                                    value={form.owner_id}
                                    onChange={handleChange}
                                    disabled={
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
                                {formErrors.owner_id && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {formErrors.owner_id}
                                    </p>
                                )}
                            </div>
                            <div className={fieldWrapper}>
                                <p className={labelClass}>Financial Year</p>
                                <input
                                    name="fin_year"
                                    value={form.fin_year}
                                    onChange={handleChange}
                                    disabled={saving}
                                    className={inputClass}
                                    placeholder="2025-26"
                                />
                                {formErrors.fin_year && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {formErrors.fin_year}
                                    </p>
                                )}
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
                                    disabled={saving}
                                    className={inputClass}
                                    placeholder="1000"
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
                                    disabled={saving}
                                    className={inputClass}
                                    placeholder="1000"
                                />
                                {formErrors.fund_allocated && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {formErrors.fund_allocated}
                                    </p>
                                )}
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
                                    disabled={saving}
                                    className={inputClass}
                                    placeholder="0"
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
                                    disabled={saving}
                                    className={inputClass}
                                />
                                {formErrors.start_date && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {formErrors.start_date}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <p className={labelClass}>Planned End</p>
                                <input
                                    name="end_date"
                                    type="date"
                                    value={form.end_date}
                                    onChange={handleChange}
                                    disabled={saving}
                                    className={inputClass}
                                />
                                {formErrors.end_date && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {formErrors.end_date}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <p className={labelClass}>Revised Start</p>
                                <input
                                    name="revised_start_date"
                                    type="date"
                                    value={form.revised_start_date}
                                    onChange={handleChange}
                                    disabled={saving}
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
                                    disabled={saving}
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
                                    disabled={saving}
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
                                    disabled={saving}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setForm(initialForm)}
                        disabled={saving}
                        className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary disabled:opacity-60"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-5 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30 disabled:opacity-70"
                    >
                        {saving ? "Creating..." : "Create project"}
                    </button>
                </div>
            </form>
        </div>
    );
}
