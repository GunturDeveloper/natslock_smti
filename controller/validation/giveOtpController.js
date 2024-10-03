const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");
const nodemailer = require("nodemailer");
const chalk = require("chalk");

const userdb = "./db/user.json";
const configdb = "./db/config.json";
const otpstoredb = "./db/otpstore.json";

router.post("/validation/giveotp", (req, res) => {
  const { users, code } = req.body;

  if (users.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
    var method = "email";
    var metode = "Email";
  } else if (users.match(/^[0-9]+$/) && users.length > 9) {
    var method = "phone";
    var metode = "Phone";
  } else {
    return res.status(400).json({
      code: 400,
      message: "Invalid data",
    });
  }

  const data = JSON.parse(fs.readFileSync(userdb, "utf-8"));
  const user = data.find((user) => user[metode] === users);
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "User not found",
    });
  }

  const otpdata = JSON.parse(fs.readFileSync(otpstoredb, "utf-8"));
  const otpuser = otpdata.find((otpuser) => otpuser[metode] === users);

  if (otpuser) {
    if (otpuser.Otp.length === 0) {
      return res.status(400).json({
        code: 400,
        message: "Otp not found or expired",
      });
    }
    const otpmatch = otpuser.Otp.find((otp) => otp.Code === code);

    if (!otpmatch) {
      return res.status(400).json({
        code: 400,
        message: "Invalid otp",
      });
    }

    const expired = otpmatch.Expired;
    const now = new Date().getTime();

    if (now > expired) {
      return res.status(400).json({
        code: 400,
        message: "Otp expired",
      });
    }

    user.Verified = true;
    otpuser.Verified = true;

    const index = otpuser.Otp.indexOf(otpmatch);
    if (index > -1) {
      otpuser.Otp.splice(index, 1);
    }

    fs.writeFileSync(userdb, JSON.stringify(data, null, 2));
    fs.writeFileSync(otpstoredb, JSON.stringify(otpdata, null, 2));
    console.log(chalk.green("User verified"));
    return res.status(200).json({
      code: 200,
      message: "Verify Success",
    });
  } else {
    return res.status(400).json({
      code: 400,
      message: "Otp not found",
    });
  }
});

module.exports = router;
