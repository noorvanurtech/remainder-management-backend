import multer from 'multer';

// Use memory storage so we can buffer files directly to Cloudinary/AWS
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
});

export default upload;
