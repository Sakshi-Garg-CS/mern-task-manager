import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { LuExternalLink } from "react-icons/lu";
import toast from "react-hot-toast";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { getProfileImageUrl } from "../../utils/imageUrl";

const MAX_VISIBLE_ASSIGNEES = 4;

const STATUS_BADGE = {
  Pending: "task-status-badge task-status-pending",
  "In Progress": "task-status-badge task-status-progress",
  Completed: "task-status-badge task-status-completed",
};

const ViewTaskDetails = () => {
  useUserAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [todoList, setTodoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingTodo, setUpdatingTodo] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          API_PATHS.TASKS.GET_TASK_BY_ID(id)
        );
        setTask(response.data);
        setTodoList(response.data?.todoChecklist || []);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load task details"
        );
        navigate("/user/tasks");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTask();
  }, [id, navigate]);

  const handleToggleTodo = async (index) => {
    if (updatingTodo) return;

    const updated = todoList.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );

    setTodoList(updated);
    setUpdatingTodo(true);

    try {
      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(id),
        { todoChecklist: updated }
      );

      const updatedTask = response.data?.task;
      if (updatedTask) {
        setTask(updatedTask);
        setTodoList(updatedTask.todoChecklist || []);
      }
    } catch (err) {
      setTodoList(task?.todoChecklist || []);
      toast.error(
        err.response?.data?.message || "Failed to update checklist"
      );
    } finally {
      setUpdatingTodo(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="My Tasks">
        <p className="text-sm text-gray-500 py-12 text-center">
          Loading task...
        </p>
      </DashboardLayout>
    );
  }

  if (!task) return null;

  const assignedUsers = Array.isArray(task.assignedTo) ? task.assignedTo : [];
  const attachments = task.attachments || [];
  const statusClass = STATUS_BADGE[task.status] || STATUS_BADGE.Pending;

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="card max-w-4xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-950">
            {task.title}
          </h1>
          <span className={statusClass}>{task.status}</span>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <p className="text-sm text-gray-700 leading-relaxed">
            {task.description || "No description provided."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="form-label mb-1">Priority</p>
            <p className="text-sm font-semibold text-gray-900">{task.priority}</p>
          </div>
          <div>
            <p className="form-label mb-1">Due Date</p>
            <p className="text-sm font-semibold text-gray-900">
              {task.dueDate
                ? moment(task.dueDate).format("Do MMM YYYY")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="form-label mb-1">Assigned To</p>
            <div className="flex items-center -space-x-2 mt-1">
              {assignedUsers.length > 0 ? (
                assignedUsers.slice(0, MAX_VISIBLE_ASSIGNEES).map((user, index) =>
                  user.profileImageUrl ? (
                    <img
                      key={user._id || index}
                      src={getProfileImageUrl(user.profileImageUrl)}
                      alt={user.name}
                      title={user.name}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover ring-1 ring-gray-200"
                    />
                  ) : (
                    <div
                      key={user._id || index}
                      title={user.name}
                      className="w-8 h-8 rounded-full border-2 border-white bg-purple-500 text-white text-xs font-medium flex items-center justify-center ring-1 ring-gray-200"
                    >
                      {user.name?.charAt(0) || "U"}
                    </div>
                  )
                )
              ) : (
                <span className="text-sm text-gray-500">Unassigned</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Todo Checklist</label>
          {todoList.length === 0 ? (
            <p className="text-sm text-gray-500">No checklist items for this task.</p>
          ) : (
            <ul className="space-y-3">
              {todoList.map((item, index) => (
                <li key={index} className="task-todo-item">
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={!!item.completed}
                      disabled={updatingTodo}
                      onChange={() => handleToggleTodo(index)}
                      className="task-todo-checkbox"
                    />
                    <span
                      className={`text-sm ${
                        item.completed
                          ? "text-gray-500 line-through"
                          : "text-gray-800"
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {attachments.length > 0 && (
          <div className="form-group mb-0">
            <label className="form-label">Attachments</label>
            <ul className="space-y-2">
              {attachments.map((link, index) => (
                <li key={index} className="task-attachment-item">
                  <span className="task-attachment-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="task-attachment-link"
                  >
                    {link}
                  </a>
                  <LuExternalLink className="text-gray-400 shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ViewTaskDetails;
