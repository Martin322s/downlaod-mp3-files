const express = require('express');
const { initViewEngine } = require('../config/hbs');
const app = express();
const port = process.env.PORT || 3000;
const ytdl = require("ytdl-core");
const fs = require("fs");

initViewEngine(app);
app.use('/static', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("home");
});

app.post('/download', async (req, res) => {
    const url = req.body.url;
    if (!url) {
        res.status(400).send('Missing URL parameter');
        return;
    }

    const info = await ytdl.getInfo(url);
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    const audio = audioFormats.find(format => format.container === 'mp4');

    if (!audio) {
        res.status(400).send('No audio format available');
        return;
    }

    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    const filename = `${title}.mp3`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'audio/mpeg');

    ytdl(url, { format: audio })
        .pipe(fs.createWriteStream(filename))
        .on('finish', () => {
            res.download(filename, err => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Server error');
                }
                fs.unlinkSync(filename);
            });
        });
});

app.listen(port, () => console.log(`Server is working at: http://localhost:${port}`));