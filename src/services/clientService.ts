import Client, { IClient } from '../models/client.model';
import Reminder from '../models/reminder.model';

class ClientService {
  /**
   * Create a new client
   */
  async createClient(userId: string, data: any): Promise<IClient> {
    const existing = await Client.findOne({ user: userId, name: data.name.trim() });
    if (existing) {
      return existing;
    }
    const client = await Client.create({ ...data, user: userId });
    return client;
  }

  /**
   * Get all clients for a user with open reminders count
   */
  async getAllClients(userId: string, search?: string): Promise<any[]> {
    const query: any = { user: userId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const clients = await Client.find(query).sort({ createdAt: -1 });

    // Calculate openReminders for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const clientObj = client.toObject();
        // Count reminders for this client that are not completed/cancelled
        const openReminders = await Reminder.countDocuments({
          user: userId,
          client: client.name,
          status: { $in: ['Pending', 'Overdue'] },
        });
        return {
          ...clientObj,
          openReminders,
        };
      })
    );

    return clientsWithStats;
  }

  /**
   * Get client by ID
   */
  async getClientById(userId: string, clientId: string): Promise<any> {
    const client = await Client.findOne({ _id: clientId, user: userId });
    if (!client) {
      throw new Error('Client not found');
    }
    const openReminders = await Reminder.countDocuments({
      user: userId,
      client: client.name,
      status: { $in: ['Pending', 'Overdue'] },
    });

    return {
      ...client.toObject(),
      openReminders,
    };
  }

  /**
   * Update client
   */
  async updateClient(userId: string, clientId: string, data: any): Promise<IClient> {
    const client = await Client.findOneAndUpdate(
      { _id: clientId, user: userId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!client) {
      throw new Error('Client not found or unauthorized');
    }
    return client;
  }

  /**
   * Delete client
   */
  async deleteClient(userId: string, clientId: string): Promise<boolean> {
    const result = await Client.deleteOne({ _id: clientId, user: userId });
    if (result.deletedCount === 0) {
      throw new Error('Client not found or unauthorized');
    }
    return true;
  }
}

export default new ClientService();
