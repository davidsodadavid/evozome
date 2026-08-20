import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

let client: S3Client | undefined;

function getClient() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

export function isR2Configured() {
  return Boolean(
    BUCKET &&
      PUBLIC_URL &&
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY
  );
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
) {
  if (!BUCKET || !PUBLIC_URL) {
    throw new Error(
      "R2 is not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL in .env"
    );
  }

  await getClient().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return `${PUBLIC_URL.replace(/\/$/, "")}/${key}`;
}

export type R2Object = {
  key: string;
  url: string;
  filename: string;
  size: number;
  uploadedAt: Date | undefined;
};

export async function listR2Objects(prefix: string): Promise<R2Object[]> {
  if (!BUCKET || !PUBLIC_URL) return [];

  const base = PUBLIC_URL.replace(/\/$/, "");
  const objects: R2Object[] = [];
  let continuationToken: string | undefined;

  do {
    const result = await getClient().send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );
    for (const obj of result.Contents ?? []) {
      if (!obj.Key || obj.Key.endsWith("/")) continue;
      objects.push({
        key: obj.Key,
        url: `${base}/${obj.Key}`,
        filename: obj.Key.split("/").pop() ?? obj.Key,
        size: obj.Size ?? 0,
        uploadedAt: obj.LastModified,
      });
    }
    continuationToken = result.IsTruncated
      ? result.NextContinuationToken
      : undefined;
  } while (continuationToken);

  objects.sort((a, b) => (b.uploadedAt?.getTime() ?? 0) - (a.uploadedAt?.getTime() ?? 0));
  return objects;
}

export async function deleteR2Object(key: string) {
  if (!BUCKET) return;
  try {
    await getClient().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch {
    // Object already gone — nothing left to clean up.
  }
}

// Small JSON-document helpers — used to persist editable page content
// (see src/lib/content.ts) in R2 without needing a database.
export async function getR2Json<T>(key: string): Promise<T | null> {
  if (!BUCKET) return null;
  try {
    const result = await getClient().send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const text = await result.Body?.transformToString();
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    // Object doesn't exist yet, or R2 is unreachable — caller falls back to defaults.
    return null;
  }
}

export async function putR2Json(key: string, value: unknown) {
  if (!BUCKET) {
    throw new Error("R2 is not configured");
  }
  await getClient().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(value, null, 2),
      ContentType: "application/json",
    })
  );
}
