const Task = require("../models/Task");
const User = require("../models/User");
const excelJS = require("exceljs");

const formatAssignedTo = (assignedTo) => {
  if (!assignedTo || assignedTo.length === 0) return "Unassigned";

  return assignedTo.map((user) => `${user.name} (${user.email})`).join(", ");
};

const formatDueDate = (dueDate) => {
  if (!dueDate) return "";
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

// @desc    Export all tasks as an Excel file
// @route   GET /api/reports/export/tasks
// @access  Private (Admin)
const exportTasksReport = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tasks Report");

    worksheet.columns = [
      { header: "Task ID", key: "taskId", width: 28 },
      { header: "Title", key: "title", width: 28 },
      { header: "Description", key: "description", width: 55 },
      { header: "Priority", key: "priority", width: 14 },
      { header: "Status", key: "status", width: 16 },
      { header: "Due Date", key: "dueDate", width: 14 },
      { header: "Assigned To", key: "assignedTo", width: 45 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: "middle", horizontal: "left" };

    tasks.forEach((task) => {
      const row = worksheet.addRow({
        taskId: String(task._id),
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "",
        status: task.status || "",
        dueDate: formatDueDate(task.dueDate),
        assignedTo: formatAssignedTo(task.assignedTo),
      });

      row.alignment = { vertical: "top", horizontal: "left", wrapText: true };
      row.getCell(1).numFmt = "@";
    });

    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="tasks_report.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error exporting tasks", error: error.message });
  }
};

// @desc    Export user-task report as an Excel file
// @route   GET /api/reports/export/users
// @access  Private (Admin)
const exportUsersReport = async (req, res) => {
  try {
    const users = await User.find().select("name email _id").lean();
    const userTasks = await Task.find().populate(
      "assignedTo",
      "name email _id"
    );

    const userTaskMap = {};
    users.forEach((user) => {
      userTaskMap[user._id] = {
        name: user.name,
        email: user.email,
        taskCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
      };
    });

    userTasks.forEach((task) => {
      if (task.assignedTo) {
        task.assignedTo.forEach((assignedUser) => {
          if (userTaskMap[assignedUser._id]) {
            userTaskMap[assignedUser._id].taskCount += 1;
            if (task.status === "Pending") {
              userTaskMap[assignedUser._id].pendingTasks += 1;
            } else if (task.status === "In Progress") {
              userTaskMap[assignedUser._id].inProgressTasks += 1;
            } else if (task.status === "Completed") {
              userTaskMap[assignedUser._id].completedTasks += 1;
            }
          }
        });
      }
    });

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Tasks Report");

    worksheet.columns = [
      { header: "Username", key: "name", width: 30 },
      { header: "Email", key: "email", width: 40 },
      { header: "Total Assigned Task", key: "taskCount", width: 20 },
      { header: "Pending Task", key: "pendingTasks", width: 20 },
      { header: "In Progress Task", key: "inProgressTasks", width: 20 },
      { header: "Completed Task", key: "completedTasks", width: 20 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };

    Object.values(userTaskMap).forEach((user) => {
      worksheet.addRow(user);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="users_report.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error exporting tasks", error: error.message });
  }
};

module.exports = {
  exportTasksReport,
  exportUsersReport,
};
