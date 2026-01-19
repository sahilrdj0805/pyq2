import mongoose from "mongoose";

const pyqSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    year: Number,

    fileUrl: {
      type: String,
      required: true
    },

    uploadedBy: {
      type: String,
      enum: ["admin", "user"],
      default: "admin"
    },

    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved"
    }
  },
  { timestamps: true }
);

export default mongoose.model("PYQ", pyqSchema);
