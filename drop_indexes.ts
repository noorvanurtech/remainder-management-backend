import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();
import Product from "./src/models/product.model";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("No MONGODB_URI found in env");
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");
    await Product.collection.dropIndex("workshopId_1_sku_1").catch(() => console.log("Index workshopId_1_sku_1 not found"));
    await Product.collection.dropIndex("workshopId_1_slug_1").catch(() => console.log("Index workshopId_1_slug_1 not found"));
    console.log("Dropped indexes, recreating...");
    await Product.syncIndexes();
    console.log("Indexes recreated successfully");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
