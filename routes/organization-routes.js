import { Router } from "express";
import { authMiddleware, checkRole } from "../middleware/auth-middleware.js";
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
  updateUserRole,
  manageMembers,
  getUserOrganizations,
  getOrganizationMembers,
  getOrganizationById
} from "../controller/organization.controller.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Organization CRUD routes
router.post("/", createOrganization);
router.get("/all", getUserOrganizations);
router.put("/:orgId", checkRole(["owner"]), updateOrganization);
router.delete("/:orgId", checkRole(["owner"]), deleteOrganization);
router.get("/:orgId", getOrganizationById);

// Member management routes
router.put(
  "/:orgId/users/:userId/role",
  checkRole(["owner", "admin"]),
  updateUserRole
);

router.post(
  "/:orgId/users/:userId",
  checkRole(["owner", "admin"]),
  manageMembers
);

router.get("/:organizationId/members", getOrganizationMembers);

export const organizationRoutes = router;
