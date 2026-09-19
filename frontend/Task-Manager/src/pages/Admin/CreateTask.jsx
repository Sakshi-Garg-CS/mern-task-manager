import React, { useState } from "react";
import { LuPlus, LuUserPlus, LuPaperclip } from "react-icons/lu";
import toast from "react-hot-toast";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import AddMembersModal from "../../components/modals/AddMembersModal";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { PRIORITY_DATA } from "../../utils/data";
import { getProfileImageUrl } from "../../utils/imageUrl";

const MAX_VISIBLE_ASSIGNEES = 3;

const getTodayDateString = () => new Date().toISOString().split("T")[0];

const INITIAL_FORM = {
  title: "",
  description: "",
  priority: "Low",
  dueDate: "",
  assignedMembers: [],
  todoInput: "",
  todoList: [],
  attachmentInput: "",
  attachments: [],
};

const CreateTask = () => {
  useUserAuth();

  const [title, setTitle] = useState(INITIAL_FORM.title);
  const [description, setDescription] = useState(INITIAL_FORM.description);
  const [priority, setPriority] = useState(INITIAL_FORM.priority);
  const [dueDate, setDueDate] = useState(INITIAL_FORM.dueDate);
  const [assignedMembers, setAssignedMembers] = useState(
    INITIAL_FORM.assignedMembers
  );
  const [todoInput, setTodoInput] = useState(INITIAL_FORM.todoInput);
  const [todoList, setTodoList] = useState(INITIAL_FORM.todoList);
  const [attachmentInput, setAttachmentInput] = useState(
    INITIAL_FORM.attachmentInput
  );
  const [attachments, setAttachments] = useState(INITIAL_FORM.attachments);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const resetForm = () => {
    setTitle(INITIAL_FORM.title);
    setDescription(INITIAL_FORM.description);
    setPriority(INITIAL_FORM.priority);
    setDueDate(INITIAL_FORM.dueDate);
    setAssignedMembers(INITIAL_FORM.assignedMembers);
    setTodoInput(INITIAL_FORM.todoInput);
    setTodoList(INITIAL_FORM.todoList);
    setAttachmentInput(INITIAL_FORM.attachmentInput);
    setAttachments(INITIAL_FORM.attachments);
    setError("");
    setShowMembersModal(false);
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
    if (dueDate < getTodayDateString()) {
      setError("Due date cannot be in the past");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate,
        assignedTo: assignedMembers.map((m) => m._id),
        todoChecklist: todoList,
        attachments,
      });

      toast.success("Task created successfully");
      resetForm();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to create task. Try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="card max-w-3xl">
        <h1 className="text-xl font-semibold text-gray-950 mb-6">Create Task</h1>

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
              <ul className="mt-2 space-y-1">
                {todoList.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded"
                  >
                    {item.text}
                    <button
                      type="button"
                      className="text-red-500 text-xs hover:underline"
                      onClick={() =>
                        setTodoList((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                    >
                      Remove
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
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 mb-3">{error}</p>
          )}

          <button
            type="submit"
            className="create-task-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "CREATING..." : "CREATE TASK"}
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

export default CreateTask;
