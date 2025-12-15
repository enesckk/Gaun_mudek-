import Department from "../models/Department.js";
import Program from "../models/Program.js";
import Course from "../models/Course.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get all departments with programs
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("programs", "code name nameEn")
      .sort({ name: 1 });
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

// Seed departments and programs (clears existing and recreates from JSON)
export const seedDepartments = async (req, res) => {
  try {
    // Read seed data
    const seedDataPath = join(__dirname, "../data/departments.json");
    const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));

    // Get all existing department IDs before deletion
    const existingDepartments = await Department.find({});
    const existingDepartmentIds = existingDepartments.map(dept => dept._id);

    // Delete all existing programs first (to avoid orphaned references)
    await Program.deleteMany({});

    // Update courses to remove department and program references
    if (existingDepartmentIds.length > 0) {
      await Course.updateMany(
        { department: { $in: existingDepartmentIds } },
        { $unset: { department: "", program: "" } }
      );
    }

    // Delete all existing departments
    await Department.deleteMany({});

    let totalDepartmentsAdded = 0;
    let totalProgramsAdded = 0;
    const results = [];

    // Process each department
    for (const deptData of seedData) {
      // Extract programs from department data
      const { programs, ...departmentFields } = deptData;

      // Create new department (we already deleted all, so this will always be new)
      const department = new Department(departmentFields);
      await department.save();
      totalDepartmentsAdded++;

      // Process programs for this department
      const programIds = [];
      if (programs && Array.isArray(programs)) {
        for (const programData of programs) {
          // Create new program
          const program = new Program({
            ...programData,
            department: department._id,
          });
          await program.save();
          totalProgramsAdded++;
          programIds.push(program._id);
        }
      }

      // Update department with program references
      if (programIds.length > 0) {
        department.programs = programIds;
        await department.save();
      }

      // Populate programs for response
      const departmentWithPrograms = await Department.findById(department._id)
        .populate("programs", "code name nameEn");
      results.push(departmentWithPrograms);
    }

    // Final populate all results
    const finalResults = await Department.find()
      .populate("programs", "code name nameEn")
      .sort({ name: 1 });

    return res.status(201).json({
      success: true,
      message: `${totalDepartmentsAdded} bölüm ve ${totalProgramsAdded} program başarıyla oluşturuldu. Tüm eski bölümler ve programlar silindi.`,
      data: finalResults,
    });
  } catch (error) {
    console.error("Error seeding departments:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Bölümler eklenirken bir hata oluştu.",
    });
  }
};

