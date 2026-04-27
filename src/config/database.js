const { Sequelize } = require("sequelize");
const env = require("./env");

const supportedDialects = new Set(["postgres", "mysql"]);
if (!supportedDialects.has(env.db.dialect)) {
  throw new Error(`Unsupported DB_DIALECT '${env.db.dialect}'. Use postgres or mysql.`);
}

const sharedOptions = {
  dialect: env.db.dialect,
  logging: env.nodeEnv === "development" ? false : false
};

if (env.db.ssl) {
  sharedOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: env.db.sslRejectUnauthorized
    }
  };
}

const hasDiscreteDbConfig = Boolean(
  env.db.host && env.db.database && env.db.username && env.db.password
);
const shouldUseDatabaseUrl = Boolean(env.db.url) && !hasDiscreteDbConfig;

const sequelize = shouldUseDatabaseUrl
  ? new Sequelize(env.db.url, sharedOptions)
  : new Sequelize(env.db.database, env.db.username, env.db.password, {
      host: env.db.host,
      port: env.db.port,
      ...sharedOptions
    });

module.exports = sequelize;
