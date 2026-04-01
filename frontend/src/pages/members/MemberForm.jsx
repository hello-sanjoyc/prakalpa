import React, { useEffect, useState } from "react";
import usePageTitle from "../../lib/usePageTitle";
import { API_ENDPOINTS } from "../../lib/apiEndpoints";
import { apiRequest } from "../../lib/apiClient";
import AxImageCropper from "../../components/common/AxImageCropper";
import {
    showError,
    showSuccess,
} from "../../components/common/AxToastMessage.jsx";

const labelClass = "text-[11px] uppercase tracking-[0.25em] auth-accent";
const fieldWrapper = "rounded-2xl border auth-border auth-surface p-4";
const inputClass =
    "w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary focus:border-amber-200/60 focus:outline-none";

const initialForm = {
    full_name: "",
    email: "",
    phone: "",
    secondary_phone: "",
    whatsapp: "",
    designation: "",
    department_id: "",
    username: "",
    role_id: "",
};

export default function MemberForm({
    mode = "create",
    memberId = null,
    onSuccess = () => {},
}) {
    usePageTitle(mode === "edit" ? "Edit Member" : "Create Member");
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(mode === "edit");
    const [formErrors, setFormErrors] = useState({});
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);
    const [memberMeta, setMemberMeta] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [avatarPreviewIsObjectUrl, setAvatarPreviewIsObjectUrl] =
        useState(false);
    const [avatarError, setAvatarError] = useState("");
    const [cropSource, setCropSource] = useState("");
    const [cropFileMeta, setCropFileMeta] = useState(null);

    useEffect(() => {
        return () => {
            if (cropSource) {
                URL.revokeObjectURL(cropSource);
            }
        };
    }, [cropSource]);

    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreviewIsObjectUrl) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview, avatarPreviewIsObjectUrl]);

    useEffect(() => {
        if (mode !== "edit" || !memberMeta?.avatar_path || avatarFile) return;
        setAvatarPreview(memberMeta.avatar_path);
        setAvatarPreviewIsObjectUrl(false);
    }, [mode, memberMeta, avatarFile]);

    const resolveRoleId = (data, options) => {
        if (!data || !options.length) return "";
        if (data.role_id) return data.role_id;
        const roleSlugs =
            typeof data.role_slugs === "string"
                ? data.role_slugs
                      .split(",")
                      .map((role) => role.trim())
                      .filter(Boolean)
                : [];
        const roleNames =
            typeof data.role_names === "string"
                ? data.role_names
                      .split(",")
                      .map((role) => role.trim())
                      .filter(Boolean)
                : [];
        const targetSlug = roleSlugs[0];
        const targetName = roleNames[0];
        const match = options.find((role) => {
            if (targetSlug && role.slug) {
                return role.slug.toLowerCase() === targetSlug.toLowerCase();
            }
            if (targetName && role.name) {
                return role.name.toLowerCase() === targetName.toLowerCase();
            }
            return false;
        });
        return match ? match.id : "";
    };

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
            try {
                const res = await apiRequest(API_ENDPOINTS.ROLE_OPTIONS, "GET");
                if (!isMounted) return;
                setRoleOptions(res?.roles || res || []);
            } catch (err) {
                showError(err.message || "Failed to load roles.");
            }
        })();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (mode !== "edit" || !memberId) return;
        let isMounted = true;
        (async () => {
            try {
                const res = await apiRequest(
                    API_ENDPOINTS.MEMBER_VIEW(memberId),
                    "GET"
                );
                if (!isMounted) return;
                const data = res?.member || res || {};
                setForm({
                    full_name: data.full_name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    secondary_phone: data.secondary_phone || "",
                    whatsapp: data.whatsapp || "",
                    designation: data.designation || "",
                    department_id: data.department_id || "",
                    username: data.username || data.user_username || "",
                    role_id: data.role_id || "",
                });
                setMemberMeta(data);
            } catch (err) {
                showError(err.message || "Failed to load member.");
            } finally {
                if (isMounted) setLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [mode, memberId]);

    useEffect(() => {
        if (mode !== "edit" || !memberMeta || form.role_id) return;
        const nextRoleId = resolveRoleId(memberMeta, roleOptions);
        if (nextRoleId) {
            setForm((prev) => ({ ...prev, role_id: nextRoleId }));
        }
    }, [mode, memberMeta, roleOptions, form.role_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const numericFields = ["department_id", "role_id"];
        const nextValue =
            numericFields.includes(name) && value !== ""
                ? Number(value)
                : value;
        setForm((prev) => ({ ...prev, [name]: nextValue }));
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const errors = {};
        const selectedRole = roleOptions.find(
            (role) => String(role.id) === String(form.role_id)
        );
        const roleName = selectedRole?.name || selectedRole?.slug || "";
        const bypassDepartment = ["super admin", "auditor"].includes(
            roleName.trim().toLowerCase()
        );
        if (!form.full_name) errors.full_name = "Name is required";
        if (!form.designation) errors.designation = "Designation is required";
        if (!form.department_id && !bypassDepartment)
            errors.department_id = "Department is required";
        if (!form.email) errors.email = "Email is required";
        if (!form.phone) errors.phone = "Phone is required";
        if (!form.username) errors.username = "Username is required";
        if (!form.role_id && form.role_id !== 0)
            errors.role_id = "Role is required";
        const phonePattern = /^\d{10}$/;
        if (form.phone && !phonePattern.test(String(form.phone))) {
            errors.phone = "Phone must be 10 digits";
        }
        if (
            form.secondary_phone &&
            !phonePattern.test(String(form.secondary_phone))
        ) {
            errors.secondary_phone = "Secondary phone must be 10 digits";
        }
        if (form.whatsapp && !phonePattern.test(String(form.whatsapp))) {
            errors.whatsapp = "WhatsApp must be 10 digits";
        }
        if (avatarError) errors.avatar = avatarError;
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        setAvatarError("");
        setAvatarFile(null);
        if (avatarPreview && avatarPreviewIsObjectUrl) {
            URL.revokeObjectURL(avatarPreview);
            setAvatarPreview("");
        }
        setAvatarPreviewIsObjectUrl(false);
        setFormErrors((prev) => ({ ...prev, avatar: "" }));
        if (!file) {
            setAvatarFile(null);
            return;
        }
        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setAvatarFile(null);
            setAvatarError("Only JPG and PNG images are allowed");
            setFormErrors((prev) => ({
                ...prev,
                avatar: "Only JPG and PNG images are allowed",
            }));
            return;
        }
        if (cropSource) {
            URL.revokeObjectURL(cropSource);
        }
        const previewUrl = URL.createObjectURL(file);
        setCropSource(previewUrl);
        setCropFileMeta(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return showError("Please fix highlighted fields.");
        setSaving(true);
        try {
            const payload = {
                ...form,
                department_id:
                    form.department_id === "" || form.department_id === null
                        ? 0
                        : form.department_id,
            };
            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                if (value === undefined || value === null) return;
                formData.append(key, value);
            });
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }
            let savedMember = null;
            if (mode === "edit") {
                const res = await apiRequest(
                    API_ENDPOINTS.MEMBER_EDIT(memberId),
                    "PUT",
                    formData
                );
                savedMember = res?.member || res || null;
                showSuccess("Member updated.");
            } else {
                const res = await apiRequest(
                    API_ENDPOINTS.MEMBER_CREATE,
                    "POST",
                    formData
                );
                savedMember = res?.member || res || null;
                showSuccess("Member created.");
                setForm(initialForm);
                setAvatarFile(null);
                setAvatarError("");
            }
            onSuccess();
        } catch (err) {
            showError(err.message || "Failed to save member.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="px-4 py-6 text-sm auth-text-secondary">
                Loading member...
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <div className={fieldWrapper}>
                    <p className={labelClass}>Full name</p>
                    <input
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        disabled={saving}
                        className={inputClass}
                        placeholder="Alex Doe"
                    />
                    {formErrors.full_name && (
                        <p className="mt-1 text-xs text-red-400">
                            {formErrors.full_name}
                        </p>
                    )}
                </div>
                <div className={fieldWrapper}>
                    <p className={labelClass}>Designation</p>
                    <input
                        name="designation"
                        value={form.designation}
                        onChange={handleChange}
                        disabled={saving}
                        className={inputClass}
                        placeholder="Project Officer"
                    />
                    {formErrors.designation && (
                        <p className="mt-1 text-xs text-red-400">
                            {formErrors.designation}
                        </p>
                    )}
                </div>

                <div className={fieldWrapper}>
                    <p className={labelClass}>Role</p>
                    <select
                        name="role_id"
                        value={form.role_id}
                        onChange={handleChange}
                        disabled={saving}
                        className={`${inputClass}`}
                    >
                        <option value="">Select role</option>
                        {roleOptions.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name || role.slug || `Role #${role.id}`}
                            </option>
                        ))}
                    </select>
                    {formErrors.role_id && (
                        <p className="mt-1 text-xs text-red-400">
                            {formErrors.role_id}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className={fieldWrapper}>
                    <p className={labelClass}>
                        Avatar (crop to 250-512px, JPG/PNG, 50KB max)
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleAvatarChange}
                            disabled={saving}
                            className={inputClass}
                        />
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Cropped avatar preview"
                                className="h-16 w-16 rounded-2xl border auth-border object-cover"
                            />
                        ) : null}
                    </div>
                    {avatarFile ? (
                        <p className="mt-2 text-xs auth-text-secondary">
                            Selected: {avatarFile.name}
                        </p>
                    ) : null}
                    {formErrors.avatar && (
                        <p className="mt-1 text-xs text-red-400">
                            {formErrors.avatar}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className={fieldWrapper}>
                    <p className={labelClass}>Email</p>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        disabled={saving}
                        className={inputClass}
                        placeholder="user@example.com"
                    />
                    {formErrors.email && (
                        <p className="mt-1 text-xs text-red-400">
                            {formErrors.email}
                        </p>
                    )}
                </div>
                <div className={fieldWrapper}>
                    <p className={labelClass}>Username</p>
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        disabled={saving}
                        className={inputClass}
                        placeholder="username"
                    />
                    {formErrors.username && (
                        <p className="mt-1 text-xs text-red-400">
                            {formErrors.username}
                        </p>
                    )}
                </div>

                <div className={fieldWrapper}>
                    <p className={labelClass}>Department</p>
                    <select
                        name="department_id"
                        value={form.department_id}
                        onChange={handleChange}
                        disabled={saving}
                        className={`${inputClass}`}
                    >
                        <option value="">Select department</option>
                        {departmentOptions.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name || dept.code || `Dept #${dept.id}`}
                            </option>
                        ))}
                    </select>
                    {formErrors.department_id && (
                        <p className="mt-1 text-xs text-red-400">
                            {formErrors.department_id}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className={fieldWrapper}>
                    <p className={labelClass}>Phone</p>
                    <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        disabled={saving}
                        className={inputClass}
                        placeholder="9000000000"
                    />
                    {formErrors.phone && (
                        <p className="mt-1 text-xs text-red-400">
                            {formErrors.phone}
                        </p>
                    )}
                </div>
                <div className={fieldWrapper}>
                    <p className={labelClass}>Secondary Phone</p>
                    <input
                        name="secondary_phone"
                        value={form.secondary_phone}
                        onChange={handleChange}
                        disabled={saving}
                        className={inputClass}
                        placeholder="Optional"
                    />
                    {formErrors.secondary_phone && (
                        <p className="mt-1 text-xs text-red-400">
                            {formErrors.secondary_phone}
                        </p>
                    )}
                </div>
                <div className={fieldWrapper}>
                    <p className={labelClass}>WhatsApp</p>
                    <input
                        name="whatsapp"
                        value={form.whatsapp}
                        onChange={handleChange}
                        disabled={saving}
                        className={inputClass}
                        placeholder="9000000000"
                    />
                    {formErrors.whatsapp && (
                        <p className="mt-1 text-xs text-red-400">
                            {formErrors.whatsapp}
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
                        ? "Update member"
                        : "Create member"}
                </button>
            </div>
            {cropSource ? (
                <AxImageCropper
                    imageSrc={cropSource}
                    fileName={cropFileMeta?.name}
                    fileType={cropFileMeta?.type}
                    aspectOptions={[{ label: "1:1", value: 1 }]}
                    onCancel={() => {
                        setCropSource("");
                        setCropFileMeta(null);
                    }}
                    onError={(message) => {
                        setAvatarFile(null);
                        setAvatarError(message);
                        setFormErrors((prev) => ({
                            ...prev,
                            avatar: message,
                        }));
                        setCropSource("");
                        setCropFileMeta(null);
                    }}
                    onComplete={(file) => {
                        if (avatarPreview && avatarPreviewIsObjectUrl) {
                            URL.revokeObjectURL(avatarPreview);
                        }
                        const previewUrl = URL.createObjectURL(file);
                        setAvatarFile(file);
                        setAvatarPreview(previewUrl);
                        setAvatarPreviewIsObjectUrl(true);
                        setAvatarError("");
                        setFormErrors((prev) => ({ ...prev, avatar: "" }));
                        setCropSource("");
                        setCropFileMeta(null);
                    }}
                />
            ) : null}
        </form>
    );
}
