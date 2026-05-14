/**
 * Database Index Creation Script
 * Run this once to create indexes for optimal query performance
 */

const Complaint = require("../models/complaintsModel");
const Asset = require("../models/assetsModels");
const Department = require("../models/departmentModel");

const createIndexes = async () => {
  try {
    console.log("🔧 Creating database indexes...");

    // ⚡ Complaint Collection Indexes
    await Complaint.collection.createIndex({ userId: 1, createdAt: -1 });
    console.log("✓ Index created: Complaint(userId, createdAt)");

    await Complaint.collection.createIndex({ department_id: 1, status: 1 });
    console.log("✓ Index created: Complaint(department_id, status)");

    await Complaint.collection.createIndex({ status: 1, createdAt: -1 });
    console.log("✓ Index created: Complaint(status, createdAt)");

    await Complaint.collection.createIndex({ issue: 1 });
    console.log("✓ Index created: Complaint(issue)");

    await Complaint.collection.createIndex({ 
      issue: "text", 
      description: "text", 
      location: "text",
      city: "text" 
    });
    console.log("✓ Index created: Complaint(text search fields)");

    await Complaint.collection.createIndex({ assignedTo: 1, status: 1 });
    console.log("✓ Index created: Complaint(assignedTo, status)");

    await Complaint.collection.createIndex({ slaDeadline: 1, slaStatus: 1 });
    console.log("✓ Index created: Complaint(slaDeadline, slaStatus)");

    // ⚡ Asset Collection Indexes
    await Asset.collection.createIndex({ category: 1 });
    console.log("✓ Index created: Asset(category)");

    await Asset.collection.createIndex({ department_id: 1 });
    console.log("✓ Index created: Asset(department_id)");

    // ⚡ Department Collection Indexes
    await Department.collection.createIndex({ name: 1 }, { unique: true });
    console.log("✓ Index created: Department(name - unique)");

    console.log("\n✅ All indexes created successfully!");
    console.log("Queries should now be significantly faster.\n");

  } catch (error) {
    console.error("❌ Error creating indexes:", error);
  }
};

module.exports = createIndexes;
