const crypto = require("crypto");
const { isValidEmail } = require("../../helpers/utils");
const userSchema = require("../../models/userSchema");
const { mailSender } = require("../../helpers/mailService");

const successMessage = "If an account exists for this email, a reset link has been sent.";

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // -------- Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    // -------- Find User
    const user = await userSchema.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: successMessage,
      });
    }

    // -------- Generate Reset Token
    const resetToken = user.createPasswordResetToken();

    // -------- Save Token
    await user.save({ validateBeforeSave: false });

    // -------- Reset Link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // -------- Send Mail
    try {
      await mailSender({
        email: user.email,
        subject: "Password Reset Request",
        resetLink,
      });
    } catch (mailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save({ validateBeforeSave: false });

      console.error(mailError);

      return res.status(500).json({
        success: false,
        message: "Failed to send reset email",
      });
    }

    return res.status(200).json({ success: true, message: successMessage });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
module.exports = {
  forgotPassword,
};
