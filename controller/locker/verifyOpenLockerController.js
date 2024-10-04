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
const configdb = "./db/config.json";
const systemdb = "./db/system.json";

// Fungsi untuk mendapatkan waktu dan tanggal terbaru
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
  const currentTime = await TimeWithPadding();
  const currentDate = await DateWithPadding();
  return `${currentDate} ${currentTime}`;
}

function sendEmail(email, users, LockerNum, Time, Date, temp, humi) {
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
    subject: "Action to Locker Open",
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Open Locker Success</title>
<style>
    /* CSS Reset */
    body, h1, p, table, th, td {
        margin: 0;
        padding: 0;
    }
    
    /* Email Body Styles */
    body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        background-color: #f4f4f4;
        padding: 20px;
    }

    .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);
    }

    h1 {
        color: #333;
        margin-bottom: 20px;
        text-align: center;
    }

    p {
        color: #666;
        margin-bottom: 20px;
        text-align: center;
    }

    .locker-info {
        margin-bottom: 20px;
        background-color: #ddd;
        border-radius: 10px;
        padding: 10px;
    }

    .locker-info table {
        width: 100%;
    }

    .locker-info th,
    .locker-info td {
        padding: 0px;
        text-align: left;
    }

    .footer {
        margin-top: 20px;
        background-color: #000;
        padding: 10px;
        border-radius: 0 0 10px 10px;
    }

    .footer p {
        color: #fff;
        text-align: center;
        font-size: 12px;
    }
    
    .footer a {
        color: #fff;
        font-weight: bold;
        text-decoration: none;
    }
</style>
</head>
<body>
    <div class="container">
        <h1>Open Locker Success</h1>
        <img src="https://natslock.my.id/file/assets/open.png" alt="Success Image" style="display: block; margin: 10px auto 20px; width: 20%; ">
        <p>Your locker open has been successfully completed.<br><strong>Don't forget your stuff & Close the Locker</strong></p>
        
        <div class="locker-info">
            <h2>Cancel Details:</h2>
            <table>
                <tr>
                    <th>User:</th>
                    <td>${users}</td>
                </tr>
                <tr>
                    <th>Locker Number:</th>
                    <td>${LockerNum}</td>
                </tr>
                <tr>
                    <th>Temperature At:</th>
                    <td>${temp} °C</td>
                </tr>
                <tr>
                    <th>Humidity At:</th>
                    <td>${humi} %</td>
                </tr>
                <tr>
                    <th>Time:</th>
                    <td>${Time}</td>
                </tr>
                <tr>
                    <th>Date:</th>
                    <td>${Date}</td>
                </tr>
            </table>
            <!-- Add more details as needed -->
        </div>
        
        <div class="footer">
            <p>© 2024 <a href="http://lockify.space"><strong>Lockify</strong></a>. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return error;
    } else {
      console.log(
        chalk.magenta(TimeAndDate()),
        "Email sent: " +
          info.response +
          " to " +
          email +
          " about locker action Open"
      );
      return info.response;
    }
  });
}

router.post("/locker/verify/open", async (req, res) => {
  const { lockers, users, code } = req.body;

  if (!lockers || !users || !code) {
    return res.status(400).json({ code: 400, message: "Invalid request" });
  }

  const lockerData = JSON.parse(fs.readFileSync(lockerdb, "utf8"));
  const userData = JSON.parse(fs.readFileSync(userdb, "utf8"));
  const rentData = JSON.parse(fs.readFileSync(rentdb, "utf8"));

  // Identifikasi metode pengguna
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

  // Periksa keberadaan pengguna
  const user = userData.find((user) => user[metode] === userss);
  if (!user) {
    return res.status(404).json({ code: 404, message: "User not found" });
  }

  // Periksa keberadaan locker
  let locker_metode, locker_value;
  if (lockers.match(/^[0-9]+$/) && lockers.length <= 2) {
    locker_metode = "alias";
    locker_value = `Locker_${lockers}`;
  } else if (lockers.match(/^[0-9]+$/) && lockers.length === 6) {
    locker_metode = "uuid";
    locker_value = lockers;
  } else {
    return res.status(400).json({ code: 400, message: "Invalid locker" });
  }

  const locker = lockerData.find(
    (locker) => locker[locker_metode] === locker_value
  );

  if (!locker) {
    return res.status(404).json({ code: 404, message: "Locker not found" });
  }

  // Periksa status locker
  if (locker.state === "true") {
    return res
      .status(400)
      .json({ code: 400, message: "Locker is still available" });
  }

  if (locker.OnGoing.stats === false) {
    return res.status(400).json({ code: 400, message: "Invalid code" });
  }

  if (locker.OnGoing.code !== code) {
    return res.status(400).json({ code: 400, message: "Code not match" });
  }

  // Periksa kadaluarsa kode
  const currentDate = new Date().getTime();
  if (locker.OnGoing.expired < currentDate) {
    return res.status(400).json({ code: 400, message: "Code has expired" });
  }

  // Membuka locker
  locker.OnGoing.stats = false;
  locker.justOpen = true;
  locker.expiredOpen = currentDate + 15000; // 30 detik dari sekarang
  locker.OnGoing.expired = 0;
  locker.OnGoing.code = "-";
  locker.codeOpen = 2;
  locker.countdownClose = 15000;

  fs.writeFileSync(lockerdb, JSON.stringify(lockerData, null, 2));

  const temp = locker.temp;
  const humi = locker.humi;
  const currentTime = await TimeWithPadding();
  const currentDateStr = await DateWithPadding();

  sendEmail(
    user.email,
    user.Username,
    locker.alias,
    currentTime,
    currentDateStr,
    temp,
    humi
  );

  console.log(
    chalk.magenta(await TimeAndDate()),
    chalk.green(`Locker Action Open: ${locker.alias} by ${user.Username}`)
  );

  return res
    .status(200)
    .json({ code: 200, message: "Locker open successfully", data: locker });
});

module.exports = router;
