import multer from 'multer';

// Use memory storage — files stay in buffer, never written to disk
const storage = multer.memoryStorage();

// Only allow image MIME types
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

/**
 * Middleware to accept a single file upload with field name 'profile_photo'
 */
export const uploadSingle = upload.single('profile_photo');
