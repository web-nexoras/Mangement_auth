const userSchema = require("../../models/userSchema");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../helpers/utils");

// Cookie Configuration
const cookieConfig = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
// ---------------- Signin Controller ----------------
const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate Input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    // Find User
    const user = await userSchema.findOne({ email: email.trim().toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check Email Verification
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    // Check Admin Approval
    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your account is waiting for admin approval",
      });
    }

    // Compare Password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Send Cookies
    return res
      .status(200)
      .cookie("accTkn", accessToken, cookieConfig)
      .cookie("refTkn", refreshToken, cookieConfig)
      .json({
        success: true,
        message: "Signin successful",
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  signin,
};
