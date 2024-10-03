const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const path = require('path');

router.get("/dev/embed-map/coordinate", (req, res) => {
  // Ambil koordinat dari parameter query
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ error: "Koordinat tidak valid" });
    return;
  }

  // HTML yang menyertakan iframe Google Maps
  const mapHtml = `
    <div class="mapouter">
        <div class="gmap_canvas">
            <iframe class="gmap_iframe"
                frameborder="0"
                scrolling="no"
                marginheight="0"
                marginwidth="0"
                src="https://maps.google.com/maps?width=300&amp;height=200&amp;hl=en&amp;q=${lat},${lng}&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed">
            </iframe>
            <a href="https://connectionsgame.org/">Connections Puzzle</a>
        </div>
        <style>
            .mapouter{position:relative;text-align:right;width:600px;height:400px;}
            .gmap_canvas {overflow:hidden;background:none!important;width:600px;height:400px;}
            .gmap_iframe {width:600px!important;height:400px!important;}
        </style>
    </div>
  `;

  res.send(mapHtml);
});

router.get("/dev/embed-map/query", (req, res) => {
  const { query } = req.query;

  if (!query) {
    res.status(400).json({ error: "Query tidak valid" });
    return;
  }

  // HTML yang menyertakan iframe Google Maps
  const mapHtml = `
    <div class="mapouter">
        <div class="gmap_canvas">
            <iframe class="gmap_iframe"
                frameborder="0"
                scrolling="no"
                marginheight="0"
                marginwidth="0"
                src="https://maps.google.com/maps?width=300&amp;height=200&amp;hl=en&amp;q=${query}&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed">
            </iframe>
            <a href="https://connectionsgame.org/">Connections Puzzle</a>
        </div>
        <style>
            .mapouter{position:relative;text-align:right;width:300px;height:200px;}
            .gmap_canvas {overflow:hidden;background:none!important;width:300px;height:200px;}
            .gmap_iframe {width:300px!important;height:200px!important;}
        </style>
    </div>
  `;
  res.send(mapHtml);
});

router.get("/dev/embed-map/capture", async (req, res) => {
    const { query } = req.query;

    if (!query) {
        res.status(400).json({ error: "Query tidak valid" });
        return;
    }

    const url = `https://natslock.my.id/api/dev/embed-map/query?query=${query}`;
    const time = new Date().getTime();
    const filename = `map-${time}.png`;
    const filepath = path.resolve(`./file/map/${filename}`);

    // capture screenshot
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 300, height: 200 });
    await page.goto(url);

    // Wait for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    await page.screenshot({ path: filepath });
    await browser.close();

    // send image
    res.json({ url: `https://natslock.my.id/file/map/${filename}` });
});

module.exports = router;