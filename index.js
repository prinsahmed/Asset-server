const dns = require("node:dns");
// Bypasses the Windows DNS bug by forcing Google's DNS inside the app
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const { connectDB } = require("./backend/db/dbConfig");
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const authRouter = require("./backend/routes/authRoutes");
const assetsRouter = require("./backend/routes/assetsRoutes");
const paymentRouter = require("./backend/routes/paymentRoutes");
const usersRouter = require("./backend/routes/usersRoutes");
const packageRouter = require("./backend/routes//packageRoutes");



// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use(authRouter);
app.use(assetsRouter);
app.use(paymentRouter);
app.use(usersRouter);
app.use(packageRouter);

const startServer = async () => {
  try {
    await connectDB();

    app.get("/", (req, res) => {
      res.send("Asset Server is running...");
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
