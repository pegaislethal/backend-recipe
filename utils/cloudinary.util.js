const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("No file path provided for upload");
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detect the type (image/video)
    });

    // Optionally, delete the local file after uploading to Cloudinary
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    
    // Optionally, delete the local file even if there's an error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

module.exports = { uploadOnCloudinary };
