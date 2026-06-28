import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ReviewsData } from "./types";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || "spot-check-rw";
const REVIEWS_KEY = "data/reviews.json";

export async function getReviewsFromS3(): Promise<ReviewsData> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: REVIEWS_KEY,
    });
    const response = await s3Client.send(command);
    const body = await response.Body?.transformToString();
    if (!body) {
      return { reviews: [], lastUpdated: new Date().toISOString() };
    }
    return JSON.parse(body) as ReviewsData;
  } catch (error: unknown) {
    const err = error as { name?: string };
    if (err.name === "NoSuchKey") {
      return { reviews: [], lastUpdated: new Date().toISOString() };
    }
    throw error;
  }
}

export async function saveReviewsToS3(data: ReviewsData): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: REVIEWS_KEY,
    Body: JSON.stringify(data, null, 2),
    ContentType: "application/json",
  });
  await s3Client.send(command);
}

export async function uploadImageToS3(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: `images/${key}`,
    Body: body,
    ContentType: contentType,
  });
  await s3Client.send(command);

  const publicDomain = process.env.R2_PUBLIC_DOMAIN;
  if (publicDomain) {
    return `https://${publicDomain}/images/${key}`;
  }
  // Fallback until public access is enabled on the bucket
  return `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}/images/${key}`;
}

export async function deleteImageFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await s3Client.send(command);
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: `images/${key}`,
    ContentType: contentType,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
