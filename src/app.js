const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./routes/auth.routes");
const contentRoutes = require("./routes/content.routes");
const principalRoutes = require("./routes/principal.routes");
const publicRoutes = require("./routes/public.routes");
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/content", publicRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/principal", principalRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
