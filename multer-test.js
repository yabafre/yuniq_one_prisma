const express = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        cb(null, `${baseName}-${Date.now()}${ext}`);
    },
});

const upload = multer({ storage: storage });

const app = express();
const port = 3000;

app.post('/upload', upload.single('file'), (req, res) => {
    console.log('File received:', req.file);
    res.status(200).send('File uploaded');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
