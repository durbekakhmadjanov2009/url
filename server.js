const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

const JSON_FILE = 'pictures.json';
if (!fs.existsSync(JSON_FILE) || fs.readFileSync(JSON_FILE, 'utf8').trim() === '') {
    fs.writeJsonSync(JSON_FILE, []);
}

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Yuklash endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).send('Fayl kerak!');

        const base64 = file.buffer.toString('base64');

        // Qisqa ID yaratish
        const shortId = crypto.randomBytes(5).toString('hex');
        const ext = file.mimetype.split("/")[1];
        const generatedURL = `http://localhost:${PORT}/uploads/${shortId}.${ext}`;

        // JSON ga yozish
        let json = [];
        try {
            json = await fs.readJson(JSON_FILE);
            if (!Array.isArray(json)) json = [];
        } catch {
            json = [];
        }

        const newEntry = {
            id: shortId,
            url: generatedURL,
            type: file.mimetype,
            data: base64
        };

        json.push(newEntry);
        await fs.writeJson(JSON_FILE, json, { spaces: 2 });

        res.json({ message: "Yuklandi va JSON ga yozildi!", entry: newEntry });
    } catch (err) {
        console.error(err);
        res.status(500).send("Serverda xatolik yuz berdi!");
    }
});

// Dinamik /uploads/:id endpoint
app.get('/uploads/:id', async (req, res) => {
    try {
        const idWithExt = req.params.id; // masalan 53af0eff15.jpeg
        const id = idWithExt.split('.')[0];
        const ext = idWithExt.split('.')[1];

        const json = await fs.readJson(JSON_FILE);
        const entry = json.find(e => e.id === id && e.type.includes(ext));

        if (!entry) return res.status(404).send('Fayl topilmadi');

        // Base64 → Buffer
        const buffer = Buffer.from(entry.data, 'base64');

        res.writeHead(200, {
            'Content-Type': entry.type,
            'Content-Length': buffer.length
        });
        res.end(buffer);
    } catch (err) {
        console.error(err);
        res.status(500).send("Serverda xatolik yuz berdi!");
    }
});

app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
