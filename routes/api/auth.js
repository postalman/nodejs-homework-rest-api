const express = require("express");
const ctrl = require("../../controllers/auth");

const { authenticate } = require("../../middlewares");
const upload = require("../../middlewares/upload");

const router = express.Router();

// signup
router.post("/users/register", ctrl.getAddUser);

router.get("/verify/:verificationToken", ctrl.verifyEmail);

router.get("/verify", ctrl.resendVerifyEmail);

// signin
router.post("/users/login", ctrl.getLogin);

router.get("/users/current", authenticate, ctrl.getCurrent);

router.post("/users/logout", authenticate, ctrl.logout);

router.patch("/users/avatars", authenticate, upload.single("avatar"), ctrl.updateAvatar);



module.exports = router;
