import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import usePageTitle from "../lib/usePageTitle";
import { API_ENDPOINTS } from "../lib/apiEndpoints";
import { apiRequest } from "../lib/apiClient";

const tasks = [
    {
        title: "Finalize sprint scope",
        assignee: "Amari",
        status: "In progress",
        tags: ["Planning", "Critical"],
    },
    {
        title: "Data model review",
        assignee: "Leo",
        status: "Review",
        tags: ["Data", "Quality"],
    },
    {
        title: "Update onboarding emails",
        assignee: "Sara",
        status: "Blocked",
        tags: ["CX", "Content"],
    },
];

const columns = ["Open", "In progress", "Blocked", "Done"];

export default function Tasks() {
    usePageTitle("Tasks");
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedProject, setSelectedProject] = useState("all");
    const loggedInMemberId =
        user?.member_id || user?.memberId || user?.id || null;
    const [selectedMember, setSelectedMember] = useState(
        loggedInMemberId ? String(loggedInMemberId) : "all",
    );
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedPriority, setSelectedPriority] = useState("all");

    const statusOptions = [
        { value: "all", label: "All Statuses" },
        { value: "open", label: "Open" },
        { value: "in_progress", label: "In progress" },
        { value: "blocked", label: "Blocked" },
        { value: "done", label: "Done" },
    ];

    const priorityOptions = [
        { value: "all", label: "All Priorities" },
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
    ];

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const loggedInMemberId =
                    user?.member_id || user?.memberId || user?.id || null;
                const projectUrl = loggedInMemberId
                    ? API_ENDPOINTS.PROJECT_BY_MEMBER(loggedInMemberId)
                    : API_ENDPOINTS.PROJECTS;
                const pjRes = await apiRequest(projectUrl, "GET");
                if (!isMounted) return;
                // expect { projects: [...] } or array
                setProjects(pjRes.projects || pjRes || []);

                // If a specific project is selected, fetch members on that project.
                let membersUrl;
                if (selectedProject && selectedProject !== "all") {
                    membersUrl = API_ENDPOINTS.PROJECT_MEMBERS(
                        selectedProject,
                        loggedInMemberId,
                    );
                    console.log(
                        "selectedProject",
                        selectedProject,
                        "membersUrl",
                        membersUrl,
                    );
                } else {
                    console.log("loggedInMemberId", loggedInMemberId);
                    membersUrl = loggedInMemberId
                        ? API_ENDPOINTS.MEMBERS_BY_PROJECT_MEMBER(
                              loggedInMemberId,
                          )
                        : API_ENDPOINTS.MEMBERS;

                    console.log(
                        "selectedProject",
                        selectedProject,
                        "membersUrl",
                        membersUrl,
                    );
                }
                const mbRes = await apiRequest(membersUrl, "GET");
                if (!isMounted) return;
                setMembers(mbRes.members || mbRes || []);
            } catch (err) {
                // ignore errors for now; apiClient will surface messages
                // eslint-disable-next-line no-console
                console.warn("Failed to load filter options:", err.message);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [selectedProject, user]);
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] auth-accent">
                        Execution
                    </p>
                    <h2 className="text-3xl font-semibold auth-text-primary">
                        Tasks
                    </h2>
                    <p className="mt-2 text-sm auth-text-secondary">
                        Stay on top of your workload with real-time task status,
                        priorities, and deadlines—all in one place.
                    </p>
                </div>
                <button className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary transition hover:-translate-y-0.5">
                    Add task
                </button>
            </div>
            {/* Add Search Filter */}
            <div className="my-3 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                    <label className="text-[11px] uppercase auth-accent">
                        Project
                    </label>
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="mt-1 block w-full rounded-md border auth-border bg-transparent px-3 py-2 text-sm auth-text-primary"
                    >
                        <option value="all">My Projects</option>
                        {projects.map((p) => (
                            <option key={p.id} value={String(p.id)}>
                                {p.title || `Project #${p.id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-[11px] uppercase auth-accent">
                        Member
                    </label>
                    <select
                        value={selectedMember}
                        onChange={(e) => setSelectedMember(e.target.value)}
                        className="mt-1 block w-full rounded-md border auth-border bg-transparent px-3 py-2 text-sm auth-text-primary"
                    >
                        <option value="all">All Members</option>
                        <option
                            value={
                                loggedInMemberId
                                    ? String(loggedInMemberId)
                                    : "me"
                            }
                        >
                            Myself
                        </option>
                        {members.map((m) => (
                            <option key={m.id} value={String(m.id)}>
                                {m.full_name || m.email || `Member #${m.id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-[11px] uppercase auth-accent">
                        Status
                    </label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="mt-1 block w-full rounded-md border auth-border bg-transparent px-3 py-2 text-sm auth-text-primary"
                    >
                        {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-[11px] uppercase auth-accent">
                        Priority
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                        <select
                            value={selectedPriority}
                            onChange={(e) =>
                                setSelectedPriority(e.target.value)
                            }
                            className="block w-full rounded-md border auth-border bg-transparent px-3 py-2 text-sm auth-text-primary"
                        >
                            {priorityOptions.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <button className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary">
                                Apply
                            </button>
                            <button
                                className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary"
                                onClick={() => {
                                    setSelectedProject("all");
                                    setSelectedMember("all");
                                    setSelectedStatus("all");
                                    setSelectedPriority("all");
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Close Search Filter */}
            <div className="grid gap-4 md:grid-cols-4">
                {columns.map((col, idx) => (
                    <div
                        key={col}
                        className="rounded-3xl border auth-border auth-surface p-4 auth-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                <p className="text-sm font-semibold auth-text-primary">
                                    {col}
                                </p>
                            </div>
                            <span className="text-xs auth-text-secondary">
                                {idx === 0
                                    ? "12"
                                    : idx === 1
                                      ? "9"
                                      : idx === 2
                                        ? "3"
                                        : "2"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
