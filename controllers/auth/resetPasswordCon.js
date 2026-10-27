const userSchema = require("../../models/userSchema");
const crypto = require("crypto");

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!password) {
      return res.status(400).send("Password is required");
    }

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).send("Invalid or expired reset link");
    }

    if (password.length < 6) {
      return res
        .status(400)
        .send("Password must be at least 6 characters long");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userSchema.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Invalid or expired reset link");
    }

    user.password = password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).send("Password reset successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};


module.exports = { resetPassword };
