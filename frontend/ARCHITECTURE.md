# Frontend Architecture

-   React + Vite single-page app.
-   Auth via secure HttpOnly cookies for refresh + access token in memory.
-   Components: auth, dashboard, project-view, vendor-portal, admin-console.
-   State: minimal context + server-driven data; use SWR or React Query for caching.
-   File uploads: direct S3 presigned URLs from backend.

Accessibility & Security

-   Strict input sanitization, CSP headers, and same-site cookies.
-   Vendor views are scoped to assigned projects only.
