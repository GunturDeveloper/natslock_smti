const fs = require("fs");
const path = require("path");

const jsonLocker = "./db/locker.json";

async function checkCountdown() {
  const jsonData = fs.readFileSync(jsonLocker, "utf8");
  const lockers = JSON.parse(jsonData);

  const currentTime = new Date().getTime();

  lockers.forEach((locker) => {
    console.log(
      `Checking locker: ${locker.name}, justOpen: ${locker.justOpen}, expiredOpen: ${locker.expiredOpen}, currentTime: ${currentTime}`
    );

    // Cek apakah locker dalam keadaan terbuka dan apakah expiredOpen telah lewat
    if (
      locker.justOpen === true &&
      locker.expiredOpen &&
      locker.expiredOpen < currentTime
    ) {
      console.log(`Closing locker: ${locker.name} as countdown expired.`);

      // Tutup locker otomatis jika countdown sudah habis
      locker.justOpen = false; // Locker ditutup
      locker.expiredOpen = null; // Reset expiredOpen
      locker.codeOpen = 0; // Reset codeOpen jika diperlukan
      locker.countdownClose = null;
      console.log(`Locker ${locker.name} is now closed.`);
    } else {
      console.log(
        `Locker ${locker.name} is still open or countdown not expired yet.`
      );
    }
  });

  // Simpan kembali data locker ke file setelah dilakukan update
  fs.writeFileSync(jsonLocker, JSON.stringify(lockers, null, 2));
}

// Schedule the checkCountdown function to run periodically (e.g., every 1 second)
setInterval(checkCountdown, 1000);

module.exports = checkCountdown;
