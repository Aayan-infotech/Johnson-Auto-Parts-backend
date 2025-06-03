import express from 'express';
import {
  createAddress,
  getAddresses,
  getAddressById,
  deleteAddress
} from '../controllers/Address/AddressController';
// import { authenticate } from '../middlewares/auth.middleware'; // Assuming you have authentication middleware

const router = express.Router();

const  {verifyAccessToken} = require("../middleware/authMiddleware");
// Protect all routes with authentication
// router.use(authenticate);

// Create a new address
router.post('/', verifyAccessToken, createAddress);

// Get all addresses for the authenticated user
router.get('/', verifyAccessToken, getAddresses);

// Get a specific address by ID
router.get('/:id', getAddressById);

// Delete an address
router.delete('/:id', verifyAccessToken, deleteAddress);

export default router;