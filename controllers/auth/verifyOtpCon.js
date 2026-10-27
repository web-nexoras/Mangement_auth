const userSchema = require("../../models/userSchema");

// ----------veriFy Otp controller
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userSchema.findOne({
      email: typeof email === "string" ? email.trim().toLowerCase() : email,
      otp: typeof otp === "string" ? otp : String(otp || ""),
      otpExpires: { $gt: Date.now() },
      isVerified: false,
    });
    if (!user) return res.status(400).send("Invalid OTP or User not found");
    // -------after validations
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    user.otpverify = true;
    // ----------data abse save data
    await user.save();

    res.status(200).send("OTP verified successfully");
  } catch (error) {
    res.status(500).send(`Server error: ${error.message}`);
  }
};

module.exports = {
  verifyOtp,
};
