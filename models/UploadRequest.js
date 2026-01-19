import mongoose from "mongoose";

const uploadRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    subjectName: {
      type: String,
      required: true
    },

    year: Number,

    fileUrl: {
      type: String,
      required: true
    },

    uploadedByUser: {
      type: String   // later userId / email
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("UploadRequest", uploadRequestSchema);
