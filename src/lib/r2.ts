import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

/**
 * Generate a presigned URL for direct client-side upload (supports up to 5GB)
 */
export async function getPresignedUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Generate a transient public URL for file download/viewing
 */
export async function getFileUrl(key: string) {
    // If bucket is public, we can just return the public URL
    if (process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
        return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
    }

    // Otherwise generate a signed GET URL
    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function deleteFileFromR2(key: string) {
    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
    });

    return s3Client.send(command);
}
