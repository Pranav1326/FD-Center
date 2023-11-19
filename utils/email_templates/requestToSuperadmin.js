const dotenv = require('dotenv').config();

exports.requestToSuperadmin = (receiver, superadmin_username, admin_username, admin_email) => {
    return {
        from: process.env.GMAIL_ID,
        to: receiver,
        subject: "Request generated for Admin in FD Center",
        html:
            `
                <div dir=3D"ltr">
                    <p>Hello <strong>${superadmin_username},</strong></p>
                    <br>
                    <p>A request has been generated for an Admin role under following credentials</p>
                    <p>Username: <strong>${admin_username}</strong></p>
                    <p>Email: <strong>${admin_email}</strong></p>
                    <br>
                    <p>Kindly verify the request on portal.</p>
                    <br>
                    <p>Regards</p>
                    <p>
                        <strong>Team FD-Center</strong>
                    </p>
                </div>
            `
    }
};