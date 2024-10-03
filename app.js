const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const cors = require("cors");
const performance = require("performance-now");
const chalk = require("chalk");
const axios = require("axios");
const cronjob = require('node-cron');
const port = 2045;

const IpPublic = 'https://icanhazip.com/';
const IpPrivate = require("ip");

const myIpPrivate = IpPrivate.address();
const { dir } = require("console");

async function getIpPublic() {
  return new Promise(async(resolve, reject) => {
    try {
      const response = await axios.get(IpPublic);
      resolve(response.data.trim()); // Trim data untuk menghilangkan spasi tambahan, jika ada
    } catch (error) {
      reject(error);
    }
  });
}

//check ping time to google
async function checkPingMs() {
  return new Promise(async(resolve, reject) => {
    try {
      const start = performance();
      const response = await axios.get("https://www.google.com");
      const end = performance();
      const pingTime = (end - start).toFixed(2);
      resolve(pingTime);
    } catch (error) {
      reject(error);
    } 
  });
}

async function getRamUsageNode() {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  return used.toFixed(2);
}

async function getStorageUsageNode() {
  const disk = require("diskusage");
  //check storage usage of this project
  const path = __dirname;
  return new Promise((resolve, reject) => {
    disk.check(path, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
}

//Cronjob function
const sessionWatcher = require('./function/sessionWatcher.js');
const codeWatcher = require('./function/codeWatcher.js');
const countCodeWatcher = require('./function/countCodeWatcher.js');
const durationRentWatcher = require('./function/durationRentWatcher.js');
const onlineWatcher = require('./function/onlineWatcher.js');
//const openWatcher = require('./function/openWatcher.js');
const otpCodeWatcher = require('./function/otpCodeWatcher.js');
//const keepOpenWatcher = require('./function/keepOpenWatcher.js');
const onlinePowerWatcher = require('./function/onlinePowerWatcher.js');
const coundDownOpen = require('./function/countDownClose.js')

cronjob.schedule('*/3 * * * * *', () => {
  codeWatcher();
  sessionWatcher();
  otpCodeWatcher();
});

cronjob.schedule('*/1 * * * * *', () => {
  countCodeWatcher();
  durationRentWatcher();
  onlineWatcher();
  //openWatcher();
  coundDownOpen();
  //keepOpenWatcher();
  onlinePowerWatcher();
});

//import controller (user)
const loginController = require("./controller/user/loginController");
const registerController = require("./controller/user/registerController");
const sessionCheckController = require("./controller/user/sessionCheckController");
const logoutController = require("./controller/user/logoutController");

//import controller (validation)
const getOtpController = require("./controller/validation/getOtpController");
const giveOtpController = require("./controller/validation/giveOtpController");

//import controller (export_db)
const userGetController = require("./controller/export_db/userGetController");
const lockerGetController = require("./controller/export_db/lockerGetController");
const otpStoreGetController = require("./controller/export_db/otpStoreGetController");
const systemGetController = require("./controller/export_db/systemGetController");
const rentGetController = require("./controller/export_db/rentGetController");  

//import controller (iot_control)
const dhtEditController = require("./controller/iot_control/dhtEditController");
const powerEditController = require("./controller/iot_control/powerEditController");
const PilotLampEditController = require("./controller/iot_control/pilotLampEditController");
const stateEditController = require("./controller/iot_control/stateEditController");
const lockerRestartController = require("./controller/iot_control/lockerRestartController");
const obsEditController = require("./controller/iot_control/obsEditController");
const fanEditController = require("./controller/iot_control/fanEditController");
const temperatureEditController = require("./controller/iot_control/temperatureEditController");

//import controller (locker)
const rentLockerController = require("./controller/locker/rentLockerController");
const verifyRentLockerController = require("./controller/locker/verifyRentLockerController");
const unrentLockerController = require("./controller/locker/unrentLockerController");
const verifyUnrentLockerController = require("./controller/locker/verifyUnrentLockerController");
const openLockerController = require("./controller/locker/openLockerController");
const verifyOpenLockerController = require("./controller/locker/verifyOpenLockerController");
const cancelLockerController = require("./controller/locker/cancelLockerController");
const bypassLockerController = require("./controller/locker/bypassLockerController");

//import controller (internal)
const fileAssetsController = require("./controller/internal/fileAssetsController");
const mapController = require("./controller/internal/mapController");
const getMapController = require("./controller/internal/getMapController");
const requestForgotPasswordController = require("./controller/internal/requestForgotPasswordController");
const verifyForgotPasswordController = require("./controller/internal/verifyForgotPasswordController");
const fileProfileController = require("./controller/internal/fileProfileController");
const editProfileController = require("./controller/internal/editProfileController");

//-----------------Configuration------------------//
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

app.enable("trust proxy"); // Enable the 'trust proxy' setting

//------------------------Routes-----------------------//
app.get("/", (req, res) => {
  const start = performance(); // Waktu awal sebelum pemrosesan permintaan
  const end = performance(); // Waktu setelah pemrosesan permintaan
  const pingTime = (end - start).toFixed(2); // Menghitung selisih waktu dalam milidetik

  res.send(`Waktu Ping ke Server: ${pingTime} ms`);
});

//use controller (user)
app.use("/api", loginController);
app.use("/api", registerController);
app.use("/api", sessionCheckController);
app.use("/api", logoutController);

//use controller (validation)
app.use("/api", getOtpController);
app.use("/api", giveOtpController);

//use controller (export_db)
app.use("/api", userGetController);
app.use("/api", lockerGetController);
app.use("/api", otpStoreGetController);
app.use("/api", systemGetController);
app.use("/api", rentGetController);

//use controller (iot_control)
app.use("/api", dhtEditController);
app.use("/api", powerEditController);
app.use("/api", PilotLampEditController);
app.use("/api", stateEditController);
app.use("/api", lockerRestartController);
app.use("/api", obsEditController);
app.use("/api", fanEditController);
app.use("/api", temperatureEditController);

//use controller (locker)
app.use("/api", rentLockerController);
app.use("/api", verifyRentLockerController);
app.use("/api", unrentLockerController);
app.use("/api", verifyUnrentLockerController);
app.use("/api", openLockerController);
app.use("/api", verifyOpenLockerController);
app.use("/api", cancelLockerController);
app.use("/api", bypassLockerController);

//use controller (internal)
app.use("/file", fileAssetsController);
app.use("/api", mapController);
app.use("/file", getMapController);
app.use("/api", requestForgotPasswordController);
app.use("/api", verifyForgotPasswordController);
app.use("/file", fileProfileController);
app.use("/api", editProfileController);

app.listen(port, async () => {
  console.log(chalk.white(`===============[Server Start!]===============`));
  console.log(chalk.blue.bold(`❍ Port: `),chalk.blue.italic(`${port}`));
  console.log(chalk.magenta.bold(`❍ Ping: `), chalk.magenta.italic(`${await checkPingMs()} ms`));
  console.log(chalk.cyan.bold(`❍ Ram Usage: `),chalk.cyan.italic(`${await getRamUsageNode()} MB`));
  console.log(chalk.red.bold(`❍ Storage Usage: `),chalk.red.italic(`${JSON.stringify(await getStorageUsageNode())}`));
  try {
    const publicIp = await getIpPublic();
    console.log(chalk.green.bold(`❍ Ip Public: `),chalk.green.italic(`${publicIp}`));
  } catch (error) {
    console.error(chalk.red.bold(`Error getting public IP: `),chalk.red.italic(`${error.message}`));
  }
  console.log(chalk.yellow.bold(`❍ Ip Private: `),chalk.yellow.italic(`${myIpPrivate}`));
  console.log(chalk.white(`============================================= `));
});
