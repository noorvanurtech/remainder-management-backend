import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { awsConfig } from '../config/aws';

// Ensure these exist in your .env if you plan to use AWS
const s3 = new S3Client({
    region: awsConfig.region,
    credentials: {
        accessKeyId: awsConfig.accessKeyId || '',
        secretAccessKey: awsConfig.secretAccessKey || '',
    },
});

export const uploadToAWS = async (buffer: Buffer, fileName: string, contentType: string): Promise<string> => {
    if (!awsConfig.s3BucketName) {
        throw new Error("AWS_S3_BUCKET_NAME is not defined in environment variables");
    }

    const command = new PutObjectCommand({
        Bucket: awsConfig.s3BucketName,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
        // ACL: 'public-read' // Uncomment if you need public URLs directly (requires bucket policy)
    });

    await s3.send(command);

    // Return constructed URL (format depends on region and bucket naming style)
    return `https://${awsConfig.s3BucketName}.s3.${awsConfig.region}.amazonaws.com/${fileName}`;
};
