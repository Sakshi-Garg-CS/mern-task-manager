import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LuPlus, LuUserPlus, LuPaperclip, LuTrash2, LuX } from "react-icons/lu";
import toast from "react-hot-toast";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import AddMembersModal from "../../components/modals/AddMembersModal";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { getProfileImageUrl } from "../../utils/imageUrl";
import { PRIORITY_DATA } from "../../utils/data";

const MAX_VISIBLE_ASSIGNEES = 3;

const getTodayDateString = () => new Date().toISOString().split("T")[0];

const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const normalizeAssignees = (assignedTo) => {
  if (!Array.isArray(assignedTo)) return [];
  return assignedTo.filter(Boolean);
};

const getAssigneeIds = (members) =>
  members.map((m) => m._id || m).filter(Boolean);

const UpdateTask = () => {
  useUserAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [originalDueDate, setOriginalDueDate] = useState("");
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [todoInput, setTodoInput] = useState("");
  const [todoList, setTodoList] = useState([]);
  const [attachmentInput, setAttachmentInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          API_PATHS.TASKS.GET_TASK_BY_ID(id)
        );
        const task = response.data;

        setTitle(task.title || "");
        setDescription(task.description || "");
        setPriority(task.priority || "Medium");
        setDueDate(formatDateForInput(task.dueDate));
        setOriginalDueDate(formatDateForInput(task.dueDate));
        setAssignedMembers(normalizeAssignees(task.assignedTo));
        setTodoList(task.todoChecklist || []);
        setAttachments(task.attachments || []);
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to load task details";
        toast.error(message);
        navigate("/admin/tasks");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTask();
  }, [id, navigate]);

  const handleAddTodo = () => {
    const text = todoInput.trim();
    if (!text) return;
    setTodoList((prev) => [...prev, { text, completed: false }]);
    setTodoInput("");
  };

  const handleAddAttachment = () => {
    const link = attachmentInput.trim();
    if (!link) return;
    setAttachments((prev) => [...prev, link]);
    setAttachmentInput("");
  };

  const buildTaskPayload = (overrides = {}) => ({
    title: title.trim(),
    description: description.trim(),
    priority,
    dueDate,
    assignedTo: getAssigneeIds(assignedMembers),
    todoChecklist: todoList,
    attachments,
    ...overrides,
  });

  const syncTaskFromResponse = (task) => {
    if (!task) return;
    setAssignedMembers(normalizeAssignees(task.assignedTo));
    setTodoList(task.todoChecklist || []);
    setAttachments(task.attachments || []);
  };

  const refetchTask = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(id)
      );
      const task = response.data;
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "Medium");
      setDueDate(formatDateForInput(task.dueDate));
      setOriginalDueDate(formatDateForInput(task.dueDate));
      syncTaskFromResponse(task);
    } catch {
      /* ignore refetch errors */
    }
  };

  const saveTaskChanges = async (overrides, successMessage) => {
    try {
      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK(id),
        buildTaskPayload(overrides)
      );
      syncTaskFromResponse(response.data?.task);
      toast.success(successMessage);
      return true;
    } catch (err) {
      await refetchTask();
      toast.error(
        err.response?.data?.message || "Failed to save changes. Try again."
      );
      return false;
    }
  };

  const removeAssignee = async (memberId) => {
    const updated = assignedMembers.filter(
      (m) => String(m._id) !== String(memberId)
    );
    setAssignedMembers(updated);
    await saveTaskChanges(
      { assignedTo: getAssigneeIds(updated) },
      "Assignee removed"
    );
  };

  const removeTodoItem = async (index) => {
    const updated = todoList.filter((_, i) => i !== index);
    setTodoList(updated);
    await saveTaskChanges(
      { todoChecklist: updated },
      "Checklist item removed"
    );
  };

  const removeAttachment = async (index) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
    await saveTaskChanges({ attachments: updated }, "Attachment removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }
    if (!dueDate) {
      setError("Due date is required");
      return;
    }
    if (dueDate !== originalDueDate && dueDate < getTodayDateString()) {
      setError("Due date cannot be in the past");
      return;
    }

    setIsSubmitting(true);
    const saved = await saveTaskChanges({}, "Task updated successfully");
    if (!saved) {
      setError("Failed to update task. Try again.");
      setIsSubmitting(false);
      return;
    }
    setError("");
    navigate("/admin/tasks", { replace: true });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    setIsDeleting(true);
    try {
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(id));
      toast.success("Task deleted successfully");
      navigate("/admin/tasks");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="Manage Tasks">
        <p className="text-sm text-gray-500 py-12 text-center">
          Loading task...
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="card max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-950">Update Task</h1>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="delete-task-btn"
          >
            <LuTrash2 className="text-base" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="Create App UI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Describe task"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="form-group mb-0">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITY_DATA.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                min={getTodayDateString()}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Assign To</label>
              <button
                type="button"
                className={`assign-to-picker ${
                  assignedMembers.length > 0 ? "has-members" : ""
                }`}
                onClick={() => setShowMembersModal(true)}
              >
                {assignedMembers.length === 0 ? (
                  <>
                    <LuUserPlus className="text-lg text-gray-500" />
                    Add Members
                  </>
                ) : (
                  <div className="flex items-center">
                    <div className="flex items-center -space-x-2.5">
                      {assignedMembers
                        .slice(0, MAX_VISIBLE_ASSIGNEES)
                        .map((member) =>
                          member.profileImageUrl ? (
                            <img
                              key={member._id}
                              src={getProfileImageUrl(member.profileImageUrl)}
                              alt={member.name}
                              title={member.name}
                              className="w-8 h-8 rounded-full border-2 border-white object-cover ring-1 ring-gray-200"
                            />
                          ) : (
                            <div
                              key={member._id}
                              title={member.name}
                              className="w-8 h-8 rounded-full border-2 border-white bg-purple-500 text-white text-xs font-medium flex items-center justify-center ring-1 ring-gray-200"
                            >
                              {member.name?.charAt(0) || "U"}
                            </div>
                          )
                        )}
                    </div>
                    {assignedMembers.length > MAX_VISIBLE_ASSIGNEES && (
                      <span
                        className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 text-purple-700 text-xs font-semibold flex items-center justify-center -ml-2.5 ring-1 ring-purple-200"
                        title={`${assignedMembers.length - MAX_VISIBLE_ASSIGNEES} more`}
                      >
                        +{assignedMembers.length - MAX_VISIBLE_ASSIGNEES}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </div>
          </div>

          {assignedMembers.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Assigned members — click × to remove or open picker to add more
              </p>
              <div className="flex flex-wrap gap-2">
                {assignedMembers.map((member) => (
                  <span key={String(member._id)} className="assignee-chip">
                    {member.profileImageUrl ? (
                      <img
                        src={getProfileImageUrl(member.profileImageUrl)}
                        alt={member.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-[10px] font-medium flex items-center justify-center">
                        {member.name?.charAt(0) || "U"}
                      </span>
                    )}
                    <span className="text-sm text-gray-800">
                      {member.name || member.email || "Member"}
                    </span>
                    <button
                      type="button"
                      className="assignee-chip-remove"
                      onClick={() => removeAssignee(member._id)}
                      aria-label={`Remove ${member.name}`}
                    >
                      <LuX className="text-sm" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">TODO Checklist</label>
            <div className="add-field-row">
              <input
                type="text"
                className="form-input mb-0"
                placeholder="Enter Task"
                value={todoInput}
                onChange={(e) => setTodoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTodo();
                  }
                }}
              />
              <button
                type="button"
                className="add-btn"
                onClick={handleAddTodo}
              >
                <LuPlus />
                Add
              </button>
            </div>
            {todoList.length > 0 && (
              <ul className="mt-3 space-y-2">
                {todoList.map((item, index) => (
                  <li key={index} className="todo-checklist-item">
                    <span className="todo-checklist-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-sm text-gray-800">
                      {item.text}
                    </span>
                    <button
                      type="button"
                      className="todo-checklist-delete"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeTodoItem(index);
                      }}
                      aria-label="Remove todo item"
                    >
                      <LuTrash2 />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Add Attachments</label>
            <div className="add-field-row">
              <div className="form-input mb-0 flex items-center gap-2 flex-1">
                <LuPaperclip className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  className="w-full bg-transparent outline-none border-0 p-0"
                  placeholder="Add File Link"
                  value={attachmentInput}
                  onChange={(e) => setAttachmentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAttachment();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                className="add-btn"
                onClick={handleAddAttachment}
              >
                <LuPlus />
                Add
              </button>
            </div>
            {attachments.length > 0 && (
              <ul className="mt-2 space-y-1">
                {attachments.map((link, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded truncate"
                  >
                    <span className="truncate">{link}</span>
                    <button
                      type="button"
                      className="text-red-500 text-xs hover:underline shrink-0 ml-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeAttachment(index);
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

          <button
            type="submit"
            className="create-task-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "UPDATING..." : "UPDATE TASK"}
          </button>
        </form>
      </div>

      <AddMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        selectedMembers={assignedMembers}
        onConfirm={setAssignedMembers}
      />
    </DashboardLayout>
  );
};

export default UpdateTask;
