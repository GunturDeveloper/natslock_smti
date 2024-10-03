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

function generateOTP() {
  var otp = "";
  for (var i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
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
      <p>Terimakasih telah melakukan registrasi Lockify. Silakan gunakan kode OTP ini untuk melanjutkan registrasi. OTP is valid for 5 minutes</p>
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

function sendWhatsapp(phone, name, otp) {
  const gethost = JSON.parse(fs.readFileSync(configdb));
  const { url_api } = gethost.WhatsappOTP;

  const msg = `Hi ${name}
  
  ${otp} adalah kode verifikasi Anda. 
  kode ini berlaku selama 5 menit.
  
  Demi keamanan, jangan berikan kode ini kepada siapapun. 
  Terimakasih telah melakukan regristrasi Lockify.`;

  const urisend = url_api + "sendmessage";
  const params = {
    number: phone,
    message: msg,
  };
  axios
    .post(urisend, params)
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });
}

router.post("/validation/getotp", (req, res) => {
  const { users } = req.body;

  if (!users) {
    return res.status(400).json({
      code: 400,
      message: "Invalid data",
    });
  }

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

  const userss = JSON.parse(fs.readFileSync(userdb));
  const user = userss.find((user) => user[metode] === users);
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "User not found",
    });
  }

  if (user.Verified) {
    return res.status(400).json({
      code: 400,
      message: "User already verified",
    });
  }

  const otpdata = JSON.parse(fs.readFileSync(otpstoredb));
  const userotp = otpdata.find((user) => user[metode] === users);
  if (userotp) {
    const checkempty = userotp.Otp.length;

    if (checkempty === 0) {
      const otpcode = generateOTP();
      const otpdjson = {
        Code: otpcode,
        Method: method,
        Url: "http://192.168.183.4:2045/validation/verifyotp",
        Expired: new Date().getTime() + 300000,
      };
      userotp.Otp.push(otpdjson);
      fs.writeFileSync(otpstoredb, JSON.stringify(otpdata, null, 2));

      if (method === "email") {
        const response = sendEmail(users, user.Name, otpcode);

        if (response instanceof Error) {
          return res.status(500).json({
            code: 500,
            message: "Internal server error",
          });
        } else {
          return res.status(200).json({
            code: 200,
            message: "OTP sent to email",
            data: otpdjson,
          });
        }
      } else {
        sendWhatsapp(users, user.Name, otpcode);
      }
    } else {
      const lastotp = userotp.Otp[userotp.Otp.length - 1];
      if (lastotp.EXpired > new Date().getTime()) {
        return res.status(400).json({
          code: 400,
          message: "OTP already sent, Please wait for 5 minutes",
          data: lastotp,
        });
      }

      const otpcode = generateOTP();
      const otpdjson = {
        Code: otpcode,
        Method: method,
        Url: "http://192.168.183.4:2045/validation/verifyotp",
        Expired: new Date().getTime() + 300000,
      };
      userotp.Otp.push(otpdjson);
      fs.writeFileSync(otpstoredb, JSON.stringify(otpdata, null, 2));

      if (method === "email") {
        const response = sendEmail(users, user.Name, otpcode);

        if (response instanceof Error) {
          return res.status(500).json({
            code: 500,
            message: "Internal server error",
          });
        } else {
          return res.status(200).json({
            code: 200,
            message: "OTP sent to email",
            data: otpdjson,
          });
        }
      } else {
        const response = sendWhatsapp(users, user.Name, otpcode);
        if (response instanceof Error) {
          return res.status(500).json({
            code: 500,
            message: "Internal server error",
          });
        } else {
          return res.status(200).json({
            code: 200,
            message: "OTP sent to whatsapp",
            data: otpdjson,
          });
        }
      }
    }
  } else {
    return res.status(404).json({
      code: 404,
      message: "Please register first",
    });
  }
});

module.exports = router;