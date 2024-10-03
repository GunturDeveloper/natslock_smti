const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

const otpstoredb = "./db/otpstore.json";

router.get("/otpstoredb/:users", (req, res) => {
  const users = req.params.users;

  if (users === "all") {
    const data = JSON.parse(fs.readFileSync(otpstoredb, "utf8"));
    const formattedJson = JSON.stringify(data, null, 2);
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
    var userss = users;
  } else if (users.match(/^[0-9]+$/) && users.length === 20) {
    var method = "uuid";
    var metode = "UUID";
    var userss = parseInt(users);
  } else {
    var method = "username";
    var metode = "Username";
    var userss = users;
  }

  //finding data
  const data = JSON.parse(fs.readFileSync(otpstoredb, "utf8"));
  const findData = data.find((item) => item[metode] === userss);

  if (findData) {
    res.status(200).json({
      status: true,
      message: "Data found",
      data: findData,
    });
    return;
  } else {
    res.status(404).json({
      status: false,
      message: "Data not found",
    });
    return;
  }
});

module.exports = router;
