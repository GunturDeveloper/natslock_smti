const fs = require("fs");

const jsonUser = "./db/user.json";

async function sessionWatcher() {
  try {
    const jsonData = fs.readFileSync(jsonUser, "utf8");
    const data = JSON.parse(jsonData);

    const currentTime = new Date().getTime();

    data.forEach((user) => {
      if(user.Expired_Session === null) return;
        if (user.Expired_Session < currentTime) {
            user.sessionId = "";
            user.Expired_Session = null;
            fs.writeFileSync(jsonUser, JSON.stringify(data, null, 2));
            console.log(`Session for ${user.Username} has expired`)
        }
    });
  } catch (error) {
    console.error(error);
  }
}

module.exports = sessionWatcher;
