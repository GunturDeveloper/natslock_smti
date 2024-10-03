const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");
const chalk = require("chalk");

const usersdb = "./db/user.json";
const otpstore = "./db/otpstore.json";
const rentdb = "./db/rent.json";
const configdb = "./db/config.json";

function twentyrandomintegers() {
  let result = "";
  const characters = "1234567890";
  const charactersLength = characters.length;
  for (let i = 0; i < 20; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

router.post("/register", async (req, res) => {
  {
    try {
      const { name, username, email, phone, password, verifypassword, role } =
        req.body;

      if (!name || !username || !email || !phone || !password || !role) {
        return res
          .status(400)
          .json({ code: 400, msg: "Please enter all fields" });
      }

      if (role !== "user") {
        return res.status(400).json({ code: 400, msg: "Invalid role" });
      }

      //format nomor WA
      let nomor = phone;
      if (nomor.startsWith("0")) {
        nomor = nomor.replace("0", "62");
      } else if (nomor.startsWith("+")) {
        nomor = nomor.replace("+", "");
      } else if (nomor.startsWith("62")) {
        nomor = nomor;
      } else {
        nomor = "62" + nomor;
      }

      //cek ketersediaan username, email, nomor, dan nomor WA
      const users = JSON.parse(fs.readFileSync(usersdb));
      const configdata = JSON.parse(fs.readFileSync(configdb));
      const rentdata = JSON.parse(fs.readFileSync(rentdb));

      //cek data kosong
      if (!users || !Array.isArray(users)) {
        users = [];
      }

      const findusername = users.find((user) => user.username === username);
      const findemail = users.find((user) => user.email === email);
      const findphone = users.find((user) => user.phone === phone);

      if (findusername) {
        return res
          .status(400)
          .json({ code: 400, msg: "Username already exists" });
      }

      if (findemail) {
        return res.status(400).json({ code: 400, msg: "Email already exists" });
      }

      if (findphone) {
        return res
          .status(400)
          .json({ code: 400, msg: "Phone number already exists" });
      }

      //cek panjang password dan kelenngkapan karakter
      if (password.length < 8) {
        return res.status(422).json({
          code: 422,
          message: "Password must be at least 8 characters",
        });
      }

      if (!password.match(/[a-z]/g)) {
        return res.status(422).json({
          code: 422,
          message: "Password must contain at least one lowercase letter",
        });
      }

      if (!password.match(/[A-Z]/g)) {
        return res.status(422).json({
          code: 422,
          message: "Password must contain at least one uppercase letter",
        });
      }

      if (!password.match(/[0-9]/g)) {
        return res.status(422).json({
          code: 422,
          message: "Password must contain at least one number",
        });
      }

      if (!password === verifypassword) {
        return res.status(422).json({
          code: 422,
          message: "Password not match",
        });
      }

      //cek email
      if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        return res
          .status(422)
          .json({ code: 422, message: "Invalid email address" });
      }


      const newUser = {
        UUID: parseInt(twentyrandomintegers()),
        Name: name,
        Verified: false,
        Username: username,
        Password: password,
        Email: email,
        Phone: nomor,
        Picture: "https://natslock.my.id/profile/default.jpg",
        Role: "user",
        CreatedAt: new Date().toISOString(),
        SessionId: "",
        Expired_Session: "",
      };

      const jsonotp = {
        UUID: newUser.UUID,
        Name: newUser.Name,
        Email: newUser.Email,
        Phone: newUser.Phone,
        Verified: false,
        Otp: [],
        Created_At: new Date(),
      };

      const jsonrent = {
        UUID: newUser.UUID,
        Name: newUser.Name,
        Username: newUser.Username,
        Email: newUser.Email,
        Phone: newUser.Phone,
        Rent: [],
        History: [],
      };

      users.push(newUser);
      fs.writeFileSync(usersdb, JSON.stringify(users, null, 2));

      rentdata.push(jsonrent);
      fs.writeFileSync(rentdb, JSON.stringify(rentdata, null, 2));

      let otpstoredb = JSON.parse(fs.readFileSync(otpstore));
      if (!otpstoredb || !Array.isArray(otpstoredb)) {
        otpstoredb = [];
      }

      otpstoredb.push(jsonotp);
      fs.writeFileSync(otpstore, JSON.stringify(otpstoredb, null, 2));

      console.log(
        chalk.green(`[REGISTER]`),
        chalk.blue(`${username}`),
        chalk.white(`Registered successfully`),
        chalk.inverse(`UUID: ${newUser.UUID}`),
        chalk.white(`.`)
      );
      res
        .status(200)
        .json({ code: 200, message: "Register successful", data: newUser });
    } catch (error) {
      console.error(chalk.red(`[REGISTER]`), chalk.white(`Error: ${error}`));
      res.status(500).json({ code: 500, message: "Internal Server Error" });
    }
  }
});

module.exports = router;
