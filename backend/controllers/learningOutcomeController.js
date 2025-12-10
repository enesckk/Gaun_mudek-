import LearningOutcome from "../models/LearningOutcome.js";
import Course from "../models/Course.js";
import Question from "../models/Question.js";

// Create a new Learning Outcome
const createLearningOutcome = async (req, res) => {
  try {
    const { courseId, code, description, mappedProgramOutcomes } = req.body;

    // Validate required fields
    if (!courseId || !code || !description) {
      return res.status(400).json({
        success: false,
        message: "courseId, code, and description are required",
      });
    }

    // Validate that the referenced course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Create the learning outcome
    const learningOutcome = new LearningOutcome({
      courseId,
      code,
      description,
      mappedProgramOutcomes: mappedProgramOutcomes || [],
    });

    const savedOutcome = await learningOutcome.save();

    // Add the learning outcome to the course's learningOutcomes array
    course.learningOutcomes.push(savedOutcome._id);
    await course.save();

    // Populate mappedProgramOutcomes before returning
    const populatedOutcome = await LearningOutcome.findById(
      savedOutcome._id
    ).populate("mappedProgramOutcomes");

    return res.status(201).json({
      success: true,
      data: populatedOutcome,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all Learning Outcomes for a specific course
const getLearningOutcomesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate that the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const learningOutcomes = await LearningOutcome.find({ courseId })
      .populate("mappedProgramOutcomes")
      .sort({ code: 1 });

    return res.status(200).json({
      success: true,
      data: learningOutcomes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single Learning Outcome by ID
const getLearningOutcomeById = async (req, res) => {
  try {
    const { id } = req.params;

    const learningOutcome = await LearningOutcome.findById(id).populate(
      "mappedProgramOutcomes"
    );

    if (!learningOutcome) {
      return res.status(404).json({
        success: false,
        message: "Learning Outcome not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: learningOutcome,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a Learning Outcome
const updateLearningOutcome = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description, mappedProgramOutcomes } = req.body;

    // Check if Learning Outcome exists
    const existingOutcome = await LearningOutcome.findById(id);
    if (!existingOutcome) {
      return res.status(404).json({
        success: false,
        message: "Learning Outcome not found",
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (mappedProgramOutcomes !== undefined)
      updateData.mappedProgramOutcomes = mappedProgramOutcomes;

    const updatedOutcome = await LearningOutcome.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("mappedProgramOutcomes");

    return res.status(200).json({
      success: true,
      data: updatedOutcome,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a Learning Outcome
const deleteLearningOutcome = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if Learning Outcome exists
    const learningOutcome = await LearningOutcome.findById(id);
    if (!learningOutcome) {
      return res.status(404).json({
        success: false,
        message: "Learning Outcome not found",
      });
    }

    // Check if the ÖÇ is used in any Question document
    const isUsedInQuestion = await Question.exists({
      mappedLearningOutcome: id,
    });

    if (isUsedInQuestion) {
      return res.status(400).json({
        success: false,
        message:
          "This Learning Outcome is used in exam questions and cannot be deleted.",
      });
    }

    // Remove from course's learningOutcomes array
    const course = await Course.findById(learningOutcome.courseId);
    if (course) {
      course.learningOutcomes = course.learningOutcomes.filter(
        (loId) => loId.toString() !== id
      );
      await course.save();
    }

    // Delete the learning outcome
    const deletedOutcome = await LearningOutcome.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Learning Outcome deleted successfully",
      data: deletedOutcome,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createLearningOutcome,
  getLearningOutcomesByCourse,
  getLearningOutcomeById,
  updateLearningOutcome,
  deleteLearningOutcome,
};

