import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import OrganizationEmail from '../models/organizationEmail.model';

/**
 * Get all organization employee notification emails for logged in user
 */
export const getOrganizationEmails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const emails = await OrganizationEmail.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: emails.length,
      data: emails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new organization employee notification email
 */
export const addOrganizationEmail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { email, name, active = true } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, message: 'Valid email is required' });
      return;
    }

    const existing = await OrganizationEmail.findOne({ user: userId, email: email.trim().toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'This email is already registered in your organization list' });
      return;
    }

    const organizationEmail = await OrganizationEmail.create({
      user: userId,
      email: email.trim().toLowerCase(),
      name: name ? name.trim() : '',
      active,
    });

    res.status(201).json({
      success: true,
      data: organizationEmail,
      message: 'Employee notification email added successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an organization employee notification email
 */
export const updateOrganizationEmail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { email, name, active } = req.body;

    const updateData: any = {};
    if (email) updateData.email = email.trim().toLowerCase();
    if (name !== undefined) updateData.name = name.trim();
    if (active !== undefined) updateData.active = active;

    const organizationEmail = await OrganizationEmail.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!organizationEmail) {
      res.status(404).json({ success: false, message: 'Organization email entry not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: organizationEmail,
      message: 'Employee notification email updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an organization employee notification email
 */
export const deleteOrganizationEmail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const result = await OrganizationEmail.deleteOne({ _id: id, user: userId });

    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: 'Organization email entry not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Employee notification email removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
