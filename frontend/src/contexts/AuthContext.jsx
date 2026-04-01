import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const parseToken = (token) => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(
                decodeURIComponent(
                    atob(base64)
                        .split("")
                        .map(function (c) {
                            return (
                                "%" +
                                ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                            );
                        })
                        .join("")
                )
            );
            return payload;
        } catch (e) {
            return null;
        }
    };

    const primaryRole = (payload) =>
        payload?.role || (payload?.roles && payload.roles[0]) || "user";
    const primaryDesignation = (payload) =>
        payload?.designation || payload?.roleName || "Member";

    const getInitialRole = () => {
        if (typeof window === "undefined") return "guest";
        const token = localStorage.getItem("authToken");
        const payload = token ? parseToken(token) : null;
        return payload ? primaryRole(payload) : "guest";
    };

    const getInitialUser = () => {
        if (typeof window === "undefined") return null;
        const token = localStorage.getItem("authToken");
        const payload = token ? parseToken(token) : null;
        if (!payload) return null;
        const {
            sub,
            username,
            email,
            fullName,
            roleName,
            roles,
            designation,
            department,
            departmentId,
            phone,
            secondaryPhone,
            whatsapp,
        } = payload;
        return {
            id: sub,
            username,
            email,
            fullName,
            role: primaryRole(payload),
            roleName,
            roles,
            designation: primaryDesignation(payload),
            department,
            departmentId,
            phone,
            secondaryPhone,
            whatsapp,
        };
    };

    const [role, setRole] = useState(getInitialRole);
    const [user, setUser] = useState(getInitialUser);

    // Keep role in sync with token presence (page refresh or manual token removal)
    useEffect(() => {
        if (typeof window === "undefined") return;
        const syncState = () => {
            const token = localStorage.getItem("authToken");
            const payload = token ? parseToken(token) : null;
            setRole(payload ? primaryRole(payload) : "guest");
            setUser(
                payload
                    ? {
                          id: payload.sub,
                          username: payload.username,
                          email: payload.email,
                          fullName: payload.fullName,
                          role: primaryRole(payload),
                          roleName: payload.roleName,
                          roles: payload.roles,
                          designation: primaryDesignation(payload),
                          department: payload.department,
                          departmentId: payload.departmentId,
                          phone: payload.phone,
                          secondaryPhone: payload.secondaryPhone,
                          whatsapp: payload.whatsapp,
                      }
                    : null
            );
        };
        // initial sync on mount
        syncState();
        const syncRole = () => {
            const hasToken = Boolean(localStorage.getItem("authToken"));
            const payload = hasToken
                ? parseToken(localStorage.getItem("authToken"))
                : null;
            setRole(payload ? primaryRole(payload) : "guest");
            setUser(
                payload
                    ? {
                          id: payload.sub,
                          username: payload.username,
                          email: payload.email,
                          fullName: payload.fullName,
                          role: primaryRole(payload),
                          roles: payload.roles,
                          roleName: payload.roleName,
                          designation: primaryDesignation(payload),
                          department: payload.department,
                          departmentId: payload.departmentId,
                          phone: payload.phone,
                          secondaryPhone: payload.secondaryPhone,
                          whatsapp: payload.whatsapp,
                      }
                    : null
            );
        };
        window.addEventListener("storage", syncRole);
        return () => window.removeEventListener("storage", syncRole);
    }, []);

    return (
        <AuthContext.Provider value={{ role, setRole, user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
