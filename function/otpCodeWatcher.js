const fs = require("fs");
const chalk = require("chalk");

const jsonFile = "./db/otpstore.json";

async function otpCodeWatcher() {
    try {
        let jsonData = fs.readFileSync(jsonFile, "utf8");
        let data = JSON.parse(jsonData);

        const currentTime = new Date().getTime();

        for (let i = data.length - 1; i >= 0; i--) {
            const otpArray = data[i].Otp;

            for (let j = otpArray.length - 1; j >= 0; j--) {
                const expirationTime = otpArray[j].Expired;

                if (expirationTime <= currentTime) {
                    console.log(chalk.cyan(`OTP ${otpArray[j].Code} expired, user: ${data[i].Name}`));
                    otpArray.splice(j, 1);
                }
            }
        }

        // Simpan perubahan kembali ke file JSON
        fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(error);
    }
}

module.exports = otpCodeWatcher;
