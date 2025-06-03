import express from 'express';
import {
  // createOrUpdateAddress,
  createAddress,
  getAddresses,
  getAddressById,
  deleteAddress,
  updateAddress,
  getAddressesByType
  // updateBillingAddress,
  // updateShippingAddress
} from '../controllers/Address/AddressController';
const router = express.Router();

const  {verifyAccessToken} = require("../middleware/authMiddleware");

router.post('/', verifyAccessToken, createAddress);
router.get('/', verifyAccessToken, getAddresses);
router.get('/:id', getAddressById);
router.delete('/:id', verifyAccessToken, deleteAddress);
router.put('/:id', verifyAccessToken, updateAddress);
router.get('/type', verifyAccessToken, getAddressesByType);
// router.patch('/billing', updateBillingAddress); 
// router.patch('/shipping', updateShippingAddress);

export default router;