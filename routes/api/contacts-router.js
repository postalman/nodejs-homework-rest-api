import express from "express";
import contactsService from "../../models/contacts.js";
import Joi from "joi";


const contactsRouter = express.Router();

const contactAddSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
});

contactsRouter.get("/", async (req, res, next) => {
  const result = await contactsService.listContacts();
  res.json(result);
});

contactsRouter.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contactsService.getContactById(contactId);
    if (!result) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

contactsRouter.post("/", async (req, res, next) => {
  try {
    const { error } = contactAddSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: "missing required name field" });
      return;
    }
    const result = await contactsService.addContact(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

contactsRouter.delete("/:contactId", async (req, res, next) => {
  try {
    const {contactId} = req.params;
    const result = await contactsService.removeContact(contactId);
    if (!result) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json({
      message: "contact deleted"
    })
  }
  catch(error) {
    next(error);
  }
  
});

contactsRouter.put("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { error } = contactAddSchema.validate(req.body);
    if (error) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    const updatedContact = await contactsService.updateContact(contactId, req.body);
    res.json(updatedContact);
  } catch (error) {
    next(error);
  }
});

export default contactsRouter;
