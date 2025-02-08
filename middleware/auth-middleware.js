import jwt from "jsonwebtoken";
import { User } from "../models/user-model.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized",
      error: error.message
    });
  }
};

const checkRole = (roles) => {
  return async (req, res, next) => {
    const orgId = req.params.orgId;
    const userOrg = req.user.organizations.find(
      (org) => org.organizationId.toString() === orgId
    );

    if (!userOrg || !roles.map(r => r.toLowerCase()).includes(userOrg.role.toLowerCase())) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

export { authMiddleware, checkRole };
