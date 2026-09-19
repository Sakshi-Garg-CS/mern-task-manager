/**
 * Removes all users and tasks from the database.
 * Run: node scripts/clearDatabase.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");

const clear = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const taskResult = await Task.deleteMany({});
  const userResult = await User.deleteMany({});

  console.log(`Deleted ${taskResult.deletedCount} task(s).`);
  console.log(`Deleted ${userResult.deletedCount} user(s) (including admins).`);
  console.log("Database cleared. Register a new admin via sign-up.");

  process.exit(0);
};

clear().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
