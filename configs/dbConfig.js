const mongoose = require("mongoose");

const dbConfig = async () => {
  if (!process.env.DB_URL) throw new Error("DB_URL is not configured");
  await mongoose.connect(process.env.DB_URL);
  console.log("Database connected successfully");
};


module.exports = dbConfig;
