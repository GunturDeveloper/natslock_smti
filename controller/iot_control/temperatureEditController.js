const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

const systemdb = "./db/system.json";

router.get("/system/locker/temperature/:tempcbat/:tempfbat/:tempcpsu/:tempfpsu/:tempbox/:humibox", (req, res) => {
    const tempcbat = parseFloat(req.params.tempcbat);
    const tempfbat = parseFloat(req.params.tempfbat);
    const tempcpsu = parseFloat(req.params.tempcpsu);
    const tempfpsu = parseFloat(req.params.tempfpsu);
    const tempbox = parseFloat(req.params.tempbox);
    const humibox = parseFloat(req.params.humibox);
    
    const system = JSON.parse(fs.readFileSync(systemdb, "utf-8"));
  
    if (!tempcbat && !tempfbat && !tempcpsu && !tempfpsu && !tempbox && !humibox) {
      return res.status(400).json({ message: "Invalid request" });
    }
  
    if(isNaN(tempcbat)){
        var tempbatC = 0.0;
    } else {
        var tempbatC = tempcbat;
    }

    if(isNaN(tempfbat)){
        var tempbatF = 0.0;
    } else {
        var tempbatF = tempfbat;
    }

    if(isNaN(tempcpsu)){
        var tempPSUC = 0.0;
    } else {
        var tempPSUC = tempcpsu;
    }

    if(isNaN(tempfpsu)){
        var tempPSUF = 0.0;
    } else {
        var tempPSUF = tempfpsu;
    }

    if(isNaN(tempbox)){
        var tempBox = 0.0;
    } else {
        var tempBox = tempbox;
    }

    if(isNaN(humibox)){
        var humiBox = 0.0;
    } else {
        var humiBox = humibox;
    }

    system.Main_Power.Temperature.Battery_Temperature = tempbatC;
    system.Main_Power.Temperature.Battery_TemperatureF = tempbatF;
    system.Main_Power.Temperature.PSU_Temperature = tempPSUC;
    system.Main_Power.Temperature.PSU_TemperatureF = tempPSUF;
    system.Main_Power.Temperature.Box_Temperature = tempBox;
    system.Main_Power.Temperature.Box_Humidity = humiBox;

    fs.writeFileSync(systemdb, JSON.stringify(system, null, 2));

    res.status(200).json({ message: "Temperature updated" });
  });

module.exports = router;