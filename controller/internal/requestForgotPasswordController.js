const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");
const chalk = require("chalk");
const nodemailer = require("nodemailer");

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
const maindatabase = './db/user.json';
const forgotpassworddb = './db/forgot_password.json';
const config = './db/config.json';

function sendEmail(email, url) {
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
      subject: "Reset Password Natslock",
      html: `
      <head>
  <title>Reset Password</title>
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
                        Reset your password</td>
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
                        You're receiving this e-mail because you requested a password reset for your Natslock account.
                      </td>
                    </tr>
                    <tr>
                      <td
                        style="padding-top: 24px; -ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095a2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                        Please tap the button below to choose a new password.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <a data-click-track-id="37" href="${url}"
                          style="margin-top: 36px; -ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #ffffff; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 12px; font-smoothing: always; font-style: normal; font-weight: 600; letter-spacing: 0.7px; line-height: 48px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 220px; background-color: #29bdf3; border-radius: 28px; display: block; text-align: center; text-transform: uppercase"
                          target="_blank">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style="padding-top: 16px; padding-left: 10px; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #d64d58; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 12px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                        *Url expired in 1 hours.
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
                      <a href="https://natslock.site" style="text-decoration: none;">
                        <h1 style="color:#ffffff;"><strong>NATSLOCK</strong></h1>
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
                  If you didn't request this, you can ignore this email or let us know. Your password won't change until
                  you create a new password.<a< /a>
                </td>
              </tr>
              <tr>
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
        console.log(chalk.cyan(dateformat()), "Email sent: " + info.response + " to " + email + "ACtion : Request Reset Password");
        return info.response;
      }
    });
  }

router.post("/request/forgot-password", async (req, res) => {
    const { users } = req.body;

    if (
        users.toString().match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
      ) {
        var method = "Email";
        var userss = users;
      } else if (users.toString().match(/^[0-9]+$/) && users.length > 9) {
        var method = "Phone";
        var userss = users;
      } else if (users.toString().length === 20 && users.toString().match(/^[0-9]+$/)){
        var method = "UUID";
        var userss = parseInt(users);
      } else {
        var method = "Username";
        var userss = users;
      }

    const maindata = JSON.parse(fs.readFileSync(maindatabase, "utf-8"));
    const forgotpassword = JSON.parse(fs.readFileSync(forgotpassworddb, "utf-8"));

    //find user at maindata
    const finduser = maindata.find((user) => user[method] === userss);
    if (!finduser) {
        return res.status(400).json({ message: "User not found" });
    }

    //generate random code (6 digit)
    const code = Math.floor(100000 + Math.random() * 900000);
    const fixcode = code.toString();

    //find user at forgotpassword
    const findforgotpassword = forgotpassword.find((user) => user[method] === userss);

    //set expired time (1 hour)
    const expired = new Date();
    const expiredtime = expired.setHours(expired.getHours() + 1);

    //if user already exist in forgotpassword
    if (findforgotpassword) {
        //if user already on forgotpassword
        if (findforgotpassword.OnForgot === true) {
            return res.status(400).json({ message: "You just made a request, try again later" });
        }

        //update code
        findforgotpassword.EntryCode = fixcode;
        findforgotpassword.Expired_ms = expiredtime;
        findforgotpassword.Expired_ISO = new Date(expiredtime).toISOString();
        findforgotpassword.OnForgot = true;
    } else {
        //if user not exist in forgotpassword
        forgotpassword.push({
            "UUID": finduser.UUID,
            "Email": finduser.Email,
            "Phone": finduser.Phone,
            "Username": finduser.Username,
            "OnForgot": true,
            "EntryCode": fixcode,
            "Expired_ms": expiredtime,
            "Expired_ISO": new Date(expiredtime).toISOString(),
        });
    }

    const urlreset = `https://natslock.site/reset-password/${finduser.UUID}?token=${fixcode}`

    //write to forgotpassword
    fs.writeFileSync(forgotpassworddb, JSON.stringify(forgotpassword, null, 2));

    //send code to user
    sendEmail(finduser.Email, urlreset);

    return res.status(200).json({ message: "Reset has been sent to your email" });
});

module.exports = router;
