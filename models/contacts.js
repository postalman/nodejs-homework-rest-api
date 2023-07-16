import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contactsPath = path.join(__dirname, 'db', 'contacts.json');

async function listContacts() {
  const data = await fs.readFile(contactsPath, "utf-8");
  return JSON.parse(data);
}

async function getContactById(contactId) {
  const contact = await listContacts();
  const result = contact.find((item) => item.contactId === contactId);
  return result || null;
}

async function removeContact(contactId) {
  const contacts = await listContacts();
  const index = contacts.findIndex((item) => item.contactId === contactId);
  if (index === -1) {
    return null;
  }
  const [result] = contacts.splice(index, 1);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return result;
}

async function addContact(name, email, phone) {
  const contact = await listContacts();
  const newContact = {
    id: nanoid(),
    name,
    email,
    phone,
  };
  contact.push(newContact);
  await fs.writeFile(contactsPath, JSON.stringify(contact, null, 2));
  return newContact;
}

async function updateContact(contactId, body) {
  const contacts = await listContacts();
  const index = contacts.findIndex((item) => item.id === contactId);
  if (index === -1) {
    return null;
  }
  const updatedContact = { ...contacts[index], ...body };
  contacts[index] = updatedContact;
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return updatedContact;
}

export { listContacts, getContactById, removeContact, addContact, updateContact };
