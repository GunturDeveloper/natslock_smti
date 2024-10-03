const fs = require("fs");

const jsonLocker = "./db/locker.json";

async function openWatcher() {
  const jsonData = fs.readFileSync(jsonLocker, "utf8");
  const data = JSON.parse(jsonData);

  const currentTime = new Date().getTime();

  data.forEach((locker) => {
    if (locker.expiredOpen > currentTime) {
      //if null, it means safe
      if (locker.expiredOpen === null) {
        return;
      }
      locker.justOpen = false
      locker.expiredOpen = null;
      fs.writeFileSync(jsonLocker, JSON.stringify(data, null, 2));
      console.log(`Open ${locker.name} has expired`);
    }
  });
}

module.exports = openWatcher;
