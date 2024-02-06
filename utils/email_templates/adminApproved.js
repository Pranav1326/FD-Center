const dotenv = require('dotenv').config();

exports.adminApproved = (receiver, username, adminName) => {
    return {
        from: process.env.GMAIL_ID,
        to: receiver,
        subject: "Response for Admin Request in FD Center",
        html:
            `
                <div dir=3D"ltr">
                    <p>Hello <strong>${username},</strong></p>
                    <br>
                    <p>Congratulations! Your request to become an Admin at FD Center has been approved by the FD Center team. You now have access to the FD Center system.</p>
                    <p><strong>Admin Details:</strong></p>
                    <ul>
                        <li>Username: ${adminName}</li>
                        <li>Password: ${"Admin@fdcenter"}</li>
                    </ul>
                    <br/>
                    <p><i>Note: This is a system generated password please change it, otherwise the security of your account may be comprimised!</i></p>
                    <p>As an Admin, it is now your responsibility to manage interest rates and ensure a positive user experience for FD Center users.</p>
                    <br/>
                    <p>If you have any questions or concerns, please don't hesitate to reach out to fdcenter.mernstack@gmail.com.</p>
                    <br/>
                    <p>Regards</p>
                    <p>
                        <strong>Team FD-Center</strong>
                    </p>
                </div>
            `
    }
};