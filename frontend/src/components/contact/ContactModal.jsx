import React, { useState } from "react";
import { X } from "lucide-react";
import { apiRequest } from "../../lib/apiClient";
import { API_ENDPOINTS } from "../../lib/apiEndpoints";
import {
    showError,
    showSuccess,
} from "../common/AxToastMessage.jsx";

const INITIAL_VALUES = {
    name: "",
    organization_name: "",
    phone_number: "",
    email_address: "",
    message: "",
};

function validate(values) {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

    if (!values.name.trim()) errors.name = "Name is required.";
    if (!values.organization_name.trim()) {
        errors.organization_name = "Organisation name is required.";
    }
    if (!values.phone_number.trim()) {
        errors.phone_number = "Phone number is required.";
    } else if (!phoneRegex.test(values.phone_number.trim())) {
        errors.phone_number = "Enter a valid phone number.";
    }
    if (!values.email_address.trim()) {
        errors.email_address = "Email address is required.";
    } else if (!emailRegex.test(values.email_address.trim())) {
        errors.email_address = "Enter a valid email address.";
    }
    if (!values.message.trim()) {
        errors.message = "Message is required.";
    } else if (values.message.trim().length < 10) {
        errors.message = "Message must be at least 10 characters.";
    }

    return errors;
}

export default function ContactModal({ open, onClose }) {
    const [values, setValues] = useState(INITIAL_VALUES);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    if (!open) return null;

    const handleChange = (field, value) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formErrors = validate(values);
        setErrors(formErrors);
        if (Object.keys(formErrors).length > 0) return;

        try {
            setSubmitting(true);
            await apiRequest(API_ENDPOINTS.CONTACT_US, "POST", values);
            showSuccess("Thank you. We have received your message.");
            setValues(INITIAL_VALUES);
            onClose();
        } catch (err) {
            showError(err.message || "Unable to submit the form.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
            <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-slate-950 p-6 shadow-2xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-white">Contact Us</h2>
                        <p className="mt-1 text-sm text-slate-200">
                            Share your requirements and we will get back to you.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-white/20 p-2 text-white hover:border-white/40"
                        aria-label="Close contact form"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                    <div>
                        <label className="text-sm text-slate-200">Name</label>
                        <input
                            type="text"
                            value={values.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-300/60 focus:outline-none"
                            placeholder="Your full name"
                        />
                        {errors.name ? (
                            <p className="mt-1 text-xs text-rose-300">{errors.name}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="text-sm text-slate-200">Organisation name</label>
                        <input
                            type="text"
                            value={values.organization_name}
                            onChange={(e) =>
                                handleChange("organization_name", e.target.value)
                            }
                            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-300/60 focus:outline-none"
                            placeholder="Organisation name"
                        />
                        {errors.organization_name ? (
                            <p className="mt-1 text-xs text-rose-300">
                                {errors.organization_name}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label className="text-sm text-slate-200">Phone number</label>
                        <input
                            type="tel"
                            value={values.phone_number}
                            onChange={(e) =>
                                handleChange("phone_number", e.target.value)
                            }
                            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-300/60 focus:outline-none"
                            placeholder="+91 98765 43210"
                        />
                        {errors.phone_number ? (
                            <p className="mt-1 text-xs text-rose-300">
                                {errors.phone_number}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label className="text-sm text-slate-200">Email address</label>
                        <input
                            type="email"
                            value={values.email_address}
                            onChange={(e) =>
                                handleChange("email_address", e.target.value)
                            }
                            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-300/60 focus:outline-none"
                            placeholder="you@organisation.com"
                        />
                        {errors.email_address ? (
                            <p className="mt-1 text-xs text-rose-300">
                                {errors.email_address}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label className="text-sm text-slate-200">Message</label>
                        <textarea
                            value={values.message}
                            onChange={(e) => handleChange("message", e.target.value)}
                            rows={5}
                            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-300/60 focus:outline-none"
                            placeholder="Tell us what you need."
                        />
                        {errors.message ? (
                            <p className="mt-1 text-xs text-rose-300">{errors.message}</p>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/30 transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {submitting ? "Submitting..." : "Submit"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
