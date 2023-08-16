const express = require("express");
const ctrl = require("../../controllers/auth");

const { authenticate } = require("../../middlewares");

const router = express.Router();

// signup
router.post("/users/register", ctrl.getAddUser);

// signin
router.post("/users/login", ctrl.getLogin);

router.get("/users/current", authenticate, ctrl.getCurrent);

router.post("/users/logout", authenticate, ctrl.logout);

module.exports = router;
