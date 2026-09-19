import React from "react";
import moment from "moment";
import { LuPaperclip } from "react-icons/lu";
import { getProfileImageUrl } from "../../utils/imageUrl";

const STATUS_ACCENT = {
  Pending: "border-l-purple-500",
  "In Progress": "border-l-cyan-500",
  Completed: "border-l-green-500",
};

const STATUS_BADGE = {
  Pending: "bg-purple-100 text-purple-700",
  "In Progress": "bg-cyan-100 text-cyan-700",
  Completed: "bg-green-100 text-green-700",
};

const PRIORITY_BADGE = {
  High: "bg-pink-100 text-[#FF1744]",
  Medium: "bg-orange-100 text-[#FF8522]",
  Low: "bg-green-100 text-[#27C468]",
};

const PROGRESS_COLOR = {
  Pending: "bg-purple-500",
  "In Progress": "bg-cyan-500",
  Completed: "bg-green-500",
};

const getPriorityLabel = (priority) => {
  if (priority === "High") return "High Priority";
  if (priority === "Medium") return "Medium Priority";
  if (priority === "Low") return "Low Priority";
  return priority;
};

const TaskCard = ({ task, onClick }) => {
  const totalTodos = task.todoChecklist?.length || 0;
  const doneTodos =
    task.completedTodoCount ??
    task.todoChecklist?.filter((t) => t.completed).length ??
    0;
  const progressPercent =
    task.progress ??
    (totalTodos > 0 ? Math.round((doneTodos / totalTodos) * 100) : 0);

  const assignedUsers = Array.isArray(task.assignedTo)
    ? task.assignedTo
    : task.assignedTo
      ? [task.assignedTo]
      : [];

  const attachmentCount = task.attachments?.length || 0;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`task-card border-l-[3px] ${STATUS_ACCENT[task.status] || "border-l-gray-300"} flex flex-col h-full hover:shadow-md transition-shadow ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <span
          className={`px-2 py-0.5 text-[10px] font-medium rounded ${STATUS_BADGE[task.status] || "bg-gray-100 text-gray-600"}`}
        >
          {task.status}
        </span>
        <span
          className={`px-2 py-0.5 text-[10px] font-medium rounded ${PRIORITY_BADGE[task.priority] || "bg-gray-100 text-gray-600"}`}
        >
          {getPriorityLabel(task.priority)}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-gray-950 mb-1 line-clamp-1">
        {task.title}
      </h3>
      <p className="text-[11px] leading-relaxed text-gray-500 line-clamp-2 mb-2.5 min-h-[32px]">
        {task.description || "No description provided."}
      </p>

      <div className="mb-2.5">
        <p className="text-[11px] text-gray-800 mb-1">
          <span className="font-semibold">
            Task Done: {doneTodos} / {totalTodos || 0}
          </span>
        </p>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${PROGRESS_COLOR[task.status] || "bg-cyan-500"}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2.5">
        <div>
          <p className="text-[10px] text-gray-400">Start Date</p>
          <p className="text-xs font-semibold text-gray-900">
            {task.createdAt
              ? moment(task.createdAt).format("Do MMM YYYY")
              : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400">Due Date</p>
          <p className="text-xs font-semibold text-gray-900">
            {task.dueDate
              ? moment(task.dueDate).format("Do MMM YYYY")
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 mt-auto border-t border-gray-100">
        <div className="flex items-center -space-x-1.5">
          {assignedUsers.length > 0 ? (
            assignedUsers.slice(0, 4).map((user, index) =>
              user.profileImageUrl ? (
                <img
                  key={user._id || index}
                  src={getProfileImageUrl(user.profileImageUrl)}
                  alt={user.name}
                  className="w-6 h-6 rounded-full border-2 border-white object-cover"
                  title={user.name}
                />
              ) : (
                <div
                  key={user._id || index}
                  className="w-6 h-6 rounded-full border-2 border-white bg-purple-500 text-white text-[10px] font-medium flex items-center justify-center"
                  title={user.name}
                >
                  {user.name?.charAt(0) || "U"}
                </div>
              )
            )
          ) : (
            <span className="text-[10px] text-gray-400">Unassigned</span>
          )}
        </div>

        {attachmentCount > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded-full">
            <LuPaperclip className="text-xs" />
            {attachmentCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
