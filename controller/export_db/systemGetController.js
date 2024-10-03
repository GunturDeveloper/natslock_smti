const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

const systemdb = "./db/system.json";

router.get("/systemdb/:lockers", (req, res) => {
  const lockers = req.params.lockers;
  const systemdata = JSON.parse(fs.readFileSync(systemdb, "utf8"));

  if (lockers === "all") {
    const formattedJson = JSON.stringify(systemdata, null, 2);
    res.setHeader("Content-Type", "application/json");
    res.send(formattedJson);
    return;
  } else if (lockers === "power") {
    const formattedJson = JSON.stringify(systemdata.Main_Power, null, 2);
    res.setHeader("Content-Type", "application/json");
    res.send(formattedJson);
    return;
  } else if (lockers === "locker") {
    const formattedJson = JSON.stringify(systemdata.Locker, null, 2);
    res.setHeader("Content-Type", "application/json");
    res.send(formattedJson);
    return;
  } else {
    if (lockers.match(/^[0-9]+$/) && lockers.length <= 2) {
      const lockeralias = `Locker_${lockers}`;
      const locker = systemdata.Locker.find((locker) => locker.Alias === lockeralias);
      if (!locker) {
        return res.status(404).json({
          code: 404,
          message: "Locker not found",
        });
      }
      const formattedJson = JSON.stringify(locker, null, 2);
      res.setHeader("Content-Type", "application/json");
      res.send(formattedJson);
    } else if (lockers.match(/^[0-9]+$/) && lockers.length <= 6) {
      const locker = systemdata.Locker.find((locker) => locker.UUID === lockers);
      if (!locker) {
        return res.status(404).json({
          code: 404,
          message: "Locker not found",
        });
      }
      const formattedJson = JSON.stringify(locker, null, 2);
      res.setHeader("Content-Type", "application/json");
      res.send(formattedJson);
    }
  }
});

module.exports = router;
