import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    programOutcomes: [
      {
        code: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Department", DepartmentSchema);

