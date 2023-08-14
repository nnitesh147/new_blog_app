import jwt from "jsonwebtoken";

const sendCookie = (user, res, message, statuscode = 200) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res
    .status(statuscode)
    .cookie("token", token, {
      // httpOnly: true,
      // sameSite: process.env.NODE_ENV === "DEVELOPMENT" ? "lax" : "none",
      // secure: process.env.NODE_ENV === "DEVELOPMENT" ? false : true,
    })
    .json({
      success: true,
      message,
      user,
    });
};

export default sendCookie;
