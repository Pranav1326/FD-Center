const dotenv = require('dotenv').config();

exports.adminDisabled = (receiver, username) => {
    return {
        from: process.env.GMAIL_ID,
        to: receiver,
        subject: "Response for Admin Request in FD Center",
        html:
            `
                <div dir=3D"ltr">
                    <p>Hello <strong>${username},</strong></p>
                    <br>
                    <p>This is to inform you that you account in FD Center as an Admin has been Disabled by Superadmin.</p>
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