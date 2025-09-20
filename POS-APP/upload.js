const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
module.exports = multer({ storage });
