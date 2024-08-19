const nodemailer = require("nodemailer");
const models = require("../models/index");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const { where } = require("sequelize");

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "obadahesa881@gmail.com",
    pass: "obdb msqv ostb uyzw",
  },
});

exports.sendVerificationEmail = async (req, res, next) => {
  const { recipientEmail } = req.body;

  const code = generateCode();

  const mailOptions = {
    from: "obadahesa881@gmail.com",
    to: recipientEmail,
    subject: "Email Verification",
    text: `We hope this message finds you well. Thank you for registering with D.Signature. To complete your registration, please verify your email address by entering the verification code provided below:

Your Verification Code: ${code}

Please enter this code on the registration page to complete your account setup. If you did not create an account with D.Signature, please disregard this email.

For Your Security:
- Do not share your verification code with anyone.
- If you have any concerns about the security of your account, please contact our support team immediately.

Thank you for choosing D.Signature. We are excited to have you on board!

Best regards,
D.Signature`,
  };

  const sendMail = promisify(transport.sendMail).bind(transport);

  try {
    await sendMail(mailOptions, async (error, info) => {
      if (error) {
        // console.error("Error sending email:", error);
        // console.error("Response:", error.response);
        // console.error("Response Code:", error.responseCode);
        // console.error("Command:", error.command);
        // return res.status(500).json({ message: "Failed to send email" });
        throw new CustomError(error.message, 500);
      } else {
        var authorization = req.headers.authorization.split(" ")[1];
        var decoded;
        console.log(decoded);
        try {
          decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
        } catch (e) {
          // return res.status(401).send("Unauthorized");
          const err = new CustomError("Unauthorized", 401);
          next(err);
        }

        console.log("Email sent:", info.response);

        try {
          var userId = decoded.id;
          await models.EmailVerification.create({
            user_id: userId,
            verificationCode: code,
          });
          return res.json({ message: "Email sent successfully" });
        } catch (modelError) {
          // console.error("Error saving verification code:", modelError);
          // return res
          //   .status(500)
          //   .json({ message: "Failed to save verification code" });
          const error = new CustomError(
            "Failed to save verification code",
            500
          );
          next(error);
        }
      }
    });
  } catch (err) {
    // console.error("Unexpected error:", err);
    // return res.status(500).json({ message: "An unexpected error occurred" });
    next(err);
  }
};

exports.sendSigningEmail = async (senderEmail, recipientEmail, websiteUrl) => {
  // const { senderEmail, recipientEmail, websiteUrl } = req.body;

  try {
    for (let index = 0; index < recipientEmail.length; index++) {
      const mailOptions = {
        from: senderEmail,
        to: recipientEmail[index],
        subject: "Request Signing",
        text: `Dear ${recipientEmail[index]}, please review and complete the signing process of this document: ${websiteUrl}`,
      };

      transport.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error("Error sending email:", error);
          console.error("Response:", error.response);
          console.error("Response Code:", error.responseCode);
          console.error("Command:", error.command);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    }
    res.json({
      message: "email sent successfully",
    });
  } catch (err) {
    // res.status(400).json({ message: err });\
    console.log(err);

    // next(err);
  }
};

exports.verify = async (req, res, next) => {
  var authorization = req.headers.authorization.split(" ")[1];
  var decoded;
  console.log(decoded);
  try {
    decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
  } catch (e) {
    // return res.status(401).send("Unauthorized");
    const err = new CustomError("Unauthorized", 401);
  }
  const { verifyCode } = req.body;

  try {
    var userId = decoded.id;
    var code = await models.EmailVerification.findOne({
      where: { user_id: userId },
    });
    const currentTime = new Date();
    const diffTime =
      currentTime.getHours() * 60 +
      currentTime.getMinutes() -
      (new Date(code.createdAt).getHours() * 60 +
        new Date(code.createdAt).getMinutes());
    console.log(code.verificationCode);
    if (verifyCode === code.verificationCode && diffTime <= 30) {
      return res.json({
        message: "success verification",
        status: 200,
      });
    } else if (verifyCode === code.verificationCode && diffTime > 30) {
      await code.destroy();
      return res.json({
        message: "validity of the verification code expired",
        status: 422,
      });
    } else {
      return res.json({
        message: "wrong code input",
        status: 422,
      });
    }
  } catch (err) {
    next(err);
  }
};

// ----------------------------
exports.sendEmail = async (senderEmail, recipientEmail, message) => {
  try {
    const mailOptions = {
      from: senderEmail,
      to: recipientEmail,
      subject: "Request Signing",
      text: `Dear ${recipientEmail}, ${message}`,
    };

    transport.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Error sending email:", error);
        console.error("Response:", error.response);
        console.error("Response Code:", error.responseCode);
        console.error("Command:", error.command);
      } else {
        console.log("Email sent:", info.response);
      }
    });
    res.json({
      message: "email sent successfully",
    });
  } catch (err) {
    console.log(err);
  }
};
