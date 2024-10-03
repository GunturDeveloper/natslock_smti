const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

const userdb = './db/user.json';

router.get("/userdb/:users", (req, res) => {
    const users = req.params.users;
    const user = JSON.parse(fs.readFileSync(userdb, "utf-8"));

    if (users === "all") {
        const formattedJson = JSON.stringify(user, null, 2);
        res.setHeader("Content-Type", "application/json");
        res.send(formattedJson);
        return;
    }

    //detect method search
    if (users.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        var method = "email";
        var metode = "Email";
        var userss = users;
    } else if (users.match(/^[0-9]+$/) && users.length <= 16) {
        var method = "phone";
        var metode = "Phone";
        var userss = users
    } else if (users.match(/^[0-9]+$/) && users.length === 20) {
        var method = "uuid";
        var metode = "UUID";
        var userss = parseInt(users)
    } else {
        var method = "username";
        var metode = "Username";
        var userss = users
    }

    //search user
    console.log(metode)
    const userSearch = user.find((user) => user[metode] === userss);

    if (!userSearch) {
        res.status(404).json({ code: 404, message: "User not found" });
        return;
    }

    const formattedJson = JSON.stringify(userSearch, null, 2);
    res.setHeader("Content-Type", "application/json");
    res.send(formattedJson);
});

module.exports = router;