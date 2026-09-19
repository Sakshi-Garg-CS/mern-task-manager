import React, { useEffect, useState } from "react";
import { LuFileSpreadsheet } from "react-icons/lu";
import toast from "react-hot-toast";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import MemberCard from "../../components/Cards/MemberCard";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const ManageUsers = () => {
  useUserAuth();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      setMembers(response.data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDownloadReport = async () => {
    if (members.length === 0) {
      toast.error("No team members to export.");
      return;
    }

    try {
      const response = await axiosInstance.get(
        API_PATHS.REPORTS.EXPORT_USERS,
        {
          responseType: "blob",
          headers: {
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users_report_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to download report"
      );
    }
  };

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-950">Team Members</h1>

        <button
          type="button"
          onClick={handleDownloadReport}
          className="download-btn shrink-0 self-start sm:self-auto"
        >
          <LuFileSpreadsheet className="text-lg" />
          Download Report
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 py-12 text-center">
          Loading team members...
        </p>
      ) : members.length === 0 ? (
        <p className="text-sm text-gray-500 py-12 text-center">
          No team members yet. Members can register via the sign-up page.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {members.map((member) => (
            <MemberCard key={member._id} member={member} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageUsers;
