import multer from 'multer';
import ApiError from '../utils/ApiError.js';
import { cloudinaryConfigured } from '../config/cloudinary.js';

const MAX_MB = 5;
export const MAX_IMAGES_PER_PRODUCT = 8;

// Files stay in memory (never written to disk) and go straight to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MB * 1024 * 1024, files: MAX_IMAGES_PER_PRODUCT },
  fileFilter: (req, file, cb) =>
    ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) ? cb(null, true) : cb(new ApiError(400, 'Only JPG, PNG or WebP images are allowed')),
});

// The browser-supplied type can be faked, so also check the real file signature.
export const looksLikeImage = (buf) =>
  Buffer.isBuffer(buf) && buf.length > 12 && (
    (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) || // JPEG
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) || // PNG
    (buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') // WebP
  );

const verify = (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);
  if (files.some((f) => !looksLikeImage(f.buffer))) return next(new ApiError(400, 'One of the files is not a valid image'));
  next();
};

// Checked after parsing, so edits that carry no image never need Cloudinary
const needCloudinaryForFiles = (req, res, next) => {
  const hasFiles = (req.files && req.files.length) || req.file;
  if (hasFiles && !cloudinaryConfigured()) return next(new ApiError(503, 'Image upload is not set up yet. Add your Cloudinary keys to server/.env.'));
  next();
};

export const uploadImages = [upload.array('images', MAX_IMAGES_PER_PRODUCT), verify, needCloudinaryForFiles];
export const uploadOneImage = [upload.single('image'), verify, needCloudinaryForFiles];
