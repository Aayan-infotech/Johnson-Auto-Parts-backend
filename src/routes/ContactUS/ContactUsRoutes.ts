import { Router } from 'express';
import {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
  replyToContact
} from '../../controllers/ContactUs/Contact';

const router = Router();

// Public Route — Submit a contact form
router.post('/create', createContact);

// Admin Routes
router.get('/', getAllContacts);
router.get('/:id', getContactById);
router.delete('/:id', deleteContact);
router.post('/reply/:id', replyToContact);

export default router;
