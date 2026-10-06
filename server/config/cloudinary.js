import { v2 as cloudinary } from 'cloudinary';

export const cloudinaryConfigured = () =>
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

let ready = false;
const client = () => {
  if (!ready) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    ready = true;
  }
  return cloudinary;
};

// Uploads one image buffer. Cloudinary shrinks it to at most 1600px and picks a small file format,
// so product pages stay fast even when the owner uploads big phone photos.
export const uploadImage = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = client().uploader.upload_stream(
      { folder: `shree-krishna/${folder}`, resource_type: 'image', transformation: [{ width: 1600, height: 1600, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => (err ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id }))
    );
    stream.end(buffer);
  });

// Removing an image must never block deleting a product, so failures are only logged.
export const deleteImage = async (publicId) => {
  if (!publicId || !cloudinaryConfigured()) return;
  try { await client().uploader.destroy(publicId); } catch (err) { console.error('Cloudinary delete failed:', err.message); }
};
