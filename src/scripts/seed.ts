import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model";
import Reminder from "../models/reminder.model";
import Client from "../models/client.model";
import Category from "../models/category.model";
import OrganizationEmail from "../models/organizationEmail.model";
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

    // Clear existing clients, categories, reminders, organization emails for this user
    console.log("Clearing existing data for user...");
    await Reminder.deleteMany({ user: userId });
    await Client.deleteMany({ user: userId });
    await Category.deleteMany({ user: userId });
    await OrganizationEmail.deleteMany({ user: userId });

    // Seed Organization Employee Emails
    console.log("Seeding organization employee emails...");
    await OrganizationEmail.create({
      user: userId,
      email: email,
      name: "Main Organization Admin",
      active: true,
    });
    await OrganizationEmail.create({
      user: userId,
      email: "dansu498@gmail.com",
      name: "Notification Employee Recipient",
      active: true,
    });
    await OrganizationEmail.create({
      user: userId,
      email: "noorfatmanoor411@gmail.com",
      name: "Notification Employee Recipient",
      active: true,
    });

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

    // Seed Specific Daily Reminders for Today (1:50 AM, 6 AM, 7 AM, 8 AM, 9 AM, 11 AM, 1 PM)
    console.log("Seeding Today's Daily Reminders (1:50 AM, 6:00 AM, 7:00 AM, 8:00 AM, 9:00 AM, 11:00 AM, 1:00 PM)...");
    const now = new Date();

    const specificReminders = [
      { title: "Nightly Security Audit (Completing at 1:50 AM Today)", hour: 1, minute: 50, desc: "Daily task due at 1:50 AM today." },
      { title: "Early Morning Server Inspection (Completing at 6:00 AM Today)", hour: 6, minute: 0, desc: "Daily task due at 6:00 AM today." },
      { title: "Morning Log Sync & Clean (Completing at 7:00 AM Today)", hour: 7, minute: 0, desc: "Daily task due at 7:00 AM today." },
      { title: "Morning Operations Review (Completing at 8:00 AM Today)", hour: 8, minute: 0, desc: "Daily task due at 8:00 AM today." },
      { title: "Morning Scaling Check (Completing at 9:00 AM Today)", hour: 9, minute: 0, desc: "Daily task due at 9:00 AM today (1hr trigger from 8 AM)." },
      { title: "Mid-Day GST Processing (Completing at 11:00 AM Today)", hour: 11, minute: 0, desc: "Daily task due at 11:00 AM today (3hr trigger from 8 AM)." },
      { title: "Afternoon Disaster Recovery Test (Completing at 1:00 PM Today)", hour: 13, minute: 0, desc: "Daily task due at 1:00 PM today (5hr trigger from 8 AM)." },
    ];

    for (let i = 0; i < specificReminders.length; i++) {
      const item = specificReminders[i];
      const reminderDueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), item.hour, item.minute, 0);

      await Reminder.create({
        user: userId,
        title: item.title,
        description: item.desc,
        client: clientNames[i % clientNames.length],
        category: categoryNames[i % categoryNames.length],
        cycle: "cycle 1",
        status: "Pending",
        dueDate: reminderDueDate,
        startDate: reminderDueDate,
        schedule: "Daily",
        repeat: true,
        notifyEmail: true,
        notifyDashboard: true,
      });
    }

    // Seed 3 Monthly Reminders Completed on 29 July 2026
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

    // Seed 10 Future Monthly Reminders
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
      futureDate.setMonth(futureDate.getMonth() + (i + 1));
      futureDate.setDate(15);

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
    console.log("Seeded Daily Reminders Due Today:");
    console.log("- 1:50 AM Today");
    console.log("- 6:00 AM Today");
    console.log("- 7:00 AM Today");
    console.log("- 8:00 AM Today");
    console.log("- 9:00 AM Today");
    console.log("- 11:00 AM Today");
    console.log("- 1:00 PM Today");
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
