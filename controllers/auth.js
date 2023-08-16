const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { v4: uuidv4 } = require('uuid');
const nodemailer = require("nodemailer");

const { User, schemas } = require("../models/user");

const { HttpErrors } = require("../helpers");

const avatarDir = path.join(__dirname, "../", "public", "avatars");

const { SECRET_KEY } = process.env;
const { GMAIL_PASSWORD } = process.env;

const getAddUser = async (req, res, next) => {
  try {
    const { email, password } = schemas.registerSchema.validate(req.body).value;

    const user = await User.findOne({ email });
    if (user) {
      throw HttpErrors(409, "Email already in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);

    const verificationToken = uuidv4();

    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });

    const verificationLink = `http://localhost:3000/api/auth/verify/${verificationToken}`;
    const mailOptions = {
      from: "sebastianmars78@gmail.com",
      to: email,
      subject: "Email Verification",
      text: `Please click on the following link to verify your email: ${verificationLink}`,
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: "sebastianmars78@gmail.com",
        pass: GMAIL_PASSWORD,
      },
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json({
      email: newUser.email,
      subscription: newUser.subscription,
    });
  } catch (error) {
    next(error);
  }
};

const getLogin = async (req, res, next) => {
  try {
    const { email, password } = schemas.loginSchema.validate(req.body).value;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpErrors(401, "Email or password is wrong");
    }
    const passCompare = await bcrypt.compare(password, user.password);
    if (!passCompare) {
      throw HttpErrors(401, "Email or password is wrong");
    }

    if (!user.verify) {
      throw HttpErrors(403, "Email is not verified");
    }

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });

    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res, next) => {
  try {
    if (!req.user) {
      throw HttpErrors(401, "Not authorized");
    }

    const { email, subscription } = req.user;

    res.status(200).json({
      email,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;

    const user = await User.findByIdAndUpdate(_id, { token: "" });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarDir, filename);
  await fs.rename(tempUpload, resultUpload);
  const image = await Jimp.read(resultUpload);
  await image.resize(250, 250).writeAsync(resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const user = await User.findOne({ verificationToken });

    if (!user) {
      throw HttpErrors(404, "User not found");
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: "",
    });

    res.status(200).json({
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
};

const resendVerifyEmail = async (req, res) => {
  try {
    const { email } = schemas.emailSchema.validate(req.body).value;

    const user = await User.findOne({ email });

    if(!user) {
      throw HttpErrors(401, "Email already verify");
    }

    if (user.verify) {
      throw HttpErrors(400, "Verification has already been passed");
    }

    const verificationLink = `http://localhost:3000/api/auth/verify/${user.verificationToken}`;
    const mailOptions = {
      from: "sebastianmars78@gmail.com",
      to: email,
      subject: "Email Verification",
      text: `Please click on the following link to verify your email: ${verificationLink}`,
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: "sebastianmars78@gmail.com",
        pass: GMAIL_PASSWORD,
      },
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(200).json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
};

const ctrl = {
  getAddUser,
  getLogin,
  getCurrent,
  logout,
  updateAvatar,
  verifyEmail,
  resendVerifyEmail,
};

module.exports = ctrl;
