import express from 'express';
import {
  // createOrUpdateAddress,
  createAddress,
  getAddresses,
  getAddressById,
  deleteAddress,
  updateAddress,
  getAddressByTypes
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
router.get('/types', verifyAccessToken, getAddressByTypes);
// router.patch('/billing', updateBillingAddress); 
// router.patch('/shipping', updateShippingAddress);

export default router;