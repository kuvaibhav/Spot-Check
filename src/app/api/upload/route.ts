import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { uploadImageToS3 } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const extension = file.name.split(".").pop() || "jpg";
    const key = `${uuidv4()}.${extension}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageToS3(key, buffer, file.type);

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return NextResponse.json(
      { error: "Failed to upload image. Check S3 configuration." },
      { status: 500 }
    );
  }
}
