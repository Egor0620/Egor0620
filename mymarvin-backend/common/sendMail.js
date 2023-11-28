const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (to, subject, text, html) => {
  const msg = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    text,
    html,
  };

  sgMail
    .send(msg)
    .then((response) => {
      console.log(response);
      console.log(response[0].headers);
      console.log(response[0].statusCode);
    })
    .catch((error) => {
      console.error("error: ", error);
    });
};

module.exports = sendMail;
