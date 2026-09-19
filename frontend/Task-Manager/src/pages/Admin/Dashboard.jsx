import React, { useState, useEffect, useContext } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { LuArrowRight } from "react-icons/lu";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
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

const Dashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState(EMPTY_PIE_CHART);
  const [barChartData, setBarChartData] = useState(EMPTY_BAR_CHART);

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

  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_DASHBOARD_DATA
      );

      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data?.charts);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const displayStats =
    dashboardData?.charts?.taskDistribution || EMPTY_DISTRIBUTION;

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="card my-5">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-950">
          Good Morning! {user?.name}
        </h2>
        <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
          {moment().format("dddd Do MMM YYYY")}
        </p>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4 w-full mt-5">
          <InfoCard
            label="Total Tasks"
            value={addThousandsSeparator(displayStats?.All || 0)}
            color="bg-blue-500"
          />
          <InfoCard
            label="Pending Tasks"
            value={addThousandsSeparator(displayStats?.Pending || 0)}
            color="bg-violet-500"
          />
          <InfoCard
            label="In Progress"
            value={addThousandsSeparator(displayStats?.InProgress || 0)}
            color="bg-cyan-500"
          />
          <InfoCard
            label="Completed Tasks"
            value={addThousandsSeparator(displayStats?.Completed || 0)}
            color="bg-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div className="card">
          <h5 className="text-lg font-semibold text-gray-950">
            Task Distribution
          </h5>
          <CustomPieChart data={pieChartData} />
        </div>

        <div className="card">
          <h5 className="text-lg font-semibold text-gray-950">
            Task Priority Levels
          </h5>
          <CustomBarChart data={barChartData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div className="md:col-span-2">
          <div className="card border-l-4 border-l-blue-500 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h5 className="text-lg font-semibold text-gray-950">
                Recent Tasks
              </h5>
              <button type="button" className="card-btn" onClick={() => navigate("/admin/tasks")}>
                See All <LuArrowRight className="text-sm" />
              </button>
            </div>

            <TaskListTable tableData={dashboardData?.recentTask || []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
