import React from "react";

export default function ProjectViewSample({ project }) {
    // Minimal presentational component for a project with RAG and milestones
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <div className="mt-2">
                <span
                    className={`px-2 py-1 rounded ${
                        project.rag_status === "RED"
                            ? "bg-red-500"
                            : project.rag_status === "AMBER"
                            ? "bg-yellow-400"
                            : "bg-green-500"
                    }`}
                >
                    {project.rag_status}
                </span>
            </div>
            <section className="mt-4">
                <h2 className="font-semibold">Milestones</h2>
                <ul>
                    {project.milestones?.map((m) => (
                        <li key={m.id} className="border rounded p-2 my-2">
                            <div className="flex justify-between">
                                <div>{m.title}</div>
                                <div>{m.status}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
