import React from "react";

export default function DashboardSample({ summary }) {
    return (
        <div className="p-4 grid grid-cols-3 gap-4">
            <div className="col-span-1 bg-white p-4 rounded shadow">
                <h3 className="font-bold">Projects</h3>
                <div>{summary.projectCount}</div>
            </div>
            <div className="col-span-1 bg-white p-4 rounded shadow">
                <h3 className="font-bold">Active Red</h3>
                <div>{summary.redCount}</div>
            </div>
            <div className="col-span-1 bg-white p-4 rounded shadow">
                <h3 className="font-bold">Budget Utilization</h3>
                <div>{summary.budgetUsedPercent}%</div>
            </div>
        </div>
    );
}
