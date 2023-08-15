const express = require("express") ;
const ctrl = require("../../controllers/contacts") ;

const { authenticate } = require("../../middlewares");

const contactsRouter = express.Router();

contactsRouter.get("/", authenticate, ctrl.getAll);

contactsRouter.get("/:contactId", authenticate, ctrl.getById);

contactsRouter.post("/", authenticate, ctrl.getAddContact);

contactsRouter.delete("/:contactId", authenticate, ctrl.getDelete);

contactsRouter.put("/:contactId", authenticate,  ctrl.getPut);

contactsRouter.put("/:contactId/favorite", authenticate, ctrl.updateStatusContact);

module.exports = contactsRouter;
