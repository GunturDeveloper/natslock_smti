const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");
const nodemailer = require("nodemailer");
const chalk = require("chalk");

//define date with format hours:minutes:seconds dd/mm/yyyy
function dateformat() {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `[${hours}:${minutes}:${seconds} ${day}/${month}/${year}]`;
}

//database path
const maindatabase = './db/maindata.json';
const forgotpassworddb = './db/forgot_password.json';
const config = './db/config.json';

function sendEmail(email, url, maps) {
    const gethost = JSON.parse(fs.readFileSync(config));
    const { isProduction } = gethost.EmailOTP;
    const { service, user, pass } = isProduction
      ? gethost.EmailOTP.ProductionEmail
      : gethost.EmailOTP.LocalEmail;
  
    const { port, secure } = gethost.EmailOTP.ProductionEmail;
    if (isProduction) {
      var transporter = nodemailer.createTransport({
        host: service,
        port: port,
        secure: secure, // true for port 465, false for other ports
        auth: {
          user: user,
          pass: pass,
        },
      });
    } else {
      var transporter = nodemailer.createTransport({
        service: service,
        auth: {
          user: user,
          pass: pass,
        },
      });
    }
  
    var mailOptions = {
      from: user,
      to: email,
      subject: "Reset Password Chemicfest#8",
      html: `
      <head>
  <title>Your Account Has Ben Reset</title>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
  <meta content="width=device-width" name="viewport">
  <style type="text/css">
    @font-face {
      font-family: &#x27;
      Postmates Std&#x27;
      ;
      font-weight: 600;
      font-style: normal;
      src: local(&#x27; Postmates Std Bold&#x27; ), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-bold.woff) format(&#x27; woff&#x27; );
    }

    @font-face {
      font-family: &#x27;
      Postmates Std&#x27;
      ;
      font-weight: 500;
      font-style: normal;
      src: local(&#x27; Postmates Std Medium&#x27; ), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-medium.woff) format(&#x27; woff&#x27; );
    }

    @font-face {
      font-family: &#x27;
      Postmates Std&#x27;
      ;
      font-weight: 400;
      font-style: normal;
      src: local(&#x27; Postmates Std Regular&#x27; ), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-regular.woff) format(&#x27; woff&#x27; );
    }
  </style>
  <style media="screen and (max-width: 680px)">
    @media screen and (max-width: 680px) {
      .page-center {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }

      .footer-center {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
    }
  </style>
</head>

<body style="background-color: #f4f4f5;">
  <table cellpadding="0" cellspacing="0"
    style="width: 100%; height: 100%; background-color: #f4f4f5; text-align: center;">
    <tbody>
      <tr>
        <td style="text-align: center;">
          <table align="center" cellpadding="0" cellspacing="0" id="body"
            style="background-color: #fff; width: 100%; max-width: 680px; height: 100%;">
            <tbody>
              <tr>
                <td>
                  <table align="center" cellpadding="0" cellspacing="0" class="page-center"
                    style="text-align: left; padding-bottom: 88px; width: 100%; padding-left: 120px; padding-right: 120px;">
                    <!-- <tbody><tr>
    <td style="padding-top: 24px;">
    <img src="https://chemicfest.site/file/assets/text-logo.png" style="width: 192px; height: 48px;">
    </td>
    </tr> -->
                    <tr>
                      <td colspan="2"
                        style="padding-top: 72px; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #000000; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 48px; font-smoothing: always; font-style: normal; font-weight: 600; letter-spacing: -2.6px; line-height: 52px; mso-line-height-rule: exactly; text-decoration: none;">
                        Your Password has been Reset</td>
                    </tr>
                    <tr>
                      <td style="padding-top: 48px; padding-bottom: 48px;">
                        <table cellpadding="0" cellspacing="0" style="width: 100%">
                          <tbody>
                            <tr>
                              <td
                                style="width: 100%; height: 1px; max-height: 1px; background-color: #d9dbe0; opacity: 0.81">
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095a2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                        You're receiving this e-mail because you make a password reset for your Chemicfest account.
                      </td>
                    </tr>
                    <tr>
                      <td
                        style="padding-top: 24px; -ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095a2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                        This is location of request has been made.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <a href="${url}" target="_blank">
                          <img src="${maps}" width="300px" height="200px" style="border:0;" alt="Map Image">
                        </a>
                      </td>
                    </tr>                                
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  <table align="center" cellpadding="0" cellspacing="0" id="footer"
    style="background-color: #1E2124; width: 100%; max-width: 680px; height: 100%;">
    <tbody>
      <tr>
        <td>
          <table align="center" cellpadding="0" cellspacing="0" class="footer-center"
            style="text-align: left; width: 100%; padding-left: 120px; padding-right: 120px;">
            <tbody>
              <tr>
                <td colspan="2" style="padding-top: 72px; padding-bottom: 24px; width: 100%;">
                  <a href="https://chemicfest.com">
                    <img src="https://chemicfest.site/file/assets/text-logo.png" style="width: 196px; height: 48px">
                  </a>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 24px; padding-bottom: 48px;">
                  <table cellpadding="0" cellspacing="0" style="width: 100%">
                    <tbody>
                      <tr>
                        <td style="width: 100%; height: 1px; max-height: 1px; background-color: #EAECF2; opacity: 0.19">
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td
                  style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095A2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 15px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: 0; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                  Manage by <a href="https://instagram.com/chemicevents" style="color: #9095A2; text-decoration: none;" target="_blank">OSIS SMK SMTI YOGYAKARTA</a>
                </td>
              </tr>
              <tr>
                <td style="-ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095A2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 15px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: 0; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                  &copy; <strong>Chemicfest</strong> 2024 | All Rights Reserved | <a href="https://chemicfest.com" style="color: #9095A2; text-decoration: none;" target="_blank">Chemicfest.com</a>
                </td>
              </tr>              
                <td style="height: 72px;"></td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
</body>
          `,
    };
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(chalk.cyan(dateformat()), error);
        return error;
      } else {
        console.log(chalk.cyan(dateformat()), "Email sent: " + info.response, "to", email, "Action : Verify Reset Password");
        return info.response;
      }
    });
  }

