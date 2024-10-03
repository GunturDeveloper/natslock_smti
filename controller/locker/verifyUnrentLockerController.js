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

//function 4 digit code
function generateCode() {
  return Math.floor(1000 + Math.random() * 9000);
}



function sendEmail(email, users, LockerNum, Time, Date, temp, humi, duration) {
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
    subject: "Action to Locker Unrented",
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>UnRent Locker Success</title>
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
        <h1>UnRent Locker Success</h1>
        <img src="https://natslock.my.id/file/assets/unrent.png" alt="Success Image" style="display: block; margin: 10px auto 20px; width: 20%; ">
        <p>Your locker unrental has been successfully completed.<br><strong>Don't forget your stuff & Close the Locker</strong></p>
        
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
                    <th>Duration Rent:</th>
                    <td>${duration}</td>
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
            <p>© 2024 <a href="http://lockify.space"><strong>Lockify</strong></a>. All rights reserved. </p>
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
          " about locker action Unrent"
      );
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

router.post("/locker/verify/unrent", async (req, res) => {
  const { lockers, users, code } = req.body;

  if (!lockers || !users || !code) {
    return res.status(400).json({ code: 400, message: "Invalid request" });
  }

  const lockerData = JSON.parse(fs.readFileSync(lockerdb, "utf8"));
  const userData = JSON.parse(fs.readFileSync(userdb, "utf8"));
  const rentData = JSON.parse(fs.readFileSync(rentdb, "utf8"));

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
    var locker_value = `Locker_${lockers}`;
  } else if (lockers.match(/^[0-9]+$/) && lockers.length === 6) {
    var locker_metode = "uuid";
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

  //check if locker is rented
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
  const currentDate = new Date();

  //check if code is expired
  if (locker.OnGoing.expired < currentDate) {
    return res.status(400).json({ code: 400, message: "Code has expired" });
  }

  if (locker.OnGoing.User.UUID !== user.UUID) {
    return res.status(400).json({ code: 400, message: "Invalid user" });
  }
  

  //change locker status to false
  locker.status = "Available";
  locker.state = true;
  locker.countdownClose = 20000;

  locker.OnGoing.stats = false;
  locker.OnGoing.expired = 0;
  locker.OnGoing.code = "-";
  locker.expiredOpen = null;
  locker.justOpen = true;
  locker.codeOpen = 3;
  locker.OnGoing.User.UUID = "";
  locker.OnGoing.User.Username = "";
  locker.OnGoing.User.Email = "";
  locker.OnGoing.User.Phone = "";


  //wrote to locker db
  fs.writeFileSync(lockerdb, JSON.stringify(lockerData, null, 2));

  try {
    locker.expiredOpen = currentDate.getTime() + 30000;  
    fs.writeFileSync(lockerdb, JSON.stringify(lockerData, null, 2));
  } catch (error) {
    console.error("Error writing locker database:", err.message);
      return res.status(500).json({ code: 500, message: "Failed to update locker data" });
  }



  const added_history_rent = {
    alias: locker.alias,
    name: locker.name,
    uuid: locker.uuid,
    action: "unrent",
    timestamp: currentDate.toISOString(),
    code: code,
    duration: locker.OnGoing.duration,
  };

  const rent = rentData.find((rent) => rent.Username === user.Username);
  rent.History.push(added_history_rent);

  //delete rent
  rent.Rent = rent.Rent.filter((rent) => rent.uuid !== locker.uuid);
  fs.writeFileSync(rentdb, JSON.stringify(rentData, null, 2));

  const sys = JSON.parse(fs.readFileSync(systemdb));
  const lockerfindsystem = sys.Locker.find((abcd) => abcd.UUID === locker.uuid);

  //wrote to locker db
  fs.writeFileSync(lockerdb, JSON.stringify(lockerData, null, 2));

  // From value : "Locker_1" to value : "1"
  const getNumLocker = locker.alias.split("_")[1];

  //send email
  const Time = await TimeWithPadding();
  const PDate = await DateWithPadding();

  sendEmail(
    user.Email,
    user.Username,
    getNumLocker,
    Time,
    PDate,
    lockerfindsystem.Temperature,
    lockerfindsystem.Humidity,
    locker.OnGoing.duration
  );

  console.log(
    chalk.magenta(TimeAndDate()),
    chalk.green(`Locker Action Unrent: ${locker.alias} by ${user.username}`)
  );

  //result
  return res
    .status(200)
    .json({ code: 200, message: "Locker unrented successfully", data: locker });
});

module.exports = router;