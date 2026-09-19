import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { LuArrowRight } from "react-icons/lu";
import { UserContext } from "../../context/userContext";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import InfoCard from "../../components/Cards/InfoCard";
import TaskListTable from "../../components/TaskListTable";
import CustomPieChart from "../../components/charts/CustomPieChart";
import CustomBarChart from "../../components/charts/CustomBarChart";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { addThousandsSeparator } from "../../utils/helper";

const EMPTY_DISTRIBUTION = {
  All: 0,
  Pending: 0,
  InProgress: 0,
  Completed: 0,
};

const EMPTY_PIE_CHART = [
  { status: "Pending", count: 0 },
  { status: "In Progress", count: 0 },
  { status: "Completed", count: 0 },
];

const EMPTY_BAR_CHART = [
  { priority: "Low", count: 0 },
  { priority: "Medium", count: 0 },
  { priority: "High", count: 0 },
];

const UserDashboard = () => {
  useUserAuth();
  const navigate = useNavigate();

  const { user, loading } = useContext(UserContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState(EMPTY_PIE_CHART);
  const [barChartData, setBarChartData] = useState(EMPTY_BAR_CHART);
  const [dataLoading, setDataLoading] = useState(true);

  const prepareChartData = (charts) => {
    const taskDistribution = charts?.taskDistribution || null;
    const taskPriorityLevels = charts?.taskPriorityLevels || null;

    setPieChartData([
      { status: "Pending", count: taskDistribution?.Pending || 0 },
      { status: "In Progress", count: taskDistribution?.InProgress || 0 },
      { status: "Completed", count: taskDistribution?.Completed || 0 },
    ]);

    setBarChartData([
      { priority: "Low", count: taskPriorityLevels?.Low || 0 },
      { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
      { priority: "High", count: taskPriorityLevels?.High || 0 },
    ]);
  };

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setDataLoading(true);
      try {
        const response = await axiosInstance.get(
          API_PATHS.TASKS.GET_USER_DASHBOARD_DATA
        );
        setDashboardData(response.data);
        prepareChartData(response.data?.charts);
      } catch (error) {
        console.error("Failed to fetch user dashboard data:", error);
        setDashboardData(null);
        setPieChartData(EMPTY_PIE_CHART);
        setBarChartData(EMPTY_BAR_CHART);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  const taskDistribution =
    dashboardData?.charts?.taskDistribution || EMPTY_DISTRIBUTION;
  const totalAssigned = taskDistribution?.All || 0;
  const hasAssignedTasks = totalAssigned > 0;
  const recentTasks = dashboardData?.recentTask || [];

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="card my-5">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-950">
          Good Morning! {user?.name}
        </h2>
        <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
          {moment().format("dddd Do MMM YYYY")}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Stats below are only for tasks assigned to you.
        </p>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4 w-full mt-5">
          <InfoCard
            label="Total Tasks"
            value={addThousandsSeparator(taskDistribution?.All || 0)}
            color="bg-blue-500"
          />
          <InfoCard
            label="Pending Tasks"
            value={addThousandsSeparator(taskDistribution?.Pending || 0)}
            color="bg-violet-500"
          />
          <InfoCard
            label="In Progress"
            value={addThousandsSeparator(taskDistribution?.InProgress || 0)}
            color="bg-cyan-500"
          />
          <InfoCard
            label="Completed Tasks"
            value={addThousandsSeparator(taskDistribution?.Completed || 0)}
            color="bg-emerald-500"
          />
        </div>
      </div>

      {!dataLoading && !hasAssignedTasks && (
        <p className="mb-4 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
          No tasks are assigned to you yet. When an admin assigns you tasks,
          they will appear here.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div className="card">
          <h5 className="text-lg font-semibold text-gray-950">
            Task Distribution
          </h5>
          <p className="text-xs text-gray-400 mb-1">Your assigned tasks only</p>
          <CustomPieChart data={pieChartData} />
        </div>

        <div className="card">
          <h5 className="text-lg font-semibold text-gray-950">
            Task Priority Levels
          </h5>
          <p className="text-xs text-gray-400 mb-1">Your assigned tasks only</p>
          <CustomBarChart data={barChartData} />
        </div>
      </div>

      <div className="my-4 md:my-6">
        <div className="card border-l-4 border-l-blue-500 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h5 className="text-lg font-semibold text-gray-950">
              Recent Tasks
            </h5>
            <button
              type="button"
              className="card-btn"
              onClick={() => navigate("/user/tasks")}
            >
              See All <LuArrowRight className="text-sm" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-1">
            Latest tasks assigned to you
          </p>

          <TaskListTable tableData={recentTasks} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
