const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

const systemdb = "./db/system.json";

function mappingVoltage(value){
  //mapping voltage value 0 is 0V and 75 is 14.5V
  const mappedValue = (value / 75) * 14.5;
  return mappedValue.toFixed(2);
}

router.get("/system/locker/power/voltage/:type/:volt", async(req, res) => {
  const volt = parseFloat(req.params.volt);
  const type = req.params.type;
  const system = JSON.parse(fs.readFileSync(systemdb, "utf-8"));

  if (!type) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if (type.toLowerCase() == "psu") {
    if (isNaN(volt)) {
      res.status(400).json({ error: "Invalid voltage" });
      return;
    } else {
      const mappedVolt = mappingVoltage(volt);
      system.Main_Power.Voltage.PSU_Voltage = mappedVolt;
      fs.writeFileSync(systemdb, JSON.stringify(system, null, 2));
      res
        .status(200)
        .json({ message: "Voltage updated", data: system.Main_Power });
    }
  } else if (type.toLowerCase() == "bat") {
    if (isNaN(volt)) {
      res.status(400).json({ error: "Invalid voltage" });
      return;
    } else {
      const mappedVolt = mappingVoltage(volt);
      system.Main_Power.Voltage.Battery_Voltage = mappedVolt;
      fs.writeFileSync(systemdb, JSON.stringify(system, null, 2));
      res
        .status(200)
        .json({ message: "Voltage updated", data: system.Main_Power });
    }
  } else if (type.toLowerCase() == "out") {
    if (isNaN(volt)) {
      res.status(400).json({ error: "Invalid voltage" });
      return;
    } else {
      const mappedVolt = mappingVoltage(volt);
      system.Main_Power.Voltage.Output_Voltage = mappedVolt;
      fs.writeFileSync(systemdb, JSON.stringify(system, null, 2));
      res
        .status(200)
        .json({ message: "Voltage updated", data: system.Main_Power });
    }
  } else {
    return res.status(400).json({ message: "Invalid type" });
  }
});

router.get("/system/locker/power/state/:type/:status", (req, res) => {
  const type = req.params.type;
  const status = req.params.status;

  const system = JSON.parse(fs.readFileSync(systemdb, "utf-8"));

  if (!type || !status) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if(type.toLowerCase() == "bat"){
    if(status.toLowerCase() == "on"){
      const timenow = new Date().getTime();
      system.Main_Power.State.Battery = "Used";
      system.Main_Power.State.PSU = "Disconnected";
      system.Main_Power.State.Output = "On";
      system.Main_Power.LastOnline = timenow;
      fs.writeFileSync(systemdb, JSON.stringify(system, null, 2));
      res.status(200).json({ message: "Battery state updated", data: system.Main_Power });
    } else if(status.toLowerCase() == "off"){
      const timenow = new Date().getTime();
      system.Main_Power.State.Battery = "Charging";
      system.Main_Power.State.PSU = "Connected";
      system.Main_Power.State.Output = "On";
      system.Main_Power.LastOnline = timenow;
      fs.writeFileSync(systemdb, JSON.stringify(system, null, 2));
      res.status(200).json({ message: "Battery state updated", data: system.Main_Power });
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }
  } else {
    return res.status(400).json({ message: "Invalid type" });
  }
});

module.exports = router;
