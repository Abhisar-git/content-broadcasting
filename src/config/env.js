const dotenv = require("dotenv");

dotenv.config();

const normalizeDatabaseUrl = (value) => {
  if (!value) {
    return "";
  }

  let normalized = String(value).trim();

  if (normalized.startsWith("DATABASE_URL=")) {
    normalized = normalized.slice("DATABASE_URL=".length).trim();
  }

  if (!normalized) {
    return "";
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:" && parsed.protocol !== "mysql:") {
      return "";
    }
    return normalized;
  } catch (_error) {
    return "";
  }
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  db: {
    url: normalizeDatabaseUrl(process.env.DATABASE_URL),
    dialect: process.env.DB_DIALECT || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || "content_broadcasting",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    ssl: process.env.DB_SSL === "true",
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true"
  },
  jwt: {
    secret: process.env.JWT_SECRET || "super-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  },
  upload: {
    maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 10),
    defaultRotationMinutes: Number(process.env.DEFAULT_ROTATION_MINUTES || 5)
  },
  cache: {
    ttlSeconds: Number(process.env.CACHE_TTL_SECONDS || 30),
    redisUrl: process.env.REDIS_URL || ""
  },
  storage: {
    driver: process.env.STORAGE_DRIVER || "local",
    s3Region: process.env.S3_REGION || "",
    s3Bucket: process.env.S3_BUCKET || "",
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ""
  },
  defaultPrincipal: {
    name: process.env.DEFAULT_PRINCIPAL_NAME || "Principal",
    email: process.env.DEFAULT_PRINCIPAL_EMAIL || "principal@example.com",
    password: process.env.DEFAULT_PRINCIPAL_PASSWORD || "Principal@123"
  }
};

module.exports = env;
