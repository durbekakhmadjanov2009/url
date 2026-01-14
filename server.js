const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Sizning production URL (Railway)
const BASE_URL = process.env.BASE_URL || 'http://url-production-163c.up.railway.app';

app.use(express.json());
app.use(cors());

// uploads papkasi bo'lmasa yaratamiz
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.ensureDirSync(UPLOAD_DIR);

const JSON_FILE = 'pictures.json';
if (!fs.existsSync(JSON_FILE) || fs.readFileSync(JSON_FILE, 'utf8').trim() === '') {
    fs.writeJsonSync(JSON_FILE, []);
}

// Multer disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const shortId = crypto.randomBytes(5).toString('hex');
        const ext = file.originalname.split('.').pop();
        cb(null, `${shortId}.${ext}`);
    }
});
const upload = multer({ storage });

// Yuklash endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).send('Fayl kerak!');

        // Production URL hosil qilindi
        const generatedURL = `${BASE_URL}/uploads/${file.filename}`;

        // JSON ga yozish
        let json = [];
        try {
            json = await fs.readJson(JSON_FILE);
            if (!Array.isArray(json)) json = [];
        } catch {
            json = [];
        }

        const newEntry = {
            id: file.filename.split('.')[0],
            url: generatedURL,  // endi bu production link
            type: file.mimetype,
            filename: file.filename
        };

        json.push(newEntry);
        await fs.writeJson(JSON_FILE, json, { spaces: 2 });

        res.json({ message: "Yuklandi va JSON ga yozildi!", entry: newEntry });
    } catch (err) {
        console.error(err);
        res.status(500).send("Serverda xatolik yuz berdi!");
    }
});

// /uploads papkasini static qilish
app.use('/uploads', express.static(UPLOAD_DIR));

app.listen(PORT, () => console.log(`Server running: ${BASE_URL}`));
