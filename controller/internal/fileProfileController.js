const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

//file format : png
const pathimg = './file/profile/';

router.get("/profile/:name", (req, res) => {
    const name = req.params.name;

    const filePath = `${pathimg}${name}`;
    if (fs.existsSync(filePath)) {
        res.sendFile(path.resolve(filePath));
    } else {
        res.sendFile(path.resolve(`${pathimg}default.jpg`));
    }
});

module.exports = router;
