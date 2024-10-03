const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

const lockerdb = "./db/locker.json";
const userdb = "./db/user.json";
const rentdb = "./db/rent.json";
const systemdb = "./db/system.json";

router.post("/locker/bypass", (req, res) => {
  const lockers = req.body.lockers;
  const users = req.body.users;

  const lockerData = JSON.parse(fs.readFileSync(lockerdb, "utf8"));
  const userData = JSON.parse(fs.readFileSync(userdb, "utf8"));
  const rentData = JSON.parse(fs.readFileSync(rentdb, "utf8"));
  const systemData = JSON.parse(fs.readFileSync(systemdb, "utf8"));

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
  const user = userData.find((user) => user[metode] === userss);

  if (!userExist) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  //check users is admin
  if (userExist.Role !== "admin") {
    return res.status(400).json({
      message: "User not authorized",
    });
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
  const locker = lockerData.find(
    (locker) => locker[metodelock] === lockeralias
  );

  const lockerfindsystem = systemData.Locker.find(
    (locker) => locker[Methodlock] === lockeralias
  );

  if (!locker) {
    return res.status(404).send({ message: "Locker not found" });
  }

  if (lockerfindsystem.isOnline === false) {
    return res.status(400).send({ message: "Locker is offline" });
  }

  const usersRent = lockerData.OnGoing.User.UUID;

  const findUserRent = rentData.find((rent) => rent.UUID === usersRent);

  if (findUserRent) {
    //write history
    findUserRent.History.push({
      alias: locker.alias,
      name: locker.name,
      uuid: locker.uuid,
      time: new Date().toISOString(),
      code: "-",
      action: "Open by admin",
    });
  }

  //restart locker
  locker.codeOpen = 9;
  locker.justOpen = true;

  //save to db
  fs.writeFileSync(lockerdb, JSON.stringify(lockerData, null, 2));
  fs.writeFileSync(rentdb, JSON.stringify(rentData, null, 2));
  res.status(200).send({ message: "Locker open" });
});

module.exports = router;