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

Frontend Folder Structure

```text
frontend/
├── .env
├── .gitignore
├── ARCHITECTURE.md
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.cjs
├── tailwind.config.cjs
├── vite.config.js
├── public/ # static assets served as-is
│   └── images/
│       └── logo.png
└── src/ # application source code
    ├── App.jsx # route composition and app shell
    ├── index.css # global styles + Tailwind layers
    ├── main.jsx # React bootstrap entrypoint
    ├── components/ # reusable UI building blocks
    │   ├── ChartDemo.jsx
    │   ├── DashboardSample.jsx
    │   ├── ProjectViewSample.jsx
    │   ├── common/
    │   │   ├── AxDropdown.jsx
    │   │   ├── AxImageCropper.jsx
    │   │   └── AxToastMessage.jsx
    │   ├── contact/
    │   │   └── ContactModal.jsx
    │   └── project/
    │       ├── ProjectActions.jsx
    │       ├── ProjectFiles.jsx
    │       ├── ProjectFinance.jsx
    │       ├── ProjectMilestones.jsx
    │       └── ProjectTasks.jsx
    ├── contexts/ # React context providers
    │   └── AuthContext.jsx
    ├── layouts/ # shared page/layout scaffolding
    │   ├── AuthHeader.jsx
    │   ├── AuthLayout.jsx
    │   ├── AuthSidebar.jsx
    │   └── PublicLayout.jsx
    ├── lib/ # API client and shared hooks/utilities
    │   ├── apiClient.js
    │   ├── apiEndpoints.js
    │   └── usePageTitle.js
    ├── pages/ # route-level screens
    │   ├── Admin.jsx
    │   ├── Dashboard.jsx
    │   ├── Home.jsx
    │   ├── Login.jsx
    │   ├── Tasks.jsx
    │   ├── departments/
    │   │   ├── DepartmentCreate.jsx
    │   │   ├── DepartmentEdit.jsx
    │   │   ├── DepartmentForm.jsx
    │   │   ├── DepartmentView.jsx
    │   │   └── DepartmentsList.jsx
    │   ├── members/
    │   │   ├── MemberCreate.jsx
    │   │   ├── MemberEdit.jsx
    │   │   ├── MemberForm.jsx
    │   │   ├── MemberView.jsx
    │   │   └── MembersList.jsx
    │   └── projects/
    │       ├── ProjectCreate.jsx
    │       ├── ProjectEdit.jsx
    │       ├── ProjectView.jsx
    │       ├── ProjectsDashboard.jsx
    │       └── ProjectsList.jsx
    └── utility/
        └── helper.js
```

Notes

-   Role-based UI is implemented with a simple `AuthProvider` in `src/contexts/AuthContext.jsx`. The header includes buttons to switch roles (`guest`, `user`, `admin`) for testing role-based rendering.
-   Routes are defined in `src/App.jsx`. Example pages: `src/pages/Home.jsx`, `src/pages/Admin.jsx` (admin-guarded), and `src/components/ChartDemo.jsx` (Recharts demo).
-   If you add project-specific build commands, update this README with exact commands and Node version.
-   Generated/build directories like `node_modules/` and `dist/` are intentionally excluded from the structure above.
