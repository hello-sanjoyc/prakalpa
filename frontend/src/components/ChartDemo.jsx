import React, { useEffect } from "react";
import usePageTitle from "../lib/usePageTitle";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

const data = [
    { name: "Jan", value: 30 },
    { name: "Feb", value: 45 },
    { name: "Mar", value: 28 },
    { name: "Apr", value: 60 },
    { name: "May", value: 75 },
    { name: "Jun", value: 55 },
];

export default function ChartDemo() {
    usePageTitle("Charts");
    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Sample Line Chart</h3>
            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#2563eb"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
