import Department from "../models/Department.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    return res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Bölümler getirilirken bir hata oluştu.",
    });
  }
};

// Seed departments (one-time use)
export const seedDepartments = async (req, res) => {
  try {
    // Check if departments already exist
    const existingCount = await Department.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Bölümler zaten eklenmiş. Seed işlemi sadece boş veritabanı için kullanılabilir.",
      });
    }

    // Read seed data
    const seedDataPath = join(__dirname, "../data/departments.json");
    const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));

    // Insert departments
    const departments = await Department.insertMany(seedData);

    return res.status(201).json({
      success: true,
      message: `${departments.length} bölüm başarıyla eklendi.`,
      data: departments,
    });
  } catch (error) {
    console.error("Error seeding departments:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Bölümler eklenirken bir hata oluştu.",
    });
  }
};

