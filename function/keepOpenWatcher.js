const fs = require("fs");

const jsonLocker = "./db/locker.json";
const jsonSystem = "./db/system.json";

async function keepOpenWatcher() {
    const jsonData = fs.readFileSync(jsonLocker, "utf8");
    const systemData = fs.readFileSync(jsonSystem, "utf8");
    const data = JSON.parse(jsonData);
  
    data.forEach((locker) => {
      if (locker.codeOpen > 0) {
        if(locker.sensOpen === true){
          locker.codeOpen = 0;
          locker.justOpen = false;
        } else {
          //write open in system
          const system = JSON.parse(systemData);
          const findLocker = system.Locker.find((systemLocker) => systemLocker.UUID === locker.uuid);
          findLocker.isOpen = true; //change to true

          //save to db
          fs.writeFileSync(jsonSystem, JSON.stringify(system, null, 2));
        }
        fs.writeFileSync(jsonLocker, JSON.stringify(data, null, 2));
      }
    });
  }
  
  module.exports = keepOpenWatcher;