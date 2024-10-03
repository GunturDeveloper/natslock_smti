const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

const systemdb = "./db/system.json";
const lockerdb = "./db/locker.json";

router.get("/system/locker/state/:number/:state", (req, res) => {
  const number = req.params.number;
  const state = req.params.state;

  const systemdata = JSON.parse(fs.readFileSync(systemdb));
  //const lockerdata = JSON.parse(fs.readFileSync(lockerdb));

  if (!number || !state) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  if (state.toLowerCase() === "open") {
    var state_isOpen = true;
    var state_status = "Unlocked";
    var state_Solenoid = "On";
  } else if (state.toLowerCase() === "close") {
    var state_isOpen = false;
    var state_status = "Locked";
    var state_Solenoid = "Off";
  } else {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  if (number.match(/^[0-9]+$/) && number.length <= 2) {
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
    locker.Status = state_status;
    locker.isOpen = state_isOpen;
    locker.Solenoid = state_Solenoid;
    fs.writeFileSync(systemdb, JSON.stringify(systemdata, null, 2));
    return res.status(200).json({
      code: 200,
      message: `Successfully set locker ${number} to ${state} state`,
    });
  } else {
    return res.status(400).json({
      code: 400,
      message: "Invalid locker number",
    });
  }
});

module.exports = router;
