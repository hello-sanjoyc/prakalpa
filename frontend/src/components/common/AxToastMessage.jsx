import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Generic toast trigger
export function showToast({
    message = "",
    type = "info", // success | error | info | warn | default
    position = "top-right",
    autoClose = 3000,
    theme = "colored",
    icon,
    ...rest
} = {}) {
    const opts = {
        position,
        autoClose,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme,
        icon,
        ...rest,
    };

    switch (type) {
        case "success":
            return toast.success(message, opts);
        case "error":
            return toast.error(message, opts);
        case "warn":
        case "warning":
            return toast.warn(message, opts);
        case "info":
            return toast.info(message, opts);
        default:
            return toast(message, opts);
    }
}

// Convenience helpers
export const showSuccess = (message, opts) =>
    showToast({ type: "success", message, ...opts });
export const showError = (message, opts) =>
    showToast({ type: "error", message, ...opts });
export const showInfo = (message, opts) =>
    showToast({ type: "info", message, ...opts });
export const showWarning = (message, opts) =>
    showToast({ type: "warning", message, ...opts });

// Container component. Place once at app root (e.g., protected layout) or page-level.
export default function AxToastMessage({
    position = "top-right",
    autoClose = 3000,
    newestOnTop = true,
    closeOnClick = true,
    rtl = false,
    pauseOnFocusLoss = true,
    draggable = true,
    pauseOnHover = true,
    transition = Slide,
    theme = "colored",
    limit = 3,
    ...rest
}) {
    return (
        <ToastContainer
            position={position}
            autoClose={autoClose}
            hideProgressBar={false}
            newestOnTop={newestOnTop}
            closeOnClick={closeOnClick}
            rtl={rtl}
            pauseOnFocusLoss={pauseOnFocusLoss}
            draggable={draggable}
            pauseOnHover={pauseOnHover}
            transition={transition}
            theme={theme}
            limit={limit}
            {...rest}
        />
    );
}
