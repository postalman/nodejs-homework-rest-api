const express = require("express") ;
const ctrl = require("../../controllers/contacts") ;

const contactsRouter = express.Router();

contactsRouter.get("/", ctrl.getAll);

contactsRouter.get("/:contactId", ctrl.getById);

contactsRouter.post("/", ctrl.getAddContact);

contactsRouter.delete("/:contactId", ctrl.getDelete);

contactsRouter.put("/:contactId", ctrl.getPut);

contactsRouter.put("/:contactId/favorite", ctrl.updateStatusContact);

module.exports = contactsRouter;
