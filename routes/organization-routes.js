import { Router } from "express";
import { authMiddleware, checkRole } from "../middleware/auth-middleware.js";
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
  updateUserRole,
  manageMembers,
  getUserOrganizations,
} from "../controller/organization.controller.js";

const router = Router();

router.use(authMiddleware);

// Organization routes
router.post("/", createOrganization);
router.put("/:orgId", checkRole(["Owner", "Admin"]), updateOrganization);
router.delete("/:orgId", checkRole(["Owner"]), deleteOrganization);
router.get("/all", getUserOrganizations);

// Member management routes
router.put(
  "/:orgId/users/:userId/role",
  checkRole(["Owner", "Admin"]),
  updateUserRole
);
router.post(
  "/:orgId/users/:userId",
  checkRole(["Owner", "Admin"]),
  manageMembers
);

export const organizationRoutes = router;
