import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../lib/apiClient";
import {
    showError,
    showSuccess,
} from "../components/common/AxToastMessage.jsx";
import usePageTitle from "../lib/usePageTitle";

export default function Login() {
    usePageTitle("Login");
    const navigate = useNavigate();
    const { setRole, setUser } = useAuth();
    const [formValues, setFormValues] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const appName = import.meta.env.VITE_APP_NAME || "PMS";
    const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(
        /\/$/,
        "",
    );

    const validateForm = () => {
        const { email, password } = formValues;
        const errors = {};
        let isValid = true;

        if (email === "") {
            isValid = false;
            errors.email = "Email address is required";
        }

        if (password === "") {
            isValid = false;
            errors.password = "Password is required";
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleFieldChange = (field, value) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return false;
        }

        setLoading(true);
        try {
            const data = await apiRequest("/auth/login", "POST", {
                email: formValues.email,
                password: formValues.password,
            });

            if (!data?.token) {
                throw new Error(
                    data?.message ||
                        data?.error ||
                        "Login failed. Please check your credentials.",
                );
            }

            localStorage.setItem("authToken", data.token);
            setRole(data?.user?.role || "user");
            if (data?.user) {
                setUser(data.user);
            }
            showSuccess("Logged in successfully.");
            navigate("/dashboard");
        } catch (err) {
            showError(err.message || "Unable to login. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-6 py-12">
            <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur">
                <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-amber-300/30 via-rose-400/30 to-indigo-500/30 blur-3xl" />
                <div className="absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-400/30 via-sky-400/30 to-indigo-500/30 blur-3xl" />
                <div className="relative z-10 space-y-6">
                    <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-100">
                        Welcome back
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold text-white">
                            Sign in
                        </h1>
                        <p className="mt-2 text-slate-200">
                            Access your {appName} workspace. The login unlocks
                            your dashboards, projects, and tasks.
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm text-slate-200">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formValues.email}
                                onChange={(e) =>
                                    handleFieldChange("email", e.target.value)
                                }
                                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-300/60 focus:outline-none"
                                placeholder="you@example.com"
                            />
                            {formErrors.email && (
                                <p className="mt-2 text-xs text-red-300">
                                    {formErrors.email}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-slate-200">
                                Password
                            </label>
                            <input
                                type="password"
                                value={formValues.password}
                                onChange={(e) =>
                                    handleFieldChange(
                                        "password",
                                        e.target.value,
                                    )
                                }
                                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-300/60 focus:outline-none"
                                placeholder="••••••••"
                            />
                            {formErrors.password && (
                                <p className="mt-2 text-xs text-red-300">
                                    {formErrors.password}
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/30 transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? "Signing in..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
