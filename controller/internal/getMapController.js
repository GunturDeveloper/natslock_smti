const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");

router.get("/map/:filename", (req, res) =>
    fs.existsSync(`./file/map/${req.params.filename}`) ? res.sendFile(path.resolve(`./file/map/${req.params.filename}`)) : res.status(404).send("File not found")
);

module.exports = router;