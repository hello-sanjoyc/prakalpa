import React from "react";
import { useAuth } from "../contexts/AuthContext";
import usePageTitle from "../lib/usePageTitle";

export default function Admin() {
    usePageTitle("Admin");
    const { role } = useAuth();

    if (role !== "admin") {
        return (
            <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow text-red-600">
                <h2 className="text-xl font-semibold">Access Denied</h2>
                <p className="mt-2">
                    You need the <strong>admin</strong> role to view this page.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold">Admin Console</h2>
            <p className="mt-2 text-slate-700">
                Here are admin-only controls (placeholder).
            </p>
        </div>
    );
}
