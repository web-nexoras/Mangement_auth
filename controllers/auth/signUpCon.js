const userSchema = require("../../models/userSchema");
const { mailSender } = require("../../helpers/mailService");
const { generateOTP, isValidEmail } = require("../../helpers/utils");

// -----------signUp Controler
const signup = async (req, res) => {
  const { fullname, email, password, role } = req.body;
  try {
    if (!fullname) return res.status(400).send("Fullname is required");
    if (!email) return res.status(400).send("Email is required");
    if (!isValidEmail(email)) return res.status(400).send("Invalid email");
    if (!password || password.length < 6)
      return res
        .status(400)
        .send("Password is required and must be at least 6 characters long");

    if (!role || !["student", "teacher"].includes(role)) {
      return res.status(400).send("Role must be student or teacher");
    }
    const normalizedEmail = email.trim().toLowerCase();

    // --------existing user
    const existingUser = await userSchema.findOne({ email: normalizedEmail });
    if (existingUser)
      return res.status(400).send("User with this email already exists");

    // --------------otp generate
    const otp = generateOTP();

    // ----------data base save
    const user = await userSchema.create({
      fullname,
      email: normalizedEmail,
      password,
      role,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
      isApproved: role === "admin"
    });

    // ---------send otp to user mail
    try {
      await mailSender({
        email: normalizedEmail,
        subject: "OTP Verification",
        otp,
      });
    } catch (mailError) {
      console.error("Signup OTP Mail Error:", mailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }

    res.status(201).send("SignUp Successfully");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server error");
  }
};

module.exports = {
  signup,
};
