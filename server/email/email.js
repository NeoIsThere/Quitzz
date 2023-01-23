const nodemailer = require("nodemailer");
const { ADMIN_EMAIL } = require("../constants");
const { motivationMessageSubmission } = require("../database/models");
const { log } = require("../utils/logger");

const transporter = nodemailer.createTransport({
  host: "smtp.mail.yahoo.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: `${ADMIN_EMAIL}`,
    pass: process.env.YAHOO_APPLICATION_PSWD,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

function sendPasswordResetLink(link, username, toAddress) {
  const emailHtml = `<!DOCTYPE html><html lang='en-US'> <head> <meta content='text/html; charset=utf-8' http-equiv='Content-Type' /> <title>Reset Password Email Template</title> <meta name='description' content='Reset Password Email Template.' /> <style type='text/css'> a:hover { text-decoration: underline !important; } </style> </head> <body marginheight='0' topmargin='0' marginwidth='0' style='margin: 0px; background-color: #f2f3f8' leftmargin='0'> <!--100% body table--> <table cellspacing='0' border='0' cellpadding='0' width='100%' bgcolor='#f2f3f8' style=' @import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif; ' > <tr> <td> <table style='background-color: #f2f3f8; max-width: 670px; margin: 0 auto' width='100%' border='0' align='center' cellpadding='0' cellspacing='0' > <tr> <td style='height: 80px'>&nbsp;</td> </tr> <tr> <td style='text-align: center; background-color: #0d47a1'> <img src="https://quitzz-group.gitlab.io/quitzz/logo.png" width='120' title='logo' alt='logo' /> </td> </tr> <tr> <td style='height: 20px; background-color: #0d47a1'>&nbsp;</td> </tr> <tr> <td> <table width='100%' border='0' align='center' cellpadding='0' cellspacing='0' style=' max-width: 670px; background: #fff; border-radius: 3px; text-align: center; -webkit-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06); -moz-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06); box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06); ' > <tr> <td style='height: 40px'>&nbsp;</td> </tr> <tr> <td style='padding: 0 35px'> <h1 style=' color: #1e1e2d; font-weight: 500; margin: 0; font-size: 32px; font-family: 'Rubik', sans-serif; ' > Password reset </h1> <span style=' display: inline-block; vertical-align: middle; margin: 29px 0 26px; border-bottom: 1px solid #cecece; width: 100px; ' ></span> <p style='color: #455056; font-size: 15px; line-height: 24px; margin: 0'> Hello, we have received a request to reset the password of the account ${username}. </p> <a href='${link}' style=' background-color: #0d47a1; text-decoration: none !important; font-weight: 500; margin-top: 35px; color: #fff; text-transform: uppercase; font-size: 14px; padding: 10px 24px; display: inline-block; border-radius: 50px; ' >Reset Password</a > </td> </tr> <tr> <td style='height: 40px'>&nbsp;</td> </tr> </table> </td> </tr> <tr> <td style='height: 20px'>&nbsp;</td> </tr> <tr> <td style='text-align: center'> <p style='font-size: 14px; color: rgba(69, 80, 86, 0.7411764705882353); line-height: 18px; margin: 0 0 0' > &copy; <strong>2023 Quitzz <a href='www.quitzz.com'> www.quitzz.com</a></strong> </p> </td> </tr> <tr> <td style='height: 80px'>&nbsp;</td> </tr> </table> </td> </tr> </table> <!--/100% body table--> </body></html>`;
  let mailOptions = {
    from: `Quitzz app <${ADMIN_EMAIL}>`,
    to: toAddress,
    subject: "Quitzz: Password reset link",
    html: emailHtml,
  };

  log("sending mail");
  return transporter.sendMail(mailOptions);
}

function sendDBBackup(users, motivationMessages, motivationMessageSubmissions, nUsersWhoCommittedToday) {
  const usersStr = JSON.stringify(users);
  const motivationMessagesStr = JSON.stringify(motivationMessages);
  const motivationMessageSubmissionsStr = JSON.stringify(motivationMessageSubmissions);

  const emailHtml = `<p>Here is your daily backup. </p> <p> ${nUsersWhoCommittedToday} have committed today. </p>`;
  let mailOptions = {
    from: `Quitzz app <${ADMIN_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: "Quitzz: daily backup",
    html: emailHtml,
    attachments: [
      {
        filename: "users.json",
        content: usersStr,
      },
      {
        filename: "motivationMessages.json",
        content: motivationMessagesStr,
      },
      {
        filename: "motivationMessageSubmissions.json",
        content: motivationMessageSubmissionsStr,
      },
    ],
  };

  return transporter.sendMail(mailOptions);
}

function sendFeedback(sender, feedback) {
  const emailHtml = `<p>User ${sender} has submitted a feedback. </p> <br> <p>"${feedback}"</p> `;
  let mailOptions = {
    from: `Quitzz app <${ADMIN_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `Quitzz: new feedback from ${sender} `,
    html: emailHtml,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendPasswordResetLink,
  sendDBBackup,
  sendFeedback,
};
