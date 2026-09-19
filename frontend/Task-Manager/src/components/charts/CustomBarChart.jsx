import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const PRIORITY_COLORS = {
  Low: "#27C468",
  Medium: "#FF8522",
  High: "#F570B5",
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const { priority, count } = payload[0].payload;
  const color = PRIORITY_COLORS[priority] || "#6B7280";

  return (
    <div className="bg-white px-4 py-2.5 rounded-lg shadow-md border border-purple-200">
      <p className="font-semibold text-sm" style={{ color }}>
        {priority}
      </p>
      <p className="text-xs text-gray-800 mt-0.5">count : {count}</p>
    </div>
  );
};

const CustomBarChart = ({ data }) => {
  const hasData = data?.some((item) => item.count > 0);

  if (!hasData) {
    return (
      <p className="text-sm text-gray-400 py-16 text-center">No data available</p>
    );
  }

  const maxCount = Math.max(...data.map((item) => item.count), 1);
  const yMax = Math.max(8, Math.ceil(maxCount / 2) * 2);
  const yTicks = [];
  for (let i = 0; i <= yMax; i += 2) {
    yTicks.push(i);
  }

  return (
    <div className="h-[320px] w-full mt-4 rounded-xl border-2 border-purple-500 p-3 bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
          barCategoryGap="28%"
        >
          <XAxis
            dataKey="priority"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#374151", fontSize: 13, fontWeight: 500 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#374151", fontSize: 13 }}
            ticks={yTicks}
            domain={[0, yMax]}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={56}>
            {data.map((entry, index) => (
              <Cell
                key={`bar-${index}`}
                fill={PRIORITY_COLORS[entry.priority] || "#94A3B8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
