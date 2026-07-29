import express from 'express';
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} from '../controllers/clientController';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  createClientSchema,
  updateClientSchema,
} from '../validations/client.validation';

const router = express.Router();

// All client routes require authentication
router.use(protect);

router
  .route('/')
  .post(validate(createClientSchema), createClient)
  .get(getAllClients);

router
  .route('/:id')
  .get(getClientById)
  .patch(validate(updateClientSchema), updateClient)
  .delete(deleteClient);

export default router;
