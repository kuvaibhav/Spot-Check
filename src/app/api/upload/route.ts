import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { uploadImageToS3 } from "@/lib/s3";

// Formats that need conversion to WebP before storage
const NEEDS_CONVERSION = new Set([
  "image/heic",
  "image/heif",
  "image/avif",
  "image/tiff",
  "image/bmp",
]);

// All accepted MIME types (iPhone HEIC/HEIF, Pixel WebP, standard formats)
const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/tiff",
  "image/bmp",
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const mimeType = file.type.toLowerCase();

    if (!ACCEPTED_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    let buffer = Buffer.from(await file.arrayBuffer());
    let outputMime = mimeType;
    let ext = file.name.split(".").pop()?.toLowerCase() || "jpg";

    // Convert HEIC/HEIF and other non-web formats to WebP
    if (NEEDS_CONVERSION.has(mimeType)) {
      buffer = await sharp(buffer)
        .webp({ quality: 85 })
        .toBuffer();
      outputMime = "image/webp";
      ext = "webp";
    } else if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      // Re-encode JPEG to strip EXIF/metadata and normalise orientation
      buffer = await sharp(buffer)
        .rotate() // auto-rotate based on EXIF orientation
        .jpeg({ quality: 90, progressive: true })
        .toBuffer();
      ext = "jpg";
    } else if (mimeType === "image/png") {
      buffer = await sharp(buffer)
        .rotate()
        .png({ compressionLevel: 8 })
        .toBuffer();
    }

    const key = `${uuidv4()}.${ext}`;
    const url = await uploadImageToS3(key, buffer, outputMime);

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return NextResponse.json(
      { error: "Failed to upload image." },
      { status: 500 }
    );
  }
}
