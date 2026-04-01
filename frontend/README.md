# frontend (React + Vite)

This folder contains a minimal Vite + React scaffold configured with Tailwind CSS, React Query, React Router and a sample Recharts chart.

Quick start

1. From the `frontend/` folder install dependencies (choose one package manager):

```bash
cd frontend
npm install
# or
pnpm install
```

2. Run the dev server:

```bash
npm run dev
# or
pnpm dev
```

Notes

-   Role-based UI is implemented with a simple `AuthProvider` in `src/contexts/AuthContext.jsx`. The header includes buttons to switch roles (`guest`, `user`, `admin`) for testing role-based rendering.
-   Routes are defined in `src/App.jsx`. Example pages: `src/pages/Home.jsx`, `src/pages/Admin.jsx` (admin-guarded), and `src/components/ChartDemo.jsx` (Recharts demo).
-   If you add project-specific build commands, update this README with exact commands and Node version.
