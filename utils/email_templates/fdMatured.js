const dotenv = require('dotenv').config();

exports.fdMatured = (receiver, username) => {
    return {
        from: process.env.GMAIL_ID,
        to: receiver,
        subject: "Fixed Deposit Maturity Notification from FD Center",
        html:
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Fixed Deposit Maturity Notification from FD-Center</h2>
                <p>Hello ${username}</p>
                <p>Congratulations!</p>
                <p>We are pleased to inform you that your fixed deposit in FD-Center has matured.</p>
                <p>Please log in to your account to view the details and proceed with the maturity process.</p>
                <p>The FD's maturity amount will be reflected in your account's wallet. You can withdraw or remake an fixed deposit from that amount.</p>
                <p>If you have any questions or need further assistance, feel free to contact our support team.</p>
                <p>Thank you for choosing FD-Center for your financial needs.</p>
                <p>
                    <i>
                        <strong>Note:</strong>
                        FD-Center is a prototype website and does not involve any trancasction with real money. FD-Center will not responsible for any transaction that include any real money. The money and transactions shown in this website are totally virtual. Also keep in mind that FD-Center does not take or save your any information of your credit-card. So you can enter any details for card section.
                    </i>
                </p>
                <p>Best regards,</p>
                <p>The FD-Center Team</p>
            </div>
            `
    }
};