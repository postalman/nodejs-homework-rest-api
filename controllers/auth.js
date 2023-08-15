const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User, schemas } = require("../models/user");

const { HttpErrors } = require("../helpers");

const SECRET_KEY = "$DjB!Ooy_3bmv[~";
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

    const newUser = await User.create({ ...req.body, password: hashPassword });

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
  
      res.json({
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
        }
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

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.token = "";
    await user.save();

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const ctrl = {
  getAddUser,
  getLogin,
  getCurrent,
  logout,
};

module.exports = ctrl;
