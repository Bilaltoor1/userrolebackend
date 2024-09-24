import { v2 as cloudinary } from 'cloudinary';

// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.API_KEY,
//     api_secret: process.env.API_SECRET
// });
cloudinary.config({
    cloud_name: 'dxwrgjhbl',
    api_key: '927474488594855',
    api_secret: 'XVoD2dYSNxjYmWVRRD04v_1OBZw' // Click 'View API Keys' above to copy your API secret
});

export default cloudinary;