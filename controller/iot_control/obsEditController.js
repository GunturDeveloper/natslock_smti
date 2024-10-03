const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

const systemdb = "./db/system.json";
const lockerdb = "./db/locker.json";

router.get("/system/locker/obs/:number/:state", (req, res) => {
    const number = req.params.number;
    const state = req.params.state;

    const systemdata = JSON.parse(fs.readFileSync(systemdb, "utf-8"));
    const lockerdata = JSON.parse(fs.readFileSync(lockerdb, "utf-8"));

    if(!number || !state) {
        return res.status(400).json({message: "Invalid request"});
    }

    if(state.toLowerCase() == "1"){
        var stateobs = true;
    } else if(state.toLowerCase() == "0"){
        var stateobs = false;
    } else {
        return res.status(400).json({message: "Invalid state"});
    }

    if (number.match(/^[0-9]+$/) && number.length <= 2) {
        const lockeralias = `Locker_${number}`;
        const locker = systemdata.Locker.find(
          (locker) => locker.Alias === lockeralias
        );
        const lockerobs = lockerdata.find(
          (locker) => locker.alias === lockeralias
        );

        if (!locker) {
            return res.status(404).json({
                code: 404,
                message: "Locker not found",
            });
        }

        locker.sensOpen = stateobs;
        lockerobs.sensOpen = stateobs;
        fs.writeFileSync(systemdb, JSON.stringify(systemdata, null, 2));
        fs.writeFileSync(lockerdb, JSON.stringify(lockerdata, null, 2));
        return res.status(200).json({
          code: 200,
          message: `sensOpen updated`,
        });
    } else {
        return res.status(400).json({
            code: 400,
            message: "Invalid locker number",
        });
    }
});

module.exports = router;