import React, { useEffect, useMemo, useState } from "react";
import usePageTitle from "../../lib/usePageTitle";
import { API_ENDPOINTS } from "../../lib/apiEndpoints";
import { apiRequest } from "../../lib/apiClient";
import {
    showError,
    showSuccess,
} from "../../components/common/AxToastMessage.jsx";

const labelClass = "text-[11px] uppercase tracking-[0.25em] auth-accent";
const fieldWrapper = "rounded-2xl border auth-border auth-surface p-4";
const inputClass =
    "w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary focus:border-amber-200/60 focus:outline-none";

const initialForm = {
    name: "",
    code: "",
    parent_id: "",
};

export default function DepartmentForm({
    mode = "create",
    departmentId = null,
    onSuccess = () => {},
}) {
    usePageTitle(mode === "edit" ? "Edit Department" : "Create Department");
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(mode === "edit");
    const [formErrors, setFormErrors] = useState({});
    const [departmentOptions, setDepartmentOptions] = useState([]);

    const filteredOptions = useMemo(() => {
        if (!departmentId) return departmentOptions;
        return departmentOptions.filter(
            (dept) => String(dept.id) !== String(departmentId)
        );
    }, [departmentOptions, departmentId]);

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

    useEffect(() => {
        if (mode !== "edit" || !departmentId) return;
        let isMounted = true;
        (async () => {
            try {
                const res = await apiRequest(
                    API_ENDPOINTS.DEPARTMENT_VIEW(departmentId),
                    "GET"
                );
                if (!isMounted) return;
                const data = res?.department || res || {};
                setForm({
                    name: data.name || "",
                    code: data.code || "",
                    parent_id: data.parent_id ?? "",
                });
            } catch (err) {
                showError(err.message || "Failed to load department.");
            } finally {
                if (isMounted) setLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [mode, departmentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const numericFields = ["parent_id"];
        const nextValue =
            numericFields.includes(name) && value !== ""
                ? Number(value)
                : value;
        setForm((prev) => ({ ...prev, [name]: nextValue }));
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const errors = {};
        if (!form.name) errors.name = "Name is required";
        if (!form.code) errors.code = "Code is required";
        if (
            departmentId &&
            form.parent_id !== "" &&
            String(form.parent_id) === String(departmentId)
        ) {
            errors.parent_id = "Parent cannot be the department itself";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return showError("Please fix highlighted fields.");
        setSaving(true);
        try {
            const payload = {
                ...form,
                parent_id:
                    form.parent_id === "" || form.parent_id === null
                        ? null
                        : form.parent_id,
            };
            if (mode === "edit") {
                await apiRequest(
                    API_ENDPOINTS.DEPARTMENT_EDIT(departmentId),
                    "PUT",
                    payload
                );
                showSuccess("Department updated.");
            } else {
                await apiRequest(
                    API_ENDPOINTS.DEPARTMENT_CREATE,
                    "POST",
                    payload
                );
                showSuccess("Department created.");
                setForm(initialForm);
            }
            onSuccess();
        } catch (err) {
            showError(err.message || "Failed to save department.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="px-4 py-6 text-sm auth-text-secondary">
                Loading department...
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <div className={fieldWrapper}>
                    <p className={labelClass}>Department name</p>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        disabled={saving}
                        className={inputClass}
                        placeholder="Operations"
                    />
                    {formErrors.name && (
                        <p className="mt-1 text-xs text-red-400">
                            {formErrors.name}
                        </p>
                    )}
                </div>
                <div className={fieldWrapper}>
                    <p className={labelClass}>Code</p>
                    <input
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        disabled={saving}
                        className={inputClass}
                        placeholder="OPS"
                    />
                    {formErrors.code && (
                        <p className="mt-1 text-xs text-red-400">
                            {formErrors.code}
                        </p>
                    )}
                </div>
                <div className={fieldWrapper}>
                    <p className={labelClass}>Parent department</p>
                    <select
                        name="parent_id"
                        value={form.parent_id}
                        onChange={handleChange}
                        disabled={saving}
                        className={inputClass}
                    >
                        <option value="">No parent</option>
                        {filteredOptions.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name || `Dept #${dept.id}`}
                            </option>
                        ))}
                    </select>
                    {formErrors.parent_id && (
                        <p className="mt-1 text-xs text-red-400">
                            {formErrors.parent_id}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-5 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30 disabled:opacity-70"
                >
                    {saving
                        ? mode === "edit"
                            ? "Updating..."
                            : "Saving..."
                        : mode === "edit"
                        ? "Update department"
                        : "Create department"}
                </button>
            </div>
        </form>
    );
}
