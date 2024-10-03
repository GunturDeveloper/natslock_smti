const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

const systemdb = "./db/system.json";

router.get("/system/locker/dht/:number/:temp/:humidity", (req, res) => {
  const { number, temp, humidity } = req.params;
  const systemdata = JSON.parse(fs.readFileSync(systemdb, "utf8"));

  if (number.match(/^[0-9]+$/) && number.length === 1) {
    const lockeralias = `Locker_${number}`;
    const locker = systemdata.Locker.find(
      (locker) => locker.Alias === lockeralias
    );
    if (!locker) {
      return res.status(404).json({
        code: 404,
        message: "Locker not found",
      });
    }
    locker.Temperature = parseFloat(temp);
    locker.Humidity = parseFloat(humidity);
    fs.writeFileSync(systemdb, JSON.stringify(systemdata, null, 2));
    return res.status(200).json({
      code: 200,
      message: "Locker updated",
    });
  } else {
    return res.status(400).json({
      code: 400,
      message: "Invalid locker number",
    });
  }
});

module.exports = router;