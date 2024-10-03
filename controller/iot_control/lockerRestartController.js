const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

const lockerdb = "./db/locker.json";
const userdb = "./db/user.json";
const systemdb = "./db/system.json";

router.post("/locker/restart", (req, res) => {
  const lockers = req.body.lockers;
  const users = req.body.users;

  const userdata = JSON.parse(fs.readFileSync(userdb, "utf-8"));
  const lockerdata = JSON.parse(fs.readFileSync(lockerdb, "utf-8"));
  const system = JSON.parse(fs.readFileSync(systemdb, "utf-8"));

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

  //check if user exist
  const user = userdata.find((user) => user[metode] === userss);

  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  //check role of user
  if (user.Role !== "admin") {
    return res.status(401).send({ message: "Unauthorized" });
  }

  if (lockers.match(/^[0-9]+$/) && lockers.length <= 2) {
    var lockeralias = `Locker_${lockers}`;
    var metodelock = "alias";
    var Methodlock = "Alias";
  } else if (lockers.match(/^[0-9]+$/) && lockers.length <= 6) {
    var lockeralias = lockers;
    var metodelock = "uuid";
    var Methodlock = "UUID";
  } else {
    return res.status(400).send({ message: "Invalid locker" });
  }

  //check if locker exist
  const locker = lockerdata.find(
    (locker) => locker[metodelock] === lockeralias
  );

  const lockerfindsystem = system.Locker.find(
    (locker) => locker[Methodlock] === lockeralias
  );

  if (!locker) {
    return res.status(404).send({ message: "Locker not found" });
  }

  if (lockerfindsystem.isOnline === false) {
    return res.status(400).send({ message: "Locker is offline" });
  }

  const lastStatus = locker.Status;

  //restart locker
  locker.NeedRestart = true;
  locker.Status = "Restarting";

  //save to db
  fs.writeFileSync(lockerdb, JSON.stringify(lockerdata, null, 2));

  //wait for 7 seconds
  setTimeout(() => {
    locker.NeedRestart = false;
    locker.Status = lastStatus;
    fs.writeFileSync(lockerdb, JSON.stringify(lockerdata, null, 2));
  }, 7000);

  res.status(200).send({ message: "Locker restarted" });
});

module.exports = router;
