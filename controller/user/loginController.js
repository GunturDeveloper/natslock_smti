const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");
const uuid = require("uuid");
const chalk = require("chalk");

const usersdb = "./db/user.json";

router.post("/login", (req, res) => {
  const users = req.body.users;
  const pass = req.body.pass;
  const force = req.body.force;

  //detect method of login
  if (users.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
    var method = "email";
    var metode = "Email";
  } else if (users.match(/^[0-9]+$/) && users.length > 9) {
    var method = "phone";
    var metode = "Phone";
  } else {
    var method = "username";
    var metode = "Username";
  }

  //check if user exists
  fs.readFile(usersdb, (err, data) => {
    if (err) {
      res.status(500).json({ code: 500, message: "Internal Server Error" });
    } else {
      const userss = JSON.parse(data);
      const user = userss.find((user) => user[metode] === users);
      if (user) {
        if (user.Password === pass) {
          if(user.Verified ===  false && user.Verified === false){
            res.status(403).json({code: 403, message: "Verifikasi belum dilakukan, silahkan verifikasi akun anda terlebih dahulu!"})
            return;
          }
          //check session already exists
          if (user.sessionId !== "") {
            if (force == "" || !force) {
              res.status(401).json({
                code: 401,
                message: "User Telah Login didevice lain! ingin force login?",
              });
              return;
            } else if (force == false) {
              res.status(200).json({ code: 200, message: "Login dibatalkan" });
              return;
            } else if (force == true) {
              //force login
              const sessionId = uuid.v4();
              const timestamp_now = new Date().getTime();
              const timestamp_expired = timestamp_now + 24 * 60 * 60 * 1000;
              user.sessionId = sessionId;
              user.Expired_Session = timestamp_expired;
              fs.writeFile(usersdb, JSON.stringify(userss, null, 2), (err) => {
                if (err) {
                  res.status(500).send("Internal Server Error");
                } else {
                  //set 1 day cookie
                  res.cookie("sessionId", sessionId, {
                    maxAge: 24 * 60 * 60 * 1000,
                  });
                  res.status(200).json({
                    code: 200,
                    message: "Login berhasil",
                    sessionId: sessionId,
                    data: user,
                  });
                }
              });
              return;
            }
          } else if (force == "" || !force) {
            //normal login
            const sessionId = uuid.v4();
            const timestamp_now = new Date().getTime();
            const timestamp_expired = timestamp_now + 24 * 60 * 60 * 1000;
            user.sessionId = sessionId;
            user.Expired_Session = timestamp_expired;
            fs.writeFile(usersdb, JSON.stringify(userss, null, 2), (err) => {
              if (err) {
                res
                  .status(500)
                  .json({ code: 500, message: "Internal Server Error" });
              } else {
                //set 1 day cookie
                res.cookie("sessionId", sessionId, {
                  maxAge: 24 * 60 * 60 * 1000,
                });
                res.status(200).json({
                  code: 200,
                  message: "Login berhasil",
                  sessionId: sessionId,
                  data: user,
                });
              }
            });
            return;
          }
        } else {
          res.status(401).json({ code: 401, message: "Password Salah" });
        }
      } else {
        res.status(404).json({ code: 404, message: "User tidak ditemukan" });
      }
    }
  });
});

module.exports = router;
