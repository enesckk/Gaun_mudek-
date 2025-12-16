import Program from "../models/Program.js";
import Department from "../models/Department.js";

// Get all programs
export const getPrograms = async (req, res) => {
  try {
    const { departmentId } = req.query;
    console.log("🔍 GET /api/programs - departmentId:", departmentId);
    
    const query = departmentId ? { department: departmentId } : {};
    console.log("📋 Query:", JSON.stringify(query));
    
    const programs = await Program.find(query)
      .populate("department", "name code")
      .sort({ name: 1 });
    
    console.log(`✅ Found ${programs.length} program(s)`);
    if (programs.length > 0) {
      console.log("📦 Programs:", programs.map(p => ({ id: p._id, name: p.name, code: p.code, dept: p.department })));
    }
    
    return res.status(200).json({
      success: true,
      data: programs,
    });
  } catch (error) {
    console.error("❌ Error fetching programs:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Programlar getirilirken bir hata oluştu.",
    });
  }
};

// Get a single program by ID
export const getProgramById = async (req, res) => {
  try {
    const { id } = req.params;
    const program = await Program.findById(id).populate("department", "name code");
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program bulunamadı.",
      });
    }
    
    return res.status(200).json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error("Error fetching program:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Program getirilirken bir hata oluştu.",
    });
  }
};

// Create a new program
export const createProgram = async (req, res) => {
  try {
    const { code, name, nameEn, departmentId, description } = req.body;

    if (!code || !name || !departmentId) {
      return res.status(400).json({
        success: false,
        message: "Program kodu, adı ve bölüm ID'si gereklidir.",
      });
    }

    // Validate department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Seçilen bölüm bulunamadı.",
      });
    }

    // Check if program with same code exists in this department
    const existingProgram = await Program.findOne({
      department: departmentId,
      code: code,
    });

    if (existingProgram) {
      return res.status(400).json({
        success: false,
        message: "Bu bölümde aynı kodlu bir program zaten mevcut.",
      });
    }

    const program = new Program({
      code,
      name,
      nameEn,
      department: departmentId,
      description,
    });

    await program.save();

    // Add program to department's programs array
    await Department.findByIdAndUpdate(departmentId, {
      $addToSet: { programs: program._id },
    });

    const populatedProgram = await Program.findById(program._id)
      .populate("department", "name code");

    return res.status(201).json({
      success: true,
      message: "Program başarıyla oluşturuldu.",
      data: populatedProgram,
    });
  } catch (error) {
    console.error("Error creating program:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Program oluşturulurken bir hata oluştu.",
    });
  }
};

// Update a program
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, nameEn, departmentId, description } = req.body;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program bulunamadı.",
      });
    }

    // If department is being changed, validate new department
    if (departmentId && departmentId.toString() !== program.department.toString()) {
      const newDepartment = await Department.findById(departmentId);
      if (!newDepartment) {
        return res.status(400).json({
          success: false,
          message: "Seçilen bölüm bulunamadı.",
        });
      }

      // Check if program with same code exists in new department
      const existingProgram = await Program.findOne({
        department: departmentId,
        code: code || program.code,
        _id: { $ne: id },
      });

      if (existingProgram) {
        return res.status(400).json({
          success: false,
          message: "Yeni bölümde aynı kodlu bir program zaten mevcut.",
        });
      }

      // Remove from old department
      await Department.findByIdAndUpdate(program.department, {
        $pull: { programs: program._id },
      });

      // Add to new department
      await Department.findByIdAndUpdate(departmentId, {
        $addToSet: { programs: program._id },
      });
    }

    // Update program
    const updateData = {};
    if (code !== undefined) updateData.code = code;
    if (name !== undefined) updateData.name = name;
    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (departmentId !== undefined) updateData.department = departmentId;
    if (description !== undefined) updateData.description = description;

    const updatedProgram = await Program.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("department", "name code");

    return res.status(200).json({
      success: true,
      message: "Program başarıyla güncellendi.",
      data: updatedProgram,
    });
  } catch (error) {
    console.error("Error updating program:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Program güncellenirken bir hata oluştu.",
    });
  }
};

// Delete a program
export const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program bulunamadı.",
      });
    }

    // Remove from department's programs array
    await Department.findByIdAndUpdate(program.department, {
      $pull: { programs: program._id },
    });

    await Program.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Program başarıyla silindi.",
    });
  } catch (error) {
    console.error("Error deleting program:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Program silinirken bir hata oluştu.",
    });
  }
};



