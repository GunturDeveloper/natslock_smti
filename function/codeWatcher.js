const fs = require("fs");

const jsonLocker = "./db/locker.json";

async function codeWatcher() {
  const jsonData = fs.readFileSync(jsonLocker, "utf8");
  const data = JSON.parse(jsonData);

  const currentTime = new Date().getTime();

  data.forEach((locker) => {
    if (locker.OnGoing.expired < currentTime) {
      //if null, it means safe
      if (locker.OnGoing.expired === null) {
        return;
      }
      locker.OnGoing.code = "";
      locker.OnGoing.stats = false
      locker.OnGoing.expired = null;
      fs.writeFileSync(jsonLocker, JSON.stringify(data, null, 2));
      console.log(`Code for ${locker.name} has expired`);
    }
  });
}

module.exports = codeWatcher;
