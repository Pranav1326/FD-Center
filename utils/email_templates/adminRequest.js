const dotenv = require('dotenv').config();

exports.adminRequest = (receiver, username) => {
    return {
        from: process.env.GMAIL_ID,
        to: receiver,
        subject: "Request generated for Admin in FD Center",
        html:
            `
                <div dir=3D"ltr">
                    <p>Hello <strong>${username},</strong></p>
                    <br>
                    <p>We hope this message finds you well. A request has been generated for the role of an Administrator in FD-Center under the username <strong>${username}</strong>. Our system administrator will review and take necessary action on your request shortly. You will be notified through email once the process is completed.</p>
                    <br/>
                    <p><i>Please note that the verification process may take 2-3 business days. We appreciate your patience. If the process extends beyond this timeframe, feel free to submit another request.</i></p>
                    <br/>
                    <p>Thank you for your understanding.</p>
                    <br>
                    <p>Regards</p>
                    <p>
                        <strong>Team FD-Center</strong>
                    </p>
                </div>
            `
    }
};