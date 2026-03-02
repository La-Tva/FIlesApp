import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 uses S3-compatible API
export const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export const BUCKET = process.env.R2_BUCKET_NAME!;

/**
 * Generate a presigned URL for direct browser → R2 upload (PUT).
 * Expires in 5 minutes.
 */
export async function getPresignedUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType,
    });
    return getSignedUrl(r2Client, command, { expiresIn: 300 });
}

/**
 * Generate a presigned URL for secure file download.
 * Expires in 1 hour.
 */
export async function getPresignedDownloadUrl(key: string) {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

/**
 * Delete an object from R2.
 */
export async function deleteFromR2(key: string) {
    await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/**
 * Get the public URL for a file (requires public bucket or custom domain in R2 dashboard).
 */
export function getPublicUrl(key: string) {
    return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
}
