const nodemailer = require("nodemailer");
const logger = require("../../config/logger");

module.exports = async ({ email }) => {
  try {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await transporter.sendMail({
      from: `"abc123" <${testAccount.user}>`,
      to: `${email}`,
      subject: "Hello ✔",
      text: "Hello user",
      html: `<b>Email verified</b>`
    });

    logger.debug(`Message sent: ${info.messageId}`);
    logger.debug(`Preview URL:: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    logger.error(error);
  }
};
