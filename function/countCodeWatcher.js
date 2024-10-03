const fs = require("fs");

const jsonLocker = "./db/locker.json";

async function countCodeWatcher() {
    const jsonData = fs.readFileSync(jsonLocker, "utf8");
    const data = JSON.parse(jsonData);
  
    const currentTime = new Date().getTime();
  
    data.forEach((locker) => {
      if (locker.OnGoing.expired > currentTime) {
        //if null, it means safe
        if (locker.OnGoing.expired === null) {
        locker.OnGoing.timeLeft = "2:00";
        fs.writeFileSync(jsonLocker, JSON.stringify(data, null, 2));
          return;
        }
        
        //calculate time left
        const timeLeft = locker.OnGoing.expired - currentTime;
        let timeLeftInMinutes = Math.floor(timeLeft / 60000);
        let timeLeftInSecond = Math.floor((timeLeft % 60000) / 1000);

        //added padding 0
        if (timeLeftInSecond < 10) {
          timeLeftInSecond = `0${timeLeftInSecond}`;
        } else {
          timeLeftInSecond = `${timeLeftInSecond}`;
        }

        if (timeLeftInMinutes < 10) {
          timeLeftInMinutes = `0${timeLeftInMinutes}`;
        } else {
          timeLeftInMinutes = `${timeLeftInMinutes}`;
        }

        const timeLeftString = `${timeLeftInMinutes}:${timeLeftInSecond}`;

        locker.OnGoing.timeLeft = timeLeftString;

        fs.writeFileSync(jsonLocker, JSON.stringify(data, null, 2));
      }
    });
  }
  
  module.exports = countCodeWatcher;