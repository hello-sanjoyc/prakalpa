const BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.NEXT_PUBLIC_API_URL ||
    "";

export const API_ENDPOINTS = {
    GEO_LOCATION: `https://ipapi.co/json/`,

    COUNTRIES: `${BASE_URL}/utility/countries`,
    COUNTRY_TIMEZONE: `${BASE_URL}/utility/countries/timezones`,
    PLAN_FEATURES: `${BASE_URL}/utility/plan-features`,

    REGISTER: `${BASE_URL}/auth/register`,
    LOGIN: `${BASE_URL}/auth/login`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    PROFILE: `${BASE_URL}/auth/profile`,
    PROFILE_EDIT: `${BASE_URL}/auth/profile`,
    CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,
    CHANGE_AVATAR: `${BASE_URL}/auth/change-avatar`,

    MEMBER_OPTIONS: `${BASE_URL}/auth/members/options`,
    ROLE_OPTIONS: `${BASE_URL}/auth/roles/options`,

    MEMBERS: `${BASE_URL}/members`,
    MEMBERS_BY_PROJECT_MEMBER: (memberId) =>
        `${BASE_URL}/members?project_member=${memberId}`,
    MEMBER_CREATE: `${BASE_URL}/members`,
    MEMBER_EDIT: (memberId) => `${BASE_URL}/members/${memberId}`,
    MEMBER_DELETE: (memberId) => `${BASE_URL}/members/${memberId}`,
    MEMBER_VIEW: (memberId) => `${BASE_URL}/members/${memberId}`,

    DEPARTMENTS: `${BASE_URL}/departments`,
    DEPARTMENT_CREATE: `${BASE_URL}/departments`,
    DEPARTMENT_EDIT: (deptId) => `${BASE_URL}/departments/${deptId}`,
    DEPARTMENT_DELETE: (deptId) => `${BASE_URL}/departments/${deptId}`,
    DEPARTMENT_VIEW: (deptId) => `${BASE_URL}/departments/${deptId}`,

    DEPARTMENT_MEMBERS: (deptId) => `${BASE_URL}/departments/${deptId}/members`,
    DEPARTMENT_STAGES: (deptId) => `${BASE_URL}/departments/${deptId}/stages`,
    DEPARTMENT_VENDORS: (deptId) => `${BASE_URL}/departments/${deptId}/vendors`,
    DEPARTMENT_OPTIONS: `${BASE_URL}/departments/options`,

    PROJECTS: `${BASE_URL}/projects`,
    PROJECT_CREATE: `${BASE_URL}/projects`,
    PROJECT_EDIT: (projectId) => `${BASE_URL}/projects/${projectId}`,
    PROJECT_DELETE: (projectId) => `${BASE_URL}/projects/${projectId}`,
    PROJECT_VIEW: (projectId) => `${BASE_URL}/projects/${projectId}`,
    PROJECT_MILESTONES: (projectId) =>
        `${BASE_URL}/projects/${projectId}/milestones`,
    PROJECT_MILESTONE_UPDATE: (projectId, milestoneId) =>
        `${BASE_URL}/projects/${projectId}/milestones/${milestoneId}`,
    PROJECT_MILESTONE_DELETE: (projectId, milestoneId) =>
        `${BASE_URL}/projects/${projectId}/milestones/${milestoneId}`,
    PROJECT_FILES: (projectId) => `${BASE_URL}/projects/${projectId}/files`,
    PROJECT_FILES_FOLDER: (projectId) =>
        `${BASE_URL}/projects/${projectId}/files/folder`,
    PROJECT_FILES_UPLOAD: (projectId) =>
        `${BASE_URL}/projects/${projectId}/files/upload`,
    PROJECT_FILES_DELETE: (projectId, fileId) =>
        `${BASE_URL}/projects/${projectId}/files/${fileId}`,
    PROJECT_FILES_DOWNLOAD: (projectId, fileId) =>
        `${BASE_URL}/projects/${projectId}/files/${fileId}/download`,
    PROJECT_TASKS: (projectId) => `${BASE_URL}/projects/${projectId}/tasks`,
    PROJECT_TASK_UPDATE: (projectId, taskId) =>
        `${BASE_URL}/projects/${projectId}/tasks/${taskId}`,
    PROJECT_TASK_DELETE: (projectId, taskId) =>
        `${BASE_URL}/projects/${projectId}/tasks/${taskId}`,
    PROJECT_ACTIONS: (projectId) => `${BASE_URL}/projects/${projectId}/actions`,
    PROJECT_MEMBERS: (projectId, excludeMemberId) =>
        `${BASE_URL}/projects/${projectId}/members${excludeMemberId ? `?exclude_member_id=${excludeMemberId}` : ""}`,
    PROJECT_FINANCES: (projectId) =>
        `${BASE_URL}/projects/${projectId}/finances`,
    PROJECT_FINANCE_UPDATE: (projectId, financeId) =>
        `${BASE_URL}/projects/${projectId}/finances/${financeId}`,
    PROJECT_FINANCE_DELETE: (projectId, financeId) =>
        `${BASE_URL}/projects/${projectId}/finances/${financeId}`,

    PROJECT_MEMBER_ROLES: `${BASE_URL}/project-member-roles`,
    DASHBOARD_OVERVIEW: `${BASE_URL}/dashboard`,
    CONTACT_US: `${BASE_URL}/contact`,

    PROJECT_BY_MEMBER: (memberId) => `${BASE_URL}/projects?member=${memberId}`,
    TASKS_DASHBOARD: `${BASE_URL}/projects/tasks/dashboard`,
    TASKS_PROJECTS: (memberId) =>
        memberId ? `${BASE_URL}/projects?member=${memberId}` : `${BASE_URL}/projects`,
    TASKS_MEMBERS: (memberId) =>
        memberId
            ? `${BASE_URL}/members?project_member=${memberId}`
            : `${BASE_URL}/members`,
    TASKS_PROJECT_MEMBERS: (projectId, excludeMemberId) =>
        `${BASE_URL}/projects/${projectId}/members${
            excludeMemberId ? `?exclude_member_id=${excludeMemberId}` : ""
        }`,
    TASKS_PROJECT_ITEMS: (projectId) => `${BASE_URL}/projects/${projectId}/tasks`,
};
