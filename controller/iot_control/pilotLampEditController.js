const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

const systemdb = "./db/system.json";

router.get("/system/locker/pl/:type/:number/:state", (req, res) => {
    const type = req.params.type;
    const number = req.params.number;
    const state = req.params.state;

    const systemdata = JSON.parse(fs.readFileSync(systemdb, "utf-8"));

    if(!type || !number || !state) {
        return res.status(400).json({message: "Invalid request"});
    }

    if(type.toLowerCase() == "green"){
        var typepl = "Green";
        var typejson = "PilotLamp_Green";
    } else if(type.toLowerCase() == "red"){
        var typepl = "Red";
        var typejson = "PilotLamp_Red";
    } else {
        return res.status(400).json({message: "Invalid type"});
    }

    if(state.toLowerCase() == "on"){
        var statepl = "On";
    } else if(state.toLowerCase() == "off"){
        var statepl = "Off";
    } else {
        return res.status(400).json({message: "Invalid state"});
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
        locker[typejson] = statepl;
        fs.writeFileSync(systemdb, JSON.stringify(systemdata, null, 2));
        return res.status(200).json({
          code: 200,
          message: `Pilot Lamp ${typepl} updated`,
        });
    } else {
        return res.status(400).json({
            code: 400,
            message: "Invalid locker number",
        });
    }
});

module.exports = router;