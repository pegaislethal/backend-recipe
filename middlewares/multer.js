const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Set up storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../public/temp');
        
        // Check if directory exists, if not, create it
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Use extension of original file
    }
});
  
const upload = multer({ storage: storage });

module.exports = upload;
