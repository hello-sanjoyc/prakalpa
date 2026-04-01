import axios from "axios";
import { showError } from "../components/common/AxToastMessage.jsx";

const BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.NEXT_PUBLIC_API_URL ||
    "";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
    headers: {},
});

// Add access token to each request
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("authToken");
            if (token) config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Refresh token helper
async function refreshToken() {
    const refreshToken =
        typeof window !== "undefined"
            ? localStorage.getItem("refreshToken")
            : null;
    if (!refreshToken) return null;

    try {
        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refresh_token: refreshToken,
        });
        if (res?.data?.access_token) {
            localStorage.setItem("authToken", res.data.access_token);
            return res.data.access_token;
        }
    } catch (err) {
        console.warn("Token refresh failed:", err.message);
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    return null;
}

// Handle 401s and map errors
let __ax_redirect_scheduled = false;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config || {};

        const redirectToLogin = () => {
            if (typeof window !== "undefined") {
                try {
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("refreshToken");
                } catch (_) {}
                if (
                    !/\/login$/.test(window.location.pathname) &&
                    !__ax_redirect_scheduled
                ) {
                    __ax_redirect_scheduled = true;
                    try {
                        showError("Session expired. Redirecting to login...", {
                            autoClose: 3000,
                        });
                    } catch (_) {}
                    setTimeout(() => window.location.replace("/login"), 3000);
                }
            }
        };

        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            const newToken = await refreshToken();
            if (newToken) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            }
            redirectToLogin();
        }

        const status = error.response?.status;
        const messageMap = {
            400: "Bad Request — Please check your input.",
            401: "Unauthorised — Please log in again.",
            402: "Payment Required — Please renew your plan.",
            403: "Forbidden — You don't have access.",
            404: "Not Found — The requested resource does not exist.",
            408: "Request Timeout — Please try again.",
            409: "Conflict — Resource already exists.",
            422: "Validation Error — Please verify your data.",
            429: "Too Many Requests — Slow down.",
            500: "Internal Server Error — Try again later.",
            502: "Bad Gateway — Temporary issue.",
            503: "Service Unavailable — Try again later.",
            504: "Gateway Timeout — The server took too long to respond.",
        };

        const errorMessage =
            error.response?.data?.message ||
            messageMap[status] ||
            "Unexpected error occurred.";

        if (status === 401) redirectToLogin();

        return Promise.reject(new Error(errorMessage));
    }
);

// Unified request helper
export async function apiRequest(
    endpoint,
    method = "GET",
    data = null,
    options = {}
) {
    const isFormData = data instanceof FormData;

    const config = {
        url: endpoint,
        method,
        data,
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...(options.headers || {}),
        },
        ...options,
    };

    const response = await api(config);
    return response.data;
}

export default api;
