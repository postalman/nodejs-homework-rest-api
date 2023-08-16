const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp")

const { User, schemas } = require("../models/user");

const { HttpErrors } = require("../helpers");

const avatarDir = path.join(__dirname, "../", "public", "avatars")

const {SECRET_KEY} = process.env;
const getAddUser = async (req, res, next) => {
  try {
    const { email, password } = schemas.registerSchema.validate(req.body).value;

    if (!email) {
      res.status(400).json({ message: "missing required field" });
      return;
    }

    const user = await User.findOne({ email });
    if (user) {
      throw HttpErrors(409, "Email alredy in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);

    const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL });

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

const updateAvatar = async(req, res) => {
  const {_id} = req.user;
  const {path: tempUpload, originalname} = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarDir, filename);
  await fs.rename(tempUpload, resultUpload);
  const image = await Jimp.read(resultUpload);
  await image.resize(250, 250).writeAsync(resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, {avatarURL});

  res.json({
    avatarURL,
  })
}

const ctrl = {
  getAddUser,
  getLogin,
  getCurrent,
  logout,
  updateAvatar,
};

module.exports = ctrl;
