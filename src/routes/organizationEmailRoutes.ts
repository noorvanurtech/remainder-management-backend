import express from 'express';
import {
  getOrganizationEmails,
  addOrganizationEmail,
  updateOrganizationEmail,
  deleteOrganizationEmail,
} from '../controllers/organizationEmail.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getOrganizationEmails)
  .post(addOrganizationEmail);

router.route('/:id')
  .patch(updateOrganizationEmail)
  .delete(deleteOrganizationEmail);

export default router;
