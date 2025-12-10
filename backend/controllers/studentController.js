import Student from "../models/Student.js";
import Score from "../models/Score.js";

// Create a new Student
const createStudent = async (req, res) => {
  try {
    const { studentNumber, name, department, classLevel } = req.body;

    // Validate required fields
    if (!studentNumber || !name) {
      return res.status(400).json({
        success: false,
        message: "studentNumber and name are required",
      });
    }

    // Validate uniqueness of studentNumber
    const existingStudent = await Student.findOne({ studentNumber });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this student number already exists",
      });
    }

    const student = new Student({
      studentNumber,
      name,
      department,
      classLevel,
    });

    const savedStudent = await student.save();

    return res.status(201).json({
      success: true,
      data: savedStudent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all Students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ studentNumber: 1 });

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single Student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single Student by studentNumber
const getStudentByNumber = async (req, res) => {
  try {
    const { studentNumber } = req.params;

    const student = await Student.findOne({ studentNumber });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a Student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, classLevel } = req.body;

    // Check if Student exists
    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Do NOT allow studentNumber to change
    if (req.body.studentNumber) {
      return res.status(400).json({
        success: false,
        message: "Student number cannot be changed",
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (department !== undefined) updateData.department = department;
    if (classLevel !== undefined) updateData.classLevel = classLevel;

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedStudent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a Student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if Student exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if student has any Score entries
    const hasScores = await Score.exists({ studentId: id });
    if (hasScores) {
      return res.status(400).json({
        success: false,
        message: "Student cannot be deleted because score records exist.",
      });
    }

    // Delete the student
    const deletedStudent = await Student.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: deletedStudent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createStudent,
  getStudents,
  getStudentById,
  getStudentByNumber,
  updateStudent,
  deleteStudent,
};

