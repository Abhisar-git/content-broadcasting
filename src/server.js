const sequelize = require("./config/database");
require("./models");
const env = require("./config/env");
const app = require("./app");
const authService = require("./services/auth.service");

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await authService.ensureDefaultPrincipalAccount();

    app.listen(env.port, () => {
      console.info(`Server started on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

start();
