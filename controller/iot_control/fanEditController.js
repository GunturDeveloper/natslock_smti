const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

const systemdb = "./db/system.json";

router.get("/system/locker/fan/speed/:type/:speed", (req, res) => {
  const speed = parseFloat(req.params.speed);
  const type = req.params.type;
  const system = JSON.parse(fs.readFileSync(systemdb, "utf-8"));

  if (!type) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if (type == "1") {
    if (isNaN(speed)) {
      res.status(400).json({ error: "Invalid Speed" });
      return;
    } else {
      if(speed > 100 || speed < 0){
        res.status(400).json({ error: "Invalid Speed" });
        return;
      }
      const calculateAnalog = (speed) => {
        return (speed / 100) * 255;
      };
      system.Main_Power.Fan_1.Speed = speed;
      system.Main_Power.Fan_1.Analog = calculateAnalog(speed);
      fs.writeFileSync(systemdb, JSON.stringify(system, null, 2));
      res
        .status(200)
        .json({ message: "Speed updated", data: system.Main_Power });
    }
  } else if (type == "2") {
    if (isNaN(speed)) {
      res.status(400).json({ error: "Invalid Speed" });
      return;
    } else {
      if(speed > 100 || speed < 0){
        res.status(400).json({ error: "Invalid Speed" });
        return;
      }
      const calculateAnalog = (speed) => {
        return (speed / 100) * 255;
      };
      system.Main_Power.Fan_2.Speed = speed;
      system.Main_Power.Fan_2.Analog = calculateAnalog(speed);
      fs.writeFileSync(systemdb, JSON.stringify(system, null, 2));
      res
        .status(200)
        .json({ message: "Speed updated", data: system.Main_Power });
    }
  } else {
    return res.status(400).json({ message: "Invalid type" });
  }
});

router.get("/system/locker/fan/state/:type/:status", (req, res) => {
  const type = req.params.type;
  const status = req.params.status;

  const system = JSON.parse(fs.readFileSync(systemdb, "utf-8"));

  if (!type || !status) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if(type == "1"){
    if(status.toLowerCase() == "on"){
      system.Main_Power.Fan_1.isTurnOn = true;
      fs.writeFileSync(systemdb, JSON.stringify(system, null, 2));
      res.status(200).json({ message: "Fan 1 state updated", data: system.Main_Power });
    } else if(status.toLowerCase() == "off"){
      system.Main_Power.Fan_1.isTurnOn = false;
      fs.writeFileSync(systemdb, JSON.stringify(system, null, 2));
      res.status(200).json({ message: "Fan 1 state updated", data: system.Main_Power });
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }
  } else if(type == "2"){
    if(status.toLowerCase() == "on"){
      system.Main_Power.Fan_2.isTurnOn = true;
      fs.writeFileSync(systemdb, JSON.stringify(system, null, 2));
      res.status(200).json({ message: "Fan 2 state updated", data: system.Main_Power });
    } else if(status.toLowerCase() == "off"){
      system.Main_Power.Fan_2.isTurnOn = false;
      fs.writeFileSync(systemdb, JSON.stringify(system, null, 2));
      res.status(200).json({ message: "Fan 2 state updated", data: system.Main_Power });
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }
  } else {
    return res.status(400).json({ message: "Invalid type" });
  }
});

module.exports = router;
