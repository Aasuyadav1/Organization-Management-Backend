import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    logo: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["Owner", "Admin", "Member"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Organization = mongoose.model("Organization", organizationSchema);
