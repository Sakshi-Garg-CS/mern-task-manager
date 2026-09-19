import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const STATUS_COLORS = {
  Pending: "#8B5CF6",
  "In Progress": "#06B6D4",
  Completed: "#84CC16",
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const { status, count } = payload[0].payload;
  const color = STATUS_COLORS[status] || "#6B7280";

  return (
    <div className="bg-white px-4 py-2.5 rounded-lg shadow-md border border-purple-200">
      <p className="font-semibold text-sm" style={{ color }}>
        {status}
      </p>
      <p className="text-xs text-gray-800 mt-0.5">Count: {count}</p>
    </div>
  );
};

const renderLegend = (props) => {
  const { payload } = props;

  return (
    <ul className="flex flex-wrap items-center justify-center gap-5 md:gap-8 pt-2">
      {payload.map((entry, index) => (
        <li
          key={`legend-${index}`}
          className="flex items-center gap-2 text-sm text-gray-600"
        >
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const CustomPieChart = ({ data }) => {
  const hasData = data?.some((item) => item.count > 0);

  if (!hasData) {
    return (
      <p className="text-sm text-gray-400 py-16 text-center">No data available</p>
    );
  }

  return (
    <div className="h-[320px] w-full mt-4 rounded-xl border-2 border-purple-500 p-3 bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="44%"
            innerRadius={68}
            outerRadius={100}
            paddingAngle={4}
            stroke="#fff"
            strokeWidth={3}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.status] || "#94A3B8"}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} verticalAlign="bottom" height={48} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomPieChart;
