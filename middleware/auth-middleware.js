import jwt from "jsonwebtoken";
import { User } from "../models/user-model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const checkRole = (roles) => {
  return async (req, res, next) => {
    const orgId = req.params.orgId;
    const userOrg = req.user.organizations.find(
      (org) => org.organizationId.toString() === orgId
    );

    if (!userOrg || !roles.includes(userOrg.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

export { authMiddleware, checkRole };
