import Exam from "../models/Exam.js";
import Course from "../models/Course.js";
import StudentExamResult from "../models/StudentExamResult.js";
import {
  calculateQuestionAnalysis,
  calculateOutcomePerformance,
  calculateProgramOutcomePerformance,
  buildMudekReport,
} from "../utils/assessmentCalculator.js";

// GET /api/exams/:id/analysis
export const getExamAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ success: false, message: "Sınav bulunamadı" });
    }

    const course = await Course.findById(exam.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Ders bulunamadı" });
    }

    const studentResults = await StudentExamResult.find({ examId: id });
    
    console.log(`📊 Analysis request for exam ${id}: Found ${studentResults.length} student results`);

    const questionAnalysis = calculateQuestionAnalysis(studentResults, exam);
    const learningOutcomeAnalysis = calculateOutcomePerformance(
      questionAnalysis,
      exam,
      course
    );
    const programOutcomeAnalysis = calculateProgramOutcomePerformance(
      learningOutcomeAnalysis,
      course
    );

    const weakestLO = [...learningOutcomeAnalysis].sort((a, b) => a.success - b.success)[0];
    const recommendations = weakestLO
      ? `ÖÇ ${weakestLO.code} için başarı düşük (%${weakestLO.success}). İçerik, örnek ve soru dağılımı iyileştirilmeli.`
      : studentResults.length === 0
      ? "Henüz öğrenci sonucu yok. PDF yükleyip puanlama yaptıktan sonra analiz görünecektir."
      : "Veri bulunamadı.";

    console.log(`📊 Analysis calculated: ${questionAnalysis.length} questions, ${learningOutcomeAnalysis.length} LOs, ${programOutcomeAnalysis.length} POs`);

    return res.status(200).json({
      success: true,
      data: {
        questionAnalysis: questionAnalysis || [],
        learningOutcomeAnalysis: learningOutcomeAnalysis || [],
        programOutcomeAnalysis: programOutcomeAnalysis || [],
        summary: { recommendations },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Sınav analizi yapılamadı",
    });
  }
};

// GET /api/courses/:id/report
export const getCourseReport = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Ders bulunamadı" });
    }

    const exams = await Exam.find({ courseId: id }).sort({ createdAt: 1 });
    const examIds = exams.map((e) => e._id);
    const studentResults = await StudentExamResult.find({ examId: { $in: examIds } });

    // Tek birleştirilmiş rapor (tüm sınavlar üzerinden)
    const aggregatedExam = {
      questionCount: exams.reduce((sum, e) => sum + (e.questionCount || 0), 0),
      maxScorePerQuestion: exams.length
        ? exams.reduce((sum, e) => sum + (e.maxScorePerQuestion || 0), 0) / exams.length
        : 0,
    };

    const report = buildMudekReport(course, aggregatedExam, studentResults);

    return res.status(200).json({
      success: true,
      data: {
        exams: exams.map((e) => ({
          _id: e._id,
          examType: e.examType,
          examCode: e.examCode,
          questionCount: e.questionCount,
          maxScorePerQuestion: e.maxScorePerQuestion,
        })),
        report,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Ders raporu oluşturulamadı",
    });
  }
};


