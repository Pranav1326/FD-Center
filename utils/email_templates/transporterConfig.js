exports.transporterConfig = () => {
    return {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL_ID,
            pass: process.env.GMAIL_KEYPASS,
        }
    }
}