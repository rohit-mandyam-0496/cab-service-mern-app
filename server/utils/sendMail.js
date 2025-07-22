const nodemailer = require("nodemailer");
const { stringUpperCase } = require("./common");
const dotEnv = require("dotenv");
dotEnv.config();

const user_email = process.env.FROM_EMAIL;
const user_password = process.env.FROM_EMAIL_PASSWORD;
const otp_TTL = parseInt(process.env.OTP_TTL);
const mainEmailHeader = process.env.MAIN_EMAIL_HEADER;

// console.log(user_email, typeof user_email);
// console.log(user_password, typeof user_password);
// console.log(otp_TTL, typeof otp_TTL);
// console.log(mainEmailHeader, typeof mainEmailHeader);

const transporter = nodemailer.createTransport({
  service: "gmail", // Change to your email provider
  auth: {
    user: user_email, // Your email
    pass: user_password, // App-specific password
  },
});

const OTP_mail_data = async (role, name, title, otp) => {
  try {
    const data = {
      subject: `${mainEmailHeader} - OTP Verification for ${title}.`,
      content: `Dear ${role} - ${name}, \n\nYour OTP code to verify your ${title} is ${otp}. \n\nIt will expire in ${stringUpperCase(
        otp_TTL
      )} minutes.\n\nPlease do not share this OTP with anyone.\n\nIf not initiated by you, contact us.\n\nThank you.\n\nRegards,\nCab Booking Customer Support Team.`,
    };
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const cust_booking_mail_data = async (name, bookingId) => {
  try {
    const data = {
      subject: `${mainEmailHeader} - Booking Confirmation`,
      content: `Dear ${name}, \n\nYour booking has been confirmed. \n\nYour booking ID is ${stringUpperCase(
        bookingId
      )}. \n\nPlease check your dashboard for more details.\n\nThank you.\n\nRegards,\nCab Booking Customer Support Team.`,
    };
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const adm_booking_mail_data = async (
  customerName,
  adminName,
  bookingId,
  customerId
) => {
  try {
    const data = {
      subject: `${mainEmailHeader} - Booking Done by Customer - ${stringUpperCase(
        customerId
      )}`,
      content: `Dear ${adminName}, \n\nA new booking has been done by ${customerName}, with booking ID ${stringUpperCase(
        bookingId
      )}. \n\nA driver must be assigned to this booking. \n\nPlease check your dashboard for more details.\n\nRegards,\nCab Booking Customer Support Team.`,
    };
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const sendEmail = async (toEmail, subject, content) => {
  try {
    const mailOptions = {
      from: user_email,
      to: toEmail,
      subject: subject,
      text: content,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error sending email: ", error);
    throw new Error(error);
  }
};

module.exports = {
  sendEmail,
  OTP_mail_data,
  cust_booking_mail_data,
  adm_booking_mail_data,
};
