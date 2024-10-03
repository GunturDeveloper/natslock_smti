const fs = require("fs");

const jsonSystem = "./db/system.json";

async function onlinePowerWatcher() {
  const systemData = fs.readFileSync(jsonSystem, "utf8");
  const system = JSON.parse(systemData);

  const currentTime = new Date().getTime();
  const mainPower = system.Main_Power;

  //if 10 seconds has passed, update last online
  const duration = currentTime - mainPower.LastOnline;
  const timeagoDays = Math.floor(duration / (1000 * 60 * 60 * 24));
  const timeagoHours = Math.floor(
    (duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const timeagoMinutes = Math.floor(
    (duration % (1000 * 60 * 60)) / (1000 * 60)
  );
  const timeagoSeconds = Math.floor((duration % (1000 * 60)) / 1000);

  if (timeagoDays > 0) {
    var timeagoString = `${timeagoDays}day ago`;
  } else if (timeagoHours > 0) {
    var timeagoString = `${timeagoHours}hour ago`;
  } else if (timeagoMinutes > 0) {
    var timeagoString = `${timeagoMinutes}minute ago`;
  } else if (timeagoSeconds > 0) {
    var timeagoString = `${timeagoSeconds}second ago`;
  } else {
    var timeagoString = `just now`;
  }

  if (duration > 10000) {
    mainPower.isOnline = false;
    mainPower.LastOnlineAgo = timeagoString;
    fs.writeFileSync(jsonSystem, JSON.stringify(system, null, 2));
  } else {
    mainPower.isOnline = true;
    mainPower.LastOnlineAgo = timeagoString;
    fs.writeFileSync(jsonSystem, JSON.stringify(system, null, 2));
  }
}

module.exports = onlinePowerWatcher;
