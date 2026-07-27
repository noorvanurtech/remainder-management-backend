import { UploadApiResponse } from 'cloudinary';
import { cloudinaryConfig } from '../config/cloudinary';

export const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinaryConfig.uploader.upload_stream(
            { folder: folder },
            (error, result: UploadApiResponse | undefined) => {
                if (error) return reject(error);
                if (!result) return reject(new Error("Unknown Cloudinary error"));
                resolve(result.secure_url);
            }
        );
        uploadStream.end(buffer);
    });
};
