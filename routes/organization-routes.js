import { Router } from "express";
import { authMiddleware, checkRole } from "../middleware/auth-middleware.js";
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
  updateUserRole,
  manageMembers,
  getUserOrganizations,
  getOrganizationMembers
} from "../controller/organization.controller.js";

const router = Router();

router.use(authMiddleware);

// Organization routes
router.post("/", createOrganization);
router.put("/:orgId", checkRole(["owner", "admin"]), updateOrganization);
router.delete("/:orgId", checkRole(["owner"]), deleteOrganization);
router.get("/all", getUserOrganizations);

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

// Get organization members route
router.get('/:organizationId/members', getOrganizationMembers);

export const organizationRoutes = router;
