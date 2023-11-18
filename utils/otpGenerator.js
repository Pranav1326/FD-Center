const generateOtp = () => {
    otptemp = Math.floor(Math.random() * 1000000);
    if (otptemp.toString().length < 6) {
        generateOtp();
    }
    return otptemp;
}

module.exports = generateOtp;