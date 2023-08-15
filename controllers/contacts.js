const {Contact, schemas} = require("../models/contacts")
// const {Contact} = require("../models/contacts.js");
// const {HttpError} = require("../helpers/index.js");

const getAll = async (req, res, next) => {
  const {_id: owner} = req.user;
  const {page = 1, limit = 10} = req.query;
  const skip = (page - 1) * limit;
    const result = await Contact.find({owner}, "-createdAt -updatedAt", {skip, limit}).populate("owner", "name email");
    res.json(result);
  }

const getById = async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const result = await Contact.findById({contactId});
      if (!result) {
        res.status(404).json({ message: "Not found" });
        return;
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  const getAddContact = async (req, res, next) => {
    try {
      const { error } = schemas.contactAddSchema.validate(req.body);
      if (error) {
        res.status(400).json({ message: "missing required name field" });
        return;
      }
      const {_id: owner} = req.user;
      const result = await Contact.create(...req.body, owner);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  const getDelete = async (req, res, next) => {
    try {
      const {contactId} = req.params;
      const result = await Contact.findByIdAndDelete(contactId);
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
    
  }

  const getPut = async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const { error } = schemas.contactAddSchema.validate(req.body);
      if (error) {
        res.status(404).json({ message: "Not found" });
        return;
      }
      const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, {new: true});
      res.json(updatedContact);
    } catch (error) {
      next(error);
    }
  }

  const updateStatusContact = async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const { error } = schemas.contactUpdateSchema.validate(req.body);
      if (error) {
        res.status(400).json({ message: "missing field favorite" });
        return;
      }
      const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, {new: true});
      if(!updatedContact) {
        res.status(404).json({ message: " Not found "});
      }
      res.json(updatedContact);
    } catch (error) {
      next(error);
    }
  }

  const ctrl = {
    getAll, getById, getAddContact, getDelete, getPut, updateStatusContact
  }

  module.exports = ctrl;