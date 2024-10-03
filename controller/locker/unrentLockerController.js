const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");
const chalk = require("chalk");
const nodemailer = require("nodemailer");

const lockerdb = "./db/locker.json";
const userdb = "./db/user.json";
const rentdb = "./db/rent.json";
const systemdb = "./db/system.json";

//function 4 digit code
function generateCode() {
  return Math.floor(1000 + Math.random() * 9000);
}

function sendEmail(email, name, otp) {
  var transporter = nodemailer.createTransport({
    host: "mx3.mailspace.id",
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
      // user: "noreply@lockify.space",
      // pass: "@Sandiku197",
      user: "noreply@natslock.site",
      pass: "LockerAman",
    },
  });

  var mailOptions = {
    from: "noreply@lockify.space",
    to: email,
    subject: "Kode OTP Lockify",
    html: `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #1694d9;text-decoration:none;font-weight:600">Lockify</a>
      </div>
      <p style="font-size:1.1em">Hi, ${name}</p>
      <p>Terimakasih telah melakukan registrasi Lockify. Silakan gunakan kode OTP ini untuk mengakhiri penyewaan. OTP is valid for 5 minutes</p>
      <h2 style="background: #1694d9;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
      <p style="font-size:0.9em;">Regards,<br />Mechatronics Engineering SMTI Yogyakarta</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>Lockify Space</p>
        <p>Jl. Kusumanegara No.3, Semaki, Kec. Umbulharjo</p>
        <p>SMK SMTI YOGYAKARTA</p>
      </div>
    </div>
  </div>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return error;
    } else {
      console.log("Email sent: " + info.response);
      return info.response;
    }
  });
}

async function TimeWithPadding() {
  const date = new Date();
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

async function DateWithPadding() {
  const date = new Date();
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function TimeAndDate() {
  const Time = await TimeWithPadding();
  const Date = await DateWithPadding();
  const collab = `${Date} ${Time}`;
  return collab;
}

router.post("/locker/request/unrent", (req, res) => {
  const { lockers, users } = req.body;

  if (!lockers || !users) {
    return res.status(400).json({ code: 400, message: "Invalid request" });
  }

  const lockerData = JSON.parse(fs.readFileSync(lockerdb, "utf8"));
  const userData = JSON.parse(fs.readFileSync(userdb, "utf8"));
  const rentData = JSON.parse(fs.readFileSync(rentdb, "utf8"));
  const systemData = JSON.parse(fs.readFileSync(systemdb, "utf8"));

  let method, metode, userss;
  if (
    typeof users === "string" &&
    users.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
  ) {
    method = "email";
    metode = "Email";
    userss = users;
  } else if (
    typeof users === "string" &&
    users.match(/^[0-9]+$/) &&
    users.length <= 16
  ) {
    method = "phone";
    metode = "Phone";
    userss = users;
  } else if (
    typeof users === "string" &&
    users.match(/^[0-9]+$/) &&
    users.length === 20
  ) {
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
  if (!user) {
    return res.status(404).json({ code: 404, message: "User not found" });
  }

  //check if locker exist
  if (lockers.match(/^[0-9]+$/) && lockers.length <= 2) {
    var locker_metode = "alias";
    var Methodlock = "Alias";
    var locker_value = `Locker_${lockers}`;
  } else if (lockers.match(/^[0-9]+$/) && lockers.length === 6) {
    var locker_metode = "uuid";
    var Methodlock = "UUID";
    var locker_value = lockers;
  } else {
    return res.status(400).json({ code: 400, message: "Invalid locker" });
  }

  const locker = lockerData.find(
    (locker) => locker[locker_metode] === locker_value
  );

  if (!locker) {
    return res.status(404).json({ code: 404, message: "Locker not found" });
  }
  const lockerfindsystem = systemData.Locker.find(
    (locker) => locker[Methodlock] === locker_value
  );

  // if(lockerfindsystem.isOnline === false){
  //   return res.status(400).json({ code: 400, message: "Locker is Offline" });
  // }

  //check if locker is available
  if (locker.state === true) {
    return res
      .status(400)
      .json({ code: 400, message: "Locker still available" });
  }

  //check OnGoing transaction
  if (locker.OnGoing.stats === true) {
    return res
      .status(400)
      .json({ code: 400, message: "Locker on going transaction other user" });
  }

  //check if user already rent locker
  const rent = rentData.find((rent) => rent.Username === user.Username);

  //check length of rent
  if (rent) {
    if (!rent.Rent.length > 0) {
      return res.status(400).json({
        code: 400,
        message: "You Not Rent Locker",
      });
    }

    locker.OnGoing.User.UUID = user.UUID;
    locker.OnGoing.User.Username = user.Username;
    locker.OnGoing.User.Email = user.Email;
    locker.OnGoing.User.Phone = user.Phone;
    locker.OnGoing.stats = true;
    locker.OnGoing.code = generateCode().toString();
    locker.OnGoing.timestamp = Date.now();
    locker.OnGoing.expired = Date.now() + 120000; //added 2 minutes

    fs.writeFileSync(lockerdb, JSON.stringify(lockerData, null, 2));

    sendEmail(user.Email, user.Username, locker.OnGoing.code);

    console.log(
      chalk.magenta(TimeAndDate()),
      chalk.green(`Code Unrent : ${locker.OnGoing.code} to ${user.Username}`)
    );

    return res.status(200).json({
      code: 200,
      message: "Locker OnGoing Queue",
      data: {
        locker: locker.alias,
        user: user.username,
        unlock_code: locker.OnGoing.code,
        expired: locker.OnGoing.expired,
      },
    });
  } else {
    return res.status(400).json({ code: 400, message: "User not found" });
  }
});

module.exports = router;