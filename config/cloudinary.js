import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// حمّل backend/.env بشكل صريح
// dotenv.config({ path: './backend/.env' });
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// تحقق من أن المتغيرات محمّلة بشكل صحيح
console.log("[Cloudinary Config] Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "✓" : "✗");
console.log("[Cloudinary Config] API Key:", process.env.CLOUDINARY_API_KEY ? "✓" : "✗");
console.log("[Cloudinary Config] API Secret:", process.env.CLOUDINARY_API_SECRET ? "✓" : "✗");



export default cloudinary;