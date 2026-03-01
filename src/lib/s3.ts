import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
    endpoint: 'https://s3.sof.web.tr',
    region: 'us-east-1',
    credentials: {
        accessKeyId: 's3_sof',
        secretAccessKey: '@L1y3V$8mQ!zR',
    },
    forcePathStyle: true,
});

export const BUCKET_NAME = 'sof-media';
export const PUBLIC_ENDPOINT = 'https://s3.sof.web.tr/sof-media'; // assuming path-style is used or bucket is served off endpoint directly
