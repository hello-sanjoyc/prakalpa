import { useEffect } from "react";

export function usePageTitle(title) {
    useEffect(() => {
        const appName = import.meta.env.VITE_APP_NAME || "PMS";
        const appSubTitle = import.meta.env.VITE_APP_SUB_TITLE || "";
        const nextTitle = title
            ? `${title} | ${appName} - ${appSubTitle}`
            : `${appName} - ${appSubTitle}`;
        document.title = nextTitle;
    }, [title]);
}

export default usePageTitle;
