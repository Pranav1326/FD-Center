const dotenv = require('dotenv').config();

exports.testMail = (receiver) => {
    return {
        from: process.env.GMAIL_ID,
        to: receiver,
        subject: "Test mail from FD Center",
        html:
            `
                <p>Hello Pranav,</p>
                <p>This is a test email.</p>
                <p>Regards <br/>
                FD-Center</p>
            `
    }
};