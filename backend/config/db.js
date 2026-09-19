const mongoose = require("mongoose");

let memoryServer;

const connectMemoryDB = async () => {
  const { MongoMemoryServer } = require("mongodb-memory-server");
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  await mongoose.connect(uri);
  console.log("MongoDB connected (in-memory — data resets on restart)");
  console.log("Tip: use npm run dev with Atlas after whitelisting your IP.");
};

const connectDB = async () => {
  if (process.env.USE_MEMORY_DB === "true") {
    await connectMemoryDB();
    return;
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is missing in .env file");
    process.exit(1);
  }

  const maxRetries = 5;
  const retryDelayMs = 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,
      });
      console.log("MongoDB connected");
      return;
    } catch (err) {
      console.error(
        `MongoDB connection attempt ${attempt}/${maxRetries} failed:`,
        err.message
      );

      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      } else {
        console.error("\n--- Fix MongoDB Atlas connection ---");
        console.error("1. Go to https://cloud.mongodb.com");
        console.error("2. Network Access -> Add IP Address");
        console.error(
          "3. Click 'Allow Access from Anywhere' (0.0.0.0/0) for dev, or add your current IP"
        );
        console.error("4. Wait 1-2 minutes, then run: npm run dev");
        console.error(
          "\nOr run without Atlas for now: npm run dev:local\n--------------------------------\n"
        );
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
