const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

const lockerdb = "./db/locker.json";
const systemdb = "./db/system.json";

router.get("/lockerdb/:lockers", (req, res) => {
  const lockers = req.params.lockers;
  const lockerData = JSON.parse(fs.readFileSync(lockerdb, "utf8"));
  const systemData = JSON.parse(fs.readFileSync(systemdb, "utf8"));
  const timenow = new Date().getTime();

  if (lockers === "all") {
    const formattedJson = JSON.stringify(lockerData, null, 2);
    res.setHeader("Content-Type", "application/json");
    res.send(formattedJson);
    return;
  } else {
    if (lockers.match(/^[0-9]+$/) && lockers.length <= 2) {
      const lockeralias = `Locker_${lockers}`;
      const locker = lockerData.find((locker) => locker.alias === lockeralias);
      const lockerSystem = systemData.Locker.find((system) => system.Alias === lockeralias);
      if (!locker) {
        return res.status(404).json({
          code: 404,
          message: "Locker not found",
        });
      }
      locker.OnGoing.lastRequest = timenow;
      lockerSystem.LastOnline = timenow;
      //write to file
      fs.writeFileSync(lockerdb, JSON.stringify(lockerData, null, 2));
      fs.writeFileSync(systemdb, JSON.stringify(systemData, null, 2));
      const formattedJson = JSON.stringify(locker, null, 2);
      res.setHeader("Content-Type", "application/json");
      res.send(formattedJson);
    } else if (lockers.match(/^[0-9]+$/) && lockers.length <= 6) {
      const locker = lockerData.find((locker) => locker.uuid === lockers);
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
