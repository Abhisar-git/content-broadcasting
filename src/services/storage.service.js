const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const env = require("../config/env");

class StorageService {
  constructor() {
    this.driver = env.storage.driver.toLowerCase();
    this.s3Client = null;
    this.s3Enabled = false;

    if (this.driver === "s3") {
      if (
        env.storage.s3Region &&
        env.storage.s3Bucket &&
        env.storage.s3AccessKeyId &&
        env.storage.s3SecretAccessKey
      ) {
        this.s3Client = new S3Client({
          region: env.storage.s3Region,
          credentials: {
            accessKeyId: env.storage.s3AccessKeyId,
            secretAccessKey: env.storage.s3SecretAccessKey
          }
        });
        this.s3Enabled = true;
      } else {
        console.warn(
          "[STORAGE] STORAGE_DRIVER=s3 selected but S3 credentials are missing. Falling back to local storage."
        );
      }
    }
  }

  async persistUploadedFile(file) {
    const localPath = path.join("uploads", file.filename);

    if (!this.s3Enabled) {
      return localPath;
    }

    const absolutePath = path.join(process.cwd(), localPath);
    const key = `contents/${Date.now()}-${file.filename}`;
    const fileBuffer = await fs.promises.readFile(absolutePath);

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: env.storage.s3Bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: file.mimetype
      })
    );

    await fs.promises.unlink(absolutePath);
    return `https://${env.storage.s3Bucket}.s3.${env.storage.s3Region}.amazonaws.com/${key}`;
  }
}

module.exports = new StorageService();
