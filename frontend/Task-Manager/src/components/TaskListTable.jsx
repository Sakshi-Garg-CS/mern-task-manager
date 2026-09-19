import React from "react";
import moment from "moment";

const TaskListTable = ({ tableData }) => {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-purple-100 text-purple-700";
      case "In Progress":
        return "bg-cyan-100 text-cyan-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-pink-100 text-[#FF1744]";
      case "Medium":
        return "bg-orange-100 text-[#FF8522]";
      case "Low":
        return "bg-green-100 text-[#27C468]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (!tableData?.length) {
    return (
      <p className="text-sm text-gray-400 py-8 text-center">No tasks found</p>
    );
  }

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left text-sm font-semibold text-gray-500 pb-4 pr-4">
              Name
            </th>
            <th className="text-left text-sm font-semibold text-gray-500 pb-4 px-4">
              Status
            </th>
            <th className="text-left text-sm font-semibold text-gray-500 pb-4 px-4">
              Priority
            </th>
            <th className="text-left text-sm font-semibold text-gray-500 pb-4 pl-4">
              Created On
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((task) => (
            <tr
              key={task._id}
              className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
            >
              <td className="py-4 pr-4 text-sm text-gray-800 text-left align-middle">
                {task.title}
              </td>
              <td className="py-4 px-4 text-left align-middle">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${getStatusBadgeColor(
                    task.status
                  )}`}
                >
                  {task.status}
                </span>
              </td>
              <td className="py-4 px-4 text-left align-middle">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${getPriorityBadgeColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              </td>
              <td className="py-4 pl-4 text-sm text-gray-600 text-left align-middle whitespace-nowrap">
                {task.createdAt
                  ? moment(task.createdAt).format("Do MMM YYYY")
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskListTable;
