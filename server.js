require("dotenv").config();

const express = require("express");
const cors = require("cors");
const router = require("./routes");
const cookieParser = require("cookie-parser");
const dbConfig = require("./configs/dbConfig");

const PORT = process.env.PORT || 8000;

const app = express();

// ---------- CORS ----------
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// ---------- Middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// ---------- Routes 
app.use(router);
// ---------- Database 
const startServer = async () => {
  try {
    await dbConfig();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  }
};

startServer();
