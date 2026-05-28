import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ReviewsData } from "./types";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET = process.env.S3_BUCKET_NAME || "spot-check-reviews";
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
  return `https://${BUCKET}.s3.${process.env.AWS_REGION || "us-west-2"}.amazonaws.com/images/${key}`;
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
