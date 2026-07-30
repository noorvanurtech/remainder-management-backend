import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model";
import Reminder from "../models/reminder.model";
import Client from "../models/client.model";
import Category from "../models/category.model";
import { ROLES, STATUS } from "../constants";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

const seed = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to database.");

    // Create or find test admin user
    const email = "admin@gmail.com";
    const password = "password@123";

    console.log(`Setting up user ${email}...`);
    let user = await User.findOne({ email });
    if (user) {
      user.password = password;
      user.status = STATUS.ACTIVE;
      user.role = ROLES.SUPER_ADMIN;
      await user.save();
      console.log(`Updated user ${email}.`);
    } else {
      user = await User.create({
        name: "Admin User",
        email: email,
        phone: "9876543210",
        password: password,
        role: ROLES.SUPER_ADMIN,
        status: STATUS.ACTIVE,
      });
      console.log(`Created user ${email}.`);
    }

    const userId = user._id;

    // Clear existing clients, categories, reminders for this user
    console.log("Clearing existing data for user...");
    await Reminder.deleteMany({ user: userId });
    await Client.deleteMany({ user: userId });
    await Category.deleteMany({ user: userId });

    // Seed Clients
    console.log("Seeding clients...");
    const clientNames = ["Acme Corp", "TechNova Systems", "Starlight Media", "Vanguard Logistics", "Apex Global"];
    for (const name of clientNames) {
      await Client.create({ user: userId, name });
    }

    // Seed Categories
    console.log("Seeding categories...");
    const categoryNames = ["Hosting & Domain", "Tax Compliance", "Software Maintenance", "Server Backup", "Retainer Fee"];
    for (const name of categoryNames) {
      await Category.create({ user: userId, name });
    }

    // 1. Seed 7 Past Daily Reminders (Overdue/Pending testing)
    console.log("Seeding 7 daily past reminders...");
    const dailyTitles = [
      "Daily Database Backup Inspection",
      "Daily Cloud Server Health Audit",
      "Daily Security Vulnerability Scan",
      "Daily Error Log Review",
      "Daily SSL Certificate Status Check",
      "Daily Payment Gateway Sync",
      "Daily API Performance Monitoring",
    ];

    for (let i = 0; i < dailyTitles.length; i++) {
      const pastDays = 7 - i; // 7 days ago, 6 days ago, ..., 1 day ago
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - pastDays);

      await Reminder.create({
        user: userId,
        title: dailyTitles[i],
        description: `Automated daily check scheduled ${pastDays} days ago.`,
        client: clientNames[i % clientNames.length],
        category: categoryNames[i % categoryNames.length],
        cycle: `cycle ${i + 1}`,
        status: "Overdue",
        dueDate: dueDate,
        startDate: dueDate,
        schedule: "Daily",
        repeat: true,
        notifyEmail: true,
        notifyDashboard: true,
      });
    }

    // 2. Seed 3 Monthly Reminders Completed on 29 July 2026
    console.log("Seeding 3 monthly reminders completed on 29 July...");
    const completedJulyTitles = [
      "Monthly GST Return Filing & Payment",
      "Monthly AWS Infrastructure Billing",
      "Monthly Client Maintenance Retainer Invoice",
    ];

    for (let i = 0; i < completedJulyTitles.length; i++) {
      const completedDate = new Date("2026-07-29T12:00:00.000Z");

      // Completed cycle 1
      await Reminder.create({
        user: userId,
        title: completedJulyTitles[i],
        description: "Monthly task completed on July 29, 2026.",
        client: clientNames[i % clientNames.length],
        category: categoryNames[i % categoryNames.length],
        cycle: "cycle 1",
        status: "Completed",
        dueDate: completedDate,
        startDate: completedDate,
        schedule: "Monthly",
        repeat: true,
        notifyEmail: true,
        notifyDashboard: false,
      });

      // Next cycle (cycle 2) due 29 August 2026
      const nextDueDate = new Date("2026-08-29T12:00:00.000Z");
      await Reminder.create({
        user: userId,
        title: completedJulyTitles[i],
        description: "Upcoming monthly task generated from completed cycle 1.",
        client: clientNames[i % clientNames.length],
        category: categoryNames[i % categoryNames.length],
        cycle: "cycle 2",
        status: "Pending",
        dueDate: nextDueDate,
        startDate: nextDueDate,
        schedule: "Monthly",
        repeat: true,
        notifyEmail: true,
        notifyDashboard: false,
      });
    }

    // 3. Seed 10 Future Monthly Reminders
    console.log("Seeding 10 future monthly reminders...");
    const futureTitles = [
      "Annual Domain Name Renewal - acme-site.com",
      "Quarterly Tax Audit Preparation",
      "Monthly Server Scaling & Load Balancer Check",
      "Monthly Database Index Optimization",
      "Monthly Content Delivery Network (CDN) Billing",
      "Monthly Software License Audit",
      "Monthly Enterprise Security Compliance Check",
      "Monthly Client Support Service Level Audit",
      "Monthly Payment Gateway Reconciliation",
      "Monthly Automated Cloud Disaster Recovery Test",
    ];

    for (let i = 0; i < futureTitles.length; i++) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + (i + 1)); // 1 month in future, 2 months in future, etc.
      futureDate.setDate(15); // 15th of each upcoming month

      await Reminder.create({
        user: userId,
        title: futureTitles[i],
        description: `Scheduled future monthly task for cycle testing.`,
        client: clientNames[i % clientNames.length],
        category: categoryNames[i % categoryNames.length],
        cycle: "cycle 1",
        status: "Pending",
        dueDate: futureDate,
        startDate: futureDate,
        schedule: "Monthly",
        repeat: true,
        notifyEmail: true,
        notifyDashboard: i % 2 === 0,
      });
    }

    console.log("\n==========================================");
    console.log("Seeding finished successfully!");
    console.log(`User Email: ${email}`);
    console.log(`User Password: ${password}`);
    console.log("Seeded:");
    console.log("- 7 Past Overdue Daily Reminders");
    console.log("- 3 Completed Monthly Reminders (Completed on 29 July 2026 + 3 next cycle Pending reminders)");
    console.log("- 10 Future Monthly Reminders");
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
