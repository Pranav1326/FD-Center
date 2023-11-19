const dotenv = require('dotenv').config();

exports.userOtp = (receiver, username, otp) => {
    return {
        from: process.env.GMAIL_ID,
        to: receiver,
        subject: "OTP for Registration in FD Center",
        html:
            `
                <p>Hello ${username},</p>
                <br/>
                <p>This is your one time password(otp) <strong>${otp}</strong></p>
                <p>Please do not share this otp to anyone.</p>
                <br/>
                Regards 
                <br/>
                <strong>FD-Center</strong>
            `
    }
};