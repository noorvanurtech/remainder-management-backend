import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model";
import { ROLES, STATUS } from "../constants";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

const seed = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to database.");

    // Clear existing users
    console.log("Clearing existing users...");
    await User.deleteMany({});
    console.log("Cleared existing users.");

    // Create Super Admin
    console.log("Seeding Super Admin...");
    await User.create({
      name: "Super Admin",
      email: "admin@glassforce.com",
      phone: "1234567890",
      password: "password123",
      role: ROLES.SUPER_ADMIN,
      status: STATUS.ACTIVE,
    });

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
