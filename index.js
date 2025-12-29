const express = require("express");
const dotenv = require("dotenv");
const db = require("./models/db.model");

const { userRoute, manufacturerRoute, settingRoute, orderRoute, bannerRoute, notificationRoute } = require("./routes/index");

const cors = require("cors")


dotenv.config();
const PORT = process.env.PORT;

const app = express();

app.use(cors())
app.use(express.json());

const dbConnection = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected successfully");

    // await db.sequelize.sync({ alter: false });
    // console.log("Tables sync successfully");

  } catch (error) {
    console.log("Database connection failed: " + error.message);
  }
};
dbConnection();

app.use(userRoute, manufacturerRoute, settingRoute, orderRoute, bannerRoute,notificationRoute);

app.use((err, req, res, next) => {
  console.error("🔥 Error caught:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
  });
});
app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
