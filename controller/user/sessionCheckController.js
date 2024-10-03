const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const uuid = require("uuid");
const axios = require("axios");
const chalk = require("chalk");

const userdb = "./db/user.json";

router.post("/session/check", (req, res) => {
  const { sessionid, users } = req.body;

  if (!sessionid) {
    return res.status(400).json({ message: "Session ID is required" });
  }

  if (!users) {
    return res.status(400).json({ message: "Users are required" });
  }

  const userdata = JSON.parse(fs.readFileSync(userdb, "utf-8"));

  //detect method search
  let method, metode, userss;
  if (typeof users === 'string' && users.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
    method = "email";
    metode = "Email";
    userss = users;
  } else if (typeof users === 'string' && users.match(/^[0-9]+$/) && users.length <= 16) {
    method = "phone";
    metode = "Phone";
    userss = users;
  } else if (typeof users === 'string' && users.match(/^[0-9]+$/) && users.length === 20) {
    method = "uuid";
    metode = "UUID";
    userss = parseInt(users);
  } else {
    method = "username";
    metode = "Username";
    userss = users;
  }

  const user = userdata.find((user) => user[metode] === userss);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //find session in json
  if (sessionid !== user.sessionId) {
    return res
      .status(400)
      .json({ message: "Session not found", result: false, data: user });
  }

  res.status(200).json({ message: "Session found", result: true, data: user });
});


module.exports = router;