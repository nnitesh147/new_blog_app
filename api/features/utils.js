import jwt from "jsonwebtoken";

const sendCookie = (user, res, message, statuscode = 200) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res.status(statuscode).cookie("token", token).json({
    success: true,
    message,
    user,
  });
};

export default sendCookie;
