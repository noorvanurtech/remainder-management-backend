import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import clientService from '../services/clientService';
import { STATUS } from '../constants/messages';

export const createClient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const client = await clientService.createClient(userId, req.body);

    res.status(201).json({
      status: STATUS.SUCCESS,
      message: 'Client created successfully',
      data: client,
    });
  } catch (err) {
    res.status(500).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};

export const getAllClients = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const search = req.query.search as string | undefined;
    const clients = await clientService.getAllClients(userId, search);

    res.status(200).json({
      status: STATUS.SUCCESS,
      results: clients.length,
      data: clients,
    });
  } catch (err) {
    res.status(500).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};

export const getClientById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const clientId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const client = await clientService.getClientById(userId, clientId);

    res.status(200).json({
      status: STATUS.SUCCESS,
      data: client,
    });
  } catch (err) {
    res.status(404).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};

export const updateClient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const clientId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const client = await clientService.updateClient(userId, clientId, req.body);

    res.status(200).json({
      status: STATUS.SUCCESS,
      message: 'Client updated successfully',
      data: client,
    });
  } catch (err) {
    res.status(400).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const clientId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await clientService.deleteClient(userId, clientId);

    res.status(200).json({
      status: STATUS.SUCCESS,
      message: 'Client deleted successfully',
    });
  } catch (err) {
    res.status(404).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};
