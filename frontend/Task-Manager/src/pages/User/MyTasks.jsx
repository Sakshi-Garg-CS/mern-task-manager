import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import TaskCard from "../../components/Cards/TaskCard";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const FILTER_TABS = [
  { key: "All", label: "All", countKey: "all" },
  { key: "Pending", label: "Pending", countKey: "pendingTasks" },
  { key: "In Progress", label: "In Progress", countKey: "inProgressTasks" },
  { key: "Completed", label: "Completed", countKey: "completedTasks" },
];

const EMPTY_SUMMARY = {
  all: 0,
  pendingTasks: 0,
  inProgressTasks: 0,
  completedTasks: 0,
};

const MyTasks = () => {
  useUserAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("All");
  const [tasks, setTasks] = useState([]);
  const [statusSummary, setStatusSummary] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async (status) => {
    setLoading(true);
    try {
      const params = status && status !== "All" ? { status } : {};
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params,
      });

      setTasks(response.data?.tasks || []);
      setStatusSummary(response.data?.statusSummary || EMPTY_SUMMARY);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
      setStatusSummary(EMPTY_SUMMARY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(activeTab);
  }, [activeTab]);

  const getCount = (countKey) => statusSummary[countKey] ?? 0;

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">All Tasks</h1>
          <p className="text-xs text-gray-500 mt-1">
            Tasks assigned to you only
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = getCount(tab.countKey);

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
                }`}
              >
                {tab.label}
                <span
                  className={`min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full text-xs font-semibold ${
                    isActive ? "bg-blue-500 text-white" : "text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 py-12 text-center">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-500 py-12 text-center">
          No tasks assigned to you yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => navigate(`/user/task-details/${task._id}`)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyTasks;
