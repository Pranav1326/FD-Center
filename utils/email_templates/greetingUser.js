const dotenv = require('dotenv').config();

exports.greetingUser = (receiver, username) => {
    return {
        from: process.env.GMAIL_ID,
        to: receiver,
        subject: "Greeting from FD Center",
        html:
            `
                <div dir=3D"ltr">
                    Hello <strong>${username},</strong>
                    <br>
                    <br>
                        Hope you are doing well, First of all congratulations for opening an account in FD-Center under the username of ${username}. Now you can get benefits of high returns on your investment.
                    <br>
                    <br>
                        We are happy to serve you!
                    <br>
                    <br>
                    <p>
                        <i>
                            <strong>Note:</strong>
                            This is a prototype website and does not involve any trancasction with real money. FD-Center does not responsible for any transaction that includes any real money. The money and transactions shown in this website are totally virtual. Also keep in mind that FD-Center will not take or save your any information of your credit-card. So you can enter any details for card section.
                        </i>
                    </p>
                    <br>
                    <br>
                    <strong>Happy Investing!</strong>
                    <br>
                    <br>
                    <p>Regards</p>
                    <p>
                        <strong>Team FD-Center</strong>
                    </p>
                </div>
            `
    }
};