async function getipinfo(ip) {
    try {
      const response = await axios.get(`http://ipinfo.io/${ip}/json`);
      const data = response.data;
  
      return data;
    } catch (error) {
      console.log(error);
      return "error";
    }
  }

router.post("/verify/forgot-password", async (req, res) => {
    const uuid = parseInt(req.body.uuid);
    const token = req.body.token;
    const ipuser = req.ip;

    const forgotpassworddata = JSON.parse(fs.readFileSync(forgotpassworddb));
    const maindatabasedata = JSON.parse(fs.readFileSync(maindatabase));

    const user = forgotpassworddata.find((user) => user.UUID === uuid);

    if (!user) {
        return res.status(400).json({ code: 400, result: false, message: "Invalid User" });
    }

    //check expiry
    const expiredms = user.Expired_ms;
    const currentms = new Date().getTime();

    if(expiredms === null){
        return res.status(400).json({ code: 400, result: false, message: "Token Not Found" });
    }

    if (expiredms < currentms) {
        return res.status(400).json({ code: 400, result: false, message: "Expired Token" });
    }

    if(user.OnForgot !== true){
        return res.status(400).json({ code: 400, result: false, message: "User Not On Forgot Password" });
    }

    if (user.EntryCode !== token) {
        return res.status(400).json({ code: 400, result: false, message: "Invalid Token" });
    }

    //check if user is in main database
    const mainuser = maindatabasedata.find((user) => user.UUID === uuid);

    if (!mainuser) {
        return res.status(400).json({ code: 400, result: false, message: "Invalid User" });
    }

    return res.status(200).json({ code: 200, result: true, message: "Credential Avaliable" });
});

router.post("/change/forgot-password", async (req, res) => {
    const uuid = parseInt(req.body.uuid);
    const token = req.body.token;
    const ipuser = req.ip;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;

    const forgotpassworddata = JSON.parse(fs.readFileSync(forgotpassworddb));
    const maindatabasedata = JSON.parse(fs.readFileSync(maindatabase));

    //get ip
    const ipinfo = await getipinfo(ipuser);
    const location = ipinfo.loc;
    const urllocation = `https://chemicfest.site/api/dev/embed-map/capture?query=${location}`
    const gmaps = `https://www.google.com/maps?q=${location}`

    const getimage = await axios.get(urllocation);
    const maps = getimage.data.url;

    const user = forgotpassworddata.find((user) => user.UUID === uuid);

    if (!user) {
        return res.status(400).json({ code: 400, result: false, message: "Invalid User" });
    }

    if(user.OnForgot !== true){
        return res.status(400).json({ code: 400, result: false, message: "User Not On Forgot Password" });
    }

    if(user.EntryCode !== token){
        return res.status(400).json({ code: 400, result: false, message: "Invalid Token" });
    }

    //find user in main database
    const mainuser = maindatabasedata.find((user) => user.UUID === uuid);

    if (!mainuser) {
        return res.status(400).json({ code: 400, result: false, message: "Invalid User" });
    }

    //cek panjang password dan kelenngkapan karakter
    if (password.length < 8) {
        return res
          .status(426)
          .json({ code: 426, message: "Password must be at least 8 characters" });
      }

      if (!password.match(/[a-z]/g)) {
        return res.status(427).json({
          code: 427,
          message: "Password must contain at least one lowercase letter",
        });
      }

      if (!password.match(/[A-Z]/g)) {
        return res.status(428).json({
          code: 428,
          message: "Password must contain at least one uppercase letter",
        });
      }

      if (!password.match(/[0-9]/g)) {
        return res.status(429).json({
          code: 429,
          message: "Password must contain at least one number",
        });
      }

    if(password !== confirmpassword){
        return res.status(400).json({ code: 430, result: false, message: "Confirm Password Not Match" });
    }

    //change password
    mainuser.Password = password;

    //change forgot password status
    user.OnForgot = false;

    //save to database
    fs.writeFileSync(maindatabase, JSON.stringify(maindatabasedata, null, 4));
    fs.writeFileSync(forgotpassworddb, JSON.stringify(forgotpassworddata, null, 4));
    
    //send email
    sendEmail(mainuser.Email, gmaps, maps);

    return res.status(200).json({ code: 200, result: true, message: "Password Changed" });
});

module.exports = router;

