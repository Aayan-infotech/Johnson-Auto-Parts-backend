import { Request, Response } from "express";
import { ContactModel } from "../../models/ContactUs";
import { sendMail } from "../../utills/mailer";

export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;
    await ContactModel.create({ name, email, message });
    res.status(201).json({ message: "Contact submitted successfully" });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ error: "Failed to submit contact" });
  }
};

export const getAllContacts = async (_req: Request, res: Response) => {
  try {
    const contacts = await ContactModel.find().sort({ createdAt: -1 });
    res
      .status(200)
      .json({ message: "all the queries fetched successfully", contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

export const getContactById = async (req: Request, res: Response) => {
  try {
    const contact = await ContactModel.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.status(200).json({message:"Contact fetched successfully",contact});
  } catch (error) {
    console.error("Error getting contact by ID:", error);
    res.status(500).json({ error: "Failed to get contact" });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const contact = await ContactModel.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: "Failed to delete contact" });
  }
};

export const replyToContact = async (req: Request, res: Response) => {
  try {
    const { reply } = req.body;
    const contact = await ContactModel.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: "Contact not found" });

    const subject = "Re: Your message to AutoParts Hub";
    const html = `
      <p>Hi ${contact.name},</p>
      <p>Thanks for reaching out to AutoParts Hub. Here's our response:</p>
      <blockquote>${reply}</blockquote>
      <p>If you have further questions, feel free to reply again!</p>
      <p>– AutoParts Hub Support Team</p>
    `;

    await sendMail({ to: contact.email, subject, html });

    contact.reply = reply;
    contact.isReplied = true;
    await contact.save();

    res.json({ message: "Reply sent successfully" });
  } catch (error) {
    console.error("Error replying to contact:", error);
    res.status(500).json({ error: "Failed to reply to contact" });
  }
};
