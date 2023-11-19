const dotenv = require('dotenv').config();

exports.adminRejected = (receiver, username) => {
    return {
        from: process.env.GMAIL_ID,
        to: receiver,
        subject: "Response for Admin Request in FD Center",
        html:
            `
                <div dir=3D"ltr">
                    <p>Hello <strong>${username},</strong></p>
                    <br>
                    <p>We regret to inform you that your request to become an Admin at FD Center has been rejected by the FD Center team.</p>
                        <br/>
                        <p>If you have any questions or concerns regarding the rejection, please feel free to reach out to fdcenter.mernstack@gmail.com.</p>
                    <br/>
                    <p>Regards</p>
                    <p>
                        <strong>Team FD-Center</strong>
                    </p>
                </div>
            `
    }
};