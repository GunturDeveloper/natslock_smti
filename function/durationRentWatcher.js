const fs = require("fs");

const jsonLocker = "./db/locker.json";

async function durationRentWatcher() {
    const jsonData = fs.readFileSync(jsonLocker, "utf8");
    const data = JSON.parse(jsonData);
  
    const currentTime = new Date().getTime();
  
    data.forEach((locker) => {
      if (locker.state === false) {
        //calculate duration
        const duration = currentTime - locker.OnGoing.rentTime;
        const durationMonth = Math.floor(duration / (1000 * 60 * 60 * 24 * 30));
        const durationDay = Math.floor((duration % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const durationHour = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const durationMinute = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        const durationSecond = Math.floor((duration % (1000 * 60)) / 1000);

        if(durationMonth > 0) {
          var durationString = `${durationMonth}month ${durationDay}d`;
        } else if(durationDay > 0) {
          var durationString = `${durationDay}d ${durationHour}h`;
        } else if(durationHour > 0) {
          var durationString = `${durationHour}h ${durationMinute}min`;
        } else if(durationMinute > 0) {
          var durationString = `${durationMinute}min ${durationSecond}s`;
        } else {
          var durationString = `${durationSecond}s`;
        }

        var durationString2 = `${durationMonth}month ${durationDay}d ${durationHour}h ${durationMinute}min ${durationSecond}s`;

        locker.OnGoing.duration = durationString;
        locker.OnGoing.duration_String = durationString2;
        locker.OnGoing.duration_Millis = duration;

        fs.writeFileSync(jsonLocker, JSON.stringify(data, null, 2));
      }
    });
  }
  
  module.exports = durationRentWatcher;