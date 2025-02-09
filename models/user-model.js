import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    description: { type: String },
    profilePicture: String,
    organizations: [
      {
        organizationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
        },
        role: {
          type: String,
          enum: ["owner", "admin", "member"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export const User = mongoose.model("User", userSchema);
