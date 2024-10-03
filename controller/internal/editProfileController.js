const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const axios = require("axios");

async function downloadImage(url, image_path) {
  const writer = fs.createWriteStream(image_path);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

const pathimg = "./file/profile/";
const userdb = "./db/user.json";
const domain = "https://natslock.my.id/file/profile/";

router.post("/edit/profile", (req, res) => {
  const users = req.body;
  const url = users.url;

  if (!url) {
    return res.status(400).json({
        status: 400,
        message: "Please provide a url"
    })
}

  const userData = JSON.parse(fs.readFileSync(userdb, "utf8"));

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

  const userFind = userData.find((user) => user[metode] === userss);

    if(!userFind) {
        return res.status(404).json({
            status: 404,
            message: "User not found"
        })
    }

    // Download image
    const image_path = path.join(pathimg, `${userFind.uuid}.jpg`);
    downloadImage(url, image_path).then(() => {
        userFind.Picture == `${domain}${userFind.uuid}.jpg`;
        fs.writeFileSync(userdb, JSON.stringify(userData, null, 2), "utf8");
        res.status(200).json({
            status: 200,
            message: "Image downloaded successfully"
        })
    }).catch((err) => {
        res.status(500).json({
            status: 500,
            message: "Failed to download image"
        })
    })
});

module.exports = router;
